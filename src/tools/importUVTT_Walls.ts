import OBR, { Vector2, buildCurve, Curve } from "@owlbear-rodeo/sdk";
import simplify from "simplify-js";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetToolWidth } from "./visionToolUtilities";

export function ImportWalls(walls: Vector2[][], importDpi: number, dpiRatio: number, offset: number[]) 
{
    const lines: Curve[] = [];

    for (let i = 0; i < walls.length; i++)
    {
    let points: Vector2[] = [];
        let door = false;

        for (let j = 0; j < walls[i]?.length - 1; j++)
        {
            const sx = walls[i][j].x * importDpi, sy = walls[i][j].y * importDpi;
            const ex = walls[i][j + 1].x * importDpi, ey = walls[i][j + 1].y * importDpi;
            points.push({ x: sx * dpiRatio + offset[0], y: sy * dpiRatio + offset[1] });
            points.push({ x: ex * dpiRatio + offset[0], y: ey * dpiRatio + offset[1] });
        }

        // Too many points on this line, Simplify to ease burden
        if (points.length > 128)
        {
            const factor = 8;
            points = simplify(points, factor, false);
        }

        const line = buildCurve()
            .tension(0)
            .points(points)
            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
            .strokeWidth(GetToolWidth())
            .fillOpacity(0)
            .fillColor("#000000")
            .layer(Constants.LINELAYER)
            .name("Vision Line (Import)")
            .metadata({
                [`${Constants.EXTENSIONID}/isVisionLine`]: true,
                [`${Constants.EXTENSIONID}/blocking`]: true,
                [`${Constants.EXTENSIONID}/doubleSided`]: true
            })
            .closed(false)
            .visible(false)
            .locked(true)
            .build();

        if (door)
        {
            line.metadata[`${Constants.EXTENSIONID}/isDoor`] = true;
        }

        lines.push(line);
    }

    return lines;
}
