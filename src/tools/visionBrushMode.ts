import OBR, { Image, ItemFilter, ToolContext, ToolEvent, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { isBrushSquare } from "../utilities/itemFilters";
import { BSCACHE } from "../utilities/bsSceneCache";
import { SquareHelper } from './visionBrushSquareHelper';
import { HexagonHelper } from "./visionBrushHexagonHelper";
import { BrushLineGenerator } from "./visionBrushLineGenerator";
import { IsometricHelper } from "./visionBrushIsometricHelper";

let currentTrack: Vector2[] = [];

async function cleanUpPopovers()
{
    currentTrack = [];
    const oldSquares = await OBR.scene.local.getItems(isBrushSquare as ItemFilter<Image>);
    await OBR.scene.local.deleteItems(oldSquares.map(x => x.id));
    await OBR.popover.close(Constants.BRUSHTOOLID);
}

async function onDragStart(_: ToolContext, event: ToolEvent)
{
    switch (BSCACHE.gridType)
    {
        case "SQUARE":
            await SquareHelper.GetGridSquare(SquareHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "HEX_VERTICAL":
            await HexagonHelper.GetGridHexagon(HexagonHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "HEX_HORIZONTAL":
            await HexagonHelper.GetGridHexagon(HexagonHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "DIMETRIC":
            await IsometricHelper.GetGridIsometric(IsometricHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "ISOMETRIC":
            await IsometricHelper.GetGridIsometric(IsometricHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
    }
}

async function onActivate()
{
    const width = await OBR.viewport.getWidth();

    //Create Tooltip
    await OBR.popover.open({
        id: Constants.BRUSHTOOLID,
        url: `/pages/brush.html`,
        height: 80,
        width: 350,
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

async function onDeactivate()
{
    await OBR.popover.close(Constants.BRUSHTOOLID);
}

async function onDragMove(_: ToolContext, event: ToolEvent)
{
    switch (BSCACHE.gridType)
    {
        case "SQUARE":
            await SquareHelper.GetGridSquare(SquareHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "HEX_VERTICAL":
            await HexagonHelper.GetGridHexagon(HexagonHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "HEX_HORIZONTAL":
            await HexagonHelper.GetGridHexagon(HexagonHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "DIMETRIC":
            await IsometricHelper.GetGridIsometric(IsometricHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
        case "ISOMETRIC":
            await IsometricHelper.GetGridIsometric(IsometricHelper.GetGridCoords(event.pointerPosition), currentTrack);
            break;
    }
}

async function onDragEnd(_: ToolContext, _event: ToolEvent)
{
    await BrushLineGenerator.GenerateSmallLines(currentTrack);
    await cleanUpPopovers();
}

async function onDragCancel(_: ToolContext, _event: ToolEvent)
{
    await cleanUpPopovers();
}

export const brushMode = { onActivate, onDeactivate, onDragStart, onDragMove, onDragEnd, onDragCancel };