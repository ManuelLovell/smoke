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
                    every: [{ key: "layer", value: "DRAWING" }, { key: ["metadata", `${Constants.EXTENSIONID}/isDoor`], value: undefined }, { key: ["metadata", `${Constants.EXTENSIONID}/doorId`], value: undefined}],
                    roles: ["GM"]
                },
            },
            {
                icon: "/closedoor.svg",
                label: "Disable Door",
                filter: {
                    every: [{ key: "layer", value: "DRAWING" }, { key: ["metadata", `${Constants.EXTENSIONID}/doorId`], value: undefined}],
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

            if (!enableDoor) {
                await removeLocalDoor(ctx.items);
            } else {
                await createLocalDoor(ctx.items);
            }
        },
    });
}

export async function removeLocalDoor(items: Item[]) {
    const doors = await OBR.scene.local.getItems((item) => item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
    const deleteDoors = [];
    for (let door of doors) {
        let deleteDoor = false;
        for (const item of items) {
            if (door.metadata[`${Constants.EXTENSIONID}/doorId`] == item.id) {
                deleteDoor = true;
            }
        }
        if (deleteDoor) {
            deleteDoors.push(door.id);
        }
    }

    await OBR.scene.local.deleteItems(deleteDoors);
}

export async function createLocalDoor(items: Item[]) {
    const doors: Item[] = [];
    const localDoorItems = await OBR.scene.local.getItems((item) => item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
    for (const item of items) {
        // only create door icons for curves and where the icon doesnt exist already:
        if (!isCurve(item) || localDoorItems.some((item_filter) => item_filter.metadata[`${Constants.EXTENSIONID}/doorId`] === item.id)) continue;

        const shapeTransform = MathM.fromItem(item);
        const points: Vector2[] = [];
        for (let i = 0; i < item.points.length; i++) {
            const localTransform = MathM.fromPosition(item.points[i]);
            points.push(MathM.decompose(MathM.multiply(shapeTransform, localTransform)).position);
        }
        doors.push(buildPath().locked(true).commands(getDoorPath(item.metadata[`${Constants.EXTENSIONID}/disabled`] === true)).scale({x: 0.2, y: 0.2}).name("Door").position(Math2.centroid(points)).metadata({[`${Constants.EXTENSIONID}/doorId`]: item.id}).build());
    }
    OBR.scene.local.addItems(doors);
}

export async function toggleDoor(toggleDoorId: string) {
    const localDoor = await OBR.scene.local.getItems((item) => item.id === toggleDoorId && item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);

    if (localDoor.length === 1) {
        const doorPathId = localDoor[0].metadata[`${Constants.EXTENSIONID}/doorId`];
        const door = sceneCache.items.filter((item) => item.id === doorPathId);
        let doorOpen = false;

        // duplicated code from visionTool button
        await OBR.scene.items.updateItems(door, (items) => {
            const item = items[0];
            if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`] && item.metadata[`${Constants.EXTENSIONID}/disabled`])
            {
                delete item.metadata[`${Constants.EXTENSIONID}/disabled`];
                doorOpen = false;
            }
            else if (item.metadata[`${Constants.EXTENSIONID}/isVisionLine`])
            {
                item.metadata[`${Constants.EXTENSIONID}/disabled`] = true;
                doorOpen = true;
            }
        });
        
        // Change the icon
        await OBR.scene.local.updateItems([localDoor[0].id], (doors) => {
            const door = doors[0] as Path;
            if (isPath(door)) {
                door.commands = getDoorPath(doorOpen);
            }
        });

        await OBR.player.deselect([toggleDoorId]);
    }
}

export async function initDoors() {
    const doors = await OBR.scene.items.getItems((item) => item.metadata[`${Constants.EXTENSIONID}/isDoor`] === true);
    createLocalDoor(doors);
}


// Yes yes, i know.. doggo, why did you do this? because otherwise we have to use custom images imported into the scene instead of just plonking a path there.
export function getDoorPath(open: boolean): PathCommand[] {
    if (open) {
        return [
            [0,-65.35400390625,-250],
            [1,-65.35400390625,-228.27999877929688],
            [1,-150.29598999023438,-228.27999877929688],
            [1,-150.29598999023438,205.0780029296875],
            [1,-118.89300537109375,205.0780029296875],
            [1,-118.89300537109375,-196.8769989013672],
            [1,-65.35400390625,-196.8769989013672],
            [1,-65.35400390625,242.5],
            [1,142.79598999023438,205.0780029296875],
            [1,142.79598999023438,143.84298706054688],
            [1,142.79598999023438,-212.5],
            [5],[0,-27.06201171875,13.128997802734375],
            [4,-34.05900573730469,13.128997802734375,-39.73200988769531,5.7480010986328125,-39.73200988769531,-3.35699462890625],
            [4,-39.73200988769531,-12.46099853515625,-34.05900573730469,-19.841995239257812,-27.06201171875,-19.841995239257812],
            [4,-20.065017700195312,-19.841995239257812,-14.392013549804688,-12.46099853515625,-14.392013549804688,-3.35699462890625],
            [4,-14.392013549804688,5.7480010986328125,-20.065017700195312,13.128997802734375,-27.06201171875,13.128997802734375],
            [5]
        ];
    } else {
        return [
            [0,-178.44699096679688,-250],
            [1,-178.44699096679688,228.08499145507812],
            [1,157.114013671875,228.66598510742188],
            [1,157.114013671875,-250],
            [5],
            [0,-146.8909912109375,196.5830078125],
            [1,-146.8909912109375,-218.44200134277344],
            [1,125.55398559570312,-218.44200134277344],
            [1,125.55398559570312,-161.62899780273438],
            [1,114.77301025390625,-161.62899780273438],
            [1,114.77301025390625,-207.91400146484375],
            [1,-136.10699462890625,-207.91400146484375],
            [1,-136.10699462890625,186.55398559570312],
            [1,114.77398681640625,186.55398559570312],
            [1,114.77398681640625,140.26998901367188],
            [1,125.55499267578125,140.26998901367188],
            [1,125.55499267578125,197.05499267578125],
            [5],
            [0,114.77301025390625,-112.54100036621094],
            [1,125.55401611328125,-112.54100036621094],
            [1,125.55401611328125,91.17999267578125],
            [1,114.77301025390625,91.17999267578125],
            [5],
            [0,-84.21299743652344,-10.67999267578125],
            [4,-84.21299743652344,-1.5319976806640625,-91.63099670410156,5.8860015869140625,-100.781005859375,5.8860015869140625],
            [4,-109.93099975585938,5.8860015869140625,-117.3489990234375,-1.5319976806640625,-117.3489990234375,-10.67999267578125],
            [4,-117.3489990234375,-19.829986572265625,-109.93099975585938,-27.24798583984375,-100.781005859375,-27.24798583984375],
            [4,-91.63101196289062,-27.24798583984375,-84.2130126953125,-19.829986572265625,-84.2130126953125,-10.67999267578125],
            [5]
        ];
    }
}
