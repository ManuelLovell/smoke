import OBR, { Grid, Item, Image, Metadata, Player, Theme, Fog } from "@owlbear-rodeo/sdk";
import * as Utilities from './bsUtilities';
import { Constants } from "./bsConstants";
import { finishDrawing as FinishLineDrawing, cancelDrawing as CancelLineDrawing, undoLastPoint as UndoLinePoint } from "../tools/visionLineMode";
import { finishDrawing as FinishPolyDrawing, cancelDrawing as CancelPolyDrawing, undoLastPoint as UndoPolygonPoint } from "../tools/visionPolygonMode";
import { finishDrawing as FinishElevationDrawing, cancelDrawing as CancelElevationDrawing, undoLastPoint as UndoElevationPoint } from "../tools/elevationMode";
import { SMOKEMAIN } from "../smokeMain";
import { SMOKEMACHINE } from "../smokeProcessor";
import { SPECTREMACHINE } from "../SpectreTwo";
import { SetupAutoHideMenu, SetupUnitContextMenu, SetupWallContextMenu } from "../smokeSetupContextMenus";
import { ApplyEnhancedFog } from "../smokeEnhancedFog";

class BSCache
{
    // Cache Names
    static PLAYER = "PLAYER";
    static PARTY = "PARTY";
    static SCENEITEMS = "SCENEITEMS";
    static SCENELOCAL = "SCENELOCAL";
    static SCENEMETA = "SCENEMETADATA";
    static SCENEGRID = "SCENEGRID";
    static SCENEFOG = "SCENEFOG";
    static ROOMMETA = "ROOMMETADATA";

    playerId: string;
    playerColor: string;
    playerName: string;
    playerMetadata: {};
    playerRole: "GM" | "PLAYER";

    party: Player[];
    lastParty: Player[];

    fogFilled: boolean;
    fogColor: string;
    fogStroke: number;

    gridDpi: number;
    gridScale: number; // IE; 5   ft
    gridSnap: number;
    gridType: string; // IE; ft (of 5ft)

    storedMetaItems: Item[];

    sceneId: string;
    sceneItems: Item[];
    sceneLocal: Item[];
    sceneSelected: string[];
    sceneMetadata: Metadata;
    sceneReady: boolean;

    roomMetadata: Metadata;

    theme: Theme;

    caches: string[];

    snap: boolean;
    torchActive: boolean;

    busy: boolean;
    USER_REGISTERED: boolean;

    toolStarted: boolean;
    expectedFogMapId: string;
    expectedFogStyle: string;
    expectedFogEffect: string;

    //handlers
    sceneMetadataHandler?: () => void;
    sceneItemsHandler?: () => void;
    sceneLocalHandler?: () => void;
    sceneGridHandler?: () => void;
    sceneReadyHandler?: () => void;
    playerHandler?: () => void;
    partyHandler?: () => void;
    themeHandler?: () => void;
    roomHandler?: () => void;
    fogHandler?: () => void;

    constructor(caches: string[])
    {
        this.playerId = "";
        this.playerName = "";
        this.playerColor = "";
        this.playerMetadata = {};
        this.playerRole = "PLAYER";
        this.party = [];
        this.lastParty = [];
        this.fogFilled = false;
        this.fogColor = "#000";
        this.fogStroke = 5;
        this.storedMetaItems = [];
        this.sceneId = "";
        this.sceneItems = [];
        this.sceneLocal = [];
        this.sceneSelected = [];
        this.sceneMetadata = {};
        this.gridDpi = 0;
        this.gridScale = 5;
        this.gridSnap = 10;
        this.gridType = "ft";
        this.sceneReady = false;
        this.theme = {} as any;
        this.roomMetadata = {};
        this.snap = false;
        this.busy = false;
        this.torchActive = false;
        this.toolStarted = false;
        this.expectedFogMapId = "";
        this.expectedFogStyle = "";
        this.expectedFogEffect = "";

        this.USER_REGISTERED = false;
        this.caches = caches;
    }

    public async RefreshCache()
    {
        if (this.caches.includes(BSCache.PLAYER))
        {
            this.playerId = await OBR.player.getId();
            this.playerName = await OBR.player.getName();
            this.playerColor = await OBR.player.getColor();
            this.playerMetadata = await OBR.player.getMetadata();
            this.playerRole = await OBR.player.getRole();
        }

        if (this.caches.includes(BSCache.PARTY))
        {
            this.party = await OBR.party.getPlayers();
        }

        if (this.caches.includes(BSCache.SCENEFOG))
        {
            if (this.sceneReady)
            {
                this.fogColor = await OBR.scene.fog.getColor();
                this.fogFilled = await OBR.scene.fog.getFilled();
            }
        }

        if (this.caches.includes(BSCache.SCENEITEMS))
        {
            if (this.sceneReady)
            {
                this.sceneItems = await OBR.scene.items.getItems();
                this.sceneLocal = await OBR.scene.local.getItems();
            }
        }

        if (this.caches.includes(BSCache.SCENEMETA))
        {
            if (this.sceneReady)
            {
                this.sceneMetadata = await OBR.scene.getMetadata();
                const savedItems = this.sceneMetadata[`${Constants.EXTENSIONID}/stored`];
                if (savedItems)
                {
                    this.storedMetaItems = savedItems as Item[];
                }
                this.sceneId = this.sceneMetadata[`${Constants.EXTENSIONID}/sceneId`] as string;
                if (this.sceneId === "" || this.sceneId === undefined)
                {
                    await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/sceneId`]: crypto.randomUUID() });
                }
            }
        }

        if (this.caches.includes(BSCache.SCENEGRID))
        {
            if (this.sceneReady)
            {
                this.gridDpi = await OBR.scene.grid.getDpi();
                const gridScale = await OBR.scene.grid.getScale();
                this.gridScale = gridScale.parsed?.multiplier ?? 5;
                this.gridType = gridScale.parsed.unit;
            }
        }

        if (this.caches.includes(BSCache.ROOMMETA))
        {
            if (this.sceneReady) this.roomMetadata = await OBR.room.getMetadata();
        }
    }

    public async InitializeCache()
    {
        this.sceneReady = await OBR.scene.isReady();
        this.theme = await OBR.theme.getTheme();

        Utilities.SetThemeMode(this.theme, document);

        if (this.caches.includes(BSCache.PLAYER))
        {
            this.playerId = await OBR.player.getId();
            this.playerName = await OBR.player.getName();
            this.playerColor = await OBR.player.getColor();
            this.playerMetadata = await OBR.player.getMetadata();
            this.playerRole = await OBR.player.getRole();
        }

        if (this.caches.includes(BSCache.PARTY))
        {
            this.party = await OBR.party.getPlayers();
        }

        if (this.caches.includes(BSCache.SCENEFOG))
        {
            if (this.sceneReady)
            {
                this.fogColor = await OBR.scene.fog.getColor();
                this.fogFilled = await OBR.scene.fog.getFilled();
            }
        }

        if (this.caches.includes(BSCache.SCENEITEMS))
        {
            if (this.sceneReady)
            {
                this.sceneItems = await OBR.scene.items.getItems();
                this.sceneLocal = await OBR.scene.local.getItems();
            }
        }

        if (this.caches.includes(BSCache.SCENEMETA))
        {
            if (this.sceneReady)
            {
                this.sceneMetadata = await OBR.scene.getMetadata();
                const savedItems = this.sceneMetadata[`${Constants.EXTENSIONID}/stored`];
                if (savedItems)
                {
                    this.storedMetaItems = savedItems as Item[];
                }
            }
        }

        if (this.caches.includes(BSCache.SCENEGRID))
        {
            if (this.sceneReady)
            {
                this.gridDpi = await OBR.scene.grid.getDpi();
                const gridScale = await OBR.scene.grid.getScale();
                this.gridScale = gridScale.parsed?.multiplier ?? 5;
                this.gridType = gridScale.parsed.unit;
            }
        }

        if (this.caches.includes(BSCache.ROOMMETA))
        {
            if (this.sceneReady) this.roomMetadata = await OBR.room.getMetadata();
        }

        const elevationHandler = OBR.broadcast.onMessage(`${Constants.EXTENSIONID}/ELEVATIONEVENT`, (data) =>
        {
            switch (data.data)
            {
                case "CANCEL": CancelElevationDrawing();
                    break;
                case "FINISH": FinishElevationDrawing();
                    break;
                case "UNDO": UndoElevationPoint();
                    break;
                default:
                    break;
            }
        });

        const lineHandler = OBR.broadcast.onMessage(`${Constants.EXTENSIONID}/LINEEVENT`, (data) =>
        {
            switch (data.data)
            {
                case "CANCEL": CancelLineDrawing();
                    break;
                case "FINISH": FinishLineDrawing();
                    break;
                case "UNDO": UndoLinePoint();
                    break;
                default:
                    break;
            }
        });

        const polyHandler = OBR.broadcast.onMessage(`${Constants.EXTENSIONID}/POLYGONEVENT`, (data) =>
        {
            switch (data.data)
            {
                case "CANCEL": CancelPolyDrawing();
                    break;
                case "FINISH": FinishPolyDrawing();
                    break;
                case "UNDO": UndoPolygonPoint();
                    break;
                default:
                    break;
            }
        });

        const resetPersistence = OBR.broadcast.onMessage(Constants.RESETPERSISTID, async (_data) =>
        {
            await SMOKEMACHINE.ClearPersistence();
        });

        const enhancedBackgroundHandler = OBR.broadcast.onMessage(`${Constants.EXTENSIONID}/FOGBACKGROUNDEVENT`, async (data) =>
        {
            const message = data.data as FogMessage;
            this.expectedFogMapId = message.MapId;
            this.expectedFogStyle = message.FogStyle;
            this.expectedFogEffect = message.FogEffect;
        });

        await this.CheckRegistration();
        await this.SaveUserToScene();
    }

    public async SaveUserToScene()
    {
        // Safeguard this from loops
        await OBR.scene.setMetadata({
            [`${Constants.EXTENSIONID}/USER-${this.playerId}`]:
            {
                role: this.playerRole,
                name: this.playerName,
                color: this.playerColor
            }
        });
    }

    public KillHandlers()
    {
        if (this.caches.includes(BSCache.SCENEMETA) && this.sceneMetadataHandler !== undefined) this.sceneMetadataHandler!();
        if (this.caches.includes(BSCache.SCENEITEMS) && this.sceneItemsHandler !== undefined) this.sceneItemsHandler!();
        if (this.caches.includes(BSCache.SCENEITEMS) && this.sceneLocalHandler !== undefined) this.sceneLocalHandler!();
        if (this.caches.includes(BSCache.SCENEGRID) && this.sceneGridHandler !== undefined) this.sceneGridHandler!();
        if (this.caches.includes(BSCache.PLAYER) && this.playerHandler !== undefined) this.playerHandler!();
        if (this.caches.includes(BSCache.PARTY) && this.partyHandler !== undefined) this.partyHandler!();
        if (this.caches.includes(BSCache.ROOMMETA) && this.roomHandler !== undefined) this.roomHandler!();
        if (this.caches.includes(BSCache.SCENEFOG) && this.fogHandler !== undefined) this.fogHandler!();

        if (this.themeHandler !== undefined) this.themeHandler!();
    }

    public SetupHandlers()
    {
        if (this.sceneMetadataHandler === undefined || this.sceneMetadataHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEMETA))
            {
                this.sceneMetadataHandler = OBR.scene.onMetadataChange(async (metadata) =>
                {
                    // Handle Player Door Visibility being toggled off/on
                    if (this.sceneMetadata[`${Constants.EXTENSIONID}/playerDoors`] === true
                        && metadata[`${Constants.EXTENSIONID}/playerDoors`] !== true)
                    {
                        SMOKEMACHINE.ClearDoors();
                    }

                    if (BSCACHE.playerRole === "GM") 
                    {
                        // Handle Unit ContextMenu turning on and off
                        if (this.sceneMetadata[`${Constants.EXTENSIONID}/unitContextMenu`] !== true
                            && metadata[`${Constants.EXTENSIONID}/unitContextMenu`] === true)
                        {
                            await SetupUnitContextMenu(true);
                        }
                        else if (this.sceneMetadata[`${Constants.EXTENSIONID}/unitContextMenu`] === true
                            && metadata[`${Constants.EXTENSIONID}/unitContextMenu`] !== true)
                        {
                            await SetupUnitContextMenu(false);
                        }
                        
                        // Handle Wall ContextMenu turning on and off
                        if (this.sceneMetadata[`${Constants.EXTENSIONID}/wallContextMenu`] !== true
                            && metadata[`${Constants.EXTENSIONID}/wallContextMenu`] === true)
                        {
                            await SetupWallContextMenu(true);
                        }
                        else if (this.sceneMetadata[`${Constants.EXTENSIONID}/wallContextMenu`] === true
                            && metadata[`${Constants.EXTENSIONID}/wallContextMenu`] !== true)
                        {
                            await SetupWallContextMenu(false);
                        }

                        // Handle Autohide turning on and off
                        if (this.sceneMetadata[`${Constants.EXTENSIONID}/autoHide`] !== true
                            && metadata[`${Constants.EXTENSIONID}/autoHide`] === true)
                        {
                            await SetupAutoHideMenu(true);
                        }
                        else if (this.sceneMetadata[`${Constants.EXTENSIONID}/autoHide`] === true
                            && metadata[`${Constants.EXTENSIONID}/autoHide`] !== true)
                        {
                            await SetupAutoHideMenu(false);
                        }
                    }

                    // Handle Persistence being toggled off/on
                    if (this.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true
                        && metadata[`${Constants.EXTENSIONID}/persistence`] !== true)
                    {
                        SMOKEMACHINE.ClearPersistence();
                    }

                    // Handle Ownership being toggled on AFTER lights are built
                    if (this.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] !== true
                        && metadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] === true)
                    {
                        SMOKEMACHINE.InitiateOwnerHighlight();
                    }
                    else if (this.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] === true
                        && metadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] !== true)
                    {
                        SMOKEMACHINE.ClearOwnershipHighlights();
                    }

                    // Handle Vision being toggled off/on
                    const visionOff = metadata[`${Constants.EXTENSIONID}/disableVision`] as boolean;
                    if (visionOff !== undefined)
                    {
                        if ((this.sceneMetadata[`${Constants.EXTENSIONID}/disableVision`] === true
                            && metadata[`${Constants.EXTENSIONID}/disableVision`] !== true)
                            || (this.sceneMetadata[`${Constants.EXTENSIONID}/disableVision`] !== true
                                && metadata[`${Constants.EXTENSIONID}/disableVision`] === true))
                        {
                            SMOKEMACHINE.TogglePersistentLightVisibility(visionOff);
                        }
                    }

                    this.sceneMetadata = metadata;
                    await this.OnSceneMetadataChanges(metadata);
                });
            }
        }

        if (this.sceneItemsHandler === undefined || this.sceneItemsHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEITEMS))
            {
                this.sceneItemsHandler = OBR.scene.items.onChange(async (items) =>
                {
                    // Store the items first, as subsequent calls throughout will check the cache.
                    this.sceneItems = items;
                    await this.OnSceneItemsChange(items);
                });

                this.sceneLocalHandler = OBR.scene.local.onChange(async (localItems) =>
                {
                    const oldLocalItems = [...this.sceneLocal];
                    this.sceneLocal = localItems;
                    await this.OnSceneLocalChange(oldLocalItems);
                });
            }
        }

        if (this.sceneGridHandler === undefined || this.sceneGridHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEGRID))
            {
                this.sceneGridHandler = OBR.scene.grid.onChange(async (grid) =>
                {
                    await this.OnSceneGridChange(grid);
                    this.gridDpi = grid.dpi;
                    this.gridScale = parseInt(grid.scale);
                });
            }
        }

        if (this.playerHandler === undefined || this.playerHandler.length === 0)
        {
            if (this.caches.includes(BSCache.PLAYER))
            {
                this.playerHandler = OBR.player.onChange(async (player) =>
                {
                    const oldRole = this.playerRole;
                    let updateScenePlayerData = false;
                    if (this.playerName !== player.name
                        || this.playerColor !== player.color
                        || this.playerRole !== player.role)
                    {
                        updateScenePlayerData = true;
                    }

                    this.playerName = player.name;
                    this.playerColor = player.color;
                    this.playerId = player.id;
                    this.playerRole = player.role;
                    this.playerMetadata = player.metadata;
                    await this.OnPlayerChange(player, oldRole);

                    if (updateScenePlayerData)
                    {
                        await this.SaveUserToScene();
                    }
                });
            }
        }

        if (this.partyHandler === undefined || this.partyHandler.length === 0)
        {
            if (this.caches.includes(BSCache.PARTY))
            {
                this.partyHandler = OBR.party.onChange(async (party) =>
                {
                    this.party = party.filter(x => x.id !== "");
                    await this.OnPartyChange(party);
                });
            }
        }

        if (this.roomHandler === undefined || this.roomHandler.length === 0)
        {
            if (this.caches.includes(BSCache.ROOMMETA))
            {
                this.roomHandler = OBR.room.onMetadataChange(async (metadata) =>
                {
                    await this.OnRoomMetadataChange(metadata);
                    this.roomMetadata = metadata;
                });
            }
        }

        if (this.fogHandler === undefined || this.fogHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEFOG))
            {
                this.fogHandler = OBR.scene.fog.onChange(async (fog) =>
                {
                    await this.OnFogChange(fog);
                    this.fogColor = fog.style.color;
                    this.fogFilled = fog.filled;
                });
            }
        }

        if (this.themeHandler === undefined)
        {
            this.themeHandler = OBR.theme.onChange(async (theme) =>
            {
                this.theme = theme;
                await this.OnThemeChange(theme);
            });
        }

        // Only setup if we don't have one, never kill
        if (this.sceneReadyHandler === undefined)
        {
            this.sceneReadyHandler = OBR.scene.onReadyChange(async (ready) =>
            {
                this.sceneReady = ready;

                await this.OnSceneReadyChange(ready);
            });
        }
    }

    public async OnSceneMetadataChanges(_metadata: Metadata)
    {
        if (this.playerRole === "GM")
        {
        }
        await SMOKEMAIN.OnDataChange();
    }

    public async OnSceneItemsChange(items: Item[])
    {
        if (this.expectedFogMapId !== "")
        {
            const foundFogMaps = items.filter(x => x.id === this.expectedFogMapId);
            if (foundFogMaps.length > 0)
            {
                const enhancedFogMap = foundFogMaps[0] as Image;
                await ApplyEnhancedFog(enhancedFogMap, this.expectedFogEffect);
                this.expectedFogMapId = "";
                this.expectedFogStyle = "";
                this.expectedFogEffect = "";
            }
        }
        await SMOKEMAIN.OnDataChange();
    }

    public async OnSceneLocalChange(oldItems: Item[])
    {
        await SPECTREMACHINE.HandleLocalMovement(oldItems as Image[]);
    }

    public async OnSceneGridChange(_grid: Grid)
    {
        await SMOKEMAIN.OnDataChange();
    }

    public async OnSceneReadyChange(ready: boolean)
    {
        if (ready)
        {
            await this.SaveUserToScene();
            await this.RefreshCache();
            await SMOKEMACHINE.Reset();
            await SMOKEMAIN.Start();
            this.SetupHandlers();
        }
        else
        {
            this.KillHandlers();
            await SMOKEMAIN.Stop();
            this.sceneItems = [];
            this.sceneMetadata = {};

            if (this.playerRole === "GM")
            {
                this.toolStarted = false;
            }

            await OBR.tool.setMetadata(`${Constants.EXTENSIONID}/vision-tool`,
                {
                    [`${Constants.EXTENSIONID}/elevationEditor`]: false
                });
        }
    }

    public async OnPlayerChange(player: Player, oldRole: string)
    {
        if (this.playerRole !== oldRole)
        {
            await SMOKEMAIN.Stop();
            await SMOKEMACHINE.Reset();
            await SMOKEMAIN.Start();
        }

        if (player.role === "GM")
        {
            const tokens = document.querySelectorAll(".token-table-entry");
            for (let token of tokens)
            {
                let tokenId = token.id.substring(3);
                if (player.selection !== undefined && player.selection.includes(tokenId))
                {
                    token.classList.add("token-table-selected");
                } else
                {
                    token.classList.remove("token-table-selected");
                }
            }
            const metadata = player.metadata as Metadata;
            const lineToolMeta = metadata[`${Constants.EXTENSIONID}/finishLine`] ?? false;
            if (lineToolMeta === true)
            {
                FinishLineDrawing();
            }
            const lineToolMetaOther = metadata[`${Constants.EXTENSIONID}/cancelLine`] ?? false;
            if (lineToolMetaOther === true)
            {
                CancelLineDrawing();
            }

            const polyToolMeta = metadata[`${Constants.EXTENSIONID}/finishPoly`] ?? false;
            if (polyToolMeta === true)
            {
                FinishPolyDrawing();
            }
            const polyToolMetaOther = metadata[`${Constants.EXTENSIONID}/cancelPoly`] ?? false;
            if (polyToolMetaOther === true)
            {
                CancelPolyDrawing();
            }
        }
        else
        {
        }

        if (player.selection !== undefined && player.selection.length === 1)
        {
            SMOKEMACHINE.ToggleDoor(player.selection[0]);
        }
    }

    public async OnPartyChange(_party: Player[])
    {
        if (this.playerRole === "PLAYER")
        {

        }
        else
        {
            const playerContextMenu = document.getElementById("playerListing")!;
            playerContextMenu.innerHTML = "";
            playerContextMenu.appendChild(SMOKEMAIN.GetEmptyContextItem("Self"));

            const playerPreviewMenu = document.getElementById("preview_select")!;
            playerPreviewMenu.innerHTML = "";
            const selfItem = document.createElement("option");
            selfItem.value = BSCACHE.playerId;
            selfItem.textContent = `View As: Self`;
            playerPreviewMenu.appendChild(selfItem);

            for (const player of this.party)
            {
                const listItem = document.createElement("li");
                listItem.id = player.id;
                listItem.textContent = player.name;
                listItem.style.color = player.color;
                playerContextMenu.appendChild(listItem);

                const previewItem = document.createElement("option");
                previewItem.value = player.id;
                previewItem.textContent = `View As: ${player.name}`
                previewItem.style.color = player.color;
                playerPreviewMenu.appendChild(previewItem);
            }
            SPECTREMACHINE.UpdateSpectreTargets();
        }
    }

    public async OnFogChange(fog: Fog)
    {
        const toggleFogFill = document.getElementById("toggle_fogfill") as HTMLInputElement;
        if (toggleFogFill)
            toggleFogFill.checked = fog.filled;

        if (this.fogColor !== fog.style.color)
        {
            // If the color has changed, we need to update the uniforms on our effects.
            await SMOKEMACHINE.UpdateTrailingFogColor(fog.style.color);
        }
    }

    public async OnRoomMetadataChange(_metadata: Metadata)
    {
    }

    public async OnThemeChange(theme: Theme)
    {
        Utilities.SetThemeMode(theme, document);
    }

    public async ToggleBusy(on: boolean)
    {
        const playerPreviewSelect = document.getElementById("preview_select") as HTMLSelectElement;
        if (playerPreviewSelect.value !== BSCACHE.playerId && !on)
        {
            const currentPreviewPlayer = BSCACHE.party.find(x => x.id === playerPreviewSelect.value);
            if (currentPreviewPlayer)
            {
                await OBR.action.setBadgeText(`Viewing as: ${currentPreviewPlayer.name}`);
            }
        }
        else
        {
            await OBR.action.setBadgeText(on ? "⏱️" : undefined);
            BSCACHE.busy = on;
        }
    }

    public async CheckRegistration()
    {
        try
        {
            const debug = window.location.origin.includes("localhost") ? "eternaldream" : "";
            const userid = {
                owlbearid: BSCACHE.playerId
            };

            const requestOptions = {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json",
                    "Authorization": Constants.ANONAUTH,
                    "x-manuel": debug
                }),
                body: JSON.stringify(userid),
            };
            const response = await fetch(Constants.CHECKREGISTRATION, requestOptions);

            if (!response.ok)
            {
                const errorData = await response.json();
                // Handle error data
                console.error("Error:", errorData);
                return;
            }
            const data = await response.json();
            if (data.Data === "OK")
            {
                this.USER_REGISTERED = true;
                console.log("Connected");
            }
            else console.log("Not Registered");
        }
        catch (error)
        {
            // Handle errors
            console.error("Error:", error);
        }
    }

}
// Set the handlers needed for this Extension
export const BSCACHE = new BSCache([BSCache.SCENEITEMS, BSCache.SCENEMETA, BSCache.SCENEFOG, BSCache.SCENEGRID, BSCache.PLAYER, BSCache.PARTY]);

