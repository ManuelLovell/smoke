import OBR, { buildCurve, Curve, Line, Image, Shape, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { BSCACHE } from "./utilities/bsSceneCache";
import { SPECTREMACHINE } from "./SpectreTwo";
import { GetToolWidth } from "./tools/visionToolUtilities";

export async function SetupContextMenus(): Promise<void>
{
    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/convert-curve`,
        icons: [
            {
                icon: "/opendoor.svg",
                label: "Convert to Obstruction",
                filter: {
                    every: [{ key: "layer", value: "DRAWING" },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/elevation`],
                        value: undefined,
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`],
                        value: undefined,
                    }],
                    roles: ["GM"]
                },
            }
        ],
        async onClick(ctx)
        {
            const DEFAULTCOLOR = "#000000";
            const DEFAULTWIDTH = 8;
            const DEFAULTSTROKE: number[] = [];
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
                        const line = buildCurve()
                            .tension(0)
                            .points(adjustPoints(baseCurve.points, baseCurve.position))
                            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
                            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
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
                        if (baseCurve.style.closed)
                        {
                            line.points.push(baseCurve.points[0]);
                        }
                        linesToMake.push(line);
                        linesToDelete.push(baseCurve.id);
                    }
                }
                else if (item.type === "LINE")
                {
                    const baseLine = item as Line;
                    const line = buildCurve()
                        .tension(0)
                        .points(adjustPoints([baseLine.startPosition, baseLine.endPosition], baseLine.position))
                        .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
                        .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
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
                        const line = buildCurve()
                            .tension(0)
                            .points(adjustPoints(points, { x: 1, y: 1 }))
                            .position(baseShape.position)
                            .rotation(baseShape.rotation)
                            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
                            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
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

                        line.points.push(points[0]);

                        linesToMake.push(line);
                        linesToDelete.push(baseShape.id);
                    }
                }
                if (linesToMake.length > 0)
                {
                    await OBR.scene.items.addItems(linesToMake);
                    await OBR.scene.items.deleteItems(linesToDelete);
                }
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
                            item.metadata[`${Constants.EXTENSIONID}/visionRange`] = Constants.ATTENUATIONDEFAULT; // Vision Attenuation - Outer Circle
                            item.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = Constants.SOURCEDEFAULT; // Inner Circle
                            item.metadata[`${Constants.EXTENSIONID}/visionFallOff`] = Constants.FALLOFFDEFAULT; // Fall off at end of vision
                            item.metadata[`${Constants.EXTENSIONID}/visionInAngle`] = Constants.INANGLEDEFAULT; // Set an inner cone for vision
                            item.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = Constants.OUTANGLEDEFAULT; // Set an outer cone for vision
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
                    { key: ["metadata", `${Constants.EXTENSIONID}/doubleSided`], value: undefined }]
                },
            },
            {
                icon: "/left-sided.svg",
                label: "Swap to One-sided",
                filter: {
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
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
                    { key: ["metadata", `${Constants.EXTENSIONID}/blocking`], value: undefined }]
                },
            },
            {
                icon: "/unblock.svg",
                label: "Swap to Passable",
                filter: {
                    every: [{ key: ["metadata", `${Constants.EXTENSIONID}/isVisionLine`], value: true, coordinator: "&&" },
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
        id: `${Constants.EXTENSIONID}/toggle-fog-background`,
        icons: [
            {
                icon: "/fog-background.svg",
                label: "Convert To Fog Background",
                filter: {
                    every: [{ key: "layer", value: "MAP" },
                    { key: ["metadata", `${Constants.EXTENSIONID}/isFogMap`], value: undefined }]
                },
            },
            {
                icon: "/fog-background.svg",
                label: "Convert To Normal Background",
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
                        item.zIndex = -1;
                        delete item.metadata[`${Constants.EXTENSIONID}/isFogMap`];
                    }
                    else
                    {
                        item.layer = "FOG";
                        item.zIndex = -1;
                        item.metadata[`${Constants.EXTENSIONID}/isFogMap`] = true;
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
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/doorId`],
                        value: undefined
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/grid`],
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
                        key: ["metadata", `${Constants.EXTENSIONID}/doorId`],
                        value: undefined
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/grid`],
                        value: undefined
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
                        { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined },
                        { key: "layer", value: "PROP" }],
                },
            },
            {
                icon: "/no-light.svg",
                label: "Disable Torchlight",
                filter: {
                    every: [
                        { key: ["metadata", `${Constants.EXTENSIONID}/isTorch`], operator: "==", value: true },
                        { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], operator: "==", value: undefined },
                        { key: "layer", value: "PROP" }],
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
        }
    });
}

function adjustPoints(points: Vector2[], adjustment: Vector2): Vector2[]
{
    return points.map(point => ({
        x: point.x + adjustment.x,
        y: point.y + adjustment.y
    }));
}
// export async function SetupAutohideMenus(show: boolean): Promise<void>
// {
//     if (show)
//     {
//         await OBR.contextMenu.create({
//             id: `${Constants.EXTENSIONID}/toggle-autohide-menu`,
//             icons: [
//                 {
//                     icon: "/autohide-off.svg",
//                     label: "Enable Autohide",
//                     filter: {
//                         every: [{ key: "layer", value: "CHARACTER" }, { key: ["metadata", `${Constants.EXTENSIONID}/hasAutohide`], value: undefined, coordinator: "&&" },
//                         { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], value: undefined, operator: "==" }],
//                         roles: ["GM"]
//                     },
//                 },
//                 {
//                     icon: "/autohide-on.svg",
//                     label: "Disable Autohide",
//                     filter: {
//                         every: [{ key: "layer", value: "CHARACTER", coordinator: "&&" },
//                         { key: ["metadata", `${Constants.SPECTREID}/isSpectre`], value: undefined, operator: "==" }],
//                         roles: ["GM"]
//                     },
//                 },
//             ],
//             async onClick(ctx)
//             {
//                 const enableFog = ctx.items.every(
//                     (item) => item.metadata[`${Constants.EXTENSIONID}/hasAutohide`] === undefined);

//                 await OBR.scene.items.updateItems(ctx.items, items =>
//                 {
//                     for (const item of items)
//                     {
//                         if (!enableFog)
//                         {
//                             delete item.metadata[`${Constants.EXTENSIONID}/hasAutohide`];
//                         }
//                         else
//                         {
//                             item.metadata[`${Constants.EXTENSIONID}/hasAutohide`] = true;
//                         }
//                     }
//                 });
//             },
//         });
//     } else
//     {
//         await OBR.contextMenu.remove(`${Constants.EXTENSIONID}/toggle-autohide-menu`);
//     }
// }