import OBR, { Item, Image, ItemFilter, isImage } from "@owlbear-rodeo/sdk";
import { isAnyFog, isTokenWithVisionForUI } from './utilities/itemFilters';
import { OnSceneDataChange } from './tools/smokeVisionProcess';
import { Constants } from "./utilities/bsConstants";
import { SetupInputHandlers, SetupPanelHandlers } from "./smokeHandlers";
import { AddUnitVisionUI } from "./smokeVisionUI";
import { InitializeScene } from "./smokeInitializeScene";
import { SetupContextMenus, SetupAutohideMenus } from "./smokeSetupContextMenus";
import { SetupTools } from "./smokeSetupTools";
import * as Utilities from "./utilities/bsUtilities";
import "./css/style.css";
import "@melloware/coloris/dist/coloris.css";
import Coloris from "@melloware/coloris";
import { BSCACHE } from "./utilities/bsSceneCache";
import { UpdateMaps } from "./tools/import";
import { SPECTRE } from "./spectreMain";

export class SmokeMain
{
    public mainWindow = document.getElementById('app') as HTMLDivElement;
    public mainUIDiv?: HTMLDivElement;
    public playerListContainer?: HTMLDivElement;
    public settingsUIDiv?: HTMLDivElement;
    public visionCheckbox?: HTMLInputElement;
    public hiddenListToggle?: HTMLInputElement;
    public snapCheckbox?: HTMLInputElement;
    public table?: HTMLDivElement;
    public hiddenTable?: HTMLDivElement;
    public message?: HTMLParagraphElement;
    public mapHeight?: HTMLInputElement;
    public mapWidth?: HTMLInputElement;
    public mapSubmit?: HTMLInputElement;
    public whatsNewButton?: HTMLDivElement;
    public whatsNewIcon?: HTMLDivElement;
    public processedIndicator?: HTMLButtonElement;

    public smokeViewToggle?: HTMLButtonElement;
    public spectreViewToggle?: HTMLButtonElement;
    public settingsViewToggle?: HTMLButtonElement;
    public debugViewToggle?: HTMLButtonElement;

    public smokeViewPanel?: HTMLDivElement;
    public spectreViewPanel?: HTMLDivElement;
    public settingsViewPanel?: HTMLDivElement;
    public debugViewPanel?: HTMLDivElement;

    // Settings
    public persistenceCheckbox?: HTMLInputElement;
    public autodetectCheckbox?: HTMLInputElement;
    public fowCheckbox?: HTMLInputElement;
    public doorCheckbox?: HTMLInputElement;
    public fowColor?: HTMLInputElement;
    public resetButton?: HTMLInputElement;
    public convertButton?: HTMLInputElement;
    public boundryOptions?: HTMLDivElement;
    public backgroundButton?: HTMLDivElement;

    public lockFogButton?: HTMLButtonElement;
    public unlockFogButton?: HTMLButtonElement;

    // Tool settings
    public toolWidth?: HTMLInputElement;
    public toolColor?: HTMLInputElement;
    public toolStyle?: HTMLSelectElement;

    // Import
    public importButton?: HTMLInputElement;
    public importFile?: HTMLInputElement;
    public mapAlign?: HTMLSelectElement;
    public importErrors?: HTMLDivElement;
    public dpiAutodetect?: HTMLInputElement;
    public importDpi?: HTMLInputElement;
    public importFormat?: HTMLSelectElement;
    public version: string;

    constructor(version: string)
    {
        this.version = `SMOKEANDSPECTRE-${version}`;
    }

    /** Add the initial GM Html, and set all the element variables */
    public SetupGMElements()
    {
        this.mainWindow!.innerHTML = `
            <div id="localStorageWarning"></div>
            <div id="tabControls">
                <div class="controlContainer">
                    <button class="view-button selected" id="smokeViewToggle">SMOKE</button>
                    <button class="view-button" id="spectreViewToggle">SPECTRE</button>
                    <button class="view-button" id="settingsViewToggle">SETTINGS</button>
                    <button class="view-button" id="debugViewToggle">INFO</button>
                    <div id="miniButtons">
                        <button class="circle-button" id="processedIndicator"></button>
                        <input type="checkbox" id="vision_checkbox" class="large" title="Enable Dynamic Fog">    
                        <div class="tooltip" id="whatsnewbutton" title="Whats New"><svg id="whatsNewIcon" class="svgclickable" fill="#fff" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z"/></svg></div>
                    </div>
                </div>
            </div>
            <div id="smokeViewPanel" class="panel"></div>
            <div id="spectreViewPanel" class="panel" style="display: none;"></div>
            <div id="settingsViewPanel" class="panel" style="display: none;"></div>
            <div id="debugViewPanel" class="panel" style="display: none;"></div>
        `;

        this.mainWindow!.parentElement!.style.placeItems = "start";

        this.smokeViewToggle = document.getElementById("smokeViewToggle") as HTMLButtonElement;
        this.spectreViewToggle = document.getElementById("spectreViewToggle") as HTMLButtonElement;
        this.settingsViewToggle = document.getElementById("settingsViewToggle") as HTMLButtonElement;
        this.debugViewToggle = document.getElementById("debugViewToggle") as HTMLButtonElement;

        this.smokeViewPanel = document.getElementById("smokeViewPanel") as HTMLDivElement;
        this.spectreViewPanel = document.getElementById("spectreViewPanel") as HTMLDivElement;
        this.settingsViewPanel = document.getElementById("settingsViewPanel") as HTMLDivElement;
        this.debugViewPanel = document.getElementById("debugViewPanel") as HTMLDivElement;

        // Setup Panels before hitting Handlers
        this.smokeViewPanel.innerHTML = Constants.SMOKEHTML;
        this.spectreViewPanel.innerHTML = Constants.SPECTREHTML;
        this.settingsViewPanel.innerHTML = Constants.SETTINGSHTML;
        this.debugViewPanel.innerHTML = Constants.DEBUGHTML;

        this.mainUIDiv = document.getElementById("main-ui") as HTMLDivElement;
        this.settingsUIDiv = document.getElementById("settings-ui") as HTMLDivElement;
        this.visionCheckbox = document.getElementById("vision_checkbox") as HTMLInputElement;
        this.hiddenListToggle = document.getElementById("hideListToggle") as HTMLInputElement;
        this.snapCheckbox = document.getElementById("snap_checkbox") as HTMLInputElement;
        this.table = document.getElementById("token_list") as HTMLDivElement;
        this.hiddenTable = document.getElementById("hidden_list") as HTMLDivElement;
        this.message = document.getElementById("no_tokens_message") as HTMLParagraphElement;
        this.mapHeight = document.getElementById("mapHeight") as HTMLInputElement;
        this.mapWidth = document.getElementById("mapWidth") as HTMLInputElement;
        this.mapSubmit = document.getElementById("mapSubmit") as HTMLInputElement;
        this.whatsNewButton = document.getElementById("whatsnewbutton") as HTMLDivElement;
        this.whatsNewIcon = document.getElementById("whatsNewIcon") as HTMLDivElement;
        this.processedIndicator = document.getElementById("processedIndicator") as HTMLButtonElement;

        this.persistenceCheckbox = document.getElementById("persistence_checkbox") as HTMLInputElement;
        this.autodetectCheckbox = document.getElementById("autodetect_checkbox") as HTMLInputElement;
        this.fowCheckbox = document.getElementById("fow_checkbox") as HTMLInputElement;
        this.doorCheckbox = document.getElementById("door_checkbox") as HTMLInputElement;
        this.fowColor = document.getElementById("fow_color") as HTMLInputElement;
        this.resetButton = document.getElementById("persistence_reset") as HTMLInputElement;
        this.convertButton = document.getElementById("convert_button") as HTMLInputElement;
        this.boundryOptions = document.getElementById("boundry_options") as HTMLDivElement;
        this.backgroundButton = document.getElementById("background_button") as HTMLDivElement;

        this.lockFogButton = document.getElementById("lock_button") as HTMLButtonElement;
        this.unlockFogButton = document.getElementById("unlock_button") as HTMLButtonElement;

        this.toolWidth = document.getElementById("tool_width") as HTMLInputElement;
        this.toolColor = document.getElementById("tool_color") as HTMLInputElement;
        this.toolStyle = document.getElementById("tool_style") as HTMLSelectElement;

        this.importButton = document.getElementById("import_button") as HTMLInputElement;
        this.importFile = document.getElementById("import_file") as HTMLInputElement;
        this.mapAlign = document.getElementById("map_align") as HTMLSelectElement;
        this.importErrors = document.getElementById("import_errors") as HTMLDivElement;
        this.dpiAutodetect = document.getElementById("dpi_autodetect") as HTMLInputElement;
        this.importDpi = document.getElementById("import_dpi") as HTMLInputElement;
        this.importFormat = document.getElementById("import_format") as HTMLSelectElement;

        // Setup Player Owner Context Menu
        const playerContextMenu = document.getElementById("playerListing")!;
        playerContextMenu.appendChild(this.GetEmptyContextItem());
        for (const player of BSCACHE.party)
        {
            const listItem = document.createElement("li");
            listItem.id = player.id;
            listItem.textContent = player.name;
            listItem.style.color = player.color;
            playerContextMenu.appendChild(listItem);
        };

        Coloris.init();
        SetupPanelHandlers();
    }

    private async SetupPlayerElements()
    {
        this.mainWindow!.innerHTML = `<div class="title">Configuration via GM.
            <div class="tooltip" id="helpButton" title="Need Help?"></div>
            </div>
            <hr><sub>You must have ownership of a token to see it.</sub></br></br>Tokens Owned By You:<div id="playerOwnedTokens"></div><div id="localStorageWarning"></div>`;

        await OBR.action.setHeight(300);
        await OBR.action.setWidth(350);

        this.playerListContainer = document.getElementById("playerOwnedTokens") as HTMLDivElement;
        const helpContainer = document.getElementById("helpButton")!;

        const helpButton = document.createElement('input');
        helpButton.classList.add("clickable");
        helpButton.src = "/help.svg";
        helpButton.height = 15;
        helpButton.width = 15;
        helpButton.type = "image";
        helpButton.title = "Need Help?";
        helpButton.onclick = async function ()
        {
            await OBR.modal.open({
                id: Constants.EXTENSIONWHATSNEW,
                url: `/pages/whatsnew.html?gethelp=true`,
                height: 500,
                width: 350,
            });
        }
        helpContainer.appendChild(helpButton);
    }

    public GetEmptyContextItem()
    {
        const listItem = document.createElement("li");
        listItem.id = BSCACHE.playerId;
        listItem.textContent = "Self";
        return listItem;
    }



    public async ResetPersistence()
    {
        const fogItems = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
        await OBR.scene.local.deleteItems(fogItems.map((item) => { return item.id; }));

        const sceneId = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/sceneId`];
        localStorage.removeItem(`${Constants.EXTENSIONID}/fogCache/${BSCACHE.playerId}/${sceneId}`);
        await OnSceneDataChange();
    }

    public async UpdateUI()
    {
        const playersWithVision = BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item));
        let debug = false;

        if (!Utilities.isObjectEmpty(BSCACHE.sceneMetadata))
        {
            this.visionCheckbox!.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionEnabled`] == true;
            this.autodetectCheckbox!.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/autodetectEnabled`] == true;
            this.persistenceCheckbox!.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistenceEnabled`] == true;
            this.autodetectCheckbox!.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/autodetectEnabled`] == true;
            this.fowCheckbox!.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowEnabled`] == true;
            this.doorCheckbox!.checked = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/playerDoors`] == true;
            this.fowColor!.value = (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowColor`] ? BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowColor`] : "#00000088") as string;
            debug = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/debug`] == true;
        }

        this.boundryOptions!.style.display = this.autodetectCheckbox!.checked ? "none" : "";

        const fogBackgrounds = BSCACHE.sceneItems.filter((item) => item.layer === "FOG" && item.metadata[`${Constants.EXTENSIONID}/isBackgroundMap`] === true);
        const fogBackgroundEntries = document.querySelectorAll(".fog-background-entry");

        for (const background of fogBackgroundEntries)
        {
            const backgroundId = background.id.slice(3);
            if (fogBackgrounds.find(item => item.id === backgroundId) === undefined)
            {
                background.remove();
            }
        }

        for (const background of fogBackgrounds)
        {
            const backgroundElem = document.querySelector(`#bg-${background.id}`);

            if (!backgroundElem)
            {
                const newBackground = document.createElement("div");
                newBackground.id = `bg-${background.id}`;
                newBackground.className = "fog-background-entry grid-3 grid-main";
                newBackground.style.width = "300";
                newBackground.innerHTML = `<div class="token-name grid-2">${background.name}</div>
                    <div><label title="Unlock this fog background and turn it back into a map"><input type="button" value="Unlock"></label></div>`;

                document.querySelector("#fog_background_list")!.appendChild(newBackground);

                const unlockInput = newBackground.querySelector("input")! as HTMLInputElement;
                unlockInput.addEventListener('click', async event =>
                {
                    if (!event || !event.target) return;
                    const target = event.target as HTMLInputElement;

                    const backgroundId = target.parentElement!.parentElement!.parentElement!.id.slice(3);

                    await OBR.scene.items.updateItems((item: Item) => { return item.id === backgroundId && item.layer == "FOG" && (item.metadata[`${Constants.EXTENSIONID}/isBackgroundMap`] === true) }, (items: Item[]) =>
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
                });
            }
        }

        const backgroundDiv = document.querySelector("#fog_backgrounds") as HTMLDivElement;
        if (fogBackgrounds.length == 0)
        {
            backgroundDiv.style.display = 'none';
        } else
        {
            backgroundDiv.style.display = 'block';
        }

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
            AddUnitVisionUI(player);
        }
    }

    public UpdatePlayerProcessUI()
    {
        const playersProcessed = BSCACHE.party.every(player => player.metadata[`${Constants.EXTENSIONID}/processed`] === true);
        if (playersProcessed)
        {
            this.processedIndicator!.style.backgroundColor = "green";
            this.processedIndicator!.title = "Everything looks good.";
        }
        else
        {
            this.processedIndicator!.style.backgroundColor = "red";
            this.processedIndicator!.title = "A player is having trouble processing/seeing.";
        }
    }

    public UpdatePlayerVisionList()
    {
        const itemListHTML: string[] = [];

        for (const item of BSCACHE.sceneItems) 
        {
            if (isImage(item) && item.createdUserId === BSCACHE.playerId)
            {
                const visionEnabled = item.metadata[`${Constants.EXTENSIONID}/hasVision`] !== undefined;
                itemListHTML.push(`<li>${item.name}${!visionEnabled ? ': <b>Vision Disabled</b>' : ''}</li>`);
            }
        }
        if (itemListHTML.length === 0) itemListHTML.push("<li>None found.</li>");
        this.playerListContainer!.innerHTML = `<ul>${itemListHTML.join('')}</ul>`;
    }

    public HighlightWhatsNew()
    {
        let whatsnew = localStorage.getItem(this.version);
        if (whatsnew === "false" || !whatsnew)
        {
            this.whatsNewIcon?.classList.add("new-shine");
            localStorage.setItem(this.version, "true");
        }
    }

    public async SoftReset()
    {
        if (BSCACHE.playerRole === "GM")
        {
            this.SetupGMElements();
            SetupInputHandlers();
            this.UpdatePlayerProcessUI();
            UpdateMaps(this.mapAlign!);

            await Promise.all([
                SetupContextMenus(),
                SetupTools(),
                SPECTRE.SetupSpectreGM(),
                SetupAutohideMenus(false),
                this.UpdateUI()
            ]);
        }
        else
        {
            this.SetupPlayerElements();
        }

        if (BSCACHE.sceneReady)
        {
            await InitializeScene();
            await OnSceneDataChange();
        }
    }

    public async Start()
    {
        Utilities.TestEnvironment();
        if (BSCACHE.playerRole === "GM")
        {
            this.SetupGMElements();
            SetupInputHandlers();
            this.UpdatePlayerProcessUI();
            UpdateMaps(this.mapAlign!);

            await Promise.all([
                SetupContextMenus(),
                SetupTools(),
                SPECTRE.SetupSpectreGM(),
                SetupAutohideMenus(false),
                this.UpdateUI()
            ]);
        }
        else
        {
            await this.SetupPlayerElements();
            this.UpdatePlayerVisionList();
        }

        await InitializeScene();
        await OnSceneDataChange();
        SPECTRE.SetupLocalSpecterHandlers();

        // This needs to be last to avoid getting blasted by all the Initialization
        BSCACHE.SetupHandlers();
        this.HighlightWhatsNew();
    }
}

export const SMOKEMAIN = new SmokeMain("2.51");
OBR.onReady(async () =>
{
    // Startup Handler code for delayed Scene Readiness
    const sceneReady = await OBR.scene.isReady();

    const whatsnewpage = document.getElementById('papp');
    if (whatsnewpage) return;

    if (sceneReady === false)
    {
        const startup = OBR.scene.onReadyChange(async (ready) =>
        {
            if (ready)
            {
                startup(); // Kill startup Handler
                await StartSmokeAndSpectre();
            }
        });
    }
    else
    {
        await StartSmokeAndSpectre();
    }
});

async function StartSmokeAndSpectre(): Promise<void>
{
    // Set theme accordingly - relies on OBR theme settings and not OS theme settings
    await BSCACHE.InitializeCache();
    await SMOKEMAIN.Start();
}