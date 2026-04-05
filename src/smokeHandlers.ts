import OBR, { buildShape } from "@owlbear-rodeo/sdk";
import Coloris from "@melloware/coloris";
import { SMOKEMAIN } from "./smokeMain";
import { Constants } from "./utilities/bsConstants";
import { isVisionLine } from "./utilities/itemFilters";
import { FogImportEntry, ImportScene } from "./tools/importUVTT";
import { BSCACHE } from "./utilities/bsSceneCache";
import { SMOKEMACHINE } from "./smokeProcessor";
import * as Utilities from "./utilities/bsUtilities";
import { GetDarkvisionDefault, GetFalloffRangeDefault, GetInnerAngleDefault, GetOuterAngleDefault, GetSourceRangeDefault, GetVisionRangeDefault } from "./tools/visionToolUtilities";

export function SetupGMInputHandlers(mobile = false)
{
    const hiddenListToggle = document.getElementById("hideListToggle") as HTMLInputElement;
    SMOKEMAIN.hiddenList = document.getElementById("hidden_list") as HTMLTableSectionElement;
    SMOKEMAIN.tokenList = document.getElementById("token_list") as HTMLTableSectionElement;

    hiddenListToggle!.onclick = async () =>
    {
        if (SMOKEMAIN.hiddenList!.style.display === "none")
        {
            if (SMOKEMAIN.hiddenList) SMOKEMAIN.hiddenList.style.display = "table-row-group";
            if (hiddenListToggle) hiddenListToggle.value = mobile ? "Tap to Hide List" : "Out-of-Sight List: Click to Hide";
        }
        else
        {
            if (SMOKEMAIN.hiddenList) SMOKEMAIN.hiddenList.style.display = "none";
            if (hiddenListToggle) hiddenListToggle.value = mobile ? "Tap to Show List" : "Out-of-Sight List: Click to Show";
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
            await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
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

    // Toggles trailing fog being active, which is reliant on persistence.
    const trailingFogCheckbox = document.getElementById("toggle_trailingfog") as HTMLInputElement;
    trailingFogCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/trailingFog`] === true;
    trailingFogCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/trailingFog`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles auto-hide, allowing tokens out of vision range to be 'invisible'.
    const autoHideCheckbox = document.getElementById("toggle_autohide") as HTMLInputElement;
    autoHideCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/autoHide`] === true;
    autoHideCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/autoHide`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles the colored ownership lines
    const togglPersistence = document.getElementById("toggle_persistence") as HTMLInputElement;
    togglPersistence.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true;
    // Trailing Fog Reliance
    if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] !== true)
    {
        trailingFogCheckbox.disabled = true;
        trailingFogCheckbox.checked = false;
    }
    togglPersistence!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/persistence`]: target.checked });
        if (!target.checked)
        {
            trailingFogCheckbox.disabled = true;
            trailingFogCheckbox.checked = false;
            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/trailingFog`]: false });
        }
        else
        {
            trailingFogCheckbox.disabled = false;
        }
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Resets all persistent lights
    const resetPersistence = document.getElementById("reset_persistence") as HTMLInputElement;
    resetPersistence!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;

        await OBR.broadcast.sendMessage(Constants.RESETPERSISTID, true, { destination: "ALL" });
    };

    const persistenceLimitInput = document.getElementById("persistence_limit") as HTMLInputElement;
    const savedPersistenceLimit = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistenceLimit`];
    persistenceLimitInput.value = typeof savedPersistenceLimit === "string"
        ? savedPersistenceLimit
        : typeof savedPersistenceLimit === "number"
            ? savedPersistenceLimit.toString()
            : "100";
    persistenceLimitInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = "100";
        else if (value < 1)
            target.value = "1";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/persistenceLimit`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles the colored ownership lines
    const toggleOwnerLines = document.getElementById("toggle_ownerlines") as HTMLInputElement;
    toggleOwnerLines.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] === true;
    toggleOwnerLines!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toggleOwnerLines`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles showing players the Door icons
    const doorCheckbox = document.getElementById("door_checkbox") as HTMLInputElement;
    doorCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/playerDoors`] === true;
    doorCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/playerDoors`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles displaying warning messages about hardware acceleration
    const warningsCheckbox = document.getElementById("warnings_checkbox") as HTMLInputElement;
    warningsCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/showWarnings`] === undefined ? true : BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/showWarnings`] === true;
    warningsCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/showWarnings`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles showing the unit vision settings context menu
    const unitContextMenuCheckbox = document.getElementById("toggle_unitcontextmenu") as HTMLInputElement;
    unitContextMenuCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/unitContextMenu`] === true;
    unitContextMenuCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/unitContextMenu`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };
    //wallContextMenu

    // Toggles showing the unit vision settings context menu
    const wallContextMenuCheckbox = document.getElementById("toggle_wallcontextmenu") as HTMLInputElement;
    wallContextMenuCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/wallContextMenu`] === true;
    wallContextMenuCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/wallContextMenu`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggle the default elevation layer for tokens/walls
    const defaultElevationSelect = document.getElementById('default_elevation_select') as HTMLSelectElement;
    const savedElevationValue = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/defaultElevation`];
    defaultElevationSelect.value = typeof savedElevationValue === "string" ? savedElevationValue : "-10";
    defaultElevationSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/defaultElevation`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggle the elevation style between tokens see over walls, and consistent levels (0 - 6 all work the same);
    const elevationStyleSelect = document.getElementById('elevation_style_select') as HTMLSelectElement;
    const savedElevationStyle = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationComplex`];
    elevationStyleSelect.value = savedElevationStyle === true ? "true" : "false";
    elevationStyleSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/elevationComplex`]: target.value === "true" });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    // Toggles the pass-through of walls for a GM
    const passWallsCheckbox = document.getElementById("toggle_gmwalls") as HTMLInputElement;
    passWallsCheckbox.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/passWallsGM`] === true;
    passWallsCheckbox!.onclick = async (event: MouseEvent) =>
    {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/passWallsGM`]: target.checked });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
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
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.locked = false;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
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
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.locked = true;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
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
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
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
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/blocking`] = undefined;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
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
            await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) =>
            {
                for (let path of paths)
                {
                    path.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
                }
            });
            await Utilities.Sleep(Constants.SHORTDELAY);
        }
        await BSCACHE.ToggleBusy(false);
    };

    // Token Defaults
    const visionDefaultInput = document.getElementById("visionDefaultInput") as HTMLButtonElement;
    visionDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionRangeDefault`] as string ?? GetVisionRangeDefault();
    visionDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetVisionRangeDefault();
        else if (value < 0)
            target.value = "0";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionRangeDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    const collisionDefaultInput = document.getElementById("collisionDefaultInput") as HTMLButtonElement;
    collisionDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionSourceDefault`] as string ?? GetSourceRangeDefault().toString();
    collisionDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (isNaN(value))
            target.value = GetSourceRangeDefault();
        else if (value < 0)
            target.value = "0";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionSourceDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    const greyscaleDefaultInput = document.getElementById("greyscaleDefaultInput") as HTMLButtonElement;
    greyscaleDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionDarkDefault`] as string ?? GetDarkvisionDefault().toString();
    greyscaleDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetDarkvisionDefault().toString();
        else if (value < 0)
            target.value = "0";
        else if (value > 999)
            target.value = "999";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionDarkDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    };

    const innerAngleDefaultInput = document.getElementById("innerAngleDefaultInput") as HTMLButtonElement;
    innerAngleDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionInAngleDefault`] as string ?? GetInnerAngleDefault().toString();
    innerAngleDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetInnerAngleDefault().toString();
        else if (value < -360)
            target.value = "-360";
        else if (value > 360)
            target.value = "360";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionInAngleDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    }

    const outerAngleDefaultInput = document.getElementById("outerAngleDefaultInput") as HTMLButtonElement;
    outerAngleDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionOutAngleDefault`] as string ?? GetOuterAngleDefault().toString();
    outerAngleDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (isNaN(value))
            target.value = GetOuterAngleDefault().toString();
        else if (value < -360)
            target.value = "-360";
        else if (value > 360)
            target.value = "360";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionOutAngleDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    }

    const falloffDefaultInput = document.getElementById("falloffDefaultInput") as HTMLButtonElement;
    falloffDefaultInput.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionFallOffDefault`] as string ?? GetFalloffRangeDefault().toString();
    falloffDefaultInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (isNaN(value))
            target.value = GetFalloffRangeDefault();
        else if (value < 0)
            target.value = "0";
        else if (value > 10)
            target.value = "10";
        else
            target.value = value.toString();

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionFallOffDefault`]: target.value });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
    }

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
                try {
                    importObject = JSON.parse(fileContent);
                } catch {
                    importErrors!.innerText = "Import file contains invalid JSON";
                    OBR.notification.show("Smoke & Spectre: Import file contains invalid JSON.", "ERROR");
                    return;
                }

                // do we really need to validate this here? can do it inside the import functions for each vtt
                if (importObject && ((importObject.walls && importObject.walls.length)
                    || (importObject.line_of_sight && importObject.line_of_sight.length)
                    || (importObject.objects_line_of_sight && importObject.objects_line_of_sight.length)))
                {
                    // Good to go:
                    importButton!.disabled = false;
                    OBR.notification.show("Smoke & Spectre: Import file loaded successfully.", "SUCCESS");
                } else
                {
                    importButton!.disabled = true;
                    OBR.notification.show("Smoke & Spectre: Import file has no walls to import.", "ERROR");
                }
            };
            readFile.readAsText(file);
        } else
        {
            importErrors!.innerText = "Failed to load file";
            OBR.notification.show("Smoke & Spectre: Failed to load import file.", "ERROR");
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
            await FogImportEntry(importFormat.value, importObject, (dpiAutodetect.checked ? 0 : Number.parseInt(importDpi.value)), mapAlign.value);
        }
        await BSCACHE.ToggleBusy(false);
    };

    // Obstruction Line Drawing Settings
    const toolWidth = document.getElementById("tool_width") as HTMLInputElement;
    const toolColor = document.getElementById("tool_color") as HTMLInputElement;
    const toolStyle = document.getElementById("tool_style") as HTMLSelectElement;
    let debouncer: ReturnType<typeof setTimeout>;

    const playerPreviewSelect = document.getElementById("preview_select") as HTMLSelectElement;
    playerPreviewSelect!.onchange = async () =>
    {
        await SMOKEMACHINE.Run();
        await BSCACHE.ToggleBusy(false);
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
                await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
            }
        }, 400);

    };

    toolStyle!.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;

        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolStyle`]: target.value == "solid" ? [] : [25, 25] });
        await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
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
            target.value = "8";
        }

        // Debounce this input to avoid hitting OBR rate limit
        debouncer = setTimeout(async () =>
        {
            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/toolWidth`]: target.value });
            await OBR.broadcast.sendMessage(Constants.PROCESSEDID, true, { destination: "ALL" });
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

type VisionPreset = {
    id: string;
    name: string;
    visionRange: string;
    visionDark: string;
    visionSourceRange: string;
    visionFallOff: string;
    visionInAngle: string;
    visionOutAngle: string;
};

const VISION_PRESETS_KEY = `${Constants.EXTENSIONID}/visionPresets`;
const MAX_VISION_PRESETS = 20;

function RenderPresetList(
    container: HTMLDivElement,
    presets: VisionPreset[],
    onApply: (id: string) => Promise<void>,
    onDelete: (id: string) => Promise<void>)
{
    if (presets.length === 0)
    {
        container.innerHTML = `<div style="text-align: center; padding: 8px; opacity: 0.6;">No presets saved.</div>`;
        return;
    }

    const table = document.createElement("table");
    table.style.width = "100%";
    const colgroup = document.createElement("colgroup");
    colgroup.innerHTML = `<col style="width: 50%;"><col style="width: 25%;"><col style="width: 25%;">`;
    table.appendChild(colgroup);

    for (const preset of presets)
    {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="padding: 2px;">
                <div style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${preset.name}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; opacity: 0.9; font-size: 0.85em;">
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionRange.svg">${preset.visionRange}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionBumper.svg">${preset.visionSourceRange}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionInner.svg">${preset.visionInAngle}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionOuter.svg">${preset.visionOutAngle}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./visionFalloff.svg">${preset.visionFallOff}</span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;"><img class="setting_svg" src="./darkvision.svg">${preset.visionDark}</span>
                </div>
            </td>
            <td><input type="button" class="settingsButton" value="Apply" data-preset-id="${preset.id}"></td>
            <td><input type="button" class="settingsButton" value="Delete" data-preset-delete-id="${preset.id}"></td>
        `;
        table.appendChild(row);
    }

    container.innerHTML = "";
    container.appendChild(table);

    table.addEventListener("click", async (e) =>
    {
        const target = e.target as HTMLInputElement;
        if (!target || target.tagName !== "INPUT") return;

        const applyId = target.dataset.presetId;
        const deleteId = target.dataset.presetDeleteId;

        if (applyId) await onApply(applyId);
        else if (deleteId) await onDelete(deleteId);
    });
}

export async function SetupPresetHandlers()
{
    const presetNameInput = document.getElementById("preset_name") as HTMLInputElement;
    const presetVRange = document.getElementById("preset_vrange") as HTMLInputElement;
    const presetVDark = document.getElementById("preset_vdark") as HTMLInputElement;
    const presetVSource = document.getElementById("preset_vsource") as HTMLInputElement;
    const presetVFalloff = document.getElementById("preset_vfalloff") as HTMLInputElement;
    const presetVInner = document.getElementById("preset_vinner") as HTMLInputElement;
    const presetVOuter = document.getElementById("preset_vouter") as HTMLInputElement;
    const presetSaveBtn = document.getElementById("preset_save_btn") as HTMLInputElement;
    const presetList = document.getElementById("preset_list") as HTMLDivElement;

    if (!presetSaveBtn || !presetList) return;

    const loadPresetsFromStorage = async (): Promise<VisionPreset[]> =>
    {
        // Check if presets exist in old scene location for backwards compatibility
        const scenePresets = Array.isArray(BSCACHE.sceneMetadata[VISION_PRESETS_KEY])
            ? BSCACHE.sceneMetadata[VISION_PRESETS_KEY] as VisionPreset[]
            : null;
        
        if (scenePresets && scenePresets.length > 0)
        {
            // Migrate to localStorage
            localStorage.setItem(VISION_PRESETS_KEY, JSON.stringify(scenePresets));
            // Clean up scene metadata
            await OBR.scene.setMetadata({ [VISION_PRESETS_KEY]: undefined });
            return scenePresets;
        }
        
        // Load from localStorage
        const stored = localStorage.getItem(VISION_PRESETS_KEY);
        return stored ? JSON.parse(stored) : [];
    };

    let presets = await loadPresetsFromStorage();

    const persistAndRender = async (updated: VisionPreset[]) =>
    {
        presets = updated;
        localStorage.setItem(VISION_PRESETS_KEY, JSON.stringify(updated));
        RenderPresetList(presetList, presets, onApply, onDelete);
    };

    const onApply = async (presetId: string) =>
    {
        const preset = presets.find(p => p.id === presetId);
        if (!preset) return;
        const selection = await OBR.player.getSelection();
        if (!selection || selection.length === 0)
        {
            await OBR.notification.show("Select one or more tokens on the board to apply the preset.", "WARNING");
            return;
        }
        await OBR.scene.items.updateItems(selection, (items) =>
        {
            for (const item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionRange`] = preset.visionRange;
                item.metadata[`${Constants.EXTENSIONID}/visionDark`] = preset.visionDark;
                item.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = preset.visionSourceRange;
                item.metadata[`${Constants.EXTENSIONID}/visionFallOff`] = preset.visionFallOff;
                item.metadata[`${Constants.EXTENSIONID}/visionInAngle`] = preset.visionInAngle;
                item.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = preset.visionOutAngle;
            }
        });
        await OBR.notification.show(`Preset "${preset.name}" applied to ${selection.length} token(s).`, "SUCCESS");
    };

    const onDelete = async (presetId: string) =>
    {
        await persistAndRender(presets.filter(p => p.id !== presetId));
    };

    RenderPresetList(presetList, presets, onApply, onDelete);

    presetSaveBtn.onclick = async () =>
    {
        const name = presetNameInput.value.trim();
        if (!name)
        {
            await OBR.notification.show("Please enter a preset name.", "WARNING");
            return;
        }
        if (presets.length >= MAX_VISION_PRESETS)
        {
            await OBR.notification.show(`You can save up to ${MAX_VISION_PRESETS} presets. Delete one to add another.`, "WARNING");
            return;
        }

        const newPreset: VisionPreset = {
            id: crypto.randomUUID(),
            name,
            visionRange: presetVRange.value || GetVisionRangeDefault(),
            visionDark: presetVDark.value || GetDarkvisionDefault().toString(),
            visionSourceRange: presetVSource.value || GetSourceRangeDefault(),
            visionFallOff: presetVFalloff.value || GetFalloffRangeDefault(),
            visionInAngle: presetVInner.value || GetInnerAngleDefault().toString(),
            visionOutAngle: presetVOuter.value || GetOuterAngleDefault().toString(),
        };
        const updated = [...presets, newPreset];
        await persistAndRender(updated);
        presetNameInput.value = "";
    };
}