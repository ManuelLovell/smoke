import OBR, { Image, Metadata, Player } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/constants";
import { sceneCache } from './utilities/globals';
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";

export async function RunSpectre(players: Player[]): Promise<void>
{
    if (!sceneCache.ready) return;

    const localGhosts = await OBR.scene.local.getItems(
        (item): item is Image => item.layer === "CHARACTER");
    const localIds = localGhosts?.map(x => x.id);
    let foundghost = false;

    // This should only trigger on the GM, whomever that is
    for (const player of players)
    {
        // For the GM, take the package.
        const ghostPackage = player.metadata[`${Constants.SPECTREID}/metadata_ghosts`] as Image[];
        if (ghostPackage?.length > 0)
        {
            foundghost = true;
            const ghostIds = ghostPackage.map(x => x.id);
            for (const ghost of ghostPackage)
            {
                const metadata = ghost.metadata[`${Constants.SPECTREID}/viewers`] as string[];
                if (metadata)
                {
                    const forMe = metadata.includes(sceneCache.userId);
                    if (forMe)
                    {
                        await OBR.scene.local.addItems([ghost]);
                    }
                    else if (localIds.includes(ghost.id))
                    {
                        await OBR.scene.local.deleteItems([ghost.id]);
                    }
                }
            }
            const oldIds = localIds.filter((ghost) => !ghostIds.includes(ghost));
            if (oldIds?.length > 0)
            {
                await OBR.scene.local.deleteItems(oldIds);
            }
        }
    }
    if (!foundghost)
    {
        await OBR.scene.local.deleteItems(localIds);
    }
}

export function UpdateSpectreTargets(): void
{
    const existingSelects = document.querySelectorAll('.tSelects') as any;

    for (const tSelect of existingSelects)
    {
        if (tSelect && tSelect.tomselect)
        {
            // Access the TomSelect instance using .tomselect
            const tomSelectInstance = tSelect.tomselect as TomSelect;

            const newOptions = [];
            for (const player of sceneCache.players)
            {
                newOptions.push({ value: player.id, text: player.name });
            }

            tomSelectInstance.clearOptions();
            tomSelectInstance.addOption(newOptions);

            if (newOptions.length === 0)
            {
                tomSelectInstance.settings.placeholder = "No Players";
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

export async function RestoreGhostsGM(): Promise<void>
{
    let ghostData: Image[] = sceneCache.metadata[`${Constants.SPECTREID}/stored`] as Image[];

    if (ghostData)
    {
        await OBR.scene.local.addItems(ghostData);
        ghostData.forEach(ghost =>
        {
            SetupTomSelect(ghost);
        });
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

        metadataGhostList[`${Constants.SPECTREID}/metadata_ghosts`] = ghosts;
        await OBR.player.setMetadata(metadataGhostList);
    });

    await OBR.contextMenu.create({
        id: `${Constants.SPECTREID}/context-menu`,
        icons: [
            {
                icon: "/ghost.svg",
                label: "Spectre",
                filter: {
                    every: [{ key: "layer", value: "CHARACTER" },
                    { key: ["metadata", `${Constants.SPECTREID}/spectred`], value: undefined, operator: "==", coordinator: "&&" }],
                },
            }, {
                icon: "/ghost.svg",
                label: "Un-Spectre",
                filter: {
                    every: [{ key: "layer", value: "CHARACTER" },
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
                //Hide the warning
                document.getElementById("spectreWarning")!.style.display = "none";
                for (const item of context.items)
                {
                    // Do something to this icon to designate it as a 'Ghost'
                    const ghost = item as Image;
                    SetupTomSelect(ghost);
                }
            }
            else
            {
                for (const item of context.items)
                {
                    // Do something to this icon to designate it as a 'Ghost'
                    const ghost = item as Image;
                    ghost.metadata[`${Constants.SPECTREID}/spectred`] = undefined;

                    const ghostIndex = sceneCache.ghosts.findIndex(x => x.id === ghost.id);
                    sceneCache.ghosts.splice(ghostIndex, 1);
                    const rowElement = document.getElementById(`tr-${ghost.id}`)!;
                    rowElement?.remove();
                    
                    await RemoveGhost(ghost);

                    ghost.metadata[`${Constants.SPECTREID}/viewers`] = [];
                    await OBR.scene.items.addItems([ghost]);
                }
            }
        }
    });
}
async function RemoveGhost(ghost: Image)
{
    const ghostData: Image[] = sceneCache.metadata[`${Constants.SPECTREID}/stored`] as Image[];
    const newData = ghostData.filter(bad => bad.id !== ghost.id);

    await OBR.scene.setMetadata({ [`${Constants.SPECTREID}/stored`]: newData });
    await OBR.scene.local.deleteItems([ghost.id]);
}

async function StoreGhost(ghost: Image)
{
    let ghostData: Image[] = sceneCache.metadata[`${Constants.SPECTREID}/stored`] as Image[];
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
    await OBR.scene.setMetadata({ [`${Constants.SPECTREID}/stored`]: ghostData });
}

async function SetupTomSelect(ghost: Image)
{
    const name = ghost.text?.plainText || ghost.name;
    ghost.metadata[`${Constants.SPECTREID}/spectred`] = true;

    // Recreate as a local item
    await OBR.scene.items.deleteItems([ghost.id]);
    await OBR.scene.local.addItems([ghost]);
    await StoreGhost(ghost);
    sceneCache.ghosts.push(ghost);

    const table = document.getElementById("ghostList")! as HTMLDivElement;
    const newTr = document.createElement("tr");
    newTr.id = `tr-${ghost.id}`;
    newTr.className = "ghost-table-entry";
    newTr.innerHTML = `<td class="token-name">${name}</td>
        <td><select id="select-${ghost.id}" class="tSelects" multiple autocomplete="off" /></td>
        <td><input type="button" class="mysteryButton" id="deleteGhost-${ghost.id}" value="Delete"/></td>`;

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
        placeholder: sceneCache.players.length == 0 ? "No Players" : "Choose..",
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

    const deleteButton = document.getElementById(`deleteGhost-${ghost.id}`) as HTMLInputElement;
    deleteButton.onclick = async () =>
    {
        const ghostIndex = sceneCache.ghosts.findIndex(x => x.id === ghost.id);
        sceneCache.ghosts.splice(ghostIndex, 1);
        newTr.remove();
        await OBR.scene.local.updateItems([ghost.id], ghosties =>
        {
            ghosties[0].metadata[`${Constants.SPECTREID}/viewers`] = [];
        });
        await RemoveGhost(ghost);
    };
}