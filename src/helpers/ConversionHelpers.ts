import OBR, { buildCurve, buildPath, Command, Curve, Item, Line, Path, PathCommand, Shape, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "./BSConstants";
import { isVisionLine } from "./ItemFilters";
import { BSCACHE } from "./BSCache";
import * as Utilities from "./BSUtilities";
import { GetToolWidth } from "../scripts/visionToolUtilities";
import { TensionHelper } from "../scripts/tensionhelper";
import { Translation } from "../i18n/Translation";

// ==================== Type Definitions ====================

type DynamicFogDoor = {
  open: boolean;
  start: { distance: number; index: number };
  end: { distance: number; index: number };
};

type PathSample = {
  distance: number;
  point: Vector2;
};

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

// ==================== Vector Math Utilities ====================

function vectorDistanceSquared(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function pointsAlmostEqual(a: Vector2, b: Vector2, tolerance = 0.5): boolean {
  return vectorDistanceSquared(a, b) <= tolerance * tolerance;
}

function vectorLength(vector: Vector2): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function dotProduct(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

function crossProduct(a: Vector2, b: Vector2): number {
  return a.x * b.y - a.y * b.x;
}

function subtractPoints(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

function addScaled(point: Vector2, direction: Vector2, scale: number): Vector2 {
  return { x: point.x + direction.x * scale, y: point.y + direction.y * scale };
}

function getNormalizedDirection(start: Vector2, end: Vector2): Vector2 | null {
  const delta = subtractPoints(end, start);
  const length = vectorLength(delta);
  if (length === 0) return null;

  return { x: delta.x / length, y: delta.y / length };
}

function areCollinearSegments(
  aStart: Vector2,
  aEnd: Vector2,
  bStart: Vector2,
  bEnd: Vector2,
  tolerance = 1
): boolean {
  const aDirection = subtractPoints(aEnd, aStart);
  const bDirection = subtractPoints(bEnd, bStart);
  const aLength = vectorLength(aDirection);
  const bLength = vectorLength(bDirection);

  if (aLength === 0 || bLength === 0) return false;

  const parallelDistance = Math.abs(crossProduct(aDirection, bDirection)) / Math.max(aLength, bLength);
  if (parallelDistance > tolerance) return false;

  const offsetDistance = Math.abs(crossProduct(subtractPoints(bStart, aStart), aDirection)) / aLength;
  return offsetDistance <= tolerance;
}

function getProjectedSpan(origin: Vector2, direction: Vector2, start: Vector2, end: Vector2): { min: number; max: number } {
  const startProjection = dotProduct(subtractPoints(start, origin), direction);
  const endProjection = dotProduct(subtractPoints(end, origin), direction);

  return {
    min: Math.min(startProjection, endProjection),
    max: Math.max(startProjection, endProjection),
  };
}

function spansOverlap(a: { min: number; max: number }, b: { min: number; max: number }, tolerance = 1): boolean {
  return a.max >= b.min - tolerance && b.max >= a.min - tolerance;
}

// ==================== Path and Key Generation ====================

function quantizeValue(value: number, precision = 10): number {
  return Math.round(value * precision) / precision;
}

function pointKey(point: Vector2): string {
  return `${quantizeValue(point.x)},${quantizeValue(point.y)}`;
}

function getCurveDoorState(curve: Curve): string {
  const isDoor = curve.metadata[`${Constants.EXTENSIONID}/isDoor`] === true;
  if (!isDoor) return "wall";

  const doorOpen =
    curve.metadata[`${Constants.EXTENSIONID}/doorOpen`] === true ||
    curve.metadata[`${Constants.EXTENSIONID}/disabled`] === true;
  return doorOpen ? "door-open" : "door-closed";
}

function canonicalizeCycle(points: string[]): string {
  if (points.length === 0) return "";

  const rotations: string[] = [];
  for (let index = 0; index < points.length; index++) {
    rotations.push([...points.slice(index), ...points.slice(0, index)].join("|"));
  }

  const reversed = [...points].reverse();
  for (let index = 0; index < reversed.length; index++) {
    rotations.push([...reversed.slice(index), ...reversed.slice(0, index)].join("|"));
  }

  rotations.sort();
  return rotations[0] ?? "";
}

function curveGeometryKey(curve: Curve): string {
  const points = curve.points;
  if (points.length === 0) return "";

  const pointStrings = points.map(pointKey);
  const isClosedPath = pointStrings.length > 2 && pointStrings[0] === pointStrings[pointStrings.length - 1];

  let canonicalPath = "";
  if (isClosedPath) {
    canonicalPath = canonicalizeCycle(pointStrings.slice(0, pointStrings.length - 1));
  } else {
    const forward = pointStrings.join("|");
    const reverse = [...pointStrings].reverse().join("|");
    canonicalPath = forward < reverse ? forward : reverse;
  }

  return `${getCurveDoorState(curve)}::${canonicalPath}`;
}

function normalizeClosedPointSequence(points: Vector2[]): string {
  const normalized = [...points];
  if (normalized.length > 1 && pointsAlmostEqual(normalized[0], normalized[normalized.length - 1], 1)) {
    normalized.pop();
  }

  const keys = normalized.map(pointKey);
  return canonicalizeCycle(keys);
}

function getDoorMetadataKey(path: Path): string {
  const doors = path.metadata["rodeo.owlbear.dynamic-fog/doors"];
  if (!Array.isArray(doors)) return "";

  const normalizedDoors = (doors as unknown[])
    .map((door) => {
      const parsed = door as DynamicFogDoor;
      return {
        open: parsed.open === true,
        start: Math.round(parsed.start?.distance ?? 0),
        end: Math.round(parsed.end?.distance ?? 0),
      };
    })
    .sort((a, b) => (a.start - b.start) || (a.end - b.end));

  return JSON.stringify(normalizedDoors);
}

function fogPathGeometryKey(path: Path): string {
  const points = Utilities.ConvertPathCommands(path.commands, path.position);
  if (points.length < 3) return "";

  const shapeKey = normalizeClosedPointSequence(points);
  if (shapeKey === "") return "";

  return `${shapeKey}::${getDoorMetadataKey(path)}`;
}

// ==================== Deduplication ====================

function mergeTwoPointCurves(curves: Curve[]): Curve[] {
  const merged = [...curves];

  let didMerge = true;
  while (didMerge) {
    didMerge = false;

    outer: for (let leftIndex = 0; leftIndex < merged.length; leftIndex++) {
      const left = merged[leftIndex];
      if (left.points.length !== 2) continue;

      const leftDoorState = getCurveDoorState(left);
      const [leftStart, leftEnd] = left.points;

      for (let rightIndex = leftIndex + 1; rightIndex < merged.length; rightIndex++) {
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

export function dedupeCurves(curves: Curve[]): Curve[] {
  const seen = new Set<string>();
  const unique: Curve[] = [];

  for (const curve of curves) {
    const curveDoorState = getCurveDoorState(curve);

    if (curve.points.length === 2) {
      const [curveStart, curveEnd] = curve.points;
      const hasGeometricDuplicate = unique.some((existing) => {
        if (existing.points.length !== 2) return false;
        if (getCurveDoorState(existing) !== curveDoorState) return false;

        const [existingStart, existingEnd] = existing.points;
        return (
          (pointsAlmostEqual(curveStart, existingStart, 1) &&
            pointsAlmostEqual(curveEnd, existingEnd, 1)) ||
          (pointsAlmostEqual(curveStart, existingEnd, 1) && pointsAlmostEqual(curveEnd, existingStart, 1))
        );
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

export function dedupeFogPaths(paths: Path[]): Path[] {
  const seen = new Set<string>();
  const unique: Path[] = [];

  for (const path of paths) {
    const key = fogPathGeometryKey(path);
    if (key === "") continue;
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(path);
  }

  return unique;
}

// ==================== Vision Line Building ====================

function adjustPoints(points: Vector2[], position: Vector2): Vector2[] {
  return points.map((point) => ({ x: point.x + position.x, y: point.y + position.y }));
}

function getVisionLinePoints(item: Curve): Vector2[] {
  const closedShape = item.style.closed === true || item.style.fillOpacity !== 0;
  const tension = item.style.tension ?? 0;
  let points = adjustPoints(item.points, item.position);

  if (points.length > 2 && (tension !== 0 || closedShape)) {
    const sourcePoints = [...item.points];
    if (closedShape) sourcePoints.push(item.points[0]);

    const curvedPath = TensionHelper.CreateSkPath(sourcePoints, tension, closedShape);
    points = Utilities.ConvertPathCommands(curvedPath, item.position, { curveSegments: 20 });
  }

  return points;
}

function isClosedVisionPolyline(item: Curve, tolerance = 1): boolean {
  const points = getVisionLinePoints(item);
  if (points.length < 4) return false;

  return pointsAlmostEqual(points[0], points[points.length - 1], tolerance);
}

function buildFogPathCommands(points: Vector2[], closed = false): PathCommand[] {
  if (points.length < 2) return [];

  const commands: PathCommand[] = [[Command.MOVE, points[0].x, points[0].y]];

  for (let index = 1; index < points.length; index++) {
    commands.push([Command.LINE, points[index].x, points[index].y]);
  }

  if (closed) {
    commands.push([Command.CLOSE]);
  }

  return commands;
}

function buildSegmentCurve(
  start: Vector2,
  end: Vector2,
  options?: { name?: string; strokeColor?: string; metadata?: Record<string, unknown> }
): Curve {
  return buildVisionLine([start, end], {
    name: options?.name,
    strokeColor: options?.strokeColor,
    metadata: options?.metadata,
  });
}

function buildVisionLine(
  points: Vector2[],
  options?: {
    position?: Vector2;
    rotation?: number;
    closed?: boolean;
    tension?: number;
    name?: string;
    strokeColor?: string;
    metadata?: Record<string, unknown>;
  }
): Curve {
  const lineBuilder = buildCurve()
    .points(points)
    .strokeColor(
      (options?.strokeColor ??
        (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string)) ||
      Constants.DEFAULTLINECOLOR
    )
    .strokeDash(
      (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as []) || Constants.DEFAULTLINESTROKE
    )
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
      ...(options?.metadata ?? {}),
    });

  if (options?.position) lineBuilder.position(options.position);
  if (options?.rotation !== undefined) lineBuilder.rotation(options.rotation);

  return lineBuilder.build();
}

// ==================== Path Extraction ====================

function extractPathSubpaths(commands: PathCommand[], position: Vector2): Vector2[][] {
  const subpaths: Vector2[][] = [];
  let currentSubpath: Vector2[] = [];
  let currentPoint: Vector2 | null = null;

  const flushSubpath = (): void => {
    if (currentSubpath.length >= 2) {
      subpaths.push(currentSubpath);
    }

    currentSubpath = [];
    currentPoint = null;
  };

  for (const command of commands) {
    const commandType = command[0];
    if (commandType === Command.MOVE) {
      flushSubpath();
      if (command.length >= 3) {
        currentPoint = { x: command[1] + position.x, y: command[2] + position.y };
        currentSubpath.push({ ...currentPoint });
      }
      continue;
    }

    if (commandType === Command.LINE) {
      if (command.length < 3 || !currentPoint) continue;

      currentPoint = { x: command[1] + position.x, y: command[2] + position.y };
      currentSubpath.push({ ...currentPoint });
      continue;
    }

    if (commandType === Command.CLOSE) {
      if (currentSubpath.length >= 2) {
        const firstPoint = currentSubpath[0];
        const lastPoint = currentSubpath[currentSubpath.length - 1];
        if (!pointsAlmostEqual(firstPoint, lastPoint, 0.0001)) {
          currentSubpath.push({ ...firstPoint });
        }
      }

      flushSubpath();
    }
  }

  flushSubpath();
  return subpaths;
}

// ==================== Graph Construction ====================

function getLineDistance(points: Vector2[]): number {
  let distance = 0;
  for (let index = 1; index < points.length; index++) {
    distance += Utilities.distanceBetween(points[index - 1], points[index]);
  }

  return distance;
}

function getNodeAngle(from: Vector2, to: Vector2): number {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  return angle < 0 ? angle + Math.PI * 2 : angle;
}

function getAngleDelta(fromAngle: number, toAngle: number): number {
  let delta = toAngle - fromAngle;
  while (delta <= 0) delta += Math.PI * 2;
  while (delta > Math.PI * 2) delta -= Math.PI * 2;
  return delta;
}

function getOtherNodeIndex(segment: VisionLineSegment, nodeIndex: number): number | null {
  if (segment.startNode === nodeIndex) return segment.endNode;
  if (segment.endNode === nodeIndex) return segment.startNode;
  return null;
}

function addOrMergeNode(nodes: EndpointNode[], point: Vector2, tolerance = 1): number {
  for (let index = 0; index < nodes.length; index++) {
    if (pointsAlmostEqual(nodes[index].point, point, tolerance)) {
      return index;
    }
  }

  nodes.push({ point: { ...point }, segments: [] });
  return nodes.length - 1;
}

function buildVisionLineSegments(lines: Curve[]): { segments: VisionLineSegment[]; nodes: EndpointNode[] } {
  const segments: VisionLineSegment[] = [];
  const nodes: EndpointNode[] = [];

  for (const item of lines) {
    const linePoints = getVisionLinePoints(item);
    if (linePoints.length < 2) continue;

    const isDoor = item.metadata[`${Constants.EXTENSIONID}/isDoor`] === true;
    const isOpenDoor =
      item.metadata[`${Constants.EXTENSIONID}/doorOpen`] === true ||
      item.metadata[`${Constants.EXTENSIONID}/disabled`] === true;

    for (let pointIndex = 1; pointIndex < linePoints.length; pointIndex++) {
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
        endNode,
      });

      nodes[startNode].segments.push(segmentIndex);
      if (endNode !== startNode) {
        nodes[endNode].segments.push(segmentIndex);
      }
    }
  }

  return { segments, nodes };
}

// ==================== Loop Finding ====================

function canonicalizeLoop(loop: Array<{ segment: VisionLineSegment; forward: boolean }>): string {
  const tokens = loop.map((entry) => `${entry.segment.item.id}:${entry.forward ? "1" : "0"}`);
  if (tokens.length === 0) return "";

  const rotations: string[] = [];
  for (let index = 0; index < tokens.length; index++) {
    rotations.push([...tokens.slice(index), ...tokens.slice(0, index)].join("|"));
  }

  const reversedTokens = [...tokens].reverse().map((token) => {
    const [segmentId, direction] = token.split(":");
    return `${segmentId}:${direction === "1" ? "0" : "1"}`;
  });

  for (let index = 0; index < reversedTokens.length; index++) {
    rotations.push([...reversedTokens.slice(index), ...reversedTokens.slice(0, index)].join("|"));
  }

  rotations.sort();
  return rotations[0] ?? "";
}

function traceLoopFromHalfEdge(
  startIndex: number,
  forward: boolean,
  segments: VisionLineSegment[],
  nodes: EndpointNode[],
  componentSet: Set<number>
): Array<{ segment: VisionLineSegment; forward: boolean }> | null {
  const startSegment = segments[startIndex];
  const startNode = forward ? startSegment.startNode : startSegment.endNode;
  let currentNode = forward ? startSegment.endNode : startSegment.startNode;
  let incomingAngle = getNodeAngle(nodes[startNode].point, nodes[currentNode].point);
  const ordered: Array<{ segment: VisionLineSegment; forward: boolean }> = [{ segment: startSegment, forward }];
  const usedSegments = new Set<number>([startIndex]);

  for (let step = 0; step < segments.length * 2; step++) {
    if (currentNode === startNode && ordered.length > 1) {
      return ordered;
    }

    const candidates = nodes[currentNode].segments.filter(
      (index) => componentSet.has(index) && !usedSegments.has(index)
    );
    if (candidates.length === 0) return null;

    let bestIndex: number | null = null;
    let bestForward = true;
    let bestDelta = Infinity;

    for (const candidateIndex of candidates) {
      const candidateSegment = segments[candidateIndex];
      const nextNode = getOtherNodeIndex(candidateSegment, currentNode);
      if (nextNode === null) continue;

      const candidateAngle = getNodeAngle(nodes[currentNode].point, nodes[nextNode].point);
      const delta = getAngleDelta(incomingAngle, candidateAngle);
      if (delta < bestDelta) {
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

function findClosedLoopsInComponent(
  componentIndexes: number[],
  segments: VisionLineSegment[],
  nodes: EndpointNode[]
): Array<Array<{ segment: VisionLineSegment; forward: boolean }>> {
  const componentSet = new Set(componentIndexes);
  const loops = new Map<string, Array<{ segment: VisionLineSegment; forward: boolean }>>();

  for (const segmentIndex of componentIndexes) {
    for (const forward of [true, false]) {
      const loop = traceLoopFromHalfEdge(segmentIndex, forward, segments, nodes, componentSet);
      if (!loop || loop.length < 3) continue;

      const key = canonicalizeLoop(loop);
      if (!loops.has(key)) loops.set(key, loop);
    }
  }

  return Array.from(loops.values());
}

// ==================== Component Ordering ====================

function orderSegmentComponent(
  segmentIndexes: number[],
  segments: VisionLineSegment[],
  nodes: EndpointNode[]
): { ordered: Array<{ segment: VisionLineSegment; forward: boolean }>; closed: boolean } | null {
  const componentSet = new Set(segmentIndexes);
  const used = new Set<number>();
  const degreeByNode = new Map<number, number>();

  for (const index of segmentIndexes) {
    const segment = segments[index];
    degreeByNode.set(segment.startNode, (degreeByNode.get(segment.startNode) ?? 0) + 1);
    degreeByNode.set(segment.endNode, (degreeByNode.get(segment.endNode) ?? 0) + 1);
  }

  const startNode =
    Array.from(degreeByNode.entries()).find(([, degree]) => degree === 1)?.[0] ??
    segmentIndexes
      .map((index) => segments[index].startNode)
      .find((node) => nodes[node].segments.some((segmentIndex) => componentSet.has(segmentIndex))) ??
    (segmentIndexes[0] !== undefined ? segments[segmentIndexes[0]].startNode : undefined);

  if (startNode === undefined) return null;

  const ordered: Array<{ segment: VisionLineSegment; forward: boolean }> = [];
  let currentNode = startNode;

  while (used.size < segmentIndexes.length) {
    const candidates = nodes[currentNode].segments.filter(
      (index) => componentSet.has(index) && !used.has(index)
    );
    if (candidates.length === 0) break;

    const nextIndex = candidates[0];
    const segment = segments[nextIndex];
    const forward = segment.startNode === currentNode;

    ordered.push({ segment, forward });
    used.add(nextIndex);
    currentNode = forward ? segment.endNode : segment.startNode;
  }

  if (ordered.length !== segmentIndexes.length) return null;

  const closed =
    currentNode === startNode || Array.from(degreeByNode.values()).every((degree) => degree === 2);
  return { ordered, closed };
}

function getOrderedComponentEndpoints(
  orderedSegments: Array<{ segment: VisionLineSegment; forward: boolean }>
): { start: Vector2; end: Vector2 } | null {
  if (orderedSegments.length === 0) return null;

  const first = orderedSegments[0];
  const last = orderedSegments[orderedSegments.length - 1];

  const start = first.forward ? first.segment.start : first.segment.end;
  const end = last.forward ? last.segment.end : last.segment.start;

  return { start, end };
}

function shouldTreatAsClosed(
  orderedSegments: Array<{ segment: VisionLineSegment; forward: boolean }>,
  tolerance = 2
): boolean {
  const endpoints = getOrderedComponentEndpoints(orderedSegments);
  if (!endpoints) return false;

  return pointsAlmostEqual(endpoints.start, endpoints.end, tolerance);
}

// ==================== Fog Path Building ====================

function buildFogPathFromSegments(
  orderedSegments: Array<{ segment: VisionLineSegment; forward: boolean }>
): Path | null {
  const mergedPoints: Vector2[] = [];
  const doorMetadata: Array<{
    open: boolean;
    start: { distance: number; index: number };
    end: { distance: number; index: number };
  }> = [];
  let totalDistance = 0;

  for (const { segment, forward } of orderedSegments) {
    const segmentPoints = forward ? segment.points : [...segment.points].reverse();
    if (segmentPoints.length < 2) continue;

    const segmentDistance = getLineDistance(segmentPoints);

    if (mergedPoints.length === 0) {
      mergedPoints.push(...segmentPoints);
    } else {
      mergedPoints.push(...segmentPoints.slice(1));
    }

    if (segment.isDoor) {
      const roundedStartDistance = Math.round(totalDistance);
      const roundedEndDistance = Math.round(totalDistance + segmentDistance);

      doorMetadata.push({
        open: segment.isOpenDoor,
        start: { distance: roundedStartDistance, index: 0 },
        end: { distance: roundedEndDistance, index: 0 },
      });
    }

    totalDistance += segmentDistance;
  }

  if (mergedPoints.length < 2) return null;

  const fogMetadata: Record<string, unknown> = {
    "rodeo.owlbear.forecast-item": crypto.randomUUID(),
  };

  if (doorMetadata.length > 0) {
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

// ==================== Door Handling ====================

function getDynamicFogDoors(item: Item): DynamicFogDoor[] {
  const doors = item.metadata["rodeo.owlbear.dynamic-fog/doors"];
  return Array.isArray(doors) ? (doors as DynamicFogDoor[]) : [];
}

function buildPathSamples(points: Vector2[]): PathSample[] {
  if (points.length === 0) return [];

  const samples: PathSample[] = [{ distance: 0, point: points[0] }];
  let totalDistance = 0;

  for (let index = 0; index < points.length - 1; index++) {
    totalDistance += Utilities.distanceBetween(points[index], points[index + 1]);
    samples.push({ distance: totalDistance, point: points[index + 1] });
  }

  return samples;
}

function pointAtDistance(samples: PathSample[], targetDistance: number): Vector2 {
  if (samples.length === 0) return { x: 0, y: 0 };
  if (targetDistance <= samples[0].distance) return samples[0].point;

  const lastSample = samples[samples.length - 1];
  if (targetDistance >= lastSample.distance) return lastSample.point;

  for (let index = 0; index < samples.length - 1; index++) {
    const startSample = samples[index];
    const endSample = samples[index + 1];
    if (targetDistance < startSample.distance || targetDistance > endSample.distance) continue;

    const span = endSample.distance - startSample.distance;
    if (span === 0) return startSample.point;

    const t = (targetDistance - startSample.distance) / span;
    return {
      x: startSample.point.x + (endSample.point.x - startSample.point.x) * t,
      y: startSample.point.y + (endSample.point.y - startSample.point.y) * t,
    };
  }

  return lastSample.point;
}

function buildSegmentsForDoors(
  points: Vector2[],
  doors: DynamicFogDoor[]
): { kind: "wall" | "door"; start: Vector2; end: Vector2; door?: DynamicFogDoor }[] {
  const samples = buildPathSamples(points);
  if (samples.length < 2) return [];

  const maxDistance = samples[samples.length - 1].distance;
  const cutDistances = new Set<number>(samples.map((sample) => sample.distance));

  for (const door of doors) {
    const startDistance = Math.max(0, Math.min(maxDistance, Math.min(door.start.distance, door.end.distance)));
    const endDistance = Math.max(0, Math.min(maxDistance, Math.max(door.start.distance, door.end.distance)));
    cutDistances.add(startDistance);
    cutDistances.add(endDistance);
  }

  const orderedCuts = Array.from(cutDistances).sort((a, b) => a - b);
  const segments: { kind: "wall" | "door"; start: Vector2; end: Vector2; door?: DynamicFogDoor }[] = [];

  for (let index = 0; index < orderedCuts.length - 1; index++) {
    const startDistance = orderedCuts[index];
    const endDistance = orderedCuts[index + 1];
    if (endDistance - startDistance <= 0.0001) continue;

    const startPoint = pointAtDistance(samples, startDistance);
    const endPoint = pointAtDistance(samples, endDistance);
    if (pointsAlmostEqual(startPoint, endPoint, 0.0001)) continue;

    const midDistance = (startDistance + endDistance) / 2;
    const matchingDoor = doors.find((door) => {
      const doorStart = Math.min(door.start.distance, door.end.distance);
      const doorEnd = Math.max(door.start.distance, door.end.distance);
      return midDistance >= doorStart && midDistance <= doorEnd;
    });

    segments.push({
      kind: matchingDoor ? "door" : "wall",
      start: startPoint,
      end: endPoint,
      door: matchingDoor,
    });
  }

  return segments;
}

// ==================== Fog Conversion ====================

export function convertFogWallWithDoors(item: Item): Curve[] | null {
  if (item.layer !== "FOG") return null;

  const fogDoors = getDynamicFogDoors(item);

  let basePoints: Vector2[] | null = null;

  if (item.type === "PATH") {
    const basePath = item as Path;
    if (basePath.commands.length < 2) return null;

    const subpaths = extractPathSubpaths(basePath.commands, basePath.position);
    if (subpaths.length === 0) return null;

    if (subpaths.length > 1) {
      const converted: Curve[] = [];

      for (const subpath of subpaths) {
        const subpathItem = {
          ...item,
          type: "CURVE" as const,
          points: subpath,
        } as Curve;

        const subpathLines = convertFogWallWithDoors(subpathItem);
        if (subpathLines && subpathLines.length > 0) {
          converted.push(...subpathLines);
        }
      }

      return converted.length > 0 ? converted : null;
    }

    basePoints = subpaths[0] ?? null;
  } else if (item.type === "LINE") {
    const baseLine = item as Line;
    basePoints = adjustPoints([baseLine.startPosition, baseLine.endPosition], baseLine.position);
  } else if (item.type === "CURVE") {
    const baseCurve = item as Curve;
    if (baseCurve.points.length < 2) return null;

    const tension = baseCurve.style.tension ?? 0;
    const closedShape = baseCurve.style.closed === true || baseCurve.style.fillOpacity !== 0;
    let points = adjustPoints(baseCurve.points, baseCurve.position);

    if (baseCurve.points.length > 2 && (tension !== 0 || closedShape)) {
      const sourcePoints = [...baseCurve.points];
      if (closedShape) sourcePoints.push(baseCurve.points[0]);
      const curvedPath = TensionHelper.CreateSkPath(sourcePoints, tension, closedShape);
      points = Utilities.ConvertPathCommands(curvedPath, baseCurve.position, { curveSegments: 20 });
    }

    if (points.length < 2) return null;

    if (fogDoors.length === 0) return [buildVisionLine(points, { closed: false, tension: 0 })];

    basePoints = points;
  } else if (item.type === "SHAPE") {
    const baseShape = item as Shape;
    const points: Vector2[] = [];

    if (baseShape.shapeType === "CIRCLE") {
      const radius = Math.min(baseShape.width, baseShape.height) / 2;
      const angleIncrement = (2 * Math.PI) / 20;
      for (let i = 0; i < 20; i++) {
        const angle = i * angleIncrement;
        points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
      }
    } else if (baseShape.shapeType === "RECTANGLE") {
      points.push({ x: 0, y: 0 });
      points.push({ x: baseShape.width, y: 0 });
      points.push({ x: baseShape.width, y: baseShape.height });
      points.push({ x: 0, y: baseShape.height });
    } else if (baseShape.shapeType === "HEXAGON") {
      const radius = baseShape.width / 2;
      const angles = [
        Math.PI / 2,
        Math.PI / 6,
        (11 * Math.PI) / 6,
        (3 * Math.PI) / 2,
        (7 * Math.PI) / 6,
        (5 * Math.PI) / 6,
      ];
      for (let i = 0; i < 6; i++) {
        const angle = angles[i];
        points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
      }
    } else if (baseShape.shapeType === "TRIANGLE") {
      points.push({ x: 0, y: 0 });
      points.push({ x: -(baseShape.width / 2), y: baseShape.height });
      points.push({ x: baseShape.width / 2, y: baseShape.height });
    }

    if (points.length < 2) return null;

    points.push(points[0]);
    let adjustedPoints = points;
    if (baseShape.shapeType === "CIRCLE") {
      const curvedPath = TensionHelper.CreateSkPath(points, 0.25, true);
      adjustedPoints = Utilities.ConvertPathCommands(curvedPath, { x: 0, y: 0 }, { curveSegments: 20 });
    }

    if (fogDoors.length === 0) {
      return [
        buildVisionLine(adjustedPoints, {
          position: baseShape.position,
          rotation: baseShape.rotation,
          closed: false,
          tension: 0,
        }),
      ];
    }

    basePoints = adjustPoints(adjustedPoints, baseShape.position);
  }

  if (!basePoints || basePoints.length < 2) return null;
  const createdLines: Curve[] = [];
  const segments = fogDoors.length > 0 ? buildSegmentsForDoors(basePoints, fogDoors) : [];

  if (segments.length === 0) {
    return [buildVisionLine(basePoints, { closed: false, tension: 0 })];
  }

  for (const segment of segments) {
    if (segment.kind === "door") {
      createdLines.push(
        buildSegmentCurve(segment.start, segment.end, {
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
              },
        })
      );
    } else {
      createdLines.push(buildSegmentCurve(segment.start, segment.end));
    }
  }

  return createdLines.length > 0 ? createdLines : null;
}

// ==================== Main Conversion Functions ====================

export async function convertObstructionLinesToFog(): Promise<void> {
  const allSceneItems = await OBR.scene.items.getItems();
  const visionLines = allSceneItems.filter((item) => isVisionLine(item) && item.type === "CURVE") as Curve[];
  const uniqueVisionLines = dedupeCurves(visionLines);

  if (uniqueVisionLines.length === 0) {
    await OBR.notification.show(Translation.t('conversion.noObstructionLines'), "WARNING");
    return;
  }

  const fogItems: Path[] = [];
  const visionIdsToDelete = new Set<string>();
  let skippedCount = 0;

  const closedVisionCurves = uniqueVisionLines.filter(isClosedVisionPolyline);
  const graphVisionCurves = uniqueVisionLines.filter((item) => !isClosedVisionPolyline(item));

  for (const closedCurve of closedVisionCurves) {
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
    visionIdsToDelete.add(closedCurve.id);
  }

  const { segments, nodes } = buildVisionLineSegments(graphVisionCurves);
  const visitedSegments = new Set<number>();

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
    if (visitedSegments.has(segmentIndex)) continue;

    const queue = [segmentIndex];
    const componentIndexes: number[] = [];

    while (queue.length > 0) {
      const currentIndex = queue.pop() as number;
      if (visitedSegments.has(currentIndex)) continue;

      visitedSegments.add(currentIndex);
      componentIndexes.push(currentIndex);

      const segment = segments[currentIndex];
      for (const nodeIndex of [segment.startNode, segment.endNode]) {
        for (const connectedIndex of nodes[nodeIndex].segments) {
          if (!visitedSegments.has(connectedIndex)) queue.push(connectedIndex);
        }
      }
    }

    try {
      const closedLoops = findClosedLoopsInComponent(componentIndexes, segments, nodes);

      if (closedLoops.length > 0) {
        for (const loop of closedLoops) {
          const fogPath = buildFogPathFromSegments(loop);
          if (fogPath) {
            fogItems.push(fogPath);
            for (const loopSegment of loop) {
              visionIdsToDelete.add(loopSegment.segment.item.id);
            }
          }
        }

        continue;
      }

      const orderedComponent = orderSegmentComponent(componentIndexes, segments, nodes);
      if (orderedComponent && (orderedComponent.closed || shouldTreatAsClosed(orderedComponent.ordered, 2))) {
        const fogPath = buildFogPathFromSegments(orderedComponent.ordered);
        if (fogPath) {
          fogItems.push(fogPath);
          for (const componentIndex of componentIndexes) {
            visionIdsToDelete.add(segments[componentIndex].item.id);
          }
          continue;
        }
      }

      skippedCount++;
    } catch (_error) {
      skippedCount++;
    }
  }

  const uniqueFogItems = dedupeFogPaths(fogItems);
  const duplicateCount = fogItems.length - uniqueFogItems.length;

  if (uniqueFogItems.length === 0) {
    await OBR.notification.show(Translation.t('conversion.noSupportedObstructionLines'), "WARNING");
    return;
  }

  await BSCACHE.ToggleBusy(true);
  try {
    const addBatchSize = 20;
    for (let index = 0; index < uniqueFogItems.length; index += addBatchSize) {
      await OBR.scene.items.addItems(uniqueFogItems.slice(index, index + addBatchSize));
      await Utilities.Sleep(100);
    }

    const deleteTargets = Array.from(visionIdsToDelete);
    const deleteBatchSize = 64;
    for (let index = 0; index < deleteTargets.length; index += deleteBatchSize) {
      await OBR.scene.items.deleteItems(deleteTargets.slice(index, index + deleteBatchSize));
      await Utilities.Sleep(100);
    }
  } finally {
    await BSCACHE.ToggleBusy(false);
  }

  const skippedText = skippedCount > 0 ? Translation.t('conversion.skippedSuffix', { count: skippedCount }) : "";
  const dedupeText = duplicateCount > 0 ? Translation.t('conversion.duplicatesRemovedSuffix', { count: duplicateCount }) : "";
  await OBR.notification.show(
    Translation.t('conversion.obstructionToFogSuccess', { count: uniqueFogItems.length, skippedText, dedupeText }),
    "SUCCESS"
  );
}

export async function convertFogToObstructionLines(): Promise<void> {
  const allSceneItems = await OBR.scene.items.getItems();
  const fogItems = allSceneItems.filter((item) => item.layer === "FOG");

  if (fogItems.length === 0) {
    await OBR.notification.show(Translation.t('conversion.noFogItems'), "WARNING");
    return;
  }

  const linesToMake: Curve[] = [];
  const fogIdsToDelete = new Set<string>();
  let skippedCount = 0;

  for (const fogItem of fogItems) {
    try {
      const convertedLines = convertFogWallWithDoors(fogItem);
      if (convertedLines && convertedLines.length > 0) {
        linesToMake.push(...convertedLines);
        fogIdsToDelete.add(fogItem.id);
      } else {
        skippedCount++;
      }
    } catch (_error) {
      skippedCount++;
    }
  }

  const uniqueLinesToMake = dedupeCurves(linesToMake);
  const duplicateCount = linesToMake.length - uniqueLinesToMake.length;

  if (uniqueLinesToMake.length === 0) {
    await OBR.notification.show(Translation.t('conversion.noSupportedFogItems'), "WARNING");
    return;
  }

  await BSCACHE.ToggleBusy(true);
  try {
    const addBatchSize = 20;
    for (let i = 0; i < uniqueLinesToMake.length; i += addBatchSize) {
      await OBR.scene.items.addItems(uniqueLinesToMake.slice(i, i + addBatchSize));
      await Utilities.Sleep(100);
    }

    const deleteTargets = Array.from(fogIdsToDelete);
    const deleteBatchSize = 64;
    for (let i = 0; i < deleteTargets.length; i += deleteBatchSize) {
      await OBR.scene.items.deleteItems(deleteTargets.slice(i, i + deleteBatchSize));
      await Utilities.Sleep(100);
    }
  } finally {
    await BSCACHE.ToggleBusy(false);
  }

  const skippedText = skippedCount > 0 ? Translation.t('conversion.skippedSuffix', { count: skippedCount }) : "";
  const dedupeText = duplicateCount > 0 ? Translation.t('conversion.duplicatesRemovedSuffix', { count: duplicateCount }) : "";
  await OBR.notification.show(
    Translation.t('conversion.fogToObstructionSuccess', { count: uniqueLinesToMake.length, skippedText, dedupeText }),
    "SUCCESS"
  );
}
