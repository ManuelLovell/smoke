import OBR from "@owlbear-rodeo/sdk";
import '/src/css/new-style.css'
import { Constants } from "./utilities/constants";

OBR.onReady(async () =>
{
    const popover = document.getElementById('list')!;

    const players = await OBR.party.getPlayers();
    for (const player of players)
    {
        const processed = player.metadata[`${Constants.EXTENSIONID}/processed`] === true;
        const good = "is fine.";
        const bad = "has an Error, has no Vision Enabled or is still processing.";

        const listItem = document.createElement('li');
        listItem.innerHTML = `<b>${player.name}</b> ${processed ? good : bad}`;
        listItem.style.color = processed ? "" : "red";
        popover.appendChild(listItem);
    }
});
