import OBR from "@owlbear-rodeo/sdk";
import '/src/css/new-style.css'
import { Constants } from "./utilities/constants";
import { sceneCache } from "./utilities/globals";
import { isTokenWithVision } from "./utilities/itemFilters";

OBR.onReady(async () =>
{
    const popover = document.getElementById('list')!;
    const players = await OBR.party.getPlayers();
    const visionItems = sceneCache.items.filter(item => isTokenWithVision(item));

    for (const player of players)
    {
        const tokensWithVision = visionItems.filter(x => x.createdUserId === sceneCache.userId);

        const listItem = document.createElement('li');
        const processed = player.metadata[`${Constants.EXTENSIONID}/processed`] === true;
        const good = "is fine.";

        const bad = tokensWithVision.length > 0 ? "has an Error or is still processing." : "has no Tokens with vision enabled.";

        listItem.innerHTML = `<b>${player.name}</b> ${processed ? good : bad}`;
        listItem.style.color = processed ? "" : "red";
        popover.appendChild(listItem);
    }
});
