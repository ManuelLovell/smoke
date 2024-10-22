import OBR, { buildEffect, Image } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";

export async function ApplyEnhancedFog(fogMap: Image, style: string)
{
    // Search for old fog effects
    const oldEffect = await OBR.scene.local.getItems(x => x.metadata[`${Constants.EXTENSIONID}/isFogEffect`] === fogMap.id);
    if (oldEffect.length > 0)
    {
        await OBR.scene.local.deleteItems(oldEffect.map(x => x.id));
    }
    if (style === "SPOOKY")
        await ApplySpookyFog(fogMap);
    else if (style === "FOGGY")
        await ApplyFoggyFog(fogMap);
    else if (style === "COSMIC")
        await ApplyCosmicFog(fogMap);
}

async function ApplyCosmicFog(enhancedFogMap: Image)
{
    const fogEffects = buildEffect()
        .scale(enhancedFogMap.scale)
        .rotation(enhancedFogMap.rotation)
        .attachedTo(enhancedFogMap.id)
        //.blendMode("MULTIPLY")
        .effectType("ATTACHMENT")
        .layer("FOG")
        .metadata({
            [`${Constants.EXTENSIONID}/isFogEffect`]: enhancedFogMap.id
        })
        .sksl(Constants.COSMICSHADER)
        .disableHit(true)
        .zIndex(-0.5)
        .build();
    await OBR.scene.local.addItems([fogEffects]);
}

async function ApplySpookyFog(enhancedFogMap: Image)
{
    const fogEffects = buildEffect()
        .scale(enhancedFogMap.scale)
        .rotation(enhancedFogMap.rotation)
        .attachedTo(enhancedFogMap.id)
        .blendMode("MULTIPLY")
        .effectType("ATTACHMENT")
        .layer("FOG")
        .metadata({
            [`${Constants.EXTENSIONID}/isFogEffect`]: enhancedFogMap.id
        })
        .sksl(Constants.SPOOKYSHADER)
        .disableHit(true)
        .zIndex(-0.5)
        .build();
    await OBR.scene.local.addItems([fogEffects]);
}

async function ApplyFoggyFog(enhancedFogMap: Image)
{
    const fogEffects = buildEffect()
        .scale(enhancedFogMap.scale)
        .rotation(enhancedFogMap.rotation)
        .attachedTo(enhancedFogMap.id)
        //.blendMode("SCREEN")
        .effectType("ATTACHMENT")
        .layer("FOG")
        .metadata({
            [`${Constants.EXTENSIONID}/isFogEffect`]: enhancedFogMap.id
        })
        .sksl(Constants.FOGGYSHADER)
        .disableHit(true)
        .zIndex(-0.5)
        .build();
    await OBR.scene.local.addItems([fogEffects]);
}