import OBR, { Vector2, Curve, buildCurve } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetToolWidth } from "./visionToolUtilities";
import { HexagonHelper } from './visionBrushHexagonHelper';
import { IsometricHelper } from "./visionBrushIsometricHelper";
import * as Utilities from "../utilities/bsUtilities";

interface PointLine
{
    Start: Vector2;
    End: Vector2;
}

export class BrushLineGenerator
{
    static async GenerateSmallLines(currentTrack: Vector2[])
    {
        switch (BSCACHE.gridType)
        {
            case "SQUARE":
                await BrushLineGenerator.GenerateSquareSmallLines(currentTrack);
                break;
            case "HEX_VERTICAL":
                await BrushLineGenerator.GenerateHexagonSmallLines(currentTrack);
                break;
            case "HEX_HORIZONTAL":
                await BrushLineGenerator.GenerateHexagonSmallLines(currentTrack);
                break;
            case "DIMETRIC":
                await BrushLineGenerator.GenerateIsometricSmallLines(currentTrack);
                break;
            case "ISOMETRIC":
                await BrushLineGenerator.GenerateIsometricSmallLines(currentTrack);
                break;
        }
    }

    static async GenerateIsometricSmallLines(currentTrack: Vector2[])
    {
        const linesToConvert: PointLine[] = [];

        for (const iso of currentTrack)
        {
            const points = IsometricHelper.CalculateIsometricVertices(iso);

            for (let index = 0; index < points.length; index++)
            {
                const startPoint = points[index];
                const endPoint = index < (points.length - 1) ? points[index + 1] : points[0];
                linesToConvert.push({ Start: startPoint, End: endPoint });
            }
        }

        const cleanedLines = BrushLineGenerator.RemoveCloseLines(linesToConvert, 2);
        const culledLines = BrushLineGenerator.CombineContiguousDiagonalLines(cleanedLines);
        const dedupedLines = BrushLineGenerator.RemoveDuplicateLines(culledLines);
        const linesToDraw = BrushLineGenerator.GetLine(dedupedLines);

        const batchSize = 25;
        const totalLines = linesToDraw.length;

        for (let i = 0; i < totalLines; i += batchSize)
        {
            const batch = linesToDraw.slice(i, i + batchSize);
            await OBR.scene.items.addItems(batch);
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
    }

    static async GenerateHexagonSmallLines(currentTrack: Vector2[])
    {
        const linesToConvert: PointLine[] = [];

        for (const hexagon of currentTrack)
        {
            const points = HexagonHelper.CalculateHexagonVertices(hexagon);

            for (let index = 0; index < points.length; index++)
            {
                const startPoint = points[index];
                const endPoint = index < (points.length - 1) ? points[index + 1] : points[0];
                linesToConvert.push({ Start: startPoint, End: endPoint });
            }
        }

        const cleanedLines = BrushLineGenerator.RemoveCloseLines(linesToConvert, 2);
        const linesToDraw = BrushLineGenerator.GetLine(cleanedLines)

        const batchSize = 25;
        const totalLines = linesToDraw.length;

        for (let i = 0; i < totalLines; i += batchSize)
        {
            const batch = linesToDraw.slice(i, i + batchSize);
            await OBR.scene.items.addItems(batch);
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
    }

    static async GenerateSquareSmallLines(currentTrack: Vector2[])
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

        const culledLines = BrushLineGenerator.CombineContiguousLines(linesToConvert);
        const cleanedLines = BrushLineGenerator.CombineOverlappingLines(culledLines);
        const linesToDraw = BrushLineGenerator.GetLine(cleanedLines)

        const batchSize = 25;
        const totalLines = linesToDraw.length;

        for (let i = 0; i < totalLines; i += batchSize)
        {
            const batch = linesToDraw.slice(i, i + batchSize);
            await OBR.scene.items.addItems(batch);
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
    }

    static AreLinesIdentical(line1: PointLine, line2: PointLine, threshold: number): boolean
    {
        if ((Math.abs(line1.Start.x - line2.Start.x) < threshold)
            && (Math.abs(line1.Start.y - line2.Start.y) < threshold)
            && (Math.abs(line1.End.x - line2.End.x) < threshold)
            && (Math.abs(line1.End.y - line2.End.y) < threshold)) return true;

        if ((Math.abs(line1.Start.x - line2.End.x) < threshold)
            && (Math.abs(line1.Start.y - line2.End.y) < threshold)
            && (Math.abs(line1.End.x - line2.Start.x) < threshold)
            && (Math.abs(line1.End.y - line2.Start.y) < threshold)) return true;

        return false;
    }

    static RemoveCloseLines(lines: PointLine[], threshold: number): PointLine[]
    {
        const toExclude = new Set<number>(); // Store indices of lines to exclude

        for (let i = 0; i < lines.length; i++)
        {
            if (toExclude.has(i)) continue; // Skip already excluded lines

            for (let j = i + 1; j < lines.length; j++)
            {
                if (toExclude.has(j)) continue; // Skip already excluded lines

                if (BrushLineGenerator.AreLinesIdentical(lines[i], lines[j], threshold))
                {
                    // Mark both lines for exclusion
                    toExclude.add(i);
                    toExclude.add(j);
                }
            }
        }

        // Filter out excluded lines
        return lines.filter((_, index) => !toExclude.has(index));
    }

    static CombineOverlappingLines(lines: PointLine[]): PointLine[]
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
                const mergedLine = BrushLineGenerator.MergePrecision(line, match);
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
            return BrushLineGenerator.CombineOverlappingLines(mergedLines);
        }

        return mergedLines;
    }

    static CombineContiguousDiagonalLines(lines: PointLine[]): PointLine[]
    {
        let removedLines: PointLine[] = [];
        let mergedLines: PointLine[] = [];
        let mergeHappened = false;

        for (const line of lines)
        {
            // Find lines that share a start or end point with the current line
            const match = lines.find((ol) =>
            {
                if (line.Start.x === ol.Start.x
                    && line.Start.y === ol.Start.y
                    && line.End.x === ol.End.x
                    && line.End.y === ol.End.y) return false; // Skip the same line

                // Check if the lines are connected
                const pointsMatch =
                    (line.End.x === ol.Start.x && line.End.y === ol.Start.y) ||
                    (line.End.x === ol.End.x && line.End.y === ol.End.y) ||
                    (line.Start.x === ol.Start.x && line.Start.y === ol.Start.y) ||
                    (line.Start.x === ol.End.x && line.Start.y === ol.End.y);

                if (!pointsMatch) return false;

                // Check if the slopes are the same
                const lineSlope = (line.End.y - line.Start.y) / (line.End.x - line.Start.x);
                const otherSlope = (ol.End.y - ol.Start.y) / (ol.End.x - ol.Start.x);

                return lineSlope === otherSlope;
            });

            if (removedLines.includes(line))
            {
            }
            else if (match && !removedLines.includes(match))
            {
                // Merge the lines if a match is found
                const mergedLine = BrushLineGenerator.MergeLines(line, match);
                mergedLines.push(mergedLine);

                // Remove the matched lines from further consideration
                if (!removedLines.includes(line)) removedLines.push(line);
                if (!removedLines.includes(match)) removedLines.push(match);

                mergedLines = mergedLines.filter((l) => l !== line && l !== match);
                mergeHappened = true;
            } else
            {
                // If no matching line is found, add the current line if not already removed
                if (!removedLines.includes(line))
                {
                    mergedLines.push(line);
                }
            }
        }

        // Recursively merge until no further merges occur
        if (mergeHappened)
        {
            return BrushLineGenerator.CombineContiguousDiagonalLines(mergedLines);
        }

        return mergedLines;
    }

    static CombineContiguousLines(lines: PointLine[]): PointLine[]
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
                const mergedLine = BrushLineGenerator.MergeLines(line, match);
                mergedLines.push(mergedLine);

                // Remove the matched lines from the array
                if (!removedLines.includes(line)) removedLines.push(line);
                if (!removedLines.includes(match)) removedLines.push(match);

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
            return BrushLineGenerator.CombineContiguousLines(mergedLines);
        }

        return mergedLines;
    }

    static MergeLines(lineA: PointLine, lineB: PointLine): PointLine
    {
        if (lineA.End.x === lineB.End.x && lineA.End.y === lineB.End.y)
        {
            return {
                Start: lineA.Start,
                End: lineB.Start
            };
        }
        else if (lineA.Start.x === lineB.Start.x && lineA.Start.y === lineB.Start.y)
        {
            return {
                Start: lineA.End,
                End: lineB.End
            };
        }
        else if (lineA.Start.x === lineB.End.x && lineA.Start.y === lineB.End.y)
        {
            return {
                Start: lineB.Start,
                End: lineA.End
            };
        }
        return {
            Start: lineA.Start,
            End: lineB.End
        };
    }

    static RemoveDuplicateLines(lines: PointLine[])
    {
        const seen = new Set();
        return lines.filter(line =>
        {
            const start = line.Start.x < line.End.x ||
                (line.Start.x === line.End.x && line.Start.y < line.End.y)
                ? line.Start
                : line.End;
            const end = start === line.Start ? line.End : line.Start;

            const key = JSON.stringify({ Start: start, End: end });

            if (seen.has(key))
            {
                return false; // Skip duplicate
            }
            seen.add(key);
            return true; // Keep unique line
        });
    }

    static MergePrecision(lineA: PointLine, lineB: PointLine): PointLine
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

    static GetLine(lines: PointLine[]): Curve[]
    {
        const returnMe: Curve[] = [];
        for (const ln of lines)
        {
            const line = buildCurve()
                .tension(0)
                .points([ln.Start, ln.End])
                .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
                .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
                .strokeWidth(GetToolWidth())
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
}