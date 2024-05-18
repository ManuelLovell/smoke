import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetSnappedCoordinates } from "./visionToolUtilities";

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
    if (event.transformer) { return; }

    if (!interaction)
    {
        const snapped = GetSnappedCoordinates(event);
        const newPos = BSCACHE.snap ? snapped : event.pointerPosition;

        const line = buildCurve()
            .tension(0)
            .points([newPos, newPos])
            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
            .strokeWidth(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? DEFAULTWIDTH)
            .fillOpacity(0)
            .fillColor("#000000")
            .layer("DRAWING")
            .name("Vision Line (Line)")
            .closed(false)
            .locked(true)
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
    const snapped = GetSnappedCoordinates(event);

    update((line: Curve) =>
    {
        line.points[line.points.length - 1] = BSCACHE.snap ? snapped : event.pointerPosition;
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