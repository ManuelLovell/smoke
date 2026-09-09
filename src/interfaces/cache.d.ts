import type { Item, Player } from "@owlbear-rodeo/sdk";

interface BSCache
{
    cacheReady: boolean;
    setCacheReady: (ready: boolean) => void;

    sceneReady: boolean;
    setSceneReady: (ready: boolean) => void;

    items: Item[];
    setItems: (items: Item[]) => void;

    localItems: Item[];
    setLocalItems: (items: Item[]) => void;

    oldLocalItems: Item[];
    setOldLocalItems: (items: Item[]) => void;

    sceneMetadata: Record<string, unknown>;
    setSceneMetadata: (data: Record<string, unknown>) => void;

    roomMetadata: Record<string, unknown>;
    setRoomMetadata: (data: Record<string, unknown>) => void;

    sceneId: string;
    setSceneId: (sceneId: string) => void;

    gridDpi: number;
    setGridDpi: (data: number) => void;

    playerData?: Player;
    setPlayerData: (playerData: Player) => void;

    partyData: Player[];
    setPartyData: (party: Player[]) => void;

    expectedFogMapId: string;
    setExpectedFogMapId: (id: string) => void;

    expectedFogStyle: string;
    setExpectedFogStyle: (style: string) => void;

    expectedFogEffect: string;
    setExpectedFogEffect: (effect: string) => void;
}
