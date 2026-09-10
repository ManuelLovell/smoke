import OBR from '@owlbear-rodeo/sdk';
import { create } from 'zustand';
import type { Item, Metadata } from '@owlbear-rodeo/sdk';
import type { BSCache } from '../interfaces/cache';
import { Constants } from './BSConstants';

export interface RuntimeSystemTheme {
    primary: string;
    offset: string;
    background: string;
    border: string;
    background_url: string;
}

export const useSceneStore = create<BSCache>((set) => ({
    cacheReady: false,
    setCacheReady: (cache) => set({ cacheReady: cache }),

    sceneReady: false,
    setSceneReady: (ready) => set({ sceneReady: ready }),

    items: [],
    setItems: (items) => set({ items }),

    localItems: [],
    setLocalItems: (localItems) => set({ localItems }),

    oldLocalItems: [],
    setOldLocalItems: (oldLocalItems) => set({ oldLocalItems }),

    sceneMetadata: {},
    setSceneMetadata: (data) => set({ sceneMetadata: { ...data } }),

    roomMetadata: {},
    setRoomMetadata: (data) => set({ roomMetadata: { ...data } }),

    fogFilled: false,
    setFogFilled: (filled) => set({ fogFilled: filled }),

    sceneId: '',
    setSceneId: (sceneId) => set({ sceneId }),

    gridDpi: 150,
    setGridDpi: (dpi) => set({ gridDpi: dpi }),

    playerData: undefined,
    setPlayerData: (playerData) => set({ playerData }),

    partyData: [],
    setPartyData: (party) => set({ partyData: party }),

    expectedFogMapId: '',
    setExpectedFogMapId: (id) => set({ expectedFogMapId: id }),

    expectedFogStyle: '',
    setExpectedFogStyle: (style) => set({ expectedFogStyle: style }),

    expectedFogEffect: '',
    setExpectedFogEffect: (effect) => set({ expectedFogEffect: effect }),
}));

export const sceneStore = useSceneStore;

let fogFilled = false;
let fogColor = '#000000';
let gridType = 'SQUARE';
let gridScale = 1;

const readNumericMetadata = (key: string): number | null => {
    const value = useSceneStore.getState().sceneMetadata[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
};

void OBR.onReady(async () => {
    try {
        fogFilled = await OBR.scene.fog.getFilled();
        fogColor = await OBR.scene.fog.getColor();
    } catch {
        // Scene fog values are unavailable before the scene is fully ready.
    }

    try {
        gridType = await OBR.scene.grid.getType();
        const scaleData = await OBR.scene.grid.getScale();
        const parsedScale = Number(scaleData.parsed.multiplier ?? 1);
        // Normalize grid scale: reject Infinity/NaN, convert 0 to 1
        gridScale = Number.isFinite(parsedScale) && parsedScale !== 0 ? parsedScale : 1;
    } catch {
        // Grid values are optional until a scene is ready.
    }

    OBR.scene.fog.onChange((fog) => {
        fogFilled = fog.filled;

        void OBR.scene.fog.getColor().then((nextColor) => {
            fogColor = nextColor;
        }).catch(() => {
            // Ignore color refresh errors when scene context changes.
        });
    });

    OBR.scene.grid.onChange((grid) => {
        gridType = grid.type;
        const parts = grid.scale.match(/[a-z]+|[^a-z]+/gi);
        const parsedScale = parts && parts.length === 2 ? Number(parts[0]) : 5;
        // Normalize grid scale: reject Infinity/NaN, convert 0 to 1
        gridScale = Number.isFinite(parsedScale) && parsedScale !== 0 ? parsedScale : 5;
    });
});

interface LegacyBSCache {
    toolStarted: boolean;
    snap: boolean;
    disableWindows: string[];
    enableWindows: string[];
    sceneItems: Item[];
    sceneLocal: Item[];
    sceneMetadata: Metadata;
    roomMetadata: Metadata;
    sceneId: string;
    gridDpi: number;
    gridType: string;
    gridScale: number;
    gridSnap: number;
    playerId: string;
    playerRole: string;
    fogFilled: boolean;
    fogColor: string;
    ToggleBusy: (busy: boolean) => Promise<void>;
}

export const BSCACHE: LegacyBSCache = {
    toolStarted: false,
    snap: false,
    disableWindows: [],
    enableWindows: [],

    get sceneItems(): Item[] {
        return useSceneStore.getState().items;
    },

    get sceneLocal(): Item[] {
        return useSceneStore.getState().localItems;
    },

    get sceneMetadata(): Metadata {
        return useSceneStore.getState().sceneMetadata;
    },

    get roomMetadata(): Metadata {
        return useSceneStore.getState().roomMetadata;
    },

    get sceneId(): string {
        return useSceneStore.getState().sceneId;
    },

    get gridDpi(): number {
        return useSceneStore.getState().gridDpi;
    },

    get gridType(): string {
        return gridType;
    },

    get gridScale(): number {
        return gridScale;
    },

    get gridSnap(): number {
        const storedValue = readNumericMetadata(`${Constants.EXTENSIONID}/gridSnapWalls`);
        return storedValue && storedValue > 0 ? storedValue : useSceneStore.getState().gridDpi;
    },

    get playerId(): string {
        return useSceneStore.getState().playerData?.id ?? '';
    },

    get playerRole(): string {
        return useSceneStore.getState().playerData?.role ?? 'PLAYER';
    },

    get fogFilled(): boolean {
        return fogFilled;
    },

    get fogColor(): string {
        return fogColor;
    },

    async ToggleBusy(_busy: boolean): Promise<void> {
        return;
    },
};