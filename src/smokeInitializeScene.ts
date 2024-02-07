import OBR, { buildPath, Shape, isImage, Image, Path } from "@owlbear-rodeo/sdk";
import { RestoreGhostsGM } from "./spectreMain";
import { Constants } from "./utilities/constants";
import { sceneCache } from "./utilities/globals";
import { isVisionFog, isBackgroundImage } from "./utilities/itemFilters";
import { SMOKEMAIN } from './smokeMain';
import { setupAutohideMenus } from "./smokeSetupContextMenus";

export async function InitializeScene(): Promise<void>
{
    let fogFilled, fogColor;
    [sceneCache.items,
    sceneCache.metadata,
    sceneCache.gridDpi,
    sceneCache.gridScale,
        fogFilled,
        fogColor] = await Promise.all([
            OBR.scene.items.getItems(),
            OBR.scene.getMetadata(),
            OBR.scene.grid.getDpi(),
            OBR.scene.grid.getScale(),
            OBR.scene.fog.getFilled(),
            OBR.scene.fog.getColor()
        ]);

    await OBR.scene.items.deleteItems(sceneCache.items.filter(isVisionFog).map(x => x.id));
    
    sceneCache.snap = true;
    sceneCache.gridScale = sceneCache.gridScale?.parsed?.multiplier ?? 5;
    sceneCache.fog = { filled: fogFilled, style: { color: fogColor, strokeWidth: 5 } };

    let image;
    if (sceneCache.items.filter(isBackgroundImage).length == 0)
    {
        // If no scene map is cached, query all of the maps available and choose the biggest.
        const images = sceneCache.items.filter(item => item.layer == "MAP" && isImage(item)) as Image[];
        const areas = images.map(image => image.image.width * image.image.height / Math.pow(image.grid.dpi, 2));
        image = images[areas.indexOf(Math.max(...areas))];
    }

    // turn map autodetect on by default:
    if (sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === undefined)
    {
        if (sceneCache.role === "GM") SMOKEMAIN.autodetectCheckbox!.checked = true;
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/autodetectEnabled`]: true });
    }
    
    setupAutohideMenus(sceneCache.metadata[`${Constants.EXTENSIONID}/fowEnabled`] == true);

    if (sceneCache.metadata[`${Constants.EXTENSIONID}/sceneId`] === undefined)
    {
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/sceneId`]: crypto.randomUUID() });
    }
    else
    {
        try
        {
            const sceneId = sceneCache.metadata[`${Constants.EXTENSIONID}/sceneId`];
            const sceneFogCache = localStorage.getItem(`${Constants.EXTENSIONID}/fogCache/${sceneCache.userId}/${sceneId}`);
            if (sceneFogCache !== null && sceneCache.metadata[`${Constants.EXTENSIONID}/persistenceEnabled`] === true)
            {
                const savedPaths = JSON.parse(sceneFogCache);

                const createPaths: Path[] = [];
                for (let i = 0; i < savedPaths.length; i++)
                {
                    const path = buildPath()
                        .commands(savedPaths[i].commands)
                        .fillRule("evenodd")
                        .locked(true)
                        .visible(false)
                        .fillColor('#000000')
                        .strokeColor("#000000")
                        .layer("FOG")
                        .name("Fog of War")
                        .metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true, [`${Constants.EXTENSIONID}/digest`]: savedPaths[i].digest })
                        .build();

                    // set our fog zIndex to 3, otherwise it can sometimes draw over the top of manually created fog objects:
                    path.zIndex = 3;

                    createPaths.push(path);
                }
                await OBR.scene.local.addItems(createPaths);
            }
        }
        catch (error)
        {
            // do nothing - localStorage isnt available, and it probably doesnt matter if we cant reload persistent fog
        }
    }

    if (sceneCache.role == "GM")
    {
        await RestoreGhostsGM();
        SMOKEMAIN.mapSubmit!.onclick = async () =>
        {
            await OBR.scene.items.updateItems([Constants.GRIDID], items =>
            {
                for (const item of items)
                {
                    const shape = item as Shape;
                    shape.width = (sceneCache.gridDpi * (+SMOKEMAIN.mapWidth!.value));
                    shape.height = (sceneCache.gridDpi * (+SMOKEMAIN.mapHeight!.value));
                    shape.scale = { x: 1, y: 1 };
                }
            });
        };

        await SMOKEMAIN.UpdateUI();

        // If an image is decided on, update it's metadata to be the chosen one
        if (image !== undefined)
        {
            await OBR.scene.items.updateItems([image], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/isBackgroundImage`] = true;
            });
        }
    }
    sceneCache.initialized = true;
}