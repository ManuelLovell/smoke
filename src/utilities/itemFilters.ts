import { Image } from "@owlbear-rodeo/sdk";
import { Constants } from "./constants";
import { sceneCache } from "./globals";

function isBackgroundImage(item: Image)
{
    return item.layer == "MAP" && item.metadata[`${Constants.EXTENSIONID}/isBackgroundImage`];
}

function isVisionFog(item: Image)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionFog`];
}

function isIndicatorRing(item: Image)
{
    return item.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`];
}

function isVisionLine(item: Image)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionLine`];
}

function isActiveVisionLine(item: Image)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && !item.metadata[`${Constants.EXTENSIONID}/disabled`];
}

function isTokenWithVision(item: Image)
{
    return item.layer == "CHARACTER" && item.metadata[`${Constants.EXTENSIONID}/hasVision`];
}

function isTokenWithVisionIOwn(item: Image)
{
    return item.layer == "CHARACTER" && item.createdUserId == sceneCache.userId && item.metadata[`${Constants.EXTENSIONID}/hasVision`];
}

function isBackgroundBorder(item: Image)
{
    return item.layer == "DRAWING" && item.metadata[`${Constants.EXTENSIONID}/isBackgroundImage`];
}

export { isBackgroundImage, isVisionFog, isVisionLine, isActiveVisionLine, isTokenWithVision, isBackgroundBorder,isIndicatorRing, isTokenWithVisionIOwn };