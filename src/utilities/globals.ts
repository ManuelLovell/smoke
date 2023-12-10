import { Fog, Item, Image, Metadata, Player } from "@owlbear-rodeo/sdk";

class SceneCache
{
    userId: string;
    role: "GM" | "PLAYER";
    items: Item[];
    ghosts: Image[];
    players: Player[];
    metadata: Metadata;
    gridDpi: number;
    gridScale: any;
    gridSnap: number;
    fog: Fog;
    ready: boolean;
    snap: boolean;
    initialized: boolean;
    lastReset: string;

    constructor()
    {
        this.userId = "";
        this.role = "PLAYER";
        this.items = [];
        this.players = [];
        this.ghosts = [];
        this.metadata = {};
        this.gridDpi = 0;
        this.gridScale = 0;
        this.gridSnap = 10;
        this.fog = {filled: false, style: { color: "white", strokeWidth: 0}};
        this.ready = false;
        this.snap = true;
        this.initialized = false;
        this.lastReset = "";
    }
};

export const sceneCache = new SceneCache();