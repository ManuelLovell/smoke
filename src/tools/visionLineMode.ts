import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetSnappedCoordinates, GetToolWidth } from "./visionToolUtilities";

let interaction: [any, any] | [any] | null = null;

async function cleanUpPopovers(): Promise<void>
{
    await OBR.popover.close(Constants.LINETOOLID);
}

export async function cancelDrawing(): Promise<void>
{
    if (!interaction)
        return;

    const [_, stop] = interaction;
    stop();
    interaction = null;
    await cleanUpPopovers();
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
        line.layer = Constants.LINELAYER;
        line.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;
        line.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
        line.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
        line.points.pop();
    });
    if (line.points.length >= 2)
        await OBR.scene.items.addItems([line]);
    // Make sure we stop the interaction so others
    // can interact with our new line
    stop();
    interaction = null;

    await cleanUpPopovers();
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
            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
            .strokeWidth(GetToolWidth())
            .fillOpacity(0)
            .fillColor("#000000")
            .layer(Constants.LINELAYER)
            .name("Vision Line (Line)")
            .closed(false)
            .locked(true)
            .build();

        interaction = await OBR.interaction.startItemInteraction(line);

        const width = await OBR.viewport.getWidth();
        
        //Create Tooltip
        await OBR.popover.open({
            id: Constants.LINETOOLID,
            url: `/pages/line.html`,
            height: 75,
            width: 350,
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
    else if (event.key === "z")
    {
        undoLastPoint();
    }
}

export const lineMode = { onToolClick, onToolMove, onKeyDown };