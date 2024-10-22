import OBR, { buildImage, Image } from "@owlbear-rodeo/sdk";
import "./css/style.css";
import { Constants } from "./utilities/bsConstants";

OBR.onReady(async () =>
{
    const selectedIds = await OBR.player.getSelection();
    if (!selectedIds) return await OBR.popover.close(Constants.CONTEXTID);

    const mapStyleSelect = document.getElementById('mapStyleSelect') as HTMLSelectElement;
    const maps = await OBR.scene.items.getItems(item => selectedIds[0] === item.id);
    const thisMap = maps[0] as Image;

    for (const style of Constants.ENHANCEDFOGSTYLES)
    {
        const selfItem = document.createElement("option");
        selfItem.value = style.key;
        selfItem.textContent = style.value;
        mapStyleSelect.appendChild(selfItem);
    }

    const existingEnhancedFog = thisMap.metadata[`${Constants.EXTENSIONID}/hasFogBackground`] as string;
    if (existingEnhancedFog)
    {
        mapStyleSelect.value = existingEnhancedFog;
    }
    else
    {
        mapStyleSelect.value = "NONE";
    }

    mapStyleSelect.onchange = async (event) =>
    {
        const maps = await OBR.scene.items.getItems(item => selectedIds[0] === item.id);
        const freshMap = maps[0] as Image;
        const target = event.target as HTMLSelectElement;
        if (target.value === "NONE")
        {
            const enhancedFogId = freshMap.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`] as string;
            await OBR.scene.items.deleteItems([enhancedFogId]);
            await OBR.scene.items.updateItems([freshMap.id], items =>
            {
                for (const item of items)
                {
                    delete item.metadata[`${Constants.EXTENSIONID}/hasFogBackground`];
                    delete item.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`];
                }
            });
        }
        else
        {
            // Remove old Fogbackground if it exists
            const enhancedFogId = freshMap.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`] as string;
            if (enhancedFogId) await OBR.scene.items.deleteItems([enhancedFogId]);

            const newFogBackground = buildImage(
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

            await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/FOGBACKGROUNDEVENT`, { MapId: newFogBackground.id, FogStyle: target.value } as FogMessage, { destination: "ALL" });
            await OBR.scene.items.addItems([newFogBackground]);
            await OBR.scene.items.updateItems([freshMap.id], items =>
            {
                for (const item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/hasFogBackground`] = target.value;
                    item.metadata[`${Constants.EXTENSIONID}/FogBackgroundId`] = newFogBackground.id;
                }
            });

        }
    };
});