import OBR, { Curve, KeyEvent, Tool, ToolContext, ToolEvent, buildCurve, buildLabel, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetSnappedCoordinates } from "./visionToolUtilities";

let interaction: [any, any] | [any] | null = null;

const DEFAULTWIDTH = 8;
const DEFAULTSTROKE: number[] = [];

async function cleanUp()
{
    await OBR.popover.close(Constants.ELEVATIONTOOLID);
}

export async function cancelDrawing()
{
    if (!interaction)
        return;

    const [_, stop] = interaction;
    stop();
    interaction = null;

    cleanUp();
}

export async function finishDrawing()
{
    if (!interaction)
        return;

    const [update, stop] = interaction;
    // Add the mappyGon to the scene
    const mappyGon = update((mappyGon: Curve) =>
    {
        mappyGon.visible = false;
        mappyGon.points.pop();
        mappyGon.points.push(mappyGon.points[0]);
    });

    if (mappyGon.points.length >= 4)
    {
        await OBR.scene.local.addItems([mappyGon]);

        let currentElevationData = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationMapping`] as ElevationMap[];
        if (!currentElevationData) currentElevationData = [];

        const depth = mappyGon.metadata[`${Constants.EXTENSIONID}/elevation`] as number ?? 0;
        const newMap: ElevationMap = { Points: mappyGon.points, Depth: depth };
        currentElevationData.push(newMap);

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/elevationMapping`]: currentElevationData });
    }

    stop();
    interaction = null;
    cleanUp();
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

async function onToolClick(_J: ToolContext, event: ToolEvent, depth: number)
{
    if (event.transformer) { return; }

    if (event.ctrlKey)
    {
        return true;
    }

    if (!interaction)
    {
        const snapped = GetSnappedCoordinates(event);
        const newPos = BSCACHE.snap ? snapped : event.pointerPosition;

        const mappyGon = buildCurve()
            .tension(0)
            .points([newPos, newPos])
            .strokeColor(GetStrokeColor(depth))
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
            .strokeWidth(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? DEFAULTWIDTH)
            .fillOpacity(.5)
            .fillColor(GetFillColor(depth))
            .layer("DRAWING")
            .metadata({ [`${Constants.EXTENSIONID}/elevation`]: depth })
            .name(`Elevation-${depth} Area`)
            .zIndex(depth)
            .locked(true)
            .build();

        interaction = await OBR.interaction.startItemInteraction(mappyGon);

        const width = await OBR.viewport.getWidth();

        //Create Tooltip
        await OBR.popover.open({
            id: Constants.ELEVATIONTOOLID,
            url: `/pages/elevation.html`,
            height: 110,
            width: 360,
            disableClickAway: true,
            anchorPosition: { top: 60, left: width / 2 },
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
        update((mappyGon: Curve) =>
        {
            mappyGon.points.push(event.pointerPosition);
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
    update((mappyGon: Curve) =>
    {
        //mappyGon.points[mappyGon.points.length - 1] = event.pointerPosition;
        mappyGon.points[mappyGon.points.length - 1] = BSCACHE.snap ? snapped : event.pointerPosition;
    });
}

function onKeyDown(_: ToolContext, event: KeyEvent, depth: number)
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

async function enterEditMode(context: ToolContext)
{
    const visionOn = context.metadata[`${Constants.EXTENSIONID}/elevationEditor`] as boolean ?? false;
    await OBR.tool.setMetadata(`${Constants.EXTENSIONID}/vision-tool`,
        {
            [`${Constants.EXTENSIONID}/elevationEditor`]: !visionOn
        });
    if (visionOn)
    {
        await Deactivate(context);
    }
    else
    {
        await Activate(context);
    }
}

async function Activate(_: ToolContext)
{
    const sceneData = await OBR.scene.getMetadata();
    const currentElevationData = sceneData[`${Constants.EXTENSIONID}/elevationMapping`] as ElevationMap[] ?? [];

    if (currentElevationData && currentElevationData.length > 0)
    {
        const toDraw: Curve[] = [];
        for (const map of currentElevationData)
        {
            const mappyGon = buildCurve()
                .tension(0)
                .points(map.Points)
                .strokeColor(GetStrokeColor(map.Depth))
                .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
                .strokeWidth(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? DEFAULTWIDTH)
                .fillOpacity(.5)
                .fillColor(GetFillColor(map.Depth))
                .layer("DRAWING")
                .name(`Elevation-${1} Area`)
                .locked(true)
                .visible(false)
                .metadata({ [`${Constants.EXTENSIONID}/elevation`]: map.Depth })
                .zIndex(map.Depth)
                .build();
            toDraw.push(mappyGon);
        }
        await OBR.scene.local.addItems(toDraw);
    }
}

async function Deactivate(_: ToolContext)
{
    const toCleanUp = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/elevation`] !== undefined) as Curve[];
    if (toCleanUp.length > 0)
    {
        const newSave = [];
        for (const line of toCleanUp)
        {
            let adjustedPoints = line.points;

            // Adjust points if line position is not (0, 0)
            if (line.position.x !== 0 || line.position.y !== 0)
            {
                adjustedPoints = line.points.map(point =>
                {
                    const newX = (point.x + line.position.x);
                    const newY = (point.y + line.position.y);
                    return { x: newX, y: newY };
                });
            }

            const newMapping: ElevationMap = { Points: adjustedPoints, Depth: line.metadata[`${Constants.EXTENSIONID}/elevation`] as number ?? 0 };
            newSave.push(newMapping);
        }

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/elevationMapping`]: newSave });
        await OBR.scene.local.deleteItems(toCleanUp.map(x => x.id));
    }
    else
    {
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/elevationMapping`]: [] });
    }
}

function GetStrokeColor(depth: number)
{
    switch (depth)
    {
        case 1:
            return "#6454ac";
        case 2:
            return "#029658";
        case 3:
            return "#fcd444";
        case 4:
            return "#fc6404";
        case 5:
            return "#ff0000";
        default:
            return "#000000";
    }
}

function GetFillColor(depth: number)
{
    switch (depth)
    {
        case 1:
            return "#6454ac4F";
        case 2:
            return "#0296584F";
        case 3:
            return "#fcd4444F";
        case 4:
            return "#fc64044F";
        case 5:
            return "#ff00004F";
        default:
            return "#0000004F";
    }
}

export const elevationMode = { onToolClick, onToolMove, onKeyDown, enterEditMode, cancelDrawing };