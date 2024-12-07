import OBR, { buildCurve, Curve, Line, Image, Shape, Vector2, Path, buildImage, buildEffect } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { BSCACHE } from "./utilities/bsSceneCache";
import { SPECTREMACHINE } from "./SpectreTwo";
import { GetDarkvisionDefault, GetFalloffRangeDefault, GetInnerAngleDefault, GetOuterAngleDefault, GetSourceRangeDefault, GetToolWidth, GetVisionRangeDefault } from "./tools/visionToolUtilities";
import { ConvertPathCommands } from "./utilities/bsUtilities";
import { TensionHelper } from "./obr/tensionhelper";

export async function SetupContextMenus(): Promise<void>
{
    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/convert-curve`,
        icons: [
            {
                icon: "/opendoor.svg",
                label: "Convert to Obstruction",
                filter: {
                    every: [
                        {
                            key: ["metadata", `${Constants.EXTENSIONID}/elevation`],
                            value: undefined,
                        },
                        {
                            key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                            value: undefined,
                        },
                        {
                            key: ["metadata", `${Constants.EXTENSIONID}/isFogEffect`],
                            value: undefined,
                        }],
                    some: [{ key: "layer", value: "DRAWING", coordinator: "||" }, { key: "layer", value: "FOG" }],
                    roles: ["GM"]
                },
            }
        ],
        async onClick(ctx)
        {
            const linesToMake = [];
            const linesToDelete = [];

            for (const item of ctx.items)
            {
                if (item.type === "CURVE")
                {
                    // Remember this Que: Lines need to remade because for some reason
                    // it doesnt work great converting straight over
                    const baseCurve = item as Curve;
                    if (baseCurve.points.length > 2)
                    {
                        const tension = baseCurve.style.tension ?? 0;
                        const closedShape = baseCurve.style.closed === true || baseCurve.style.fillOpacity !== 0;
                        if (closedShape) { baseCurve.points.push(baseCurve.points[0]); }
                        const curvedPath = TensionHelper.CreateSkPath(baseCurve.points, tension, closedShape);
                        const adjustedPoints = ConvertPathCommands(curvedPath, { x: 0, y: 0 }, { curveSegments: 20 });

                        const line = buildCurve()
                            .tension(0)
                            .points(adjustedPoints)
                            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
                            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
                            .strokeWidth(GetToolWidth())
                            .tension(tension)
                            .fillOpacity(0)
                            .fillColor("#000000")
                            .layer(Constants.LINELAYER)
                            .name("Vision Line (Line)")
                            .closed(closedShape)
                            .locked(true)
                            .visible(false)
                            .metadata({
                                [`${Constants.EXTENSIONID}/isVisionLine`]: true,
                                [`${Constants.EXTENSIONID}/blocking`]: true,
                                [`${Constants.EXTENSIONID}/doubleSided`]: true
                            })
                            .build();

                        linesToMake.push(line);
                        linesToDelete.push(baseCurve.id);
                    }
                }
                else if (item.type === "PATH")
                {
                    const basePath = item as Path;
                    if (basePath.commands.length > 2)
                    {
                        const line = buildCurve()
                            .tension(0)
                            .points(ConvertPathCommands(basePath.commands, basePath.position))
                            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
                            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
                            .strokeWidth(GetToolWidth())
                            .fillOpacity(0)
                            .fillColor("#000000")
                            .layer(Constants.LINELAYER)
                            .name("Vision Line (Line)")
                            .closed(false)
                            .locked(true)
                            .visible(false)
                            .metadata({
                                [`${Constants.EXTENSIONID}/isVisionLine`]: true,
                                [`${Constants.EXTENSIONID}/blocking`]: true,
                                [`${Constants.EXTENSIONID}/doubleSided`]: true
                            })
                            .build();
                        linesToMake.push(line);
                        linesToDelete.push(basePath.id);
                    }
                }
                else if (item.type === "LINE")
                {
                    const baseLine = item as Line;
                    const line = buildCurve()
                        .tension(0)
                        .points(adjustPoints([baseLine.startPosition, baseLine.endPosition], baseLine.position))
                        .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
                        .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
                        .strokeWidth(GetToolWidth())
                        .fillOpacity(0)
                        .fillColor("#000000")
                        .layer(Constants.LINELAYER)
                        .name("Vision Line (Line)")
                        .closed(false)
                        .locked(true)
                        .visible(false)
                        .metadata({
                            [`${Constants.EXTENSIONID}/isVisionLine`]: true,
                            [`${Constants.EXTENSIONID}/blocking`]: true,
                            [`${Constants.EXTENSIONID}/doubleSided`]: true
                        })
                        .build();

                    linesToMake.push(line);
                    linesToDelete.push(baseLine.id);
                }
                else if (item.type === "SHAPE")
                {
                    const baseShape = item as Shape;
                    const points = [];
                    if (baseShape.shapeType === "CIRCLE")
                    {
                        const radius = Math.min(baseShape.width, baseShape.height) / 2;
                        const angleIncrement = (2 * Math.PI) / 20;
                        for (let i = 0; i < 20; i++)
                        {
                            const angle = i * angleIncrement;
                            const x = radius * Math.cos(angle);
                            const y = radius * Math.sin(angle);
                            points.push({ x, y });
                        }
                    }
                    else if (baseShape.shapeType === "RECTANGLE")
                    {
                        const x = 0;
                        const y = 0;
                        const endX = x + baseShape.width;
                        const endY = y + baseShape.height;

                        points.push({ x: x, y: y });
                        points.push({ x: endX, y: y });
                        points.push({ x: endX, y: endY });
                        points.push({ x: x, y: endY });
                    }
                    else if (baseShape.shapeType === "HEXAGON")
                    {
                        const radius = baseShape.width / 2;
                        const angles = [Math.PI / 2, Math.PI / 6, 11 * Math.PI / 6, 3 * Math.PI / 2, 7 * Math.PI / 6, 5 * Math.PI / 6];

                        // Calculate hexagon vertices based on angles and rotation
                        for (let i = 0; i < 6; i++)
                        {
                            const angle = angles[i];
                            const x = radius * Math.cos(angle);
                            const y = radius * Math.sin(angle);
                            points.push({ x, y });
                        }
                    }
                    else if (baseShape.shapeType === "TRIANGLE")
                    {
                        const x = 0;
                        const y = 0;
                        points.push({ x: x, y: y });
                        points.push({ x: x - (baseShape.width / 2), y: y + baseShape.height });
                        points.push({ x: x + (baseShape.width / 2), y: y + baseShape.height });
                    }

                    if (points.length > 0)
                    {
                        points.push(points[0]);

                        let adjustedPoints = points;
                        if (baseShape.shapeType === "CIRCLE")
                        {
                            const curvedPath = TensionHelper.CreateSkPath(points, .25, true);
                            adjustedPoints = ConvertPathCommands(curvedPath, { x: 0, y: 0 }, { curveSegments: 20 });
                        }

                        const line = buildCurve()
                            .tension(0)
                            .points(adjustedPoints)
                            .position(baseShape.position)
                            .rotation(baseShape.rotation)
                            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR)
                            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? Constants.DEFAULTLINESTROKE)
                            .strokeWidth(GetToolWidth())
                            .fillOpacity(0)
                            .fillColor("#000000")
                            .layer(Constants.LINELAYER)
                            .name("Vision Line (Line)")
                            .closed(false)
                            .locked(true)
                            .visible(false)
                            .metadata({
                                [`${Constants.EXTENSIONID}/isVisionLine`]: true,
                                [`${Constants.EXTENSIONID}/blocking`]: true,
                                [`${Constants.EXTENSIONID}/doubleSided`]: true
                            })
                            .build();

                        linesToMake.push(line);
                        linesToDelete.push(baseShape.id);
                    }
                }
            }
            if (linesToMake.length > 0)
            {
                const batchSize = 5;
                for (let i = 0; i < linesToMake.length; i += batchSize)
                {
                    const batch = linesToMake.slice(i, i + batchSize);
                    await OBR.scene.items.addItems(batch);
                }

                await OBR.scene.items.deleteItems(linesToDelete);
            }
        }
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-vision-menu`,
        icons: [
            {
                icon: "/no-vision.svg",
                label: "Enable Vision",
                filter: {
                    every: [
                        { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], operator: "==", value: undefined, coordinator: "&&" },
                        { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined }],
                    some: [
                        { key: "layer", value: "CHARACTER", coordinator: "||" },
                        { key: "layer", value: "ATTACHMENT" }],
                },
            },
            {
                icon: "/icon.svg",
                label: "Disable Vision",
                filter: {
                    every: [
                        { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined }],
                    some: [
                        { key: "layer", value: "CHARACTER", coordinator: "||" },
                        { key: "layer", value: "ATTACHMENT" }],
                },
            },
        ],
        async onClick(ctx)
        {
            const enableVision = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/hasVision`] === undefined);

            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (!enableVision)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/hasVision`];
                    }
                    else
                    {
                        item.metadata[`${Constants.EXTENSIONID}/hasVision`] = true;
                        if (item.metadata[`${Constants.EXTENSIONID}/visionRange`] === undefined)
                        {
                            item.metadata[`${Constants.EXTENSIONID}/visionRange`] = GetVisionRangeDefault(); // Vision Attenuation - Outer Circle
                            item.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = GetSourceRangeDefault(); // Inner Circle
                            item.metadata[`${Constants.EXTENSIONID}/visionFallOff`] = GetFalloffRangeDefault(); // Fall off at end of vision
                            item.metadata[`${Constants.EXTENSIONID}/visionInAngle`] = GetInnerAngleDefault(); // Set an inner cone for vision
                            item.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = GetOuterAngleDefault(); // Set an outer cone for vision
                            item.metadata[`${Constants.EXTENSIONID}/visionDark`] = GetDarkvisionDefault(); // Set an outer cone for vision
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
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/disabled`], value: undefined }]
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
                label: "Swap to Double-sided",
                filter: {
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isWindow`],
                        value: undefined
                    },
                    { key: ["metadata", `${Constants.EXTENSIONID}/doubleSided`], value: undefined }]
                },
            },
            {
                icon: "/left-sided.svg",
                label: "Swap to One-sided",
                filter: {
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isWindow`],
                        value: undefined
                    },
                    { key: ["metadata", `${Constants.EXTENSIONID}/doubleSided`], value: true }]
                },
            }
        ],
        async onClick(ctx)
        {
            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && item.metadata[`${Constants.EXTENSIONID}/doubleSided`])
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/doubleSided`];
                    }
                    else if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`])
                    {
                        item.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
                    }
                }
            });
        }
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/switch-obstructing-side`,
        icons: [
            {
                icon: "/flip.svg",
                label: "Swap Obstructing Side",
                filter: {
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    { key: "type", value: "CURVE", coordinator: "&&" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/doubleSided`], value: undefined }]
                },
            }
        ],
        async onClick(ctx)
        {
            await OBR.scene.items.updateItems<Curve>(ctx.items as Curve[], items =>
            {
                for (const item of items)
                {
                    const swappedPoints = item.points.reverse();
                    item.points = swappedPoints;
                }
            });
        }
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/switch-blockage`,
        icons: [
            {
                icon: "/blocked.svg",
                label: "Swap to Unpassable",
                filter: {
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isWindow`],
                        value: undefined
                    },
                    { key: ["metadata", `${Constants.EXTENSIONID}/blocking`], value: undefined }]
                },
            },
            {
                icon: "/unblock.svg",
                label: "Swap to Passable",
                filter: {
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isWindow`],
                        value: undefined
                    },
                    { key: ["metadata", `${Constants.EXTENSIONID}/blocking`], value: true }]
                },
            }
        ],
        async onClick(ctx)
        {
            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && item.metadata[`${Constants.EXTENSIONID}/blocking`])
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/blocking`];
                    }
                    else if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`])
                    {
                        item.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
                    }
                }
            });
        }
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/auto-fog-background`,
        icons: [
            {
                icon: "/fog-background.svg",
                label: "Auto Fog Map",
                filter: {
                    every: [{ key: "layer", value: "MAP" },
                    { key: "type", value: "IMAGE" },],
                    max: 1,
                },
            }
        ],
        async onClick(_ctx, elementId: string)
        {
            await OBR.popover.open({
                id: Constants.CONTEXTID,
                url: `/pages/mapcontextembed.html`,
                height: 80,
                width: 200,
                anchorElementId: elementId
            });
        },
        embed: { url: `/pages/mapcontextembed.html?contextmenu=true`, height: 80 }
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-fog-map`,
        icons: [
            {
                icon: "/fog-background.svg",
                label: "Convert To Fog Map",
                filter: {
                    every: [{ key: "layer", value: "MAP" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/isFogMap`], value: undefined }]
                },
            },
            {
                icon: "/fog-background.svg",
                label: "Convert To Normal Map",
                filter: {
                    every: [{ key: "layer", value: "FOG" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/isFogMap`], value: true }]
                },
            },
        ],
        async onClick(ctx)
        {
            const turnToFogMaps = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/isFogMap`] === undefined);

            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (!turnToFogMaps)
                    {
                        item.layer = "MAP";
                        item.zIndex = -1.00000001;
                        item.disableAutoZIndex = false;
                        delete item.metadata[`${Constants.EXTENSIONID}/isFogMap`];
                    }
                    else
                    {
                        item.layer = "FOG";
                        item.zIndex = -1.00000001;
                        item.disableAutoZIndex = true;
                        item.metadata[`${Constants.EXTENSIONID}/isFogMap`] = true;
                    }
                }
            });
        },
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/create-window`,
        icons: [
            {
                icon: "/window.svg",
                label: "Enable Window",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isWindow`],
                        value: undefined
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                    roles: ["GM"]
                },
            },
            {
                icon: "/window.svg",
                label: "Disable Window",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isWindow`],
                        value: true
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                    roles: ["GM"]
                },
            },
        ],
        async onClick(ctx)
        {
            const enableDoor = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/isWindow`] === undefined);

            await OBR.scene.items.updateItems<Curve>(ctx.items as Curve[], items =>
            {
                for (const item of items)
                {
                    if (!enableDoor)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/isWindow`];
                        //item.style.strokeColor = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR;
                        item.style.strokeDash = Constants.DEFAULTLINESTROKE;
                    }
                    else
                    {
                        item.metadata[`${Constants.EXTENSIONID}/isWindow`] = true;
                        //item.style.strokeColor = Constants.WINDOWCOLOR;
                        item.style.strokeDash = [20, 20];
                    }
                }
            });
        },
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/create-door`,
        icons: [
            {
                icon: "/opendoor.svg",
                label: "Enable Door",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoor`],
                        value: undefined
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                    roles: ["GM"]
                },
            },
            {
                icon: "/closedoor.svg",
                label: "Disable Door",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoor`],
                        value: true
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                    roles: ["GM"]
                },
            },
        ],
        async onClick(ctx)
        {
            const enableDoor = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/isDoor`] === undefined);

            await OBR.scene.items.updateItems<Curve>(ctx.items as Curve[], items =>
            {
                for (const item of items)
                {
                    if (!enableDoor)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/isDoorLocked`];
                        delete item.metadata[`${Constants.EXTENSIONID}/doorOpen`];
                        delete item.metadata[`${Constants.EXTENSIONID}/disabled`];
                        delete item.metadata[`${Constants.EXTENSIONID}/isDoor`];
                        item.style.strokeColor = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? Constants.DEFAULTLINECOLOR;
                    }
                    else
                    {
                        //#bb99ff
                        item.metadata[`${Constants.EXTENSIONID}/isDoor`] = true;
                        item.style.strokeColor = Constants.DOORCOLOR;
                    }
                }
            });
        },
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/open-door`,
        icons: [
            {
                icon: "/opendoor.svg",
                label: "Open Door",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoor`],
                        value: true
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/doorOpen`],
                        value: undefined
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoorLocked`],
                        value: undefined
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                },
            },
            {
                icon: "/closedoor.svg",
                label: "Close Door",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoor`],
                        value: true
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/doorOpen`],
                        value: true
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoorLocked`],
                        value: undefined
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                },
            },
        ],
        async onClick(ctx)
        {
            await OBR.scene.items.updateItems(ctx.items, (items) =>
            {
                for (let item of items)
                {
                    if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && item.metadata[`${Constants.EXTENSIONID}/disabled`])
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/disabled`];
                        delete item.metadata[`${Constants.EXTENSIONID}/doorOpen`];
                    }
                    else if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`])
                    {
                        item.metadata[`${Constants.EXTENSIONID}/disabled`] = true;
                        item.metadata[`${Constants.EXTENSIONID}/doorOpen`] = true;
                    }
                }
            });
        }
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-door-lock`,
        icons: [
            {
                icon: "/locked-door.svg",
                label: "Lock Door",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoorLocked`],
                        value: undefined
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoor`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/doorOpen`],
                        value: undefined,
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                    roles: ["GM"]
                },
            },
            {
                icon: "/unlocked-door.svg",
                label: "Unlock Door",
                filter: {
                    every: [{
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: true,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isDoor`],
                        value: true
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/doorOpen`],
                        value: undefined,
                    }],
                    some: [
                        { key: "layer", value: Constants.LINELAYER, coordinator: "||" },
                        { key: "layer", value: "DRAWING" }],
                    roles: ["GM"]
                },
            },
        ],
        async onClick(ctx)
        {
            const lockDoor = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/isDoorLocked`] === undefined);

            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (!lockDoor)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/isDoorLocked`];
                    }
                    else
                    {
                        item.metadata[`${Constants.EXTENSIONID}/isDoorLocked`] = true;
                    }
                }
            });
        },
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-torch`,
        icons: [
            {
                icon: "/light.svg",
                label: "Enable Torchlight",
                filter: {
                    every: [
                        { key: ["metadata", `${Constants.EXTENSIONID}/isTorch`], operator: "==", value: undefined },
                        { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined }],
                    some: [
                        { key: "layer", value: "PROP", coordinator: "||" }, { key: "layer", value: "ATTACHMENT" }]
                },
            },
            {
                icon: "/no-light.svg",
                label: "Disable Torchlight",
                filter: {
                    every: [
                        { key: ["metadata", `${Constants.EXTENSIONID}/isTorch`], operator: "==", value: true },
                        { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined }],
                    some: [
                        { key: "layer", value: "PROP", coordinator: "||" }, { key: "layer", value: "ATTACHMENT" }]
                },
            },
        ],
        async onClick(ctx)
        {
            const enableTorchlight = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/isTorch`] === undefined);

            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (!enableTorchlight)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/isTorch`];
                        delete item.metadata[`${Constants.EXTENSIONID}/hasVision`];
                    }
                    else
                    {
                        item.metadata[`${Constants.EXTENSIONID}/isTorch`] = true;
                        item.metadata[`${Constants.EXTENSIONID}/hasVision`] = true;
                    }
                }
            });
        },
    });

    await OBR.contextMenu.create({
        id: `${Constants.SPECTREID}/context-menu`,
        icons: [
            {
                icon: "/ghost.svg",
                label: "Spectre",
                filter: {
                    every: [{ key: "type", value: "IMAGE" },
                    { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], value: undefined, operator: "==", coordinator: "&&" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], operator: "==", value: undefined }],
                },
            }, {
                icon: "/ghost.svg",
                label: "Un-Spectre",
                filter: {
                    every: [{ key: "type", value: "IMAGE" },
                    { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], value: undefined, operator: "!=", coordinator: "&&" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], operator: "==", value: undefined }],
                },
            }
        ],
        async onClick(context)
        {
            const spectre = context.items.every(
                (item) => item.metadata[`${Constants.SPECTREID}/isSpectre`] === true
            );

            await OBR.scene.items.updateItems(context.items, items =>
            {
                for (const item of items)
                {
                    if (spectre)
                    {
                        delete item.metadata[`${Constants.SPECTREID}/isSpectre`];
                        delete item.metadata[`${Constants.SPECTREID}/spectreViewers`];
                        item.visible = true;
                    }
                    else
                    {
                        item.metadata[`${Constants.SPECTREID}/isSpectre`] = true;
                        item.metadata[`${Constants.SPECTREID}/spectreViewers`] = [BSCACHE.playerId];
                        item.visible = false;
                    }
                }
            });

            if (!spectre)
            {
                for (const ghost of context.items)
                {
                    await SPECTREMACHINE.SetupGhostSelect(ghost as Image);
                }
            }
            else
            {
                for (const ghost of context.items)
                {
                    SPECTREMACHINE.RemoveGhostSelect(ghost.id);
                }
            }
        }
    });

    if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/unitContextMenu`] === true)
    {
        await SetupUnitContextMenu(true);
    }

    if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/wallContextMenu`] === true)
    {
        await SetupWallContextMenu(true);
    }

    if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/autoHide`] === true)
    {
        await SetupAutoHideMenu(true);
    }
}

export async function SetupAutoHideMenu(enable: boolean)
{
    if (enable)
    {
        await OBR.contextMenu.create({
            id: `${Constants.EXTENSIONID}/autohide-toggle`,
            icons: [
                {
                    icon: "/autohide-off.svg",
                    label: "Enable Autohide",
                    filter: {
                        every: [
                            { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], operator: "==", value: undefined, coordinator: "&&" },
                            { key: ["metadata", `${Constants.EXTENSIONID}/isAutoHidden`], operator: "==", value: undefined, coordinator: "&&" },
                            { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined }],
                        some: [
                            { key: "layer", value: "CHARACTER", coordinator: "||" },
                            { key: "layer", value: "PROP", coordinator: "||" },
                            { key: "layer", value: "ATTACHMENT" }],
                    },
                },
                {
                    icon: "/autohide-on.svg",
                    label: "Disable Autohide",
                    filter: {
                        every: [
                            { key: ["metadata", `${Constants.EXTENSIONID}/isAutoHidden`], operator: "==", value: true, coordinator: "&&" }],
                        some: [
                            { key: "layer", value: "CHARACTER", coordinator: "||" },
                            { key: "layer", value: "PROP", coordinator: "||" },
                            { key: "layer", value: "ATTACHMENT" }],
                    },
                },
            ],
            async onClick(ctx)
            {
                const enableAutohide = ctx.items.every(
                    (item) => item.metadata[`${Constants.EXTENSIONID}/isAutoHidden`] === undefined);

                await OBR.scene.items.updateItems(ctx.items, items =>
                {
                    for (const item of items)
                    {
                        if (!enableAutohide)
                        {
                            delete item.metadata[`${Constants.EXTENSIONID}/isAutoHidden`];
                        }
                        else
                        {
                            item.metadata[`${Constants.EXTENSIONID}/isAutoHidden`] = true;
                        }
                    }
                });
            },
        });
    }
    else
    {
        await OBR.contextMenu.remove(`${Constants.EXTENSIONID}/autohide-toggle`);
    }
}

export async function SetupWallContextMenu(enable: boolean)
{
    if (enable)
    {


        await OBR.contextMenu.create({
            id: `${Constants.EXTENSIONID}/switch-advanced-wall`,
            icons: [
                {
                    icon: "/advancedwall.svg",
                    label: "Advanced Settings",
                    filter: {
                        every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true }]
                    },
                }
            ],
            async onClick(_ctx, elementId: string)
            {
                await OBR.popover.open({
                    id: Constants.CONTEXTID,
                    url: `/pages/wallcontextembed.html`,
                    height: 80,
                    width: 200,
                    anchorElementId: elementId
                });
            },
            embed: { url: `/pages/wallcontextembed.html?contextmenu=true`, height: 80 }
        });
    }
    else
    {
        await OBR.contextMenu.remove(`${Constants.EXTENSIONID}/switch-advanced-wall`);
    }
}

export async function SetupUnitContextMenu(enable: boolean)
{
    if (enable)
    {
        await OBR.contextMenu.create({
            id: `${Constants.EXTENSIONID}/context-menu-embed`,
            icons: [
                {
                    icon: "/icon.svg",
                    label: "Vision Settings",
                    filter: {
                        every: [
                            { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], operator: "==", value: true, coordinator: "&&" },
                            { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined }],
                        some: [
                            { key: "layer", value: "CHARACTER", coordinator: "||" },
                            { key: "layer", value: "PROP", coordinator: "||" },
                            { key: "layer", value: "ATTACHMENT" }],
                    },
                },
            ],

            async onClick(_ctx, elementId: string)
            {
                await OBR.popover.open({
                    id: Constants.CONTEXTID,
                    url: `/pages/unitcontextembed.html`,
                    height: 170,
                    width: 200,
                    anchorElementId: elementId
                });
            },
            embed: { url: `/pages/unitcontextembed.html?contextmenu=true`, height: 170 }
        });
    }
    else
    {
        await OBR.contextMenu.remove(`${Constants.EXTENSIONID}/context-menu-embed`);
    }
}

function adjustPoints(points: Vector2[], adjustment: Vector2): Vector2[]
{
    return points.map(point => ({
        x: point.x + adjustment.x,
        y: point.y + adjustment.y
    }));
}