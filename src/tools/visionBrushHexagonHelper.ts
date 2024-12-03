import OBR, { buildPath, Command, PathCommand, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";

export class HexagonHelper
{
    static async GetGridHexagon(trueCoords: Vector2, currentTrack: Vector2[])
    {
        // Check if already selected
        const inList = currentTrack.some((pos) => pos.x === trueCoords.x && pos.y === trueCoords.y);

        if (!inList)
        {
            const hexPath = HexagonHelper.CreateHexagonPath(trueCoords);

            const filledHexagon = buildPath().commands(hexPath).strokeOpacity(0).fillOpacity(.5).fillColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR).build();
            filledHexagon.metadata[`${Constants.EXTENSIONID}/isBrushSquare`] = true;
            filledHexagon.layer = "POINTER";

            // Add to tracking and scene
            currentTrack.push(trueCoords);
            await OBR.scene.local.addItems([filledHexagon]);
        }
    }

    static GetGridCoords(coords: Vector2)
    {
        if (BSCACHE.gridType === "HEX_HORIZONTAL")
        {
            const hexagonWidth = BSCACHE.gridDpi * Math.sqrt(3) / 2;

            const xx = Math.floor(coords.x / hexagonWidth);
            if (xx % 2)
            {
                return { x: xx, y: Math.floor((coords.y - (BSCACHE.gridDpi / 2)) / BSCACHE.gridDpi) };
            }
            else
            {
                return { x: xx, y: Math.floor(coords.y / BSCACHE.gridDpi) };
            }
        }
        else
        {
            const hexagonHeight = BSCACHE.gridDpi * Math.sqrt(3) / 2;

            const yy = Math.floor(coords.y / hexagonHeight);
            if (yy % 2)
            {
                return { x: Math.floor((coords.x - (BSCACHE.gridDpi / 2)) / BSCACHE.gridDpi), y: yy };
            }
            else
            {
                return { x: Math.floor(coords.x / BSCACHE.gridDpi), y: yy };
            }
        }
    }

    static CreateHexagonPath(coords: Vector2): PathCommand[]
    {
        const vertices = HexagonHelper.CalculateHexagonVertices(coords);

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

    static CalculateHexagonVertices(preCoords: Vector2): Vector2[]
    {
        if (BSCACHE.gridType === "HEX_HORIZONTAL")
        {
            let coords = preCoords;
            if (coords.x % 2)
            {
                coords = { x: coords.x, y: coords.y + 0.5 }
            }

            const vertices: Vector2[] = [];
            const hexagonWidth = BSCACHE.gridDpi * Math.sqrt(3) / 2;
            const calcDpi = BSCACHE.gridDpi / 1.7315;
            const shiftCoords = {
                x: (coords.x * hexagonWidth) + calcDpi,
                y: (coords.y * BSCACHE.gridDpi) + (BSCACHE.gridDpi / 2)
            };

            const angleStep = (Math.PI * 2) / 6; // 360 degrees divided by 6, converted to radians.

            for (let i = 0; i < 6; i++)
            {
                const angle = angleStep * i; // Current angle for the vertex.
                const vertexX = shiftCoords.x + calcDpi * Math.cos(angle);
                const vertexY = shiftCoords.y + calcDpi * Math.sin(angle);
                vertices.push({ x: vertexX, y: vertexY });
            }

            return vertices;
        }
        else
        {
            let coords = preCoords;
            if (coords.y % 2)
            { 
                coords = { y: coords.y, x: coords.x + 0.5 }
            }

            const vertices: Vector2[] = [];
            const hexagonHeight = BSCACHE.gridDpi * Math.sqrt(3) / 2;
            const calcDpi = BSCACHE.gridDpi / 1.7315;
            const shiftCoords = {
                y: (coords.y * hexagonHeight) + calcDpi,
                x: (coords.x * BSCACHE.gridDpi) + (BSCACHE.gridDpi / 2)
            };

            const angleStep = (Math.PI * 2) / 6; // 360 degrees divided by 6, converted to radians.

            for (let i = 0; i < 6; i++)
            {
                const angle = angleStep * i + Math.PI / 6; // Current angle for the vertex.
                const vertexX = shiftCoords.x + calcDpi * Math.cos(angle);
                const vertexY = shiftCoords.y + calcDpi * Math.sin(angle);
                vertices.push({ x: vertexX, y: vertexY });
            }

            return vertices;
        }
    }
}