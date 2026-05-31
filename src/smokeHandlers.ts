import OBR, { buildCurve, buildPath, Command, Curve, Item, Line, Path, PathCommand, Shape, Vector2 } from "@owlbear-rodeo/sdk";
import Coloris from "@melloware/coloris";
import { SMOKEMAIN } from "./smokeMain";
import { Constants } from "./utilities/bsConstants";
import { isVisionLine } from "./utilities/itemFilters";
import { FogImportEntry, ImportScene } from "./tools/importUVTT";
import { BSCACHE } from "./utilities/bsSceneCache";
import { SMOKEMACHINE } from "./smokeProcessor";
import * as Utilities from "./utilities/bsUtilities";
import { GetDarkvisionDefault, GetFalloffRangeDefault, GetInnerAngleDefault, GetOuterAngleDefault, GetSourceRangeDefault, GetToolWidth, GetVisionRangeDefault } from "./tools/visionToolUtilities";
import { TensionHelper } from "./obr/tensionhelper";

function adjustPoints(points: Vector2[], position: Vector2): Vector2[]
{
    return points.map((point) => ({ x: point.x + position.x, y: point.y + position.y }));
}

type DynamicFogDoor = {
    open: boolean;
    start: { distance: number; index: number };
    end: { distance: number; index: number };
};

type PathSample = {
    distance: number;
    point: Vector2;
};

let conversionInProgress = false;

type ConversionOverlaySession = {
    timeoutId: ReturnType<typeof setTimeout> | null;
    active: boolean;
};

async function showConversionOverlay(): Promise<ConversionOverlaySession>
{
    const viewportWidth = await OBR.viewport.getWidth();
    const viewportHeight = await OBR.viewport.getHeight();

    await OBR.modal.open({
        id: Constants.CONVERSIONOVERLAY,
        url: "/pages/converting.html",
        disablePointerEvents: false,
        fullScreen: true,
        hidePaper: true,
    });

    const session: ConversionOverlaySession = {
        timeoutId: null,
        active: true,
    };

    session.timeoutId = setTimeout(() =>
    {
        if (!session.active) return;
        session.active = false;
        void OBR.modal.close(Constants.CONVERSIONOVERLAY).catch(() => undefined);
    }, 10000);

    return session;
}

async function closeConversionOverlay(session: ConversionOverlaySession | null): Promise<void>
{
    if (!session) return;

    session.active = false;
    if (session.timeoutId)
    {
        clearTimeout(session.timeoutId);
    }

    try
    {
        await OBR.modal.close(Constants.CONVERSIONOVERLAY);
    }
    catch (_error)
    {
        // Overlay was already closed by timeout or user interaction.
    }
}

function vectorDistanceSquared(a: Vector2, b: Vector2): number
{
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function pointsAlmostEqual(a: Vector2, b: Vector2, tolerance = 0.5): boolean
{
    return vectorDistanceSquared(a, b) <= tolerance * tolerance;
}

function vectorLength(vector: Vector2): number
{
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function dotProduct(a: Vector2, b: Vector2): number
{
    return a.x * b.x + a.y * b.y;
}

function crossProduct(a: Vector2, b: Vector2): number
{
    return a.x * b.y - a.y * b.x;
}

function subtractPoints(a: Vector2, b: Vector2): Vector2
{
    return { x: a.x - b.x, y: a.y - b.y };
}

function addScaled(point: Vector2, direction: Vector2, scale: number): Vector2
{
    return { x: point.x + direction.x * scale, y: point.y + direction.y * scale };
}

function getNormalizedDirection(start: Vector2, end: Vector2): Vector2 | null
{
    const delta = subtractPoints(end, start);
    const length = vectorLength(delta);
    if (length === 0) return null;

    return { x: delta.x / length, y: delta.y / length };
}

function areCollinearSegments(aStart: Vector2, aEnd: Vector2, bStart: Vector2, bEnd: Vector2, tolerance = 1): boolean
{
    const aDirection = subtractPoints(aEnd, aStart);
    const bDirection = subtractPoints(bEnd, bStart);
    const aLength = vectorLength(aDirection);
    const bLength = vectorLength(bDirection);

    if (aLength === 0 || bLength === 0) return false;

    // First check segment directions are parallel, then ensure one endpoint lies on the same infinite line.
    const parallelDistance = Math.abs(crossProduct(aDirection, bDirection)) / Math.max(aLength, bLength);
    if (parallelDistance > tolerance) return false;

    const offsetDistance = Math.abs(crossProduct(subtractPoints(bStart, aStart), aDirection)) / aLength;
    return offsetDistance <= tolerance;
}

function getProjectedSpan(origin: Vector2, direction: Vector2, start: Vector2, end: Vector2): { min: number; max: number }
{
    const startProjection = dotProduct(subtractPoints(start, origin), direction);
    const endProjection = dotProduct(subtractPoints(end, origin), direction);

    return {
        min: Math.min(startProjection, endProjection),
        max: Math.max(startProjection, endProjection),
    };
}

function spansOverlap(a: { min: number; max: number }, b: { min: number; max: number }, tolerance = 1): boolean
{
    return a.max >= b.min - tolerance && b.max >= a.min - tolerance;
}

function mergeTwoPointCurves(curves: Curve[]): Curve[]
{
    const merged = [...curves];

    let didMerge = true;
    while (didMerge)
    {
        didMerge = false;

        outer: for (let leftIndex = 0; leftIndex < merged.length; leftIndex++)
        {
            const left = merged[leftIndex];
            if (left.points.length !== 2) continue;

            const leftDoorState = getCurveDoorState(left);
            const [leftStart, leftEnd] = left.points;

            for (let rightIndex = leftIndex + 1; rightIndex < merged.length; rightIndex++)
            {
                const right = merged[rightIndex];
                if (right.points.length !== 2) continue;
                if (getCurveDoorState(right) !== leftDoorState) continue;

                const [rightStart, rightEnd] = right.points;
                if (!areCollinearSegments(leftStart, leftEnd, rightStart, rightEnd, 1)) continue;

                const direction = getNormalizedDirection(leftStart, leftEnd);
                if (!direction) continue;

                const leftSpan = getProjectedSpan(leftStart, direction, leftStart, leftEnd);
                const rightSpan = getProjectedSpan(leftStart, direction, rightStart, rightEnd);
                if (!spansOverlap(leftSpan, rightSpan, 1)) continue;

                const mergedMin = Math.min(leftSpan.min, rightSpan.min);
                const mergedMax = Math.max(leftSpan.max, rightSpan.max);
                const mergedStart = addScaled(leftStart, direction, mergedMin);
                const mergedEnd = addScaled(leftStart, direction, mergedMax);

                merged[leftIndex] = {
                    ...left,
                    points: [mergedStart, mergedEnd],
                };

                merged.splice(rightIndex, 1);
                didMerge = true;
                break outer;
            }
        }
    }

    return merged;
}

function isPointOnSegment(point: Vector2, segmentStart: Vector2, segmentEnd: Vector2, tolerance = 0.5): boolean
{
    const segmentLengthSquared = vectorDistanceSquared(segmentStart, segmentEnd);
    if (segmentLengthSquared === 0) return pointsAlmostEqual(point, segmentStart, tolerance);

    const cross = (point.y - segmentStart.y) * (segmentEnd.x - segmentStart.x) - (point.x - segmentStart.x) * (segmentEnd.y - segmentStart.y);
    if (Math.abs(cross) > tolerance * Math.sqrt(segmentLengthSquared)) return false;

    const dot = (point.x - segmentStart.x) * (segmentEnd.x - segmentStart.x) + (point.y - segmentStart.y) * (segmentEnd.y - segmentStart.y);
    if (dot < -tolerance) return false;
    if (dot > segmentLengthSquared + tolerance) return false;

    return true;
}

function getSegmentT(point: Vector2, segmentStart: Vector2, segmentEnd: Vector2): number
{
    const dx = segmentEnd.x - segmentStart.x;
    const dy = segmentEnd.y - segmentStart.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) return 0;

    return ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / lengthSquared;
}

function buildSegmentCurve(start: Vector2, end: Vector2, options?: { name?: string; strokeColor?: string; metadata?: Record<string, unknown> }): Curve
{
    return buildVisionLine([start, end], {
        name: options?.name,
        strokeColor: options?.strokeColor,
        metadata: options?.metadata,
    });
}

function buildVisionLine(points: Vector2[], options?: { position?: Vector2, rotation?: number, closed?: boolean, tension?: number, name?: string, strokeColor?: string, metadata?: Record<string, unknown> }): Curve
{
    const lineBuilder = buildCurve()
        .points(points)
        .strokeColor(options?.strokeColor ?? BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
        .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
        .strokeWidth(GetToolWidth())
        .fillOpacity(0)
        .fillColor("#000000")
        .layer(Constants.LINELAYER)
        .name(options?.name ?? "Vision Line (Line)")
        .closed(options?.closed === true)
        .locked(true)
        .visible(false)
        .tension(options?.tension ?? 0)
        .metadata({
            [`${Constants.EXTENSIONID}/isVisionLine`]: true,
            [`${Constants.EXTENSIONID}/blocking`]: true,
            [`${Constants.EXTENSIONID}/doubleSided`]: true,
            ...(options?.metadata ?? {})
        });

    if (options?.position) lineBuilder.position(options.position);
    if (options?.rotation !== undefined) lineBuilder.rotation(options.rotation);

    return lineBuilder.build();
}

function quantizeValue(value: number, precision = 10): number
{
    return Math.round(value * precision) / precision;
}

function pointKey(point: Vector2): string
{
    return `${quantizeValue(point.x)},${quantizeValue(point.y)}`;
}

function getCurveDoorState(curve: Curve): string
{
    const isDoor = curve.metadata[`${Constants.EXTENSIONID}/isDoor`] === true;
    if (!isDoor) return "wall";

    const doorOpen = curve.metadata[`${Constants.EXTENSIONID}/doorOpen`] === true || curve.metadata[`${Constants.EXTENSIONID}/disabled`] === true;
    return doorOpen ? "door-open" : "door-closed";
}

function canonicalizeCycle(points: string[]): string
{
    if (points.length === 0) return "";

    const rotations: string[] = [];
    for (let index = 0; index < points.length; index++)
    {
        rotations.push([...points.slice(index), ...points.slice(0, index)].join("|"));
    }

    const reversed = [...points].reverse();
    for (let index = 0; index < reversed.length; index++)
    {
        rotations.push([...reversed.slice(index), ...reversed.slice(0, index)].join("|"));
    }

    rotations.sort();
    return rotations[0] ?? "";
}

function curveGeometryKey(curve: Curve): string
{
    const points = curve.points;
    if (points.length === 0) return "";

    const pointStrings = points.map(pointKey);
    const isClosedPath = pointStrings.length > 2 && pointStrings[0] === pointStrings[pointStrings.length - 1];

    let canonicalPath = "";
    if (isClosedPath)
    {
        // Closed loops are equivalent under rotation; normalize start vertex.
        canonicalPath = canonicalizeCycle(pointStrings.slice(0, pointStrings.length - 1));
    }
    else
    {
        const forward = pointStrings.join("|");
        const reverse = [...pointStrings].reverse().join("|");
        canonicalPath = forward < reverse ? forward : reverse;
    }

    return `${getCurveDoorState(curve)}::${canonicalPath}`;
}

function dedupeCurves(curves: Curve[]): Curve[]
{
    const seen = new Set<string>();
    const unique: Curve[] = [];

    for (const curve of curves)
    {
        const curveDoorState = getCurveDoorState(curve);

        // Two-point segments are the most common duplicate case; use tolerance-based geometry checks.
        if (curve.points.length === 2)
        {
            const [curveStart, curveEnd] = curve.points;
            const hasGeometricDuplicate = unique.some(existing =>
            {
                if (existing.points.length !== 2) return false;
                if (getCurveDoorState(existing) !== curveDoorState) return false;

                const [existingStart, existingEnd] = existing.points;
                return (pointsAlmostEqual(curveStart, existingStart, 1) && pointsAlmostEqual(curveEnd, existingEnd, 1))
                    || (pointsAlmostEqual(curveStart, existingEnd, 1) && pointsAlmostEqual(curveEnd, existingStart, 1));
            });

            if (hasGeometricDuplicate) continue;
        }

        const key = curveGeometryKey(curve);
        if (key === "") continue;
        if (seen.has(key)) continue;

        seen.add(key);
        unique.push(curve);
    }

    return mergeTwoPointCurves(unique);
}

function buildFogPathCommands(points: Vector2[], closed = false): PathCommand[]
{
    if (points.length < 2) return [];

    const commands: PathCommand[] = [[Command.MOVE, points[0].x, points[0].y]];

    for (let index = 1; index < points.length; index++)
    {
        commands.push([Command.LINE, points[index].x, points[index].y]);
    }

    if (closed)
    {
        commands.push([Command.CLOSE]);
    }

    return commands;
}

function extractPathSubpaths(commands: PathCommand[], position: Vector2): Vector2[][]
{
    const subpaths: Vector2[][] = [];
    let currentSubpath: Vector2[] = [];
    let currentPoint: Vector2 | null = null;

    const flushSubpath = (): void =>
    {
        if (currentSubpath.length >= 2)
        {
            subpaths.push(currentSubpath);
        }

        currentSubpath = [];
        currentPoint = null;
    };

    for (const command of commands)
    {
        const commandType = command[0];
        if (commandType === Command.MOVE)
        {
            flushSubpath();
            if (command.length >= 3)
            {
                currentPoint = { x: command[1] + position.x, y: command[2] + position.y };
                currentSubpath.push({ ...currentPoint });
            }
            continue;
        }

        if (commandType === Command.LINE)
        {
            if (command.length < 3 || !currentPoint) continue;

            currentPoint = { x: command[1] + position.x, y: command[2] + position.y };
            currentSubpath.push({ ...currentPoint });
            continue;
        }

        if (commandType === Command.CLOSE)
        {
            if (currentSubpath.length >= 2)
            {
                const firstPoint = currentSubpath[0];
                const lastPoint = currentSubpath[currentSubpath.length - 1];
                if (!pointsAlmostEqual(firstPoint, lastPoint, 0.0001))
                {
                    currentSubpath.push({ ...firstPoint });
                }
            }

            flushSubpath();
        }
    }

    flushSubpath();
    return subpaths;
}

type VisionLineSegment = {
    item: Curve;
    points: Vector2[];
    start: Vector2;
    end: Vector2;
    isDoor: boolean;
    isOpenDoor: boolean;
    startNode: number;
    endNode: number;
};

type EndpointNode = {
    point: Vector2;
    segments: number[];
};

function getVisionLinePoints(item: Curve): Vector2[]
{
    const closedShape = item.style.closed === true || item.style.fillOpacity !== 0;
    const tension = item.style.tension ?? 0;
    let points = adjustPoints(item.points, item.position);

    if (points.length > 2 && (tension !== 0 || closedShape))
    {
        const sourcePoints = [...item.points];
        if (closedShape) sourcePoints.push(item.points[0]);

        const curvedPath = TensionHelper.CreateSkPath(sourcePoints, tension, closedShape);
        points = Utilities.ConvertPathCommands(curvedPath, item.position, { curveSegments: 20 });
    }

    return points;
}

function isClosedVisionPolyline(item: Curve, tolerance = 1): boolean
{
    const points = getVisionLinePoints(item);
    if (points.length < 4) return false;

    return pointsAlmostEqual(points[0], points[points.length - 1], tolerance);
}

function normalizeClosedPointSequence(points: Vector2[]): string
{
    const normalized = [...points];
    if (normalized.length > 1 && pointsAlmostEqual(normalized[0], normalized[normalized.length - 1], 1))
    {
        normalized.pop();
    }

    const keys = normalized.map(pointKey);
    return canonicalizeCycle(keys);
}

function getDoorMetadataKey(path: Path): string
{
    const doors = path.metadata["rodeo.owlbear.dynamic-fog/doors"];
    if (!Array.isArray(doors)) return "";

    const normalizedDoors = doors.map((door: unknown) =>
    {
        const parsed = door as DynamicFogDoor;
        return {
            open: parsed.open === true,
            start: Math.round(parsed.start?.distance ?? 0),
            end: Math.round(parsed.end?.distance ?? 0),
        };
    }).sort((a, b) => (a.start - b.start) || (a.end - b.end));

    return JSON.stringify(normalizedDoors);
}

function fogPathGeometryKey(path: Path): string
{
    const points = Utilities.ConvertPathCommands(path.commands, path.position);
    if (points.length < 3) return "";

    const shapeKey = normalizeClosedPointSequence(points);
    if (shapeKey === "") return "";

    return `${shapeKey}::${getDoorMetadataKey(path)}`;
}

function dedupeFogPaths(paths: Path[]): Path[]
{
    const seen = new Set<string>();
    const unique: Path[] = [];

    for (const path of paths)
    {
        const key = fogPathGeometryKey(path);
        if (key === "") continue;
        if (seen.has(key)) continue;

        seen.add(key);
        unique.push(path);
    }

    return unique;
}

function getLineDistance(points: Vector2[]): number
{
    let distance = 0;
    for (let index = 1; index < points.length; index++)
    {
        distance += Utilities.distanceBetween(points[index - 1], points[index]);
    }

    return distance;
}

function getNodeAngle(from: Vector2, to: Vector2): number
{
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    return angle < 0 ? angle + (Math.PI * 2) : angle;
}

function getAngleDelta(fromAngle: number, toAngle: number): number
{
    let delta = toAngle - fromAngle;
    while (delta <= 0) delta += Math.PI * 2;
    while (delta > Math.PI * 2) delta -= Math.PI * 2;
    return delta;
}

function getOtherNodeIndex(segment: VisionLineSegment, nodeIndex: number): number | null
{
    if (segment.startNode === nodeIndex) return segment.endNode;
    if (segment.endNode === nodeIndex) return segment.startNode;
    return null;
}

function canonicalizeLoop(loop: Array<{ segment: VisionLineSegment; forward: boolean }>): string
{
    const tokens = loop.map((entry) => `${entry.segment.item.id}:${entry.forward ? "1" : "0"}`);
    if (tokens.length === 0) return "";

    const rotations: string[] = [];
    for (let index = 0; index < tokens.length; index++)
    {
        rotations.push([...tokens.slice(index), ...tokens.slice(0, index)].join("|"));
    }

    const reversedTokens = [...tokens].reverse().map(token =>
    {
        const [segmentId, direction] = token.split(":");
        return `${segmentId}:${direction === "1" ? "0" : "1"}`;
    });

    for (let index = 0; index < reversedTokens.length; index++)
    {
        rotations.push([...reversedTokens.slice(index), ...reversedTokens.slice(0, index)].join("|"));
    }

    rotations.sort();
    return rotations[0] ?? "";
}

function traceLoopFromHalfEdge(startIndex: number, forward: boolean, segments: VisionLineSegment[], nodes: EndpointNode[], componentSet: Set<number>): Array<{ segment: VisionLineSegment; forward: boolean }> | null
{
    const startSegment = segments[startIndex];
    const startNode = forward ? startSegment.startNode : startSegment.endNode;
    let currentNode = forward ? startSegment.endNode : startSegment.startNode;
    let incomingAngle = getNodeAngle(nodes[startNode].point, nodes[currentNode].point);
    const ordered: Array<{ segment: VisionLineSegment; forward: boolean }> = [{ segment: startSegment, forward }];
    const usedSegments = new Set<number>([startIndex]);

    for (let step = 0; step < segments.length * 2; step++)
    {
        if (currentNode === startNode && ordered.length > 1)
        {
            return ordered;
        }

        const candidates = nodes[currentNode].segments.filter(index => componentSet.has(index) && !usedSegments.has(index));
        if (candidates.length === 0) return null;

        let bestIndex: number | null = null;
        let bestForward = true;
        let bestDelta = Infinity;

        for (const candidateIndex of candidates)
        {
            const candidateSegment = segments[candidateIndex];
            const nextNode = getOtherNodeIndex(candidateSegment, currentNode);
            if (nextNode === null) continue;

            const candidateAngle = getNodeAngle(nodes[currentNode].point, nodes[nextNode].point);
            const delta = getAngleDelta(incomingAngle, candidateAngle);
            if (delta < bestDelta)
            {
                bestDelta = delta;
                bestIndex = candidateIndex;
                bestForward = candidateSegment.startNode === currentNode;
            }
        }

        if (bestIndex === null) return null;

        const nextSegment = segments[bestIndex];
        const nextNode = getOtherNodeIndex(nextSegment, currentNode);
        if (nextNode === null) return null;

        ordered.push({ segment: nextSegment, forward: bestForward });
        usedSegments.add(bestIndex);
        incomingAngle = getNodeAngle(nodes[currentNode].point, nodes[nextNode].point);
        currentNode = nextNode;
    }

    return null;
}

function findClosedLoopsInComponent(componentIndexes: number[], segments: VisionLineSegment[], nodes: EndpointNode[]): Array<Array<{ segment: VisionLineSegment; forward: boolean }>>
{
    const componentSet = new Set(componentIndexes);
    const loops = new Map<string, Array<{ segment: VisionLineSegment; forward: boolean }>>();

    for (const segmentIndex of componentIndexes)
    {
        for (const forward of [true, false])
        {
            const loop = traceLoopFromHalfEdge(segmentIndex, forward, segments, nodes, componentSet);
            if (!loop || loop.length < 3) continue;

            const key = canonicalizeLoop(loop);
            if (!loops.has(key)) loops.set(key, loop);
        }
    }

    return Array.from(loops.values());
}

function addOrMergeNode(nodes: EndpointNode[], point: Vector2, tolerance = 1): number
{
    const existingIndex = nodes.findIndex(node => pointsAlmostEqual(node.point, point, tolerance));
    if (existingIndex !== -1)
    {
        nodes[existingIndex].point = {
            x: (nodes[existingIndex].point.x + point.x) / 2,
            y: (nodes[existingIndex].point.y + point.y) / 2
        };
        return existingIndex;
    }

    nodes.push({ point: { ...point }, segments: [] });
    return nodes.length - 1;
}

function buildVisionLineSegments(lines: Curve[]): { segments: VisionLineSegment[]; nodes: EndpointNode[] }
{
    const segments: VisionLineSegment[] = [];
    const nodes: EndpointNode[] = [];

    for (const item of lines)
    {
        const linePoints = getVisionLinePoints(item);
        if (linePoints.length < 2) continue;

        const isDoor = item.metadata[`${Constants.EXTENSIONID}/isDoor`] === true;
        const isOpenDoor = item.metadata[`${Constants.EXTENSIONID}/doorOpen`] === true || item.metadata[`${Constants.EXTENSIONID}/disabled`] === true;

        // Treat every consecutive point pair as an edge so closed polylines become traversable graph loops.
        for (let pointIndex = 1; pointIndex < linePoints.length; pointIndex++)
        {
            const start = linePoints[pointIndex - 1];
            const end = linePoints[pointIndex];
            if (pointsAlmostEqual(start, end, 0.0001)) continue;

            const startNode = addOrMergeNode(nodes, start);
            const endNode = addOrMergeNode(nodes, end);

            const segmentIndex = segments.length;
            segments.push({
                item,
                points: [start, end],
                start,
                end,
                isDoor,
                isOpenDoor,
                startNode,
                endNode
            });

            nodes[startNode].segments.push(segmentIndex);
            if (endNode !== startNode)
            {
                nodes[endNode].segments.push(segmentIndex);
            }
        }
    }

    return { segments, nodes };
}

function orderSegmentComponent(segmentIndexes: number[], segments: VisionLineSegment[], nodes: EndpointNode[]): { ordered: Array<{ segment: VisionLineSegment; forward: boolean }>; closed: boolean } | null
{
    const componentSet = new Set(segmentIndexes);
    const used = new Set<number>();
    const degreeByNode = new Map<number, number>();

    for (const index of segmentIndexes)
    {
        const segment = segments[index];
        degreeByNode.set(segment.startNode, (degreeByNode.get(segment.startNode) ?? 0) + 1);
        degreeByNode.set(segment.endNode, (degreeByNode.get(segment.endNode) ?? 0) + 1);
    }

    const startNode = Array.from(degreeByNode.entries()).find(([, degree]) => degree === 1)?.[0]
        ?? segmentIndexes.map(index => segments[index].startNode).find(node => nodes[node].segments.some(segmentIndex => componentSet.has(segmentIndex)))
        ?? (segmentIndexes[0] !== undefined ? segments[segmentIndexes[0]].startNode : undefined);

    if (startNode === undefined) return null;

    const ordered: Array<{ segment: VisionLineSegment; forward: boolean }> = [];
    let currentNode = startNode;

    while (used.size < segmentIndexes.length)
    {
        const candidates = nodes[currentNode].segments.filter(index => componentSet.has(index) && !used.has(index));
        if (candidates.length === 0) break;

        const nextIndex = candidates[0];
        const segment = segments[nextIndex];
        const forward = segment.startNode === currentNode;

        ordered.push({ segment, forward });
        used.add(nextIndex);
        currentNode = forward ? segment.endNode : segment.startNode;
    }

    if (ordered.length !== segmentIndexes.length) return null;

    const closed = currentNode === startNode || Array.from(degreeByNode.values()).every(degree => degree === 2);
    return { ordered, closed };
}

function getOrderedComponentEndpoints(orderedSegments: Array<{ segment: VisionLineSegment; forward: boolean }>): { start: Vector2; end: Vector2 } | null
{
    if (orderedSegments.length === 0) return null;

    const first = orderedSegments[0];
    const last = orderedSegments[orderedSegments.length - 1];

    const start = first.forward ? first.segment.start : first.segment.end;
    const end = last.forward ? last.segment.end : last.segment.start;

    return { start, end };
}

function shouldTreatAsClosed(orderedSegments: Array<{ segment: VisionLineSegment; forward: boolean }>, tolerance = 2): boolean
{
    const endpoints = getOrderedComponentEndpoints(orderedSegments);
    if (!endpoints) return false;

    return pointsAlmostEqual(endpoints.start, endpoints.end, tolerance);
}

function buildFogPathFromSegments(orderedSegments: Array<{ segment: VisionLineSegment; forward: boolean }>): Path | null
{
    const mergedPoints: Vector2[] = [];
    const doorMetadata: Array<{ open: boolean; start: { distance: number; index: number }; end: { distance: number; index: number } }> = [];
    let totalDistance = 0;

    for (const { segment, forward } of orderedSegments)
    {
        const segmentPoints = forward ? segment.points : [...segment.points].reverse();
        if (segmentPoints.length < 2) continue;

        const startIndex = mergedPoints.length === 0 ? 0 : mergedPoints.length - 1;
        const segmentDistance = getLineDistance(segmentPoints);

        if (mergedPoints.length === 0)
        {
            mergedPoints.push(...segmentPoints);
        }
        else
        {
            mergedPoints.push(...segmentPoints.slice(1));
        }

        if (segment.isDoor)
        {
            const roundedStartDistance = Math.round(totalDistance);
            const roundedEndDistance = Math.round(totalDistance + segmentDistance);

            doorMetadata.push({
                open: segment.isOpenDoor,
                start: { distance: roundedStartDistance, index: 0 },
                end: { distance: roundedEndDistance, index: 0 }
            });
        }

        totalDistance += segmentDistance;
    }

    if (mergedPoints.length < 2) return null;

    const fogMetadata: Record<string, unknown> = {
        "rodeo.owlbear.forecast-item": crypto.randomUUID(),
    };

    if (doorMetadata.length > 0)
    {
        fogMetadata["rodeo.owlbear.dynamic-fog/doors"] = doorMetadata;
    }

    const fogPath = buildPath()
        .commands(buildFogPathCommands(mergedPoints, true))
        .strokeColor("#222222")
        .strokeOpacity(0)
        .strokeWidth(5)
        .fillColor("#222222")
        .fillOpacity(1)
        .layer("FOG")
        .name("Dynamic Fog Wall")
        .metadata(fogMetadata)
        .visible(true)
        .locked(false)
        .build();

    fogPath.zIndex = 0;

    return fogPath;
}

async function ConvertObstructionLinesToFog()
{
    if (conversionInProgress)
    {
        await OBR.notification.show("A conversion is already in progress.", "WARNING");
        return;
    }

    conversionInProgress = true;
    let overlaySession: ConversionOverlaySession | null = null;

    try
    {
        overlaySession = await showConversionOverlay();
        const allSceneItems = await OBR.scene.items.getItems();
        const visionLines = allSceneItems.filter(item => isVisionLine(item) && item.type === "CURVE") as Curve[];
        const uniqueVisionLines = dedupeCurves(visionLines);
        const sourceVisionLineIds = new Set(uniqueVisionLines.map(item => item.id));

        if (uniqueVisionLines.length === 0)
        {
            await OBR.notification.show("No obstruction lines were found in this scene.", "WARNING");
            return;
        }

        const fogItems: Path[] = [];
        const visionIdsToDelete = new Set<string>();
        let skippedCount = 0;

        const closedVisionCurves = uniqueVisionLines.filter(isClosedVisionPolyline);
        const graphVisionCurves = uniqueVisionLines.filter(item => !isClosedVisionPolyline(item));

        for (const closedCurve of closedVisionCurves)
        {
            const closedPoints = getVisionLinePoints(closedCurve);
            const fogPath = buildPath()
                .commands(buildFogPathCommands(closedPoints, true))
                .strokeColor("#222222")
                .strokeOpacity(0)
                .strokeWidth(5)
                .fillColor("#222222")
                .fillOpacity(1)
                .layer("FOG")
                .name("Dynamic Fog Wall")
                .metadata({
                    "rodeo.owlbear.forecast-item": crypto.randomUUID(),
                })
                .visible(true)
                .locked(false)
                .build();

            fogPath.zIndex = 0;
            fogItems.push(fogPath);
            if (sourceVisionLineIds.has(closedCurve.id)) visionIdsToDelete.add(closedCurve.id);
        }

        const { segments, nodes } = buildVisionLineSegments(graphVisionCurves);
        const visitedSegments = new Set<number>();

        for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++)
        {
            if (visitedSegments.has(segmentIndex)) continue;

            const queue = [segmentIndex];
            const componentIndexes: number[] = [];

            while (queue.length > 0)
            {
                const currentIndex = queue.pop() as number;
                if (visitedSegments.has(currentIndex)) continue;

                visitedSegments.add(currentIndex);
                componentIndexes.push(currentIndex);

                const segment = segments[currentIndex];
                for (const nodeIndex of [segment.startNode, segment.endNode])
                {
                    for (const connectedIndex of nodes[nodeIndex].segments)
                    {
                        if (!visitedSegments.has(connectedIndex)) queue.push(connectedIndex);
                    }
                }
            }

            try
            {
                const closedLoops = findClosedLoopsInComponent(componentIndexes, segments, nodes);

                if (closedLoops.length > 0)
                {
                    for (const loop of closedLoops)
                    {
                        const fogPath = buildFogPathFromSegments(loop);
                        if (fogPath)
                        {
                            fogItems.push(fogPath);
                            for (const loopSegment of loop)
                            {
                                if (sourceVisionLineIds.has(loopSegment.segment.item.id)) visionIdsToDelete.add(loopSegment.segment.item.id);
                            }
                        }
                    }

                    continue;
                }

                const orderedComponent = orderSegmentComponent(componentIndexes, segments, nodes);
                if (orderedComponent && (orderedComponent.closed || shouldTreatAsClosed(orderedComponent.ordered, 2)))
                {
                    const fogPath = buildFogPathFromSegments(orderedComponent.ordered);
                    if (fogPath)
                    {
                        fogItems.push(fogPath);
                        for (const componentIndex of componentIndexes)
                        {
                            if (sourceVisionLineIds.has(segments[componentIndex].item.id)) visionIdsToDelete.add(segments[componentIndex].item.id);
                        }
                        continue;
                    }
                }

                skippedCount++;
            }
            catch (_error)
            {
                skippedCount++;
            }
        }

        const uniqueFogItems = dedupeFogPaths(fogItems);
        const duplicateCount = fogItems.length - uniqueFogItems.length;

        if (uniqueFogItems.length === 0)
        {
            await OBR.notification.show("No supported obstruction lines were found to convert.", "WARNING");
            return;
        }

        await BSCACHE.ToggleBusy(true);
        try
        {
            const addBatchSize = 20;
            for (let index = 0; index < uniqueFogItems.length; index += addBatchSize)
            {
                await OBR.scene.items.addItems(uniqueFogItems.slice(index, index + addBatchSize));
                await Utilities.Sleep(Constants.SHORTDELAY);
            }

            const deleteTargets = Array.from(visionIdsToDelete);
            const deleteBatchSize = 64;
            for (let index = 0; index < deleteTargets.length; index += deleteBatchSize)
            {
                await OBR.scene.items.deleteItems(deleteTargets.slice(index, index + deleteBatchSize));
                await Utilities.Sleep(Constants.SHORTDELAY);
            }
        }
        finally
        {
            await BSCACHE.ToggleBusy(false);
        }

        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
        const skippedText = skippedCount > 0 ? ` (${skippedCount} skipped)` : "";
        const dedupeText = duplicateCount > 0 ? ` (${duplicateCount} duplicates removed)` : "";
        await OBR.notification.show(`Converted ${uniqueFogItems.length} obstruction line(s) to fog${skippedText}${dedupeText}.`, "SUCCESS");
    }
    catch (_error)
    {
        await OBR.notification.show("Conversion error occurred.", "ERROR");
    }
    finally
    {
        await closeConversionOverlay(overlaySession);
        conversionInProgress = false;
    }
}

function getDynamicFogDoors(item: Item): DynamicFogDoor[]
{
    const doors = item.metadata["rodeo.owlbear.dynamic-fog/doors"];
    return Array.isArray(doors) ? doors as DynamicFogDoor[] : [];
}

function buildPathSamples(points: Vector2[]): PathSample[]
{
    if (points.length === 0) return [];

    const samples: PathSample[] = [{ distance: 0, point: points[0] }];
    let totalDistance = 0;

    for (let index = 0; index < points.length - 1; index++)
    {
        totalDistance += Utilities.distanceBetween(points[index], points[index + 1]);
        samples.push({ distance: totalDistance, point: points[index + 1] });
    }

    return samples;
}

function pointAtDistance(samples: PathSample[], targetDistance: number): Vector2
{
    if (samples.length === 0) return { x: 0, y: 0 };
    if (targetDistance <= samples[0].distance) return samples[0].point;

    const lastSample = samples[samples.length - 1];
    if (targetDistance >= lastSample.distance) return lastSample.point;

    for (let index = 0; index < samples.length - 1; index++)
    {
        const startSample = samples[index];
        const endSample = samples[index + 1];
        if (targetDistance < startSample.distance || targetDistance > endSample.distance) continue;

        const span = endSample.distance - startSample.distance;
        if (span === 0) return startSample.point;

        const t = (targetDistance - startSample.distance) / span;
        return {
            x: startSample.point.x + ((endSample.point.x - startSample.point.x) * t),
            y: startSample.point.y + ((endSample.point.y - startSample.point.y) * t)
        };
    }

    return lastSample.point;
}

function buildSegmentsForDoors(points: Vector2[], doors: DynamicFogDoor[]): { kind: "wall" | "door"; start: Vector2; end: Vector2; door?: DynamicFogDoor }[]
{
    const samples = buildPathSamples(points);
    if (samples.length < 2) return [];

    const maxDistance = samples[samples.length - 1].distance;
    const cutDistances = new Set<number>(samples.map(sample => sample.distance));

    for (const door of doors)
    {
        const startDistance = Math.max(0, Math.min(maxDistance, Math.min(door.start.distance, door.end.distance)));
        const endDistance = Math.max(0, Math.min(maxDistance, Math.max(door.start.distance, door.end.distance)));
        cutDistances.add(startDistance);
        cutDistances.add(endDistance);
    }

    const orderedCuts = Array.from(cutDistances).sort((a, b) => a - b);
    const segments: { kind: "wall" | "door"; start: Vector2; end: Vector2; door?: DynamicFogDoor }[] = [];

    for (let index = 0; index < orderedCuts.length - 1; index++)
    {
        const startDistance = orderedCuts[index];
        const endDistance = orderedCuts[index + 1];
        if (endDistance - startDistance <= 0.0001) continue;

        const startPoint = pointAtDistance(samples, startDistance);
        const endPoint = pointAtDistance(samples, endDistance);
        if (pointsAlmostEqual(startPoint, endPoint, 0.0001)) continue;

        const midDistance = (startDistance + endDistance) / 2;
        const matchingDoor = doors.find(door =>
        {
            const doorStart = Math.min(door.start.distance, door.end.distance);
            const doorEnd = Math.max(door.start.distance, door.end.distance);
            return midDistance >= doorStart && midDistance <= doorEnd;
        });

        segments.push({
            kind: matchingDoor ? "door" : "wall",
            start: startPoint,
            end: endPoint,
            door: matchingDoor
        });
    }

    return segments;
}

function convertFogWallWithDoors(item: Item): Curve[] | null
{
    if (item.layer !== "FOG") return null;

    const fogDoors = getDynamicFogDoors(item);

    let basePoints: Vector2[] | null = null;

    if (item.type === "PATH")
    {
        const basePath = item as Path;
        if (basePath.commands.length < 2) return null;

        const subpaths = extractPathSubpaths(basePath.commands, basePath.position);
        if (subpaths.length === 0) return null;

        if (subpaths.length > 1)
        {
            const converted: Curve[] = [];

            for (const subpath of subpaths)
            {
                const subpathItem = {
                    ...item,
                    type: "CURVE" as const,
                    points: subpath,
                } as Curve;

                const subpathLines = convertFogWallWithDoors(subpathItem);
                if (subpathLines && subpathLines.length > 0)
                {
                    converted.push(...subpathLines);
                }
            }

            return converted.length > 0 ? converted : null;
        }

        basePoints = subpaths[0] ?? null;
    }
    else if (item.type === "LINE")
    {
        const baseLine = item as Line;
        basePoints = adjustPoints([baseLine.startPosition, baseLine.endPosition], baseLine.position);
    }
    else if (item.type === "CURVE")
    {
        const baseCurve = item as Curve;
        if (baseCurve.points.length < 2) return null;

        const tension = baseCurve.style.tension ?? 0;
        const closedShape = baseCurve.style.closed === true || baseCurve.style.fillOpacity !== 0;
        let points = adjustPoints(baseCurve.points, baseCurve.position);

        if (baseCurve.points.length > 2 && (tension !== 0 || closedShape))
        {
            const sourcePoints = [...baseCurve.points];
            if (closedShape) sourcePoints.push(baseCurve.points[0]);
            const curvedPath = TensionHelper.CreateSkPath(sourcePoints, tension, closedShape);
            points = Utilities.ConvertPathCommands(curvedPath, baseCurve.position, { curveSegments: 20 });
        }

        if (points.length < 2) return null;

        if (fogDoors.length === 0) return [buildVisionLine(points, { closed: false, tension: 0 })];

        basePoints = points;
    }
    else if (item.type === "SHAPE")
    {
        const baseShape = item as Shape;
        const points: Vector2[] = [];

        if (baseShape.shapeType === "CIRCLE")
        {
            const radius = Math.min(baseShape.width, baseShape.height) / 2;
            const angleIncrement = (2 * Math.PI) / 20;
            for (let i = 0; i < 20; i++)
            {
                const angle = i * angleIncrement;
                points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
            }
        }
        else if (baseShape.shapeType === "RECTANGLE")
        {
            points.push({ x: 0, y: 0 });
            points.push({ x: baseShape.width, y: 0 });
            points.push({ x: baseShape.width, y: baseShape.height });
            points.push({ x: 0, y: baseShape.height });
        }
        else if (baseShape.shapeType === "HEXAGON")
        {
            const radius = baseShape.width / 2;
            const angles = [Math.PI / 2, Math.PI / 6, 11 * Math.PI / 6, 3 * Math.PI / 2, 7 * Math.PI / 6, 5 * Math.PI / 6];
            for (let i = 0; i < 6; i++)
            {
                const angle = angles[i];
                points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
            }
        }
        else if (baseShape.shapeType === "TRIANGLE")
        {
            points.push({ x: 0, y: 0 });
            points.push({ x: -(baseShape.width / 2), y: baseShape.height });
            points.push({ x: (baseShape.width / 2), y: baseShape.height });
        }

        if (points.length < 2) return null;

        points.push(points[0]);
        let adjustedPoints = points;
        if (baseShape.shapeType === "CIRCLE")
        {
            const curvedPath = TensionHelper.CreateSkPath(points, 0.25, true);
            adjustedPoints = Utilities.ConvertPathCommands(curvedPath, { x: 0, y: 0 }, { curveSegments: 20 });
        }

        if (fogDoors.length === 0)
        {
            return [buildVisionLine(adjustedPoints, {
                position: baseShape.position,
                rotation: baseShape.rotation,
                closed: false,
                tension: 0
            })];
        }

        basePoints = adjustPoints(adjustedPoints, baseShape.position);
    }

    if (!basePoints || basePoints.length < 2) return null;
    const createdLines: Curve[] = [];
    const segments = fogDoors.length > 0 ? buildSegmentsForDoors(basePoints, fogDoors) : [];

    if (segments.length === 0)
    {
        return [buildVisionLine(basePoints, { closed: false, tension: 0 })];
    }

    for (const segment of segments)
    {
        if (segment.kind === "door")
        {
            createdLines.push(buildSegmentCurve(segment.start, segment.end, {
                name: "Vision Line (Door)",
                strokeColor: Constants.DOORCOLOR,
                metadata: segment.door?.open === true
                    ? {
                        [`${Constants.EXTENSIONID}/isDoor`]: true,
                        [`${Constants.EXTENSIONID}/doorOpen`]: true,
                        [`${Constants.EXTENSIONID}/disabled`]: true,
                    }
                    : {
                        [`${Constants.EXTENSIONID}/isDoor`]: true,
                    }
            }));
        }
        else
        {
            createdLines.push(buildSegmentCurve(segment.start, segment.end));
        }
    }

    return createdLines.length > 0 ? createdLines : null;
}

async function ConvertFogToObstructionLines()
{
    if (conversionInProgress)
    {
        await OBR.notification.show("A conversion is already in progress.", "WARNING");
        return;
    }

    conversionInProgress = true;
    let overlaySession: ConversionOverlaySession | null = null;

    try
    {
        overlaySession = await showConversionOverlay();
        const allSceneItems = await OBR.scene.items.getItems();
        const fogItems = allSceneItems.filter(item => item.layer === "FOG");
        const sourceFogIds = new Set(fogItems.map(item => item.id));

        if (fogItems.length === 0)
        {
            await OBR.notification.show("No fog items were found in this scene.", "WARNING");
            return;
        }

        const linesToMake: Curve[] = [];
        const fogIdsToDelete = new Set<string>();
        let skippedCount = 0;

        for (const fogItem of fogItems)
        {
            try
            {
                const convertedLines = convertFogWallWithDoors(fogItem);
                if (convertedLines && convertedLines.length > 0)
                {
                    linesToMake.push(...convertedLines);
                    if (sourceFogIds.has(fogItem.id)) fogIdsToDelete.add(fogItem.id);
                }
                else skippedCount++;
            }
            catch (_error)
            {
                skippedCount++;
            }
        }

        const uniqueLinesToMake = dedupeCurves(linesToMake);
        const duplicateCount = linesToMake.length - uniqueLinesToMake.length;

        if (uniqueLinesToMake.length === 0)
        {
            await OBR.notification.show("No supported fog lines were found to convert.", "WARNING");
            return;
        }

        await BSCACHE.ToggleBusy(true);
        try
        {
            const addBatchSize = 20;
            for (let i = 0; i < uniqueLinesToMake.length; i += addBatchSize)
            {
                await OBR.scene.items.addItems(uniqueLinesToMake.slice(i, i + addBatchSize));
                await Utilities.Sleep(Constants.SHORTDELAY);
            }

            const deleteTargets = Array.from(fogIdsToDelete);
            const deleteBatchSize = 64;
            for (let i = 0; i < deleteTargets.length; i += deleteBatchSize)
            {
                await OBR.scene.items.deleteItems(deleteTargets.slice(i, i + deleteBatchSize));
                await Utilities.Sleep(Constants.SHORTDELAY);
            }
        }
        finally
        {
            await BSCACHE.ToggleBusy(false);
        }

        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
        const skippedText = skippedCount > 0 ? ` (${skippedCount} skipped)` : "";
        const dedupeText = duplicateCount > 0 ? ` (${duplicateCount} duplicates removed)` : "";
        await OBR.notification.show(`Converted ${uniqueLinesToMake.length} fog item(s) to obstruction lines${skippedText}${dedupeText}.`, "SUCCESS");
    }
    catch (_error)
    {
        await OBR.notification.show("Conversion error occurred.", "ERROR");
    }
    finally
    {
        await closeConversionOverlay(overlaySession);
        conversionInProgress = false;
    }
}

export function SetupGMInputHandlers(mobile = false)
{
    const hiddenListToggle = document.getElementById("hideListToggle") as HTMLInputElement;
    SMOKEMAIN.hiddenList = document.getElementById("hidden_list") as HTMLTableSectionElement;
    SMOKEMAIN.tokenList = document.getElementById("token_list") as HTMLTableSectionElement;

    hiddenListToggle!.onclick = async () =>
    {
        if (SMOKEMAIN.hiddenList!.style.display === "none")
        {
            if (SMOKEMAIN.hiddenList) SMOKEMAIN.hiddenList.style.display = "table-row-group";
            if (hiddenListToggle) hiddenListToggle.value = mobile ? "Tap to Hide List" : "Out-of-Sight List: Click to Hide";
        }
        else
        {
            if (SMOKEMAIN.hiddenList) SMOKEMAIN.hiddenList.style.display = "none";
            if (hiddenListToggle) hiddenListToggle.value = mobile ? "Tap to Show List" : "Out-of-Sight List: Click to Show";
        }
    }

    // This is for the grid-snap option - This is turned on by default and not saved
    const snapCheckbox = document.getElementById("snap_checkbox") as HTMLInputElement;
    BSCACHE.snap = true;
    snapCheckbox.checked = true;
    snapCheckbox.onclick = async (event: MouseEvent) =>
    {
        if (!BSCACHE.sceneReady)
        {
            event.preventDefault();
            return;
        }

        const target = event.target as HTMLInputElement;
        BSCACHE.snap = target.checked;
    };

    // Toggles vision for all tokens, all at once
    const toggleVisionAll = document.getElementById('disable_vision') as HTMLInputElement;
    toggleVisionAll.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/disableVision`] === true;
    toggleVisionAll!.onclick = async (event: MouseEvent) =>
    {
        {
            if (!event || !event.target) return;
            const target = event.target as HTMLInputElement;

            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/disableVision`]: target.checked });
            await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
        }
    };

    // Toggles the colored ownership lines
    const toggleFogFill = document.getElementById("toggle_fogfill") as HTMLInputElement;
    toggleFogFill.checked = BSCACHE.fogFilled;
    toggleFogFill.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.fog.setFilled(target.checked);
    };

    // Toggles trailing fog being active, which is reliant on persistence.
    const trailingFogCheckbox = document.getElementById("toggle_trailingfog") as HTMLInputElement;
    trailingFogCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/trailingFog`] === true;
    trailingFogCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/trailingFog`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles auto-hide, allowing tokens out of vision range to be 'invisible'.
    const autoHideCheckbox = document.getElementById("toggle_autohide") as HTMLInputElement;
    autoHideCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/autoHide`] === true;
    autoHideCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/autoHide`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles the colored ownership lines
    const togglPersistence = document.getElementById("toggle_persistence") as HTMLInputElement;
    togglPersistence.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true;
    // Trailing Fog Reliance
    if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] !== true)
    {
        trailingFogCheckbox.disabled = true;
        trailingFogCheckbox.checked = false;
    }
    togglPersistence!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/persistence`]: target.checked });
        if (!target.checked)
        {
            trailingFogCheckbox.disabled = true;
            trailingFogCheckbox.checked = false;
            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/trailingFog`]: false });
        }
        else
        {
            trailingFogCheckbox.disabled = false;
        }
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Resets all persistent lights
    const resetPersistence = document.getElementById("reset_persistence") as HTMLInputElement;
    resetPersistence!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        await OBR.broadcast.sendMessage(Constants.RESETPERSISTID, true, { destination: "ALL" });
    };

    const persistenceLimitInput = document.getElementById("persistence_limit") as HTMLInputElement;
    const savedPersistenceLimit = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistenceLimit`];
    persistenceLimitInput.value = typeof savedPersistenceLimit === "string"
        ? savedPersistenceLimit
        : typeof savedPersistenceLimit === "number"
            ? savedPersistenceLimit.toString()
            : "100";
    persistenceLimitInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = "100";
        else if (value < 1)
            target.value = "1";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/persistenceLimit`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles the colored ownership lines
    const toggleOwnerLines = document.getElementById("toggle_ownerlines") as HTMLInputElement;
    toggleOwnerLines.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] === true;
    toggleOwnerLines!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toggleOwnerLines`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles showing players the Door icons
    const doorCheckbox = document.getElementById("door_checkbox") as HTMLInputElement;
    doorCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/playerDoors`] === true;
    doorCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/playerDoors`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles displaying warning messages about hardware acceleration
    const warningsCheckbox = document.getElementById("warnings_checkbox") as HTMLInputElement;
    warningsCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/showWarnings`] === undefined ? true : BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/showWarnings`] === true;
    warningsCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/showWarnings`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles showing the unit vision settings context menu
    const unitContextMenuCheckbox = document.getElementById("toggle_unitcontextmenu") as HTMLInputElement;
    unitContextMenuCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/unitContextMenu`] === true;
    unitContextMenuCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/unitContextMenu`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };
    //wallContextMenu

    // Toggles showing the unit vision settings context menu
    const wallContextMenuCheckbox = document.getElementById("toggle_wallcontextmenu") as HTMLInputElement;
    wallContextMenuCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/wallContextMenu`] === true;
    wallContextMenuCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/wallContextMenu`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggle the default elevation layer for tokens/walls
    const defaultElevationSelect = document.getElementById('default_elevation_select') as HTMLSelectElement;
    const savedElevationValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/defaultElevation`];
    defaultElevationSelect.value = typeof savedElevationValue === "string" ? savedElevationValue : "-10";
    defaultElevationSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/defaultElevation`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggle the elevation style between tokens see over walls, and consistent levels (0 - 6 all work the same);
    const elevationStyleSelect = document.getElementById('elevation_style_select') as HTMLSelectElement;
    const savedElevationStyle = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationComplex`];
    elevationStyleSelect.value = savedElevationStyle === true ? "true" : "false";
    elevationStyleSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/elevationComplex`]: target.value === "true" });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles the pass-through of walls for a GM
    const passWallsCheckbox = document.getElementById("toggle_gmwalls") as HTMLInputElement;
    passWallsCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/passWallsGM`] === true;
    passWallsCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/passWallsGM`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles the locked/unlocked state of all lines
    const lockFogButton = document.getElementById("lock_button") as HTMLButtonElement;
    const unlockFogButton = document.getElementById("unlock_button") as HTMLButtonElement;
    unlockFogButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.locked = false;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
        BSCACHE.ToggleBusy(false);
    };

    lockFogButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.locked = true;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
        await BSCACHE.ToggleBusy(false);
    };

    // Toggles all walls to double-sided
    const doubleSideButton = document.getElementById('doublewall_button') as HTMLButtonElement;
    doubleSideButton.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
        BSCACHE.ToggleBusy(false);
    };

    // Toggles the block/unblocked state of all walls
    const blockWallsButton = document.getElementById("block_button") as HTMLButtonElement;
    const unblockWallsButton = document.getElementById("unblock_button") as HTMLButtonElement;
    unblockWallsButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/blocking`] = undefined;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
        BSCACHE.ToggleBusy(false);
    };

    blockWallsButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
        await BSCACHE.ToggleBusy(false);
    };

    // Token Defaults
    const visionDefaultInput = document.getElementById("visionDefaultInput") as HTMLButtonElement;
    visionDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionRangeDefault`] as string ?? GetVisionRangeDefault();
    visionDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetVisionRangeDefault();
        else if (value < 0)
            target.value = "0";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionRangeDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    const collisionDefaultInput = document.getElementById("collisionDefaultInput") as HTMLButtonElement;
    collisionDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionSourceDefault`] as string ?? GetSourceRangeDefault().toString();
    collisionDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (isNaN(value))
            target.value = GetSourceRangeDefault();
        else if (value < 0)
            target.value = "0";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionSourceDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    const greyscaleDefaultInput = document.getElementById("greyscaleDefaultInput") as HTMLButtonElement;
    greyscaleDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionDarkDefault`] as string ?? GetDarkvisionDefault().toString();
    greyscaleDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetDarkvisionDefault().toString();
        else if (value < 0)
            target.value = "0";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionDarkDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    const innerAngleDefaultInput = document.getElementById("innerAngleDefaultInput") as HTMLButtonElement;
    innerAngleDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionInAngleDefault`] as string ?? GetInnerAngleDefault().toString();
    innerAngleDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetInnerAngleDefault().toString();
        else if (value < -360)
            target.value = "-360";
        else if (value > 360)
            target.value = "360";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionInAngleDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    }

    const outerAngleDefaultInput = document.getElementById("outerAngleDefaultInput") as HTMLButtonElement;
    outerAngleDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionOutAngleDefault`] as string ?? GetOuterAngleDefault().toString();
    outerAngleDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetOuterAngleDefault().toString();
        else if (value < -360)
            target.value = "-360";
        else if (value > 360)
            target.value = "360";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionOutAngleDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    }

    const falloffDefaultInput = document.getElementById("falloffDefaultInput") as HTMLButtonElement;
    falloffDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionFallOffDefault`] as string ?? GetFalloffRangeDefault().toString();
    falloffDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (isNaN(value))
            target.value = GetFalloffRangeDefault();
        else if (value < 0)
            target.value = "0";
        else if (value > 10)
            target.value = "10";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionFallOffDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    }

    // TODO: this is a hack, need to pass json between different event handlers
    var importObject: any;
    const importButton = document.getElementById("import_button") as HTMLInputElement;
    const importFile = document.getElementById("import_file") as HTMLInputElement;
    const importErrors = document.getElementById("import_errors") as HTMLDivElement;
    const importDpi = document.getElementById("import_dpi") as HTMLInputElement;
    const importFormat = document.getElementById("import_format") as HTMLSelectElement;
    const dpiAutodetect = document.getElementById("dpi_autodetect") as HTMLInputElement;
    const mapAlign = document.getElementById("map_align") as HTMLSelectElement;

    importFile!.onchange = (event: Event) =>
    {
        type FileEventTarget = EventTarget & { files: FileList };
        importButton!.disabled = true;

        if (!event || !event.target) return;
        const target = event.target as FileEventTarget;

        if (!target.files) return;
        const file = target.files[0];

        if (file.type !== "text/javascript" && file.type !== "application/x-javascript")
        {
            // do we care about the mime type? this is likely browser specific, or file specific, so just ignore it for now.
            // importErrors.innerText = "Wrong file type " + file.type;
            // return;
        }

        if (file)
        {
            const fileLabel = document.getElementById("import_file_name");
            if (fileLabel) fileLabel.textContent = file.name;

            type ReadFileTarget = EventTarget & { result: string };
            var readFile = new FileReader();
            readFile.onload = function (event: Event)
            {
                if (!event || !event.target)
                {
                    importErrors!.innerText = "Invalid import event";
                    return;
                }
                const target = event.target as ReadFileTarget;
                if (!target.result)
                {
                    importErrors!.innerText = "Unable to read imported file";
                    return;
                }
                const fileContent = target.result;
                try {
                    importObject = JSON.parse(fileContent);
                } catch {
                    importErrors!.innerText = "Import file contains invalid JSON";
                    OBR.notification.show("Smoke & Spectre: Import file contains invalid JSON.", "ERROR");
                    return;
                }

                // do we really need to validate this here? can do it inside the import functions for each vtt
                if (importObject && ((importObject.walls && importObject.walls.length)
                    || (importObject.line_of_sight && importObject.line_of_sight.length)
                    || (importObject.objects_line_of_sight && importObject.objects_line_of_sight.length)))
                {
                    // Good to go:
                    importButton!.disabled = false;
                    OBR.notification.show("Smoke & Spectre: Import file loaded successfully.", "SUCCESS");
                } else
                {
                    importButton!.disabled = true;
                    OBR.notification.show("Smoke & Spectre: Import file has no walls to import.", "ERROR");
                }
            };
            readFile.readAsText(file);
        } else
        {
            importErrors!.innerText = "Failed to load file";
            OBR.notification.show("Smoke & Spectre: Failed to load import file.", "ERROR");
        }
    };

    dpiAutodetect!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        importDpi!.disabled = dpiAutodetect!.checked;
    };

    importButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        await BSCACHE.ToggleBusy(true);
        if (importFormat!.value === "scene")
        {
            await ImportScene(importObject, importErrors!);
        }
        else
        {
            await FogImportEntry(importFormat.value, importObject, (dpiAutodetect.checked ? 0 : Number.parseInt(importDpi.value)), mapAlign.value);
        }
        await BSCACHE.ToggleBusy(false);
    };

    const convertFogButton = document.getElementById("convert_fog_button") as HTMLInputElement | null;
    if (convertFogButton)
    {
        convertFogButton.onclick = async (_event: MouseEvent) =>
        {
            await ConvertFogToObstructionLines();
        };
    }

    const convertSmokeButton = document.getElementById("convert_smoke_button") as HTMLInputElement | null;
    if (convertSmokeButton)
    {
        convertSmokeButton.onclick = async (_event: MouseEvent) =>
        {
            await ConvertObstructionLinesToFog();
        };
    }

    // Obstruction Line Drawing Settings
    const toolWidth = document.getElementById("tool_width") as HTMLInputElement;
    const toolColor = document.getElementById("tool_color") as HTMLInputElement;
    const toolStyle = document.getElementById("tool_style") as HTMLSelectElement;
    let debouncer: ReturnType<typeof setTimeout>;

    const playerPreviewSelect = document.getElementById("preview_select") as HTMLSelectElement;
    playerPreviewSelect!.onchange = async () =>
    {
        await SMOKEMACHINE.Run();
        await BSCACHE.ToggleBusy(false);
    };

    // Tool Option Handling - Tool Color
    toolColor!.onclick = async (_event: MouseEvent) =>
    {
        Coloris({
            el: `#${toolColor!.id}`,
            alpha: false,
            forceAlpha: false,
        });
    };

    toolColor!.oninput = async (event: Event) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        clearTimeout(debouncer);

        // Debounce this input to avoid hitting OBR rate limit
        debouncer = setTimeout(async () =>
        {
            const hexTest = /#[a-f0-9]{6}/
            if (hexTest.test(target.value))
            {
                await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolColor`]: target.value });
                await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
            }
        }, 400);

    };

    toolStyle!.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolStyle`]: target.value == "solid" ? [] : [25, 25] });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    toolWidth!.onchange = (event) =>
    {
        const target = event.currentTarget as HTMLInputElement;
        clearTimeout(debouncer);

        try
        {
            const numberValue = parseInt(target.value);
            if (numberValue < 1 || numberValue > 100)
            {
                target.value = "8";
            }
        } catch (error)
        {
            target.value = "8";
        }

        // Debounce this input to avoid hitting OBR rate limit
        debouncer = setTimeout(async () =>
        {
            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolWidth`]: target.value });
            await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
        }, 400);
    };

    // Need to retrieve the colors and set them on the element before initialization for the Thumbnails to update correctly.
    const getToolColor = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? "#000000";
    if (toolColor) toolColor.value = getToolColor;
    Coloris({
        themeMode: 'dark',
        alpha: false,
        forceAlpha: false,
        el: "#tool_color",
        defaultColor: getToolColor
    });
}

type VisionPreset = {
    id: string;
    name: string;
    visionRange: string;
    visionDark: string;
    visionSourceRange: string;
    visionFallOff: string;
    visionInAngle: string;
    visionOutAngle: string;
};

const VISION_PRESETS_KEY = `${Constants.EXTENSIONID}/visionPresets`;
const MAX_VISION_PRESETS = 20;

function RenderPresetList(
    container: HTMLDivElement,
    presets: VisionPreset[],
    onApply: (id: string) => Promise<void>,
    onDelete: (id: string) => Promise<void>)
{
    if (presets.length === 0)
    {
        container.innerHTML = `<div style="text-align: center; padding: 8px; opacity: 0.6;">No presets saved.</div>`;
        return;
    }

    const table = document.createElement("table");
    table.style.width = "100%";
    const colgroup = document.createElement("colgroup");
    colgroup.innerHTML = `<col style="width: 50%;"><col style="width: 25%;"><col style="width: 25%;">`;
    table.appendChild(colgroup);

    for (const preset of presets)
    {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="padding: 2px;">
                <div style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${preset.name}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; opacity: 0.9; font-size: 0.85em;">
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionRange.svg">${preset.visionRange}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionBumper.svg">${preset.visionSourceRange}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionInner.svg">${preset.visionInAngle}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionOuter.svg">${preset.visionOutAngle}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionFalloff.svg">${preset.visionFallOff}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./darkvision.svg">${preset.visionDark}</span>
                </div>
            </td>
            <td><input type="button" class="settingsButton" value="Apply" data-preset-id="${preset.id}"></td>
            <td><input type="button" class="settingsButton" value="Delete" data-preset-delete-id="${preset.id}"></td>
        `;
        table.appendChild(row);
    }

    container.innerHTML = "";
    container.appendChild(table);

    table.addEventListener("click", async (e) =>
    {
        const target = e.target as HTMLInputElement;
        if (!target || target.tagName !== "INPUT") return;

        const applyId = target.dataset.presetId;
        const deleteId = target.dataset.presetDeleteId;

        if (applyId) await onApply(applyId);
        else if (deleteId) await onDelete(deleteId);
    });
}

export async function SetupPresetHandlers()
{
    const presetNameInput = document.getElementById("preset_name") as HTMLInputElement;
    const presetVRange = document.getElementById("preset_vrange") as HTMLInputElement;
    const presetVDark = document.getElementById("preset_vdark") as HTMLInputElement;
    const presetVSource = document.getElementById("preset_vsource") as HTMLInputElement;
    const presetVFalloff = document.getElementById("preset_vfalloff") as HTMLInputElement;
    const presetVInner = document.getElementById("preset_vinner") as HTMLInputElement;
    const presetVOuter = document.getElementById("preset_vouter") as HTMLInputElement;
    const presetSaveBtn = document.getElementById("preset_save_btn") as HTMLInputElement;
    const presetList = document.getElementById("preset_list") as HTMLDivElement;

    if (!presetSaveBtn || !presetList) return;

    const loadPresetsFromStorage = async (): Promise<VisionPreset[]> =>
    {
        // Check if presets exist in old scene location for backwards compatibility
        const scenePresets = Array.isArray(BSCACHE.sceneMetadata[VISION_PRESETS_KEY])
            ? BSCACHE.sceneMetadata[VISION_PRESETS_KEY] as VisionPreset[]
            : null;
        
        if (scenePresets && scenePresets.length > 0)
        {
            // Migrate to localStorage
            localStorage.setItem(VISION_PRESETS_KEY, JSON.stringify(scenePresets));
            // Clean up scene metadata
            await OBR.scene.setMetadata({ [VISION_PRESETS_KEY]: undefined });
            return scenePresets;
        }
        
        // Load from localStorage
        const stored = localStorage.getItem(VISION_PRESETS_KEY);
        return stored ? JSON.parse(stored) : [];
    };

    let presets = await loadPresetsFromStorage();

    const persistAndRender = async (updated: VisionPreset[]) =>
    {
        presets = updated;
        localStorage.setItem(VISION_PRESETS_KEY, JSON.stringify(updated));
        RenderPresetList(presetList, presets, onApply, onDelete);
    };

    const onApply = async (presetId: string) =>
    {
        const preset = presets.find(p => p.id === presetId);
        if (!preset) return;
        const selection = await OBR.player.getSelection();
        if (!selection || selection.length === 0)
        {
            await OBR.notification.show("Select one or more tokens on the board to apply the preset.", "WARNING");
            return;
        }
        await OBR.scene.items.updateItems(selection, (items) =>
        {
            for (const item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionRange`] = preset.visionRange;
                item.metadata[`${Constants.EXTENSIONID}/visionDark`] = preset.visionDark;
                item.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = preset.visionSourceRange;
                item.metadata[`${Constants.EXTENSIONID}/visionFallOff`] = preset.visionFallOff;
                item.metadata[`${Constants.EXTENSIONID}/visionInAngle`] = preset.visionInAngle;
                item.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = preset.visionOutAngle;
            }
        });
        await OBR.notification.show(`Preset "${preset.name}" applied to ${selection.length} token(s).`, "SUCCESS");
    };

    const onDelete = async (presetId: string) =>
    {
        await persistAndRender(presets.filter(p => p.id !== presetId));
    };

    RenderPresetList(presetList, presets, onApply, onDelete);

    presetSaveBtn.onclick = async () =>
    {
        const name = presetNameInput.value.trim();
        if (!name)
        {
            await OBR.notification.show("Please enter a preset name.", "WARNING");
            return;
        }
        if (presets.length >= MAX_VISION_PRESETS)
        {
            await OBR.notification.show(`You can save up to ${MAX_VISION_PRESETS} presets. Delete one to add another.`, "WARNING");
            return;
        }

        const newPreset: VisionPreset = {
            id: crypto.randomUUID(),
            name,
            visionRange: presetVRange.value || GetVisionRangeDefault(),
            visionDark: presetVDark.value || GetDarkvisionDefault().toString(),
            visionSourceRange: presetVSource.value || GetSourceRangeDefault(),
            visionFallOff: presetVFalloff.value || GetFalloffRangeDefault(),
            visionInAngle: presetVInner.value || GetInnerAngleDefault().toString(),
            visionOutAngle: presetVOuter.value || GetOuterAngleDefault().toString(),
        };
        const updated = [...presets, newPreset];
        await persistAndRender(updated);
        presetNameInput.value = "";
    };
}