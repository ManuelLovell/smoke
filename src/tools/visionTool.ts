import OBR, { buildPath, buildShape, Image, Shape } from "@owlbear-rodeo/sdk";
import PathKitInit from "pathkit-wasm/bin/pathkit";
import wasm from "pathkit-wasm/bin/pathkit.wasm?url";
import { polygonMode } from "./visionPolygonMode";
import { lineMode } from "./visionLineMode";
import { Timer } from "./../utilities/debug";
import { ObjectCache } from "./../utilities/cache";
import { sceneCache } from "./../utilities/globals";
import { squareDistance, comparePosition, isClose, mod } from "./../utilities/math";
import { isVisionFog, isActiveVisionLine, isTokenWithVision, isBackgroundBorder, isIndicatorRing, isTokenWithVisionIOwn } from "./../utilities/itemFilters";
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
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true }],
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

    const localItems = await OBR.scene.local.getItems() as Image[];

    // Load information from the event
    const {
        awaitTimer,
        computeTimer,
        metadata,
        size,
        offset,
        scale,
        visionShapes,
        tokensWithVision,
        invalidateCache,
    } = event.detail;
    const [width, height] = size;

    let cacheHits = 0, cacheMisses = 0;
    if (invalidateCache)  // Something significant changed => invalidate cache
        playerShadowCache.invalidate((_, value) => value.shadowPath.delete());

    computeTimer.resume();

    const shouldComputeVision = metadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    if (!shouldComputeVision || tokensWithVision.length == 0)
    {
        // Clear fog
        await OBR.scene.local.deleteItems(localItems.filter(isVisionFog).map(fogItem => fogItem.id));
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
    for (const item of Object.values(itemsPerPlayer))
    {
        itemsToAdd.push({ cmds: item.toCmds(), visible: false, zIndex: 3 });
        item.delete();
    }

    computeTimer.pause(); awaitTimer.resume();

    const promisesToExecute = [
        OBR.scene.local.deleteItems(localItems.filter(isIndicatorRing).map(fogItem => fogItem.id)),
        OBR.scene.local.addItems(itemsToAdd.map(item =>
        {
            const path = buildPath().commands(item.cmds).locked(true).visible(item.visible).fillColor("#000000").strokeColor("#000000").layer("FOG").name("Fog of War").metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true }).build();
            path.zIndex = item.zIndex;
            return path;
        })),
        OBR.scene.local.deleteItems(localItems.filter(isVisionFog).map(fogItem => fogItem.id))
    ];

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

export async function onSceneDataChange()
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
    if (backgroundImage === undefined)
        return;

    //const dpiRatio = sceneCache.gridDpi / backgroundImage.grid.dpi;      const size = [backgroundImage.width * backgroundImage.scale.x, backgroundImage.height * backgroundImage.scale.y];
    const size = [backgroundImage.width * backgroundImage.scale.x, backgroundImage.height * backgroundImage.scale.y];
    const scale = [backgroundImage.scale.x, backgroundImage.scale.y];
    const offset = [backgroundImage.position.x, backgroundImage.position.y];

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
    if (sBackgroundImage == previousMap && visionEnabled == previousVisionEnabled && previousVisionShapes == sVisionShapes && previousPlayersWithVision == sPlayersWithVision && size[0] == previousSize[0] && size[1] == previousSize[1])
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