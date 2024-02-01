import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/constants";
import { sceneCache } from "../utilities/globals";

/// There's a bug in here with OBR interaction API, on the player view when
/// finishing an object it throws an error because the point is supposedly undefined.

let interaction: [any, any] | [any] | null = null;

const DEFAULTCOLOR = "#000000";
const DEFAULTWIDTH = 8;
const DEFAULTSTROKE: number[] = [];

async function cleanUpPopovers()
{
    await OBR.popover.close(Constants.POLYTOOLID);
}

export async function cancelDrawing()
{
    if (!interaction)
        return;

    const [_, stop] = interaction;
    stop();
    interaction = null;
    cleanUpPopovers();
    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/cancelPoly`]: false });
}

export async function finishDrawing()
{
    if (!interaction)
        return;

    const [update, stop] = interaction;
    // Add the polygon to the scene
    const polygon = update((polygon: Curve) =>
    {
        polygon.visible = false;
        polygon.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;
        polygon.points.pop();
        polygon.points.push(polygon.points[0]);
    });
    if (polygon.points.length >= 4)
        await OBR.scene.items.addItems([polygon]);
    // Make sure we stop the interaction so others
    // can interact with our new polygon
    stop();
    interaction = null;
    cleanUpPopovers();
    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/finishPoly`]: false });
}

async function onToolClick(_J: ToolContext, event: ToolEvent)
{
    if (event.transformer)
        return;
    if (!interaction)
    {
        const polygon = buildCurve()
            .tension(0)
            .points([event.pointerPosition, event.pointerPosition])
            .strokeColor(sceneCache.metadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
            .strokeDash(sceneCache.metadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
            .strokeWidth(sceneCache.metadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? DEFAULTWIDTH)
            .fillOpacity(.5)
            .fillColor("#000000")
            .layer("DRAWING")
            .name("Vision Line (Polygon)")
            .build();

        interaction = await OBR.interaction.startItemInteraction(polygon);

        //Create Tooltip
        await OBR.popover.open({
            id: Constants.POLYTOOLID,
            url: `/pages/polygon.html`,
            height: 70,
            width: 350,
            disableClickAway: true
        });
    }
    else
    {
        const [update] = interaction;
        update((polygon: Curve) =>
        {
            polygon.points.push(event.pointerPosition);
        });
    }
}

function onToolMove(_: ToolContext, event: ToolEvent)
{
    if (!interaction || event.transformer)
        return;

    // Update the end position of the interaction when the tool moves

    const [update] = interaction;
    // Snap to the grid with light sensitivity
    const snapVar = Math.round(sceneCache.gridDpi / sceneCache.gridSnap);
    const nearGridX = Math.round(event.pointerPosition.x / sceneCache.gridDpi) * sceneCache.gridDpi;
    const nearGridY = Math.round(event.pointerPosition.y / sceneCache.gridDpi) * sceneCache.gridDpi;
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
    update((polygon: Curve) =>
    {
        //polygon.points[polygon.points.length - 1] = event.pointerPosition;
        polygon.points[polygon.points.length - 1] = sceneCache.snap ? { x: snapPositionX, y: snapPositionY } : event.pointerPosition;
    });
}

function onKeyDown(_: ToolContext, event: KeyEvent)
{
    if (!interaction)
        return;
    if (event.key == "Escape")
    {
        cancelDrawing();
    }
    else if (event.key == "Enter")
    {
        finishDrawing();
    }
}

export const polygonMode = { onToolClick, onToolMove, onKeyDown };