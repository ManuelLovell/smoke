import { Item } from "@owlbear-rodeo/sdk";
import { Constants } from "./bsConstants";
import { BSCACHE } from "./bsSceneCache";

function isIndicatorRing(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`];
}

function isDoor(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isDoor`];
}

function isVisionLine(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionLine`];
}

function isVisionLineAndEnabled(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && !item.metadata[`${Constants.EXTENSIONID}/disabled`];
}

function isLocalSpectre(item: Item)
{
    return item.metadata[`${Constants.SPECTREID}/isLocalSpectre`];
}

function isLocalVisionWall(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionWall`];
}

function isLocalVisionLight(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionLight`];
}

function isLocalPersistentLight(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isPersistentLight`];
}

function isLocalDecal(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isLocalDecal`];
}

function isDarkVision(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isDarkVision`];
}

function isTorch(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isTorch`];
}

function isActiveVisionLine(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && !item.metadata[`${Constants.EXTENSIONID}/disabled`];
}

function isTokenWithVision(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP")
        && item.metadata[`${Constants.EXTENSIONID}/hasVision`];
}

function isTokenWithVisionForUI(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP")
        && item.metadata[`${Constants.EXTENSIONID}/hasVision`];
}

function isTokenWithVisionIOwn(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP") && item.createdUserId == BSCACHE.playerId
        && item.metadata[`${Constants.EXTENSIONID}/hasVision`];
}

function isBrushSquare(item: Item)
{
    return item.metadata[`${Constants.EXTENSIONID}/isBrushSquare`];
}

function isAutohide(item: Item)
{
    return (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP") && !isTokenWithVisionForUI(item) && item.metadata[`${Constants.EXTENSIONID}/hasAutohide`] === true;
}

export { isDoor, isLocalDecal, isDarkVision, isLocalSpectre, isVisionLine, isLocalPersistentLight, isVisionLineAndEnabled, isLocalVisionWall, isLocalVisionLight, isBrushSquare, isActiveVisionLine, isTokenWithVision, isIndicatorRing, isTokenWithVisionIOwn, isTokenWithVisionForUI, isTorch, isAutohide };
