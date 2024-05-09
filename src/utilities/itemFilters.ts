import { Item } from "@owlbear-rodeo/sdk";
import { Constants } from "./bsConstants";
import { BSCACHE } from "./bsSceneCache";

function isBackgroundImage(item: Item)
{
    return item.layer == "MAP" && (item.metadata[`${Constants.EXTENSIONID}/isBackgroundImage`]
        || item.metadata[`${Constants.ARMINDOID}/isBackgroundImage`]);
}

function isVisionFog(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionFog`]
        || item.metadata[`${Constants.ARMINDOID}/isVisionFog`];
}

function isIndicatorRing(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`]
        || item.metadata[`${Constants.ARMINDOID}/isIndicatorRing`];
}

function isVisionLine(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionLine`]
        || item.metadata[`${Constants.ARMINDOID}/isVisionLine`];
}

function isActiveVisionLine(item: Item)
{
    return (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && !item.metadata[`${Constants.EXTENSIONID}/disabled`])
        || (item.metadata[`${Constants.ARMINDOID}/isVisionLine`] && !item.metadata[`${Constants.ARMINDOID}/disabled`]);
}

function isTokenWithVisionForUI(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP")
        && (item.metadata[`${Constants.EXTENSIONID}/hasVision`] || item.metadata[`${Constants.ARMINDOID}/hasVision`]);
}

function isTokenWithVision(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP")
        && (item.metadata[`${Constants.EXTENSIONID}/hasVision`] || item.metadata[`${Constants.ARMINDOID}/hasVision`])
        && !item.metadata[`${Constants.EXTENSIONID}/visionBlind`];
}

function isTokenWithVisionIOwn(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP") && item.createdUserId == BSCACHE.playerId
        && (item.metadata[`${Constants.EXTENSIONID}/hasVision`] || item.metadata[`${Constants.ARMINDOID}/hasVision`])
        && !item.metadata[`${Constants.EXTENSIONID}/visionBlind`];
}

function isBackgroundBorder(item: Item)
{
    return item.layer == "DRAWING"
        && (item.metadata[`${Constants.EXTENSIONID}/isBackgroundImage`] || item.metadata[`${Constants.ARMINDOID}/isBackgroundImage`]);
}

function isTrailingFog(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isTrailingFog`];
}

function isAnyFog(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isTrailingFog`]
        || item.metadata[`${Constants.EXTENSIONID}/isVisionFog`]
        || item.metadata[`${Constants.ARMINDOID}/isVisionFog`]
        || item.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`];
}

function isBrushSquare(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isBrushSquare`];
}

function isTorch(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/visionTorch`];
}

function isAutohide(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP") && !isTokenWithVisionForUI(item) && item.metadata[`${Constants.EXTENSIONID}/hasAutohide`] === true;
}

export { isBackgroundImage, isVisionFog, isVisionLine, isBrushSquare, isActiveVisionLine, isTokenWithVision, isBackgroundBorder, isIndicatorRing, isTokenWithVisionIOwn, isTokenWithVisionForUI, isTrailingFog, isAnyFog, isTorch, isAutohide };
