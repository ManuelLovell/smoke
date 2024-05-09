import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { isTokenWithVision } from "./utilities/itemFilters";
import '/src/css/new-style.css'

OBR.onReady(async () =>
{
    const popover = document.getElementById('playerVisionList')!;
    const myId = await OBR.player.getId();
    const players = await OBR.party.getPlayers();
    const sceneItems = await OBR.scene.items.getItems();
    const visionItems = sceneItems.filter(item => isTokenWithVision(item));

    for (const player of players)
    {
        const tokensWithVision = visionItems.filter(x => x.createdUserId === myId);

        const listItem = document.createElement('li');
        const processed = player.metadata[`${Constants.EXTENSIONID}/processed`] === true;
        const good = "is fine.";

        const bad = tokensWithVision.length > 0 ? "has an Error or is still processing." : "has no Tokens with vision enabled.";

        listItem.innerHTML = `<b>${player.name}</b> ${processed ? good : bad}`;
        listItem.style.color = processed ? player.color : "red";
        popover.appendChild(listItem);
    }
});
