import OBR, { buildImage, buildShape, Image } from "@owlbear-rodeo/sdk";
import "./css/style.css";
import { Constants } from "./utilities/bsConstants";
import { BSCACHE } from "./utilities/bsSceneCache";

OBR.onReady(async () =>
{
    const selectedIds = await OBR.player.getSelection();
    if (!selectedIds) return await OBR.popover.close(Constants.CONTEXTID);

    const mapEffectSelect = document.getElementById('mapEffectSelect') as HTMLSelectElement;
    const maps = await OBR.scene.items.getItems(item => selectedIds[0] === item.id);
    const thisMap = maps[0] as Image;

    for (const style of Constants.ENHANCEDFOGEFECTS)
    {
        const selfItem = document.createElement("option");
        selfItem.value = style.key;
        selfItem.textContent = style.value;
        mapEffectSelect.appendChild(selfItem);
    }

    const existingEnhancedFogEffect = thisMap.metadata[`${Constants.EXTENSIONID}/hasFogBackground`] as string;
    if (existingEnhancedFogEffect)
        mapEffectSelect.value = existingEnhancedFogEffect;
    else
        mapEffectSelect.value = "NONE";

    const mapStyleSelect = document.getElementById('mapStyleSelect') as HTMLSelectElement;

    for (const style of Constants.ENHANCEDFOGSTYLES)
    {
        const selfItem = document.createElement("option");
        selfItem.value = style[0];
        selfItem.textContent = style[1];
        mapStyleSelect.appendChild(selfItem);
    }

    const existingEnhancedFogStyle = thisMap.metadata[`${Constants.EXTENSIONID}/hasFogBackgroundStyle`] as string;
    if (existingEnhancedFogStyle)
        mapStyleSelect.value = existingEnhancedFogStyle;
    else
        mapStyleSelect.value = "0";


    mapStyleSelect.onchange = async () =>
    {
        await UpdateEnhancedFog();
    }

    mapEffectSelect.onchange = async () =>
    {
        await UpdateEnhancedFog();
    };

    async function UpdateEnhancedFog()
    {
        const maps = await OBR.scene.items.getItems(item => selectedIds![0] === item.id);
        const freshMap = maps[0] as Image;

        if (mapEffectSelect.value === "NONE")
        {
            const enhancedFogId = freshMap.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`] as string;
            if (enhancedFogId)
            {
                await OBR.scene.items.deleteItems([enhancedFogId]);
                await OBR.scene.items.updateItems([freshMap.id], items =>
                {
                    for (const item of items)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/hasFogBackground`];
                        delete item.metadata[`${Constants.EXTENSIONID}/hasFogBackgroundStyle`];
                        delete item.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`];
                    }
                });
            }
        }
        else
        {
            let newFogBackground;

            // Remove old Fogbackground if it exists
            const enhancedFogId = freshMap.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`] as string;
            if (enhancedFogId) await OBR.scene.items.deleteItems([enhancedFogId]);

            if (mapStyleSelect.value === "0")
            {
                newFogBackground = buildImage(
                    {
                        height: freshMap.image.height,
                        width: freshMap.image.width,
                        url: freshMap.image.url,
                        mime: freshMap.image.mime,
                    },
                    {
                        dpi: freshMap.grid.dpi,
                        offset: freshMap.grid.offset
                    })
                    .rotation(freshMap.rotation)
                    .scale(freshMap.scale)
                    .position(freshMap.position)
                    .attachedTo(freshMap.id)
                    .layer("FOG")
                    .metadata({
                        [`${Constants.EXTENSIONID}/isFogBackground`]: freshMap.id
                    })
                    .disableHit(true)
                    .zIndex(-1)
                    .build();
            }
            else
            {
                const boundingBox = await OBR.scene.items.getItemBounds([freshMap.id]);
                newFogBackground = buildShape()
                    .fillColor(BSCACHE.fogColor)
                    .fillOpacity(1)
                    .height(boundingBox.height)
                    .width(boundingBox.width)
                    .rotation(freshMap.rotation)
                    .scale(freshMap.scale)
                    .position(freshMap.position)
                    .attachedTo(freshMap.id)
                    .layer("FOG")
                    .metadata({
                        [`${Constants.EXTENSIONID}/isFogBackground`]: freshMap.id
                    })
                    .disableHit(true)
                    .zIndex(-1)
                    .build();
            }

            await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/FOGBACKGROUNDEVENT`, { MapId: newFogBackground.id, FogEffect: mapEffectSelect.value, FogStyle: mapStyleSelect.value } as FogMessage, { destination: "ALL" });
            await OBR.scene.items.addItems([newFogBackground]);
            await OBR.scene.items.updateItems([freshMap.id], items =>
            {
                for (const item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/hasFogBackground`] = mapEffectSelect.value;
                    item.metadata[`${Constants.EXTENSIONID}/hasFogBackgroundStyle`] = mapStyleSelect.value;
                    item.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`] = newFogBackground.id;
                }
            });
        }
    }
});