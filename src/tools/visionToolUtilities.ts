import { ToolEvent, Vector2 } from "@owlbear-rodeo/sdk";
import { BSCACHE } from "../utilities/bsSceneCache";

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