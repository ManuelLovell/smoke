import OBR, { Image, buildCurve, Vector2, buildImageUpload, buildSceneUpload, Curve, buildImage } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { createLocalDoor } from "./doorTool";
import simplify from "simplify-js";
import { BSCACHE } from "../utilities/bsSceneCache";

type ImportVector2 = Vector2 & { door: boolean };

export function UpdateMaps(mapAlign: HTMLSelectElement)
{
    const maps = BSCACHE.sceneItems.filter((item) => item.layer === "MAP");
    const existingMaps: Record<string, string> = {};

    for (let i = 0; i < maps.length; i++)
    {
        let mapOption = mapAlign.querySelector('#map-' + maps[i].id) as HTMLOptionElement;
        if (mapOption === null)
        {
            mapOption = document.createElement('option');
            mapOption.id = 'map-' + maps[i].id;
            mapOption.value = maps[i].id;
            mapOption.innerText = maps[i].name;
            mapAlign.appendChild(mapOption);
        }
        existingMaps[maps[i].id] = maps[i].name;
    }

    let mapOptions = mapAlign.querySelectorAll('option');
    for (let i = 0; i < mapOptions.length; i++)
    {
        if (existingMaps[mapOptions[i].value] === undefined)
        {
            mapAlign.removeChild(mapOptions[i]);
        }
    }
};

export async function importFog(importType: string, importData: any, importDpi: number, importMapId: string, errorElement: HTMLDivElement) 
{
    // import_data is any because the structure depends on what we're importing from

    errorElement.innerText = '';

    if (Number.isNaN(importDpi) || importDpi < 0)
    {
        errorElement.innerText = 'Invalid DPI';
        return;
    }

    let dpiRatio = BSCACHE.gridDpi / importDpi;
    let importMap: Image;
    let offset: number[] = [];
    offset[0] = 0;
    offset[1] = 0;

    // getItems for the uuid of the map, offset the points accordingly (after dpi scaling)
    if (importMapId !== "")
    {
        let importMaps = await OBR.scene.items.getItems([importMapId]);
        if (importMaps.length > 0)
        {
            importMap = importMaps[0] as Image;
            if (importDpi === 0)
            {
                importDpi = importMap.grid.dpi;
            }
            dpiRatio = BSCACHE.gridDpi / importDpi;
            offset[0] = importMap.position.x - (importMap.grid.offset.x * dpiRatio);
            offset[1] = importMap.position.y - (importMap.grid.offset.y * dpiRatio);
        } else
        {
            errorElement.innerText = 'Unable to find map';
            return;
        }
    } else
    {
        errorElement.innerText = 'No map selected';
        return;
    }

    if (importType === "foundry")
    {
        importFoundry(importData, dpiRatio, offset, errorElement);
    } else if (importType === "uvtt")
    {
        importUVTT(importData, dpiRatio, offset, errorElement);
    }
}

function ConvertLineOfSightItem(uvttObjects: Array<Array<{ x: number; y: number }>>): Curve[]
{
    const DEFAULTCOLOR = "#000000";
    const DEFAULTWIDTH = 8;
    const DEFAULTSTROKE: number[] = [];

    const newItems: Curve[] = [];
    for (const uvttItem of uvttObjects)
    {
        const newItemPaths = [];
        for (const point of uvttItem)
        {
            newItemPaths.push({ x: point.x * BSCACHE.gridDpi, y: point.y * BSCACHE.gridDpi });
        }
        const line = buildCurve()
            .tension(0)
            .points(newItemPaths)
            .strokeColor(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolColor`] as string ?? DEFAULTCOLOR)
            .strokeDash(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolStyle`] as [] ?? DEFAULTSTROKE)
            .strokeWidth(BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toolWidth`] as number ?? DEFAULTWIDTH)
            .fillOpacity(0)
            .fillColor("#000000")
            .layer("DRAWING")
            .name("Vision Line (Line)")
            .closed(false)
            .locked(true)
            .visible(false)
            .metadata({ [`${Constants.EXTENSIONID}/isVisionLine`]: true })
            .build();

        newItems.push(line);
    }
    return newItems;
}

export async function ImportScene(importData: UVTT, errorElement: HTMLDivElement)
{
    // Create Walls
    let importedObjects: any[] = [];
    if (importData.objects_line_of_sight.length > 0)
    {
        importedObjects = importedObjects.concat(ConvertLineOfSightItem(importData.objects_line_of_sight));
    }
    if (importData.line_of_sight.length > 0)
    {
        importedObjects = importedObjects.concat(ConvertLineOfSightItem(importData.line_of_sight));
    }

    // Create Torches
    if (importData.lights.length > 0)
    {
        const newItems = [];
        for (const light of importData.lights)
        {
            // Dropping as bite-size transparent PNGs because the light-sources
            // are images baked into the map itself
            const torch = buildImage(
                {
                    height: 150,
                    width: 150,
                    url: "https://battle-system.com/blank.png",
                    mime: "image/png",
                },
                { dpi: 300, offset: { x: 150, y: 150 } }
            )
                .position({ x: light.position.x * BSCACHE.gridDpi, y: light.position.y * BSCACHE.gridDpi })
                .layer("CHARACTER")
                .metadata({
                    [`${Constants.EXTENSIONID}/hasVision`]: true,
                    [`${Constants.EXTENSIONID}/visionRange`]: light.range.toString(),
                    [`${Constants.EXTENSIONID}/visionTorch`]: true,
                    [`${Constants.EXTENSIONID}/hiddenToken`]: true
                })
                .name("Imported Light Source")
                .build();
            newItems.push(torch);
        }
        importedObjects = importedObjects.concat(newItems);
    }

    // Create Map
    const imageBinary = atob(importData.image);
    const uint8Array = new Uint8Array(imageBinary.length);
    for (let i = 0; i < imageBinary.length; i++)
    {
        uint8Array[i] = imageBinary.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: 'image/png' });

    const image = buildImageUpload(blob).grid({ dpi: importData.resolution.pixels_per_grid, offset: { x: 0, y: 0 } }).build();
    const scene = buildSceneUpload()
        .baseMap(image)
        .name("New UVTT Scene")
        .items(importedObjects)
        .build();
    await OBR.assets.uploadScenes([scene], true);
    await OBR.notification.show("Toggle Smoke Off then On when opening the new Scene", "DEFAULT");
}

async function importWalls(walls: ImportVector2[][], importDpi: number, dpiRatio: number, offset: number[], errorElement: HTMLDivElement) 
{
    let totalImported = 0, totalPoints = 0;
    let currentPoints = 0;

    const lines = [];

    for (let i = 0; i < walls.length; i++)
    {
        let points: Vector2[] = [];
        let door = false;

        for (let j = 0; j < walls[i].length - 1; j++)
        {
            let sx = walls[i][j].x * importDpi, sy = walls[i][j].y * importDpi, ex = walls[i][j + 1].x * importDpi, ey = walls[i][j + 1].y * importDpi;
            points.push({ x: sx * dpiRatio + offset[0], y: sy * dpiRatio + offset[1] });
            points.push({ x: ex * dpiRatio + offset[0], y: ey * dpiRatio + offset[1] });
            totalPoints++;

            // if any part is a door, it's a door:
            if (!door && walls[i][j].door)
            {
                door = true;
            }
        }

        // Chonk
        if (points.length > 128)
        {
            let x = points.length;
            // tolerance should be related to the image dpi
            const factor = 8;//importDpi / 16;
            points = simplify(points, factor, false);
        }

        for (let chunk = 0; chunk < points.length; chunk += 256)
        {
            const chunkPoints = points.slice(chunk > 0 ? chunk - 1 : 0, chunk + 256);
            const line = buildCurve()
                .tension(0)
                .points(chunkPoints)
                .fillColor("#000000")
                .fillOpacity(0)
                .layer("DRAWING")
                .name("Vision Line (Import)")
                .closed(false)
                .locked(true)
                .build();

            line.visible = false;
            line.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;
            if (door)
            {
                line.metadata[`${Constants.EXTENSIONID}/isDoor`] = true;
            }

            lines.push(line);
            currentPoints += chunkPoints.length;

            // Batch our add calls otherwise OBR is unhappy.
            // Is there a recommended way to do this?
            if (currentPoints > 512 || lines.length > 64)
            {
                totalImported += lines.length;
                await OBR.scene.items.addItems(lines);
                const doors = lines.filter((item) => item.metadata[`${Constants.EXTENSIONID}/isDoor`] === true);
                await createLocalDoor(doors);

                lines.length = 0;
                currentPoints = 0;
            }
        }
    }

    if (lines.length > 0)
    {
        totalImported += lines.length;
        await OBR.scene.items.addItems(lines);
        const doors = lines.filter((item) => item.metadata[`${Constants.EXTENSIONID}/isDoor`] === true);
        await createLocalDoor(doors);
    }

    errorElement.innerText = 'Finished importing ' + totalImported + ' walls, ' + totalPoints + " points.";
}

function importUVTT(importData: any, dpiRatio: number, offset: number[], errorElement: HTMLDivElement)
{
    if (importData.resolution.map_origin !== undefined)
    {
        offset[0] -= importData.resolution.map_origin.x * importData.resolution.pixels_per_grid;
        offset[1] -= importData.resolution.map_origin.y * importData.resolution.pixels_per_grid;
    }

    // add doors as regular walls for now..
    if (importData.portals && importData.portals.length)
    {
        for (let i = 0; i < importData.portals.length; i++)
        {
            let door = importData.portals[i].bounds;
            door[0].door = true;
            door[1].door = true;
            importData.line_of_sight.push(door);
        }
    }
    const wallCluster = importData.line_of_sight.concat(importData.objects_line_of_sight);
    importWalls(wallCluster, importData.resolution.pixels_per_grid, dpiRatio, offset, errorElement);
}

function importFoundry(importData: any, dpiRatio: number, offset: number[], errorElement: HTMLDivElement)
{

    if (!importData.walls || importData.walls.length === 0)
    {
        errorElement.innerText = 'No walls found';
        return;
    }

    const walls: ImportVector2[][] = [];

    for (var i = 0; i < importData.walls.length; i++)
    {
        walls.push([{ x: importData.walls[i].c[0], y: importData.walls[i].c[1], door: importData.walls[i].door ? true : false }, { x: importData.walls[i].c[2], y: importData.walls[i].c[3], door: importData.walls[i].door ? true : false }])
    }

    importWalls(walls, 1, dpiRatio, offset, errorElement);
};