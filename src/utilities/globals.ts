import { Fog, Image, Metadata, Player } from "@owlbear-rodeo/sdk";

class SceneCash
{
    userId: string;
    role: string;
    items: Image[];
    ghosts: Image[];
    ghostViewers: GhostView[];
    players: Player[];
    metadata: Metadata;
    gridDpi: number;
    gridScale: any;
    gridSnap: number;
    fog: Fog;
    ready: boolean;

    constructor()
    {
        this.userId = "";
        this.role = "PLAYER";
        this.items = [];
        this.players = [];
        this.ghosts = [];
        this.ghostViewers = [];
        this.metadata = {};
        this.gridDpi = 0;
        this.gridScale = 0;
        this.gridSnap = 10;
        this.fog = {filled: false, style: { color: "white", strokeWidth: 0}};
        this.ready = false;
    }
};

export const sceneCache = new SceneCash();