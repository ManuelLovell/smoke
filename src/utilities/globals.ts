import { Fog, Image, Metadata, Player } from "@owlbear-rodeo/sdk";

class SceneCash
{
    userId: string;
    role: string;
    items: Image[];
    players: Player[];
    metadata: Metadata;
    gridDpi: number;
    gridScale: any;
    fog: Fog;
    ready: boolean;

    constructor()
    {
        this.userId = "";
        this.role = "PLAYER";
        this.items = [];
        this.players = [];
        this.metadata = {};
        this.gridDpi = 0;
        this.gridScale = 0;
        this.fog = {filled: false, style: { color: "white", strokeWidth: 0}};
        this.ready = false;
    }
};

export const sceneCache = new SceneCash();