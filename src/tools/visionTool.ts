import OBR, { buildPath, buildShape, buildLine, Image, Shape, ItemFilter } from "@owlbear-rodeo/sdk";
import PathKitInit from "pathkit-wasm/bin/pathkit";
import wasm from "pathkit-wasm/bin/pathkit.wasm?url";
import { polygonMode } from "./visionPolygonMode";
import { lineMode } from "./visionLineMode";
import { Timer } from "./../utilities/debug";
import { ObjectCache } from "./../utilities/cache";
import { sceneCache } from "./../utilities/globals";
import { squareDistance, comparePosition, isClose, mod } from "./../utilities/math";
import { isVisionFog, isActiveVisionLine, isTokenWithVision, isBackgroundBorder, isIndicatorRing, isTokenWithVisionIOwn, isTrailingFog, isFog } from "./../utilities/itemFilters";
import { Constants } from "../utilities/constants";

export async function setupContextMenus(): Promise<void>
{
    // This context menu appears on character tokens and determines whether they
    // to render their FoW or not
    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-vision-menu`,
        icons: [
            {
                icon: "/no-vision.svg",
                label: "Enable Vision",
                filter: {
                    every: [{ key: "layer", value: "CHARACTER" }, { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], value: undefined }],
                },
            },
            {
                icon: "/icon.svg",
                label: "Disable Vision",
                filter: {
                    every: [{ key: "layer", value: "CHARACTER" }],
                },
            },
        ],
        async onClick(ctx)
        {
            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (item.metadata[`${Constants.EXTENSIONID}/hasVision`] && item.layer == "CHARACTER")
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/hasVision`];
                    }
                    else if (item.layer == "CHARACTER")
                    {
                        item.metadata[`${Constants.EXTENSIONID}/hasVision`] = true;
                        if (!item.metadata[`${Constants.EXTENSIONID}/visionRange`])
                        {
                            item.metadata[`${Constants.EXTENSIONID}/visionRange`] = Constants.VISIONDEFAULT;
                        }
                    }
                }
            });
        },
    });

    // This context appears on vision lines and lets the user toggle whether
    // they're active or not
    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-vision-line`,
        icons: [
            {
                icon: "/icon.svg",
                label: "Disable Vision Line",
                filter: {
                    some: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/disabled`], value: undefined, coordinator: "||" },
                    { key: ["metadata", `${Constants.ARMINDOID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: ["metadata", `${Constants.ARMINDOID}/disabled`], value: undefined }]
                },
            },
            {
                icon: "/no-vision.svg",
                label: "Enable Vision Line",
                filter: {
                    some: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "||" },
                    { key: ["metadata", `${Constants.ARMINDOID}/isVisionLine`], value: true }],
                },
            }
        ],
        async onClick(ctx)
        {
            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && item.metadata[`${Constants.EXTENSIONID}/disabled`])
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/disabled`];
                    }
                    else if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`])
                    {
                        item.metadata[`${Constants.EXTENSIONID}/disabled`] = true;
                    }
                }
            });
        }
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/switch-one-sided-type`,
        icons: [
            {
                icon: "/two-sided.svg",
                label: "Two-sided",
                filter: {
                    some: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/oneSided`], value: undefined, coordinator: "||" },
                    { key: ["metadata", `${Constants.ARMINDOID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: ["metadata", `${Constants.ARMINDOID}/oneSided`], value: undefined }]
                },
            },
            {
                icon: "/left-sided.svg",
                label: "One-sided left",
                filter: {
                    some: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/oneSided`], value: "left", coordinator: "||" },
                    { key: ["metadata", `${Constants.ARMINDOID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: ["metadata", `${Constants.ARMINDOID}/oneSided`], value: "left" }]
                },
            },
            {
                icon: "/right-sided.svg",
                label: "One-sided right",
                filter: {
                    some: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "||" },
                    { key: ["metadata", `${Constants.ARMINDOID}/isVisionLine`], value: true }],
                },
            }
        ],
        async onClick(ctx)
        {
            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if ((item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] || item.metadata[`${Constants.ARMINDOID}/isVisionLine`])
                        && (item.metadata[`${Constants.EXTENSIONID}/oneSided`] == "right" || item.metadata[`${Constants.ARMINDOID}/oneSided`] == "right"))
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/oneSided`];
                        delete item.metadata[`${Constants.ARMINDOID}/oneSided`];
                    }
                    else if ((item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] || item.metadata[`${Constants.ARMINDOID}/isVisionLine`])
                        && (item.metadata[`${Constants.EXTENSIONID}/oneSided`] == "left" || item.metadata[`${Constants.ARMINDOID}/oneSided`] == "left"))
                    {
                        item.metadata[`${Constants.EXTENSIONID}/oneSided`] = "right";
                        item.metadata[`${Constants.ARMINDOID}/oneSided`] = "right";
                    }
                    else if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] || item.metadata[`${Constants.ARMINDOID}/isVisionLine`])
                    {
                        item.metadata[`${Constants.EXTENSIONID}/oneSided`] = "left";
                        item.metadata[`${Constants.ARMINDOID}/oneSided`] = "left";
                    }
                }
            });
        }
    });
}

export async function createTool(): Promise<void>
{
    // This is the tool the extension offers to draw vision liens
    await OBR.tool.create({
        id: `${Constants.EXTENSIONID}/vision-tool`,
        icons: [
            {
                icon: "/icon.svg",
                label: "Setup Vision",
            },
        ],
        async onClick()
        {
            await OBR.tool.activateTool(`${Constants.EXTENSIONID}/vision-tool`);
        },
    });
}

export async function createMode(): Promise<void>
{
    // Create "add polygon" mode
    await OBR.tool.createMode({
        id: `${Constants.EXTENSIONID}/add-vision-polygon-mode`,
        icons: [
            {
                icon: "/object.svg",
                label: "Add Obstruction Object",
                filter: {
                    activeTools: [`${Constants.EXTENSIONID}/vision-tool`],
                },
            },
        ],
        onToolClick: polygonMode.onToolClick,
        onToolMove: polygonMode.onToolMove,
        onKeyDown: polygonMode.onKeyDown
    });

    // Create "add line" mode
    await OBR.tool.createMode({
        id: `${Constants.EXTENSIONID}/add-vision-line-mode`,
        icons: [
            {
                icon: "/line.svg",
                label: "Add Obstruction Line",
                filter: {
                    activeTools: [`${Constants.EXTENSIONID}/vision-tool`],
                },
            },
        ],
        onToolClick: lineMode.onToolClick,
        onToolMove: lineMode.onToolMove,
        onKeyDown: lineMode.onKeyDown
    });
}

// This function is responsible for updating the performance information in the
// main extension iframe
function updatePerformanceInformation(performanceInfo: { [key: string]: any }): void
{
    for (const [key, value] of Object.entries(performanceInfo))
    {
        const element = document.getElementById(key);
        if (element) element.innerText = value;
    }
}

var PathKit: any;
var busy = false;
// Generally, only one player will move at one time, so let's cache the
// computed shadows for all players and only update if something has 
// changed
const playerShadowCache = new ObjectCache(false);
// This is the function responsible for computing the shadows and the FoW
async function computeShadow(event: any)
{
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
        return;
    }

    // Load information from the event
    const {
        awaitTimer,
        computeTimer,
        metadata,
        visionShapes,
        tokensWithVision,
        invalidateCache,
    } = event.detail;


    let size = event.detail.size, offset = event.detail.offset, scale = event.detail.scale;
    let [width, height] = size;

    const autodetectEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === true;
    if (autodetectEnabled) {
        // draw a big box around all the maps
        const maps = await OBR.scene.items.getItems((item) => item.layer === "MAP");

        let mapbox = [];
        for (let map of maps) {
            let dpiRatio = sceneCache.gridDpi / map.grid.dpi;
            let left = map.position.x - (dpiRatio * map.grid.offset.x), top = map.position.y - (dpiRatio * map.grid.offset.y);
            let right = (left + (dpiRatio * map.image.width)) * map.scale.x, bottom = (top +  (dpiRatio *map.image.height)) * map.scale.y;

            if (!mapbox.length) {
                mapbox[0] = left;
                mapbox[1] = top;
                mapbox[2] = right;
                mapbox[3] = bottom;
            } else {
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

    const shouldComputeVision = metadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    if (!shouldComputeVision || tokensWithVision.length == 0)
    {
        // Clear fog
        const fogItems = await OBR.scene.items.getItems(isFog as ItemFilter<Image>);
        await OBR.scene.local.deleteItems(fogItems.map(fogItem => fogItem.id));
    
        busy = false;
        return;
    }

    // Extract all lines from the drawn shapes
    const visionLines = [];
    for (const shape of visionShapes)
    {
        for (let i = 0; i < shape.points.length - 1; i++)
        {
            visionLines.push({
                startPosition: { x: (shape.points[i].x * shape.scale.x + shape.position.x), y: (shape.points[i].y * shape.scale.y + shape.position.y) },
                endPosition: { x: (shape.points[i + 1].x * shape.scale.x + shape.position.x), y: (shape.points[i + 1].y * shape.scale.y + shape.position.y) },
                originalShape: shape,
                oneSided: shape.metadata[`${Constants.EXTENSIONID}/oneSided`]
            });
        }
    }

    // `polygons` is a an array of arrays. Each element in the main array is
    // another array containing the individual shadows cast by a vision line
    // from the point of view of one player.
    const polygons: Polygon[][] = [];
    const playerRings: Shape[] = [];
    const gmIds = sceneCache.players.filter(x => x.role == "GM");
    for (const token of tokensWithVision)
    {
        const myToken = (sceneCache.userId === token.createdUserId);
        const gmToken = gmIds.some(x => x.id == token.createdUserId);
        if ((!myToken && sceneCache.role !== "GM") && !gmToken) continue;

        const cacheResult = playerShadowCache.getValue(token.id);
        polygons.push([]);
        if (cacheResult !== undefined && comparePosition(cacheResult.player.position, token.position))
        {
            continue; // The result is cached and will be used later, no need to do work
        }
        for (const line of visionLines)
        {
            const signedDistance = (token.position.x - line.startPosition.x) * (line.endPosition.y - line.startPosition.y) - (token.position.y - line.startPosition.y) * (line.endPosition.x - line.startPosition.x);
            if (line.oneSided !== undefined)
            {
                if ((line.oneSided == "right" && signedDistance > 0) || (line.oneSided == "left" && signedDistance < 0))
                    continue;
            }

            // exclude any lines outside of the fog area
            // can pathkit do this better / faster?
            let lsx = line.startPosition.x, lsy = line.startPosition.y, lex = line.endPosition.x, ley = line.endPosition.y;
            if ((lsx < offset[0] || lsy < offset[1] || lsx > offset[0] + size[0] || lsy > offset[1] + size[1]) && (lex < offset[0] || ley < offset[1] || lex > offset[0] + size[0] || ley > offset[1] + size[1])) {
                continue;
            }

            // *1st step* - compute the points in the polygon representing the shadow
            // cast by `line` from the point of view of `player`.

            const v1 = { x: line.startPosition.x - token.position.x, y: line.startPosition.y - token.position.y };
            const v2 = { x: line.endPosition.x - token.position.x, y: line.endPosition.y - token.position.y };

            var proj1 = { x: 0, y: 0 }, proj2 = { x: 0, y: 0 };
            var xlim1 = 0, ylim1 = 0, xlim2 = 0, ylim2 = 0;

            // Make sure we don't go past the image borders
            //! This is probably not required if we later compute the intersection
            //! (using PathKit) of these polygons with a base rectangle the size of
            //! our background image
            if (v1.x < 0) xlim1 = offset[0] * scale[0];
            else xlim1 = (width + offset[0]) * scale[0];
            if (v1.y < 0) ylim1 = offset[1] * scale[1];
            else ylim1 = (height + offset[1]) * scale[1];
            if (v2.x < 0) xlim2 = offset[0] * scale[0];
            else xlim2 = (width + offset[0]) * scale[0];
            if (v2.y < 0) ylim2 = offset[1] * scale[1];
            else ylim2 = (height + offset[1]) * scale[1];

            const options1 = [], options2 = [];
            if (v1.x != 0)
            {
                const m = v1.y / v1.x;
                const b = line.startPosition.y - m * line.startPosition.x;
                options1.push({ x: xlim1, y: m * xlim1 + b });
            }
            if (v1.y != 0)
            {
                const n = v1.x / v1.y;
                const c = n * line.startPosition.y - line.startPosition.x;
                options1.push({ x: n * ylim1 - c, y: ylim1 });
            }
            if (v2.x != 0)
            {
                const m = v2.y / v2.x;
                const b = line.endPosition.y - m * line.endPosition.x;
                options2.push({ x: xlim2, y: m * xlim2 + b });
            }
            if (v2.y != 0)
            {
                const n = v2.x / v2.y;
                const c = n * line.endPosition.y - line.endPosition.x;
                options2.push({ x: n * ylim2 - c, y: ylim2 });
            }

            if (options1.length == 1 || squareDistance(options1[0], line.startPosition) < squareDistance(options1[1], line.startPosition))
                proj1 = options1[0];
            else
                proj1 = options1[1];

            if (options2.length == 1 || squareDistance(options2[0], line.endPosition) < squareDistance(options2[1], line.endPosition))
                proj2 = options2[0];
            else
                proj2 = options2[1];

            const pointset = [
                { x: line.startPosition.x, y: line.startPosition.y },
                proj1,
                proj2,
                { x: line.endPosition.x, y: line.endPosition.y },
            ];

            // Find out in which edge each solution lies
            const corners = [
                { x: (width + offset[0]) * scale[0], y: offset[1] * scale[1] },
                { x: (width + offset[0]) * scale[0], y: (height + offset[1]) * scale[1] },
                { x: offset[0] * scale[0], y: (height + offset[1]) * scale[1] },
                { x: offset[0] * scale[0], y: offset[1] * scale[1] },
            ];
            const edges = [0, 0];
            let i = 0;
            for (const proj of [proj1, proj2])
            {
                if (isClose(proj.y, offset[1] * scale[1]))
                    edges[i] = 0;
                else if (isClose(proj.y, (height + offset[1]) * scale[1]))
                    edges[i] = 2;
                else if (isClose(proj.x, offset[0] * scale[0]))
                    edges[i] = 3;
                else if (isClose(proj.x, (width + offset[0]) * scale[0]))
                    edges[i] = 1;

                i++;
            }

            let direction = Math.sign(signedDistance);
            direction = direction == 0 ? 1 : -direction;
            const last = direction == 1 ? edges[1] : mod(edges[1] - 1, 4);
            for (let k = edges[0] + (direction == 1 ? 0 : -1); mod(k, 4) != last; k += direction)
            {
                pointset.splice(pointset.length - 2, 0, corners[mod(k, 4)]);
            }

            polygons[polygons.length - 1].push({ pointset: pointset, fromShape: line.originalShape });
        }
    }
    if (polygons.length == 0)
    {
        busy = false;
        return;
    }

    // *2nd step* - compute shadow polygons for each player, merging all polygons
    // created previously (this can probably be merged into the last step)
    const itemsPerPlayer: Record<number, any> = {};
    for (let j = 0; j < polygons.length; j++)
    {
        const player = tokensWithVision[j];
        let cacheResult = playerShadowCache.getValue(player.id);
        if (cacheResult !== undefined && comparePosition(cacheResult.player.position, player.position))
        {
            // The value is cached, use it
            itemsPerPlayer[j] = cacheResult.shadowPath.copy();
            cacheHits++;
            continue;
        }
        cacheMisses++;
        const playerPolygons: Polygon[] = polygons[j];
        const pathBuilder = new PathKit.SkOpBuilder();
        const tempPath = PathKit.NewPath().rect(offset[0], offset[1], size[0], size[1]);
        pathBuilder.add(tempPath, PathKit.PathOp.UNION);
        tempPath.delete();

        // Merge all polygons
        for (const polygon of playerPolygons)
        {
            const shape = polygon.fromShape;
            const newPath = PathKit.NewPath();

            newPath.moveTo(polygon.pointset[0].x, polygon.pointset[0].y);
            for (let j = 1; j < polygon.pointset.length; j++)
            {
                newPath.lineTo(polygon.pointset[j].x, polygon.pointset[j].y);
            }

            if (shape.style.closed != false)
            {
                const shapePath = PathKit.NewPath();
                shapePath.moveTo(shape.points[0].x * shape.scale.x + shape.position.x, shape.points[0].y * shape.scale.y + shape.position.y);
                for (let i = 1; i < shape.points.length - 1; i++)
                    shapePath.lineTo(shape.points[i].x * shape.scale.x + shape.position.x, shape.points[i].y * shape.scale.y + shape.position.y);
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
    const oldRings = await OBR.scene.local.getItems(isIndicatorRing as ItemFilter<Image>);

    // *3rd step* - compute vision ranges
    // Create vision circles that cut each player's fog
    for (let i = 0; i < tokensWithVision.length; i++)
    {
        const token = tokensWithVision[i];
        const visionRangeMeta = token.metadata[`${Constants.EXTENSIONID}/visionRange`];
        const myToken = (sceneCache.userId === tokensWithVision[i].createdUserId);
        const gmToken = gmIds.some(x => x.id == tokensWithVision[i].createdUserId);
        if (visionRangeMeta)
        {
            if ((!myToken && sceneCache.role !== "GM") && !gmToken) continue;

            const visionRange = sceneCache.gridDpi * (visionRangeMeta / sceneCache.gridScale + .5);
            const ellipse = PathKit.NewPath().ellipse(token.position.x, token.position.y, visionRange, visionRange, 0, 0, 2 * Math.PI);
            itemsPerPlayer[i].op(ellipse, PathKit.PathOp.INTERSECT);
            ellipse.delete();

            // Get Color for Players
            const owner = sceneCache.players.find(x => x.id === token.createdUserId);
            if (owner && sceneCache.role === "GM")
            {
                // Add indicator rings intended for the GM
                const playerRing = buildShape().strokeColor(owner.color).fillOpacity(0)
                    .position({ x: token.position.x, y: token.position.y }).width(visionRange * 2)
                    .height(visionRange * 2).shapeType("CIRCLE").metadata({ [`${Constants.EXTENSIONID}/isIndicatorRing`]: true }).build();

                playerRings.push(playerRing);
            }
        }
    }

    const itemsToAdd = [];
    const persistenceEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/persistenceEnabled`] === true;
    const fowEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/fowEnabled`] === true;
    const trailingFogRect = PathKit.NewPath();
    const dedup_digest = {} as any;
  
    if (fowEnabled) {
      // Create a rect (around our fog area, needs autodetection or something), which we then carve out based on the path showing the currently visible area
      trailingFogRect.rect(offset[0], offset[1], size[0], size[1]);
    }
  
    for (const key of Object.keys(itemsPerPlayer)) {
        const item = itemsPerPlayer[key];

        // TODO: how slow is this? is there a more efficient way?
        const encoder = new TextEncoder();
        const data = encoder.encode(item.toCmds().toString());

        const digest = await crypto.subtle.digest("SHA-1", data).then(hash => {
            return ([...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join(''));
        });

        const dedup = await OBR.scene.local.getItems(filter_item => { return isVisionFog(filter_item) && filter_item.metadata[`${Constants.EXTENSIONID}/digest`] === digest });

        if (dedup.length === 0) {
            itemsToAdd.push({cmds: item.toCmds(), visible: false, zIndex: 3, playerId: tokensWithVision[key].id, digest: digest});
            const debugp = buildPath().commands(item.toCmds()).visible(item.visible).fillColor('#FF0000').strokeColor("#00FF00").layer("DRAWING").name("Fog of War").metadata({[`${Constants.EXTENSIONID}/isVisionFog`]: true}).build();
            //OBR.scene.local.addItems([debugp]);
        } else {
            // these duplicates are still visible, so dont delete them if we have persistence turned off.
            dedup_digest[digest] = true;
        }

        if (fowEnabled) {
            const debugp = buildPath().commands(item.toCmds()).visible(item.visible).fillColor('#550000').strokeColor("#00FF00").layer("DRAWING").name("Fog of War").metadata({[`${Constants.EXTENSIONID}/isVisionFog`]: true}).build();
            //OBR.scene.local.addItems([debugp]);

            trailingFogRect.op(item, PathKit.PathOp.DIFFERENCE);
        }
        item.delete();
    }

    // can this come from sceneCache?
    const oldTrailingFog = await OBR.scene.local.getItems(isTrailingFog as ItemFilter<Image>);

    computeTimer.pause(); awaitTimer.resume();
    if (fowEnabled) {
        const fowColor = (sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] ? sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] : "#000000") as string;
        const trailingFog = buildPath()
            .commands(trailingFogRect.toCmds())
            .locked(true)
            .fillRule("evenodd")
            .visible(true)
            .fillColor(fowColor)
            .fillOpacity(0.5)
            .strokeWidth(0)
            .strokeColor("#000000")
            .layer("DRAWING")
            .metadata({[`${Constants.EXTENSIONID}/isTrailingFog`]: true})
            .name("Trailing Fog")
            .build();

        // TODO: does this work?
        trailingFog.disableHit = true;
        trailingFog.zIndex = 0;

        if (oldTrailingFog.length > 0) {
            // If the old item exists in the scene, reuse it, otherwise you get flickering. 
            // Warning: This can use fastUpdate since we only change the path, though it seemed to break without it too.
            OBR.scene.local.updateItems(isTrailingFog as ItemFilter<Image>, items => {
                for (const item of items) {
                    item.commands = trailingFog.commands;
                }
            }, false);
        } else {
            await OBR.scene.local.addItems([trailingFog]);
        }
    } else {
        const fogItems = await OBR.scene.local.getItems(isTrailingFog as ItemFilter<Image>);
        await OBR.scene.local.deleteItems(fogItems.map(fogItem => fogItem.id));
    }
    
    trailingFogRect.delete();

    // Before we start adding and removing, get a list of fog items, excluding any that we detected as duplicates in the scene:
    const oldFog = await OBR.scene.local.getItems((item) => isVisionFog(item) && dedup_digest[item.metadata[`${Constants.EXTENSIONID}/digest`]] === undefined);

    const promisesToExecute = [
        OBR.scene.local.deleteItems(oldRings.map(fogItem => fogItem.id)),
        OBR.scene.local.addItems(itemsToAdd.map(item =>
        {
            const path = buildPath().commands(item.cmds).locked(true).visible(item.visible).fillColor('#000000').strokeColor("#000000").layer("FOG").name("Fog of War").metadata({[`${Constants.EXTENSIONID}/isVisionFog`]: true, [`${Constants.EXTENSIONID}/digest`]: item.digest}).build();
            path.zIndex = item.zIndex;
            return path;
        }))
    ];

    if (!persistenceEnabled) {
        promisesToExecute.push(OBR.scene.local.deleteItems(oldFog.map((item) => item.id)));
    }

    // Include the rings in the promise, if available
    if (playerRings.length > 0)
    {
        promisesToExecute.push(OBR.scene.local.addItems(playerRings));
    }

    if (!sceneCache.fog.filled)
        promisesToExecute.push(OBR.scene.fog.setFilled(true));

    // Update all items
    await Promise.all(promisesToExecute);

    const [awaitTimerResult, computeTimerResult] = [awaitTimer.stop(), computeTimer.stop()];
    updatePerformanceInformation({
        "compute_time": `${computeTimerResult} ms`,
        "communication_time": `${awaitTimerResult} ms`,
        "cache_hits": cacheHits,
        "cache_misses": cacheMisses,
    });

    busy = false;
}
document.addEventListener("updateVision", computeShadow)

let previousVisionShapes: string;
let previousPlayersWithVision: string;
let previousSize: number[] = [];
let previousVisionEnabled: boolean;
let previousMap: string;
let previousAutodetectEnabled: boolean;
let previousFowEnabled: boolean;
let previousPersistenceEnabled: boolean;
let previousFowColor: string;

export async function onSceneDataChange(forceUpdate?: boolean)
{
    if (busy)
        return;

    if (!(await OBR.scene.isReady()))
        return;

    const [awaitTimer, computeTimer] = [new Timer(), new Timer()];

    awaitTimer.start(); awaitTimer.pause();
    computeTimer.start();

    const gmPlayers = sceneCache.players.filter(x => x.role == "GM");
    const gmTokens = sceneCache.items.filter(item => item.layer == "CHARACTER" && gmPlayers.some(gm => item.createdUserId === gm.id)
        && (item.metadata[`${Constants.EXTENSIONID}/hasVision`] || item.metadata[`${Constants.ARMINDOID}/hasVision`]));
    const tokensWithVision = (sceneCache.role == "GM") ? sceneCache.items.filter(isTokenWithVision) : sceneCache.items.filter(isTokenWithVisionIOwn).concat(gmTokens);
    const visionShapes = sceneCache.items.filter(isActiveVisionLine);
    const backgroundImage = sceneCache.items.filter(isBackgroundBorder)?.[0] as any as Shape;
    const visionEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    const persistenceEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/persistenceEnabled`] === true;
    const autodetectEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === true;
    const fowEnabled = sceneCache.metadata[`${Constants.EXTENSIONID}/fowEnabled`] === true;
    const fowColor = sceneCache.metadata[`${Constants.EXTENSIONID}/fowColor`] as string;
  
    if (backgroundImage === undefined)
        return;

    //const dpiRatio = sceneCache.gridDpi / backgroundImage.grid.dpi;      const size = [backgroundImage.width * backgroundImage.scale.x, backgroundImage.height * backgroundImage.scale.y];
    const size = [backgroundImage.width * backgroundImage.scale.x, backgroundImage.height * backgroundImage.scale.y];
    const scale = [backgroundImage.scale.x, backgroundImage.scale.y];
    const offset = [backgroundImage.position.x, backgroundImage.position.y];

    // This fixes images being offset from the original position in the earlier versions, though doesnt apply to smoke
    // const offset = [backgroundImage.position.x - (backgroundImage.grid.offset.x * dpiRatio), backgroundImage.position.y - (backgroundImage.grid.offset.y * dpiRatio)];

    if (sceneCache.role == "GM")
    {
        const mapHeight = document.getElementById("mapHeight")! as HTMLInputElement;
        const mapWidth = document.getElementById("mapWidth")! as HTMLInputElement;
        mapWidth.value = (Math.round(size[0]) / sceneCache.gridDpi).toString();
        mapHeight.value = (Math.round(size[1]) / sceneCache.gridDpi).toString();
    }

    // Check if any values have changed and a re-draw is necessary
    const sVisionShapes = JSON.stringify(visionShapes);
    const sPlayersWithVision = JSON.stringify(tokensWithVision);
    const sBackgroundImage = JSON.stringify(backgroundImage);
    if (sBackgroundImage == previousMap 
        && visionEnabled == previousVisionEnabled 
        && previousFowColor == fowColor
        && previousAutodetectEnabled == autodetectEnabled
        && previousFowEnabled == fowEnabled
        && previousPersistenceEnabled == persistenceEnabled
        && previousVisionShapes == sVisionShapes 
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

    // Fire an `updateVisionEvent` to launch the `computeShadow` function.
    const updateVisionEvent = new CustomEvent("updateVision", {
        detail: {
            awaitTimer: awaitTimer,
            computeTimer: computeTimer,
            allItems: sceneCache.items,
            metadata: sceneCache.metadata,
            size: size,
            offset: offset,
            scale: scale,
            tokensWithVision: tokensWithVision,
            visionShapes: visionShapes,
            invalidateCache: invalidateCache,
        } as Detail
    });

    if (!busy)
    {
        document.dispatchEvent(updateVisionEvent);
    }
}