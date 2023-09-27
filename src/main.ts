import "./css/style.css";
import OBR, { ItemFilter, Image, Shape, buildShape } from "@owlbear-rodeo/sdk";
import { sceneCache } from './utilities/globals';
import { isBackgroundBorder, isBackgroundImage, isTokenWithVisionForUI, isVisionFog, isTrailingFog, isAnyFog } from './utilities/itemFilters';
import { setupContextMenus, createMode, createTool, onSceneDataChange } from './tools/visionTool';
import { Constants } from "./utilities/constants";
import { RunSpectre, SetupSpectreGM, UpdateSpectreTargets } from "./mystery";
import { updateMaps, importFog } from "./tools/import";

import "@melloware/coloris/dist/coloris.css";
import Coloris from "@melloware/coloris";

// Create the extension page


// Find all Page Elements
const app = document.getElementById('app')! as HTMLDivElement;
app.innerHTML = `
<div>
    <div>
        <div class="title">Smoke! ˣ Dynamic Fog&nbsp;&nbsp;
        <input type="checkbox" id="vision_checkbox" class="large" title="Enable Dynamic Fog">
        <div class="tooltip" id="settings_button" title="Settings">&#x2699;</div>
        <div class="tooltip" id="whatsnewbutton" title="Whats New">&#x1F6C8;</div>
        </div>
        <br>
        <hr>
        <div style="text-align: centre;">
        <div id="settings-ui" class="grid-settings" style="display:none;">
            <div class="visionTitle grid-3">Settings</div>

            <div><label for="autodetect_checkbox">Autodetect Maps</label></div>
            <div style="grid-column: span 2;"><input type="checkbox" id="autodetect_checkbox" checked></div>

            <div id="boundry_options" class="grid-3" style="display:none;">
                <span id="map_size">Boundary Size: 
                    <input type="number" id="mapWidth" name="Width" min="10" max="500"/> x 
                    <input type="number" id="mapHeight" name="Height" min="10" max="500"/>
                    <input type="button" id="mapSubmit" value="Update"/>
                    &nbsp;&nbsp;&nbsp;
                </span>
            </div>

            <div><label for="snap_checkbox">Grid Snap</label></div>
            <div class="grid-2"><input type="checkbox" id="snap_checkbox"></div>

            <div><label for="persistence_checkbox">Persistence</label></div>
            <div><input type="checkbox" id="persistence_checkbox"></div>
            <div><input type="button" id="persistence_reset" value="Reset"></div>

            <div><label for="fow_checkbox">Trailing Fog</label></div>
            <div><input type="checkbox" id="fow_checkbox"></div>
            <div><input type="text" maxlength="7" size="7" id="fow_color" value="#000000"></div>

            <div>Convert from <i>Dynamic Fog</i></div>
            <div></div>
            <div><input type="button" id="convert_button" value="Convert"></div>

            <div></div>
            <div></div>
            <div><input type="button" id="debug_button" value="Enable Debugging"></div>

            <div class="visionTitle grid-3" style="margin-top: 16px;">Import</div>

            <div class="grid-3" style="margin-bottom: 16px;">Import JSON files with fog data from<br><a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a> and other tools.</div>

            <div>File Format</div>
            <div></div>
            <div><select id="import_format"><option value="foundry">Foundry</option><option value="uvtt">Universal VTT</option></select></div>

            <div><label for="dpi_autodetect">DPI Autodetect</label></div>
            <div><input type="checkbox" id="dpi_autodetect" checked></div>
            <div><input id="import_dpi" disabled type="text" value="150" size="1" maxlength="4"></div>

            <div style="margin-bottom: 8px;">Map Alignment</div>
            <div></div>
            <div><select id="map_align" style="width: 120px;"><option selected>Loading..</option></select></div>

            <div><input id="import_file" style="width: 190px;" type="file"></div>
            <div></div>
            <div><input style="padding: 6px" type="button" id="import_button" value="Import" disabled></div>

            <div id="import_errors" class="grid-3"></div>
        </div>

        <div id="main-ui" style="display: grid; grid-template-columns: 10% 50% auto;">
            <div class="visionTitle grid-3">Vision Radius</div>
            <div class="grid-3"><i>GM-owned tokens give universal vision.</i></div>
            <p class="grid-3" id="no_tokens_message">Enable vision on your character tokens.</p>
            <div id="token_list_div" class="grid-3" style="border-bottom: 1px solid white; padding-bottom: 8px;">
                <table style="margin: auto; padding: 0;">
                <tbody id="token_list"></tbody>
                </table>
            </div>
            <div class="visionTitle grid-3">Spectres!</div>
            <div id="ghostContainer" class="grid-3">
                <div id="spectreWarning"><i>Turning a token into a Spectre is one-way. You'll need to drag a new token in if you want it normal.</i></br>
                Enable vision here after it's been Spectred.</div>
                <table style="margin: auto; padding: 0; width: 100%">
                <colgroup>
                    <col style="width: 50%;">
                    <col style="width: 25%;">
                    <col style="width: 25%;">
                </colgroup>
                <tbody id="ghostList">
                </tbody></table>
            </div> 
        </div>

        <div id="debug_div" style="display: none;" class="grid-debug">
            <div class="visionTitle grid-2" style="margin-top: 16px">Performance Info</div>
            <div>Compute time</div><div id="compute_time">N/A</div>
            <div>Communication time</div><div id="communication_time">N/A</div>
            <div>Cache hits/misses</div><div><span id="cache_hits">?</span>/<span id=cache_misses>?</span></div>
            <div>Vision Lines</div><div><span id="line_counter">?</span> (<span id="skip_counter">?</span> skipped)</div>
            <div>Fog Objects</div><div id="item_counter">?</div>
        </div>
    </div>
</div>
`;

app.parentElement!.style.placeItems = "start";

// Main UI
const mainUIDiv = document.getElementById("main-ui")! as HTMLDivElement;
const settingsUIDiv = document.getElementById("settings-ui")! as HTMLDivElement;
const visionCheckbox = document.getElementById("vision_checkbox")! as HTMLInputElement;
const snapCheckbox = document.getElementById("snap_checkbox")! as HTMLInputElement;
const table = document.getElementById("token_list")! as HTMLDivElement;
const message = document.getElementById("no_tokens_message")! as HTMLParagraphElement;
const mapHeight = document.getElementById("mapHeight")! as HTMLInputElement;
const mapWidth = document.getElementById("mapWidth")! as HTMLInputElement;
const mapSubmit = document.getElementById("mapSubmit")! as HTMLInputElement;

// Settings
const persistenceCheckbox = document.getElementById("persistence_checkbox")! as HTMLInputElement;
const autodetectCheckbox = document.getElementById("autodetect_checkbox")! as HTMLInputElement;
const fowCheckbox = document.getElementById("fow_checkbox")! as HTMLInputElement;
const fowColor = document.getElementById("fow_color")! as HTMLInputElement;
const resetButton = document.getElementById("persistence_reset")! as HTMLInputElement;
const convertButton = document.getElementById("convert_button")! as HTMLInputElement;
const settingsButton = document.getElementById("settings_button")! as HTMLInputElement;
const boundryOptions = document.getElementById("boundry_options")! as HTMLDivElement;
const debugDiv = document.getElementById("debug_div")! as HTMLDivElement;
const debugButton = document.getElementById("debug_button")! as HTMLDivElement;

// Import
const importButton = document.getElementById("import_button")! as HTMLInputElement;
const importFile = document.getElementById("import_file")! as HTMLInputElement;
const mapAlign = document.getElementById("map_align") as HTMLSelectElement;
const importErrors = document.getElementById("import_errors") as HTMLDivElement;
const dpiAutodetect = document.getElementById("dpi_autodetect")! as HTMLInputElement;
const importDpi = document.getElementById("import_dpi")! as HTMLInputElement;
const importFormat = document.getElementById("import_format")! as HTMLSelectElement;

Coloris.init();
Coloris({themeMode: 'dark',
        alpha: false,
        el: "#fow_color",
        });

// const snapSense = document.getElementById("snapSense")! as HTMLInputElement;
// const snapSubmit = document.getElementById("snapSubmit")! as HTMLInputElement;
//   <span id="snap_degree">Snap Sensitity (1-10):
//   <input type="number" id="snapSense" name="Snap" value="10" min="1" max="10"/>
//   <input type="button" id="snapSubmit" value="Update"/></span></p>

async function setButtonHandler()
{
    //
    // Main UI Handlers
    //

    // The visionCheckbox element is responsible for toggling vision updates
    visionCheckbox.addEventListener("click", async (event: MouseEvent) =>
    {
        if (!sceneCache.ready || !event.target)
        {
            event.preventDefault();
            return;
        }

        const target = event.target as HTMLInputElement;
        await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/visionEnabled`]: target.checked });
    }, false);

    snapCheckbox.checked = true;
    snapCheckbox.addEventListener("click", async (event: MouseEvent) =>
    {
        if (!sceneCache.ready || !event.target)
        {
            event.preventDefault();
            return;
        }

        const target = event.target as HTMLInputElement;
        sceneCache.snap = target.checked;
    }, false);

    //
    // Settings Handlers
    //

    settingsButton.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;

        if (settingsUIDiv.style.display === "grid") {
            settingsUIDiv.style.display = "none";
            mainUIDiv.style.display = "grid";
        } else {
            settingsUIDiv.style.display = "grid";
            mainUIDiv.style.display = "none";
        }
    }, false);
      
    persistenceCheckbox.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({[`${Constants.EXTENSIONID}/persistenceEnabled`]: target.checked});
    }, false);
  
    autodetectCheckbox.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({[`${Constants.EXTENSIONID}/autodetectEnabled`]: target.checked});
        boundryOptions.style.display = target.checked ? 'none' : '';

        if (!target.checked) {
            let drawing = createBackgroundBorder();
            if (drawing) {
                await OBR.scene.items.addItems([drawing]);
            }
        }
    }, false);
    
    fowCheckbox.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        await OBR.scene.setMetadata({[`${Constants.EXTENSIONID}/fowEnabled`]: target.checked});
    }, false);
    
    resetButton.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;

        // TODO: isnt there a better way to do this?
        // Update the metadata to tell all the other players that they need to reset:
        OBR.scene.setMetadata({[`${Constants.EXTENSIONID}/forceReset`]: true });
        OBR.scene.setMetadata({[`${Constants.EXTENSIONID}/forceReset`]: undefined });
    }, false);

    debugButton.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        debugDiv.style.display = debugDiv.style.display == 'none' ? 'grid' : 'none';
    }, false);
  
    fowColor.addEventListener("input", async (event: Event) => {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        //let fowColor = "#000000";
        const fogRegex = /#[a-f0-9]{6}/
        if (fogRegex.test(target.value)) {
            // Remove existing fog, will be regenerated on update:
            await OBR.scene.setMetadata({[`${Constants.EXTENSIONID}/fowColor`]: target.value});
        
            const fogItems = await OBR.scene.local.getItems(isTrailingFog as ItemFilter<Image>) as Image[];
            await OBR.scene.local.deleteItems(fogItems.map(fogItem => fogItem.id));
        }
    }, false);

    convertButton.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;

        if (window.confirm("WARNING: THIS CANNOT BE UNDONE.\n\nThis operation will remove all metadata from the original dynamic fog extension, and will break fog lines and other things if you do not continue using Smoke!.\n\nWARNING: THIS CANNOT BE UNDONE.\n\nAre you REALLY sure?")) {
            const metadata = await OBR.scene.getMetadata();
            console.log(metadata);
            for (const meta in metadata) {
                // Remove the old scene metadata, we dont need any of it
                if (meta.substring(0, meta.indexOf('/')) == Constants.ARMINDOID) {
                    OBR.scene.setMetadata({[`${meta}`]: undefined });
                }
            }

            const convert_items = await OBR.scene.items.getItems();//isAnyFog as ItemFilter<Image>);
            const itemsToRemove: Image[] = [];
            console.log(convert_items);

            await OBR.scene.items.updateItems(convert_items, items =>
            {
                for (const item of items)
                {
                    if (item.metadata[`${Constants.ARMINDOID}/isVisionLine`] !== undefined) {
                        // play nice here, dont break dyn fog's lines, despite what we said in the warning
                        item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = item.metadata[`${Constants.ARMINDOID}/isVisionLine`];
                        delete item.metadata[`${Constants.ARMINDOID}/isVisionLine`];
                    }
                    if (item.metadata[`${Constants.ARMINDOID}/disabled`] !== undefined) {
                        item.metadata[`${Constants.EXTENSIONID}/disabled`] = item.metadata[`${Constants.ARMINDOID}/disabled`];
                        delete item.metadata[`${Constants.ARMINDOID}/disabled`];
                    }
                }
            });
        }
    }, false);

    // TODO: this is a hack, need to pass json between different event handlers
    var importObject: any;

    importFile.addEventListener("change", async (event: Event) => {
        type FileEventTarget = EventTarget & { files: FileList };
        importButton.disabled = true;

        if (!event || !event.target) return;
        const target = event.target as FileEventTarget;
        
        if (!target.files) return;
        const file = target.files[0];
        
        if(file.type !== "text/javascript" && file.type !== "application/x-javascript") { 
            // do we care about the mime type? this is likely browser specific, or file specific, so just ignore it for now.
            // importErrors.innerText = "Wrong file type " + file.type;
            // return;
        }
        
        if (file) {
            type ReadFileTarget = EventTarget & { result: string };
            var readFile = new FileReader();
            readFile.onload = function(event: Event) { 
                if (!event || !event.target) {
                    importErrors.innerText = "Invalid import event";
                    return;
                }
                const target = event.target as ReadFileTarget;
                if (!target.result) {
                    importErrors.innerText = "Unable to read imported file";
                    return;
                }
                const fileContent = target.result;
                importObject = JSON.parse(fileContent);

                // do we really need to validate this here? can do it inside the import functions for each vtt
                if (importObject && ((importObject.walls && importObject.walls.length) || (importObject.line_of_sight && importObject.line_of_sight.length))) {
                    // Good to go:
                    importButton.disabled = false;
                } else {
                    importErrors.innerText = "Imported file has no walls";
                }
            };
            readFile.readAsText(file);
        } else { 
            importErrors.innerText = "Failed to load file";
        }
    });

        
    importButton.addEventListener("click", async (event: MouseEvent) => {
        if (!event || !event.target) return;
        const target = event.target as HTMLInputElement;

        importFog(importFormat.value, importObject, (dpiAutodetect.checked ? 0 : Number.parseInt(importDpi.value)), mapAlign.value, importErrors);
    }, false);

}

function updateUI(items: Image[])
{
    const playersWithVision = items.filter(isTokenWithVisionForUI);

    if (sceneCache.metadata) {
        visionCheckbox.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/visionEnabled`] == true;
        autodetectCheckbox.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] == true;
        persistenceCheckbox.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/persistenceEnabled`] == true;
        autodetectCheckbox.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] == true;
        fowCheckbox.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/fowEnabled`] == true;
        fowColor.value = (sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] ? sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] : "#000000") as string;
    }

    boundryOptions.style.display = autodetectCheckbox.checked ? "none" : "";
    message.style.display = playersWithVision.length > 0 ? "none" : "block";

    const tokenTableEntries = document.getElementsByClassName("token-table-entry");
    const toRemove = [];
    for (const token of tokenTableEntries)
    {
        const tokenId = token.id.slice(3);
        if (playersWithVision.find(player => player.id === tokenId) === undefined)
            toRemove.push(token);
    }
    for (const token of toRemove)
        token.remove();

    for (const player of playersWithVision)
    {
        const tr = document.getElementById(`tr-${player.id}`);
        if (tr)
        {
            // Update with current information
            const name = tr.getElementsByClassName("token-name")[0] as HTMLTableRowElement;
            const rangeInput = tr.getElementsByClassName("token-vision-range")[0] as HTMLInputElement;
            const unlimitedCheckbox = tr.getElementsByClassName("unlimited-vision")[0] as HTMLInputElement;
            const blindCheckbox = tr.getElementsByClassName("no-vision")[0] as HTMLInputElement;

            if (name) name.innerText = player.name;
            if (rangeInput)
            {
                if (!unlimitedCheckbox.checked && !blindCheckbox.checked)
                    rangeInput.value = player.metadata[`${Constants.EXTENSIONID}/visionRange`] ? player.metadata[`${Constants.EXTENSIONID}/visionRange`] as string : Constants.VISIONDEFAULT;
            }
            if (unlimitedCheckbox)
            {
                unlimitedCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionRange`] === 0;
            }
            if (blindCheckbox)
            {
                blindCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean;
            }
            if (unlimitedCheckbox.checked || blindCheckbox.checked)
                rangeInput.setAttribute("disabled", "disabled");
            else
                rangeInput.removeAttribute("disabled");
        }
        else
        {
            const currentPlayer = sceneCache.items.find(x => x.id === player.id)!;
            // Create new item for this token
            const newTr = document.createElement("tr");
            newTr.id = `tr-${currentPlayer.id}`;
            newTr.className = "token-table-entry";
            newTr.innerHTML = `<td class="token-name">${currentPlayer.name}</td><td><input class="token-vision-range" type="number" value=${Constants.VISIONDEFAULT}><span class="unit">ft</span></td><td>&nbsp;&nbsp;&infin;&nbsp<input type="checkbox" class="unlimited-vision">&nbsp;None <input type="checkbox" class="no-vision"></td>`;
            table.appendChild(newTr);

            // Register event listeners
            const rangeInput = newTr.getElementsByClassName("token-vision-range")[0] as HTMLInputElement;
            const unlimitedCheckbox = newTr.getElementsByClassName("unlimited-vision")[0] as HTMLInputElement;
            const blindCheckbox = newTr.getElementsByClassName("no-vision")[0] as HTMLInputElement;

            if (rangeInput)
            {
                if (!unlimitedCheckbox.checked && !blindCheckbox.checked)
                    rangeInput.value = player.metadata[`${Constants.EXTENSIONID}/visionRange`] ? player.metadata[`${Constants.EXTENSIONID}/visionRange`] as string : Constants.VISIONDEFAULT;
            }
            if (unlimitedCheckbox)
            {
                unlimitedCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionRange`] === 0;
            }
            if (blindCheckbox)
            {
                blindCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean;
            }
            if (unlimitedCheckbox.checked || blindCheckbox.checked)
                rangeInput.setAttribute("disabled", "disabled");
            else
                rangeInput.removeAttribute("disabled");

            rangeInput.addEventListener("change", async event =>
            {
                if (!event || !event.target) return;
                // Grab from scene to avoid a snapshot of the playerstate
                const thisPlayer = sceneCache.items.find(x => x.id === player.id)!;

                const target = event.target as HTMLInputElement;
                const value = parseInt(target.value);
                if (value < 0)
                    target.value = "0";
                if (value > 999)
                    target.value = "999";
                await OBR.scene.items.updateItems([thisPlayer], items =>
                {
                    items[0].metadata[`${Constants.EXTENSIONID}/visionRange`] = value;
                });
            }, false);

            unlimitedCheckbox.addEventListener("click", async event =>
            {
                if (!event || !event.target) return;
                // Grab from scene to avoid a snapshot of the playerstate
                const thisPlayer = sceneCache.items.find(x => x.id === player.id)!;

                let value = 0;
                const target = event.target as HTMLInputElement;
                if (target.checked)
                {
                    rangeInput.setAttribute("disabled", "disabled");
                    blindCheckbox.checked = false;
                }
                else
                {
                    value = parseInt(rangeInput.value);
                    rangeInput.removeAttribute("disabled");
                }
                await OBR.scene.items.updateItems([thisPlayer], items =>
                {
                    items[0].metadata[`${Constants.EXTENSIONID}/visionRange`] = value;
                });
            }, false);

            blindCheckbox.addEventListener("click", async event =>
            {
                if (!event || !event.target) return;
                // Grab from scene to avoid a snapshot of the playerstate
                const thisPlayer = sceneCache.items.find(x => x.id === player.id)!;

                const target = event.target as HTMLInputElement;
                if (target.checked)
                {
                    rangeInput.setAttribute("disabled", "disabled");
                    unlimitedCheckbox.checked = false;
                }
                else
                {
                    rangeInput.removeAttribute("disabled");
                }
                await OBR.scene.items.updateItems([thisPlayer], items =>
                {
                    items[0].metadata[`${Constants.EXTENSIONID}/visionBlind`] = target.checked;
                });
            }, false);
        }
    }
}

function createBackgroundBorder() {
    // this should change, we should initialize this based on autodetect during scene meta updates
    let drawing = undefined;
    if (sceneCache.items.filter(isBackgroundBorder).length == 0)
    {
        drawing = buildShape().width(sceneCache.gridDpi * 30).height(sceneCache.gridDpi * 30).shapeType("RECTANGLE").visible(true).locked(false).strokeColor("pink").fillOpacity(0).strokeDash([200, 500]).strokeWidth(50).build() as any;
        drawing.metadata[`${Constants.EXTENSIONID}/isBackgroundImage`] = true;
        drawing.id = Constants.GRIDID;
        sceneCache.items.push(drawing);
    }
    return drawing;
}

async function initScene(playerRole: string): Promise<void>
{
    let fogFilled, fogColor;
    [sceneCache.items, sceneCache.metadata, sceneCache.gridDpi, sceneCache.gridScale, fogFilled, fogColor] = await Promise.all([
        OBR.scene.items.getItems() as Promise<Image[]>,
        OBR.scene.getMetadata(),
        OBR.scene.grid.getDpi(),
        OBR.scene.grid.getScale(),
        OBR.scene.fog.getFilled(),
        OBR.scene.fog.getColor()
    ]);
    await OBR.scene.items.deleteItems(sceneCache.items.filter(isVisionFog).map(x => x.id));

    sceneCache.snap = true;

    sceneCache.gridScale = sceneCache.gridScale.parsed.multiplier;
    sceneCache.fog = { filled: fogFilled, style: { color: fogColor, strokeWidth: 5 } };

    let image = undefined;
    if (sceneCache.items.filter(isBackgroundImage).length == 0)
    {
        // If no scene map is cached, query all of the maps available and choose the biggest.
        const images = sceneCache.items.filter(item => item.layer == "MAP" && item.type == "IMAGE");
        const areas = images.map(image => image.image.width * image.image.height / Math.pow(image.grid.dpi, 2));
        image = images[areas.indexOf(Math.max(...areas))];
    }

    let drawing;

    // turn map autodetect on by default:
    if (sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === undefined) {
        autodetectCheckbox.checked = true;
        await OBR.scene.setMetadata({[`${Constants.EXTENSIONID}/autodetectEnabled`]: true});
    } else if (sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === false) {
        drawing = createBackgroundBorder();
    }

    if (playerRole == "GM")
    {
        if (drawing)
        {
            await OBR.scene.items.addItems([drawing]);
        }
        mapSubmit.onclick = async () =>
        {
            await OBR.scene.items.updateItems([Constants.GRIDID], items =>
            {
                for (const item of items)
                {
                    const shape = item as Shape;
                    shape.width = (sceneCache.gridDpi * (+mapWidth.value));
                    shape.height = (sceneCache.gridDpi * (+mapHeight.value));
                    shape.scale = { x: 1, y: 1 };
                }
            });
        };

        //Create Whatsnew Button
        const whatsNewButton = document.getElementById("whatsnewbutton")!;
        whatsNewButton.onclick = async function ()
        {
            await OBR.modal.open({
                id: Constants.EXTENSIONWHATSNEW,
                url: `/pages/whatsnew.html`,
                height: 500,
                width: 350,
            });
        };

        updateUI(sceneCache.items);

        // If an image is decided on, update it's metadata to be the chosen one
        if (image !== undefined)
        {
            await OBR.scene.items.updateItems([image], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/isBackgroundImage`] = true;
            });
        }
    }
}

// Setup extension add-ons
OBR.onReady(async () =>
{
    await OBR.player.getRole().then(async role =>
    {
        // Allow the extension to load for any player
        // This is now needed because each player updates their own
        // local fog paths.
        if (role == "GM")
        {
            sceneCache.role = "GM";
            await setButtonHandler();
            await setupContextMenus();
            await createTool();
            await createMode();
            await SetupSpectreGM();
        }
        else
        {
            app.innerHTML = `Configuration is GM-Access only.`;
            await OBR.action.setHeight(90);
            await OBR.action.setWidth(320);
        }

        OBR.scene.fog.onChange(fog =>
        {
            sceneCache.fog = fog;
        });

        OBR.scene.items.onChange(async (items) =>
        {
            const iItems = items as Image[];
            sceneCache.items = iItems;
            if (sceneCache.ready)
            {
                if (role == "GM") {
                    updateUI(iItems);
                    await updateMaps(mapAlign);
                }
                await onSceneDataChange();
            }
        });

        sceneCache.userId = await OBR.player.getId();
        sceneCache.players = await OBR.party.getPlayers();
        OBR.party.onChange(async (players) =>
        {
            sceneCache.players = players;
            if (role === "PLAYER")
            {
                await RunSpectre(players);
            }
            else
            {
                UpdateSpectreTargets();
            }
        });

        OBR.scene.grid.onChange(async (grid) =>
        {
            sceneCache.gridDpi = grid.dpi;
            sceneCache.gridScale = parseInt(grid.scale);
            if (sceneCache.ready)
                await onSceneDataChange();
        });

        OBR.scene.onMetadataChange(async (metadata) =>
        {
            // resets need to propagate to the other players, so handle it via scene metadata change. is there a better way to do this?
            if (metadata[`${Constants.EXTENSIONID}/forceReset`] === true) {
                const fogItems = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
                OBR.scene.local.deleteItems(fogItems.map((item) => { return item.id; }));

                // Force an update:
                onSceneDataChange(true);
            } else {
                sceneCache.metadata = metadata;
                if (sceneCache.ready)
                    await onSceneDataChange();
            }
        });

        OBR.scene.onReadyChange(async (ready) =>
        {
            sceneCache.ready = ready;
            if (ready)
            {
                initScene(role);
                await onSceneDataChange();
            }
            else if (role == "GM")
                updateUI([]);
        });

        sceneCache.ready = await OBR.scene.isReady();
        if (sceneCache.ready)
        {
            initScene(role);
            await onSceneDataChange();
            if (role == "GM") await updateMaps(mapAlign);
        }
        else if (role == "GM")
            updateUI([]);
    }
    )
});