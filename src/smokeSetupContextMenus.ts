import OBR, { Item } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/constants";
import { createLocalDoor, removeLocalDoor } from "./tools/doorTool";

export async function SetupContextMenus(): Promise<void>
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
                    every: [
                        { key: ["metadata", `${Constants.EXTENSIONID}/hasVision`], operator: "==", value: undefined, coordinator: "&&" },
                        { key: ["metadata", `${Constants.SPECTREID}/spectred`], operator: "==", value: undefined }],
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
                        { key: ["metadata", `${Constants.SPECTREID}/spectred`], operator: "==", value: undefined }],
                    some: [
                        { key: "layer", value: "CHARACTER", coordinator: "||" },
                        { key: "layer", value: "ATTACHMENT" }],
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

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/bounding-grid`,
        icons: [
            {
                icon: "/icon.svg",
                label: "Smoke Bounding Grid",
                filter: {
                    every: [
                        {
                            key: ["metadata", `${Constants.EXTENSIONID}/grid`],
                            value: true
                        }],
                },
            },
        ],
        async onClick(_ctx)
        {
            await OBR.notification.show("This is the Smoke&Spectre Bounding Grid. It contains the area your fog can be drawn in. To remove this and have fog contained dynamically by the size of your map(s), turn on AutoDetect Maps in Settings.", "INFO");
        },
    });

    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-door`,
        icons: [
            {
                icon: "/opendoor.svg",
                label: "Enable Door",
                filter: {
                    every: [{ key: "layer", value: "DRAWING" },
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
                    roles: ["GM"]
                },
            },
            {
                icon: "/closedoor.svg",
                label: "Disable Door",
                filter: {
                    every: [{ key: "layer", value: "DRAWING" },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/doorId`],
                        value: undefined
                    },
                    {
                        key: ["metadata", `${Constants.EXTENSIONID}/grid`],
                        value: undefined
                    }],
                    roles: ["GM"]
                },
            },
        ],
        async onClick(ctx)
        {
            const enableDoor = ctx.items.every(
                (item) => item.metadata[`${Constants.EXTENSIONID}/isDoor`] === undefined);

            await OBR.scene.items.updateItems(ctx.items, items =>
            {
                for (const item of items)
                {
                    if (!enableDoor)
                    {
                        delete item.metadata[`${Constants.EXTENSIONID}/isDoor`];
                    }
                    else
                    {
                        item.metadata[`${Constants.EXTENSIONID}/isDoor`] = true;
                    }
                }
            });

            if (!enableDoor)
            {
                await removeLocalDoor(ctx.items);
            } else
            {
                await createLocalDoor(ctx.items);
            }
        },
    });
}

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