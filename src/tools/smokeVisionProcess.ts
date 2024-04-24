import OBR, { buildPath, buildShape, Image, isImage, Item, Shape, ItemFilter, isPath, Path, Player } from "@owlbear-rodeo/sdk";
import PathKitInit from "pathkit-wasm/bin/pathkit";
import wasm from "pathkit-wasm/bin/pathkit.wasm?url";
import { Timer } from "../utilities/debug";
import { ObjectCache } from "../utilities/cache";
import { sceneCache } from "../utilities/globals";
import { comparePosition } from "../utilities/math";
import { isVisionFog, isActiveVisionLine, isTokenWithVision, isBackgroundBorder, isIndicatorRing, isTokenWithVisionIOwn, isTrailingFog, isAnyFog, isTokenWithVisionForUI, isTorch, isAutohide } from "../utilities/itemFilters";
import { Constants } from "../utilities/constants";
import { getDoorPath, initDoors } from "./doorTool";
import { CreateObstructionLines, CreatePolygons } from "./smokeCreateObstructions";

// Generally, only one player will move at one time, so let's cache the
// computed shadows for all players and only update if something has changed
export const playerShadowCache = new ObjectCache(false);
export var PathKit: any;
var busy = false;

// dev setting to enable debug visualisations
export const enableVisionDebug = false;

// This is the function responsible for computing the shadows and the FoW
async function ComputeShadow(eventDetail: Detail)
{
    await OBR.action.setBadgeText("Working..");
    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/processed`]: false });
    busy = true;
    if (!PathKit)
    {
        // Is this allowed?
        PathKit = await PathKitInit({ locateFile: () => wasm });
    }
    if (!(await OBR.scene.isReady()))
    {
        // If we change scenes we should invalidate the cache
        playerShadowCache.invalidate((_, value) => value.shadowPath.delete());
        busy = false;
        await OBR.action.setBadgeText(undefined);
        return;
    }

    if (enableVisionDebug)
    {
        // remove debug visualisations from any previous pass..
        await OBR.scene.local.deleteItems((await OBR.scene.local.getItems(f => f.metadata[`${Constants.EXTENSIONID}/debug`] === true)).map(i => i.id));
    }

    const stages = [];
    for (let i = 0; i <= 6; i++) stages.push(new Timer());

    stages[1].start();

    // Load information from the event
    const {
        awaitTimer,
        computeTimer,
        visionShapes,
        tokensWithVision,
        invalidateCache,
    } = eventDetail;


    let size = eventDetail.size, offset = eventDetail.offset, scale = eventDetail.scale;
    let [width, height] = size;

    const autodetectEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === true;
    if (autodetectEnabled)
    {
        // draw a big box around all the maps
        const maps: Image[] = await OBR.scene.items.getItems((item) => item.layer === "MAP" && isImage(item));

        let mapbox = [];
        for (let map of maps)
        {
            let dpiRatio = sceneCache.gridDpi / map.grid.dpi;

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

        offset = [mapbox[0], mapbox[1]];
        size = [mapbox[2] - mapbox[0], mapbox[3] - mapbox[1]];
        scale = [1, 1];
        [width, height] = size;
    }

    let cacheHits = 0, cacheMisses = 0;
    if (invalidateCache)  // Something significant changed => invalidate cache
        playerShadowCache.invalidate((_, value) => value.shadowPath.delete());

    computeTimer.resume();

    const shouldComputeVision = sceneCache.metadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    if (!shouldComputeVision || tokensWithVision.length == 0)
    {
        // Clear fog
        const fogItems = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
        await OBR.scene.local.deleteItems(fogItems.map(fogItem => fogItem.id));

        busy = false;
        await OBR.action.setBadgeText(undefined);
        return;
    }

    /*
     * Stage 1: Calculate obstruction lines and fog shapes
     */

    // Extract all obstruction lines
    const obstructionLines: ObstructionLine[] = CreateObstructionLines(visionShapes);

    // Create polygons containing the individual shadows cast by a vision line from the point of view of one player.
    const polygons: Polygon[][] = CreatePolygons(obstructionLines, tokensWithVision, width, height, offset as any, scale as any);

    if (polygons.length == 0)
    {
        busy = false;
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
    for (let j = 0; j < polygons.length; j++)
    {
        const player = tokensWithVision[j];
        let cacheResult = playerShadowCache.getValue(player.id);
        if (cacheResult !== undefined && comparePosition(cacheResult.player.position, player.position) && cacheResult.player.metadata[`${Constants.EXTENSIONID}/visionRange`] === player.metadata[`${Constants.EXTENSIONID}/visionRange`])
        {
            // The value is cached, use it
            itemsPerPlayer[j] = cacheResult.shadowPath.copy();
            cacheHits++;
            continue;
        }

        cacheMisses++;
        const playerPolygons = polygons[j];
        const pathBuilder = new PathKit.SkOpBuilder();
        const tempPath = PathKit.NewPath().rect(offset[0], offset[1], size[0], size[1]);
        pathBuilder.add(tempPath, PathKit.PathOp.UNION);
        tempPath.delete();

        // Merge all polygons
        for (const polygon of playerPolygons)
        {
            const shape = polygon.fromShape;
            const cmds = [];

            cmds.push([PathKit.MOVE_VERB, polygon.pointset[0].x, polygon.pointset[0].y]);

            for (let j = 1; j < polygon.pointset.length; j++)
            {
                cmds.push([PathKit.LINE_VERB, polygon.pointset[j].x, polygon.pointset[j].y]);
            }
            const newPath = PathKit.FromCmds(cmds);

            if (shape.style.closed != false)
            {
                const shapeCmds = [];
                shapeCmds.push([PathKit.MOVE_VERB, shape.points[0].x * shape.scale.x + shape.position.x, shape.points[0].y * shape.scale.y + shape.position.y]);

                for (let i = 1; i < shape.points.length - 1; i++)
                {
                    shapeCmds.push([PathKit.LINE_VERB, shape.points[i].x * shape.scale.x + shape.position.x, shape.points[i].y * shape.scale.y + shape.position.y]);
                }

                const shapePath = PathKit.FromCmds(shapeCmds);
                newPath.op(shapePath, PathKit.PathOp.DIFFERENCE);
                shapePath.delete();
            }
            pathBuilder.add(newPath, PathKit.PathOp.DIFFERENCE);
            newPath.delete();
        }
        const path = pathBuilder.resolve();

        if (!path)
        {
            console.error("Couldn't compute fog");
            busy = false;
            await OBR.action.setBadgeText(undefined);
            return;
        }

        pathBuilder.delete();

        if (path !== undefined)
        {
            path.simplify();
            itemsPerPlayer[j] = path;
            let cacheResult = playerShadowCache.getValue(player.id);
            if (cacheResult !== undefined)
            {
                cacheResult.shadowPath.delete();
            }
            // Cache the computed path for future use
            playerShadowCache.cacheValue(player.id, { shadowPath: path.copy(), player: player });
        }
    }

    stages[2].pause();
    stages[3].start();

    const intersectTorches = [];
    const intersectFullVision = PathKit.NewPath();

    /*
     * Stage 3: Calculate vision ranges
     * Intersect each player and torch vision with a circle based on their vision range,
     * Then if a player has line of sight to a torch, include it's vision path.
     */

    for (let i = 0; i < tokensWithVision.length; i++)
    {
        const token = tokensWithVision[i];
        const visionRangeMeta = token.metadata[`${Constants.EXTENSIONID}/visionRange`];
        //const gmIds = sceneCache.players.filter(x => x.role == "GM");
        const myToken = (sceneCache.userId === tokensWithVision[i].createdUserId);
        //const gmToken = gmIds.some(x => x.id == tokensWithVision[i].createdUserId);

        const tokenOwner = sceneCache.metadata[`${Constants.EXTENSIONID}/USER-${tokensWithVision[i].createdUserId}`] as Player;
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
            if ((!myToken && sceneCache.role !== "GM") && !gmToken) continue;

            const visionRange = sceneCache.gridDpi * (visionRangeMeta / sceneCache.gridScale + .5);
            const ellipse = PathKit.NewPath().ellipse(token.position.x, token.position.y, visionRange, visionRange, 0, 0, 2 * Math.PI);
            itemsPerPlayer[i]?.op(ellipse, PathKit.PathOp.INTERSECT);
            ellipse.delete();

            // Get Color for Players
            const owner = sceneCache.metadata[`${Constants.EXTENSIONID}/USER-${token.createdUserId}`] as Player;
            if (owner && sceneCache.role === "GM" && !isTorch(token))
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
    const persistenceEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/persistenceEnabled`] === true;
    const fowEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/fowEnabled`] === true;
    const playerDoors = sceneCache.metadata[`${Constants.EXTENSIONID}/playerDoors`] === true;

    // Overlay to cut out trailing fog
    const trailingFogRect = PathKit.NewPath();

    // Deduplicate calls when adding items to the scene
    const dedup_digest = {} as any;

    const localItemCache = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
    const oldRings = await OBR.scene.local.getItems(isIndicatorRing as ItemFilter<Image>);

    if (fowEnabled)
    {
        // Create a rect (around our fog area, needs autodetection or something), which we then carve out based on the path showing the currently visible area
        trailingFogRect.rect(offset[0], offset[1], size[0], size[1]);
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
                itemsToAdd.push({ cmds: item.toCmds(), visible: false, zIndex: 3, playerId: tokensWithVision[key].id, digest: digest });
            }
        } else
        {
            // these duplicates are still visible, so dont delete them if we have persistence turned off.
            dedup_digest[digest] = true;
        }

        if (fowEnabled)
        {
            if (enableVisionDebug)
            {
                const debugPath = buildPath().commands(item.toCmds()).locked(true).visible(item.visible).fillColor('#555500').fillOpacity(0.3).strokeColor("#00FF00").layer("DRAWING").metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
                await OBR.scene.local.addItems([debugPath]);
            }

            trailingFogRect.op(item, PathKit.PathOp.DIFFERENCE);

            if (sceneCache.role === "GM")
            {
                useTokenVisibility = true;
                // this is the currently visible stuff only
                currentFog.add(item, PathKit.PathOp.UNION);
            }
        }
        item.delete();
    }

    const sceneId = sceneCache.metadata[`${Constants.EXTENSIONID}/sceneId`];
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
            localStorage.setItem(`${Constants.EXTENSIONID}/fogCache/${sceneCache.userId}/${sceneId}`, JSON.stringify([{ digest: 'reuse', commands: commands }]));
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
            localStorage.setItem(`${Constants.EXTENSIONID}/fogCache/${sceneCache.userId}/${sceneId}`, JSON.stringify(saveFog.map((item: any) => { return { digest: item.metadata[`${Constants.EXTENSIONID}/digest`], commands: item.commands }; })));
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
        let fowColor = (sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] ? sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] : "#00000088") as string;
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
    if (playerDoors || sceneCache.role == "GM")
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
        const door = sceneCache.items.find((item) => item.id === doorPathId);
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

        if (!sceneCache.fog.filled)
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

        if (!sceneCache.fog.filled)
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

    busy = false;

    await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/processed`]: true });
    await OBR.action.setBadgeText(undefined);
}

async function updateTokenVisibility(currentFogPath: any)
{
    const toggleTokens: Image[] = [];
    const tokens = sceneCache.items.filter((item) => isAutohide(item) && isImage(item)) as Image[];

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
        const pathBuilder = new PathKit.SkOpBuilder();
        const tempPath = PathKit.NewPath();

        // this needs to be calulated dynamically, but looks like this should be based on the token.grid.dpi versus the image size? or scale? or both?
        const radius = (sceneCache.gridDpi / token.grid.dpi) * (token.image.width / 2) * token.scale.x;

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
        if (enableVisionDebug)
        {
            const debugPath = buildPath().strokeColor('#0000ff').locked(true).fillOpacity(1).commands(tempPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
            await OBR.scene.local.addItems([debugPath]);
        }

        pathBuilder.add(tempPath, PathKit.PathOp.UNION);
        pathBuilder.add(currentFogPath, PathKit.PathOp.INTERSECT);
        const intersectPath = pathBuilder.resolve();

        // If the shape around the token overlaps with the currently visible area the intersecting path will have a length:
        const visible = !intersectPath.toCmds().length;

        if (token.visible == visible)
        {
            toggleTokens.push(token);
        }

        // debug - red intersection path
        if (enableVisionDebug)
        {
            const debugPath = buildPath().fillRule("evenodd").locked(true).strokeColor('#ff0000').fillOpacity(0).commands(intersectPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
            await OBR.scene.local.addItems([debugPath]);
        }
        tempPath.delete();
        pathBuilder.delete();
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

let previousVisionShapes: string;
let previousAutohideItems: string;
let previousPlayersWithVision: string;
let previousSize: number[] = [];
let previousVisionEnabled: boolean;
let previousMap: string;
let previousAutodetectEnabled: boolean;
let previousFowEnabled: boolean;
let previousPersistenceEnabled: boolean;
let previousFowColor: string;

export async function OnSceneDataChange(forceUpdate?: boolean)
{
    if (busy)
        return;

    if (!sceneCache.ready || !sceneCache.initialized)
    {
        return;
    }

    const [awaitTimer, computeTimer] = [new Timer(), new Timer()];

    awaitTimer.start(); awaitTimer.pause();
    computeTimer.start();

    // Only check characters and attachments
    const gmTokens: Item[] = [];
    const filteredItems = sceneCache.items.filter(item => (item.layer == "CHARACTER" || item.layer == "ATTACHMENT"));
    for (const fItem of filteredItems)
    {
        // Only check items with vision
        if ((fItem.metadata[`${Constants.EXTENSIONID}/hasVision`] || fItem.metadata[`${Constants.ARMINDOID}/hasVision`]) && !fItem.metadata[`${Constants.EXTENSIONID}/visionBlind`])
        {
            const tokenOwner = sceneCache.metadata[`${Constants.EXTENSIONID}/USER-${fItem.createdUserId}`] as Player;
            if (tokenOwner?.role === "GM") gmTokens.push(fItem);
        }
    }

    const allTokensWithVision = (sceneCache.role == "GM") ? sceneCache.items.filter(isTokenWithVision) : sceneCache.items.filter(isTokenWithVisionIOwn).concat(gmTokens);

    // if we're on the character layer, and we're not a torch, then we can see - otherwise we're a torch or attachment so we use the item's visibility:
    const tokensWithVision = allTokensWithVision.filter((item) => { return !isTorch(item) || item.visible === true; });

    const visionShapes = sceneCache.items.filter(isActiveVisionLine);
    const autoHideItems = sceneCache.items.filter(isAutohide);
    const backgroundImage = sceneCache.items.filter(isBackgroundBorder)?.[0] as any as Shape;
    const visionEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    const persistenceEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/persistenceEnabled`] === true;
    const autodetectEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === true;
    const fowEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/fowEnabled`] === true;
    const fowColor = sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] as string;

    const size: number[] = [];
    const scale: number[] = [];
    const offset: number[] = [];

    if (backgroundImage === undefined)
    {
        size[0] = 0;
        size[1] = 0;
        scale[0] = 1;
        scale[1] = 1;
        offset[0] = 0;
        offset[1] = 0;
    }
    else
    {
        size[0] = backgroundImage.width * backgroundImage.scale.x;
        size[1] = backgroundImage.height * backgroundImage.scale.y;
        scale[0] = backgroundImage.scale.x;
        scale[1] = backgroundImage.scale.y;
        offset[0] = backgroundImage.position.x;
        offset[1] = backgroundImage.position.y;

        // This fixes images being offset from the original position in the earlier versions, though doesnt apply to smoke:
        // const offset = [backgroundImage.position.x - (backgroundImage.grid.offset.x * dpiRatio), backgroundImage.position.y - (backgroundImage.grid.offset.y * dpiRatio)];
    }

    if (sceneCache.role == "GM")
    {
        const mapHeight = document.getElementById("mapHeight")! as HTMLInputElement;
        const mapWidth = document.getElementById("mapWidth")! as HTMLInputElement;
        if (mapWidth) mapWidth.value = (Math.round(size[0]) / sceneCache.gridDpi).toString();
        if (mapHeight) mapHeight.value = (Math.round(size[1]) / sceneCache.gridDpi).toString();
    }

    // Check if any values have changed and a re-draw is necessary
    const sVisionShapes = JSON.stringify(visionShapes);
    const sAutohideItems = JSON.stringify(autoHideItems);
    const sPlayersWithVision = JSON.stringify(tokensWithVision);
    const sBackgroundImage = JSON.stringify(backgroundImage);

    if (sBackgroundImage == previousMap
        && visionEnabled == previousVisionEnabled
        && previousFowColor == fowColor
        && previousAutodetectEnabled == autodetectEnabled
        && previousFowEnabled == fowEnabled
        && previousPersistenceEnabled == persistenceEnabled
        && previousVisionShapes == sVisionShapes
        && previousAutohideItems == sAutohideItems
        && previousPlayersWithVision == sPlayersWithVision
        && size[0] == previousSize[0]
        && size[1] == previousSize[1]
        && forceUpdate !== true)
        return;

    // Check if the cache needs to be invalidated
    let invalidateCache = false;
    if (sBackgroundImage != previousMap || previousVisionShapes != sVisionShapes || size[0] != previousSize[0] || size[1] != previousSize[1])
        invalidateCache = true;

    previousMap = sBackgroundImage;
    previousPlayersWithVision = sPlayersWithVision;
    previousVisionShapes = sVisionShapes;
    previousSize = size;
    previousVisionEnabled = visionEnabled;
    previousAutodetectEnabled = autodetectEnabled;
    previousFowEnabled = fowEnabled;
    previousFowColor = fowColor;
    previousPersistenceEnabled = persistenceEnabled;
    computeTimer.pause();

    const eventDetail: Detail = {
        awaitTimer: awaitTimer,
        computeTimer: computeTimer,
        allItems: sceneCache.items,
        size: size,
        offset: offset,
        scale: scale,
        tokensWithVision: tokensWithVision,
        visionShapes: visionShapes,
        invalidateCache: invalidateCache,
    };

    if (!busy)
    {
        await ComputeShadow(eventDetail);
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