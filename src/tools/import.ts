import OBR, { Image, buildCurve } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/constants";
import { sceneCache } from '../utilities/globals';

export async function updateMaps(mapAlign: HTMLSelectElement) {
  const maps = await OBR.scene.items.getItems((item) => item.layer === "MAP");
  const existingMaps:Record<string, string> = {};

  for(let i = 0; i < maps.length; i++) {
    let mapOption = mapAlign.querySelector('#map-'+maps[i].id) as HTMLOptionElement;
    if (mapOption === null) {
        mapOption = document.createElement('option');
        mapOption.id = 'map-' + maps[i].id;
        mapOption.value = maps[i].id;
        mapOption.innerText = maps[i].name;
        mapAlign.appendChild(mapOption);
    }
    existingMaps[maps[i].id] = maps[i].name;
  }

  let mapOptions = mapAlign.querySelectorAll('option');
  for(let i = 0; i < mapOptions.length; i++) {
    if (existingMaps[mapOptions[i].value] === undefined) {
        mapAlign.removeChild(mapOptions[i]);
    }
  }
};

export async function importFog(importType: string, importData: any, importDpi: number, importMapId: string, errorElement: HTMLDivElement) 
{
    // import_data is any because the structure depends on what we're importing from

    errorElement.innerText = '';

    if (Number.isNaN(importDpi) || importDpi < 0) {
        errorElement.innerText = 'Invalid DPI';
        return;
    }

    let dpiRatio = sceneCache.gridDpi / importDpi;
    let importMap: Image;
    let offset:number[] = [];
    offset[0] = 0;
    offset[1] = 0;

    // getItems for the uuid of the map, offset the points accordingly (after dpi scaling)
    if (importMapId !== "") {
        let importMaps = await OBR.scene.items.getItems([importMapId]);
        if (importMaps.length > 0) {
            importMap = importMaps[0] as Image;
            if (importDpi === 0) {
                importDpi = importMap.grid.dpi;
            }
            dpiRatio = sceneCache.gridDpi / importDpi;
            offset[0] = importMap.position.x - (importMap.grid.offset.x * dpiRatio);
            offset[1] = importMap.position.y - (importMap.grid.offset.y * dpiRatio);
        } else {
            errorElement.innerText = 'Unable to find map';
            return;
        }
    } else {
        errorElement.innerText = 'No map selected';
        return;
    }

    if (importType === "foundry") {
        importFoundry(importData, dpiRatio, offset, errorElement);
    } else if (importType === "uvtt") {
        importUVTT(importData, dpiRatio, offset, errorElement);
    }
}

function importUVTT(importData: any, dpiRatio: number, offset: number[], errorElement: HTMLDivElement) {

    if (!importData.line_of_sight || importData.line_of_sight.length === 0) {
        errorElement.innerText = 'No walls / los found';
        return;
    }

    const walls = [];

    let total_imported = 0;

    // i dont get it.. uvtt says resolution.pixels_per_grid, but it looks like it's in 72?
    let uvttScale = 72; //importData.resolution.pixels_per_grid;

    // add doors in as walls for now..
    if (importData.portals && importData.portals.length) {
        for (let i = 0; i < importData.portals.length; i++) {
            let door = importData.portals[i].bounds;
            importData.line_of_sight.push(door);
        }
    }

    // TODO: lots of duplicate code here. Can swap out the coord caluations only and end up with the same outcome.
    for (var i = 0; i < importData.line_of_sight.length; i++) {
        let sx = importData.line_of_sight[i][0].x * uvttScale, sy = importData.line_of_sight[i][0].y * uvttScale, ex = importData.line_of_sight[i][1].x * uvttScale, ey = importData.line_of_sight[i][1].y * uvttScale;
        const line = buildCurve()
        .tension(0)
        .points([{x: sx * dpiRatio + offset[0], y: sy * dpiRatio + offset[1]}, {x: ex * dpiRatio + offset[0], y: ey * dpiRatio + offset[1]}])
        .fillColor("#000000")
        .fillOpacity(0)
        .layer("DRAWING")
        .name("Vision Line (Line)")
        .closed(false)
        .build();

        line.visible = false;
        line.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;

        walls.push(line);

        // Batch our add calls otherwise OBR is unhappy.
        // Is there a recommended way to do this?
        if (walls.length > 50) {
            total_imported += walls.length;
            OBR.scene.items.addItems(walls);
            walls.length = 0;
        }
    }

    if (walls.length > 0) {
        total_imported += walls.length;
        OBR.scene.items.addItems(walls);
    }

    errorElement.innerText = 'Finished importing '+ total_imported + ' walls!';

}

function importFoundry(importData: any, dpiRatio: number, offset: number[], errorElement: HTMLDivElement) {

    if (!importData.walls || importData.walls.length === 0) {
        errorElement.innerText = 'No walls found';
        return;
    }

    //let left = map.position.x - (dpiRatio * map.grid.offset.x), top = map.position.y - (dpiRatio * map.grid.offset.y);

    const walls = [];

    let total_imported = 0;

    for (var i = 0; i < importData.walls.length; i++) {
        const line = buildCurve()
        .tension(0)
        .points([{x: importData.walls[i].c[0]*dpiRatio + offset[0], y: importData.walls[i].c[1]*dpiRatio + offset[1]}, {x:importData.walls[i].c[2]*dpiRatio + offset[0],y:importData.walls[i].c[3]*dpiRatio + offset[1]}])
        .fillColor("#000000")
        .fillOpacity(0)
        .layer("DRAWING")
        .name("Vision Line (Line)")
        .closed(false)
        .build();

        line.visible = false;
        line.metadata[`${Constants.EXTENSIONID}/isVisionLine`] = true;

        walls.push(line);

        // Batch our add calls otherwise OBR is unhappy.
        // Is there a recommended way to do this?
        if (walls.length > 50) {
            total_imported += walls.length;
            OBR.scene.items.addItems(walls);
            walls.length = 0;
        }
    }

    if (walls.length > 0) {
        total_imported += walls.length;
        OBR.scene.items.addItems(walls);
    }

    errorElement.innerText = 'Finished importing '+ total_imported + ' walls!';
};