import OBR, { Image, buildCurve, buildImageUpload, buildSceneUpload, Curve, buildImage, Vector2 } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import * as Utilities from "./../utilities/bsUtilities";
import { BSCACHE } from "../utilities/bsSceneCache";
import { GetToolWidth } from "./visionToolUtilities";
import { ImportLights } from "./importUVTT_Lights";
import { ImportWalls } from "./importUVTT_Walls";
import { ConvertDoorItem } from "./importUVTT_Doors";

export const CHUNK_SIZE = 25;

/// Update the Map Selection input
export function UpdateMaps()
{
    const mapAlign = document.getElementById("map_align") as HTMLSelectElement;
    if (!mapAlign) return;

    const maps = BSCACHE.sceneItems.filter((item) => item.layer === "MAP");
    const existingMaps: Record<string, string> = {};

    for (let i = 0; i < maps.length; i++)
    {
        const cMap = maps[i];
        let mapOption = mapAlign.querySelector('#map-' + cMap.id) as HTMLOptionElement;
        if (mapOption === null)
        {
            mapOption = document.createElement('option');
            mapOption.id = 'map-' + cMap.id;
            mapOption.value = cMap.id;
            mapOption.innerText = cMap.name;
            mapAlign.appendChild(mapOption);
        }
        else if (mapOption.innerText !== cMap.name)
        {
            mapOption.innerText = cMap.name;
        }
        existingMaps[cMap.id] = cMap.name;
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

/// Import Generic Fog
export async function FogImportEntry(importType: string, importData: any, importDpi: number, importMapId: string) 
{
    if (Number.isNaN(importDpi) || importDpi < 0)
    {
        return await OBR.notification.show("Invalid DPI", "ERROR");
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
            return await OBR.notification.show("Unable to find map", "ERROR");
        }
    } else
    {
        return await OBR.notification.show("No map selected", "ERROR");
    }

    if (importType === "foundry")
    {
        await ImportFoundry(importData, dpiRatio, offset);
    }
    else if (importType === "uvtt")
    {
        await ImportUVTT(importData, dpiRatio, offset);
    }
}

function ConvertLineOfSightItem(uvttObjects: Array<Array<{ x: number; y: number }>>): Curve[]
{
    const newItems: Curve[] = [];
    for (const uvttItem of uvttObjects)
    {
    const newItemPaths: Vector2[] = [];
        for (const point of uvttItem)
        {
            newItemPaths.push({ x: point.x * BSCACHE.gridDpi, y: point.y * BSCACHE.gridDpi });
        }
        const line = buildCurve()
            .tension(0)
            .points(newItemPaths)
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

        newItems.push(line);
    }
    return newItems;
}

export async function ImportScene(importData: UVTT, _errorElement: HTMLDivElement)
{
    await ShowProgressBar();
    // Create Walls
    let importedObjects: any[] = [];
    if (importData.objects_line_of_sight?.length > 0)
    {
        importedObjects = importedObjects.concat(ConvertLineOfSightItem(importData.objects_line_of_sight));
    }
    await ProgressTheBar(10);
    if (importData.line_of_sight?.length > 0)
    {
        importedObjects = importedObjects.concat(ConvertLineOfSightItem(importData.line_of_sight));
    }
    // Create Doors
    await ProgressTheBar(20);
    if (importData.portals?.length > 0)
    {
        importedObjects = importedObjects.concat(ConvertDoorItem(importData.portals, BSCACHE.gridDpi, 1, [0, 0]));
    }
    // Create Lights
    await ProgressTheBar(30);
    if (importData.lights?.length > 0)
    {
        importedObjects = importedObjects.concat(ImportLights(importData.lights, BSCACHE.gridDpi, 1, [0, 0]));
    }

    try 
    {
        // Create Map
        await ProgressTheBar(40);
        const imageBinary = atob(importData.image);
        const uint8Array = new Uint8Array(imageBinary.length);
        const calculatedWidth = importData.resolution.map_size.x * importData.resolution.pixels_per_grid;
        const calculatedHeight = importData.resolution.map_size.y * importData.resolution.pixels_per_grid;

        for (let i = 0; i < imageBinary.length; i++)
        {
            uint8Array[i] = imageBinary.charCodeAt(i);
        }
        const preBlob = new Blob([uint8Array], { type: 'image/png' });

        const blob = await Utilities.ConvertToWebP(preBlob, 0.8, calculatedWidth, calculatedHeight);
        if (!blob) throw new Error("Unable to convert to WebP");
        await ProgressTheBar(60);

        const image = buildImageUpload(blob)
            .dpi(importData.resolution.pixels_per_grid)
            .scale({ x: 1, y: 1 })
            .build();

        const scene = buildSceneUpload()
            .baseMap(image)
            .fogFilled(true)
            .name("New UVTT Scene")
            .items(importedObjects)
            .build();
        await ProgressTheBar(80);
        await OBR.assets.uploadScenes([scene], true);
        await ProgressTheBar(100, "Scene upload complete!");
    }
    catch (error: any)
    {
        await OBR.notification.show("There was an error: " + error.message, "ERROR");
    }
}

async function ImportUVTT(importData: any, dpiRatio: number, offset: number[]): Promise<void>
{
    let importedObjects: any[] = [];
    const importDpi = importData.resolution.pixels_per_grid;
    const doors: UVTTPortal[] = [];

    if (importData.resolution.map_origin !== undefined)
    {
        offset[0] -= importData.resolution.map_origin.x * importDpi;
        offset[1] -= importData.resolution.map_origin.y * importDpi;
    }

    // add doors as regular walls for now..
    if (importData.portals?.length > 0)
    {
        for (let i = 0; i < importData.portals.length; i++)
        {
            const line: Vector2[] = importData.portals[i].bounds;

            for (let j = 0; j < line.length - 1; j++)
            {
                doors.push(
                    {
                        position: { x: 0, y: 0 },
                        bounds: [{ x: line[j].x, y: line[j].y },
                        { x: line[j + 1].x, y: line[j + 1].y }],
                        closed: true,
                        freestanding: false,
                        rotation: 0
                    }
                );
            }

        }
    }

    const walls: Vector2[][] = importData.line_of_sight.concat(importData.objects_line_of_sight);
    // Create Walls
    if (walls.length > 0)
    {
        importedObjects = importedObjects.concat(ImportWalls(walls, importDpi, dpiRatio, offset));
    }
    // Create Doors
    if (doors.length > 0)
    {
        importedObjects = importedObjects.concat(ConvertDoorItem(doors, importDpi, dpiRatio, offset));
    }
    // Create Lights
    if (importData.lights?.length > 0)
    {
        importedObjects = importedObjects.concat(ImportLights(importData.lights, importDpi, dpiRatio, offset));
    }

    await BatchUpload(importedObjects);
}

async function ImportFoundry(importData: FoundryUVTT, dpiRatio: number, offset: number[]): Promise<void>
{
    let importedObjects: any[] = [];
    const walls: Vector2[][] = [];
    const doors: UVTTPortal[] = [];

    for (var i = 0; i < importData.walls.length; i++)
    {
        const line = importData.walls[i];
        if (line.door === 0) // Not a door
        {
            walls.push([{
                x: importData.walls[i].c[0], y: importData.walls[i].c[1]
            },
            {
                x: importData.walls[i].c[2], y: importData.walls[i].c[3]
            }]);
        }
        else
        {
            doors.push(
                {
                    position: { x: 0, y: 0 },
                    bounds: [{ x: line.c[0], y: line.c[1] },
                    { x: line.c[2], y: line.c[3] }],
                    closed: true,
                    freestanding: false,
                    rotation: 0
                }
            );
        }
    }

    // Create Walls
    if (walls.length > 0)
    {
        importedObjects = importedObjects.concat(ImportWalls(walls, 1, dpiRatio, offset));
    }
    // Create Doors
    if (doors.length > 0)
    {
        importedObjects = importedObjects.concat(ConvertDoorItem(doors, 1, dpiRatio, offset));
    }
    // Create Lights
    if (importData.lights?.length > 0)
    {
        importedObjects = importedObjects.concat(ImportLights(importData.lights, 1, dpiRatio, offset));
    }

    await BatchUpload(importedObjects);
};

async function BatchUpload(dataObjects: any[]): Promise<string>
{
    //Create Tooltip
    await OBR.modal.open({
        id: Constants.PROGRESSBAR,
        url: '/pages/progressbar.html',
        height: 400,
        width: 500,
        disablePointerEvents: false,
        hidePaper: true,

    });
    await Utilities.Sleep(Constants.DELAY);

    //Batch our add calls otherwise OBR is unhappy.
    for (let i = 0; i < dataObjects.length; i += CHUNK_SIZE)
    {
        const chunkArray = dataObjects.slice(i, i + CHUNK_SIZE);

        await OBR.scene.items.addItems(chunkArray);
        await Utilities.Sleep(Constants.DELAY);

        const processed = Math.min(i + chunkArray.length, dataObjects.length);
        const progressData: ProgressData = { current: processed, total: dataObjects.length, complete: false };

        await OBR.broadcast.sendMessage(Constants.PROGRESSBAR, progressData, { destination: "LOCAL" });
    }

    const completeData: ProgressData = { current: 100, total: 100, complete: true };
    await OBR.broadcast.sendMessage(Constants.PROGRESSBAR, completeData, { destination: "LOCAL" });
    return await OBR.notification.show(`Finished importing '${dataObjects.length}' objects.`, "SUCCESS");
}

async function ShowProgressBar(): Promise<void>
{
    //Create Tooltip
    await OBR.modal.open({
        id: Constants.PROGRESSBAR,
        url: '/pages/progressbar.html',
        height: 400,
        width: 500,
        disablePointerEvents: false,
        hidePaper: true,

    });
    await Utilities.Sleep(Constants.DELAY);
}

async function ProgressTheBar(int: number, message = "Done!"): Promise<void>
{
    const progress: ProgressData = { current: int, total: 100, complete: false };
    if (int === 100)
    {
        progress.complete = true;
        await OBR.notification.show(`${message}`, "SUCCESS");
    }
    await OBR.broadcast.sendMessage(Constants.PROGRESSBAR, progress, { destination: "LOCAL" });
}