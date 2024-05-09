import OBR, { buildPath, buildShape, Image, isImage, Item, Shape, ItemFilter, isPath, Path, Player } from "@owlbear-rodeo/sdk";
import PathKitInit from "pathkit-wasm/bin/pathkit";
import wasm from "pathkit-wasm/bin/pathkit.wasm?url";
import { Timer } from "../utilities/debug";
import { comparePosition } from "../utilities/math";
import { isVisionFog, isActiveVisionLine, isTokenWithVision, isBackgroundBorder, isIndicatorRing, isTokenWithVisionIOwn, isTrailingFog, isAnyFog, isTokenWithVisionForUI, isTorch, isAutohide } from "../utilities/itemFilters";
import { Constants } from "../utilities/bsConstants";
import { getDoorPath, initDoors } from "./doorTool";
import { CreateObstructionLines, CreatePolygons } from "./smokeCreateObstructions";
import { BSCACHE } from "../utilities/bsSceneCache";

export let PathKit: any;

// This is the function responsible for computing the shadows and the FoW
export async function OnSceneDataChange(forceUpdate?: boolean)
{
    await OBR.action.setBadgeText("⏱️");
    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/processed`]: false });

    if (!PathKit)
    {
        PathKit = await PathKitInit({ locateFile: () => wasm });
    }

    if (!BSCACHE.sceneReady)
    {
        // If we change scenes we should invalidate the cache
        BSCACHE.playerShadowCache.invalidate();
        BSCACHE.busy = false;
        await OBR.action.setBadgeText(undefined);
        return;
    }

    if (BSCACHE.busy || !BSCACHE.sceneInitialized)
    {
        return;
    }

    // Packing SceneDataChange Prep
    BSCACHE.busy = true;

    const [awaitTimer, computeTimer] = [new Timer(), new Timer()];

    awaitTimer.start();
    awaitTimer.pause();
    computeTimer.start();

    const ALLVISIONTOKENS = BSCACHE.sceneItems.filter((item) => isTokenWithVision(item) && (!isTorch(item) || item.visible === true));
    const visionShapes = BSCACHE.sceneItems.filter(isActiveVisionLine);
    const autoHideItems = BSCACHE.sceneItems.filter(isAutohide);
    const backgroundImage = BSCACHE.sceneItems.filter(isBackgroundBorder)?.[0] as any as Shape;
    const visionEnabled = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    const persistenceEnabled = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistenceEnabled`] === true;
    const autodetectEnabled = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === true;
    const fowEnabled = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowEnabled`] === true;
    const fowColor = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowColor`] as string;
    const playerDoors = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/playerDoors`] === true;

    let mapSize: number[] = [];
    let mapScale: number[] = [];
    let mapOffset: number[] = [];

    let invalidateCache = false;
    let TOKENSVIEWABLE: Item[] = [];

    if (backgroundImage === undefined)
    {
        mapSize[0] = 0;
        mapSize[1] = 0;
        mapScale[0] = 1;
        mapScale[1] = 1;
        mapOffset[0] = 0;
        mapOffset[1] = 0;
    }
    else
    {
        mapSize[0] = backgroundImage.width * backgroundImage.scale.x;
        mapSize[1] = backgroundImage.height * backgroundImage.scale.y;
        mapScale[0] = backgroundImage.scale.x;
        mapScale[1] = backgroundImage.scale.y;
        mapOffset[0] = backgroundImage.position.x;
        mapOffset[1] = backgroundImage.position.y;

        // This fixes images being offset from the original position in the earlier versions, though doesnt apply to smoke:
        // const offset = [backgroundImage.position.x - (backgroundImage.grid.offset.x * dpiRatio), backgroundImage.position.y - (backgroundImage.grid.offset.y * dpiRatio)];
    }

    if (BSCACHE.playerRole === "GM")
    {
        TOKENSVIEWABLE = ALLVISIONTOKENS;
        const mapHeight = document.getElementById("mapHeight")! as HTMLInputElement;
        const mapWidth = document.getElementById("mapWidth")! as HTMLInputElement;
        if (mapWidth) mapWidth.value = (Math.round(mapSize[0]) / BSCACHE.gridDpi).toString();
        if (mapHeight) mapHeight.value = (Math.round(mapSize[1]) / BSCACHE.gridDpi).toString();

    }
    else
    {
        TOKENSVIEWABLE = ALLVISIONTOKENS.filter(isTokenWithVisionIOwn);
        for (const avToken of ALLVISIONTOKENS)
        {
            // Fish out the GM only Tokens based on saved user data
            if (isTokenWithVision(avToken))
            {
                const tokenOwner = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${avToken.createdUserId}`] as Player;
                if (tokenOwner?.role === "GM") TOKENSVIEWABLE.push(avToken);
            }
        }
    }

    // Check if any values have changed and a re-draw is necessary
    const sVisionShapes = JSON.stringify(visionShapes);
    const sAutohideItems = JSON.stringify(autoHideItems);
    const sPlayersWithVision = JSON.stringify(TOKENSVIEWABLE);
    const sBackgroundImage = JSON.stringify(backgroundImage);

    if (BSCACHE.previousMap === sBackgroundImage
        && BSCACHE.previousVisionEnabled === visionEnabled
        && BSCACHE.previousFowColor === fowColor
        && BSCACHE.previousAutodetectEnabled === autodetectEnabled
        && BSCACHE.previousFowEnabled === fowEnabled
        && BSCACHE.previousPersistenceEnabled === persistenceEnabled
        && BSCACHE.previousVisionShapes === sVisionShapes
        && BSCACHE.previousAutohideItems === sAutohideItems
        && BSCACHE.previousPlayersWithVision === sPlayersWithVision
        && BSCACHE.previousSize[0] === mapSize[0]
        && BSCACHE.previousSize[1] === mapSize[1]
        && forceUpdate !== true)
    {
        BSCACHE.busy = false;
        await OBR.action.setBadgeText(undefined);
        return;
    }

    // Check if the cache needs to be invalidated
    if (sBackgroundImage != BSCACHE.previousMap
        || BSCACHE.previousVisionShapes != sVisionShapes
        || mapSize[0] != BSCACHE.previousSize[0]
        || mapSize[1] != BSCACHE.previousSize[1])
    {
        invalidateCache = true;
    }

    BSCACHE.previousMap = sBackgroundImage;
    BSCACHE.previousPlayersWithVision = sPlayersWithVision;
    BSCACHE.previousVisionShapes = sVisionShapes;
    BSCACHE.previousSize = mapSize;
    BSCACHE.previousVisionEnabled = visionEnabled;
    BSCACHE.previousAutodetectEnabled = autodetectEnabled;
    BSCACHE.previousFowEnabled = fowEnabled;
    BSCACHE.previousFowColor = fowColor;
    BSCACHE.previousPersistenceEnabled = persistenceEnabled;
    computeTimer.pause();


    if (BSCACHE.enableVisionDebug)
    {
        // remove debug visualisations from any previous pass..
        await OBR.scene.local.deleteItems((await OBR.scene.local.getItems(f => f.metadata[`${Constants.EXTENSIONID}/debug`] === true)).map(i => i.id));
    }

    const stages: any[] = [];
    for (let i = 0; i <= 6; i++) stages.push(new Timer());

    stages[1].start();

    let [width, height] = mapSize;

    if (autodetectEnabled)
    {
        // draw a big box around all the maps
        const maps: Image[] = BSCACHE.sceneItems.filter((item) => item.layer === "MAP" && isImage(item)) as Image[];

        let mapbox = [];
        for (let map of maps)
        {
            let dpiRatio = BSCACHE.gridDpi / map.grid.dpi;

            let left = map.position.x - (dpiRatio * map.grid.offset.x) * map.scale.x;
            let top = map.position.y - (dpiRatio * map.grid.offset.y) * map.scale.y;
            let right = left + (dpiRatio * map.image.width) * map.scale.x;
            let bottom = top + (dpiRatio * map.image.height) * map.scale.y;

            if (map.rotation > 0)
            {
                const twidth = Math.abs(right - left);
                const theight = Math.abs(bottom - top);
                switch (map.rotation)
                {
                    case 270:
                        top -= theight;
                        bottom -= theight;
                        break;

                    case 180:
                        top -= theight;
                        bottom -= theight;
                        left -= twidth;
                        right -= twidth;
                        break;

                    case 90:
                        left -= twidth;
                        right -= twidth;
                        break;
                }
            }

            if (!mapbox.length)
            {
                mapbox[0] = left;
                mapbox[1] = top;
                mapbox[2] = right;
                mapbox[3] = bottom;
            } else
            {
                if (left < mapbox[0]) mapbox[0] = left;
                if (top < mapbox[1]) mapbox[1] = top;
                if (right > mapbox[2]) mapbox[2] = right;
                if (bottom > mapbox[3]) mapbox[3] = bottom;
            }
        }

        mapOffset = [mapbox[0], mapbox[1]];
        mapSize = [mapbox[2] - mapbox[0], mapbox[3] - mapbox[1]];
        mapScale = [1, 1];
        [width, height] = mapSize;
    }

    let cacheHits = 0, cacheMisses = 0;
    if (invalidateCache)  // Something significant changed => invalidate cache
        BSCACHE.playerShadowCache.invalidate();

    computeTimer.resume();

    const shouldComputeVision = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    if (!shouldComputeVision || TOKENSVIEWABLE.length == 0)
    {
        // Clear fog
        const fogItems = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
        await OBR.scene.local.deleteItems(fogItems.map(fogItem => fogItem.id));

        BSCACHE.busy = false;
        await OBR.action.setBadgeText(undefined);
        return;
    }

    /*
     * Stage 1: Calculate obstruction lines and fog shapes
     */

    // Extract all obstruction lines
    const obstructionLines: ObstructionLine[] = CreateObstructionLines(visionShapes);

    // Create polygons containing the individual shadows cast by a vision line from the point of view of one player.
    // Array of players, array of cast lines
    const polygons: Polygon[][] = CreatePolygons(obstructionLines, TOKENSVIEWABLE, width, height, mapOffset as any, mapScale as any);

    if (polygons.length == 0)
    {
        BSCACHE.busy = false;
        await OBR.action.setBadgeText(undefined);
        return;
    }

    const playerRings: Shape[] = [];
    stages[1].pause();
    stages[2].start();

    /*
     * Stage 2: Compute shadow polygons for each player,
     * merging all polygons created previously (this can probably be merged into the last step)
     */

    // This could be optimised by using separate fog areas on separate map tiles to avoid having to process so many obstruction lines..
    // However it might not be what people want in some cases with stiched maps

    const itemsPerPlayer: Record<number, any> = {};
    let currentProcess = 0;

    await ProcessPlayer();

    async function ProcessPlayer()
    {
        const playerToken = TOKENSVIEWABLE[currentProcess];

        let cacheResult = BSCACHE.playerShadowCache.getValue(playerToken.id);

        if (cacheResult !== undefined
            && comparePosition(cacheResult.player.position, playerToken.position)
            && cacheResult.player.metadata[`${Constants.EXTENSIONID}/visionRange`] === playerToken.metadata[`${Constants.EXTENSIONID}/visionRange`])
        {
            // The value is cached, use it
            const cachedPath = PathKit.FromCmds(cacheResult.shadowPath);
            itemsPerPlayer[currentProcess] = cachedPath;
            cacheHits++;

            if (currentProcess === (TOKENSVIEWABLE.length - 1))
            {
                await CompleteProcess(stages);
                return;
            }
            else
            {
                currentProcess++;
                await ProcessPlayer();
                return;
            }
        }

        cacheMisses++;
        const playerPolygons = polygons[currentProcess];

        let pPathBuilder = new PathKit.SkOpBuilder();
        const tempPath = PathKit.NewPath().rect(mapOffset[0], mapOffset[1], mapSize[0], mapSize[1]);
        pPathBuilder.add(tempPath, PathKit.PathOp.UNION);
        tempPath.delete();

        await ProcessWithWorkers(playerPolygons);
        function ProcessWithWorkers(polygons: any[])
        {
            const chunkSize = Math.ceil(polygons.length / BSCACHE.workers.length);
            let chunkStart = 0;
            let workersCompleted = 0;
            let workerData: Record<number, string> = {};
            // Launch workers and set up event handlers
            for (let i = 0; i < BSCACHE.workers.length; i++)
            {
                const chunkEnd = chunkStart + chunkSize;
                const chunk = polygons.slice(chunkStart, chunkEnd + 10);

                // Set up event handler for each worker
                BSCACHE.workers[i].onmessage = async function (e)
                {
                    if (e.data)
                    {
                        const { numb, messageData } = e.data;
                        workersCompleted++;
                        workerData[numb] = messageData;

                        if (workersCompleted === BSCACHE.workers.length)
                        {
                            // Reassemble in order
                            for (let j = 0; j < BSCACHE.workers.length; j++)
                            {
                                const svgPath = PathKit.FromCmds(workerData[j]);
                                pPathBuilder.add(svgPath, PathKit.PathOp.INTERSECT);
                                svgPath.delete();
                            }

                            // All workers have completed their tasks
                            let playerPaths = pPathBuilder.resolve();
                            playerPaths.simplify();

                            if (!playerPaths)
                            {
                                console.error("Couldn't compute fog");
                                BSCACHE.busy = false;
                                await OBR.action.setBadgeText(undefined);
                                return;
                            }

                            itemsPerPlayer[currentProcess] = playerPaths; // These paths are cleaned up wayyy later.
                            if (cacheResult !== undefined)
                            {
                                cacheResult.shadowPath = "";
                            }

                            // Cache the computed path for future use
                            const toCachePath = playerPaths.toCmds();
                            BSCACHE.playerShadowCache.cacheValue(playerToken.id, {
                                shadowPath: toCachePath,
                                player: playerToken
                            });

                            pPathBuilder.delete();

                            if (currentProcess === (TOKENSVIEWABLE.length - 1))
                                await CompleteProcess(stages);
                            else
                            {
                                currentProcess++;
                                await ProcessPlayer();
                            }
                        }
                    }
                };
                // Send message to worker
                BSCACHE.workers[i].postMessage({ numb: i, polygons: chunk, mapOffset: mapOffset, mapSize: mapSize });

                // Update chunk start for next iteration
                chunkStart = chunkEnd;
            }
        }
    }

    async function CompleteProcess(stages: any[])
    {
        stages[2].pause();
        stages[3].start();

        const intersectTorches = [];
        const intersectFullVision = PathKit.NewPath();

        /*
         * Stage 3: Calculate vision ranges
         * Intersect each player and torch vision with a circle based on their vision range,
         * Then if a player has line of sight to a torch, include it's vision path.
         */

        for (let i = 0; i < TOKENSVIEWABLE.length; i++)
        {
            const token = TOKENSVIEWABLE[i];
            const visionRangeMeta = token.metadata[`${Constants.EXTENSIONID}/visionRange`] as number;
            const myToken = (BSCACHE.playerId === TOKENSVIEWABLE[i].createdUserId);

            const tokenOwner = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${TOKENSVIEWABLE[i].createdUserId}`] as Player;
            const gmToken = tokenOwner?.role === "GM";

            if (isTorch(token))
            {
                intersectTorches[i] = true;
            } else
            {
                // calculate the vision areas of all non-torch tokens into one path, so we can intersect this with the torches to limit the visibility to only what the players can see:
                intersectFullVision.op(itemsPerPlayer[i], PathKit.PathOp.UNION);
            }

            // if vision range isnt unlimited, intersect it with a circle:
            if (visionRangeMeta)
            {
                if ((!myToken && BSCACHE.playerRole !== "GM") && !gmToken) continue;

                const visionRange = BSCACHE.gridDpi * (visionRangeMeta / BSCACHE.gridScale + .5);
                const ellipse = PathKit.NewPath().ellipse(token.position.x, token.position.y, visionRange, visionRange, 0, 0, 2 * Math.PI);
                itemsPerPlayer[i]?.op(ellipse, PathKit.PathOp.INTERSECT);
                ellipse.delete();

                // Get Color for Players
                const owner = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${token.createdUserId}`] as Player;
                if (owner && BSCACHE.playerRole === "GM" && !isTorch(token))
                {
                    // Add indicator rings intended for the GM
                    if (owner.role !== "GM")
                    {
                        const playerRing = buildShape().strokeColor(owner.color).fillOpacity(0)
                            .position({ x: token.position.x, y: token.position.y }).width(visionRange * 2)
                            .height(visionRange * 2).shapeType("CIRCLE").metadata({ [`${Constants.EXTENSIONID}/isIndicatorRing`]: true }).locked(true).build();
                        playerRings.push(playerRing);
                    }
                }
            }
        }

        // Intersect torches based on available view
        intersectFullVision.simplify();
        for (let i = 0; i < intersectTorches.length; i++)
        {
            if (intersectTorches[i] === true)
            {
                // intersect torch(i) against the full range of vision of the player token(j):
                itemsPerPlayer[i].op(intersectFullVision, PathKit.PathOp.INTERSECT);
                itemsPerPlayer[i].simplify();
            }
        }

        intersectFullVision.delete();

        stages[3].pause();
        stages[4].start();

        /*
         * Stage 4: Persistent and trailing fog
         */

        // List of fog items to add
        const itemsToAdd = [];

        // Batched OBR calls
        const promisesToExecute = [];

        // Settings

        // Overlay to cut out trailing fog
        const trailingFogRect = PathKit.NewPath();

        // Deduplicate calls when adding items to the scene
        const dedup_digest = {} as any;

        const localItemCache = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
        const oldRings = await OBR.scene.local.getItems(isIndicatorRing as ItemFilter<Image>);

        if (fowEnabled)
        {
            // Create a rect (around our fog area, needs autodetection or something), which we then carve out based on the path showing the currently visible area
            trailingFogRect.rect(mapOffset[0], mapOffset[1], mapSize[0], mapSize[1]);
        }

        // This... should just work.. the logic seems sound.
        // During testing I ran into issues joining the paths together where it seemed to create overlapping paths with the union that would end up cutting holes in the path instead of filling them.
        // I can no longer replicate it, but I had turned this code path on, got 2 tokens, and just move them around next to eachother after a fog refresh, and it soon glitched.
        let reuseFog: Image[] = [];
        let reuseNewFog: any;
        let oldPath: any = null;

        // Reuse a single (but insanely complex) path to avoid overhead of lots of fog items
        if (persistenceEnabled)
        {
            // Reuse the same localItem and change the path.
            reuseFog = localItemCache.filter(item => isVisionFog(item));
            reuseNewFog = new PathKit.SkOpBuilder();
            dedup_digest["reuse"] = true;

            if (reuseFog.length === 0)
            {
                // Create a new visionFog item with an empty path, so we can add to it.
                // Note that the digest is forced, which avoids the object being reused by the deduplication code.
                const path = buildPath().commands([]).fillRule("evenodd").locked(true).visible(false).fillColor('#000000').strokeColor("#000000").layer("FOG").name("Fog of War").metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true, [`${Constants.EXTENSIONID}/digest`]: "reuse" }).build();

                // set our fog zIndex to 3, otherwise it can sometimes draw over the top of manually created fog objects:
                path.zIndex = 3;

                await OBR.scene.local.addItems([path]);
                reuseFog = await OBR.scene.local.getItems(isVisionFog as ItemFilter<Image>);
            }
            else
            {
                // Initalize the new path builder with the existing item's path:
                oldPath = PathKit.FromCmds((reuseFog[0] as any).commands);
                oldPath.setFillType(PathKit.FillType.EVENODD);
            }
        }

        const currentFog = new PathKit.SkOpBuilder();
        let useTokenVisibility = false;

        // Iterate over each of the fog paths (per token), and either:
        //   Add them to the list of fog items to add to the scene, deduplicating based on a hash of the fog path,
        //   or, if persistence/persistenceEnabled is enabled, then add the paths to a single path to reuse the existing fog item in the scene.

        for (const key of Object.keys(itemsPerPlayer) as any)
        {
            const item = itemsPerPlayer[key];

            const encoder = new TextEncoder();
            const data = encoder.encode(item.toCmds().toString());

            const digest = await crypto.subtle.digest("SHA-1", data).then(hash =>
            {
                return ([...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join(''));
            });

            const dedup: Image[] = localItemCache.filter(filter_item => { return isVisionFog(filter_item) && filter_item.metadata[`${Constants.EXTENSIONID}/digest`] === digest });

            if (dedup.length === 0)
            {
                if (persistenceEnabled)
                {
                    reuseNewFog.add(item, PathKit.PathOp.UNION);
                } else
                {
                    itemsToAdd.push({ cmds: item.toCmds(), visible: false, zIndex: 3, playerId: TOKENSVIEWABLE[key].id, digest: digest });
                }
            } else
            {
                // these duplicates are still visible, so dont delete them if we have persistence turned off.
                dedup_digest[digest] = true;
            }

            if (fowEnabled)
            {
                if (BSCACHE.enableVisionDebug)
                {
                    const debugPath = buildPath().commands(item.toCmds()).locked(true).visible(item.visible).fillColor('#555500').fillOpacity(0.3).strokeColor("#00FF00").layer("DRAWING").metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
                    await OBR.scene.local.addItems([debugPath]);
                }

                trailingFogRect.op(item, PathKit.PathOp.DIFFERENCE);

                if (BSCACHE.playerRole === "GM")
                {
                    useTokenVisibility = true;
                    // this is the currently visible stuff only
                    currentFog.add(item, PathKit.PathOp.UNION);
                }
            }
            item.delete();
        }

        const sceneId = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/sceneId`];
        if (persistenceEnabled)
        {
            const newPath = reuseNewFog.resolve();
            newPath.setFillType(PathKit.FillType.EVENODD);

            // Warning: the order of these operations affects the outcome in PathKit (even though it probably shouldnt).
            // the path visible by the player needs to get added first before the old path gets added.
            if (oldPath !== null)
            {
                newPath.op(oldPath, PathKit.PathOp.UNION);
            }

            const commands = newPath.toCmds();

            if (reuseFog.length > 0)
            {
                await OBR.scene.local.updateItems([reuseFog[0].id], (items) =>
                {
                    if (items.length > 0) items[0].commands = commands;
                });
            }

            try
            {
                localStorage.setItem(`${Constants.EXTENSIONID}/fogCache/${BSCACHE.playerId}/${sceneId}`, JSON.stringify([{ digest: 'reuse', commands: commands }]));
            }
            catch (error)
            {
            }

            if (oldPath !== null)
            {
                oldPath.delete();
            }
            newPath.delete();
            reuseNewFog.delete();
        } else if (persistenceEnabled)
        {
            const saveFog = localItemCache.filter(isVisionFog);
            try
            {
                localStorage.setItem(`${Constants.EXTENSIONID}/fogCache/${BSCACHE.playerId}/${sceneId}`, JSON.stringify(saveFog.map((item: any) => { return { digest: item.metadata[`${Constants.EXTENSIONID}/digest`], commands: item.commands }; })));
            }
            catch (error)
            {
            }
        }

        let currentFogPath: any;
        if (useTokenVisibility)
        {
            currentFogPath = currentFog.resolve();
        }
        currentFog.delete();

        const oldTrailingFog = localItemCache.filter(isTrailingFog);

        // Performance optimisation: This detects fog items that were already created previously in the scene by earlier iterations of the fog path rendering, and effectively skips their creation/deletion.
        // Hard to measure the impact, however it appears to cut about 20ms per token that didnt move since we last updated the fog.
        // This becomes unnecessary if we can get the other code path working to join all the fog items into a single path.
        //
        // This has become somewhat irrelevant for two reasons: we're using scene.local which doesnt have this performance hit, and persistenceEnabled bypasses this completely

        const oldFog = localItemCache.filter((item) =>
        {
            const dedup_index = item.metadata[`${Constants.EXTENSIONID}/digest`] as string;
            return isVisionFog(item) && dedup_digest[dedup_index] === undefined;
        });

        if (fowEnabled)
        {
            let fowColor = (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowColor`] ? BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/fowColor`] : "#00000088") as string;
            let fowOpacity = 0.5;
            if (fowColor.length == 9)
            {
                fowOpacity = Number.parseInt(fowColor.substring(7), 16) / 255;
                fowColor = fowColor.substring(0, 7);
            }

            const trailingFog = buildPath()
                .commands(trailingFogRect.toCmds())
                .locked(true)
                .fillRule("evenodd")
                .visible(true)
                .fillColor(fowColor)
                .fillOpacity(fowOpacity)
                .strokeWidth(0)
                .strokeColor("#000000")
                .layer("DRAWING")
                .metadata({ [`${Constants.EXTENSIONID}/isTrailingFog`]: true })
                .name("Trailing Fog")
                .build();

            trailingFog.disableHit = true;

            if (oldTrailingFog.length > 0)
            {
                // If the old item exists in the scene, reuse it, otherwise you get flickering.
                // Warning: In theory this can use fastUpdate since we only change the path, though it seemed to break with it turned on.
                // Also worth noting that this seems to fail if we use trailingFogRect directly - does buildPath transform it somehow? possibly by the fill rule?
                await OBR.scene.local.updateItems(isTrailingFog as ItemFilter<Image>, items =>
                {
                    for (const item of items)
                    {
                        item.commands = trailingFog.commands;
                    }
                }, false);
            }
            else
            {
                promisesToExecute.push(OBR.scene.local.addItems([trailingFog]));
            }
        } else
        {
            // FOW disabled, remove any existing trailing fog items:
            promisesToExecute.push(OBR.scene.local.deleteItems(localItemCache.filter(isTrailingFog).map(fogItem => fogItem.id)));
        }

        trailingFogRect.delete();

        stages[4].pause();
        stages[5].start();

        /// Door Check - Check if user has any doors visible.
        const localDoorItems = await OBR.scene.local.getItems((item) => item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
        if (playerDoors || BSCACHE.playerRole == "GM")
        {
            await initDoors();
        }
        else
        {
            // If it's turned off, we want to cleanse the door menace.
            if (localDoorItems.length > 0)
            {
                await OBR.scene.local.deleteItems(localDoorItems.map(door => door.id));
            }
        }

        /// If the user isn't allowing them to see doors, this should be skipped. So the only check should be on that one thing.
        for (const localDoor of localDoorItems)
        {
            // Get the ID and Identify the 'RealDoor'
            const doorPathId = localDoor.metadata[`${Constants.EXTENSIONID}/doorId`];
            const door = BSCACHE.sceneItems.find((item) => item.id === doorPathId);
            if (door)
            {
                // If we found a door, compare the array length to see if it's open or not.
                // Note: Moved the code for that to constants for easier management and re-usability
                const localDoorPather = localDoor as Path;
                const localOpen = localDoorPather.commands.length == Constants.DOOROPEN.length;
                const open = door.metadata[`${Constants.EXTENSIONID}/doorOpen`] ? true : false;

                // If it's already open we don't want to spam updates
                if (localOpen === open) continue;

                promisesToExecute.push(
                    // Change the icon
                    OBR.scene.local.updateItems([localDoor.id], (doors) =>
                    {
                        const localdoor = doors[0] as Path;
                        if (isPath(localdoor))
                        {
                            localdoor.commands = getDoorPath(open);
                        }
                    })
                );
            }
        }

        /*
         * Stage 5: Add/remove items in the scene
         */

        computeTimer.pause(); awaitTimer.resume();

        // So this doesnt make a huge amount of sense to me, however i think batching promises in this way only executes them when you call Promise.all,
        // and for some reason this causes issues with some of the procedural code below IF you remove the await on the Promise.all.
        // However, per the above, if we simply just call them individually and dont await any of them, everything is fine.. and we get a bit more of reponsiveness in the UI

        if (false)
        {
            await Promise.all(promisesToExecute);

            await OBR.scene.local.deleteItems(oldRings.map(fogItem => fogItem.id));
            await OBR.scene.local.addItems(itemsToAdd.map(item =>
            {
                const path = buildPath().commands(item.cmds).locked(true).visible(item.visible).fillColor('#000000').strokeColor("#000000").layer("FOG").name("Fog of War").metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true, [`${Constants.EXTENSIONID}/digest`]: item.digest }).build();
                path.zIndex = item.zIndex;
                return path;
            }));

            if (!persistenceEnabled)
            {
                await OBR.scene.local.deleteItems(oldFog.map((item) => item.id));
            }

            // Include the rings in the promise, if available
            if (playerRings.length > 0)
            {
                await OBR.scene.local.addItems(playerRings);
            }

            if (!BSCACHE.fogFilled)
            {
                await OBR.scene.fog.setFilled(true);
            }
        } else
        {
            promisesToExecute.push(OBR.scene.local.deleteItems(oldRings.map(fogItem => fogItem.id)));
            promisesToExecute.push(OBR.scene.local.addItems(itemsToAdd.map(item =>
            {
                const path = buildPath().commands(item.cmds).fillRule("evenodd").locked(true).visible(item.visible).fillColor('#000000').strokeColor("#000000").layer("FOG").name("Fog of War").metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true, [`${Constants.EXTENSIONID}/digest`]: item.digest }).build();
                path.zIndex = item.zIndex;
                return path;
            }))
            );

            if (!persistenceEnabled)
            {
                promisesToExecute.push(OBR.scene.local.deleteItems(oldFog.map((item) => item.id)));
            }

            // Include the rings in the promise, if available
            if (playerRings.length > 0)
            {
                promisesToExecute.push(OBR.scene.local.addItems(playerRings));
            }

            if (!BSCACHE.fogFilled)
            {
                promisesToExecute.push(OBR.scene.fog.setFilled(true));
            }

            // Update all items
            await Promise.all(promisesToExecute);
        }


        // this is mildly expensive, but useful for debugging:
        //let items = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
        let itemCounter = 0;//items.length;

        stages[5].pause();
        stages[6].start();

        /*
         * Stage 6: Update token visibility for autohide
         */

        if (useTokenVisibility)
        {
            await updateTokenVisibility(currentFogPath);
            currentFogPath.delete();
        }
        stages[6].pause();

        const [awaitTimerResult, computeTimerResult] = [awaitTimer.stop(), computeTimer.stop()];
        const timers: Record<string, string> = {
            "compute_time": `${computeTimerResult} ms`,
            "communication_time": `${awaitTimerResult} ms`,
            "cache_hits": cacheHits.toString(),
            "cache_misses": cacheMisses.toString(),
            "item_counter": itemCounter.toString()
        };

        for (let i = 1; i <= 6; i++)
        {
            const result = stages[i].stop();
            timers['stage' + i] = `${result} ms`;
        }

        updatePerformanceInformation(timers);

        BSCACHE.busy = false;

        await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/processed`]: true });
        await OBR.action.setBadgeText(undefined);
    }

    async function updateTokenVisibility(currentFogPath: any)
    {
        const toggleTokens: Image[] = [];
        const tokens = BSCACHE.sceneItems.filter((item) => isAutohide(item) && isImage(item)) as Image[];

        // this might not be the right thing to do with complex paths.. union should be sufficient when we intersect later..
        currentFogPath.simplify();

        /*
         * Token LOS calculations:
         *   Create a hexagon around each autohide token
         *   Intersect the hexagon against the current visible fog path (for all players)
         *   If the intersected path isnt empty, then at least a part of the hexagon is visible.
         */
        for (const token of tokens)
        {
            const tPathBuilder = new PathKit.SkOpBuilder();
            const tempPath = PathKit.NewPath();

            // this needs to be calulated dynamically, but looks like this should be based on the token.grid.dpi versus the image size? or scale? or both?
            const radius = (BSCACHE.gridDpi / token.grid.dpi) * (token.image.width / 2) * token.scale.x;

            for (let i = 0; i < 6; i++)
            {
                const angle = (i * 60 * Math.PI) / 180;
                const x = token.position.x + radius * Math.cos(angle);
                const y = token.position.y + radius * Math.sin(angle);
                if (i == 0)
                {
                    tempPath.moveTo(x, y);
                } else
                {
                    tempPath.lineTo(x, y);
                }
            }
            tempPath.closePath();

            // debug - blue token bounding path
            if (BSCACHE.enableVisionDebug)
            {
                const debugPath = buildPath().strokeColor('#0000ff').locked(true).fillOpacity(1).commands(tempPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
                await OBR.scene.local.addItems([debugPath]);
            }

            tPathBuilder.add(tempPath, PathKit.PathOp.UNION);
            tPathBuilder.add(currentFogPath, PathKit.PathOp.INTERSECT);
            const intersectPath = tPathBuilder.resolve();

            // If the shape around the token overlaps with the currently visible area the intersecting path will have a length:
            const visible = !intersectPath.toCmds().length;

            if (token.visible == visible)
            {
                toggleTokens.push(token);
            }

            // debug - red intersection path
            if (BSCACHE.enableVisionDebug)
            {
                const debugPath = buildPath().fillRule("evenodd").locked(true).strokeColor('#ff0000').fillOpacity(0).commands(intersectPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
                await OBR.scene.local.addItems([debugPath]);
            }
            tempPath.delete();
            tPathBuilder.delete();
            intersectPath.delete();
        }

        await OBR.scene.items.updateItems(toggleTokens.map(token => token.id), (items) =>
        {
            for (let i = 0; i < items.length; i++)
            {
                items[i].visible = !items[i].visible;
            }
        });
    }
}

// This function is responsible for updating the performance information in the
// main extension iframe
function updatePerformanceInformation(performanceInfo: { [key: string]: any }): void
{
    for (const [key, value] of Object.entries(performanceInfo))
    {
        const element = document.getElementById(key);
        if (key == "compute_time" || key == "communication_time" || key[0] == 's')
        {
            if (element) element.innerText = Number.parseFloat(value).toFixed(1) + 'ms';
        }
        else
        {
            if (element) element.innerText = value;
        }
    }
}