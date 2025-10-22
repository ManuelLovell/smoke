import { Curve, buildCurve, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetToolWidth } from "./visionToolUtilities";

export function ConvertDoorItem(uvttDoors: UVTTPortal[], importDpi: number, dpiRatio: number, offset: number[]): Curve[]
{
    const newItems: Curve[] = [];

    for (const uvttDoor of uvttDoors)
    {
    const newItemPaths: Vector2[] = [];
        for (const point of uvttDoor.bounds)
        {
            newItemPaths.push({
                x: (point.x * importDpi) * dpiRatio + offset[0],
                y: (point.y * importDpi) * dpiRatio + offset[1]
            });
        }
        const line = buildCurve()
            .tension(0)
            .points(newItemPaths)
            .strokeColor(Constants.DOORCOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
            .strokeWidth(GetToolWidth())
            .fillOpacity(0)
            .fillColor("#000000")
            .layer(Constants.LINELAYER)
            .name("Vision Line (Door)")
            .closed(false)
            .locked(true)
            .visible(false)
            .metadata({
                [`${Constants.EXTENSIONID}/isVisionLine`]: true,
                [`${Constants.EXTENSIONID}/blocking`]: true,
                [`${Constants.EXTENSIONID}/doubleSided`]: true,
                [`${Constants.EXTENSIONID}/isDoor`]: true
            })
            .build();

        if (!uvttDoor.closed)
        {
            line.metadata[`${Constants.EXTENSIONID}/disabled`] = true;
            line.metadata[`${Constants.EXTENSIONID}/doorOpen`] = true;
        }

        newItems.push(line);
    }
    return newItems;
}