import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/constants";

let interaction: [any, any] | [any] | null = null;
let finishLabelId = "";
let finishId = "";
let cancelId = "";
let cancelLabelId = "";

async function cleanUpPopovers()
{
    await OBR.scene.local.deleteItems([cancelLabelId, finishLabelId, finishId, cancelId]);
    finishLabelId = "";
    finishId = "";
    cancelLabelId = "";
    cancelId = "";
}

async function cancelDrawing()
{
    if (!interaction)
        return;

    const [_, stop] = interaction;
    stop();
    interaction = null;
    cleanUpPopovers();
}

async function finishDrawing()
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
        OBR.scene.items.addItems([polygon]);
    // Make sure we stop the interaction so others
    // can interact with our new polygon
    stop();
    interaction = null;
    cleanUpPopovers();
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
            .fillColor("#000000")
            .strokeColor("#000000")
            .layer("DRAWING")
            .name("Vision Line (Polygon)")
            .build();
        interaction = await OBR.interaction.startItemInteraction(polygon);

        const finish = buildShape()
            .shapeType("CIRCLE")
            .strokeColor("#FFFFFF")
            .width(8)
            .height(8)
            .strokeWidth(2)
            .position(event.pointerPosition)
            .layer("POPOVER")
            .build();
        const finishLabel = buildLabel()
            .plainText("Finish")
            .position(event.pointerPosition)
            .layer("POPOVER")
            .build();

        const cancel = buildShape()
            .shapeType("CIRCLE")
            .strokeColor("#FFFFFF")
            .width(8)
            .height(8)
            .strokeWidth(2)
            .position(event.pointerPosition)
            .layer("POPOVER")
            .visible(false)
            .build();
        const cancelLabel = buildLabel()
            .plainText("Cancel")
            .position(event.pointerPosition)
            .layer("POPOVER")
            .pointerDirection("UP")
            .build();

        await OBR.scene.local.addItems([finishLabel, finish, cancel, cancelLabel]);
        finishLabelId = finishLabel.id;
        finishId = finish.id;
        cancelLabelId = cancelLabel.id;
        cancelId = cancel.id;
    }
    else
    {
        if (event.target && (event.target.id === finishLabelId || event.target.id === finishId))
            finishDrawing();
        else if (event.target && (event.target.id === cancelLabelId || event.target.id === cancelId))
            cancelDrawing();
        else
        {
            const [update] = interaction;
            update((polygon: Curve) =>
            {
                polygon.points.push(event.pointerPosition);
            });
        }
    }
}

function onToolMove(_: ToolContext, event: ToolEvent)
{
    if (!interaction || event.transformer)
        return;

    // Update the end position of the interaction when the tool moves
    const [update] = interaction;
    update((polygon: Curve) =>
    {
        polygon.points[polygon.points.length - 1] = event.pointerPosition;
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