import OBR, { Command, Image, Curve, ItemFilter, PathCommand, ToolContext, ToolEvent, Vector2, buildCurve, buildPath } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { isBrushSquare } from "../utilities/itemFilters";
import { BSCACHE } from "../utilities/bsSceneCache";

interface PointLine
{
    Start: Vector2;
    End: Vector2;
}

let currentTrack: Vector2[] = [];

async function cleanUpPopovers()
{
    currentTrack = [];
    const oldSquares = await OBR.scene.local.getItems(isBrushSquare as ItemFilter<Image>);
    await OBR.scene.local.deleteItems(oldSquares.map(x => x.id));
    await OBR.popover.close(Constants.BRUSHTOOLID);
}

async function onDragStart(_: ToolContext, event: ToolEvent)
{
    await GetGridSquare(event.pointerPosition);
}

async function onActivate()
{
    const width = await OBR.viewport.getWidth();

    //Create Tooltip
    await OBR.popover.open({
        id: Constants.BRUSHTOOLID,
        url: `/pages/brush.html`,
        height: 80,
        width: 350,
        disableClickAway: true,
        anchorPosition: { top: 60, left: width / 2 },
        anchorReference: "POSITION",
        anchorOrigin: {
            vertical: "CENTER",
            horizontal: "CENTER",
        },
        transformOrigin: {
            vertical: "TOP",
            horizontal: "CENTER",
        },
    });
}

async function onDeactivate()
{
    await OBR.popover.close(Constants.BRUSHTOOLID);
}

async function onDragMove(_: ToolContext, event: ToolEvent)
{
    await GetGridSquare(event.pointerPosition);
}

async function onDragEnd(_: ToolContext, _event: ToolEvent)
{
    await GenerateSmallLines();
    await cleanUpPopovers();
}

async function onDragCancel(_: ToolContext, _event: ToolEvent)
{
    await cleanUpPopovers();
}

async function GetGridSquare(coords: Vector2)
{
    const trueCoords: Vector2 = { x: Math.floor(coords.x / BSCACHE.gridDpi), y: Math.floor(coords.y / BSCACHE.gridDpi) };

    const inList = currentTrack.some((pos) => pos.x === trueCoords.x && pos.y === trueCoords.y);
    if (!inList)
    {
        const topLeft: Vector2 = { x: trueCoords.x * BSCACHE.gridDpi, y: trueCoords.y * BSCACHE.gridDpi };
        const topRight: Vector2 = { x: (trueCoords.x + 1) * BSCACHE.gridDpi, y: trueCoords.y * BSCACHE.gridDpi };
        const bottomLeft: Vector2 = { x: trueCoords.x * BSCACHE.gridDpi, y: (trueCoords.y + 1) * BSCACHE.gridDpi };
        const bottomRight: Vector2 = { x: (trueCoords.x + 1) * BSCACHE.gridDpi, y: (trueCoords.y + 1) * BSCACHE.gridDpi };

        const fillSquareCommands: PathCommand[] = [
            [Command.MOVE, topLeft.x, topLeft.y],
            [Command.LINE, topRight.x, topRight.y],
            [Command.LINE, bottomRight.x, bottomRight.y],
            [Command.LINE, bottomLeft.x, bottomLeft.y],
            [Command.CLOSE]
        ];

        const filledSquare = buildPath().commands(fillSquareCommands).strokeOpacity(0).fillOpacity(.5).fillColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR).build();
        filledSquare.metadata[`${Constants.EXTENSIONID}/isBrushSquare`] = true;
        filledSquare.layer = "POINTER";
        currentTrack.push(trueCoords);
        await OBR.scene.local.addItems([filledSquare]);
    }
}

async function GenerateSmallLines()
{
    const linesToConvert: PointLine[] = [];

    for (const square of currentTrack)
    {
        const { x, y } = square;

        const topLeft: Vector2 = { x: x * BSCACHE.gridDpi, y: y * BSCACHE.gridDpi };
        const topRight: Vector2 = { x: (x + 1) * BSCACHE.gridDpi, y: y * BSCACHE.gridDpi };
        const bottomLeft: Vector2 = { x: x * BSCACHE.gridDpi, y: (y + 1) * BSCACHE.gridDpi };
        const bottomRight: Vector2 = { x: (x + 1) * BSCACHE.gridDpi, y: (y + 1) * BSCACHE.gridDpi };

        if (!currentTrack.some(sq => sq.x === x && sq.y === y - 1))
        {
            // Wall on the top side
            const start: Vector2 = topLeft;
            const end: Vector2 = topRight;
            linesToConvert.push({ Start: start, End: end });
        }
        if (!currentTrack.some(sq => sq.x === x && sq.y === y + 1))
        {
            // Wall on the bottom side
            const start: Vector2 = bottomLeft;
            const end: Vector2 = bottomRight;
            linesToConvert.push({ Start: start, End: end });
        }
        if (!currentTrack.some(sq => sq.x === x - 1 && sq.y === y))
        {
            // Wall on the left side
            const start: Vector2 = topLeft;
            const end: Vector2 = bottomLeft;
            linesToConvert.push({ Start: start, End: end });
        }
        if (!currentTrack.some(sq => sq.x === x + 1 && sq.y === y))
        {
            // Wall on the right side
            const start: Vector2 = topRight;
            const end: Vector2 = bottomRight;
            linesToConvert.push({ Start: start, End: end });
        }
    }

    const culledLines = combineContiguousLines(linesToConvert);
    const cleanedLines = combineOverlappingLines(culledLines);
    const linesToDraw = GetLine(cleanedLines)

    const batchSize = 25;
    const totalLines = linesToDraw.length;

    for (let i = 0; i < totalLines; i += batchSize)
    {
        const batch = linesToDraw.slice(i, i + batchSize);
        await OBR.scene.items.addItems(batch);
    }
}

function combineOverlappingLines(lines: PointLine[])
{
    let removedLines: PointLine[] = [];
    let mergedLines: PointLine[] = [];
    let mergeHappened = false;

    for (const line of lines)
    {
        const sameAxisLines = line.Start.x === line.End.x ?
            lines.filter(x => x.Start.x === x.End.x) : lines.filter(y => y.Start.y === y.End.y);

        const samePosition = line.Start.x === line.End.x ?
            sameAxisLines.filter(x => x.Start.x === line.Start.x && x.End.x === line.End.x) :
            sameAxisLines.filter(x => x.Start.y === line.Start.y && x.End.y === line.End.y);

        const match = line.Start.x !== line.End.x ?
            samePosition.find(m => m.Start.x > line.Start.x && m.Start.x < line.End.x) :
            samePosition.find(m => m.Start.y > line.Start.y && m.Start.y < line.End.y);

        if (match)
        {
            // Merge the lines if a matching line is found
            const mergedLine = mergePrecision(line, match);
            mergedLines.push(mergedLine);

            // Remove the matched lines from the array
            removedLines.push(line);
            removedLines.push(match);

            mergedLines = mergedLines.filter(l => l !== line && l !== match);
            mergeHappened = true;
        } else
        {
            // If no matching line is found, add the current line as is
            if (!removedLines.includes(line)) mergedLines.push(line);
        }
    }

    // Check if further merging is possible
    if (mergeHappened)
    {
        // Recursively merge the lines until no further merging can occur
        return combineOverlappingLines(mergedLines);
    }

    return mergedLines;
}

function combineContiguousLines(lines: PointLine[]): PointLine[]
{
    let removedLines: PointLine[] = [];
    let mergedLines: PointLine[] = [];
    let mergeHappened = false;

    for (const line of lines)
    {
        // Find the matching line that connects to the end point of the current line
        const sameAxisLines = line.Start.x === line.End.x ? lines.filter(x => x.Start.x === x.End.x) : lines.filter(y => y.Start.y === y.End.y);
        const match = sameAxisLines.find(m => m.Start.x === line.End.x && m.Start.y === line.End.y);
        if (match)
        {
            // Merge the lines if a matching line is found
            const mergedLine = mergeLines(line, match);
            mergedLines.push(mergedLine);

            // Remove the matched lines from the array
            removedLines.push(line);
            removedLines.push(match);

            mergedLines = mergedLines.filter(l => l !== line && l !== match);
            mergeHappened = true;
        } else
        {
            // If no matching line is found, add the current line as is
            if (!removedLines.includes(line)) mergedLines.push(line);
        }
    }

    // Check if further merging is possible
    if (mergeHappened)
    {
        // Recursively merge the lines until no further merging can occur
        return combineContiguousLines(mergedLines);
    }

    return mergedLines;
}

function mergeLines(lineA: PointLine, lineB: PointLine): PointLine
{
    return {
        Start: lineA.Start,
        End: lineB.End
    };
}

function mergePrecision(lineA: PointLine, lineB: PointLine): PointLine
{
    // Determine the lower and higher points for start and end
    const startX = Math.min(lineA.Start.x, lineB.Start.x);
    const startY = Math.min(lineA.Start.y, lineB.Start.y);
    const endX = Math.max(lineA.End.x, lineB.End.x);
    const endY = Math.max(lineA.End.y, lineB.End.y);

    return {
        Start: { x: startX, y: startY },
        End: { x: endX, y: endY }
    };
}

function GetLine(lines: PointLine[]): Curve[]
{
    const returnMe: Curve[] = [];
    for (const ln of lines)
    {
        const line = buildCurve()
            .tension(0)
            .points([ln.Start, ln.End])
            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
            .strokeWidth(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? Constants.DEFAULTLINEWIDTH)
            .fillOpacity(0)
            .fillColor("#000000")
            .layer(Constants.LINELAYER)
            .name("Vision Line (Brushed)")
            .closed(false)
            .locked(true)
            .build();

        line.visible = false;
        line.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;
        line.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
        line.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
        returnMe.push(line);
    }
    return returnMe;
}

export const brushMode = { onActivate, onDeactivate, onDragStart, onDragMove, onDragEnd, onDragCancel };