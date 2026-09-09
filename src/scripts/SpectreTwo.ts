import OBR, { buildImage, Image, Item, Vector2 } from '@owlbear-rodeo/sdk';
import { Constants } from '../helpers/BSConstants';
import { useSceneStore } from '../helpers/BSCache';

type SpectreUpdate = {
    id: string;
    position: Vector2;
    rotation: number;
    scale: Vector2;
    layer: Image['layer'];
    zIndex: number;
    name: string;
    text: Image['text'];
    image: Image['image'];
    grid: Image['grid'];
};

type SpectreSceneUpdate = {
    id: string;
    position: Vector2;
    rotation: number;
    scale: Vector2;
    layer: Image['layer'];
    zIndex: number;
    disableAutoZIndex?: boolean;
};

class Spectre {
    spectresToCreate: Item[] = [];
    spectresToDelete: string[] = [];
    spectresToUpdate: SpectreUpdate[] = [];

    private isRunning = false;
    private runPending = false;
    private suppressLocalSyncIds: Set<string> = new Set();

    constructor() {}

    private async NotifyError(message: string, error: unknown): Promise<void> {
        console.error(message, error);
        await OBR.notification.show(message, 'ERROR');
    }

    private ClearQueues(): void {
        try {
            this.spectresToCreate = [];
            this.spectresToUpdate = [];
            this.spectresToDelete = [];
        } catch (error) {
            void this.NotifyError('There was a problem clearing spectre queues.', error);
        }
    }

    private NearlyEqual(first: number, second: number, epsilon = 0.01): boolean {
        return Math.abs(first - second) <= epsilon;
    }

    private EqualPosition(first: Vector2, second: Vector2): boolean {
        return (
            this.NearlyEqual(first.x, second.x) && this.NearlyEqual(first.y, second.y)
        );
    }

    private EqualScale(first: Vector2, second: Vector2): boolean {
        return (
            this.NearlyEqual(first.x, second.x) && this.NearlyEqual(first.y, second.y)
        );
    }

    private GetSpectreViewers(ghost: Image): string[] {
        try {
            const viewers = ghost.metadata[`${Constants.SPECTREID}/spectreViewers`];
            if (Array.isArray(viewers)) {
                return viewers.filter(
                    (viewer): viewer is string => typeof viewer === 'string' && viewer.length > 0
                );
            }
            return ghost.createdUserId ? [ghost.createdUserId] : [];
        } catch (error) {
            void this.NotifyError('There was a problem getting spectre viewers.', error);
            return ghost.createdUserId ? [ghost.createdUserId] : [];
        }
    }

    private QueueSuppressedLocalSync(localIds: string[]): void {
        try {
            for (const localId of localIds) {
                this.suppressLocalSyncIds.add(localId);
            }
        } catch (error) {
            void this.NotifyError('There was a problem suppressing local spectre sync.', error);
        }
    }

    public async Initialize(): Promise<void> {
        try {
            const sceneItems = useSceneStore.getState().items;
            const sceneSpectres = sceneItems.filter(
                (x) => x.metadata[`${Constants.SPECTREID}/isSpectre`] === true
            ) as Image[];
            for (const _spectre of sceneSpectres) {
                // In React, the SpectrePage component handles UI rendering
                // This is called to initialize state tracking
            }
        } catch (error) {
            await this.NotifyError('There was a problem initializing spectres.', error);
        }
    }

    public async Run(): Promise<void> {
        try {
            if (this.isRunning) {
                this.runPending = true;
                return;
            }

            this.isRunning = true;

            do {
                this.runPending = false;

                const sceneItems = useSceneStore.getState().items;
                const localItems = useSceneStore.getState().localItems;
                const playerData = useSceneStore.getState().playerData;

                if (!playerData) break;

                const sceneSpectres = sceneItems.filter(
                    (x) => x.metadata[`${Constants.SPECTREID}/isSpectre`] === true
                ) as Image[];
                const visibleSpectres = sceneSpectres.filter((x) =>
                    this.GetSpectreViewers(x).includes(playerData.id)
                );

                if (visibleSpectres.length > 0) {
                    for (const spectre of visibleSpectres) {
                        const existingSpectre = localItems.find(
                            (x) => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] === spectre.id
                        ) as Image | undefined;

                        if (!existingSpectre) {
                            this.CreateSpectreToQueue(spectre);
                        } else {
                            const equalPosition = this.EqualPosition(
                                spectre.position,
                                existingSpectre.position
                            );
                            const equalScale = this.EqualScale(spectre.scale, existingSpectre.scale);
                            const equalRotation = this.NearlyEqual(
                                spectre.rotation,
                                existingSpectre.rotation
                            );
                            const equalLayer = spectre.layer === existingSpectre.layer;
                            const equalZIndex = this.NearlyEqual(spectre.zIndex, existingSpectre.zIndex);
                            const equalName = spectre.name === existingSpectre.name;

                            if (
                                !equalRotation ||
                                !equalScale ||
                                !equalLayer ||
                                !equalPosition ||
                                !equalZIndex ||
                                !equalName
                            ) {
                                this.UpdateSpectreToQueue(spectre, existingSpectre);
                            }
                        }
                    }

                    const localSpectres = localItems.filter(
                        (x) => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined
                    ) as Image[];

                    for (const localSpectre of localSpectres) {
                        const exists = visibleSpectres.find(
                            (x) => x.id === localSpectre.metadata[`${Constants.SPECTREID}/isLocalSpectre`]
                        );
                        if (!exists) this.spectresToDelete.push(localSpectre.id);
                    }

                    if (this.spectresToCreate.length > 0) {
                        await OBR.scene.local.addItems(this.spectresToCreate);
                    }

                    if (this.spectresToDelete.length > 0) {
                        await OBR.scene.local.deleteItems(this.spectresToDelete);
                        for (const localId of this.spectresToDelete) {
                            this.suppressLocalSyncIds.delete(localId);
                        }
                    }

                    if (this.spectresToUpdate.length > 0) {
                        const localIdsToUpdate = localSpectres
                            .filter((x) => !this.spectresToDelete.includes(x.id))
                            .map((x) => x.id);

                        if (localIdsToUpdate.length > 0) {
                            this.QueueSuppressedLocalSync(localIdsToUpdate);
                            await OBR.scene.local.updateItems<Image>(localIdsToUpdate, (spectres) => {
                                for (const spectre of spectres) {
                                    const mine = this.spectresToUpdate.find((x) => x.id === spectre.id);
                                    if (mine) {
                                        spectre.layer = mine.layer;
                                        spectre.scale = mine.scale;
                                        spectre.rotation = mine.rotation;
                                        spectre.position = mine.position;
                                        spectre.zIndex = mine.zIndex;
                                        spectre.name = mine.name;
                                        spectre.text = mine.text;
                                        spectre.image = mine.image;
                                        spectre.grid = mine.grid;
                                    }
                                }
                            });
                        }
                    }
                } else {
                    const existingSpectres = localItems.filter(
                        (x) => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined
                    ) as Image[];
                    if (existingSpectres.length > 0) {
                        await OBR.scene.local.deleteItems(existingSpectres.map((x) => x.id));
                    }
                }

                this.ClearQueues();
            } while (this.runPending);
        } catch (error) {
            await this.NotifyError('There was a problem running spectre processing.', error);
        } finally {
            this.ClearQueues();
            this.isRunning = false;
        }
    }

    private CreateSpectreToQueue(token: Image): void {
        try {
            const playerData = useSceneStore.getState().playerData;
            if (!playerData) return;

            const item = buildImage(
                {
                    height: token.image.height,
                    width: token.image.width,
                    url: token.image.url,
                    mime: token.image.mime,
                },
                {
                    dpi: token.grid.dpi,
                    offset: token.grid.offset,
                }
            )
                .position(token.position)
                .scale(token.scale)
                .text(token.text)
                .rotation(token.rotation)
                .layer(token.layer)
                .metadata({
                    [`${Constants.SPECTREID}/isLocalSpectre`]: token.id,
                    [`${Constants.SPECTREID}/isSpectre`]: true,
                })
                .disableHit(false)
                .build();

            item.zIndex = token.zIndex;
            item.name = token.name;

            this.spectresToCreate.push(item);
        } catch (error) {
            void this.NotifyError('There was a problem queuing spectre creation.', error);
        }
    }

    private UpdateSpectreToQueue(token: Image, localToken: Image): void {
        try {
            const update = {
                id: localToken.id,
                position: token.position,
                rotation: token.rotation,
                scale: token.scale,
                layer: token.layer,
                zIndex: token.zIndex,
                name: token.name,
                text: token.text,
                image: token.image,
                grid: token.grid,
            };
            this.spectresToUpdate.push(update);
        } catch (error) {
            void this.NotifyError('There was a problem queuing spectre updates.', error);
        }
    }

    public async HandleLocalMovement(oldLocalItems: Image[]): Promise<void> {
        try {
            const sceneItems = useSceneStore.getState().items;
            const localItems = useSceneStore.getState().localItems;

            const oldLocalSpectres = oldLocalItems.filter(
                (x) => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined
            ) as Image[];

            if (oldLocalSpectres.length > 0) {
                const toUpdate: SpectreSceneUpdate[] = [];

                for (const oldLocal of oldLocalSpectres) {
                    if (this.suppressLocalSyncIds.has(oldLocal.id)) {
                        this.suppressLocalSyncIds.delete(oldLocal.id);
                        continue;
                    }

                    const newLocal = localItems.find((x) => x.id === oldLocal.id);
                    if (!newLocal) continue;

                    const equalPosition = this.EqualPosition(oldLocal.position, newLocal.position);
                    const equalScale = this.EqualScale(oldLocal.scale, newLocal.scale);
                    const equalRotation = this.NearlyEqual(oldLocal.rotation, newLocal.rotation);
                    const equalLayer = oldLocal.layer === newLocal.layer;
                    const equalZIndex = this.NearlyEqual(oldLocal.zIndex, newLocal.zIndex);
                    const equalDisableAutoZ =
                        oldLocal.disableAutoZIndex === newLocal.disableAutoZIndex;

                    if (
                        !equalPosition ||
                        !equalScale ||
                        !equalRotation ||
                        !equalLayer ||
                        !equalZIndex ||
                        !equalDisableAutoZ
                    ) {
                        const sceneItemMatch = sceneItems.find(
                            (x) => x.id === newLocal.metadata[`${Constants.SPECTREID}/isLocalSpectre`]
                        );
                        if (sceneItemMatch) {
                            const update = {
                                id: sceneItemMatch.id,
                                position: newLocal.position,
                                scale: newLocal.scale,
                                rotation: newLocal.rotation,
                                layer: newLocal.layer,
                                zIndex: newLocal.zIndex,
                                disableAutoZIndex: newLocal.disableAutoZIndex === true,
                            };
                            toUpdate.push(update);
                        }
                    }
                }

                if (toUpdate.length > 0) {
                    await OBR.scene.items.updateItems<Image>(
                        toUpdate.map((x) => x.id),
                        (items) => {
                            for (const item of items) {
                                const mine = toUpdate.find((x) => x.id === item.id);
                                if (mine) {
                                    item.position = mine.position;
                                    item.scale = mine.scale;
                                    item.rotation = mine.rotation;
                                    item.layer = mine.layer;
                                    item.zIndex = mine.zIndex;
                                }
                            }
                        }
                    );
                }
            }
        } catch (error) {
            await this.NotifyError('There was a problem syncing local spectre movement.', error);
        }
    }

    public UpdateSpectreTargets(): void {
        try {
            // In React, the SpectrePage component automatically updates when party data changes
            // This method is kept for API compatibility
        } catch (error) {
            void this.NotifyError('There was a problem updating spectre targets.', error);
        }
    }

    public RemoveGhostSelect(_ghostId: string): void {
        try {
            // In React, the SpectrePage component handles UI rendering
            // This method is kept for API compatibility with context menu
        } catch (error) {
            void this.NotifyError('There was a problem removing spectre controls.', error);
        }
    }

    public CheckForRemovedTokens(): void {
        try {
            const sceneItems = useSceneStore.getState().items;
            const localItems = useSceneStore.getState().localItems;

            // Check if local spectres reference deleted scene items
            const localSpectres = localItems.filter(
                (x) => x.metadata[`${Constants.SPECTREID}/isLocalSpectre`] !== undefined
            ) as Image[];

            for (const localSpectre of localSpectres) {
                const parentId = localSpectre.metadata[`${Constants.SPECTREID}/isLocalSpectre`] as string;
                const exists = sceneItems.find((x) => x.id === parentId);
                if (!exists) {
                    // Parent spectre was deleted, mark local for deletion
                    this.spectresToDelete.push(localSpectre.id);
                }
            }

            if (this.spectresToDelete.length > 0) {
                void OBR.scene.local.deleteItems(this.spectresToDelete);
                this.spectresToDelete = [];
            }
        } catch (error) {
            void this.NotifyError('There was a problem checking for removed spectres.', error);
        }
    }
}

export const SPECTREMACHINE = new Spectre();
