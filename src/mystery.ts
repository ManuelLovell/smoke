import OBR, { Image, Metadata, Player } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/constants";
import { sceneCache } from './utilities/globals';
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";

export async function RunSpectre(players: Player[]): Promise<void>
{
    const localGhosts = await OBR.scene.local.getItems(
        (item): item is Image => item.layer === "CHARACTER");
    const localIds = localGhosts.map(x => x.id);

    // This should only trigger on the GM, whomever that is
    for (const player of players)
    {
        // For each player, take the package.
        const ghostPackage = player.metadata[`${Constants.EXTENSIONID}/metadata_ghosts`] as GhostPackage;
        if (ghostPackage && ghostPackage.ghostViews && ghostPackage.ghostViews.length > 0)
        {
            for (const ghost of ghostPackage.ghostViews)
            {
                // For each ghost in the package, check it's viewers to see if they're on it
                const forMe = ghost.viewers.includes(sceneCache.userId);
                if (forMe)
                {
                    // If it's for this player, find the relevant item and add to scene.
                    const ghostToken = ghostPackage.ghostItems.find(x => x.id === ghost.ghost) as Image;
                    await OBR.scene.local.addItems([ghostToken]);
                }
            }
        }
        
        if (ghostPackage && ghostPackage.ghostViews && ghostPackage.ghostViews.length == 0 && localIds.length > 0)
        {
            // If the ghostPackage is empty, but our local ids aren't - flush it
            await OBR.scene.local.deleteItems(localIds);
        }

    }
}

// For the GM
export async function SetupSpectreGM(): Promise<void>
{
    OBR.scene.local.onChange(async (localItems) =>
    {
        const ghosts = localItems.filter(x => x.layer == "CHARACTER");
        if (ghosts.length === 0) return;

        const metadataGhostList: Metadata = {};
        const ghostPackage: GhostPackage = { ghostItems: ghosts, ghostViews: sceneCache.ghostViewers };

        metadataGhostList[`${Constants.EXTENSIONID}/metadata_ghosts`] = ghostPackage;
        await OBR.player.setMetadata(metadataGhostList);
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/context-menu`,
        icons: [
            {
                icon: "/ghost.svg",
                label: "Mystify Item",
                filter: {
                    min: 1,
                    max: 1,
                    every: [{ key: "layer", value: "CHARACTER" }],
                },
            },
        ],
        async onClick(context)
        {
            // Do something to this icon to designate it as a 'Ghost'
            const ghost = context.items[0] as Image;
            const name = ghost.text?.plainText || ghost.name;

            // Recreate as a local item
            await OBR.scene.items.deleteItems([ghost.id]);
            await OBR.scene.local.addItems([ghost]);
            sceneCache.ghosts.push(ghost);

            const table = document.getElementById("ghostList")! as HTMLDivElement;
            const newTr = document.createElement("tr");
            newTr.id = `tr-${ghost.id}`;
            newTr.className = "ghost-table-entry";
            newTr.innerHTML = `<td class="token-name">${name}</td>
            <td><select id="select-${ghost.id}" multiple autocomplete="off" /></td>
            <td>&nbsp;&nbsp;&nbsp<input type="button" class="mysteryButton" id="deleteGhost-${ghost.id}" value="Delete"/></td>`;

            table.appendChild(newTr);

            const selectButton = document.getElementById(`select-${ghost.id}`) as HTMLSelectElement;

            for (const player of sceneCache.players)
            {
                const option = document.createElement('option');
                option.value = player.id;
                option.text = player.name;
                selectButton.appendChild(option);
            }

            const settings = {
                plugins: {
                    remove_button: {
                        title: 'Remove this item',
                    }
                },
                allowEmptyOption: true,
                placeholder: "Choose..",
                maxItems: null,
                create: false,
                onDelete: async function (value: string) 
                {
                    const exists = sceneCache.ghostViewers.find(gv => gv.ghost === ghost.id);
                    const remove = exists?.viewers.indexOf(value);
                    if (remove) exists?.viewers.splice(remove, 1);
                },
                onItemAdd: async function (value: string)
                {
                    const exists = sceneCache.ghostViewers.find(gv => gv.ghost === ghost.id)
                    if (exists)
                    {
                        exists.viewers.push(value);
                    }
                    else
                    {
                        const newghost: GhostView = { ghost: ghost.id, viewers: [value] };
                        sceneCache.ghostViewers.push(newghost);
                    }
                    await OBR.scene.local.updateItems([ghost.id], items =>
                    {
                        items[0].metadata[`${Constants.EXTENSIONID}/localtrigger`] = new Date();
                    });
                }
            };

            new TomSelect(`#select-${ghost.id}`, settings);

            const deleteButton = document.getElementById(`deleteGhost-${ghost.id}`) as HTMLInputElement;
            deleteButton.onclick = async () =>
            {
                const ghostIndex = sceneCache.ghosts.findIndex(x => x.id === ghost.id);
                sceneCache.ghosts.splice(ghostIndex, 1);
                newTr.remove();
                await OBR.scene.local.deleteItems([ghost.id]);
            };
        }
    });
}