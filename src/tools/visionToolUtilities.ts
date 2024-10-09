import { ToolEvent, Vector2 } from "@owlbear-rodeo/sdk";
import { BSCACHE } from "../utilities/bsSceneCache";
import * as Utilities from "../utilities/bsUtilities";
import { Constants } from "../utilities/bsConstants";

export function GetToolWidth()
{
    const cacheValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`];
    const parsedValue = cacheValue !== undefined ? parseInt(cacheValue as string) : NaN;
    return !Number.isNaN(parsedValue) ? parsedValue : Constants.DEFAULTLINEWIDTH;
}

export function GetVisionRangeDefault(): string
{
    const cacheValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionRangeDefault`] as string;
    if (!cacheValue) return Constants.ATTENUATIONDEFAULT;
    else return cacheValue;
}

export function GetSourceRangeDefault(): string
{
    const cacheValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionSourceDefault`] as string;
    if (!cacheValue) return Constants.SOURCEDEFAULT;
    else return cacheValue;
}

export function GetFalloffRangeDefault(): string
{
    const cacheValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionFallOffDefault`] as string;
    if (!cacheValue) return Constants.FALLOFFDEFAULT;
    else return cacheValue;
}

export function GetDarkvisionDefault(): string
{
    const cacheValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionDarkDefault`] as string;
    if (!cacheValue) return Constants.DARKVISIONDEFAULT;
    else return cacheValue;
}

export function GetInnerAngleDefault(): string
{
    const cacheValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionInAngleDefault`] as string;
    if (!cacheValue) return Constants.INANGLEDEFAULT;
    else return cacheValue;
}

export function GetOuterAngleDefault(): string
{
    const cacheValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionOutAngleDefault`] as string;
    if (!cacheValue) return Constants.OUTANGLEDEFAULT;
    else return cacheValue;
}

export function SplitLines(originalLineX: Vector2[], clickPoint1: Vector2, clickPoint2: Vector2, rotation: number, rotationCenter: Vector2): CutCurve
{
    const remainingSegments: Vector2[][] = [[], []];

    let splitStartPoint: Vector2 = { x: 0, y: 0 };
    let splitEndPoint: Vector2 = { x: 0, y: 0 };
    let startIndex = -1;
    let endIndex = -1;
    let minStartDistance = Infinity;
    let minEndDistance = Infinity;

    const originalLine = rotatePointsAroundCenter(originalLineX, rotation, rotationCenter);

    for (let i = 0; i < originalLine.length - 1; i++)
    {
        const lineStart = originalLine[i];
        const lineEnd = originalLine[i + 1];

        const nearestPoint1 = closestPointOnLine(lineStart, lineEnd, clickPoint1);
        const nearestPoint2 = closestPointOnLine(lineStart, lineEnd, clickPoint2);

        const distance1 = Utilities.distanceBetween(clickPoint1, nearestPoint1);
        const distance2 = Utilities.distanceBetween(clickPoint2, nearestPoint2);

        if (distance1 < minStartDistance)
        {
            startIndex = i;
            splitStartPoint = nearestPoint1;
            minStartDistance = distance1;
        }

        if (distance2 < minEndDistance)
        {
            endIndex = i;
            splitEndPoint = nearestPoint2;
            minEndDistance = distance2;
        }
    }

    const isReversed = startIndex > endIndex
        || (startIndex === endIndex && getPositionOnSegment(splitStartPoint, originalLine[startIndex], originalLine[startIndex + 1])
            > getPositionOnSegment(splitEndPoint, originalLine[endIndex], originalLine[endIndex + 1]));
    if (isReversed)
    {
        [startIndex, endIndex] = [endIndex, startIndex];
        [splitStartPoint, splitEndPoint] = [splitEndPoint, splitStartPoint];
    }

    let adjustline = [...originalLine];
    if (startIndex <= endIndex) 
    {
        adjustline.splice(startIndex + 1, 0, splitStartPoint);
        adjustline.splice(endIndex + 2, 0, splitEndPoint);
        remainingSegments[0] = CutArray(adjustline, 0, startIndex + 1);
        remainingSegments[1] = CutArray(adjustline, endIndex + 2, adjustline.length);
    }
    else
    {
        adjustline.splice(endIndex + 1, 0, splitEndPoint);
        adjustline.splice(startIndex + 2, 0, splitStartPoint);
        remainingSegments[0] = CutArray(adjustline, 0, endIndex + 1);
        remainingSegments[1] = CutArray(adjustline, startIndex + 2, adjustline.length);
    }

    const extractedSegment: Vector2[] = CutArray(adjustline, startIndex + 1, endIndex + 2);
    const rotatedRemainingSegments = remainingSegments.map(segment => rotatePointsAroundCenter(segment, -rotation, rotationCenter));

    return { extracted: extractedSegment, remaining: rotatedRemainingSegments };
}

function CutArray(line: Vector2[], start: number, end: number)
{
    return line.slice(start, end + 1);
}

function closestPointOnLine(lineStart: Vector2, lineEnd: Vector2, point: Vector2): Vector2
{
    const AB: Vector2 = { x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y };
    const AP: Vector2 = { x: point.x - lineStart.x, y: point.y - lineStart.y };

    const dotAP_AB = AP.x * AB.x + AP.y * AB.y;
    const magnitudeAB2 = AB.x * AB.x + AB.y * AB.y;

    const t = dotAP_AB / magnitudeAB2;

    const clampedT = Math.max(0, Math.min(1, t));

    return {
        x: lineStart.x + clampedT * AB.x,
        y: lineStart.y + clampedT * AB.y
    };
}


function getPositionOnSegment(p: Vector2, a: Vector2, b: Vector2): number
{
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const ab = { x: b.x - a.x, y: b.y - a.y };
    return (ap.x * ab.x + ap.y * ab.y) / (ab.x * ab.x + ab.y * ab.y);
}

function rotatePointAroundCenter(point: Vector2, angle: number, center: Vector2): Vector2
{
    const radians = angle * (Math.PI / 180);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return {
        x: cos * dx - sin * dy + center.x,
        y: sin * dx + cos * dy + center.y
    };
}

function rotatePointsAroundCenter(points: Vector2[], angle: number, center: Vector2): Vector2[]
{
    return points.map(point => rotatePointAroundCenter(point, angle, center));
}

export function GetSnappedCoordinates(event: ToolEvent): Vector2
{
    if (event.ctrlKey) return event.pointerPosition;

    const snapVar = Math.round(BSCACHE.gridDpi / BSCACHE.gridSnap);
    const nearGridX = Math.round(event.pointerPosition.x / BSCACHE.gridDpi) * BSCACHE.gridDpi;
    const nearGridY = Math.round(event.pointerPosition.y / BSCACHE.gridDpi) * BSCACHE.gridDpi;
    const absoluteX = Math.abs(nearGridX - event.pointerPosition.x);
    const absoluteY = Math.abs(nearGridY - event.pointerPosition.y);

    let snapPositionX: number;
    let snapPositionY: number;

    if (absoluteX <= snapVar)
    {
        snapPositionX = nearGridX;
    }
    else
    {
        snapPositionX = event.pointerPosition.x;
    }

    if (absoluteY <= snapVar)
    {
        snapPositionY = nearGridY;
    }
    else
    {
        snapPositionY = event.pointerPosition.y;
    }

    return { x: snapPositionX, y: snapPositionY };
}