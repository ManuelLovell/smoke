import OBR, { Curve, Item, Image, Light, Math2, MathM, Player, Vector2, Wall, buildImage, buildLight, buildShape, buildWall, Effect, buildEffect, Shape } from "@owlbear-rodeo/sdk";
import * as Utilities from "./utilities/bsUtilities";
import { BSCACHE } from "./utilities/bsSceneCache";
import { isLocalVisionWall, isLocalVisionLight, isTokenWithVision, isVisionLineAndEnabled, isTokenWithVisionIOwn, isIndicatorRing, isLocalPersistentLight, isDoor, isLocalDecal, isDarkVision } from "./utilities/itemFilters";
import { Constants } from "./utilities/bsConstants";
import { GetFalloffRangeDefault, GetInnerAngleDefault, GetOuterAngleDefault, GetSourceRangeDefault, GetVisionRangeDefault } from "./tools/visionToolUtilities";

class SmokeProcessor
{
    wallsToCreate: Wall[] = [];
    wallsToUpdate: any[] = [];
    wallsToDelete: string[] = [];
    wallsToError: string[] = [];

    lightsToCreate: Light[] = [];
    lightsToUpdate: any[] = [];
    lightsToDelete: string[] = [];

    ringsToCreate: Item[] = [];
    ringsToUpdate: { id: string, height: number, width: number }[] = [];
    ringsToDelete: string[] = [];

    decalsToCreate: Image[] = [];
    decalsToUpdate: { id: string, imageUrl: string }[] = [];
    decalsToDelete: string[] = [];

    darkVisionToCreate: Effect[] = [];
    darkVisionToUpdate: { id: string, size: number }[] = [];
    darkVisionToDelete: string[] = [];

    revealersToCreate: Effect[] = [];
    revealersToUpdate: { id: string, size: number }[] = [];
    revealersToDelete: string[] = [];

    persistentLights: {
        id: string;
        position: Vector2;
        rotation: number;
        zIndex: number;
        metadata: any;
    }[] = [];
    persistenceCullingDistance = 1;
    persistenceLimit = 50;

    public trailingFoggedMaps: string[] = [];
    public trailingFogTokens: string[] = [];

    constructor()
    {

    }

    public async Initialize()
    {
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true)
        {
            // Using Localstorage to keep persistent data atm
            const persistentFogData = localStorage.getItem(Utilities.GetPersistentLocalKey());
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
        this.trailingFogTokens = [];
        this.trailingFoggedMaps = [];
    }

    public async Run()
    {
        await this.UpdateTrailingFogMaps(); // Fog Effect has to go on before Revealer Effect
        await this.UpdateWalls();
        await this.UpdateDoors();
        await this.UpdateLights();
        await this.UpdateOwnershipHighlights(); // Logic for building is coupled with Light logic
        await this.UpdateTrailingFogTokens();
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true)
        {
            // Using Localstorage to keep persistent data atm
            localStorage.setItem(Utilities.GetPersistentLocalKey(), JSON.stringify(this.persistentLights));
        }
    }

    private async UpdateTrailingFogMaps()
    {
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/trailingFog`] === true)
        {
            // If our trailing fog setting is on, we'll process
            await this.CreateTrailingFogOverlay();
        }
    }

    private async UpdateTrailingFogTokens()
    {
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/trailingFog`] === true)
        {
            if (this.revealersToCreate.length > 0)
            {
                await OBR.scene.local.addItems(this.revealersToCreate);
                this.revealersToCreate = [];
            }
        }
        else if (this.trailingFogTokens.length > 0 || this.trailingFoggedMaps.length > 0)
        {
            // Otherwise, we need to remove all and not process
            const trailingFogRevealers = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/isTrailingFogLight`] !== undefined) as Effect[];
            const trailingFogMaps = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/isTrailingFogger`] !== undefined) as Effect[];
            if (trailingFogMaps.length > 0) await OBR.scene.local.deleteItems(trailingFogMaps.map(x => x.id));
            if (trailingFogRevealers.length > 0) await OBR.scene.local.deleteItems(trailingFogRevealers.map(x => x.id));
            this.trailingFogTokens = [];
            this.trailingFoggedMaps = [];
        }
    }

    public async UpdateTrailingFogColor(newColor: string)
    {
        const trailingFogRevealers = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/isTrailingFogLight`] !== undefined) as Effect[];
        await OBR.scene.local.updateItems<Effect>(trailingFogRevealers.map(x => x.id), (revealers) =>
        {
            for (let revealer of revealers)
            {
                revealer.uniforms = [
                    { name: "darknessLevel", value: 0.65 },
                    { name: "darknessColor", value: Utilities.HexToRgbShader(newColor) },
                    { name: "radiusRatio", value: 1.0 },
                ];
            }
        });
        const trailingFogMaps = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/isTrailingFogger`] !== undefined) as Effect[];
        await OBR.scene.local.updateItems<Effect>(trailingFogMaps.map(x => x.id), (fogMaps) =>
        {
            for (let fogMap of fogMaps)
            {
                fogMap.uniforms = [
                    { name: "darknessLevel", value: 0.65 },
                    { name: "darknessColor", value: Utilities.HexToRgbShader(newColor) },
                ];
            }
        });
    }

    private CreateTrailingFogRevealer(light: Light)
    {
        if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/trailingFog`] === true)
        {
            if (!this.trailingFogTokens.includes(light.id))
            {
                const revealerEffect = buildEffect()
                    .position(light.position)
                    .attachedTo(light.id)
                    .scale(light.scale)
                    .width(200)
                    .height(200)
                    .effectType("ATTACHMENT")
                    .layer("POST_PROCESS")
                    .sksl(Constants.TRAILINGFOGREVEALSHADER)
                    .uniforms([
                        { name: "radiusRatio", value: 1.0 },
                    ])
                    .metadata({ [`${Constants.EXTENSIONID}/isTrailingFogLight`]: light.id })
                    .disableHit(true)
                    .build();
                this.revealersToCreate.push(revealerEffect);
                this.trailingFogTokens.push(light.id);
            }
        }
    }

    private async CreateTrailingFogOverlay()
    {
        // We are fogging only the map items, which causes the 'edges' of the Revealer to stick out when a token goes outside of the map bounds
        // This would be changed if we fogged the viewport instead - because we would be beyond the boundaries of the map with fog and it wouldn't matter.
        // I think leaving it as such is a decent trade-off to not make everything unnecessarily dark.
        const trailFoggersToCreate: Effect[] = [];
        const maps = BSCACHE.sceneItems.filter(x => x.layer === "MAP" && x.type === "IMAGE") as Image[];
        for (const map of maps)
        {
            if (!this.trailingFoggedMaps.includes(map.id))
            {
                const trailingFogEffect = buildEffect()
                    .position(map.position)
                    .attachedTo(map.id)
                    .scale(map.scale)
                    .width(map.image.width)
                    .height(map.image.height)
                    .effectType("ATTACHMENT")
                    .layer("POST_PROCESS")
                    .sksl(Constants.TRAILINGFOGSHADER)
                    .uniforms([
                        { name: "darknessLevel", value: 0.65 },
                        { name: "darknessColor", value: Utilities.HexToRgbShader(BSCACHE.fogColor) },
                    ])
                    .metadata({ [`${Constants.EXTENSIONID}/isTrailingFogger`]: map.id })
                    .disableHit(true)
                    .build();
                trailFoggersToCreate.push(trailingFogEffect);
                this.trailingFoggedMaps.push(map.id);
            }
        }

        if (trailFoggersToCreate.length > 0)
        {
            await OBR.scene.local.addItems(trailFoggersToCreate);
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
        const localDoors = BSCACHE.sceneLocal.filter(x => x.metadata[`${Constants.EXTENSIONID}/doorId`] !== undefined) as Image[];
        if (sceneDoors.length > 0)
        {
            const createLocalDoors: Item[] = [];
            for (const door of sceneDoors)
            {
                if (!localDoors.some(x => x.metadata[`${Constants.EXTENSIONID}/doorId`] === door.id))
                {
                    // No door exists, create the door.
                    const doorOpen = door.metadata[`${Constants.EXTENSIONID}/doorOpen`] === true;
                    const doorLocked = door.metadata[`${Constants.EXTENSIONID}/isDoorLocked`] === true;
                    const shapeTransform = MathM.fromItem(door);
                    const points: Vector2[] = [];
                    for (let i = 0; i < door.points.length; i++)
                    {
                        const localTransform = MathM.fromPosition(door.points[i]);
                        points.push(MathM.decompose(MathM.multiply(shapeTransform, localTransform)).position);
                    }

                    let doorUrl = Constants.DOOROPEN;
                    let doorName = "Opened Door";
                    if (BSCACHE.playerRole === "GM" && doorLocked)
                    {
                        doorUrl = Constants.DOORLOCKED;
                        doorName = "Locked Door";
                    }
                    else if (!doorOpen)
                    {
                        doorUrl = Constants.DOORCLOSED;
                        doorName = "Closed Door";
                    }

                    const doorPosition = Math2.centroid(points);
                    createLocalDoors.push(buildImage(
                        {
                            height: 100,
                            width: 100,
                            url: doorUrl,
                            mime: 'image/svg+xml'
                        }, { dpi: 150, offset: { x: 50, y: 50 } }
                    )
                        .scale(({
                            x: .5, y: .5
                        }))
                        .layer("DRAWING")
                        .locked(true)
                        .name(doorName)
                        .position({ x: doorPosition.x, y: doorPosition.y })
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
            const openedDoors: string[] = [];
            const closedDoors: string[] = [];
            const lockedDoors: string[] = [];

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
                    else if (BSCACHE.playerRole === "GM" && local.image.url !== Constants.DOORLOCKED && pairedDoorWall.metadata[`${Constants.EXTENSIONID}/isDoorLocked`] === true)
                    {
                        lockedDoors.push(local.id);
                    }
                    else if (local.image.url !== Constants.DOOROPEN && pairedDoorWall.metadata[`${Constants.EXTENSIONID}/doorOpen`] === true)
                    {
                        openedDoors.push(local.id);
                    }
                    else if (local.image.url !== Constants.DOORCLOSED && pairedDoorWall.metadata[`${Constants.EXTENSIONID}/doorOpen`] !== true)
                    {
                        if (BSCACHE.playerRole === "GM" && pairedDoorWall.metadata[`${Constants.EXTENSIONID}/isDoorLocked`] !== true
                            || BSCACHE.playerRole === "PLAYER")
                            closedDoors.push(local.id);
                    }
                }
                else
                {
                    deletedDoorWalls.push(local.id);
                }
            }
            if (lockedDoors.length > 0)
            {
                await OBR.scene.local.updateItems<Image>(x => lockedDoors.includes(x.id), (doors) =>
                {
                    for (let door of doors)
                    {
                        door.image.url = Constants.DOORLOCKED;
                        door.name = "Locked Door";
                    }
                });
            }
            if (openedDoors.length > 0)
            {
                await OBR.scene.local.updateItems<Image>(x => openedDoors.includes(x.id), (doors) =>
                {
                    for (let door of doors)
                    {
                        door.image.url = Constants.DOOROPEN;
                        door.name = "Opened Door";
                    }
                });
            }
            if (closedDoors.length > 0)
            {
                await OBR.scene.local.updateItems<Image>(x => closedDoors.includes(x.id), (doors) =>
                {
                    for (let door of doors)
                    {
                        door.image.url = Constants.DOORCLOSED;
                        door.name = "Closed Door";
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
        localStorage.setItem(Utilities.GetPersistentLocalKey(), JSON.stringify(this.persistentLights));
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

        const useDarkVision = parseInt(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string)
            > parseInt(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string);
        const darkVisionRange = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string);

        const existingRing = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`] === true && x.attachedTo === token.id);
        if (existingRing)
        {
            this.UpdateOwnerHightlight(token);
        }
        else
        {
            const owner = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${token.createdUserId}`] as Player;
            const ringSize = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? GetVisionRangeDefault());
            const playerRing = buildShape()
                .strokeColor(owner.color)
                .fillOpacity(0)
                .position({ x: token.position.x, y: token.position.y })
                .width(useDarkVision ? darkVisionRange * 2 : ringSize * 2)
                .height(useDarkVision ? darkVisionRange * 2 : ringSize * 2)
                .shapeType("CIRCLE")
                .metadata({ [`${Constants.EXTENSIONID}/isIndicatorRing`]: true })
                .attachedTo(token.id)
                .locked(true)
                .layer(Constants.LINELAYER)
                .disableAttachmentBehavior(["SCALE"])
                .zIndex(1)
                .build();
            this.ringsToCreate.push(playerRing);
        }
    }

    private UpdateDarkVision(token: Item)
    {
        const darkVisionSize = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? GetVisionRangeDefault());
        const thisDarkVision = BSCACHE.sceneLocal.find(x => x.attachedTo === token.id && x.metadata[`${Constants.EXTENSIONID}/isDarkVision`] === true);

        if (thisDarkVision)
        {
            const update = {
                id: thisDarkVision.id,
                size: darkVisionSize,
            };
            this.darkVisionToUpdate.push(update);
        }
    }

    private UpdateOwnerHightlight(token: Item)
    {
        if (BSCACHE.playerRole !== "GM" || BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/toggleOwnerLines`] !== true) return;

        const useDarkVision = parseInt(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string)
            > parseInt(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string);
        const darkVisionRange = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string);

        const ringSize = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? GetVisionRangeDefault());
        const thisRing = BSCACHE.sceneLocal.find(x => x.attachedTo === token.id && x.metadata[`${Constants.EXTENSIONID}/isIndicatorRing`] === true);

        if (thisRing)
        {
            const update = {
                id: thisRing.id,
                height: (useDarkVision ? darkVisionRange * 2 : ringSize * 2),
                width: (useDarkVision ? darkVisionRange * 2 : ringSize * 2),
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
            const sceneRings = BSCACHE.sceneLocal.filter(x => isIndicatorRing(x)) as Shape[];
            await OBR.scene.local.updateItems<Shape>(sceneRings.filter(x => !this.ringsToDelete.includes(x.id)), (rings) =>
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
            const playerPreviewSelect = document.getElementById("preview_select") as HTMLSelectElement;
            if (playerPreviewSelect && playerPreviewSelect?.value !== BSCACHE.playerId)
            {
                // We're running as someone else
                sceneVisionTokens = BSCACHE.sceneItems.filter(item => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "ATTACHMENT" || item.layer === "PROP")
                    && item.createdUserId === playerPreviewSelect.value && item.metadata[`${Constants.EXTENSIONID}/hasVision`])
            }
            else
            {
                sceneVisionTokens = BSCACHE.sceneItems.filter(x => (isTokenWithVision(x)));
            }
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
                let equalOuterRadius = this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionRange`] as string)
                    === existingLight.attenuationRadius;
                if (parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionDark`] as string)
                    > parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionRange`] as string))
                {
                    equalOuterRadius = this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionDark`] as string)
                        === existingLight.attenuationRadius;
                }
                const equalInnerRadius = this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string)
                    === existingLight.sourceRadius;
                const equalFalloff = sceneToken.metadata[`${Constants.EXTENSIONID}/visionFallOff`]
                    === existingLight.falloff.toString();
                const equalInnerAngle = sceneToken.metadata[`${Constants.EXTENSIONID}/visionInAngle`]
                    === existingLight.innerAngle.toString();
                const equalOuterAngle = sceneToken.metadata[`${Constants.EXTENSIONID}/visionOutAngle`]
                    === existingLight.outerAngle.toString();
                const equalBlind = sceneToken.metadata[`${Constants.EXTENSIONID}/visionBlind`]
                    === existingLight.metadata[`${Constants.EXTENSIONID}/visionBlind`];
                const equalDepth = this.GetDepth(sceneTokenDepth, false) === existingLight.zIndex;

                if (!equalOuterRadius || !equalInnerRadius || !equalFalloff || !equalInnerAngle || !equalOuterAngle || !equalBlind || !equalDepth)
                {
                    this.UpdateLightToQueue(sceneToken, existingLight, sceneTokenDepth);
                }

                const existingDarkVision = BSCACHE.sceneLocal.find(x => x.metadata[`${Constants.EXTENSIONID}/isDarkVision`] === sceneToken.id && x.attachedTo === sceneToken.id) as Effect;
                if (existingDarkVision)
                {
                    const equalRange = this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionRange`] as string)
                        === existingDarkVision.width;
                    if (!equalRange)
                    {
                        this.UpdateDarkVision(sceneToken);
                    }
                }
                else
                {
                    this.CreateDarkVisionToQueue(sceneToken);
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
            if (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/persistence`] === true && sceneToken.metadata[`${Constants.EXTENSIONID}/visionBlind`] !== true)
            {
                const tokenInPosition = this.persistentLights.find(x => x.position.x === sceneToken.position.x && x.position.y === sceneToken.position.y);
                if (!tokenInPosition)
                {
                    // This checks to see if there is any token in a small radius, as to avoid doubling up
                    if (this.IsPositionClear(sceneToken.position))
                    {
                        this.AddPersistentLightToQueue(sceneToken, sceneTokenDepth)
                    }
                }
                else
                {
                    // This means we're using coned vision, and should track rotation for persistence
                    if ((sceneToken.metadata[`${Constants.EXTENSIONID}/visionInAngle`] !== 360
                        || sceneToken.metadata[`${Constants.EXTENSIONID}/visionInAngle`] !== 360)
                        && this.IsPositionAndRotationClear(sceneToken.rotation, sceneToken.position))
                    {
                        this.AddPersistentLightToQueue(sceneToken, sceneTokenDepth)
                    }
                }
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

        // DarkVision should be deleted with the owning token, but just in case for local cleanup
        const localDarkVisions = BSCACHE.sceneLocal.filter(x => isDarkVision(x)) as Effect[];
        for (const darkvision of localDarkVisions)
        {
            const exists = sceneVisionTokens.find(x => x.id === darkvision.metadata[`${Constants.EXTENSIONID}/isDarkVision`]) as Image;
            if (!exists) this.decalsToDelete.push(darkvision.id);
            else
            {
                if (parseInt(exists.metadata[`${Constants.EXTENSIONID}/visionDark`] as string) < parseInt(exists.metadata[`${Constants.EXTENSIONID}/visionRange`] as string))
                    this.decalsToDelete.push(darkvision.id);
            }
        }

        // Add, Update and Delete
        if (this.lightsToCreate.length > 0)
        {
            await OBR.scene.local.addItems(this.lightsToCreate);
        }
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
                        light.metadata[`${Constants.EXTENSIONID}/visionBlind`] = mine.blind;
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

        // Add, Update and Delete
        if (this.darkVisionToCreate.length > 0)
            await OBR.scene.local.addItems(this.darkVisionToCreate);
        if (this.darkVisionToDelete.length > 0)
            await OBR.scene.local.deleteItems(this.darkVisionToDelete);
        if (this.darkVisionToUpdate.length > 0)
            await OBR.scene.local.updateItems(localDarkVisions.filter(x => !this.darkVisionToDelete.includes(x.id)), (darkvisions) =>
            {
                for (let dark of darkvisions)
                {
                    const mine = this.darkVisionToUpdate.find(x => x.id === dark.id)
                    if (mine)
                    {
                        dark.width = mine.size;
                        dark.height = mine.size;
                    }
                }
            });

        this.lightsToCreate = [];
        this.lightsToUpdate = [];
        this.lightsToDelete = [];

        this.decalsToCreate = [];
        this.decalsToDelete = [];
        this.decalsToUpdate = [];

        this.darkVisionToCreate = [];
        this.darkVisionToUpdate = [];
        this.darkVisionToDelete = [];
    }

    private async UpdateWalls()
    {
        const elevationMappings = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/elevationMapping`] as ElevationMap[] ?? [];
        const wallPass = (BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/passWallsGM`] === true && BSCACHE.playerRole === "GM");

        // Find all of the REAL fog lines to be recreated as local walls
        const sceneVisionLines = BSCACHE.sceneItems.filter(x => (isVisionLineAndEnabled(x))) as Curve[];
        for (const visionLine of sceneVisionLines)
        {
            // Do an error check to call out bad walls
            if (visionLine.type !== "CURVE" || visionLine.points === undefined)
            {
                this.wallsToError.push(visionLine.id);
                continue;
            }

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
                const equalRotation = visionLine.rotation === existingLine.rotation;
                const equalScale = (visionLine.scale.x === existingLine.scale.x && visionLine.scale.y === existingLine.scale.y);
                const equalPosition = (visionLine.position.x === existingLine.position.x && visionLine.position.y === existingLine.position.y);
                const equalSides = visionLine.metadata[`${Constants.EXTENSIONID}/doubleSided`] === existingLine.doubleSided;
                const equalDepth = this.GetDepth(visionLineDepth, true) === existingLine.zIndex;

                let equalBlock = (wallPass ? false : visionLine.metadata[`${Constants.EXTENSIONID}/blocking`])
                    === existingLine.blocking;

                if (!equalPoints || !equalPosition || !equalRotation || !equalScale || !equalBlock || !equalSides || !equalDepth)
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
                        line.rotation = mine.rotation;
                        line.scale = mine.scale;
                        line.blocking = mine.blocking;
                        line.doubleSided = mine.doubleSided;
                        line.zIndex = mine.zIndex;
                    }
                }
            });
        if (this.wallsToError.length > 0)
            await OBR.scene.items.updateItems<Curve>(this.wallsToError, lines =>
            {
                for (let line of lines)
                {
                    line.style.strokeDash = [10, 30];
                    line.style.strokeColor = "red";
                    delete line.metadata[`${Constants.EXTENSIONID}/isDoorLocked`];
                    delete line.metadata[`${Constants.EXTENSIONID}/doorOpen`];
                    delete line.metadata[`${Constants.EXTENSIONID}/disabled`];
                    delete line.metadata[`${Constants.EXTENSIONID}/isDoor`];
                    delete line.metadata[`${Constants.EXTENSIONID}/doubleSided`];
                    delete line.metadata[`${Constants.EXTENSIONID}/disabled`];
                    delete line.metadata[`${Constants.EXTENSIONID}/isVisionLine`];
                    delete line.metadata[`${Constants.EXTENSIONID}/blocking`];
                }
            });

        this.wallsToCreate = [];
        this.wallsToUpdate = [];
        this.wallsToDelete = [];
        this.wallsToError = [];
    }

    private CreateWallToQueue(line: Curve, depth: number)
    {
        if (!line.points) return; //Let's just avoid any issues of this not being a line

        // We are making a mirror of the wall, that we can identify which one it's replicating
        let blockWall = line.metadata[`${Constants.EXTENSIONID}/blocking`] as boolean ?? false;
        if (BSCACHE.playerRole === "GM" && BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/passWallsGM`] === true)
        {
            blockWall = false;
        }
        const item = buildWall()
            .points(line.points)
            .rotation(line.rotation)
            .position(line.position)
            .locked(true)
            .scale(line.scale)
            .blocking(blockWall)
            .doubleSided(line.metadata[`${Constants.EXTENSIONID}/doubleSided`] as boolean ?? false)
            .zIndex(this.GetDepth(depth, true))
            .metadata({ [`${Constants.EXTENSIONID}/isVisionWall`]: line.id })
            .build();

        this.wallsToCreate.push(item);
    }

    private AddPersistentLightToQueue(token: Item, depth: number)
    {
        // The trade off issue is, PRIMARY Persistent lights will re-trigger Secondary.
        // AUXILIARY Persisent lights will not re-trigger.
        // If a torch is in a CLOSED room, and the player walks by the door and leaves - a PRIMARY persistent light will trigger the torch when the door is open. (When the player is not there.)
        // If a torch is in an OPEN room, and the walks by the door - the AUXILIARY persistent light will trigger, but when they leave, the vision will be lost.
        // Both types have their issues and there is no current path to having a properly cut light persist in the right way.
        const lightType = token.metadata[`${Constants.EXTENSIONID}/isTorch`] === true ? "SECONDARY" : "PRIMARY";
        if (lightType === "SECONDARY") return;

        const persistenceItem = buildLight()
            .position(token.position)
            .lightType("AUXILIARY")
            .rotation(token.rotation)
            .attenuationRadius(this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? GetVisionRangeDefault()))
            .sourceRadius(this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string ?? GetSourceRangeDefault(), true))
            .falloff(parseFloat(token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string ?? GetFalloffRangeDefault()))
            .innerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string ?? GetInnerAngleDefault()))
            .outerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string ?? GetOuterAngleDefault()))
            .zIndex(this.GetDepth(depth, false))
            .metadata({ [`${Constants.EXTENSIONID}/isPersistentLight`]: token.id })
            .build();

        this.lightsToCreate.push(persistenceItem);
        this.persistentLights.push({
            id: persistenceItem.id,
            position: persistenceItem.position,
            rotation: persistenceItem.rotation,
            zIndex: depth, // This is for when it's re-calculated on load
            metadata: token.metadata
        });

        // If we hit our limit, remove from the bottom of the stack
        if (this.persistenceLimit === this.persistentLights.length)
        {
            const removedPLight = this.persistentLights.shift()!;
            this.lightsToDelete.push(removedPLight.id);
        }
    }

    private CreateLightToQueue(token: Item, depth: number)
    {
        // We are 'light' to follow the token around, that we can identify which one it's replicating
        const lightType = token.metadata[`${Constants.EXTENSIONID}/isTorch`] === true ? "SECONDARY" : "PRIMARY";
        const visionRange = token.metadata[`${Constants.EXTENSIONID}/visionBlind`] === true ?
            0 : this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? GetVisionRangeDefault());

        const useDarkVision = parseInt(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string)
            > parseInt(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string);
        const darkVisionRange = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string);

        const item = buildLight()
            .position(token.position)
            .rotation(token.rotation)
            .lightType(lightType)
            .attenuationRadius(useDarkVision ? darkVisionRange : visionRange)
            .sourceRadius(this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string ?? GetSourceRangeDefault(), true))
            .falloff(parseFloat(token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string ?? GetFalloffRangeDefault()))
            .innerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string ?? GetInnerAngleDefault()))
            .outerAngle(parseInt(token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string ?? GetOuterAngleDefault()))
            .zIndex(this.GetDepth(depth, false))
            .metadata({
                [`${Constants.EXTENSIONID}/isVisionLight`]: token.id,
                [`${Constants.EXTENSIONID}/visionBlind`]: token.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean ?? false
            })
            .attachedTo(token.id)
            .disableAttachmentBehavior(["SCALE"])
            .build();

        this.lightsToCreate.push(item);

        if (lightType === "PRIMARY")
        {
            this.CreateDarkVisionToQueue(token);
            this.CreateOwnerHighlight(token);
            this.CreateTrailingFogRevealer(item);
        }
    }

    private CreateDarkVisionToQueue(token: Item)
    {
        const darkMeta = parseInt(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string);
        const visionMeta = parseInt(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string);
        if (!darkMeta || !visionMeta || (darkMeta < visionMeta)) return;

        const visionDistance = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string) * 2;
        const darkVisionDistance = this.GetLightRange(token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string) * 2;
        const clearView = ((visionDistance * .9) / darkVisionDistance) / 2; // This cuts the vision back slightlyh to fuzz the edge easier

        const darkVision = buildEffect()
            .position(
                {
                    x: token.position.x - (darkVisionDistance / 2),
                    y: token.position.y - (darkVisionDistance / 2)
                })
            .attachedTo(token.id)
            .width(darkVisionDistance)
            .height(darkVisionDistance)
            .blendMode("SATURATION")
            .effectType("STANDALONE")
            //.layer("POST_PROCESS") - This seems to cause the square to render black, unsure how to use yet.
            .attachedTo(token.id)
            .sksl(Constants.DARKVISIONSHADER)
            .metadata({ [`${Constants.EXTENSIONID}/isDarkVision`]: true })
            .disableHit(true)
            .disableAttachmentBehavior(["SCALE"])
            .uniforms([
                { name: "center", value: { x: 0.5, y: 0.5 } }, // Center of the circle in normalized coordinates
                { name: "radius", value: .5 }, // Radius of the circle in normalized units
                { name: "clear", value: clearView },
                { name: "smoothwidth", value: 0.075 }
            ])
            .build();

        this.darkVisionToCreate.push(darkVision);
    }

    private CreateDecalToQueue(token: Image)
    {
        // Fog layer/visible allows for a perfect fog cutout to select the token beneath
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
            .rotation(token.rotation)
            .position(token.position)
            .attachedTo(token.id)
            .layer("FOG")
            .visible(false)
            .metadata({
                [`${Constants.EXTENSIONID}/isLocalDecal`]: token.id
            })
            .disableHit(true)
            .build();

        this.decalsToCreate.push(item);
    }

    private UpdateWallToQueue(scenelLine: Curve, localWall: Wall, depth: number)
    {
        if (!scenelLine.points) return; //Let's just avoid any issues of this not being a line

        let blockWall = scenelLine.metadata[`${Constants.EXTENSIONID}/blocking`] as boolean ?? false;
        if (BSCACHE.playerRole === "GM" && BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/passWallsGM`] === true)
        {
            blockWall = false;
        }

        const update = {
            id: localWall.id,
            points: scenelLine.points,
            rotation: scenelLine.rotation,
            position: scenelLine.position,
            scale: scenelLine.scale,
            blocking: blockWall,
            doubleSided: scenelLine.metadata[`${Constants.EXTENSIONID}/doubleSided`] as boolean ?? false,
            zIndex: this.GetDepth(depth, true)
        };
        this.wallsToUpdate.push(update);
    }

    private UpdateLightToQueue(sceneToken: Item, localLight: Light, depth: number)
    {
        const lightType = sceneToken.metadata[`${Constants.EXTENSIONID}/isTorch`] === true ? "SECONDARY" : "PRIMARY";
        const visionRange = sceneToken.metadata[`${Constants.EXTENSIONID}/visionBlind`] === true ?
            0 : this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionRange`] as string ?? GetVisionRangeDefault());
        const useDarkVision = parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionDark`] as string)
            > parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionRange`] as string);
        const darkVisionRange = this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionDark`] as string);

        const update = {
            id: localLight.id,
            attenuationRadius: useDarkVision ? darkVisionRange : visionRange,
            sourceRadius: this.GetLightRange(sceneToken.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string ?? GetSourceRangeDefault(), true),
            falloff: parseFloat(sceneToken.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string ?? GetFalloffRangeDefault()),
            innerAngle: parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string ?? GetInnerAngleDefault()),
            outerAngle: parseInt(sceneToken.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string ?? GetOuterAngleDefault()),
            blind: sceneToken.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean ?? false,
            zIndex: this.GetDepth(depth, false)
        };
        this.lightsToUpdate.push(update);
        if (lightType === "PRIMARY")
        {
            this.UpdateOwnerHightlight(sceneToken);
        }
    }

    private GetLightRange(distance: string, asFloat = false)
    {
        const numDistance = asFloat ? parseFloat(distance) : parseInt(distance);
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

    private IsPositionAndRotationClear(rotation: number, position: Vector2): boolean
    {
        const griddedDistance = (BSCACHE.gridDpi - 10) * this.persistenceCullingDistance;
        for (const light of this.persistentLights)
        {
            const distance = Utilities.distanceBetween(position, light.position);
            if (distance <= griddedDistance)
            {
                if (rotation === light.rotation)
                    return false;
            }
        }
        return true;
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