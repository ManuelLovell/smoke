import OBR, { Image, ItemFilter, ToolContext, ToolEvent, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "../helpers/BSConstants";
import { isBrushSquare } from "../helpers/ItemFilters";
import { BSCACHE } from "../helpers/BSCache";
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

export const brushMode = { onDragStart, onDragMove, onDragEnd, onDragCancel };