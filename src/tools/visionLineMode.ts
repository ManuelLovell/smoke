import OBR, { Curve, KeyEvent, ToolContext, ToolEvent, buildCurve, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/constants";
import { sceneCache } from "../utilities/globals";

let interaction: [any, any] | [any] | null = null;
let finishLabelId = "";
let finishId = "";
let cancelId = "";
let cancelLabelId = "";

async function cleanUpPopovers(): Promise<void>
{
    await OBR.scene.local.deleteItems([cancelLabelId, finishLabelId, finishId, cancelId]);
    finishLabelId = "";
    finishId = "";
    cancelLabelId = "";
    cancelId = "";
    await OBR.popover.close(Constants.LINETOOLID);
}

async function cancelDrawing(): Promise<void>
{
    if (!interaction)
        return;

    const [_, stop] = interaction;
    stop();
    interaction = null;
    await cleanUpPopovers();
}

async function finishDrawing(): Promise<void>
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
}

async function onToolClick(_: ToolContext, event: ToolEvent): Promise<void>
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

        const line = buildCurve()
            .tension(0)
            .points([event.pointerPosition, event.pointerPosition])
            .fillColor("#000000")
            .fillOpacity(0)
            .layer("DRAWING")
            .name("Vision Line (Line)")
            .closed(false)
            .build();

        interaction = await OBR.interaction.startItemInteraction(line);

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
            id: Constants.LINETOOLID,
            url: `/pages/line.html`,
            height: 40,
            width: 400,
            disableClickAway: true
        });
    }
    else
    {
        if (event.target && (event.target.id === finishLabelId || event.target.id === finishId))
            await finishDrawing();
        else if (event.target && (event.target.id === cancelLabelId || event.target.id === cancelId))
            await cancelDrawing();
        else
        {
            const [update] = interaction;
            //let newPos = await OBR.scene.grid.snapPosition(event.pointerPosition, undefined, true);
            update((line: Curve) =>
            {
                //line.points.push(newPos);
                line.points.push(event.pointerPosition);
            });

            await OBR.scene.local.updateItems(item => item.id == finishId || item.id == finishLabelId, items =>
            {
                for (const item of items)
                {
                    item.position = event.pointerPosition;
                }
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

    update((line: Curve) =>
    {
        line.points[line.points.length - 1] = { x: snapPositionX, y: snapPositionY };
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