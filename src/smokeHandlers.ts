import OBR from "@owlbear-rodeo/sdk";
import Coloris from "@melloware/coloris";
import { SMOKEMAIN } from "./smokeMain";
import { Constants } from "./utilities/bsConstants";
import { isVisionLine } from "./utilities/itemFilters";
import { importFog, ImportScene } from "./tools/importUVTT";
import { BSCACHE } from "./utilities/bsSceneCache";
import { SMOKEMACHINE } from "./smokeProcessor";

export function SetupGMInputHandlers()
{
    const hiddenListToggle = document.getElementById("hideListToggle") as HTMLInputElement;
    SMOKEMAIN.hiddenList = document.getElementById("hidden_list") as HTMLTableSectionElement;
    SMOKEMAIN.tokenList = document.getElementById("token_list") as HTMLTableSectionElement;

    hiddenListToggle!.onclick = async () =>
    {
        if (SMOKEMAIN.hiddenList!.style.display === "none")
        {
            if (SMOKEMAIN.hiddenList) SMOKEMAIN.hiddenList.style.display = "table-row-group";
            if (hiddenListToggle) hiddenListToggle.value = "Out-of-Sight List: Click to Hide";
        }
        else
        {
            if (SMOKEMAIN.hiddenList) SMOKEMAIN.hiddenList.style.display = "none";
            if (hiddenListToggle) hiddenListToggle.value = "Out-of-Sight List: Click to Show";
        }
    }

    // This is for the grid-snap option - This is turned on by default and not saved
    const snapCheckbox = document.getElementById("snap_checkbox") as HTMLInputElement;
    BSCACHE.snap = true;
    snapCheckbox.checked = true;
    snapCheckbox.onclick = async (event: MouseEvent) =>
    {
        if (!BSCACHE.sceneReady)
        {
            event.preventDefault();
            return;
        }

        const target = event.target as HTMLInputElement;
        BSCACHE.snap = target.checked;
    };

    // Toggles vision for all tokens, all at once
    const toggleVisionAll = document.getElementById('disable_vision') as HTMLInputElement;
    toggleVisionAll.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/disableVision`] === true;
    toggleVisionAll!.onclick = async (event: MouseEvent) =>
    {
        {
            if (!event || !event.target) return;
            const target = event.target as HTMLInputElement;

            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/disableVision`]: target.checked });
        }
    };

    // Toggles the colored ownership lines
    const toggleFogFill = document.getElementById("toggle_fogfill") as HTMLInputElement;
    toggleFogFill.checked = BSCACHE.fogFilled;
    toggleFogFill.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.fog.setFilled(target.checked);
    };

    // Toggles the colored ownership lines
    const togglPersistence = document.getElementById("toggle_persistence") as HTMLInputElement;
    togglPersistence.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true;
    togglPersistence!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/persistence`]: target.checked });
    };

    // Resets all persistent lights
    const resetPersistence = document.getElementById("reset_persistence") as HTMLInputElement;
    resetPersistence!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        await OBR.broadcast.sendMessage(Constants.RESETPERSISTID, true, { destination: "ALL" });
    };

    // Toggles the colored ownership lines
    const toggleOwnerLines = document.getElementById("toggle_ownerlines") as HTMLInputElement;
    toggleOwnerLines.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] === true;
    toggleOwnerLines!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toggleOwnerLines`]: target.checked });
    };

    // Toggles showing players the Door icons
    const doorCheckbox = document.getElementById("door_checkbox") as HTMLInputElement;
    doorCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/playerDoors`] === true;
    doorCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/playerDoors`]: target.checked });
    };

    // Toggles the locked/unlocked state of all lines
    const lockFogButton = document.getElementById("lock_button") as HTMLButtonElement;
    const unlockFogButton = document.getElementById("unlock_button") as HTMLButtonElement;
    unlockFogButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch, (paths) =>
            {
                for (let path of paths)
                {
                    path.locked = false;
                }
            });
        }
        BSCACHE.ToggleBusy(false);
    };

    lockFogButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch, (paths) =>
            {
                for (let path of paths)
                {
                    path.locked = true;
                }
            });
        }
        await BSCACHE.ToggleBusy(false);
    };

    // Toggles all walls to double-sided
    const doubleSideButton = document.getElementById('doublewall_button') as HTMLButtonElement;
    doubleSideButton.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch, (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
                }
            });
        }
        BSCACHE.ToggleBusy(false);
    };

    // Toggles the block/unblocked state of all walls
    const blockWallsButton = document.getElementById("block_button") as HTMLButtonElement;
    const unblockWallsButton = document.getElementById("unblock_button") as HTMLButtonElement;
    unblockWallsButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch, (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/blocking`] = undefined;
                }
            });
        }
        BSCACHE.ToggleBusy(false);
    };

    blockWallsButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const allFogLines = BSCACHE.sceneItems.filter(x => (isVisionLine(x)));

        await BSCACHE.ToggleBusy(true);

        for (let i = 0; i < allFogLines.length; i += 64)
        {
            const batch = allFogLines.slice(i, i + 64);
            await OBR.scene.items.updateItems(batch, (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
                }
            });
        }
        await BSCACHE.ToggleBusy(false);
    };

    // TODO: this is a hack, need to pass json between different event handlers
    var importObject: any;
    const importButton = document.getElementById("import_button") as HTMLInputElement;
    const importFile = document.getElementById("import_file") as HTMLInputElement;
    const importErrors = document.getElementById("import_errors") as HTMLDivElement;
    const importDpi = document.getElementById("import_dpi") as HTMLInputElement;
    const importFormat = document.getElementById("import_format") as HTMLSelectElement;
    const dpiAutodetect = document.getElementById("dpi_autodetect") as HTMLInputElement;
    const mapAlign = document.getElementById("map_align") as HTMLSelectElement;

    importFile!.onchange = (event: Event) =>
    {
        type FileEventTarget = EventTarget & { files: FileList };
        importButton!.disabled = true;

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
            const fileLabel = document.getElementById("import_file_name");
            if (fileLabel) fileLabel.textContent = file.name;

            type ReadFileTarget = EventTarget & { result: string };
            var readFile = new FileReader();
            readFile.onload = function (event: Event)
            {
                if (!event || !event.target)
                {
                    importErrors!.innerText = "Invalid import event";
                    return;
                }
                const target = event.target as ReadFileTarget;
                if (!target.result)
                {
                    importErrors!.innerText = "Unable to read imported file";
                    return;
                }
                const fileContent = target.result;
                importObject = JSON.parse(fileContent);

                // do we really need to validate this here? can do it inside the import functions for each vtt
                if (importObject && ((importObject.walls && importObject.walls.length)
                    || (importObject.line_of_sight && importObject.line_of_sight.length)
                    || (importObject.objects_line_of_sight && importObject.objects_line_of_sight.length)))
                {
                    // Good to go:
                    importButton!.disabled = false;
                } else
                {
                    importErrors!.innerText = "Imported file has no walls";
                }
            };
            readFile.readAsText(file);
        } else
        {
            importErrors!.innerText = "Failed to load file";
        }
    };

    dpiAutodetect!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        importDpi!.disabled = dpiAutodetect!.checked;
    };

    importButton!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        await BSCACHE.ToggleBusy(true);
        if (importFormat!.value === "scene")
        {
            await ImportScene(importObject, importErrors!);
        }
        else
        {
            await importFog(importFormat.value, importObject, (dpiAutodetect.checked ? 0 : Number.parseInt(importDpi.value)), mapAlign.value, importErrors);
        }
        await BSCACHE.ToggleBusy(false);
    };

    // Obstruction Line Drawing Settings
    const toolWidth = document.getElementById("tool_width") as HTMLInputElement;
    const toolColor = document.getElementById("tool_color") as HTMLInputElement;
    const toolStyle = document.getElementById("tool_style") as HTMLSelectElement;
    let debouncer: ReturnType<typeof setTimeout>;

    const playerPreviewSelect = document.getElementById("preview_select") as HTMLSelectElement;
    playerPreviewSelect!.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await BSCACHE.ToggleBusy(false);
        await SMOKEMACHINE.Run();
    };

    // Tool Option Handling - Tool Color
    toolColor!.onclick = async (_event: MouseEvent) =>
    {
        Coloris({
            el: `#${toolColor!.id}`,
            alpha: false,
            forceAlpha: false,
        });
    };

    toolColor!.oninput = async (event: Event) =>
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

    toolStyle!.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolStyle`]: target.value == "solid" ? [] : [25, 25] });
    };

    toolWidth!.onchange = (event) =>
    {
        const target = event.currentTarget as HTMLInputElement;
        clearTimeout(debouncer);

        try
        {
            const numberValue = parseInt(target.value);
            if (numberValue < 1 || numberValue > 100)
            {
                target.value = "8";
            }
        } catch (error)
        {
            console.log("Tool Width value set out of range, swapping to default")
            target.value = "8";
        }

        // Debounce this input to avoid hitting OBR rate limit
        debouncer = setTimeout(async () =>
        {
            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolWidth`]: target.value });
        }, 400);
    };

    // Need to retrieve the colors and set them on the element before initialization for the Thumbnails to update correctly.
    const getToolColor = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? "#000000";
    if (toolColor) toolColor.value = getToolColor;
    Coloris({
        themeMode: 'dark',
        alpha: false,
        forceAlpha: false,
        el: "#tool_color",
        defaultColor: getToolColor
    });
}