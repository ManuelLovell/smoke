import OBR, { buildImage, Image, Item, Player, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";
import { BSCACHE } from "./utilities/bsSceneCache";
import { isLocalSpectre } from "./utilities/itemFilters";

class Spectre
{
    spectresToCreate: Item[] = [];
    spectresToDelete: string[] = [];
    spectresToUpdate: {
        id: string,
        position: Vector2,
        rotation: number,
        scale: Vector2,
        layer: any,
    }[] = [];

    constructor()
    {
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
        const sceneSpectres = BSCACHE.sceneItems.filter(x => x.metadata[`${Constants.SPECTREID}/isSpectre`] === true) as Image[];
        const visibleSpectres = sceneSpectres.filter(x => (x.metadata[`${Constants.SPECTREID}/spectreViewers`] as string[]).includes(BSCACHE.playerId));
        if (visibleSpectres.length > 0)
        {
            for (const spectre of visibleSpectres)
            {
                const existingSpectre = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] === spectre.id) as Image;
                if (!existingSpectre)
                {
                    this.CreateSpectreToQueue(spectre);
                }
                else
                {
                    const equalPosition = (spectre.position.x === existingSpectre.position.x && spectre.position.y === existingSpectre.position.y);
                    const equalScale = (spectre.scale.x === existingSpectre.scale.x && spectre.scale.y === existingSpectre.scale.y);
                    const equalRotation = spectre.rotation === existingSpectre.rotation;
                    const equalLayer = spectre.layer === existingSpectre.layer;
                    if (!equalRotation || !equalScale || !equalLayer || !equalPosition)
                    {
                        this.UpdateSpectreToQueue(spectre, existingSpectre);
                    }
                }
            }

            const localSpectres = BSCACHE.sceneLocal.filter(x => (isLocalSpectre(x))) as Image[];
            for (const localSpectre of localSpectres)
            {
                const exists = visibleSpectres.find(x => x.id === localSpectre.metadata[`${Constants.SPECTREID}/isLocalSpectre`]);
                if (!exists) this.spectresToDelete.push(localSpectre.id);
            }

            // Add, Update and Delete
            if (this.spectresToCreate.length > 0)
                await OBR.scene.local.addItems(this.spectresToCreate);
            if (this.spectresToDelete.length > 0)
                await OBR.scene.local.deleteItems(this.spectresToDelete);
            if (this.spectresToUpdate.length > 0)
            {
                await OBR.scene.local.updateItems(localSpectres.filter(x => !this.spectresToDelete.includes(x.id)), (spectres) =>
                {
                    for (let spectre of spectres)
                    {
                        const mine = this.spectresToUpdate.find(x => x.id === spectre.id)
                        if (mine)
                        {
                            spectre.layer = mine.layer;
                            spectre.scale = mine.scale;
                            spectre.rotation = mine.rotation;
                            spectre.position = mine.position;
                        }
                    }
                });
            }

            this.spectresToCreate = [];
            this.spectresToUpdate = [];
            this.spectresToDelete = [];
        }
        else
        {
            const existingSpectres = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined) as Image[];
            if (existingSpectres.length > 0)
                await OBR.scene.local.deleteItems(existingSpectres.map(x => x.id));
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
            .position(token.position)
            .scale(token.scale)
            .text(token.text)
            .rotation(token.rotation)
            .attachedTo(token.id)
            .layer(token.layer)
            .metadata({ [`${Constants.SPECTREID}/isLocalSpectre`]: token.id })
            .disableHit(false)
            .build();
        if (BSCACHE.playerRole === "GM")
        {
            // We are doing this so the GM can select the token directly
            // and still influence it's base
            item.attachedTo = token.id;
            item.disableHit = true;
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
        };
        this.spectresToUpdate.push(update);
    }

    public async HandleLocalMovement(oldLocalItems: Image[])
    {
        const oldLocalSpectres = oldLocalItems.filter(x => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined) as Image[];
        if (oldLocalSpectres.length > 0)
        {
            const toUpdate: {
                id: string,
                position: Vector2,
                scale: Vector2,
                rotation: number,
            }[] = [];
            for (const oldLocal of oldLocalSpectres)
            {
                const newLocal = BSCACHE.sceneLocal.find(x => x.id === oldLocal.id);
                if (!newLocal) continue;

                // Check if the old local matches the new Local
                const equalPosition = (oldLocal.position.x === newLocal.position.x && oldLocal.position.y === newLocal.position.y);
                const equalScale = (oldLocal.scale.x === newLocal.scale.x && oldLocal.scale.y === newLocal.scale.y);
                const equalRotation = oldLocal.rotation === newLocal.rotation;

                if (!equalPosition || !equalScale || !equalRotation)
                {
                    const sceneItemMatch = BSCACHE.sceneItems.find(x => x.id === newLocal.metadata[`${Constants.SPECTREID}/isLocalSpectre`]);
                    if (sceneItemMatch)
                    {
                        const update = {
                            id: sceneItemMatch.id,
                            position: newLocal.position,
                            scale: newLocal.scale,
                            rotation: newLocal.rotation,
                        };
                        toUpdate.push(update);
                    }
                }
            }
            if (toUpdate.length > 0)
            {
                await OBR.scene.items.updateItems(toUpdate.map(x => x.id), (items) =>
                {
                    for (let item of items)
                    {
                        const mine = toUpdate.find(x => x.id === item.id)
                        if (mine)
                        {
                            item.position = mine.position;
                            item.scale = mine.scale;
                            item.rotation = mine.rotation;
                        }
                    }
                });
            }
        }
    }

    public async SetupGhostSelect(ghost: Image)
    {
        const name = ghost.text?.plainText || ghost.name;

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

        const playerMetadatas = playerMetadataKeys.map(key => 
        {
            const playerData = BSCACHE.sceneMetadata[key] as Player;
            playerData.id = key.replace(`${Constants.EXTENSIONID}/USER-`, '');
            return playerData;
        });

        for (const player of playerMetadatas)
        {
            if (player.id === BSCACHE.playerId) continue; // Don't need to add yourself

            const option = document.createElement('option');
            option.value = player.id;
            option.text = player.name;
            selectButton.appendChild(option);
        }

        // Needed
        let currentViewers = ghost.metadata[`${Constants.SPECTREID}/spectreViewers`] as string[];
        if (!currentViewers) currentViewers = [BSCACHE.playerId];

        let selectedViewers = currentViewers.filter(x => x !== BSCACHE.playerId);
        console.log("CurrentViewers: " + currentViewers.toString())

        const settings = {
            plugins: {
                remove_button: {
                    title: 'Remove this item',
                }
            },
            allowEmptyOption: true,
            placeholder: BSCACHE.party.length === 0 ? "No Players Present" : "Choose..",
            maxItems: null,
            items: selectedViewers,
            create: false,
            onDelete: async function (id: string, element: any) 
            {
                // Sooo fucking hacky
                const ghostId = element.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.id.slice(3);

                // Dereference from values or it'll mess up the control
                await OBR.scene.items.updateItems([ghostId], ghosties =>
                {
                    const metadata = ghosties[0].metadata[`${Constants.SPECTREID}/spectreViewers`] as string[];
                    const index = metadata.findIndex(x => x === id);
                    metadata.splice(index, 1);
                    ghosties[0].metadata[`${Constants.SPECTREID}/spectreViewers`] = metadata;
                });
            },
            onItemAdd: async function (playerId: string, element: any) 
            {
                // So fucking hacky
                const ghostId = element.parentElement.parentElement.parentElement.parentElement.id.slice(3);

                await OBR.scene.items.updateItems([ghostId], ghosties =>
                {
                    const metadata = ghosties[0].metadata[`${Constants.SPECTREID}/spectreViewers`] as string[];
                    metadata.push(playerId);
                    ghosties[0].metadata[`${Constants.SPECTREID}/spectreViewers`] = metadata;
                });
            }
        };

        const ghostSelect = new TomSelect(`#select-${ghost.id}`, settings);

        const deleteButton = document.getElementById(`deleteGhost-${ghost.id}`) as HTMLInputElement;
        deleteButton.onclick = async () =>
        {
            const ghostIndex = BSCACHE.sceneLocal.findIndex(x => x.id === ghost.id);
            BSCACHE.sceneLocal.splice(ghostIndex, 1);
            newTr.remove();
            await OBR.scene.items.deleteItems([ghost.id]);
        };

        const colorSwapTargets = document.getElementsByClassName('ts-control');
        for (let element of colorSwapTargets)
        {
            const tomSelectElement = element as HTMLDivElement;
            tomSelectElement.style.backgroundColor = BSCACHE.theme.mode === "DARK" ? 'rgb(49, 49, 65)' : 'rgb(210, 210, 223)';
            tomSelectElement.style.borderRadius = '6px';
        }
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
}

export const SPECTREMACHINE = new Spectre();