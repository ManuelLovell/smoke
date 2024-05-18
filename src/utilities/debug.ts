import OBR, { buildPath } from "@owlbear-rodeo/sdk";
import { Constants } from "./bsConstants";
import { BSCACHE } from "./bsSceneCache";

export class Timer
{
    startTime: number;
    accumulatedTime: number;

    constructor()
    {
        this.startTime = -1;
        this.accumulatedTime = -1;
    }

    start()
    {
        this.startTime = performance.now();
        this.accumulatedTime = 0;
    }

    resume()
    {
        this.startTime = performance.now();
    }

    pause()
    {
        this.accumulatedTime += performance.now() - this.startTime;
        this.startTime = -1;
        return this.accumulatedTime;
    }

    stop()
    {
        if (this.startTime != -1)
        {
            const result = performance.now() - this.startTime + this.accumulatedTime;
            this.accumulatedTime = 0;
            return result;
        }
        else
        {
            const result = this.accumulatedTime;
            this.accumulatedTime = 0;
            return result;
        }
    }
}

class DebugUtility
{
    activated: boolean;

    constructor(enabled: boolean)
    {
        this.activated = enabled;
    }

    public async BlueTokenBoundingPath(tempPath: any)
    {
        //debug - blue token bounding path
        if (this.activated)
        {
            const debugPath = buildPath().strokeColor('#0000ff').locked(true).fillOpacity(1).commands(tempPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
            await OBR.scene.local.addItems([debugPath]);
        }
    }

    public async RedIntersectionPath(intersectPath: any)
    {
        // debug - red intersection path
        if (this.activated)
        {
            const debugPath = buildPath().fillRule("evenodd").locked(true).strokeColor('#ff0000').fillOpacity(0).commands(intersectPath.toCmds()).metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
            await OBR.scene.local.addItems([debugPath]);
        }
    }

    public async GreenDebugPath(item: any)
    {
        if (this.activated)
        {
            const debugPath = buildPath().commands(item.toCmds()).locked(true).visible(item.visible).fillColor('#555500').fillOpacity(0.3).strokeColor("#00FF00").layer("DRAWING").metadata({ [`${Constants.EXTENSIONID}/debug`]: true }).build();
            await OBR.scene.local.addItems([debugPath]);
        }
    }

    public async DebugBlobINeverUse()
    {
        if (this.activated)
        {
            // await Promise.all(promisesToExecute);

            // await OBR.scene.local.deleteItems(oldRings.map(fogItem => fogItem.id));
            // await OBR.scene.local.addItems(itemsToAdd.map(item =>
            // {
            //     const path = buildPath().commands(item.cmds).locked(true).visible(item.visible).fillColor('#000000').strokeColor("#000000").layer("FOG").name("Fog of War").metadata({ [`${Constants.EXTENSIONID}/isVisionFog`]: true, [`${Constants.EXTENSIONID}/digest`]: item.digest }).build();
            //     path.zIndex = item.zIndex;
            //     return path;
            // }));

            // if (!persistenceEnabled)
            // {
            //     await OBR.scene.local.deleteItems(oldFog.map((item) => item.id));
            // }

            // // Include the rings in the promise, if available
            // if (playerRings.length > 0)
            // {
            //     await OBR.scene.local.addItems(playerRings);
            // }

            // if (!BSCACHE.fogFilled)
            // {
            //     await OBR.scene.fog.setFilled(true);
            // }
        }
    }
}

export const DEBUG = new DebugUtility(false);