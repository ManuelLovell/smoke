import OBR, { Curve, Item, Light, Math2, Vector2, Wall } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import * as Utilities from "./utilities/bsUtilities";
import { BSCACHE } from "./utilities/bsSceneCache";

export class VisibilityChecker {
    private cachedWallSegments: Array<{
        start: Vector2;
        end: Vector2;
    }> = [];

    constructor() {
    }

    // Fast vector distance check without sqrt for early rejection
    private distanceSquared(p1: Vector2, p2: Vector2): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return dx * dx + dy * dy;
    }

    // Rotate point around origin - only called during wall segment preprocessing
    private rotatePoint(point: Vector2, origin: Vector2, angleDegrees: number): Vector2 {
        const angleRadians = (angleDegrees * Math.PI) / 180;
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);

        const translatedX = point.x - origin.x;
        const translatedY = point.y - origin.y;

        return {
            x: origin.x + (translatedX * cos - translatedY * sin),
            y: origin.y + (translatedX * sin + translatedY * cos)
        };
    }

    // Preprocess and cache wall segments
    public async UpdateWallSegments(): Promise<void> {
        const walls = await OBR.scene.local.getItems<Wall>(x => x.metadata[`${Constants.EXTENSIONID}/isVisionWall`] === true);
        this.cachedWallSegments = [];

        for (const wall of walls) {
            if (wall.metadata[`${Constants.EXTENSIONID}/isWindow`] === true) {
                // Skip windows as they don't block vision
                continue;
            }

            const rotatedPoints = new Array(wall.points.length);

            // Pre-calculate all rotated points for this wall
            for (let i = 0; i < wall.points.length; i++) {
                const point = wall.points[i];
                rotatedPoints[i] = this.rotatePoint(
                    {
                        x: point.x + wall.position.x,
                        y: point.y + wall.position.y
                    },
                    wall.position,
                    wall.rotation
                );
            }

            // Create segments from the rotated points
            for (let i = 0; i < rotatedPoints.length - 1; i++) {
                this.cachedWallSegments.push({
                    start: rotatedPoints[i],
                    end: rotatedPoints[i + 1]
                });
            }
        }
    }

    // Optimized line intersection check
    private lineIntersects(
        line1Start: Vector2,
        line1End: Vector2,
        line2Start: Vector2,
        line2End: Vector2
    ): boolean {
        function orientation(p: Vector2, q: Vector2, r: Vector2): number {
            const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            if (val === 0) return 0;
            return val > 0 ? 1 : 2;
        }

        // Helper function to check if point q lies on line segment pr
        function onSegment(p: Vector2, q: Vector2, r: Vector2): boolean {
            return (
                q.x <= Math.max(p.x, r.x) &&
                q.x >= Math.min(p.x, r.x) &&
                q.y <= Math.max(p.y, r.y) &&
                q.y >= Math.min(p.y, r.y)
            );
        }

        // Find orientations
        const o1 = orientation(line1Start, line1End, line2Start);
        const o2 = orientation(line1Start, line1End, line2End);
        const o3 = orientation(line2Start, line2End, line1Start);
        const o4 = orientation(line2Start, line2End, line1End);

        // General case: if line segments intersect
        if (o1 !== o2 && o3 !== o4) {
            return true;
        }

        // Special cases: check if the points are collinear and lie on the segments
        if (o1 === 0 && onSegment(line1Start, line2Start, line1End)) return true;
        if (o2 === 0 && onSegment(line1Start, line2End, line1End)) return true;
        if (o3 === 0 && onSegment(line2Start, line1Start, line2End)) return true;
        if (o4 === 0 && onSegment(line2Start, line1End, line2End)) return true;

        // Otherwise, the line segments don't intersect
        return false;
    }

    private isLineOfSightBlocked(player: Item, enemy: Item): boolean {
        const enemyDepth = this.GetDepth(this.GetMappedDepth(enemy.position), false);
        const playerDepth = player.zIndex;

        // If enemy is at a higher depth than player, player can see enemy
        // This will likely need to be adjusted if there are walls between these two points that
        // Would somehow impede vision.. As if the player was at a 1, the enemy was at a 2, but there was a wall at a 3 between them.
        // Technically the wall would separate them both.
        if (enemyDepth > playerDepth) {
            // Player can see enemy without obstruction
            return false;
        }

        // Check if line of sight is blocked by any wall segment
        return this.IsLineOfSightBlocked(player.position, enemy.position);
    }

    // Check if line of sight is blocked by any wall segment
    public IsLineOfSightBlocked(player: Vector2, target: Vector2, line?: Curve): boolean {
        // Early exit for performance - check if any segment could possibly intersect
        const minX = Math.min(player.x, target.x);
        const maxX = Math.max(player.x, target.x);
        const minY = Math.min(player.y, target.y);
        const maxY = Math.max(player.y, target.y);

        for (const segment of this.cachedWallSegments) {
            if (line && line.points.length > 1) {
                const lineStart = { x: line.points[0].x + line.position.x, y: line.points[0].y + line.position.y };
                const lineEnd = { x: line.points[1].x + line.position.x, y: line.points[1].y + line.position.y };
                const isSamePoint = (a: Vector2, b: Vector2) => a.x === b.x && a.y === b.y;
                if ((isSamePoint(segment.start, lineStart) && isSamePoint(segment.end, lineEnd))
                    || (isSamePoint(segment.start, lineEnd) && isSamePoint(segment.end, lineStart))) {
                    // If the segment matches the line, its our target that we want to see
                    // and not the wall blocking our vision
                    continue;
                }
            }
            // Quick AABB check before detailed intersection
            if (Math.max(segment.start.x, segment.end.x) < minX ||
                Math.min(segment.start.x, segment.end.x) > maxX ||
                Math.max(segment.start.y, segment.end.y) < minY ||
                Math.min(segment.start.y, segment.end.y) > maxY) {
                continue;
            }

            if (this.lineIntersects(player, target, segment.start, segment.end)) {
                return true;
            }
        }
        return false;
    }

    public GetDepth(value: number, wall: boolean) {
        // -10 is base level.
        if (value === -10) {
            const customDefault = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/defaultElevation`];
            if (typeof customDefault === "string") value = parseInt(customDefault);
        }

        const elevationComplex = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationComplex`];
        if (elevationComplex === true) {
            // Elevation Complex keeps the Walls consistent on levels 0-6.
            switch (value) {
                case 1:
                    return -5;
                case 2:
                    return -6;
                case 3:
                    return -7;
                case 4:
                    return -8;
                case 5:
                    return -9;
                case 6:
                    return -10;
                default:
                    return -1;
            }
        }
        else {
            // Elevation Simple let's a token see over a wall on levels above 0.
            switch (value) {
                case 1:
                    return !wall ? -5 : -4;
                case 2:
                    return !wall ? -6 : -5;
                case 3:
                    return !wall ? -7 : -6;
                case 4:
                    return !wall ? -8 : -7;
                case 5:
                    return !wall ? -9 : -8;
                case 6:
                    return !wall ? -10 : -9;
                default:
                    return -1;
            }
        }
    }

    public GetMappedDepth(position: Vector2): number {
        const elevationMappings = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationMapping`] as ElevationMap[] ?? [];
        let sceneTokenDepth = -10; // Default depth for vision lights

        // Early exit if no mappings
        if (elevationMappings.length === 0) return sceneTokenDepth;

        for (const mapping of elevationMappings) {
            // Skip mappings that can't improve our result
            if (mapping.Depth <= sceneTokenDepth) continue;

            // Quick bounding box check before expensive polygon test
            const bounds = this.getPolygonBounds(mapping.Points);
            if (position.x < bounds.minX || position.x > bounds.maxX ||
                position.y < bounds.minY || position.y > bounds.maxY) {
                continue;
            }

            const withinMap = Utilities.isPointInPolygon(position, mapping.Points);
            if (withinMap && (mapping.Depth > sceneTokenDepth)) {
                sceneTokenDepth = mapping.Depth;
            }
        }
        return sceneTokenDepth;
    }

    // Helper method to calculate polygon bounding box
    private getPolygonBounds(points: Vector2[]): { minX: number, maxX: number, minY: number, maxY: number } {
        if (points.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

        let minX = points[0].x, maxX = points[0].x;
        let minY = points[0].y, maxY = points[0].y;

        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            if (point.x < minX) minX = point.x;
            if (point.x > maxX) maxX = point.x;
            if (point.y < minY) minY = point.y;
            if (point.y > maxY) maxY = point.y;
        }

        return { minX, maxX, minY, maxY };
    }

    public async UpdateWindowVisibility(
        players: Light[],
        windows: Wall[]
    ): Promise<void> {
        BSCACHE.disableWindows = [];
        BSCACHE.enableWindows = [];

        for (const window of windows) {
            const adjustedPoints = window.points.map(point => ({
                x: point.x + window.position.x,
                y: point.y + window.position.y
            }));
            const windowCenter = Math2.centroid(adjustedPoints);
            const windowDepth = this.GetMappedDepth(windowCenter);

            // Check against each player
            for (const player of players) {
                // Quick distance check first
                const playerDepth = this.GetMappedDepth(player.position);
                const viewRadius = player.attenuationRadius;
                const radiusSquared = viewRadius * viewRadius;
                if (this.distanceSquared(player.position, windowCenter) <= radiusSquared) {
                    // Only check line of sight if within radius
                    if (playerDepth >= windowDepth) {
                        // can see window
                        if (window.visible)
                            // window.visible means its NOT a window
                            BSCACHE.enableWindows.push(window.id);
                    } else {
                        // cant see window
                        if (!window.visible)
                            BSCACHE.disableWindows.push(window.id);
                    }
                }
            }
        }
    }

    // Main function to get hidden enemies
    public async HideEnemies(
        players: Light[],
        enemies: Item[]
    ): Promise<void> {
        const hiddenEnemies: string[] = [];
        const visibleEnemies: string[] = [];

        for (const enemy of enemies) {
            // Check against each player
            for (const player of players) {
                // Quick distance check first
                const viewRadius = player.attenuationRadius;
                const radiusSquared = viewRadius * viewRadius;
                if (this.distanceSquared(player.position, enemy.position) <= radiusSquared) {
                    // Only check line of sight if within radius
                    if (!this.isLineOfSightBlocked(player, enemy)) {
                        // Enemy is visible to at least one player, skip to next enemy
                        visibleEnemies.push(enemy.id);
                        continue;
                    }
                }
                hiddenEnemies.push(enemy.id);
            }
        }

        await OBR.scene.items.updateItems(enemies.map(enemy => enemy.id), (enemies) => {
            for (let enemy of enemies) {
                if (hiddenEnemies.includes(enemy.id) && !visibleEnemies.includes(enemy.id)) {
                    if (enemy.visible) enemy.visible = false;
                }
                else {
                    if (!enemy.visible) enemy.visible = true;
                }
            }
        });
    }
}