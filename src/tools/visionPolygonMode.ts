import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetSnappedCoordinates } from "./visionToolUtilities";

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
        polygon.layer = "DRAWING";
        polygon.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;
        polygon.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
        polygon.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
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

export async function undoLastPoint(): Promise<void>
{
    if (!interaction)
        return;

    const [update] = interaction;
    update((line: Curve) =>
    {
        if (line.points.length > 2)
        {
            line.points.pop();
        }
    });
}

async function onToolClick(_J: ToolContext, event: ToolEvent)
{
    if (event.transformer) { return; }

    if (!interaction)
    {
        const snapped = GetSnappedCoordinates(event);
        const newPos = BSCACHE.snap ? snapped : event.pointerPosition;

        const polygon = buildCurve()
            .tension(0)
            .points([newPos, newPos])
            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
            .strokeWidth(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? DEFAULTWIDTH)
            .fillOpacity(.5)
            .fillColor("#000000")
            .layer("POINTER")
            .name("Vision Line (Polygon)")
            .locked(true)
            .build();

        interaction = await OBR.interaction.startItemInteraction(polygon);

        const width = await OBR.viewport.getWidth();

        //Create Tooltip
        await OBR.popover.open({
            id: Constants.POLYTOOLID,
            url: `/pages/polygon.html`,
            height: 75,
            width: 400,
            disableClickAway: true,
            hidePaper: true,
            anchorPosition: { top: 50, left: width / 2 },
            anchorReference: "POSITION",
            anchorOrigin: {
                vertical: "CENTER",
                horizontal: "CENTER",
            },
            transformOrigin: {
                vertical: "TOP",
                horizontal: "CENTER",
            },
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
    const snapped = GetSnappedCoordinates(event);
    update((polygon: Curve) =>
    {
        //polygon.points[polygon.points.length - 1] = event.pointerPosition;
        polygon.points[polygon.points.length - 1] = BSCACHE.snap ? snapped : event.pointerPosition;
        polygon.name = "Test";
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
    else if (event.key === "z")
    {
        undoLastPoint();
    }
}

export const polygonMode = { onToolClick, onToolMove, onKeyDown };