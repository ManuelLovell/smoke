import OBR, { buildPath, Shape, isImage, Image, Path } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { isVisionFog, isBackgroundImage } from "./utilities/itemFilters";
import { SMOKEMAIN } from './smokeMain';
import { SetupAutohideMenus } from "./smokeSetupContextMenus";
import { BSCACHE } from "./utilities/bsSceneCache";
import { LoadSpectreSceneMetadata, RestoreGhostsGM } from "./spectreMain";

export async function InitializeScene(): Promise<void>
{
    await OBR.scene.items.deleteItems(BSCACHE.sceneItems.filter(isVisionFog).map(x => x.id));
    SetupAutohideMenus(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowEnabled`] == true);

    let image;
    if (BSCACHE.sceneItems.filter(isBackgroundImage).length == 0)
    {
        // If no scene map is cached, query all of the maps available and choose the biggest.
        const images = BSCACHE.sceneItems.filter(item => item.layer == "MAP" && isImage(item)) as Image[];
        const areas = images.map(image => image.image.width * image.image.height / Math.pow(image.grid.dpi, 2));
        image = images[areas.indexOf(Math.max(...areas))];
    }

    // turn map autodetect on by default:
    if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === undefined)
    {
        if (BSCACHE.playerRole === "GM") SMOKEMAIN.autodetectCheckbox!.checked = true;
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/autodetectEnabled`]: true });
    }

    if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/sceneId`] === undefined)
    {
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/sceneId`]: crypto.randomUUID() });
    }
    else
    {
        try
        {
            const sceneId = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/sceneId`];
            const sceneFogCache = localStorage.getItem(`${Constants.EXTENSIONID}/fogCache/${BSCACHE.playerId}/${sceneId}`);
            if (sceneFogCache !== null && BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistenceEnabled`] === true)
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

    if (BSCACHE.playerRole === "GM")
    {
        await RestoreGhostsGM();
        await SMOKEMAIN.UpdateUI();

        SMOKEMAIN.mapSubmit!.onclick = async () =>
        {
            await OBR.scene.items.updateItems([Constants.GRIDID], items =>
            {
                for (const item of items)
                {
                    const shape = item as Shape;
                    shape.width = (BSCACHE.gridDpi * (+SMOKEMAIN.mapWidth!.value));
                    shape.height = (BSCACHE.gridDpi * (+SMOKEMAIN.mapHeight!.value));
                    shape.scale = { x: 1, y: 1 };
                }
            });
        };

        // If an image is decided on, update it's metadata to be the chosen one
        if (image !== undefined)
        {
            await OBR.scene.items.updateItems([image], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/isBackgroundImage`] = true;
            });
        }
    }
    else
    {
        await LoadSpectreSceneMetadata();
    }
    
    BSCACHE.snap = true;
    BSCACHE.sceneInitialized = true;
}