import OBR, { Vector2, PathCommand, Command, buildPath } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";

export class SquareHelper
{
    static async GetGridSquare(trueCoords: Vector2, currentTrack: Vector2[])
    {
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

    static GetGridCoords(coords: Vector2)
    {
        return { x: Math.floor(coords.x / BSCACHE.gridDpi), y: Math.floor(coords.y / BSCACHE.gridDpi) };
    }
}