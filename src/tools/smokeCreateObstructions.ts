import { Vector2, MathM, Math2 } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/constants";
import { sceneCache } from "../utilities/globals";
import { isTorch } from "../utilities/itemFilters";
import { comparePosition, squareDistance, isClose, mod } from "../utilities/math";
import { playerShadowCache } from "./smokeVisionProcess";

export function CreateObstructionLines(visionShapes: any): ObstructionLine[]
{
    return visionShapes
        .filter((shape: any) => shape.points && shape.points.length > 1)
        .flatMap((shape: any) =>
        {
            const shapeTransform = MathM.fromItem(shape);

            return shape.points.slice(0, -1).map((_: any, i: any) =>
            {
                const startTransform = MathM.fromPosition(shape.points[i]);
                const endTransform = MathM.fromPosition(shape.points[i + 1]);

                const start = MathM.decompose(MathM.multiply(shapeTransform, startTransform)).position;
                const end = MathM.decompose(MathM.multiply(shapeTransform, endTransform)).position;

                return {
                    startPosition: start,
                    endPosition: end,
                    originalShape: shape,
                    oneSided: shape.metadata[`${Constants.EXTENSIONID}/oneSided`]
                };
            });
        });
}

export function CreatePolygons(visionLines: ObstructionLine[], tokensWithVision: any, width: number, height: number, offset: [number, number], scale: [number, number]): Polygon[][]
{
    let polygons: Polygon[][] = [];
    let lineCounter = 0, skipCounter = 0;
    let size = [width, height];
    const gmIds = sceneCache.players.filter(x => x.role === "GM");
    const useOptimisations = sceneCache.metadata[`${Constants.EXTENSIONID}/quality`] !== 'accurate';

    const corners = [
        { x: (width + offset[0]) * scale[0], y: offset[1] * scale[1] },
        { x: (width + offset[0]) * scale[0], y: (height + offset[1]) * scale[1] },
        { x: offset[0] * scale[0], y: (height + offset[1]) * scale[1] },
        { x: offset[0] * scale[0], y: offset[1] * scale[1] },
    ];

    // Precompute constants
    const gridDpi = sceneCache.gridDpi;
    const extensionId = Constants.EXTENSIONID;

    const sceneHasTorches = tokensWithVision.some(isTorch);

    if (tokensWithVision.length === 0)
    {
        return polygons;
    }

    for (const token of tokensWithVision)
    {
        const myToken = (sceneCache.userId === token.createdUserId);
        const gmToken = gmIds.some(x => x.id === token.createdUserId);

        if ((!myToken && sceneCache.role !== "GM") && !gmToken)
        {
            continue;
        }

        const visionRangeMeta = token.metadata[`${extensionId}/visionRange`];
        const cacheResult = playerShadowCache.getValue(token.id);
        polygons.push([]);

        if (cacheResult !== undefined && comparePosition(cacheResult.player.position, token.position) && cacheResult.player.metadata[`${extensionId}/visionRange`] === visionRangeMeta)
        {
            continue; // The result is cached and will be used later, no need to do work
        }

        // use the token vision range to potentially skip any obstruction lines out of range:
        let visionRange = gridDpi * 1000; // Default value

        if (visionRangeMeta)
        {
            visionRange = gridDpi * ((visionRangeMeta) / sceneCache.gridScale + 0.5);
        }

        for (const line of visionLines)
        {
            const signedDistance = (token.position.x - line.startPosition.x) * (line.endPosition.y - line.startPosition.y) - (token.position.y - line.startPosition.y) * (line.endPosition.x - line.startPosition.x);

            if (line.oneSided !== undefined)
            {
                if ((line.oneSided === "right" && signedDistance > 0) || (line.oneSided === "left" && signedDistance < 0))
                    continue;
            }

            // exclude any lines outside of the fog area
            // can pathkit do this better / faster?
            let lsx = line.startPosition.x, lsy = line.startPosition.y, lex = line.endPosition.x, ley = line.endPosition.y;
            if ((lsx < offset[0] || lsy < offset[1] || lsx > offset[0] + size[0] || lsy > offset[1] + size[1]) || (lex < offset[0] || ley < offset[1] || lex > offset[0] + size[0] || ley > offset[1] + size[1]))
            {
                skipCounter++;
                continue;
            }

            // exclude lines based on distance.. this is faster than creating polys around everything, but is less accurate, particularly on long lines
            if (useOptimisations && (!sceneHasTorches || isTorch(token)))
            {
                const segments: Vector2[] = [line.startPosition, line.endPosition];
                const length = Math2.distance(line.startPosition, line.endPosition);
                const segmentFactor = 3; // this causes load but increases accuracy, because we calculate maxSegments as a proportion of the visionRange divided by the segment factor to increase resolution
                const maxSegments = Math.floor(length / (visionRange / segmentFactor));

                for (let i = 1; i < maxSegments; i++)
                {
                    segments.push(Math2.lerp(line.startPosition, line.endPosition, (i / maxSegments)));
                }

                let skip = true;
                for (const segment of segments)
                {
                    if (Math2.compare(token.position, segment, visionRange))
                    {
                        skip = false;
                    }
                };

                if (skip)
                {
                    skipCounter++;
                    continue;
                }
            }

            lineCounter++;

            // *1st step* - compute the points in the polygon representing the shadow
            // cast by `line` from the point of view of `player`.

            const v1 = { x: line.startPosition.x - token.position.x, y: line.startPosition.y - token.position.y };
            const v2 = { x: line.endPosition.x - token.position.x, y: line.endPosition.y - token.position.y };

            var proj1 = { x: 0, y: 0 }, proj2 = { x: 0, y: 0 };
            var xlim1 = 0, ylim1 = 0, xlim2 = 0, ylim2 = 0;

            // Make sure we don't go past the image borders
            //! This is probably not required if we later compute the intersection
            //! (using PathKit) of these polygons with a base rectangle the size of
            //! our background image
            if (v1.x < 0) xlim1 = offset[0] * scale[0];
            else xlim1 = (width + offset[0]) * scale[0];
            if (v1.y < 0) ylim1 = offset[1] * scale[1];
            else ylim1 = (height + offset[1]) * scale[1];
            if (v2.x < 0) xlim2 = offset[0] * scale[0];
            else xlim2 = (width + offset[0]) * scale[0];
            if (v2.y < 0) ylim2 = offset[1] * scale[1];
            else ylim2 = (height + offset[1]) * scale[1];

            const options1 = [], options2 = [];
            if (v1.x != 0)
            {
                const m = v1.y / v1.x;
                const b = line.startPosition.y - m * line.startPosition.x;
                options1.push({ x: xlim1, y: m * xlim1 + b });
            }
            if (v1.y != 0)
            {
                const n = v1.x / v1.y;
                const c = n * line.startPosition.y - line.startPosition.x;
                options1.push({ x: n * ylim1 - c, y: ylim1 });
            }
            if (v2.x != 0)
            {
                const m = v2.y / v2.x;
                const b = line.endPosition.y - m * line.endPosition.x;
                options2.push({ x: xlim2, y: m * xlim2 + b });
            }
            if (v2.y != 0)
            {
                const n = v2.x / v2.y;
                const c = n * line.endPosition.y - line.endPosition.x;
                options2.push({ x: n * ylim2 - c, y: ylim2 });
            }

            if (options1.length == 1 || squareDistance(options1[0], line.startPosition) < squareDistance(options1[1], line.startPosition))
                proj1 = options1[0];
            else
                proj1 = options1[1];

            if (options2.length == 1 || squareDistance(options2[0], line.endPosition) < squareDistance(options2[1], line.endPosition))
                proj2 = options2[0];
            else
                proj2 = options2[1];

            const pointset = [
                { x: line.startPosition.x, y: line.startPosition.y },
                proj1,
                proj2,
                { x: line.endPosition.x, y: line.endPosition.y },
            ];

            // Find out in which edge each solution lies
            const edges = [0, 0];
            let i = 0;
            for (const proj of [proj1, proj2])
            {
                if (isClose(proj.y, offset[1] * scale[1]))
                    edges[i] = 0;
                else if (isClose(proj.y, (height + offset[1]) * scale[1]))
                    edges[i] = 2;
                else if (isClose(proj.x, offset[0] * scale[0]))
                    edges[i] = 3;
                else if (isClose(proj.x, (width + offset[0]) * scale[0]))
                    edges[i] = 1;

                i++;
            }

            let direction = Math.sign(signedDistance);
            direction = direction == 0 ? 1 : -direction;
            const last = direction == 1 ? edges[1] : mod(edges[1] - 1, 4);
            for (let k = edges[0] + (direction == 1 ? 0 : -1); mod(k, 4) != last; k += direction)
            {
                pointset.splice(pointset.length - 2, 0, corners[mod(k, 4)]);
            }

            polygons[polygons.length - 1].push({ pointset: pointset, fromShape: line.originalShape });
        }
    }

    return polygons;
}