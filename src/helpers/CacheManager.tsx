import { useEffect } from 'react';
import OBR, { type Player, Image } from '@owlbear-rodeo/sdk';
import { BSCACHE, useSceneStore } from '../helpers/BSCache';
import { OwlbearIds, Constants } from './BSConstants';
import LOGGER from './Logger';
import { SMOKEMACHINE } from '../scripts/smokeProcessor';
import { SPECTREMACHINE } from '../scripts/SpectreTwo';
import { cancelDrawing as CancelElevationDrawing, finishDrawing as FinishElevationDrawing, undoLastPoint as UndoElevationPoint } from '../scripts/elevationMode';
import { cancelDrawing as CancelLineDrawing, finishDrawing as FinishLineDrawing, undoLastPoint as UndoLinePoint } from '../scripts/visionLineMode';
import { cancelDrawing as CancelPolyDrawing, finishDrawing as FinishPolyDrawing, undoLastPoint as UndoPolygonPoint } from '../scripts/visionPolygonMode';
import { ApplyEnhancedFog } from '../scripts/smokeEnhancedFog';
import { HardwareWarning } from './BSUtilities';
import { SettingsConstants } from './MetadataKeys';

export function CacheSync({ children }: { children: React.ReactNode }) {
    const setItems = useSceneStore((s) => s.setItems);
    const setLocalItems = useSceneStore((s) => s.setLocalItems);
    const setOldLocalItems = useSceneStore((s) => s.setOldLocalItems);
    const setSceneMetadata = useSceneStore((s) => s.setSceneMetadata);
    const setSceneId = useSceneStore((s) => s.setSceneId);
    const setRoomMetadata = useSceneStore((s) => s.setRoomMetadata);
    const setFogFilled = useSceneStore((s) => s.setFogFilled);
    const setGridDpi = useSceneStore((s) => s.setGridDpi);
    const setGridSnap = useSceneStore((s) => s.setGridSnap);
    const setGridSnapDistance = useSceneStore((s) => s.setGridSnapDistance);
    const setPlayerData = useSceneStore((s) => s.setPlayerData);
    const setPartyData = useSceneStore((s) => s.setPartyData);
    const setExpectedFogMapId = useSceneStore((s) => s.setExpectedFogMapId);
    const setExpectedFogStyle = useSceneStore((s) => s.setExpectedFogStyle);
    const setExpectedFogEffect = useSceneStore((s) => s.setExpectedFogEffect);
    const playerData = useSceneStore((s) => s.playerData);

    const setSceneReady = useSceneStore((s) => s.setSceneReady);
    const setCacheReady = useSceneStore((s) => s.setCacheReady);

    useEffect(() => {
        let disposed = false;
        let isSyncing = false;
        let hasActiveSync = false;

        let unsubSceneReady: () => void;
        let unsubItems: () => void;
        let unsubLocalItems: () => void;
        let unsubSceneMetadata: () => void;
        let unsubRoomMetadata: () => void;
        let unsubGridDpi: () => void;
        let unsubPlayerData: () => void;
        let unsubPartyData: () => void;
        let unsubSmokeItems: () => void;
        let unsubSmokeLocalItems: () => void;
        let unsubResetPersistence: () => void;
        let unsubTrailingFogColor: () => void;
        let unsubDoorToggle: () => void;
        let unsubWarningCast: () => void;
        let unsubElevationEvent: () => void;
        let unsubLineEvent: () => void;
        let unsubPolygonEvent: () => void;
        let unsubFogBackgroundEvent: () => void;

        const clearSubscriptions = () => {
            unsubItems?.();
            unsubLocalItems?.();
            unsubSceneMetadata?.();
            unsubRoomMetadata?.();
            unsubGridDpi?.();
            unsubPlayerData?.();
            unsubPartyData?.();
            unsubSmokeItems?.();
            unsubSmokeLocalItems?.();
            unsubResetPersistence?.();
            unsubTrailingFogColor?.();
            unsubDoorToggle?.();
            unsubWarningCast?.();
            unsubElevationEvent?.();
            unsubLineEvent?.();
            unsubPolygonEvent?.();
            unsubFogBackgroundEvent?.();

            unsubItems = undefined as unknown as () => void;
            unsubLocalItems = undefined as unknown as () => void;
            unsubSceneMetadata = undefined as unknown as () => void;
            unsubRoomMetadata = undefined as unknown as () => void;
            unsubGridDpi = undefined as unknown as () => void;
            unsubPlayerData = undefined as unknown as () => void;
            unsubPartyData = undefined as unknown as () => void;
            unsubSmokeItems = undefined as unknown as () => void;
            unsubSmokeLocalItems = undefined as unknown as () => void;
            unsubResetPersistence = undefined as unknown as () => void;
            unsubTrailingFogColor = undefined as unknown as () => void;
            unsubDoorToggle = undefined as unknown as () => void;
            unsubWarningCast = undefined as unknown as () => void;
            unsubElevationEvent = undefined as unknown as () => void;
            unsubLineEvent = undefined as unknown as () => void;
            unsubPolygonEvent = undefined as unknown as () => void;
            unsubFogBackgroundEvent = undefined as unknown as () => void;
        };

        // Handler for SMOKEMACHINE-specific metadata operations
        const handleMetadataChange = async (newMetadata: Record<string, unknown>, oldMetadata: Record<string, unknown>) => {
            // Clear doors when player door visibility is toggled off
            if (oldMetadata[`${OwlbearIds.EXTENSIONID}/playerDoors`] === true
                && newMetadata[`${OwlbearIds.EXTENSIONID}/playerDoors`] !== true) {
                await SMOKEMACHINE.ClearDoors();
            }

            // Clear persistence when toggled off
            if (oldMetadata[`${OwlbearIds.EXTENSIONID}/persistence`] === true
                && newMetadata[`${OwlbearIds.EXTENSIONID}/persistence`] !== true) {
                await SMOKEMACHINE.ClearPersistence();
            }

            // Handle ownership highlight toggle
            if (oldMetadata[`${OwlbearIds.EXTENSIONID}/toggleOwnerLines`] !== true
                && newMetadata[`${OwlbearIds.EXTENSIONID}/toggleOwnerLines`] === true) {
                await SMOKEMACHINE.InitiateOwnerHighlight();
            } else if (oldMetadata[`${OwlbearIds.EXTENSIONID}/toggleOwnerLines`] === true
                && newMetadata[`${OwlbearIds.EXTENSIONID}/toggleOwnerLines`] !== true) {
                await SMOKEMACHINE.ClearOwnershipHighlights();
            }

            // Handle vision toggle
            const oldVisionOff = oldMetadata[`${OwlbearIds.EXTENSIONID}/disableVision`] as boolean | undefined;
            const newVisionOff = newMetadata[`${OwlbearIds.EXTENSIONID}/disableVision`] as boolean | undefined;
            if (oldVisionOff !== newVisionOff && newVisionOff !== undefined) {
                await SMOKEMACHINE.TogglePersistentLightVisibility(newVisionOff);
            }
        };

        const syncSceneState = async () => {
            if (disposed || isSyncing) {
                return;
            }

            isSyncing = true;

            try {
                clearSubscriptions();

            const [
                items,
                localItems,
                sceneMetadata,
                roomMetadata,
                gridDpi,
                fogFilled,
                players,
                playerSelection,
                playerColor,
                playerRole,
                playerConnectionId,
                playerId,
                playerMetadata,
                playerName,
            ] = await Promise.all([
                OBR.scene.items.getItems(),
                OBR.scene.local.getItems(),
                OBR.scene.getMetadata(),
                OBR.room.getMetadata(),
                OBR.scene.grid.getDpi(),
                OBR.scene.fog.getFilled(),
                OBR.party.getPlayers(),
                OBR.player.getSelection(),
                OBR.player.getColor(),
                OBR.player.getRole(),
                OBR.player.getConnectionId(),
                OBR.player.getId(),
                OBR.player.getMetadata(),
                OBR.player.getName(),
            ]);

            setItems(items);
            setLocalItems(localItems);
            setOldLocalItems(localItems); // Store initial local items for movement tracking
            setSceneMetadata(sceneMetadata);

            // Initialize sceneId if not present
            const existingSceneId = sceneMetadata[`${OwlbearIds.EXTENSIONID}/sceneId`] as string;
            if (existingSceneId && existingSceneId.length > 0) {
                setSceneId(existingSceneId);
            } else {
                const newSceneId = crypto.randomUUID();
                await OBR.scene.setMetadata({ [`${OwlbearIds.EXTENSIONID}/sceneId`]: newSceneId });
                setSceneId(newSceneId);
            }

            setFogFilled(fogFilled);
            setRoomMetadata(roomMetadata);
            setGridDpi(gridDpi);
            const initialGridSnap = sceneMetadata[SettingsConstants.GRID_SNAP];
            setGridSnap(typeof initialGridSnap === 'boolean' ? initialGridSnap : true);
            const initialGridSnapDistance = Number(sceneMetadata[SettingsConstants.GRID_SNAP_DISTANCE]);
            setGridSnapDistance(Number.isFinite(initialGridSnapDistance) ? initialGridSnapDistance : 10);
            setPlayerData({
                id: playerId,
                name: playerName,
                connectionId: playerConnectionId,
                role: playerRole,
                color: playerColor,
                selection: playerSelection,
                metadata: playerMetadata,
            } as Player);
            setPartyData(players);

            // Subscriptions
            unsubItems = OBR.scene.items.onChange(setItems);
            unsubLocalItems = OBR.scene.local.onChange(setLocalItems);
            unsubGridDpi = OBR.scene.grid.onChange((grid) => setGridDpi(grid.dpi));
            unsubPlayerData = OBR.player.onChange(setPlayerData);
            unsubPartyData = OBR.party.onChange(setPartyData);

            const saveUserToScene = async () => {
                // Safeguard this from loops
                await OBR.scene.setMetadata({
                    [`${Constants.EXTENSIONID}/USER-${playerId}`]:
                    {
                        role: playerRole,
                        name: playerName,
                        color: playerColor
                    }
                });
            }

            // Store old metadata for comparison on change
            let previousMetadata = sceneMetadata;

            // Consolidated metadata change handler for cache updates and SMOKEMACHINE operations
            unsubSceneMetadata = OBR.scene.onMetadataChange(async (metadata) => {
                // Handle SMOKEMACHINE-specific operations
                await handleMetadataChange(metadata, previousMetadata);

                const incomingGridSnap = metadata[SettingsConstants.GRID_SNAP];
                if (typeof incomingGridSnap === 'boolean') {
                    setGridSnap(incomingGridSnap);
                }

                const incomingGridSnapDistance = Number(metadata[SettingsConstants.GRID_SNAP_DISTANCE]);
                if (Number.isFinite(incomingGridSnapDistance)) {
                    setGridSnapDistance(incomingGridSnapDistance);
                }

                // Update cache
                setSceneMetadata(metadata);

                previousMetadata = metadata;
            });

            unsubRoomMetadata = OBR.room.onMetadataChange((metadata) => {
                setRoomMetadata(metadata);
            });

            // Smoke processor subscriptions - trigger rendering when items change
            unsubSmokeItems = OBR.scene.items.onChange(async (items) => {
                if (disposed || BSCACHE.busy) {
                    return;
                }

                // Handle enhanced fog if an expected fog map is being looked for
                const expectedMapId = useSceneStore.getState().expectedFogMapId;
                if (expectedMapId !== '') {
                    const fogMaps = items.filter(x => x.id === expectedMapId) as Image[];
                    if (fogMaps.length > 0) {
                        const enhancedFogMap = fogMaps[0];
                        const fogEffect = useSceneStore.getState().expectedFogEffect;
                        await ApplyEnhancedFog(enhancedFogMap, fogEffect);
                        // Clear the expected fog values
                        setExpectedFogMapId('');
                        setExpectedFogStyle('');
                        setExpectedFogEffect('');
                    }
                }

                await SMOKEMACHINE.Run();
                await SPECTREMACHINE.Run();
            });

            unsubSmokeLocalItems = OBR.scene.local.onChange(async (localItems) => {
                if (disposed || BSCACHE.busy) {
                    return;
                }

                const oldLocalItems = useSceneStore.getState().oldLocalItems as Image[];
                await SPECTREMACHINE.HandleLocalMovement(oldLocalItems);
                setOldLocalItems(localItems);
            });

            // Broadcast message handler for persistence reset
            unsubResetPersistence = OBR.broadcast.onMessage(
                Constants.RESETPERSISTID,
                async () => {
                    await SMOKEMACHINE.ClearPersistence();
                }
            );

            // Broadcast message handler for trailing fog color updates
            unsubTrailingFogColor = OBR.broadcast.onMessage(
                OwlbearIds.EXTENSIONID + '/fogColor',
                async (data) => {
                    const newColor = data.data as string;
                    if (typeof newColor === 'string') {
                        await SMOKEMACHINE.UpdateTrailingFogColor(newColor);
                    }
                }
            );

            // Broadcast message handler for door toggles
            unsubDoorToggle = OBR.broadcast.onMessage(
                OwlbearIds.EXTENSIONID + '/doorToggle',
                async (data) => {
                    const doorId = data.data as string;
                    if (typeof doorId === 'string') {
                        await SMOKEMACHINE.ToggleDoor(doorId);
                    }
                }
            );

            // Broadcast message handler for warning cast events
            unsubWarningCast = OBR.broadcast.onMessage(Constants.WARNINGCASTID, async (data) => {
                if (playerData?.role === 'GM') {
                    const playerId = data.data as string;
                    const partyState = useSceneStore.getState().partyData;
                    const player = partyState.find(x => x.id === playerId);
                    if (player) {
                        await HardwareWarning(false, [player]);
                    }
                }
            });

            // Broadcast message handler for elevation drawing events
            unsubElevationEvent = OBR.broadcast.onMessage(`${OwlbearIds.EXTENSIONID}/ELEVATIONEVENT`, (data) => {
                const event = data.data as string;
                switch (event) {
                    case 'CANCEL':
                        void CancelElevationDrawing();
                        break;
                    case 'FINISH':
                        void FinishElevationDrawing();
                        break;
                    case 'UNDO':
                        void UndoElevationPoint();
                        break;
                    default:
                        break;
                }
            });
            // Broadcast message handler for line drawing events
            unsubLineEvent = OBR.broadcast.onMessage(`${OwlbearIds.EXTENSIONID}/LINEEVENT`, (data) => {
                const event = data.data as string;
                switch (event) {
                    case 'CANCEL':
                        void CancelLineDrawing();
                        break;
                    case 'FINISH':
                        void FinishLineDrawing();
                        break;
                    case 'UNDO':
                        void UndoLinePoint();
                        break;
                    default:
                        break;
                }
            });

            // Broadcast message handler for polygon drawing events
            unsubPolygonEvent = OBR.broadcast.onMessage(`${OwlbearIds.EXTENSIONID}/POLYGONEVENT`, (data) => {
                const event = data.data as string;
                switch (event) {
                    case 'CANCEL':
                        void CancelPolyDrawing();
                        break;
                    case 'FINISH':
                        void FinishPolyDrawing();
                        break;
                    case 'UNDO':
                        void UndoPolygonPoint();
                        break;
                    default:
                        break;
                }
            });

            // Broadcast message handler for enhanced fog background events
            unsubFogBackgroundEvent = OBR.broadcast.onMessage(`${OwlbearIds.EXTENSIONID}/FOGBACKGROUNDEVENT`, async (data) => {
                const message = data.data as FogMessage;
                setExpectedFogMapId(message.MapId);
                setExpectedFogStyle(message.FogStyle);
                setExpectedFogEffect(message.FogEffect);
            });

            setCacheReady(true);

            // Initialize smoke processors when cache is ready
            await saveUserToScene();
            await SMOKEMACHINE.Initialize();
            await SMOKEMACHINE.Run();
            await SPECTREMACHINE.Initialize();
            await SPECTREMACHINE.Run();

            hasActiveSync = true;

            LOGGER.log('CacheManager: Cache is ready');
            } finally {
                isSyncing = false;
            }
        };

        // Extra onReady to catch late initializations
        OBR.onReady(async () => {
            if (disposed) {
                return;
            }

            const isReady = await OBR.scene.isReady();
            setSceneReady(isReady);
            let lastReady = isReady;

            if (isReady) {
                LOGGER.log('Scene is ready on initial load, syncing cache...');
                await syncSceneState();
            }

            unsubSceneReady = OBR.scene.onReadyChange(async (ready) => {
                if (disposed) {
                    return;
                }

                setSceneReady(ready);

                if (ready) {
                    if (!lastReady || !hasActiveSync) {
                        LOGGER.log('Scene became ready, syncing cache...');
                        await syncSceneState();
                    }
                } else {
                    LOGGER.log('Scene is no longer ready, clearing cache...');
                    clearSubscriptions();
                    hasActiveSync = false;
                    setCacheReady(false); // Scene closed, invalidate cache
                }

                lastReady = ready;
            });
        });

        return () => {
            disposed = true;
            unsubSceneReady?.();
            clearSubscriptions();
        };
    }, [
        setSceneReady,
        setCacheReady,
        setItems,
        setLocalItems,
        setSceneMetadata,
        setSceneId,
        setRoomMetadata,
        setGridDpi,
        setPlayerData,
        setPartyData,
        setExpectedFogMapId,
        setExpectedFogStyle,
        setExpectedFogEffect,
    ]);

    // Handle door selection - when a single item is selected, check if it's a door
    useEffect(() => {
        if (playerData?.selection && playerData.selection.length === 1) {
            const selectedItemId = playerData.selection[0];
            SMOKEMACHINE.ToggleDoor(selectedItemId);
        }
    }, [playerData?.selection]);

    return <>{children}</>;
}
