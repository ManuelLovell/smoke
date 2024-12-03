import OBR, { Vector2, PathCommand, Command, buildPath } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";

export class IsometricHelper
{
    static async GetGridIsometric(trueCoords: Vector2, currentTrack: Vector2[])
    {
        const inList = currentTrack.some((pos) => pos.x === trueCoords.x && pos.y === trueCoords.y);
        if (!inList)
        {
            const isoPath = IsometricHelper.CreateIsometricPath(trueCoords);

            const filledIsometric = buildPath().commands(isoPath).strokeOpacity(0).fillOpacity(.5).fillColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR).build();
            filledIsometric.metadata[`${Constants.EXTENSIONID}/isBrushSquare`] = true;
            filledIsometric.layer = "POINTER";
            currentTrack.push(trueCoords);

            await OBR.scene.local.addItems([filledIsometric]);
        }
    }

    static CreateIsometricPath(coords: Vector2): PathCommand[]
    {
        const vertices = IsometricHelper.CalculateIsometricVertices(coords);

        const pathCommands: PathCommand[] = [
            [Command.MOVE, vertices[0].x, vertices[0].y]
        ];

        // Add line commands for remaining vertices
        for (let i = 1; i < vertices.length; i++)
        {
            pathCommands.push([Command.LINE, vertices[i].x, vertices[i].y]);
        }

        pathCommands.push([Command.CLOSE]);

        return pathCommands;
    }

    static CalculateIsometricVertices(coords: Vector2): Vector2[]
    {
        const artHeight = BSCACHE.gridDpi / 2; // Height of the rectangle
        const artWidth = BSCACHE.gridType === "ISOMETRIC" ?
            artHeight / Math.tan(Math.PI / 6) :
            BSCACHE.gridDpi; // Width of the rectangle

        const tX = coords.x * artWidth;
        const tY = coords.y * artHeight;
        const vertices: Vector2[] = [
            { x: tX, y: tY }, // top
            { x: tX - artWidth, y: tY + artHeight }, // left
            { x: tX, y: tY + (artHeight * 2) }, // bottom
            { x: tX + artWidth, y: tY + artHeight } // right
        ];

        return vertices;
    }

    static GetGridCoords(coords: Vector2): Vector2
    {
        const artHeight = BSCACHE.gridDpi / 2; // Height of the rectangle
        const artWidth = BSCACHE.gridType === "ISOMETRIC" ?
            artHeight / Math.tan(Math.PI / 6) :
            BSCACHE.gridDpi; // Width of the rectangle

        const normalizedX = coords.x + Math.abs(Math.floor(coords.x / artWidth)) * artWidth;
        const normalizedY = coords.y + Math.abs(Math.floor(coords.y / artHeight)) * artHeight;

        const gridX = Math.floor((coords.x + artWidth) / artWidth);
        const gridY = Math.floor(coords.y / artHeight);

        const localX = normalizedX % artWidth;
        const localY = normalizedY % artHeight;
        const evenMod = (gridX + gridY) % 2;

        // Determine the type of triangle detection to use
        const diagonalY = evenMod
            ? localX * (artHeight / artWidth)
            : -localX * (artHeight / artWidth) + artHeight;

        if (localY > diagonalY)
        {
            return (evenMod) ? { x: gridX - 1, y: gridY } : { x: gridX, y: gridY };
        }
        else
        {
            return (evenMod) ? { x: gridX, y: gridY - 1 } : { x: gridX - 1, y: gridY - 1 };
        }
    }
}