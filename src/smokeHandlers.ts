import OBR, { Item, Image, ItemFilter, Path } from "@owlbear-rodeo/sdk";
import Coloris from "@melloware/coloris";
import { SMOKEMAIN } from "./smokeMain";
import { Constants } from "./utilities/bsConstants";
import { isTrailingFog, isVisionLine } from "./utilities/itemFilters";
import { importFog } from "./tools/import";
import { AddBorderIfNoAutoDetect } from "./smokeVisionUI";
import { SetupAutohideMenus } from "./smokeSetupContextMenus";
import { BSCACHE } from "./utilities/bsSceneCache";


export function SetupInputHandlers()
{
    // Indicator for everyone processing fully
    SMOKEMAIN.processedIndicator!.onclick = async () =>
    {
        await OBR.popover.open({
            id: Constants.PROCESSEDID,
            url: `/pages/processed.html`,
            height: 300,
            width: 300,
            disableClickAway: false
        });
    };

    // The visionCheckbox element is responsible for toggling vision updates
    SMOKEMAIN.visionCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!BSCACHE.sceneReady)
        {
            event.preventDefault();
            return;
        }

        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionEnabled`]: target.checked });
        await OBR.scene.fog.setFilled(target.checked);
    };

    // This is for the grid-snap option
    SMOKEMAIN.snapCheckbox!.checked = true;
    SMOKEMAIN.snapCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!BSCACHE.sceneReady)
        {
            event.preventDefault();
            return;
        }

        const target = event.target as HTMLInputElement;
        BSCACHE.snap = target.checked;
    };

    // Toggles the Settings Window
    SMOKEMAIN.settingsButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        if (SMOKEMAIN.settingsUIDiv!.style.display === "block")
        {
            SMOKEMAIN.settingsUIDiv!.style.display = "none";
            SMOKEMAIN.mainUIDiv!.style.display = "block";
        } else
        {
            SMOKEMAIN.settingsUIDiv!.style.display = "block";
            SMOKEMAIN.mainUIDiv!.style.display = "none";
        }
    };

    // Toggles the persistence mode
    SMOKEMAIN.persistenceCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/persistenceEnabled`]: target.checked });
    };

    // Toggles the auto-detect maps option
    SMOKEMAIN.autodetectCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/autodetectEnabled`]: target.checked });
        SMOKEMAIN.boundryOptions!.style.display = target.checked ? 'none' : '';

        await AddBorderIfNoAutoDetect();
    };

    // Toggles Fog of War - Trailing Fog
    SMOKEMAIN.fowCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await SetupAutohideMenus(target.checked);
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/fowEnabled`]: target.checked });
    };

    // Toggles showing players the Door icons
    SMOKEMAIN.doorCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/playerDoors`]: target.checked });
    };

    // Resets the map's persistence
    SMOKEMAIN.resetButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        OBR.broadcast.sendMessage(Constants.RESETID, true, { destination: "ALL" });
    };

    // Turns on debug mode. 
    SMOKEMAIN.debugButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        if (SMOKEMAIN.debugDiv!.style.display == 'none')
        {
            SMOKEMAIN.debugDiv!.style.display = 'grid';
            SMOKEMAIN.debugButton!.value = "Disable Debugging";
        }
        else
        {
            SMOKEMAIN.debugDiv!.style.display = 'none';
            SMOKEMAIN.debugButton!.value = "Enable Debugging";
        }
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/debug`]: SMOKEMAIN.debugDiv!.style.display === 'grid' ? true : false });
    };

    SMOKEMAIN.unlockFogButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        await OBR.scene.items.updateItems(isVisionLine as ItemFilter<Path>, (paths) =>
        {
            for (let path of paths)
            {
                path.locked = false;
            }
        });
    };

    SMOKEMAIN.lockFogButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        await OBR.scene.items.updateItems(isVisionLine as ItemFilter<Path>, (paths) =>
        {
            for (let path of paths)
            {
                path.locked = true;
            }
        });
    };

    // Also have no idea on what this one is.
    SMOKEMAIN.backgroundButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.items.updateItems((item: Item) => { return item.layer == "FOG" && (item.metadata[`${Constants.EXTENSIONID}/isBackgroundMap`] === true) }, (items: Item[]) =>
        {
            for (let i = 0; i < items.length; i++)
            {
                items[i].layer = "MAP";
                items[i].disableHit = false;
                items[i].locked = false;
                items[i].visible = true;
                delete items[i].metadata[`${Constants.EXTENSIONID}/isBackgroundMap`];
            }
        });
    };

    // Changes the fog of war color.
    let debouncer: ReturnType<typeof setTimeout>;
    SMOKEMAIN.fowColor!.onclick = () =>
    {
        Coloris({
            el: `#${SMOKEMAIN.fowColor!.id}`,
            alpha: true,
            forceAlpha: true,
        });
    };
    SMOKEMAIN.fowColor!.oninput = async (event: Event) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        clearTimeout(debouncer);

        // Debounce this input to avoid hitting OBR rate limit
        debouncer = setTimeout(async () =>
        {
            //let fowColor = "#000000";
            const fogRegex = /#[a-f0-9]{8}/
            if (fogRegex.test(target.value))
            {
                // Remove existing fog, will be regenerated on update:

                await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/fowColor`]: target.value });

                const fogItems = await OBR.scene.local.getItems(isTrailingFog as ItemFilter<Image>) as Image[];
                await OBR.scene.local.deleteItems(fogItems.map(fogItem => fogItem.id));
            }
        }, 500);

    };

    // Converts dynamic fog maps to Smoke.
    SMOKEMAIN.convertButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        if (window.confirm("WARNING: THIS CANNOT BE UNDONE.\n\nThis operation will remove all metadata from the original dynamic fog extension, and will break fog lines and other things if you do not continue using Smoke!.\n\nWARNING: THIS CANNOT BE UNDONE.\n\nAre you REALLY sure?"))
        {
            for (const meta in BSCACHE.sceneMetadata)
            {
                // Remove the old scene metadata, we dont need any of it
                if (meta.substring(0, meta.indexOf('/')) == Constants.ARMINDOID)
                {
                    await OBR.scene.setMetadata({ [`${meta}`]: undefined });
                }
            }

            await OBR.scene.items.updateItems(BSCACHE.sceneItems, items =>
            {
                for (const item of items)
                {
                    if (item.metadata[`${Constants.ARMINDOID}/isVisionLine`] !== undefined)
                    {
                        item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = item.metadata[`${Constants.ARMINDOID}/isVisionLine`];
                        delete item.metadata[`${Constants.ARMINDOID}/isVisionLine`];
                    }
                    if (item.metadata[`${Constants.ARMINDOID}/disabled`] !== undefined)
                    {
                        item.metadata[`${Constants.EXTENSIONID}/disabled`] = item.metadata[`${Constants.ARMINDOID}/disabled`];
                        delete item.metadata[`${Constants.ARMINDOID}/disabled`];
                    }
                }
            });
        }
    };

    // TODO: this is a hack, need to pass json between different event handlers
    var importObject: any;

    SMOKEMAIN.importFile!.onchange = (event: Event) =>
    {
        type FileEventTarget = EventTarget & { files: FileList };
        SMOKEMAIN.importButton!.disabled = true;

        if (!event || !event.target) return;
        const target = event.target as FileEventTarget;

        if (!target.files) return;
        const file = target.files[0];

        if (file.type !== "text/javascript" && file.type !== "application/x-javascript")
        {
            // do we care about the mime type? this is likely browser specific, or file specific, so just ignore it for now.
            // importErrors.innerText = "Wrong file type " + file.type;
            // return;
        }

        if (file)
        {
            type ReadFileTarget = EventTarget & { result: string };
            var readFile = new FileReader();
            readFile.onload = function (event: Event)
            {
                if (!event || !event.target)
                {
                    SMOKEMAIN.importErrors!.innerText = "Invalid import event";
                    return;
                }
                const target = event.target as ReadFileTarget;
                if (!target.result)
                {
                    SMOKEMAIN.importErrors!.innerText = "Unable to read imported file";
                    return;
                }
                const fileContent = target.result;
                importObject = JSON.parse(fileContent);

                // do we really need to validate this here? can do it inside the import functions for each vtt
                if (importObject && ((importObject.walls && importObject.walls.length) || (importObject.line_of_sight && importObject.line_of_sight.length)))
                {
                    // Good to go:
                    SMOKEMAIN.importButton!.disabled = false;
                } else
                {
                    SMOKEMAIN.importErrors!.innerText = "Imported file has no walls";
                }
            };
            readFile.readAsText(file);
        } else
        {
            SMOKEMAIN.importErrors!.innerText = "Failed to load file";
        }
    };


    SMOKEMAIN.importButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        importFog(SMOKEMAIN.importFormat!.value, importObject, (SMOKEMAIN.dpiAutodetect!.checked ? 0 : Number.parseInt(SMOKEMAIN.importDpi!.value)), SMOKEMAIN.mapAlign!.value, SMOKEMAIN.importErrors!);
    };

    // Tool Option Handling - Tool Color
    SMOKEMAIN.toolColor!.onclick = async (_event: MouseEvent) =>
    {
        Coloris({
            el: `#${SMOKEMAIN.toolColor!.id}`,
            alpha: false,
            forceAlpha: false,
        });
    };

    SMOKEMAIN.toolColor!.oninput = async (event: Event) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        clearTimeout(debouncer);

        // Debounce this input to avoid hitting OBR rate limit
        debouncer = setTimeout(async () =>
        {
            const hexTest = /#[a-f0-9]{6}/
            if (hexTest.test(target.value))
            {

                await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolColor`]: target.value });
            }
        }, 400);

    };

    SMOKEMAIN.toolStyle!.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolStyle`]: target.value == "solid" ? [] : [25, 25] });
    };

    SMOKEMAIN.toolWidth!.onchange = (event) =>
    {
        const target = event.currentTarget as HTMLInputElement;
        clearTimeout(debouncer);

        // Debounce this input to avoid hitting OBR rate limit
        debouncer = setTimeout(async () =>
        {

            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolWidth`]: target.value });
        }, 400);
    };

    SMOKEMAIN.whatsNewButton!.onclick = async function ()
    {
        SMOKEMAIN.whatsNewIcon?.classList.remove("new-shine");
        await OBR.modal.open({
            id: Constants.EXTENSIONWHATSNEW,
            url: `/pages/whatsnew.html`,
            height: 500,
            width: 400,
        });
    };

    Coloris({
        themeMode: 'dark',
        alpha: true,
        forceAlpha: true,
        el: "#fow_color",
    });

    Coloris({
        themeMode: 'dark',
        alpha: false,
        forceAlpha: false,
        el: "#tool_color",
    });
}