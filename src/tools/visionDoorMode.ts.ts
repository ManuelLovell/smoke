import OBR, { Curve, KeyEvent, Pointer, ToolContext, ToolEvent, Vector2, buildCurve, buildPointer } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { SplitLines } from "./visionToolUtilities";

let newSegment: Vector2[] = [];
let newPlaceholder: string = "";
let targetLine: string = "";
let interaction: [any, any] | [any] | null = null;
let stopProcess = false;
let createInteraction = false;

export async function cancelDrawing(): Promise<void>
{
    newSegment = [];
    targetLine = "";
    await OBR.scene.local.deleteItems([newPlaceholder]);
}

export async function finishDrawing(oldLine: Curve): Promise<void>
{
    const uniqueShape = (oldLine.position.x !== 0 && oldLine.position.y !== 0);
    const originalLine = uniqueShape ? adjustPoints(oldLine.points, oldLine.position, true) : oldLine.points;
    const newLines = SplitLines(originalLine, newSegment[0], newSegment[1], oldLine.rotation, oldLine.position);

    // Build New Line
    const newLinePackage: Curve[] = [];
    const line = buildCurve()
        .tension(0)
        .points(newLines.extracted)
        .strokeColor("red")
        .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
        .strokeWidth(parseInt(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as string) ?? Constants.DEFAULTLINEWIDTH)
        .fillOpacity(0)
        .fillColor("#000000")
        .layer(Constants.LINELAYER)
        .name("Vision Line (Line)")
        .metadata({
            [`${Constants.EXTENSIONID}/isVisionLine`]: true,
            [`${Constants.EXTENSIONID}/doubleSided`]: true,
            [`${Constants.EXTENSIONID}/blocking`]: true
        })
        .closed(false)
        .visible(false)
        .locked(true)
        .build();

    newLinePackage.push(line);
    for (const remainder of newLines.remaining)
    {
        const remainingLine = buildCurve()
            .tension(0)
            .position(oldLine.position)
            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
            .strokeWidth(parseInt(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as string) ?? Constants.DEFAULTLINEWIDTH)
            .fillOpacity(0)
            .rotation(oldLine.rotation)
            .fillColor("#000000")
            .layer(Constants.LINELAYER)
            .name("Vision Line (Line)")
            .metadata({
                [`${Constants.EXTENSIONID}/isVisionLine`]: true,
                [`${Constants.EXTENSIONID}/doubleSided`]: true,
                [`${Constants.EXTENSIONID}/blocking`]: true
            })
            .closed(false)
            .visible(false)
            .locked(true)
            .build();

        remainingLine.points = uniqueShape ? adjustPoints(remainder, oldLine.position, false) : remainder;

        newLinePackage.push(remainingLine);
    }

    await OBR.scene.items.deleteItems([oldLine.id]);
    await OBR.scene.items.addItems(newLinePackage);
    cancelDrawing();
}

async function onToolClick(_: ToolContext, event: ToolEvent): Promise<void>
{
    if (event.transformer) return;

    if (!event.target || (event.target.type !== "CURVE") || (targetLine !== "" && targetLine !== event.target.id)) return;

    targetLine = event.target.id;
    newSegment.push(event.pointerPosition);
    if (newSegment.length === 1)
    {
        const placeholder = GetPointer();
        placeholder.position = event.pointerPosition;
        newPlaceholder = placeholder.id;
        await OBR.scene.local.addItems([placeholder]);
    }

    if (newSegment.length === 2)
    {
        finishDrawing(event.target as Curve);
    }
}

async function onToolMove(_: ToolContext, event: ToolEvent)
{
    if (event.target && event.target.type === "CURVE" && (targetLine === "" || targetLine === event.target.id))
    {
        if (!stopProcess && !createInteraction)
        {
            if (!interaction)
            {
                createInteraction = true;
                interaction = await OBR.interaction.startItemInteraction(GetPointer());
            }
            // show circle on line
            const [update] = interaction;
            update((circle: Pointer) =>
            {
                circle.position = event.pointerPosition;
            });
            createInteraction = false;
        }
    }
    else if (interaction && (!event.target || (event.target && event.target.type !== "CURVE")))
    {
        const [_, stop] = interaction;
        stop();
        interaction = null;

        if (!stopProcess)
        {
            setTimeout(() =>
            {
                stopProcess = false;
            }, 50);
            stopProcess = true;
        }
    }
}

function onKeyDown(_: ToolContext, event: KeyEvent)
{
    if (event.key == "Escape")
    {
        cancelDrawing();
    }
}

function GetPointer(): Pointer
{
    const pointerSize = parseInt(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as string) ?? Constants.DEFAULTLINEWIDTH;
    const pointer = buildPointer()
        .color("red")
        .radius(pointerSize + 4)
        .disableHit(true)
        .build();
    return pointer;
}

function adjustPoints(points: Vector2[], adjustment: Vector2, add: boolean): Vector2[]
{
    return points.map(point => ({
        x: add ? point.x + adjustment.x : point.x - adjustment.x,
        y: add ? point.y + adjustment.y : point.y - adjustment.y
    }));
}
export const cutterMode = { onToolClick, onToolMove, onKeyDown };