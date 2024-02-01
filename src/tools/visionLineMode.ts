import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/constants";
import { sceneCache } from "../utilities/globals";

let interaction: [any, any] | [any] | null = null;

const DEFAULTCOLOR = "#000000";
const DEFAULTWIDTH = 8;
const DEFAULTSTROKE: number[] = [];

async function cleanUpPopovers(): Promise<void>
{
    await OBR.popover.close(Constants.LINETOOLID);
    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/finishLine`]: false });
}

export async function cancelDrawing(): Promise<void>
{
    if (!interaction)
        return;

    const [_, stop] = interaction;
    stop();
    interaction = null;
    await cleanUpPopovers();
    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/cancelLine`]: false });
}

export async function finishDrawing(): Promise<void>
{
    if (!interaction)
        return;

    const [update, stop] = interaction;
    // Add the line to the scene
    const line = update((line: Curve) =>
    {
        line.visible = false;
        line.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;
        line.points.pop();
    });
    if (line.points.length >= 2)
        await OBR.scene.items.addItems([line]);
    // Make sure we stop the interaction so others
    // can interact with our new line
    stop();
    interaction = null;

    await cleanUpPopovers();
    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/finishLine`]: false });
}

async function onToolClick(_: ToolContext, event: ToolEvent): Promise<void>
{
    if (event.transformer)
        return;
    if (!interaction)
    {
        const toBuild = [];

        const line = buildCurve()
            .tension(0)
            .points([event.pointerPosition, event.pointerPosition])
            .strokeColor(sceneCache.metadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
            .strokeDash(sceneCache.metadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
            .strokeWidth(sceneCache.metadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? DEFAULTWIDTH)
            .fillOpacity(0)
            .fillColor("#000000")
            .layer("DRAWING")
            .name("Vision Line (Line)")
            .closed(false)
            .build();

        interaction = await OBR.interaction.startItemInteraction(line);

        //Create Tooltip
        await OBR.popover.open({
            id: Constants.LINETOOLID,
            url: `/pages/line.html`,
            height: 70,
            width: 350,
            disableClickAway: true
        });
    }
    else
    {
        const [update] = interaction;
        update((line: Curve) =>
        {
            line.points.push(event.pointerPosition);
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

    update((line: Curve) =>
    {
        line.points[line.points.length - 1] = sceneCache.snap ? { x: snapPositionX, y: snapPositionY } : event.pointerPosition;
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

export const lineMode = { onToolClick, onToolMove, onKeyDown };