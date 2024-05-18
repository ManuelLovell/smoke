import OBR, { Image, Item, Player } from "@owlbear-rodeo/sdk";
import * as Utilities from "./utilities/bsUtilities";
import { Constants } from "./utilities/bsConstants";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";
import { BSCACHE } from "./utilities/bsSceneCache";

class SpectreMain
{
    public debouncedLocalChanges;
    public debouncedBroadcastChanges;

    constructor()
    {
        this.debouncedBroadcastChanges = Utilities.Debounce(async (data: { data: any, connectionId: string }) =>
        {
            if (!data.data || data.data.length === 0) return;

            // Handle changes from other players updating here
            // Ghost packs are always going to be Image[]s, not supporting non images currently
            const ghosts = data.data as Image[];
            const ghostsForMe = BSCACHE.playerRole === "GM" ? ghosts : ghosts.filter(x => (x.metadata[`${Constants.SPECTREID}/viewers`] as string[]).includes(BSCACHE.playerId));

            const oldGhosts = BSCACHE.localGhosts.filter((item) => item.metadata[`${Constants.SPECTREID}/spectred`] === true) as Image[];
            const oldGhostsForMe = oldGhosts.filter(x => (x.metadata[`${Constants.SPECTREID}/viewers`] as string[]).includes(BSCACHE.playerId));

            // Add an analyzer here to compare important properties of BSCACHE.localGhosts and GHOSTS and array LENGTH
            const isEqual = Utilities.ImageArraysAreEqual(ghostsForMe, oldGhostsForMe);

            if (!isEqual)
            {
                const ghostIds = ghostsForMe.map(x => x.id);
                const changedGhosts: Image[] = [];
                const deletedGhosts: Image[] = BSCACHE.localGhosts.filter(localGhost => !ghostIds.includes(localGhost.id));

                for (const ghost of ghostsForMe)
                {
                    const foundLocalGhost = BSCACHE.localGhosts.find(x => x.id === ghost.id);
                    if (foundLocalGhost)
                    {
                        // If we found a match in our local, see if it's been updated and add as needed
                        const imagesEqual = Utilities.ImagesAreEqual(ghost, foundLocalGhost);
                        if (!imagesEqual) changedGhosts.push(ghost);
                    }
                    else
                    {
                        // If we didn't find a match, we don't have it, we need to add it
                        changedGhosts.push(ghost);
                    }
                }

                if (changedGhosts.length > 0) await OBR.scene.local.addItems(changedGhosts);
                if (deletedGhosts.length > 0) await OBR.scene.local.deleteItems(deletedGhosts.map(x => x.id));

                // Ghosts coming from a broadcast is a full updated, telling you to apply the changes
                // There's no need to adjust it, as it's not a result of you changing something
                // It's just the current state
                BSCACHE.localGhosts = ghosts;
            }
        }, 0);

        this.debouncedLocalChanges = Utilities.Debounce(async (localItems: Item[]) => 
        {
            if (BSCACHE.playerRole === "GM")
            {
                const ghostsForMe = localItems.filter((item) => item.metadata[`${Constants.SPECTREID}/spectred`] === true) as Image[];

                if (Utilities.ImageArraysAreEqual(BSCACHE.localGhosts, ghostsForMe)) return;

                BSCACHE.localGhosts = ghostsForMe;
                if (Utilities.isObjectOver14KB(ghostsForMe))
                {
                    await OBR.notification.show("You currently have too many Spectres in the scene. Unable to update.", "ERROR");
                }
                else
                {
                    await OBR.scene.setMetadata({ [`${Constants.SPECTREID}/current_spectres`]: ghostsForMe });
                    await OBR.broadcast.sendMessage(Constants.SPECTREBROADCASTID, ghostsForMe);
                }
            }
            else
            {
                // Filter down to any Spectre'd Items FOR YOU.
                const ghostsForMe = localItems.filter((item) => item.metadata[`${Constants.SPECTREID}/spectred`] === true) as Image[];
                const oldGhosts = BSCACHE.localGhosts.filter((item) => item.metadata[`${Constants.SPECTREID}/spectred`] === true) as Image[];
                const oldGhostsForMe = oldGhosts.filter(x => (x.metadata[`${Constants.SPECTREID}/viewers`] as string[]).includes(BSCACHE.playerId));

                if (ghostsForMe.length < oldGhostsForMe.length)
                {
                    const deletedIds = [];
                    for (const oldGhost of oldGhostsForMe)
                    {
                        const exists = ghostsForMe.includes(oldGhost);
                        if (!exists) deletedIds.push(oldGhost.id);
                    }
                    if (deletedIds.length > 0)
                    {
                        await OBR.broadcast.sendMessage("SPECTREDELETED", deletedIds);
                    }
                }

                // Only exit if there are no ghosts to update, and there were no ghosts before
                if (ghostsForMe.length === 0 && oldGhostsForMe.length === 0) return;
                // Or we can now also exit if this is a delete, as it's handled on a different thread
                if (ghostsForMe.length < oldGhostsForMe.length)
                {
                    BSCACHE.localGhosts = ghostsForMe;
                    return;
                }

                // Add an analyzer here to compare important properties of BSCACHE.localGhosts and GHOSTS and array LENGTH
                const isEqual = Utilities.ImageArraysAreEqual(ghostsForMe, oldGhostsForMe);

                if (!isEqual)
                {
                    Utilities.ApplyUpdatesToGhostArray(BSCACHE.localGhosts, ghostsForMe);

                    await OBR.broadcast.sendMessage(Constants.SPECTREBROADCASTID, BSCACHE.localGhosts);
                }
            }
        }, 0);
    }

    public SetupLocalSpecterHandlers(): void
    {
        if (!BSCACHE.sceneReady) return;

        // We are debouncing these to avoid hitting twice with update/deletes from synching with other players.
        // There might be an issue with slower connections, but in that case we would need to timestamp to find
        // Older updates coming later down the pipe..
        OBR.broadcast.onMessage(Constants.SPECTREBROADCASTID, (data) =>
        {
            this.debouncedBroadcastChanges(data);
        });

        if (BSCACHE.playerRole === "GM")
        {
            OBR.broadcast.onMessage("SPECTREDELETED", async (data) =>
            {
                const deletedIds = data.data as string[];
                if (deletedIds.length > 0)
                {
                    for (const tokenId of deletedIds)
                    {
                        const spectreUnitButton = document.getElementById(`tr-${tokenId}`) as HTMLInputElement;
                        spectreUnitButton.remove();
                    }
                    await OBR.scene.local.deleteItems(deletedIds);
                }
            });
        }
    }

    public async LoadSpectreSceneMetadata(): Promise<void>
    {
        // This will be triggered on load, it will pull the sceneMetadata
        // Grab the ghost list and check it's metadata to see if it's for this user
        BSCACHE.localGhosts = BSCACHE.sceneMetadata[`${Constants.SPECTREID}/current_spectres`] as Image[];
        if (!BSCACHE.localGhosts)
        {
            BSCACHE.localGhosts = [];
        }

        // Only use this for Players, the GM needs to setup the Controls
        const ghostsToAdd = [];

        for (const ghost of BSCACHE.localGhosts)
        {
            const viewers = ghost.metadata[`${Constants.SPECTREID}/viewers`] as string[];
            if (viewers.includes(BSCACHE.playerId) && BSCACHE.playerRole !== "GM")
            {
                ghostsToAdd.push(ghost);
            }
        }

        if (ghostsToAdd.length > 0)
            await OBR.scene.local.addItems(ghostsToAdd);
    }

    public UpdateSpectreTargets(): void
    {
        const existingSelects = document.querySelectorAll('.tSelects') as any;

        for (const tSelect of existingSelects)
        {
            if (tSelect && tSelect.tomselect)
            {
                // Access the TomSelect instance using .tomselect
                const tomSelectInstance = tSelect.tomselect as TomSelect;

                const newOptions = [];
                for (const player of BSCACHE.party)
                {
                    newOptions.push({ value: player.id, text: player.name });
                }

                tomSelectInstance.clearOptions();
                tomSelectInstance.addOption(newOptions);

                if (newOptions.length === 0)
                {
                    tomSelectInstance.settings.placeholder = "No Players Present";
                    tomSelectInstance.inputState();
                }
                else
                {
                    tomSelectInstance.settings.placeholder = "Choose..";
                    tomSelectInstance.inputState();
                }
            }
        }
    }

    public async SetupSpectreGM(): Promise<void>
    {
        await OBR.contextMenu.create({
            id: `${Constants.SPECTREID}/context-menu`,
            icons: [
                {
                    icon: "/ghost.svg",
                    label: "Spectre",
                    filter: {
                        every: [{ key: "type", value: "IMAGE" },
                        { key: ["metadata", `${Constants.SPECTREID}/spectred`], value: undefined, operator: "==", coordinator: "&&" }],
                    },
                }, {
                    icon: "/ghost.svg",
                    label: "Un-Spectre",
                    filter: {
                        every: [{ key: "type", value: "IMAGE" },
                        { key: ["metadata", `${Constants.SPECTREID}/spectred`], value: undefined, operator: "!=", coordinator: "&&" }],
                    },
                }
            ],
            async onClick(context)
            {
                const spectre = context.items.every(
                    (item) => item.metadata[`${Constants.SPECTREID}/spectred`] === undefined
                );

                if (spectre)
                {
                    if (Utilities.isObjectOver14KB(BSCACHE.localGhosts, context.items))
                    {
                        await OBR.notification.show("This would exceed the maximum Spectres. Please remove some before adding more.", "INFO");
                    }
                    else
                    {
                        for (const item of context.items)
                        {
                            const ghost = item as Image;
                            SPECTRE.SetupTomSelect(ghost);
                        }
                    }
                }
                else
                {
                    for (const item of context.items)
                    {
                        const ghost = item as Image;
                        await SPECTRE.RemoveGhost(ghost);
                        ghost.metadata[`${Constants.SPECTREID}/spectred`] = undefined;

                        const ghostIndex = BSCACHE.localGhosts.findIndex(x => x.id === ghost.id);
                        BSCACHE.localGhosts.splice(ghostIndex, 1);
                        const rowElement = document.getElementById(`tr-${ghost.id}`)!;
                        rowElement?.remove();


                        ghost.metadata[`${Constants.SPECTREID}/viewers`] = [];
                        await OBR.scene.items.addItems([ghost]);
                    }
                }
            }
        });
    }

    public async RestoreGhostsGM(): Promise<void>
    {
        BSCACHE.localGhosts = BSCACHE.sceneMetadata[`${Constants.SPECTREID}/current_spectres`] as Image[];
        if (!BSCACHE.localGhosts)
        {
            BSCACHE.localGhosts = [];
        }

        if (BSCACHE.localGhosts.length > 0)
        {
            await OBR.scene.local.addItems(BSCACHE.localGhosts);
            BSCACHE.localGhosts.forEach(ghost =>
            {
                this.SetupTomSelect(ghost);
            });
        }
    }

    async StoreGhost(ghost: Image)
    {
        let ghostData: Image[] = BSCACHE.sceneMetadata[`${Constants.SPECTREID}/current_spectres`] as Image[];
        if (!ghostData)
        {
            ghostData = [ghost];
        }
        else
        {
            const exists = ghostData.find(old => old.id === ghost.id);
            if (exists) return;
            ghostData.push(ghost);
        }
        await OBR.scene.setMetadata({ [`${Constants.SPECTREID}/current_spectres`]: ghostData });
    }

    async RemoveGhost(ghost: Image)
    {
        let ghostData: Image[] = BSCACHE.sceneMetadata[`${Constants.SPECTREID}/current_spectres`] as Image[];
        if (!ghostData)
        {
            ghostData = [];
        }
        const newData = ghostData.filter(bad => bad.id !== ghost.id);

        await OBR.scene.local.deleteItems([ghost.id]);
        await OBR.scene.setMetadata({ [`${Constants.SPECTREID}/current_spectres`]: newData });
    }

    async SetupTomSelect(ghost: Image)
    {
        const name = ghost.text?.plainText || ghost.name;
        let currentViewers = ghost.metadata[`${Constants.SPECTREID}/viewers`] as [];

        ghost.metadata[`${Constants.SPECTREID}/spectred`] = true;

        if (currentViewers === undefined)
        {
            currentViewers = [];
            ghost.metadata[`${Constants.SPECTREID}/viewers`] = [];
        }

        // Recreate as a local item
        await OBR.scene.items.deleteItems([ghost.id]);
        await OBR.scene.local.addItems([ghost]);
        await this.StoreGhost(ghost);
        BSCACHE.localGhosts.push(ghost);

        const table = document.getElementById("ghostList")! as HTMLDivElement;
        const newTr = document.createElement("tr");
        newTr.id = `tr-${ghost.id}`;
        newTr.className = "ghost-table-entry";
        newTr.innerHTML = `<td class="token-name">${name}</td>
            <td><select id="select-${ghost.id}" class="tSelects" multiple autocomplete="off" /></td>
            <td><input type="button" class="mysteryButton" id="deleteGhost-${ghost.id}" value="Delete"/></td>`;

        table.appendChild(newTr);

        const selectButton = document.getElementById(`select-${ghost.id}`) as HTMLSelectElement;

        for (const player of BSCACHE.party)
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
            placeholder: BSCACHE.party.length == 0 ? "No Players Present" : "Choose..",
            maxItems: null,
            create: false,
            onDelete: async function (id: string, element: any) 
            {
                // Sooo fucking hacky
                const ghostId = element.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.id.slice(3);

                // Dereference from values or it'll mess up the control
                await OBR.scene.local.updateItems([ghostId], ghosties =>
                {
                    const metadata = ghosties[0].metadata[`${Constants.SPECTREID}/viewers`] as string[];
                    const index = metadata.findIndex(x => x == id);
                    metadata.splice(index, 1);
                    ghosties[0].metadata[`${Constants.SPECTREID}/viewers`] = metadata;
                });
            },
            onItemAdd: async function (playerId: string, element: any) 
            {
                // So fucking hacky
                const ghostId = element.parentElement.parentElement.parentElement.parentElement.id.slice(3);

                await OBR.scene.local.updateItems([ghostId], ghosties =>
                {
                    const metadata = ghosties[0].metadata[`${Constants.SPECTREID}/viewers`] as string[];
                    if (metadata)
                    {
                        metadata.push(playerId);
                        ghosties[0].metadata[`${Constants.SPECTREID}/viewers`] = metadata;
                    }
                    else
                    {
                        ghosties[0].metadata[`${Constants.SPECTREID}/viewers`] = [playerId];
                    }
                });
            }
        };

        // Needed
        const ghostSelect = new TomSelect(`#select-${ghost.id}`, settings);
        if (currentViewers.length > 0)
        {
            for (const playerId of currentViewers)
            {
                const playerInRoom = BSCACHE.party.find(x => x.id === playerId);
                if (!playerInRoom)
                {
                    const userInfo = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${playerId}`] as Player;
                    const newOptions = [];
                    newOptions.push({ value: playerId, text: userInfo.name });
                    ghostSelect.addOption(newOptions);
                }
                ghostSelect.addItem(playerId, true);
            }
        }

        const deleteButton = document.getElementById(`deleteGhost-${ghost.id}`) as HTMLInputElement;
        deleteButton.onclick = async () =>
        {
            const ghostIndex = BSCACHE.localGhosts.findIndex(x => x.id === ghost.id);
            BSCACHE.localGhosts.splice(ghostIndex, 1);
            newTr.remove();
            await OBR.scene.local.updateItems([ghost.id], ghosties =>
            {
                if (ghosties[0])
                {
                    ghosties[0].metadata[`${Constants.SPECTREID}/viewers`] = [];
                }
            });
            await this.RemoveGhost(ghost);
        };
    }

    public ClearGhostList(): void
    {
        const table = document.getElementById("ghostList")! as HTMLDivElement;
        if (table) table.innerHTML = "";
    }
}

export const SPECTRE = new SpectreMain();