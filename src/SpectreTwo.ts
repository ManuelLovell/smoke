import OBR, { buildImage, Image, Item, Player, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";
import { BSCACHE } from "./utilities/bsSceneCache";
import { isLocalSpectre } from "./utilities/itemFilters";

type SpectreUpdate = {
    id: string;
    position: Vector2;
    rotation: number;
    scale: Vector2;
    layer: Image["layer"];
    zIndex: number;
    name: string;
    text: Image["text"];
    image: Image["image"];
    grid: Image["grid"];
};

type SpectreSceneUpdate = {
    id: string;
    position: Vector2;
    rotation: number;
    scale: Vector2;
    layer: Image["layer"];
    zIndex: number;
};

class Spectre
{
    spectresToCreate: Item[] = [];
    spectresToDelete: string[] = [];
    spectresToUpdate: SpectreUpdate[] = [];

    private isRunning = false;
    private runPending = false;
    private suppressLocalSyncIds: Set<string> = new Set();
    private ghostSelects: Map<string, TomSelect> = new Map();

    constructor()
    {
    }

    private ClearQueues()
    {
        this.spectresToCreate = [];
        this.spectresToUpdate = [];
        this.spectresToDelete = [];
    }

    private NearlyEqual(first: number, second: number, epsilon = 0.01)
    {
        return Math.abs(first - second) <= epsilon;
    }

    private EqualPosition(first: Vector2, second: Vector2)
    {
        return this.NearlyEqual(first.x, second.x) && this.NearlyEqual(first.y, second.y);
    }

    private EqualScale(first: Vector2, second: Vector2)
    {
        return this.NearlyEqual(first.x, second.x) && this.NearlyEqual(first.y, second.y);
    }

    private EqualImage(first: Image["image"], second: Image["image"])
    {
        return first.height === second.height
            && first.width === second.width
            && first.url === second.url
            && first.mime === second.mime;
    }

    private EqualGrid(first: Image["grid"], second: Image["grid"])
    {
        return first.dpi === second.dpi
            && first.offset.x === second.offset.x
            && first.offset.y === second.offset.y;
    }

    private EqualText(first: Image["text"], second: Image["text"])
    {
        return JSON.stringify(first ?? null) === JSON.stringify(second ?? null);
    }

    private GetDisplayName(ghost: Image)
    {
        const tokenText = ghost.text?.plainText?.trim();
        const fallbackName = ghost.name?.trim();
        if (tokenText && tokenText.length > 0) return tokenText;
        if (fallbackName && fallbackName.length > 0) return fallbackName;
        return "Unnamed Item";
    }

    private GetSpectreViewers(ghost: Image)
    {
        const viewers = ghost.metadata[`${Constants.SPECTREID}/spectreViewers`];
        if (Array.isArray(viewers))
        {
            return viewers.filter((viewer): viewer is string => typeof viewer === "string" && viewer.length > 0);
        }
        return ghost.createdUserId ? [ghost.createdUserId] : [];
    }

    private QueueSuppressedLocalSync(localIds: string[])
    {
        for (const localId of localIds)
        {
            this.suppressLocalSyncIds.add(localId);
        }
    }

    private ApplyTomSelectTheme(instance: TomSelect)
    {
        const control = instance.control;
        if (!control) return;
        control.style.backgroundColor = BSCACHE.theme.mode === "DARK" ? "rgb(49, 49, 65)" : "rgb(210, 210, 223)";
        control.style.borderRadius = "6px";
    }

    public async Initialize()
    {
        const sceneSpectres = BSCACHE.sceneItems.filter(x => x.metadata[`${Constants.SPECTREID}/isSpectre`] === true) as Image[];
        for (const spectre of sceneSpectres)
        {
            await this.SetupGhostSelect(spectre);
        }
    }

    public async Run()
    {
        if (this.isRunning)
        {
            this.runPending = true;
            return;
        }

        this.isRunning = true;

        try
        {
            do
            {
                this.runPending = false;

                const sceneSpectres = BSCACHE.sceneItems.filter(x => x.metadata[`${Constants.SPECTREID}/isSpectre`] === true) as Image[];
                const visibleSpectres = sceneSpectres.filter(x => this.GetSpectreViewers(x).includes(BSCACHE.playerId));

                if (visibleSpectres.length > 0)
                {
                    for (const spectre of visibleSpectres)
                    {
                        const existingSpectre = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] === spectre.id) as Image | undefined;
                        if (!existingSpectre)
                        {
                            this.CreateSpectreToQueue(spectre);
                        }
                        else
                        {
                            const equalPosition = this.EqualPosition(spectre.position, existingSpectre.position);
                            const equalScale = this.EqualScale(spectre.scale, existingSpectre.scale);
                            const equalRotation = this.NearlyEqual(spectre.rotation, existingSpectre.rotation);
                            const equalLayer = spectre.layer === existingSpectre.layer;
                            const equalZIndex = this.NearlyEqual(spectre.zIndex, existingSpectre.zIndex);
                            const equalName = spectre.name === existingSpectre.name;

                            if (!equalRotation || !equalScale || !equalLayer || !equalPosition
                                || !equalZIndex
                                || !equalName)
                            {
                                this.UpdateSpectreToQueue(spectre, existingSpectre);
                            }
                        }
                    }

                    const localSpectres = BSCACHE.sceneLocal.filter(x => isLocalSpectre(x)) as Image[];
                    for (const localSpectre of localSpectres)
                    {
                        const exists = visibleSpectres.find(x => x.id === localSpectre.metadata[`${Constants.SPECTREID}/isLocalSpectre`]);
                        if (!exists) this.spectresToDelete.push(localSpectre.id);
                    }

                    if (this.spectresToCreate.length > 0)
                        await OBR.scene.local.addItems(this.spectresToCreate);

                    if (this.spectresToDelete.length > 0)
                    {
                        await OBR.scene.local.deleteItems(this.spectresToDelete);
                        for (const localId of this.spectresToDelete)
                        {
                            this.suppressLocalSyncIds.delete(localId);
                        }
                    }

                    if (this.spectresToUpdate.length > 0)
                    {
                        const localIdsToUpdate = localSpectres
                            .filter(x => !this.spectresToDelete.includes(x.id))
                            .map(x => x.id);

                        if (localIdsToUpdate.length > 0)
                        {
                            this.QueueSuppressedLocalSync(localIdsToUpdate);
                            await OBR.scene.local.updateItems<Image>(localIdsToUpdate, (spectres) =>
                            {
                                for (const spectre of spectres)
                                {
                                    const mine = this.spectresToUpdate.find(x => x.id === spectre.id);
                                    if (mine)
                                    {
                                        spectre.layer = mine.layer;
                                        spectre.scale = mine.scale;
                                        spectre.rotation = mine.rotation;
                                        spectre.position = mine.position;
                                        spectre.zIndex = mine.zIndex;
                                        spectre.name = mine.name;
                                        spectre.text = mine.text;
                                        spectre.image = mine.image;
                                        spectre.grid = mine.grid;
                                    }
                                }
                            });
                        }
                    }
                }
                else
                {
                    const existingSpectres = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined) as Image[];
                    if (existingSpectres.length > 0)
                        await OBR.scene.local.deleteItems(existingSpectres.map(x => x.id));
                }

                this.ClearQueues();
            } while (this.runPending);
        }
        finally
        {
            this.ClearQueues();
            this.isRunning = false;
        }
    }

    private CreateSpectreToQueue(token: Image)
    {
        const item = buildImage(
            {
                height: token.image.height,
                width: token.image.width,
                url: token.image.url,
                mime: token.image.mime,
            },
            {
                dpi: token.grid.dpi,
                offset: token.grid.offset
            })
            //.id(token.id)
            .position(token.position)
            .scale(token.scale)
            .text(token.text)
            .rotation(token.rotation)
            .layer(token.layer)
            .metadata({
                [`${Constants.SPECTREID}/isLocalSpectre`]: token.id,
                [`${Constants.SPECTREID}/isSpectre`]: true
            })
            .disableHit(false)
            .build();
        item.zIndex = token.zIndex;
        item.name = token.name;

        if (BSCACHE.playerRole === "GM")
        {
            // We are doing this so the GM can select the token directly
            // and still influence it's base
            //item.attachedTo = token.id;
            //item.disableHit = true;
        }

        this.spectresToCreate.push(item);
    }

    private UpdateSpectreToQueue(token: Image, localToken: Image)
    {
        const update = {
            id: localToken.id,
            position: token.position,
            rotation: token.rotation,
            scale: token.scale,
            layer: token.layer,
            zIndex: token.zIndex,
            name: token.name,
            text: token.text,
            image: token.image,
            grid: token.grid,
        };
        this.spectresToUpdate.push(update);
    }

    public async HandleLocalMovement(oldLocalItems: Image[])
    {
        const oldLocalSpectres = oldLocalItems.filter(x => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined) as Image[];
        if (oldLocalSpectres.length > 0)
        {
            const toUpdate: SpectreSceneUpdate[] = [];
            for (const oldLocal of oldLocalSpectres)
            {
                if (this.suppressLocalSyncIds.has(oldLocal.id))
                {
                    this.suppressLocalSyncIds.delete(oldLocal.id);
                    continue;
                }

                const newLocal = BSCACHE.sceneLocal.find(x => x.id === oldLocal.id);
                if (!newLocal) continue;

                // Check if the old local matches the new Local
                const equalPosition = this.EqualPosition(oldLocal.position, newLocal.position);
                const equalScale = this.EqualScale(oldLocal.scale, newLocal.scale);
                const equalRotation = this.NearlyEqual(oldLocal.rotation, newLocal.rotation);
                const equalLayer = oldLocal.layer === newLocal.layer;
                const equalZIndex = this.NearlyEqual(oldLocal.zIndex, newLocal.zIndex);
                const equalDisableAutoZ = oldLocal.disableAutoZIndex === newLocal.disableAutoZIndex;

                if (!equalPosition || !equalScale || !equalRotation || !equalLayer || !equalZIndex || !equalDisableAutoZ)
                {
                    const sceneItemMatch = BSCACHE.sceneItems.find(x => x.id === newLocal.metadata[`${Constants.SPECTREID}/isLocalSpectre`]);
                    if (sceneItemMatch)
                    {
                        const update = {
                            id: sceneItemMatch.id,
                            position: newLocal.position,
                            scale: newLocal.scale,
                            rotation: newLocal.rotation,
                            layer: newLocal.layer,
                            zIndex: newLocal.zIndex,
                            disableAutoZIndex: newLocal.disableAutoZIndex === true,
                        };
                        toUpdate.push(update);
                    }
                }
            }
            if (toUpdate.length > 0)
            {
                await OBR.scene.items.updateItems<Image>(toUpdate.map(x => x.id), (items) =>
                {
                    for (const item of items)
                    {
                        const mine = toUpdate.find(x => x.id === item.id);
                        if (mine)
                        {
                            item.position = mine.position;
                            item.scale = mine.scale;
                            item.rotation = mine.rotation;
                            item.layer = mine.layer;
                            item.zIndex = mine.zIndex;
                        }
                    }
                });
            }
        }
    }

    public async SetupGhostSelect(ghost: Image)
    {
        const name = this.GetDisplayName(ghost);

        const existingRow = document.getElementById(`tr-${ghost.id}`) as HTMLTableRowElement | null;
        if (existingRow)
        {
            const existingName = existingRow.querySelector(".token-name") as HTMLTableCellElement | null;
            if (existingName) existingName.textContent = name;
            return;
        }

        const table = document.getElementById("ghostList")! as HTMLDivElement;
        const newTr = document.createElement("tr");
        newTr.id = `tr-${ghost.id}`;
        newTr.className = "ghost-table-entry";
        newTr.innerHTML = `<td class="token-name">${name}</td>
            <td><select id="select-${ghost.id}" class="tSelects" multiple autocomplete="off" /></td>
            <td><input type="button" class="mysteryButton" id="deleteGhost-${ghost.id}" value="Delete"/></td>`;

        table.appendChild(newTr);

        const selectButton = document.getElementById(`select-${ghost.id}`) as HTMLSelectElement;

        const playerMetadataKeys = Object.keys(BSCACHE.sceneMetadata)
            .filter(key => key.startsWith(`${Constants.EXTENSIONID}/USER-`));

        if (playerMetadataKeys && playerMetadataKeys.length > 0)
        {
            const playerMetadatas = playerMetadataKeys.map(key => 
            {
                const playerData = BSCACHE.sceneMetadata[key] as Player;
                return {
                    ...playerData,
                    id: key.replace(`${Constants.EXTENSIONID}/USER-`, '')
                } as Player;
            });

            for (const player of playerMetadatas)
            {
                if (player.id === BSCACHE.playerId) continue; // Don't need to add yourself

                const option = document.createElement('option');
                option.value = player.id;
                option.text = player.name;
                selectButton.appendChild(option);
            }
        }

        // Needed
        const currentViewers = this.GetSpectreViewers(ghost);

        const selectedViewers = currentViewers.filter(x => x !== BSCACHE.playerId);

        const settings = {
            plugins: {
                remove_button: {
                    title: 'Remove this item',
                }
            },
            allowEmptyOption: true,
            placeholder: "Choose..",
            maxItems: null,
            items: selectedViewers,
            create: false,  
            onDelete: async (id: string | string[]) =>
            {
                await OBR.scene.items.updateItems([ghost.id], ghosties =>
                {
                    const metadata = this.GetSpectreViewers(ghosties[0] as Image);
                    const idsToDelete = Array.isArray(id) ? id : [id];
                    for (const viewerId of idsToDelete)
                    {
                        const index = metadata.findIndex(x => x === viewerId);
                        if (index >= 0) metadata.splice(index, 1);
                    }
                    ghosties[0].metadata[`${Constants.SPECTREID}/spectreViewers`] = metadata;
                });
            },
            onItemAdd: async (playerId: string) =>
            {
                await OBR.scene.items.updateItems([ghost.id], ghosties =>
                {
                    const metadata = this.GetSpectreViewers(ghosties[0] as Image);
                    if (!metadata.includes(playerId)) metadata.push(playerId);
                    ghosties[0].metadata[`${Constants.SPECTREID}/spectreViewers`] = metadata;
                });
            }
        };

        const ghostSelect = new TomSelect(`#select-${ghost.id}`, settings);
        this.ghostSelects.set(ghost.id, ghostSelect);
        this.ApplyTomSelectTheme(ghostSelect);

        const deleteButton = document.getElementById(`deleteGhost-${ghost.id}`) as HTMLInputElement;
        deleteButton.onclick = async () =>
        {
            this.RemoveGhostSelect(ghost.id);
            await OBR.scene.items.deleteItems([ghost.id]);
        };
    }

    public UpdateSpectreTargets(): void
    {
        const newOptions = BSCACHE.party
            .filter(player => player.id !== BSCACHE.playerId)
            .map(player => ({ value: player.id, text: player.name }));

        for (const [, tomSelectInstance] of this.ghostSelects)
        {
            const existingOptions = new Set(Object.keys(tomSelectInstance.options));
            for (const option of newOptions)
            {
                if (!existingOptions.has(option.value))
                {
                    tomSelectInstance.addOption(option);
                }
            }

            tomSelectInstance.settings.placeholder = "Choose..";
            tomSelectInstance.inputState();
            this.ApplyTomSelectTheme(tomSelectInstance);
        }
    }

    public RemoveGhostSelect(ghostId: string)
    {
        const ghostSelect = this.ghostSelects.get(ghostId);
        if (ghostSelect)
        {
            ghostSelect.destroy();
            this.ghostSelects.delete(ghostId);
        }

        const targetRow = document.getElementById(`tr-${ghostId}`);
        targetRow?.remove();
    }

    public CheckForRemovedTokens()
    {
        const existingSpectreRows = document.getElementsByClassName("ghost-table-entry");
        const spectreIds = Array.from(existingSpectreRows).map(row => row.id.slice(3));
        for (const sId of spectreIds)
        {
            const found = BSCACHE.sceneItems.find(x => x.id === sId);
            if (!found) this.RemoveGhostSelect(sId);
        }
    }
}

export const SPECTREMACHINE = new Spectre();