import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/constants";
import { sceneCache } from "../utilities/globals";

let interaction: [any, any] | [any] | null = null;
let finishLabelId = "";
let finishId = "";
let cancelId = "";
let cancelLabelId = "";

const DEFAULTCOLOR = "#000000";
const DEFAULTWIDTH = 8;
const DEFAULTSTROKE: number[] = [];

async function cleanUpPopovers()
{
    await OBR.scene.local.deleteItems([cancelLabelId, finishLabelId, finishId, cancelId]);
    finishLabelId = "";
    finishId = "";
    cancelLabelId = "";
    cancelId = "";
    await OBR.popover.close(Constants.POLYTOOLID);
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
        const finishLabel = buildLabel()
            .plainText("Finish [Enter]")
            .position({x: event.pointerPosition.x, y: event.pointerPosition.y - 50})
            .fillOpacity(.95)
            .backgroundOpacity(.5)
            .layer("POPOVER")
            .build();
            
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

        const finish = buildShape()
            .shapeType("CIRCLE")
            .strokeColor("#FFFFFF")
            .width(8)
            .height(8)
            .strokeWidth(2)
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
            .plainText("Cancel [Escape]")
            .position(event.pointerPosition)
            .fillOpacity(.95)
            .backgroundOpacity(.5)
            .layer("POPOVER")
            .pointerDirection("UP")
            .build();

        await OBR.scene.local.addItems([finishLabel, finish, cancel, cancelLabel]);
        finishLabelId = finishLabel.id;
        finishId = finish.id;
        cancelLabelId = cancelLabel.id;
        cancelId = cancel.id;

        //Create Tooltip
        await OBR.popover.open({
            id: Constants.POLYTOOLID,
            url: `/pages/polygon.html`,
            height: 40,
            width: 400,
            disableClickAway: true
        });
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