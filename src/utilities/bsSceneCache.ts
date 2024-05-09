import OBR, { Grid, Item, Image, Metadata, Player, Theme, Fog } from "@owlbear-rodeo/sdk";
import * as Utilities from './bsUtilities';
import { Constants } from "./bsConstants";
import { AddBorderIfNoAutoDetect } from "../smokeVisionUI";
import { SMOKEMAIN } from "../smokeMain";
import { UpdateMaps } from "../tools/import";
import { toggleDoor } from "../tools/doorTool";
import { RunSpectre, UpdateSpectreTargets } from "../spectreMain";
import { InitializeScene } from "../smokeInitializeScene";
import { OnSceneDataChange } from "../tools/smokeVisionProcess";
import { finishDrawing as FinishLineDrawing, cancelDrawing as CancelLineDrawing } from "../tools/visionLineMode";
import { finishDrawing as FinishPolyDrawing, cancelDrawing as CancelPolyDrawing } from "../tools/visionPolygonMode";
import { ObjectCache } from "./cache";

class BSCache
{
    // Cache Names
    static PLAYER = "PLAYER";
    static PARTY = "PARTY";
    static SCENEITEMS = "SCENEITEMS";
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
    gridScale: number; // IE; 5ft
    gridSnap: number;

    storedMetaItems: Item[];
    sceneItems: Item[];
    sceneSelected: string[];
    sceneMetadata: Metadata;
    sceneReady: boolean;
    sceneInitialized: boolean;

    roomMetadata: Metadata;

    theme: any;

    caches: string[];
    playerShadowCache: ObjectCache;

    ghosts: Image[];
    snap: boolean;
    torchActive: boolean;

    previousVisionShapes: string;
    previousAutohideItems: string;
    previousPlayersWithVision: string;
    previousSize: number[] = [];
    previousVisionEnabled: boolean;
    previousMap: string;
    previousAutodetectEnabled: boolean;
    previousFowEnabled: boolean;
    previousPersistenceEnabled: boolean;
    previousFowColor: string;

    busy: boolean;
    workers: Worker[];
    workersSetup: boolean;
    enableVisionDebug: boolean; // dev setting to enable debug visualisations

    //handlers
    sceneMetadataHandler?: () => void;
    sceneItemsHandler?: () => void;
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
        this.sceneItems = [];
        this.sceneSelected = [];
        this.sceneMetadata = {};
        this.gridDpi = 0;
        this.gridScale = 5;
        this.gridSnap = 10;
        this.sceneReady = false;
        this.sceneInitialized = false;
        this.theme = "DARK";
        this.roomMetadata = {};
        this.ghosts = [];
        this.snap = false;
        this.busy = false;
        this.torchActive = false;

        this.caches = caches;
        this.playerShadowCache = new ObjectCache(false);
        this.previousVisionShapes = "";
        this.previousAutohideItems = "";
        this.previousPlayersWithVision = "";
        this.previousSize = [];
        this.previousVisionEnabled = false;
        this.previousMap = "";
        this.previousAutodetectEnabled = false;
        this.previousFowEnabled = false;
        this.previousPersistenceEnabled = false;
        this.previousFowColor = "";
        this.enableVisionDebug = false;
        this.workers = [];
        this.workersSetup = false;
    }

    public async InitializeCache()
    {
        // Always Cache
        this.CreateWorkers();
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
                this.gridScale = (await OBR.scene.grid.getScale()).parsed?.multiplier ?? 5;
            }
        }

        if (this.caches.includes(BSCache.ROOMMETA))
        {
            if (this.sceneReady) this.roomMetadata = await OBR.room.getMetadata();
        }

        // This broadcast channel is solely being used to listen for Persistence Reset calls from the GM(s).
        const broadcastHandler = OBR.broadcast.onMessage(Constants.RESETID, async (data) =>
        {
            if (data.data)
            {
                await SMOKEMAIN.ResetPersistence();
            }
        });

        this.SaveUserToScene();
    }

    public CreateWorkers()
    {
        const maxWorkers = 16;
        const workerTotal = Math.min(navigator.hardwareConcurrency ?? 1, maxWorkers);

        for (let i = 0; i < workerTotal; i++)
        {
            const worker = new Worker('src/tools/worker.ts', { type: "module" });
            this.workers.push(worker);
        }
    }

    public async SaveUserToScene()
    {
        // Safeguard this from loops
        return;
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
                    // ADD PROCESS FOG
                });
            }
        }

        if (this.playerHandler === undefined || this.playerHandler.length === 0)
        {
            if (this.caches.includes(BSCache.PLAYER))
            {
                this.playerHandler = OBR.player.onChange(async (player) =>
                {
                    await this.OnPlayerChange(player);
                    this.playerName = player.name;
                    this.playerColor = player.color;
                    this.playerId = player.id;
                    this.playerRole = player.role;
                    this.playerMetadata = player.metadata;
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
            if (this.caches.includes(BSCache.ROOMMETA))
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
                this.theme = theme.mode;
                await this.OnThemeChange(theme);
            });
        }

        // Only setup if we don't have one, never kill
        if (this.sceneReadyHandler === undefined)
        {
            this.sceneReadyHandler = OBR.scene.onReadyChange(async (ready) =>
            {
                this.sceneReady = ready;

                if (ready)
                {
                    this.sceneItems = await OBR.scene.items.getItems();
                    this.sceneMetadata = await OBR.scene.getMetadata();
                    this.gridDpi = await OBR.scene.grid.getDpi();
                    this.gridScale = (await OBR.scene.grid.getScale()).parsed?.multiplier ?? 5;
                }
                await this.OnSceneReadyChange(ready);
            });
        }
    }

    public async OnSceneMetadataChanges(_metadata: Metadata)
    {
        if (this.playerRole === "GM")
        {
            await AddBorderIfNoAutoDetect();
        }
        await OnSceneDataChange();
    }


    public async OnSceneItemsChange(_items: Item[])
    {
        if (this.playerRole === "GM")
        {
            await SMOKEMAIN.UpdateUI();
            await UpdateMaps(SMOKEMAIN.mapAlign!);
        }
        else
        {
            SMOKEMAIN.UpdatePlayerVisionList();
        }
        await OnSceneDataChange();
    }

    public async OnSceneGridChange(_grid: Grid)
    {
        await OnSceneDataChange();
    }

    public async OnSceneReadyChange(ready: boolean)
    {
        if (ready)
        {
            //Turn off all handlers before Initializing a scene to avoid triggering updates with race conditions
            this.KillHandlers();
            await InitializeScene();
            await OnSceneDataChange();
            this.SetupHandlers();

            if (this.playerRole === "GM")
            {
                await AddBorderIfNoAutoDetect();
            }
        }
        else
        {
            if (this.playerRole === "GM")
            {
                this.sceneInitialized = false;
                await SMOKEMAIN.UpdateUI();
            }
        }
    }

    public async OnPlayerChange(player: Player)
    {
        await this.SaveUserToScene();
        if (this.playerRole !== player.role)
        {
            if (player.role === "GM")
            {
                await OBR.action.setHeight(510);
                await OBR.action.setWidth(420);
            }

            await SMOKEMAIN.SoftReset();
            if (player.role === "PLAYER") SMOKEMAIN.UpdatePlayerVisionList();
        }

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

        if (player.selection !== undefined && player.selection.length === 1)
        {
            toggleDoor(player.selection[0]);
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

    public async OnPartyChange(_party: Player[])
    {
        if (this.playerRole === "PLAYER")
        {
            await RunSpectre(this.party);
        }
        else
        {
            const playerContextMenu = document.getElementById("playerListing")!;
            playerContextMenu.innerHTML = "";
            playerContextMenu.appendChild(SMOKEMAIN.GetEmptyContextItem());

            for (const player of this.party)
            {
                const listItem = document.createElement("li");
                listItem.id = player.id;
                listItem.textContent = player.name;
                listItem.style.color = player.color;
                playerContextMenu.appendChild(listItem);
            }
            UpdateSpectreTargets();
            SMOKEMAIN.UpdatePlayerProcessUI();
        }
    }

    public async OnFogChange(_fog: Fog)
    {
    }

    public async OnRoomMetadataChange(_metadata: Metadata)
    {
    }

    public async OnThemeChange(theme: Theme)
    {
        Utilities.SetThemeMode(theme, document);
    }
}
// Set the handlers needed for this Extension
export const BSCACHE = new BSCache([BSCache.SCENEITEMS, BSCache.SCENEMETA, BSCache.SCENEFOG, BSCache.SCENEGRID, BSCache.PLAYER, BSCache.PARTY]);

