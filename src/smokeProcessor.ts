import OBR, { Curve, Item, Image, Light, Math2, MathM, PathCommand, Player, Vector2, Wall, buildImage, buildLight, buildPath, buildShape, buildWall } from "@owlbear-rodeo/sdk";
import * as Utilities from "./utilities/bsUtilities";
import { BSCACHE } from "./utilities/bsSceneCache";
import { isLocalVisionWall, isLocalVisionLight, isTokenWithVision, isVisionLineAndEnabled, isTokenWithVisionIOwn, isIndicatorRing, isLocalPersistentLight, isDoor, isLocalDecal } from "./utilities/itemFilters";
import { Constants } from "./utilities/bsConstants";

class SmokeProcessor
{
    wallsToCreate: Wall[] = [];
    wallsToUpdate: any[] = [];
    wallsToDelete: string[] = [];

    lightsToCreate: Light[] = [];
    lightsToUpdate: any[] = [];
    lightsToDelete: string[] = [];

    ringsToCreate: Item[] = [];
    ringsToUpdate: { id: string, height: number, width: number }[] = [];
    ringsToDelete: string[] = [];

    decalsToCreate: Image[] = [];
    decalsToUpdate: { id: string, imageUrl: string }[] = [];
    decalsToDelete: string[] = [];

    persistentLights: {
        id: string;
        position: Vector2;
        zIndex: number;
        metadata: any;
    }[] = [];
    persistenceCullingDistance = 1;
    persistenceLimit = 50;

    constructor()
    {

    }

    public async Initialize()
    {
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true)
        {
            // Using Localstorage to keep persistent data atm
            const persistentFogData = localStorage.getItem('PersistentFogData');
            if (persistentFogData)
            {
                const unwrappedData = JSON.parse(persistentFogData) as {
                    id: string;
                    position: Vector2;
                    zIndex: number;
                    metadata: any;
                }[];
                if (unwrappedData.length > 0)
                {
                    for (let pLight of unwrappedData)
                    {
                        // For rehydration, we are rebuilding as the original token
                        // We move the ID from the metadata so it resembles the original token
                        // The metadata is that of the original scene token
                        // The original 'depth' is moved to the zIndex so it can be reset without updating function
                        pLight.id = pLight.metadata[`${Constants.EXTENSIONID}/isPersistentLight`] as string;
                        this.AddPersistentLightToQueue(pLight as any, pLight.zIndex);
                    }
                }
            }
        }
    }

    public async Reset()
    {
        this.persistentLights = [];
    }

    public async Run()
    {
        await this.UpdateLights();
        await this.UpdateWalls();
        await this.UpdateDoors();
        await this.UpdateOwnershipHighlights(); // Logic for building is coupled with Light logic
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true)
        {
            // Using Localstorage to keep persistent data atm
            localStorage.setItem('PersistentFogData', JSON.stringify(this.persistentLights));
        }
    }

    public async ClearDoors()
    {
        if (BSCACHE.playerRole !== "PLAYER") return;

        const localDoors = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
        await OBR.scene.local.deleteItems(localDoors.map(x => x.id));
    }

    private async UpdateDoors()
    {
        if (BSCACHE.playerRole === "PLAYER" && BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/playerDoors`] !== true) return;

        const sceneDoors = BSCACHE.sceneItems.filter(x => isDoor(x)) as Curve[];
        const localDoors = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
        if (sceneDoors.length > 0)
        {
            const createLocalDoors: Item[] = [];
            for (const door of sceneDoors)
            {
                if (!localDoors.some(x => x.metadata[`${Constants.EXTENSIONID}/doorId`] === door.id))
                {
                    // No door exists, create the door.
                    const shapeTransform = MathM.fromItem(door);
                    const points: Vector2[] = [];
                    for (let i = 0; i < door.points.length; i++)
                    {
                        const localTransform = MathM.fromPosition(door.points[i]);
                        points.push(MathM.decompose(MathM.multiply(shapeTransform, localTransform)).position);
                    }
                    createLocalDoors.push(buildPath()
                        .locked(true)
                        .commands(this.getDoorPath(door.metadata[`${Constants.EXTENSIONID}/doorOpen`] !== true))
                        .scale({ x: 0.2, y: 0.2 })
                        .name("Closed Door")
                        .position(Math2.centroid(points))
                        .metadata({ [`${Constants.EXTENSIONID}/doorId`]: door.id })
                        .build());
                }
            }
            if (createLocalDoors.length > 0) await OBR.scene.local.addItems(createLocalDoors);
        }
        else
        {
            if (localDoors.length > 0)
                await OBR.scene.local.deleteItems(localDoors.map(x => x.id));
        }

        if (localDoors.length > 0)
        {
            const changedLocalDoorIds: string[] = [];
            const deletedDoorWalls: string[] = [];
            for (const local of localDoors)
            {
                const pairedDoorWall = BSCACHE.sceneItems.find(x => x.id === local.metadata[`${Constants.EXTENSIONID}/doorId`] as string);
                if (pairedDoorWall)
                {
                    if (pairedDoorWall.metadata[`${Constants.EXTENSIONID}/isDoor`] === undefined)
                    {
                        deletedDoorWalls.push(local.id);
                    }
                    else if ((local.name === "Open Door" && pairedDoorWall.metadata[`${Constants.EXTENSIONID}/doorOpen`] === undefined)
                        || (local.name === "Closed Door" && pairedDoorWall.metadata[`${Constants.EXTENSIONID}/doorOpen`] === true))
                    {
                        changedLocalDoorIds.push(local.id);
                    }
                }
                else
                {
                    deletedDoorWalls.push(local.id);
                }
            }
            if (changedLocalDoorIds.length > 0)
            {
                await OBR.scene.local.updateItems(x => changedLocalDoorIds.includes(x.id), (doors) =>
                {
                    for (let door of doors)
                    {
                        if (door.name === "Open Door")
                        {
                            // Close it
                            door.commands = this.getDoorPath(true);
                            door.name = "Closed Door";
                        }
                        else
                        {
                            door.commands = this.getDoorPath(false);
                            door.name = "Open Door";
                        }
                    }
                });
            }
            if (deletedDoorWalls.length > 0)
            {
                await OBR.scene.local.deleteItems(deletedDoorWalls);
            }
        }
    }

    public async ClearPersistence()
    {
        await OBR.scene.local.deleteItems(this.persistentLights.map(x => x.id));
        this.persistentLights = [];
    }

    public async TogglePersistentLightVisibility(off: boolean)
    {
        await OBR.scene.local.updateItems(x => isLocalPersistentLight(x) !== undefined, (pLights) =>
        {
            for (let light of pLights)
            {
                light.visible = !off;
            }
        });
    }
    public async ClearOwnershipHighlights()
    {
        const sceneRings = BSCACHE.sceneLocal.filter(x => isIndicatorRing(x));
        await OBR.scene.local.deleteItems(sceneRings.map(x => x.id));
    }

    public async InitiateOwnerHighlight()
    {
        // If lights are already built before the owner highlight has been toggled on,
        // they will need to be created separately
        if (BSCACHE.playerRole !== "GM" || BSCACHE.fogFilled === false) return;

        const sceneVisionTokens = BSCACHE.sceneItems.filter(x => (isTokenWithVision(x)));
        for (const scenetoken of sceneVisionTokens)
        {
            this.CreateOwnerHighlight(scenetoken, true);
        }
    }

    private CreateOwnerHighlight(token: Item, override = false)
    {
        if ((BSCACHE.playerRole !== "GM"
            || BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] !== true)
            && !override) return;

        const existingRing = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`] === true && x.attachedTo === token.id);
        if (existingRing)
        {
            this.UpdateOwnerHightlight(token);
        }
        else
        {
            const owner = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${token.createdUserId}`] as Player;
            const ringSize = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? Constants.ATTENUATIONDEFAULT);
            const playerRing = buildShape()
                .strokeColor(owner.color)
                .fillOpacity(0)
                .position({ x: token.position.x, y: token.position.y })
                .width(ringSize * 2)
                .height(ringSize * 2)
                .shapeType("CIRCLE")
                .metadata({ [`${Constants.EXTENSIONID}/isIndicatorRing`]: true })
                .attachedTo(token.id)
                .locked(true)
                .layer("POINTER")
                .zIndex(1)
                .build();
            this.ringsToCreate.push(playerRing);
        }
    }

    private UpdateOwnerHightlight(token: Item)
    {
        if (BSCACHE.playerRole !== "GM" || BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] !== true) return;

        const ringSize = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? Constants.ATTENUATIONDEFAULT);
        const thisRing = BSCACHE.sceneLocal.find(x => x.attachedTo === token.id && x.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`] === true);

        if (thisRing)
        {
            const update = {
                id: thisRing.id,
                height: ringSize * 2,
                width: ringSize * 2,
            };
            this.ringsToUpdate.push(update);
        }
    }

    private async UpdateOwnershipHighlights()
    {
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] !== true) return;

        // Add, Update and Delete
        if (this.ringsToCreate.length > 0)
            await OBR.scene.local.addItems(this.ringsToCreate);
        if (this.ringsToDelete.length > 0)
            await OBR.scene.local.deleteItems(this.ringsToDelete);
        if (this.ringsToUpdate.length > 0)
        {
            const sceneRings = BSCACHE.sceneLocal.filter(x => isIndicatorRing(x));
            await OBR.scene.local.updateItems(sceneRings.filter(x => !this.ringsToDelete.includes(x.id)), (rings) =>
            {
                for (let ring of rings)
                {
                    const mine = this.ringsToUpdate.find(x => x.id === ring.id)
                    if (mine)
                    {
                        ring.height = mine.height;
                        ring.width = mine.width;
                    }
                }
            });
        }
        this.ringsToCreate = [];
        this.ringsToUpdate = [];
        this.ringsToDelete = [];
    }

    private async UpdateLights()
    {
        // Find all tokens with vision enabled
        let sceneVisionTokens: Item[] = [];
        if (BSCACHE.playerRole === "GM")
        {
            sceneVisionTokens = BSCACHE.sceneItems.filter(x => (isTokenWithVision(x)));
        }
        else
        {
            const gmIds = BSCACHE.party.filter(x => x.role === "GM").map(x => x.id);
            const gmOwnedTokens = BSCACHE.sceneItems.filter(x => (isTokenWithVision(x)) && gmIds.includes(x.createdUserId));
            const myOwnedTokens = BSCACHE.sceneItems.filter(x => (isTokenWithVisionIOwn(x)));
            sceneVisionTokens = [...myOwnedTokens, ...gmOwnedTokens];
        }

        // If we're disabling vision, flush the list so no one can see.
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/disableVision`] === true)
        {
            sceneVisionTokens = [];
        }

        const elevationMappings = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationMapping`] as ElevationMap[] ?? [];
        for (const sceneToken of sceneVisionTokens)
        {
            let sceneTokenDepth = -10;
            for (const mapping of elevationMappings)
            {
                const withinMap = Utilities.isPointInPolygon(sceneToken.position, mapping.Points);
                if (withinMap && (mapping.Depth > sceneTokenDepth))
                {
                    sceneTokenDepth = mapping.Depth;
                }
            }
            const existingLight = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.EXTENSIONID}/isVisionLight`] === sceneToken.id) as Light;
            if (!existingLight)
            {
                this.CreateLightToQueue(sceneToken, sceneTokenDepth);
            }
            else
            {
                // We need to see if it changed in POSITION or POINTS or BLOCK or DOUBLESIDED status
                const equalOuterRadius = this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionRange`] as string)
                    === existingLight.attenuationRadius;
                const equalInnerRadius = this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string)
                    === existingLight.sourceRadius;
                const equalFalloff = sceneToken.metadata[`${Constants.EXTENSIONID}/visionFallOff`]
                    === existingLight.falloff.toString();
                const equalInnerAngle = sceneToken.metadata[`${Constants.EXTENSIONID}/visionInAngle`]
                    === existingLight.innerAngle.toString();
                const equalOuterAngle = sceneToken.metadata[`${Constants.EXTENSIONID}/visionOutAngle`]
                    === existingLight.outerAngle.toString();
                const equalDepth = this.GetDepth(sceneTokenDepth, false) === existingLight.zIndex;

                if (!equalOuterRadius || !equalInnerRadius || !equalFalloff || !equalInnerAngle || !equalOuterAngle || !equalDepth)
                {
                    this.UpdateLightToQueue(sceneToken, existingLight, sceneTokenDepth);
                }
            }

            // Check to see if we need to overlay a top-level decal to show the token
            if (sceneToken.layer === "CHARACTER"
                && (sceneToken.metadata[`${Constants.EXTENSIONID}/visionInAngle`] !== "360"
                    || sceneToken.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] !== "360"))
            {
                const existingDecal = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.EXTENSIONID}/isLocalDecal`] === sceneToken.id)
                if (!existingDecal)
                {
                    this.CreateDecalToQueue(sceneToken as Image);
                }
            }

            // If persistence is enabled;
            // And there is no persistent light at this spot
            // And there is none within 10px
            if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true
                && !this.persistentLights.find(x => x.position === sceneToken.position)
                && this.IsPositionClear(sceneToken.position))
            {
                // If we hit our limit, remove from the bottom of the stack
                if (this.persistenceLimit === this.persistentLights.length)
                {
                    const removedPLight = this.persistentLights.shift()!;
                    this.lightsToDelete.push(removedPLight.id);
                }
                this.AddPersistentLightToQueue(sceneToken, sceneTokenDepth)
            }
        }

        const localVisionLights = BSCACHE.sceneLocal.filter(x => (isLocalVisionLight(x))) as Light[];
        for (const localLight of localVisionLights)
        {
            const exists = sceneVisionTokens.find(x => x.id === localLight.metadata[`${Constants.EXTENSIONID}/isVisionLight`]);
            if (!exists)
            {
                this.lightsToDelete.push(localLight.id);
                const ownerRing = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`] === true
                    && x.attachedTo === localLight.metadata[`${Constants.EXTENSIONID}/isVisionLight`]);
                if (ownerRing) this.ringsToDelete.push(ownerRing.id);
            }
        }

        // Decals should be deleted with the owning token, but just in case for local cleanup
        // Also if the vision is updated back to 360, remove so we don't track it
        const localDecals = BSCACHE.sceneLocal.filter(x => isLocalDecal(x)) as Image[];
        for (const localDecal of localDecals)
        {
            const exists = sceneVisionTokens.find(x => x.id === localDecal.metadata[`${Constants.EXTENSIONID}/isLocalDecal`]) as Image;
            if (!exists) this.decalsToDelete.push(localDecal.id);
            else
            {
                if (exists.metadata[`${Constants.EXTENSIONID}/visionInAngle`] === "360"
                    || exists.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] === "360")
                    this.decalsToDelete.push(localDecal.id);
                else if (exists.image.url !== localDecal.image.url)
                {
                    this.decalsToUpdate.push({ id: localDecal.id, imageUrl: exists.image.url });
                }
            }
        }

        // Add, Update and Delete
        if (this.lightsToCreate.length > 0)
            await OBR.scene.local.addItems(this.lightsToCreate);
        if (this.lightsToDelete.length > 0)
            await OBR.scene.local.deleteItems(this.lightsToDelete);
        if (this.lightsToUpdate.length > 0)
            await OBR.scene.local.updateItems(localVisionLights.filter(x => !this.lightsToDelete.includes(x.id)), (lights) =>
            {
                for (let light of lights)
                {
                    const mine = this.lightsToUpdate.find(x => x.id === light.id)
                    if (mine)
                    {
                        light.attenuationRadius = mine.attenuationRadius;
                        light.sourceRadius = mine.sourceRadius;
                        light.falloff = mine.falloff;
                        light.innerAngle = mine.innerAngle;
                        light.outerAngle = mine.outerAngle;
                        light.zIndex = mine.zIndex;
                    }
                }
            });

        // Add, Update and Delete
        if (this.decalsToCreate.length > 0)
            await OBR.scene.local.addItems(this.decalsToCreate);
        if (this.decalsToDelete.length > 0)
            await OBR.scene.local.deleteItems(this.decalsToDelete);
        if (this.decalsToUpdate.length > 0)
            await OBR.scene.local.updateItems(localDecals.filter(x => !this.decalsToDelete.includes(x.id)), (decals) =>
            {
                for (let decal of decals)
                {
                    const mine = this.decalsToUpdate.find(x => x.id === decal.id)
                    if (mine)
                    {
                        decal.image.url = mine.imageUrl;
                    }
                }
            });

        this.lightsToCreate = [];
        this.lightsToUpdate = [];
        this.lightsToDelete = [];

        this.decalsToCreate = [];
        this.decalsToDelete = [];
        this.decalsToUpdate = [];
    }

    private async UpdateWalls()
    {
        const elevationMappings = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationMapping`] as ElevationMap[] ?? [];

        // Find all of the REAL fog lines to be recreated as local walls
        const sceneVisionLines = BSCACHE.sceneItems.filter(x => (isVisionLineAndEnabled(x))) as Curve[];
        for (const visionLine of sceneVisionLines)
        {
            let visionLineDepth = -10;
            for (const mapping of elevationMappings)
            {
                const withinMap = Utilities.isPointInPolygon(visionLine.points[0], mapping.Points);
                if (withinMap && (mapping.Depth > visionLineDepth))
                {
                    visionLineDepth = mapping.Depth;
                }
            }

            const existingLine = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.EXTENSIONID}/isVisionWall`] === visionLine.id) as Wall;
            if (!existingLine)
            {
                this.CreateWallToQueue(visionLine, visionLineDepth);
            }
            else
            {
                // We need to see if it changed in POSITION or POINTS or BLOCK or DOUBLESIDED status
                const equalPoints = Utilities.ArePointsEqual(visionLine, existingLine);
                const equalPosition = (visionLine.position.x === existingLine.position.x
                    && visionLine.position.y === existingLine.position.y);
                const equalBlock = visionLine.metadata[`${Constants.EXTENSIONID}/blocking`]
                    === existingLine.blocking;
                const equalSides = visionLine.metadata[`${Constants.EXTENSIONID}/doubleSided`]
                    === existingLine.doubleSided;
                const equalDepth = this.GetDepth(visionLineDepth, true) === existingLine.zIndex;

                if (!equalPoints || !equalPosition || !equalBlock || !equalSides || !equalDepth)
                {
                    this.UpdateWallToQueue(visionLine, existingLine, visionLineDepth);
                }
            }
        }

        const localVisionWalls = BSCACHE.sceneLocal.filter(x => (isLocalVisionWall(x))) as Wall[];
        for (const localWall of localVisionWalls)
        {
            const exists = sceneVisionLines.find(x => x.id === localWall.metadata[`${Constants.EXTENSIONID}/isVisionWall`]);
            if (!exists) this.wallsToDelete.push(localWall.id);
        }

        // Add, Update and Delete
        if (this.wallsToCreate.length > 0)
            await OBR.scene.local.addItems(this.wallsToCreate);
        if (this.wallsToDelete.length > 0)
            await OBR.scene.local.deleteItems(this.wallsToDelete);
        if (this.wallsToUpdate.length > 0)
            await OBR.scene.local.updateItems(localVisionWalls.filter(x => !this.wallsToDelete.includes(x.id)), (lines) =>
            {
                for (let line of lines)
                {
                    const mine = this.wallsToUpdate.find(x => x.id === line.id)
                    if (mine)
                    {
                        line.points = mine.points;
                        line.position = mine.position;
                        line.blocking = mine.blocking;
                        line.doubleSided = mine.doubleSided;
                        line.zIndex = mine.zIndex;
                    }
                }
            });

        this.wallsToCreate = [];
        this.wallsToUpdate = [];
        this.wallsToDelete = [];
    }

    private CreateWallToQueue(line: Curve, depth: number)
    {
        // We are making a mirror of the wall, that we can identify which one it's replicating
        const item = buildWall()
            .points(line.points)
            .position(line.position)
            .locked(true)
            .blocking(line.metadata[`${Constants.EXTENSIONID}/blocking`] as boolean ?? false)
            .doubleSided(line.metadata[`${Constants.EXTENSIONID}/doubleSided`] as boolean ?? false)
            .zIndex(this.GetDepth(depth, true))
            .metadata({ [`${Constants.EXTENSIONID}/isVisionWall`]: line.id })
            .build();

        this.wallsToCreate.push(item);
    }

    private AddPersistentLightToQueue(token: Item, depth: number)
    {
        // We do not need to persist secondary lights, because the existing Primary Lights will re-trigger a secondary
        const lightType = token.metadata[`${Constants.EXTENSIONID}/isTorch`] === true ? "SECONDARY" : "PRIMARY";
        if (lightType === "SECONDARY") return;

        const persistenceItem = buildLight()
            .position(token.position)
            .attenuationRadius(this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? Constants.ATTENUATIONDEFAULT))
            .sourceRadius(this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string ?? Constants.SOURCEDEFAULT))
            .falloff(parseFloat(token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string ?? Constants.FALLOFFDEFAULT))
            .innerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string ?? Constants.INANGLEDEFAULT))
            .outerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string ?? Constants.OUTANGLEDEFAULT))
            .zIndex(this.GetDepth(depth, false))
            .metadata({ [`${Constants.EXTENSIONID}/isPersistentLight`]: token.id })
            .build();

        this.lightsToCreate.push(persistenceItem);
        this.persistentLights.push({
            id: persistenceItem.id,
            position: persistenceItem.position,
            zIndex: depth, // This is for when it's re-calculated on load
            metadata: token.metadata
        });
    }

    private CreateLightToQueue(token: Item, depth: number)
    {
        // We are 'light' to follow the token around, that we can identify which one it's replicating
        const lightType = token.metadata[`${Constants.EXTENSIONID}/isTorch`] === true ? "SECONDARY" : "PRIMARY";
        const item = buildLight()
            .position(token.position)
            .lightType(lightType)
            .attenuationRadius(this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? Constants.ATTENUATIONDEFAULT))
            .sourceRadius(this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string ?? Constants.SOURCEDEFAULT))
            .falloff(parseFloat(token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string ?? Constants.FALLOFFDEFAULT))
            .innerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string ?? Constants.INANGLEDEFAULT))
            .outerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string ?? Constants.OUTANGLEDEFAULT))
            .zIndex(this.GetDepth(depth, false))
            .metadata({ [`${Constants.EXTENSIONID}/isVisionLight`]: token.id })
            .attachedTo(token.id)
            .disableAttachmentBehavior(["SCALE"])
            .build();

        this.lightsToCreate.push(item);

        if (lightType === "PRIMARY") this.CreateOwnerHighlight(token);
    }

    private CreateDecalToQueue(token: Image)
    {
        const item = buildImage(
            {
                height: token.image.height,
                width: token.image.width,
                url: token.image.url,
                mime: token.image.mime,
            },
            {
                dpi: token.grid.dpi,
                offset: token.grid.offset
            })
            .position(token.position)
            .attachedTo(token.id)
            .layer("POINTER")
            .metadata({ [`${Constants.EXTENSIONID}/isLocalDecal`]: token.id })
            .disableHit(true)
            .build();

        this.decalsToCreate.push(item);
    }

    private UpdateWallToQueue(scenelLine: Curve, localWall: Wall, depth: number)
    {
        const update = {
            id: localWall.id,
            points: scenelLine.points,
            position: scenelLine.position,
            blocking: scenelLine.metadata[`${Constants.EXTENSIONID}/blocking`] as boolean ?? false,
            doubleSided: scenelLine.metadata[`${Constants.EXTENSIONID}/doubleSided`] as boolean ?? false,
            zIndex: this.GetDepth(depth, true)
        };
        this.wallsToUpdate.push(update);
    }

    private UpdateLightToQueue(sceneToken: Item, localLight: Light, depth: number)
    {
        const lightType = sceneToken.metadata[`${Constants.EXTENSIONID}/isTorch`] === true ? "SECONDARY" : "PRIMARY";
        const update = {
            id: localLight.id,
            attenuationRadius: this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? Constants.ATTENUATIONDEFAULT),
            sourceRadius: this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string ?? Constants.SOURCEDEFAULT),
            falloff: parseFloat(sceneToken.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string ?? Constants.FALLOFFDEFAULT),
            innerAngle: parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string ?? Constants.INANGLEDEFAULT),
            outerAngle: parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string ?? Constants.OUTANGLEDEFAULT),
            zIndex: this.GetDepth(depth, false)
        };
        this.lightsToUpdate.push(update);
        if (lightType === "PRIMARY") this.UpdateOwnerHightlight(sceneToken);
    }

    private GetLightRange(distance: string)
    {
        const numDistance = parseInt(distance);
        const tileDistance = numDistance / BSCACHE.gridScale;
        return tileDistance * BSCACHE.gridDpi;
    }

    private GetDepth(value: number, wall: boolean)
    {
        // -10 is base level.
        switch (value)
        {
            case 1:
                return !wall ? -5 : -4;
            case 2:
                return !wall ? -6 : -5;
            case 3:
                return !wall ? -7 : -6;
            case 4:
                return !wall ? -8 : -7;
            case 5:
                return !wall ? -9 : -8;
            default:
                return -1;
        }
    }

    // We will only create a new persistent light if it's roughly a square away
    private IsPositionClear(position: Vector2): boolean
    {
        const griddedDistance = (BSCACHE.gridDpi - 10) * this.persistenceCullingDistance;
        for (const light of this.persistentLights)
        {
            const distance = Utilities.distanceBetween(position, light.position);
            if (distance <= griddedDistance)
            {
                return false;
            }
        }
        return true;
    }

    private getDoorPath(close: boolean): PathCommand[]
    {
        if (close)
        {
            return Constants.DOORCLOSED;
        }
        else
        {
            return Constants.DOOROPEN;
        }
    }

    public async ToggleDoor(toggleDoorId: string)
    {
        const localDoor = BSCACHE.sceneLocal.filter((item) => item.id === toggleDoorId && item.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined);
        if (localDoor.length === 1)
        {
            const foundDoors = BSCACHE.sceneItems.filter((item) => item.id === localDoor[0].metadata[`${Constants.EXTENSIONID}/doorId`]);
            if (foundDoors.length === 1)
            {
                const thisDoor = foundDoors[0];
                if (BSCACHE.playerRole !== "GM" && thisDoor.metadata[`${Constants.EXTENSIONID}/isDoorLocked`])
                {
                    return;
                }

                await OBR.scene.items.updateItems(foundDoors, (items) =>
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
                            delete item.metadata[`${Constants.EXTENSIONID}/isDoorLocked`];
                        }
                    }
                });

                await OBR.player.deselect([toggleDoorId]);
            }
        }
    }
}
export const SMOKEMACHINE = new SmokeProcessor();