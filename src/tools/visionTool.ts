import OBR, { buildPath, buildShape, Image, isImage, Item, Shape, ItemFilter, Vector2, Math2, MathM } from "@owlbear-rodeo/sdk";
import PathKitInit from "pathkit-wasm/bin/pathkit";
import wasm from "pathkit-wasm/bin/pathkit.wasm?url";
import { polygonMode } from "./visionPolygonMode";
import { lineMode } from "./visionLineMode";
import { Timer } from "./../utilities/debug";
import { ObjectCache } from "./../utilities/cache";
import { sceneCache } from "./../utilities/globals";
import { squareDistance, comparePosition, isClose, mod } from "./../utilities/math";
import { isVisionFog, isActiveVisionLine, isTokenWithVision, isBackgroundBorder, isIndicatorRing, isTokenWithVisionIOwn, isTrailingFog, isAnyFog, isTokenWithVisionForUI, isTorch, isAutohide } from "./../utilities/itemFilters";
import { Constants } from "../utilities/constants";

export async function setupAutohideMenus(show: boolean): Promise<void>
{
    if (show)
    {
        await OBR.contextMenu.create({
            id: `${Constants.EXTENSIONID}/toggle-autohide-menu`,
            icons: [
                {
                    icon: "/autohide-off.svg",
                    label: "Enable Autohide",
                    filter: {
                        every: [{ key: "layer", value: "CHARACTER" }, { key: ["metadata", `${Constants.EXTENSIONID}/hasAutohide`], value: undefined }],
                        roles: ["GM"]
                    },
                },
                {
                    icon: "/autohide-on.svg",
                    label: "Disable Autohide",
                    filter: {
                        every: [{ key: "layer", value: "CHARACTER" }],
                        roles: ["GM"]
                    },
                },
            ],
            async onClick(ctx)
            {
                const enableFog = ctx.items.every(
                    (item) => item.metadata[`${Constants.EXTENSIONID}/hasAutohide`] === undefined);

                await OBR.scene.items.updateItems(ctx.items, items =>
                {
                    for (const item of items)
                    {
                        if (!enableFog)
                        {
                            delete item.metadata[`${Constants.EXTENSIONID}/hasAutohide`];
                        }
                        else
                        {
                            item.metadata[`${Constants.EXTENSIONID}/hasAutohide`] = true;
                        }
                    }
                });
            },
        });
    } else
    {
        await OBR.contextMenu.remove(`${Constants.EXTENSIONID}/toggle-autohide-menu`);
    }
}

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
                    every: [{ key: "layer", value: "CHARACTER", coordinator: "||" }, { key: "layer", value: "ATTACHMENT", coordinator: "&&" }, { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], value: undefined }],
                },
            },
            {
                icon: "/icon.svg",
                label: "Disable Vision",
                filter: {
                    every: [{ key: "layer", value: "CHARACTER", coordinator: "||" }, { key: "layer", value: "ATTACHMENT", coordinator: "||" }],
                },
            },
        ],
        async onClick(ctx)
        {
            const enableFog = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/hasVision`] === undefined);

            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (!enableFog)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/hasVision`];
                    }
                    else
                    {
                        item.metadata[`${Constants.EXTENSIONID}/hasVision`] = true;
                        if (item.metadata[`${Constants.EXTENSIONID}/visionRange`] === undefined)
                        {
                            item.metadata[`${Constants.EXTENSIONID}/visionRange`] = Constants.VISIONDEFAULT;
                        }
                    }
                }
            });
        },
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-groupvision-menu`,
        icons: [
            {
                icon: "/no-vision.svg",
                label: "Toggle Attachments Vision",
                filter: {
                    every: [{ key: "layer", value: "NOTE" }, { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], value: undefined }],
                },
            },
        ],
        async onClick(ctx)
        {
            if (ctx.items.length > 0)
            {
                const parentIds = ctx.items.map(x => x.id);
                const attached = await OBR.scene.items.getItemAttachments(parentIds);
                await OBR.scene.items.updateItems(attached, items =>
                {
                    for (const item of items)
                    {
                        if (parentIds.includes(item.attachedTo))
                        {
                            if (item.metadata[`${Constants.EXTENSIONID}/hasVision`] && (item.layer == "CHARACTER" || item.layer == "ATTACHMENT"))
                            {
                                delete item.metadata[`${Constants.EXTENSIONID}/hasVision`];
                            }
                            else if (item.layer == "CHARACTER" || item.layer == "ATTACHMENT")
                            {
                                item.metadata[`${Constants.EXTENSIONID}/hasVision`] = true;
                                if (item.metadata[`${Constants.EXTENSIONID}/visionRange`] === undefined)
                                {
                                    item.metadata[`${Constants.EXTENSIONID}/visionRange`] = Constants.VISIONDEFAULT;
                                }
                            }
                        }
                    }
                });
            }

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

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-fog-background`,
        icons: [
            {
                icon: "/fog-background.svg",
                label: "Convert To Fog Background",
                filter: {
                    every: [{ key: "layer", value: "MAP" }],
                },
            },
        ],
        async onClick(ctx)
        {
            if (ctx.items.length > 0)
            {

                await OBR.scene.items.updateItems(ctx.items, (items: Item[]) =>
                {
                    for (let i = 0; i < items.length; i++)
                    {
                        items[i].zIndex = 1;
                        items[i].layer = "FOG";
                        items[i].disableHit = true;
                        items[i].locked = false;
                        items[i].visible = false;
                        items[i].metadata[`${Constants.EXTENSIONID}/isBackgroundMap`] = true;
                    }
                });
            }
        },
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
        if (key == "compute_time" || key == "communication_time" || key[0] == 's')
        {
            if (element) element.innerText = Number.parseFloat(value).toFixed(1) + 'ms';
        } else
        {
            if (element) element.innerText = value;
        }
    }
}

interface ObstructionLine
{
    startPosition: Vector2,
    endPosition: Vector2,
    originalShape: any,
    oneSided: string
}

interface Polygon
{
    pointset: Vector2[],
    fromShape: any
}

function createObstructionLines(visionShapes: any): ObstructionLine[]
{
    let obstructionLines: ObstructionLine[] = [];
    for (const shape of visionShapes)
    {
        if (!shape.points || shape.points.length <= 1) continue;
        for (let i = 0; i < shape.points.length - 1; i++)
        {
            let start: Vector2, end: Vector2;

            const shapeTransform = MathM.fromItem(shape);
            const startTransform = MathM.fromPosition(shape.points[i]);
            const endTransform = MathM.fromPosition(shape.points[i + 1]);

            start = MathM.decompose(MathM.multiply(shapeTransform, startTransform)).position;
            end = MathM.decompose(MathM.multiply(shapeTransform, endTransform)).position;

            obstructionLines.push({
                startPosition: start,
                endPosition: end,
                originalShape: shape,
                oneSided: shape.metadata[`${Constants.EXTENSIONID}/oneSided`]
            });
        }
    }
    return obstructionLines;
}

// Main fog visibility calculation occurs here.

function createPolygons(visionLines: ObstructionLine[], tokensWithVision: any, width: number, height: number, offset: [number, number], scale: [number, number]): Polygon[][]
{
    let polygons: Polygon[][] = [];
    let lineCounter = 0, skipCounter = 0;
    let size = [width, height];
    const gmIds = sceneCache.players.filter(x => x.role == "GM");
    const useOptimisations = sceneCache.metadata[`${Constants.EXTENSIONID}/quality`] != 'accurate';

    // If we have no torches in the scene at all, we can calculate the player vision without worrying about all the obstruction lines outside of the player view range.
    // Unfortunately because of the way torches are rendered, (in particular that we calculate partial visibilty for them), we need full visibility calculated and cant use this optimisation if there are any torches at all.
    const sceneHasTorches = tokensWithVision.some(isTorch);

    for (const token of tokensWithVision)
    {
        const myToken = (sceneCache.userId === token.createdUserId);
        const gmToken = gmIds.some(x => x.id == token.createdUserId);
        if ((!myToken && sceneCache.role !== "GM") && !gmToken) continue;

        const visionRangeMeta = token.metadata[`${Constants.EXTENSIONID}/visionRange`];

        const cacheResult = playerShadowCache.getValue(token.id);
        polygons.push([]);
        if (cacheResult !== undefined && comparePosition(cacheResult.player.position, token.position) && cacheResult.player.metadata[`${Constants.EXTENSIONID}/visionRange`] === visionRangeMeta)
        {
            continue; // The result is cached and will be used later, no need to do work
        }

        // use the token vision range to potentially skip any obstruction lines out of range:
        let visionRange = 1000 * sceneCache.gridDpi;
        if (visionRangeMeta)
        {
            visionRange = sceneCache.gridDpi * ((visionRangeMeta) / sceneCache.gridScale + .5);
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
            if ((lsx < offset[0] || lsy < offset[1] || lsx > offset[0] + size[0] || lsy > offset[1] + size[1]) || (lex < offset[0] || ley < offset[1] || lex > offset[0] + size[0] || ley > offset[1] + size[1]))
            {
                skipCounter++;
                continue;
            }

            // exclude lines based on distance.. this is faster than creating polys around everything, but is less accurate, particularly on long lines
            if (useOptimisations && (!sceneHasTorches || isTorch(token)))
            {
                const segments: Vector2[] = [line.startPosition, line.endPosition];
                const length = Math2.distance(line.startPosition, line.endPosition);
                const segmentFactor = 3; // this causes load but increases accuracy, because we calculate maxSegments as a proportion of the visionRange divided by the segment factor to increase resolution
                const maxSegments = Math.floor(length / (visionRange / segmentFactor));

                for (let i = 1; i < maxSegments; i++)
                {
                    segments.push(Math2.lerp(line.startPosition, line.endPosition, (i / maxSegments)));
                }

                let skip = true;
                for (const segment of segments)
                {
                    if (Math2.compare(token.position, segment, visionRange))
                    {
                        skip = false;
                    }
                };

                if (skip)
                {
                    skipCounter++;
                    continue;
                }
            }

            lineCounter++;

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

    return polygons;
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

    const stages = [];
    for (let i = 0; i <= 6; i++) stages.push(new Timer());

    stages[1].start();

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
    if (autodetectEnabled)
    {
        // draw a big box around all the maps
        const maps: Image[] = await OBR.scene.items.getItems((item) => item.layer === "MAP" && isImage(item));

        let mapbox = [];
        for (let map of maps)
        {
            let dpiRatio = sceneCache.gridDpi / map.grid.dpi;
            let left = map.position.x - (dpiRatio * map.grid.offset.x) * map.scale.x, top = map.position.y - (dpiRatio * map.grid.offset.y) * map.scale.y;
            let right = left + (dpiRatio * map.image.width) * map.scale.x, bottom = top + (dpiRatio * map.image.height) * map.scale.y;

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

    const shouldComputeVision = metadata[`${Constants.EXTENSIONID}/visionEnabled`] === true;
    if (!shouldComputeVision || tokensWithVision.length == 0)
    {
        // Clear fog
        const fogItems = await OBR.scene.local.getItems(isAnyFog as ItemFilter<Image>);
        await OBR.scene.local.deleteItems(fogItems.map(fogItem => fogItem.id));

        busy = false;
        return;
    }

    /*
     * Stage 1: Calculate obstruction lines and fog shapes
     */

    // Extract all obstruction lines
    const obstructionLines: ObstructionLine[] = createObstructionLines(visionShapes);

    // Create polygons containing the individual shadows cast by a vision line from the point of view of one player.
    const polygons: Polygon[][] = createPolygons(obstructionLines, tokensWithVision, width, height, offset, scale);

    if (polygons.length == 0)
    {
        busy = false;
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
        const gmIds = sceneCache.players.filter(x => x.role == "GM");
        const myToken = (sceneCache.userId === tokensWithVision[i].createdUserId);
        const gmToken = gmIds.some(x => x.id == tokensWithVision[i].createdUserId);

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
            const owner = sceneCache.players.find(x => x.id === token.createdUserId);
            if (owner && sceneCache.role === "GM" && !isTorch(token))
            {
                // Add indicator rings intended for the GM
                const playerRing = buildShape().strokeColor(owner.color).fillOpacity(0)
                    .position({ x: token.position.x, y: token.position.y }).width(visionRange * 2)
                    .height(visionRange * 2).shapeType("CIRCLE").metadata({ [`${Constants.EXTENSIONID}/isIndicatorRing`]: true }).build();

                playerRings.push(playerRing);
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
    let enableReuseFog = persistenceEnabled && sceneCache.metadata[`${Constants.EXTENSIONID}/quality`] != 'accurate';
    let reuseFog: Image[] = [];
    let reuseNewFog: any;

    // Reuse a single (but insanely complex) path to avoid overhead of lots of fog items
    if (enableReuseFog)
    {
        // Reuse the same localItem and change the path.
        reuseFog = await OBR.scene.local.getItems(isVisionFog as ItemFilter<Image>);
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
        } else
        {
            // Initalize the new path builder with the existing item's path:
            let oldPath = PathKit.FromCmds((reuseFog[0] as any).commands);
            reuseNewFog.add(oldPath, PathKit.PathOp.UNION);
            oldPath.delete();
        }
    }

    const currentFog = new PathKit.SkOpBuilder();
    let useTokenVisibility = false;

    // Iterate over each of the fog paths (per token), and either:
    //   Add them to the list of fog items to add to the scene, deduplicating based on a hash of the fog path,
    //   or, if persistence/enableReuseFog is enabled, then add the paths to a single path to reuse the existing fog item in the scene.

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
            if (enableReuseFog)
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
            if (enableDebug)
            {
                const debugp = buildPath().commands(item.toCmds()).visible(item.visible).fillColor('#550000').strokeColor("#00FF00").layer("DRAWING").name("Fog of War").metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true }).build();
                OBR.scene.local.addItems([debugp]);
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
    if (enableReuseFog)
    {
        const newPath = reuseNewFog.resolve();
        newPath.setFillType(PathKit.FillType.EVENODD);

        const commands = newPath.toCmds();

        await OBR.scene.local.updateItems([reuseFog[0].id], (items) =>
        {
            items[0].commands = commands;
        });

        try
        {
            localStorage.setItem(`${Constants.EXTENSIONID}/fogCache/${sceneCache.userId}/${sceneId}`, JSON.stringify([{ digest: 'reuse', commands: commands }]));
        }
        catch (error)
        {
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
    // This has become somewhat irrelevant for two reasons: we're using scene.local which doesnt have this performance hit, and enableReuseFog bypasses this completely

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
            OBR.scene.local.updateItems(isTrailingFog as ItemFilter<Image>, items =>
            {
                for (const item of items)
                {
                    item.commands = trailingFog.commands;
                }
            }, false);
        } else
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
            OBR.scene.local.deleteItems(oldFog.map((item) => item.id));
        }

        // Include the rings in the promise, if available
        if (playerRings.length > 0)
        {
            OBR.scene.local.addItems(playerRings);
        }

        if (!sceneCache.fog.filled)
        {
            OBR.scene.fog.setFilled(true);
        }
    } else
    {
        promisesToExecute.push(OBR.scene.local.deleteItems(oldRings.map(fogItem => fogItem.id)));
        promisesToExecute.push(OBR.scene.local.addItems(itemsToAdd.map(item =>
        {
            const path = buildPath().commands(item.cmds).locked(true).visible(item.visible).fillColor('#000000').strokeColor("#000000").layer("FOG").name("Fog of War").metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true, [`${Constants.EXTENSIONID}/digest`]: item.digest }).build();
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
        updateTokenVisibility(currentFogPath);
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

}
document.addEventListener("updateVision", computeShadow);

async function updateTokenVisibility(currentFogPath: any)
{
    const toggleTokens: Image[] = [];
    const tokens = sceneCache.items.filter((item) => isAutohide(item) && isImage(item));

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
        if (enableDebug)
        {
            const ring = buildPath().strokeColor('#0000ff').fillOpacity(1).commands(tempPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/isIndicatorRing`]: true }).build();
            await OBR.scene.local.addItems([ring]);
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
        if (enableDebug)
        {
            const ring = buildPath().fillRule("evenodd").strokeColor('#ff0000').fillOpacity(0).commands(intersectPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/isIndicatorRing`]: true }).build();
            await OBR.scene.local.addItems([ring]);
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
let enableDebug = false;

export async function onSceneDataChange(forceUpdate?: boolean)
{
    if (busy)
        return;

    if (!(await OBR.scene.isReady()))
        return;

    const debugDiv = document.querySelector("#debug_div") as HTMLDivElement;
    //enableDebug = !(debugDiv.style.display === 'none');
    //enableDebug = true;

    const [awaitTimer, computeTimer] = [new Timer(), new Timer()];

    awaitTimer.start(); awaitTimer.pause();
    computeTimer.start();

    // How much overhead is all this?

    const gmPlayers = sceneCache.players.filter(x => x.role == "GM");
    const gmTokens = sceneCache.items.filter(item => (item.layer == "CHARACTER" || item.layer == "ATTACHMENT") && gmPlayers.some(gm => item.createdUserId === gm.id)
        && (item.metadata[`${Constants.EXTENSIONID}/hasVision`] || item.metadata[`${Constants.ARMINDOID}/hasVision`])
        && !item.metadata[`${Constants.EXTENSIONID}/visionBlind`]);

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
    } else
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
        mapWidth.value = (Math.round(size[0]) / sceneCache.gridDpi).toString();
        mapHeight.value = (Math.round(size[1]) / sceneCache.gridDpi).toString();
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