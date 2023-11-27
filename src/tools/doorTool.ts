import OBR, { buildPath, Item, Curve, isCurve, ItemFilter, Vector2, Math2, MathM, PathCommand, Path, isPath } from "@owlbear-rodeo/sdk";
import { sceneCache } from "../utilities/globals";
import { Constants } from "../utilities/constants";

export async function setupDoorMenus(): Promise<void>
{
    await OBR.contextMenu.create({
        id: `${Constants.EXTENSIONID}/toggle-door`,
        icons: [
            {
                icon: "/opendoor.svg",
                label: "Enable Door",
                filter: {
                    every: [{ key: "layer", value: "DRAWING" }, { key: ["metadata", `${Constants.EXTENSIONID}/isDoor`], value: undefined }, { key: ["metadata", `${Constants.EXTENSIONID}/doorId`], value: undefined }],
                    roles: ["GM"]
                },
            },
            {
                icon: "/closedoor.svg",
                label: "Disable Door",
                filter: {
                    every: [{ key: "layer", value: "DRAWING" }, { key: ["metadata", `${Constants.EXTENSIONID}/doorId`], value: undefined }],
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

export async function removeLocalDoor(items: Item[])
{
    const doors = await OBR.scene.local.getItems((item) => item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
    const deleteDoors = [];
    for (let door of doors)
    {
        let deleteDoor = false;
        for (const item of items)
        {
            if (door.metadata[`${Constants.EXTENSIONID}/doorId`] == item.id)
            {
                deleteDoor = true;
            }
        }
        if (deleteDoor)
        {
            deleteDoors.push(door.id);
        }
    }

    await OBR.scene.local.deleteItems(deleteDoors);
}

export async function createLocalDoor(items: Item[])
{
    const doors: Item[] = [];
    const localDoorItems = await OBR.scene.local.getItems((item) => item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
    for (const item of items)
    {
        // only create door icons for curves and where the icon doesnt exist already:
        if (!isCurve(item) || localDoorItems.some((item_filter) => item_filter.metadata[`${Constants.EXTENSIONID}/doorId`] === item.id)) continue;

        const shapeTransform = MathM.fromItem(item);
        const points: Vector2[] = [];
        for (let i = 0; i < item.points.length; i++)
        {
            const localTransform = MathM.fromPosition(item.points[i]);
            points.push(MathM.decompose(MathM.multiply(shapeTransform, localTransform)).position);
        }
        doors.push(buildPath().locked(true).commands(getDoorPath(item.metadata[`${Constants.EXTENSIONID}/disabled`] === true)).scale({ x: 0.2, y: 0.2 }).name("Door").position(Math2.centroid(points)).metadata({ [`${Constants.EXTENSIONID}/doorId`]: item.id }).build());
    }
    if (doors.length > 0) OBR.scene.local.addItems(doors);
}

/* Note: Removed door image logic to main vision loop code so it can be used for others */
export async function toggleDoor(toggleDoorId: string)
{
    const localDoor = await OBR.scene.local.getItems((item) => item.id === toggleDoorId && item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);

    if (localDoor.length === 1)
    {
        const doorPathId = localDoor[0].metadata[`${Constants.EXTENSIONID}/doorId`];
        const door = sceneCache.items.filter((item) => item.id === doorPathId);

        // duplicated code from visionTool button
        await OBR.scene.items.updateItems(door, (items) =>
        {
            const item = items[0];
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
        });

        await OBR.player.deselect([toggleDoorId]);
    }
}

export async function initDoors()
{
    const doors = await OBR.scene.items.getItems((item) => item.metadata[`${Constants.EXTENSIONID}/isDoor`] === true);
    createLocalDoor(doors);
}


// Yes yes, i know.. doggo, why did you do this? because otherwise we have to use custom images imported into the scene instead of just plonking a path there.
// You're a monster. How could you.
export function getDoorPath(open: boolean): PathCommand[]
{
    if (open)
    {
        return Constants.DOOROPEN;
    }
    else
    {
        return Constants.DOORCLOSED;
    }
}
