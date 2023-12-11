import OBR, { Item, Player, isImage } from "@owlbear-rodeo/sdk";
import { sceneCache } from './utilities/globals';
import { isTokenWithVisionForUI } from './utilities/itemFilters';
import { OnSceneDataChange } from './tools/smokeVisionProcess';
import { Constants } from "./utilities/constants";
import { SetupSpectreGM } from "./spectreMain";
import { updateMaps } from "./tools/import";
import { SetupMainHandlers, SetupOBROnChangeHandlers } from "./smokeHandlers";
import { AddUnitVisionUI } from "./smokeVisionUI";
import { InitializeScene } from "./smokeInitializeScene";
import { SetupContextMenus } from "./smokeSetupContextMenus";
import { SetupTools } from "./smokeSetupTools";
import * as Utilities from "./utilities/utilities";
import "./css/style.css";
import "@melloware/coloris/dist/coloris.css";
import Coloris from "@melloware/coloris";

export class SmokeMain
{
    public mainWindow = document.getElementById('app') as HTMLDivElement;
    public mainUIDiv?: HTMLDivElement;
    public playerListContainer?: HTMLDivElement;
    public settingsUIDiv?: HTMLDivElement;
    public visionCheckbox?: HTMLInputElement;
    public snapCheckbox?: HTMLInputElement;
    public table?: HTMLDivElement;
    public message?: HTMLParagraphElement;
    public mapHeight?: HTMLInputElement;
    public mapWidth?: HTMLInputElement;
    public mapSubmit?: HTMLInputElement;
    public whatsNewButton?: HTMLDivElement;
    public whatsNewIcon?: HTMLDivElement;
    public processedIndicator?: HTMLButtonElement;

    // Settings
    public persistenceCheckbox?: HTMLInputElement;
    public autodetectCheckbox?: HTMLInputElement;
    public fowCheckbox?: HTMLInputElement;
    public doorCheckbox?: HTMLInputElement;
    public fowColor?: HTMLInputElement;
    public qualityOption?: HTMLSelectElement;
    public resetButton?: HTMLInputElement;
    public convertButton?: HTMLInputElement;
    public settingsButton?: HTMLInputElement;
    public boundryOptions?: HTMLDivElement;
    public debugDiv?: HTMLDivElement;
    public debugButton?: HTMLButtonElement;
    public backgroundButton?: HTMLDivElement;

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
        <div>
            <div>
                <div id="localStorageWarning"></div>
                <div class="title">
                <button class="circle-button" id="processedIndicator"></button>
                    Smoke!
                    <input type="checkbox" id="vision_checkbox" class="large" title="Enable Dynamic Fog">
                    <div class="tooltip" id="settings_button" title="Settings"><svg class="svgclickable" fill="#fff" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M.63 11.08zm.21.41v-.1zm.23.38L1 11.68zM1 11.68l-.11-.19zm-.21-.29c-.06-.1-.11-.21-.16-.31.05.1.1.21.16.31zm.32.54v-.06z"/><path d="m11.26 12.63 1.83 1.09a7.34 7.34 0 0 0 1-.94 7.48 7.48 0 0 0 1.56-2.86l-1.74-1A5.29 5.29 0 0 0 14 8a5.29 5.29 0 0 0-.08-.9l1.74-1a7.45 7.45 0 0 0-1.33-2.58 7.54 7.54 0 0 0-1.24-1.22l-1.83 1.04a6 6 0 0 0-1.11-.53v-2A8.55 8.55 0 0 0 7.94.53a8.39 8.39 0 0 0-2.26.3v2a7.23 7.23 0 0 0-1.12.54L2.78 2.28A7.46 7.46 0 0 0 .2 6.06l1.72 1a5.29 5.29 0 0 0-.08.9 5.29 5.29 0 0 0 .08.9l-1.73 1a8 8 0 0 0 .43 1.15c.05.1.1.21.16.31v.1l.11.19.12.19v.06a7.69 7.69 0 0 0 1.64 1.78l1.81-1.08a7.23 7.23 0 0 0 1.12.54v2a8.39 8.39 0 0 0 2.26.31 8.56 8.56 0 0 0 2.22-.3v-2a6 6 0 0 0 1.2-.48zm-2.39 1.52a7.57 7.57 0 0 1-.95.06 7.73 7.73 0 0 1-1-.06v-1.69a4.92 4.92 0 0 1-2.53-1.27l-1.54.92a6.22 6.22 0 0 1-1.08-1.61l1.56-.93a4.27 4.27 0 0 1 0-3.17l-1.56-.92a6.11 6.11 0 0 1 1.12-1.62l1.56.93A5 5 0 0 1 7 3.53V1.82a7.73 7.73 0 0 1 1-.06 7.57 7.57 0 0 1 .95.06v1.72a4.9 4.9 0 0 1 2.4 1.26l1.59-.94a6.31 6.31 0 0 1 1.11 1.62l-1.6.94a4.35 4.35 0 0 1 .3 1.58 4.44 4.44 0 0 1-.29 1.55l1.56.93a6.43 6.43 0 0 1-1.11 1.61l-1.58-.93a5 5 0 0 1-2.49 1.28z"/><path d="M7.92 5.49A2.59 2.59 0 0 0 5.25 8a2.59 2.59 0 0 0 2.67 2.51A2.6 2.6 0 0 0 10.6 8a2.6 2.6 0 0 0-2.68-2.51zM8 9.2A1.35 1.35 0 0 1 6.55 8 1.35 1.35 0 0 1 8 6.7 1.35 1.35 0 0 1 9.39 8 1.35 1.35 0 0 1 8 9.2z"/></svg></div>
                    <div class="tooltip" id="whatsnewbutton" title="Whats New"><svg id="whatsNewIcon" class="svgclickable" fill="#fff" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z"/></svg></div>
                </div>
                <hr>
                ${Constants.SETTINGSPAGE}
                ${Constants.MAINPAGE}
                ${Constants.DEBUGPAGE}
            </div>
        </div>
        `;

        this.mainWindow!.parentElement!.style.placeItems = "start";

        this.mainUIDiv = document.getElementById("main-ui") as HTMLDivElement;
        this.settingsUIDiv = document.getElementById("settings-ui") as HTMLDivElement;
        this.visionCheckbox = document.getElementById("vision_checkbox") as HTMLInputElement;
        this.snapCheckbox = document.getElementById("snap_checkbox") as HTMLInputElement;
        this.table = document.getElementById("token_list") as HTMLDivElement;
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
        this.qualityOption = document.getElementById("quality") as HTMLSelectElement;
        this.resetButton = document.getElementById("persistence_reset") as HTMLInputElement;
        this.convertButton = document.getElementById("convert_button") as HTMLInputElement;
        this.settingsButton = document.getElementById("settings_button") as HTMLInputElement;
        this.boundryOptions = document.getElementById("boundry_options") as HTMLDivElement;
        this.debugDiv = document.getElementById("debug_div") as HTMLDivElement;
        this.debugButton = document.getElementById("debug_button") as HTMLButtonElement;
        this.backgroundButton = document.getElementById("background_button") as HTMLDivElement;

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

        Coloris.init();
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

    /** Populates PlayerId, Party and SceneReady */
    private async BuildUserCache()
    {
        const [userId, players, isSceneReady] = await Promise.all([
            OBR.player.getId(),
            OBR.party.getPlayers(),
            OBR.scene.isReady()
        ]);

        sceneCache.userId = userId;
        sceneCache.players = players;
        sceneCache.ready = isSceneReady;
    }

    public async UpdateUI()
    {
        const playersWithVision = sceneCache.items.filter(item => isTokenWithVisionForUI(item));
        let debug = false;

        if (!Utilities.isObjectEmpty(sceneCache.metadata))
        {
            this.visionCheckbox!.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/visionEnabled`] == true;
            this.autodetectCheckbox!.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] == true;
            this.persistenceCheckbox!.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/persistenceEnabled`] == true;
            this.autodetectCheckbox!.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] == true;
            this.fowCheckbox!.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/fowEnabled`] == true;
            this.doorCheckbox!.checked = sceneCache.metadata[`${Constants.EXTENSIONID}/playerDoors`] == true;
            this.fowColor!.value = (sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] ? sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] : "#00000088") as string;
            this.qualityOption!.value = sceneCache.metadata[`${Constants.EXTENSIONID}/quality`] as string ?? "accurate";
            debug = sceneCache.metadata[`${Constants.EXTENSIONID}/debug`] == true;
        }

        this.debugDiv!.style.display = debug ? 'grid' : 'none';

        this.boundryOptions!.style.display = this.autodetectCheckbox!.checked ? "none" : "";
        this.message!.style.display = playersWithVision.length > 0 ? "none" : "block";

        const fogBackgrounds = sceneCache.items.filter((item) => item.layer === "FOG" && item.metadata[`${Constants.EXTENSIONID}/isBackgroundMap`] === true);
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

    public UpdatePlayerProcessUI(players: Player[])
    {
        const playersProcessed = players.every(player => player.metadata[`${Constants.EXTENSIONID}/processed`] === true);
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
    public UpdatePlayerVisionList(items: Item[])
    {
        const itemListHTML: string[] = [];

        for (const item of items) 
        {
            if (isImage(item) && item.createdUserId === sceneCache.userId)
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

    public async Start(role: "GM" | "PLAYER")
    {
        await this.BuildUserCache();
        if (role === "GM")
        {
            this.SetupGMElements();
            SetupMainHandlers();
            this.UpdatePlayerProcessUI(sceneCache.players);

            await Promise.all([
                SetupContextMenus(),
                SetupTools(),
                SetupSpectreGM(),
            ]);
            Utilities.TestEnvironment();
        }
        else
        {
            this.SetupPlayerElements();
            Utilities.TestEnvironment();
        }

        if (sceneCache.ready)
        {
            await InitializeScene();
            await OnSceneDataChange();
            if (role == "GM")
            {
                await updateMaps(this.mapAlign!);
            }
        }
        else if (role == "GM")
        {
            await this.UpdateUI();
        }
        // This needs to be last to avoid getting blasted by all the Initialization
        SetupOBROnChangeHandlers(role);
        this.HighlightWhatsNew();
    }
}

export const SMOKEMAIN = new SmokeMain("2.1");
OBR.onReady(async () =>
{
    // Set theme accordingly - relies on OBR theme settings and not OS theme settings
    const [theme, role] = await Promise.all([
        OBR.theme.getTheme(),
        OBR.player.getRole()
    ]);
    sceneCache.role = role;

    Utilities.SetThemeMode(theme, document);

    await SMOKEMAIN.Start(sceneCache.role);
});