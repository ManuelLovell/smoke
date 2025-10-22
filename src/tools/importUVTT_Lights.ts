import { buildImage, Item } from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import { BSCACHE } from "../utilities/bsSceneCache";

export function ImportLights(lights: UVTTLight[] | FoundryLight[], importDpi: number, dpiRatio: number, offset: number[]) 
{
    // Create Torches
    if (lights?.length > 0)
    {
    const newItems: Item[] = [];
        for (const light of lights)
        {
            const uniLight = normalizeLight(light);
            // Dropping as bite-size transparent PNGs because the light-sources
            // are images baked into the map itself
            const torch = buildImage(
                {
                    height: 150,
                    width: 150,
                    url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Empty.png",
                    mime: "image/png",
                },
                { dpi: 300, offset: { x: 150, y: 150 } }
            )
                .position(
                    {
                        x: (uniLight.x * importDpi) * dpiRatio + offset[0],
                        y: (uniLight.y * importDpi) * dpiRatio + offset[1]
                    })
                .layer("PROP")
                .metadata({
                    [`${Constants.EXTENSIONID}/hasVision`]: true,
                    [`${Constants.EXTENSIONID}/isTorch`]: true,
                    [`${Constants.EXTENSIONID}/visionFallOff`]: uniLight.intensity,
                    [`${Constants.EXTENSIONID}/hiddenToken`]: true,
                    [`${Constants.EXTENSIONID}/visionRange`]: uniLight.range.toString(),
                })
                .name("Imported Light Source")
                .build();
            newItems.push(torch);
        }
        return newItems;
    }
}


// Helper function to normalize UVTTLight and FoundryLight
function normalizeLight(light: UVTTLight | FoundryLight)
{
    if ('position' in light)
    {
        // Handle UVTTLight
        return {
            x: light.position.x,
            y: light.position.y,
            range: light.range,
            intensity: constrain(light.intensity, 0, 10),
        };
    } else
    {
        // Handle FoundryLight
        return {
            x: light.x,
            y: light.y,
            range: light.dim,
            intensity: constrain((light.dim / light.bright), 0, 10),
        };
    }
}

// Confusing results..
// Confusing results..
// Confusing results..
function translateIntensity(inputValue: number): string
{
    if (!inputValue) return "0";
    // First, normalize the input from the original scale
    const originalMin = 1.0;
    const originalMax = 5.0;
    const targetMin = 2.0;
    const targetMax = 0.1;

    // Linear interpolation formula
    const normalizedValue = (inputValue - originalMin) / (originalMax - originalMin);
    const translatedValue = targetMin + (targetMax - targetMin) * (1 - normalizedValue);

    return translatedValue.toString();
}

function constrain(value: number, min: number, max: number): string
{
    return Math.max(min, Math.min(max, value)).toString();
}