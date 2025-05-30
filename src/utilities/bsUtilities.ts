import OBR, { Theme, Image, Vector2, Curve, Wall, Player, Metadata } from "@owlbear-rodeo/sdk";
import { BSCACHE } from "./bsSceneCache";
import { Vector3 } from "@owlbear-rodeo/sdk/lib/types/Vector3";
import { Constants, PathCommands } from "./bsConstants";
import simplify from "simplify-js";

export function IsNumber(value: string): boolean
{
    return !isNaN(Number(value)) && value.trim() !== "";
}

export function Sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function IsMetadataNumber(metadata: Metadata, key: string): boolean
{
    if (!metadata || !key) return false // No key or data? Bad.
    const mdValue = metadata[key];
    if (!mdValue || typeof mdValue !== "string") return false; // No value or not a string? Bad.

    return !isNaN(Number(mdValue)) && mdValue.trim() !== "";
}

export async function ConvertToWebP(blob: Blob, quality = 0.8, endWidth: number, endHeight: number): Promise<Blob | null>
{
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d')!;
    canvas.width = endWidth;
    canvas.height = endHeight;
    ctx.drawImage(
        img,
        0, 0, img.width, img.height,  // Source rectangle
        0, 0, endWidth, endHeight  // Destination rectangle
    );

    return new Promise((resolve) =>
    {
        canvas.toBlob((webpBlob) =>
        {
            resolve(webpBlob);
        }, 'image/webp', quality);
    });
}

export function GetPersistentLocalKey()
{
    return `${Constants.EXTENSIONID}/Persistence/${BSCACHE.playerId}/${BSCACHE.sceneId}`;
}

export async function HardwareWarning(self: boolean, party?: Player[])
{
    const showWarning = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/showWarnings`] === undefined ? true : BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/showWarnings`] === true;
    if (showWarning)
    {
        if (self)
        {
            await OBR.notification.show("Your browser may have Hardware Acceleration disabled.  Fog and other effects requiring Hardware Acceleration may not display correctly.", "WARNING");
            await OBR.action.setBadgeText("⚠️");
            await OBR.action.setBadgeBackgroundColor("black");
        }
        else if (party)
        {
            const warnedPlayers = party.filter(player => player.metadata[`${Constants.EXTENSIONID}/hardwareAcceleration`] !== true);
            if (warnedPlayers.length > 0) await OBR.notification.show(`Player(s) [${warnedPlayers.map(x => x.name).join(", ")}] may have Hardware Acceleration disabled on their browsers. Fog and other effects may not display properly for them.`, "WARNING");
        }
    }
}

export function IsHardwareAccelerationEnabled(): { hasHardwareAcceleration: boolean; reason?: string }
{
    try
    {
        // Create an offscreen canvas for testing
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        // Test 1: Check for software rendering in WebGL
        const gl = canvas.getContext('webgl');
        if (gl)
        {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo)
            {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);

                // Check for known software rendering indicators
                const softwareRenderers = [
                    'swiftshader',
                    'llvmpipe',
                    'software',
                    'virtualbox',
                    'microsoft basic render'
                ];

                if (renderer && softwareRenderers.some(sr =>
                    renderer.toLowerCase().includes(sr)))
                {
                    return {
                        hasHardwareAcceleration: false,
                        reason: `Software rendering detected: ${renderer}`
                    };
                }
            }
        }

        // Test 2: Performance-based detection for transform animations
        const div = document.createElement('div');
        div.style.cssText = `
            position: absolute;
            left: -9999px;
            width: 100px;
            height: 100px;
            transform: translateZ(0);
            backface-visibility: hidden;
        `;
        document.body.appendChild(div);

        let start = performance.now();
        const iterations = 100;

        // Force multiple repaints with 3D transforms
        for (let i = 0; i < iterations; i++)
        {
            div.style.transform = `translate3d(0, 0, ${i}px)`;
            // Force layout recalculation
            void div.offsetHeight;
        }

        const duration = performance.now() - start;
        document.body.removeChild(div);

        // If transforms are taking too long, likely software rendering
        if (duration > 500)
        { // More than 500ms for 100 iterations suggests software rendering
            return {
                hasHardwareAcceleration: false,
                reason: `Transform performance indicates software rendering (${duration.toFixed(2)}ms)`
            };
        }

        // Test 3: Canvas acceleration test
        const ctx = canvas.getContext('2d');
        if (ctx)
        {
            start = performance.now();

            // Perform operations that should be hardware accelerated
            for (let i = 0; i < 50; i++)
            {
                ctx.filter = `blur(${i % 5}px)`;
                ctx.fillStyle = `rgba(${i}, ${i}, ${i}, 0.5)`;
                ctx.fillRect(0, 0, 100, 100);
            }

            const imageData = ctx.getImageData(0, 0, 100, 100);
            const canvasDuration = performance.now() - start;

            if (canvasDuration > 300)
            { // More than 300ms suggests software rendering
                return {
                    hasHardwareAcceleration: false,
                    reason: `Canvas performance indicates software rendering (${canvasDuration.toFixed(2)}ms)`
                };
            }
        }

        // Additional check for Chrome-based browsers
        if (navigator.userAgent.includes('Chrome') ||
            navigator.userAgent.includes('Vivaldi'))
        {
            const canvas2 = document.createElement('canvas');
            const ctx2 = canvas2.getContext('2d');

            if (ctx2)
            {
                // Test for specific color handling that differs in software mode
                ctx2.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx2.fillRect(0, 0, 1, 1);
                const pixel = ctx2.getImageData(0, 0, 1, 1).data;

                // In software rendering, color handling can be different
                if (pixel[3] !== 26)
                { // Expected value when hardware accelerated
                    return {
                        hasHardwareAcceleration: false,
                        reason: 'Color handling indicates software rendering'
                    };
                }
            }
        }

        return {
            hasHardwareAcceleration: true
        };

    } catch (e: any)
    {
        console.warn('Error during hardware acceleration detection:', e);
        return {
            hasHardwareAcceleration: false,
            reason: `Detection error: ${e.message}`
        };
    }
}

export function GetPatreonButton()
{
    const newImgElement = document.createElement('img');
    newImgElement.id = "PatreonButton";
    newImgElement.setAttribute('class', 'icon');
    newImgElement.classList.add('patreon-clickable');
    newImgElement.setAttribute('title', BSCACHE.USER_REGISTERED ? 'Thanks for subscribing!' : 'Get the news on updates on the Battle-System Patreon');
    newImgElement.setAttribute('src', BSCACHE.USER_REGISTERED ? '/w-thankyou.svg' : '/w-patreon-2.png');
    newImgElement.onclick = async function (e)
    {
        e.preventDefault();
        window.open("https://www.patreon.com/battlesystem", "_blank");
    }

    return newImgElement;
}

export function ConvertPathCommands(
    pathCommands: number[][],
    currentPosition: Vector2,
    config: PathConfig = { curveSegments: 10 }
): Vector2[]
{
    const vectorArray: Vector2[] = [];
    const { curveSegments } = config;

    const estimatedPoints = pathCommands.length * curveSegments;
    vectorArray.length = estimatedPoints;
    let currentIndex = 0;

    function addPoint(x: number, y: number): void
    {
        if (currentIndex < estimatedPoints)
        {
            vectorArray[currentIndex] = { x: x + currentPosition.x, y: y + currentPosition.y };
            currentIndex++;
        } else
        {
            vectorArray.push({ x: x + currentPosition.x, y: y + currentPosition.y });
        }
    }

    for (const command of pathCommands)
    {
        if (command.length < 1)
        {
            throw new Error(`Invalid command array: empty array`);
        }

        const commandType = command[0];

        // Validate command length based on type
        const expectedLength = {
            [PathCommands.MOVE]: 3,  // type, x, y
            [PathCommands.LINE]: 3,  // type, x, y
            [PathCommands.QUAD]: 5,  // type, x1, y1, x2, y2
            [PathCommands.CONIC]: 6, // type, x1, y1, x2, y2, w
            [PathCommands.CUBIC]: 7, // type, x1, y1, x2, y2, x3, y3
            [PathCommands.CLOSE]: 1  // type only
        }[commandType];

        if (expectedLength === undefined)
        {
            throw new Error(`Unknown command type: ${commandType}`);
        }

        if (command.length !== expectedLength)
        {
            throw new Error(`Invalid command length for type ${commandType}: expected ${expectedLength}, got ${command.length}`);
        }

        switch (commandType)
        {
            case PathCommands.MOVE: {
                const [_, x, y] = command;
                addPoint(x, y);
                break;
            }

            case PathCommands.LINE: {
                const [_, x, y] = command;
                addPoint(x, y);
                break;
            }

            case PathCommands.QUAD: {
                const [_, x1, y1, x2, y2] = command;
                const lastPoint = vectorArray[currentIndex - 1];
                if (!lastPoint) throw new Error('No starting point for QUAD command');

                const p0 = { x: lastPoint.x - currentPosition.x, y: lastPoint.y - currentPosition.y };
                const p1 = { x: x1, y: y1 };
                const p2 = { x: x2, y: y2 };

                for (let i = 1; i <= curveSegments; i++)
                {
                    const t = i / curveSegments;
                    const point = quadraticBezier(t, p0, p1, p2);
                    addPoint(point.x, point.y);
                }
                break;
            }

            case PathCommands.CONIC: {
                const [_, x1, y1, x2, y2, w] = command;
                const lastPoint = vectorArray[currentIndex - 1];
                if (!lastPoint) throw new Error('No starting point for CONIC command');

                const p0 = { x: lastPoint.x - currentPosition.x, y: lastPoint.y - currentPosition.y };
                const p1 = { x: x1, y: y1 };
                const p2 = { x: x2, y: y2 };

                for (let i = 1; i <= curveSegments; i++)
                {
                    const t = i / curveSegments;
                    const point = conicBezier(t, p0, p1, p2, w);
                    addPoint(point.x, point.y);
                }
                break;
            }

            case PathCommands.CUBIC: {
                const [_, x1, y1, x2, y2, x3, y3] = command;
                const lastPoint = vectorArray[currentIndex - 1];
                if (!lastPoint) throw new Error('No starting point for CUBIC command');

                const p0 = { x: lastPoint.x - currentPosition.x, y: lastPoint.y - currentPosition.y };
                const p1 = { x: x1, y: y1 };
                const p2 = { x: x2, y: y2 };
                const p3 = { x: x3, y: y3 };

                for (let i = 1; i <= curveSegments; i++)
                {
                    const t = i / curveSegments;
                    const point = cubicBezier(t, p0, p1, p2, p3);
                    addPoint(point.x, point.y);
                }
                break;
            }

            case PathCommands.CLOSE: {
                if (currentIndex > 0)
                {
                    const firstPoint = vectorArray[0];
                    addPoint(firstPoint.x - currentPosition.x, firstPoint.y - currentPosition.y);
                }
                break;
            }
        }
    }

    vectorArray.length = currentIndex;
    return simplify(vectorArray);
}

const quadraticBezier = (t: number, p0: Vector2, p1: Vector2, p2: Vector2): Vector2 =>
{
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    return {
        x: uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
        y: uu * p0.y + 2 * u * t * p1.y + tt * p2.y
    };
};

const conicBezier = (t: number, p0: Vector2, p1: Vector2, p2: Vector2, w: number): Vector2 =>
{
    const u = 1 - t;
    const denom = u * u + 2 * u * t * w + t * t;
    return {
        x: (u * u * p0.x + 2 * u * t * w * p1.x + t * t * p2.x) / denom,
        y: (u * u * p0.y + 2 * u * t * w * p1.y + t * t * p2.y) / denom
    };
};

const cubicBezier = (t: number, p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2): Vector2 =>
{
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
};

export function TranslateVisionRange(distance: string)
{
    const distanceNumber = parseInt(distance) ?? 5;
    const newDistance = (distanceNumber / BSCACHE.gridScale) * BSCACHE.gridDpi;
    return newDistance;
}

export function distanceBetween(pos1: Vector2, pos2: Vector2): number
{
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function isPointInPolygon(point: Vector2, polygon: Vector2[]): boolean
{
    let inside = false;
    const n = polygon.length;
    let p1 = polygon[0];

    for (let i = 1; i <= n; i++)
    {
        const p2 = polygon[i % n];
        if (point.y > Math.min(p1.y, p2.y))
        {
            if (point.y <= Math.max(p1.y, p2.y))
            {
                if (point.x <= Math.max(p1.x, p2.x))
                {
                    if (p1.y != p2.y)
                    {
                        const xinters = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
                        if (p1.x == p2.x || point.x <= xinters)
                        {
                            inside = !inside;
                        }
                    }
                }
            }
        }
        p1 = p2;
    }

    return inside;
}

export function GetGUID(): string
{
    let d = new Date().getTime();
    const guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) =>
    {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
}

export function Debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void
{
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function debounced(...args: Parameters<T>): void
    {
        if (timeoutId)
        {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() =>
        {
            func(...args);
            timeoutId = undefined;
        }, delay);
    };
}

export function ThrottleWithTrailing<T extends (...args: any[]) => void>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void
{
    let lastFunc: number;
    let lastRan: number;
    return function (...args: Parameters<T>)
    {
        if (!lastRan)
        {
            func(...args);
            lastRan = Date.now();
        } else
        {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() =>
            {
                if ((Date.now() - lastRan) >= limit)
                {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

export function isObjectEmpty(obj: Record<string, any>): boolean
{
    for (const key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            return false;
        }
    }
    return true;
}

export function ArePointsEqual(item1: Curve, item2: Wall)
{
    const points1 = item1.points;
    const points2 = item2.points;

    // Check if both arrays have the same length
    if (points1.length !== points2.length)
    {
        return false;
    }

    // Compare each point in the arrays
    for (let i = 0; i < points1.length; i++)
    {
        if (points1[i].x !== points2[i].x || points1[i].y !== points2[i].y)
        {
            return false;
        }
    }

    // If all points match, return true
    return true;
}

function deepEqual(obj1: any, obj2: any, ignoreKeys: string[] = []): boolean
{
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null)
    {
        return false;
    }

    const keys1 = Object.keys(obj1).filter(key => !ignoreKeys.includes(key));
    const keys2 = Object.keys(obj2).filter(key => !ignoreKeys.includes(key));

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1)
    {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key], ignoreKeys)) return false;
    }

    return true;
}

export function ImagesAreEqual(image1: Image, image2: Image): boolean
{
    const ignoreKeys = ['lastModified', 'lastModifiedUserId'];

    return deepEqual(image1, image2, ignoreKeys);
}

export function isObjectOver14KB(obj: any, extra?: any): boolean
{
    let jsonString = JSON.stringify(obj);
    if (extra)
    {
        const extraString = JSON.stringify(extra);
        jsonString = jsonString + extraString;
    }

    const byteLength = new TextEncoder().encode(jsonString).length;

    return byteLength > 14384;
}

// Function to compare two arrays of Image objects while ignoring specific keys
export function ImageArraysAreEqual(array1: Image[], array2: Image[]): boolean
{
    const ignoreKeys = ['lastModified', 'lastModifiedUserId'];

    if (array1.length !== array2.length) return false;

    for (let i = 0; i < array1.length; i++)
    {
        if (!deepEqual(array1[i], array2[i], ignoreKeys)) return false;
    }

    return true;
}

export function ApplyUpdatesToGhostArray(mainList: Image[], updates: Image[]): void
{
    updates.forEach(update =>
    {
        // Find the index of the item in the main list by ID
        const index = mainList.findIndex(item => item.id === update.id);

        if (index !== -1)
        {
            // If the item exists in the main list, update it
            mainList[index] = update;
        } else
        {
            // If the item doesn't exist in the main list, add it
            mainList.push(update);
        }
    });
}

export function HexToRgbShader(hex: string): Vector3
{
    // Remove the leading #
    hex = hex.replace(/^#/, '');

    // Convert the hex values to decimal (R, G, B)
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    // Normalize the values to a 0.0 - 1.0 range
    return {
        x: r / 255,
        y: g / 255,
        z: b / 255
    };
}

export function InvertColor(hex: any, blackwhite = false)
{
    if (hex.indexOf('#') === 0)
    {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3)
    {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6)
    {
        throw new Error('Invalid HEX color.');
    }
    var r: any = parseInt(hex.slice(0, 2), 16),
        g: any = parseInt(hex.slice(2, 4), 16),
        b: any = parseInt(hex.slice(4, 6), 16);
    if (blackwhite)
    {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str: any, len: number = 0)
{
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

export function SetThemeMode(theme: Theme, document: Document): void
{
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

    const darkTheme = darkThemeMq.matches ? "dark" : "light";
    const lightTheme = darkThemeMq.matches ? "light" : "dark";

    for (var s = 0; s < document.styleSheets.length; s++)
    {
        for (var i = 0; i < document.styleSheets[s].cssRules.length; i++)
        {
            let rule = document.styleSheets[s].cssRules[i] as CSSMediaRule;

            if (rule && rule.media && rule.media.mediaText.includes("prefers-color-scheme"))
            {
                if (theme.mode == "LIGHT")
                {
                    rule.media.appendMedium(`(prefers-color-scheme: ${darkTheme})`);

                    if (rule.media.mediaText.includes(lightTheme))
                    {
                        rule.media.deleteMedium(`(prefers-color-scheme: ${lightTheme})`);
                    }
                }
                else if (theme.mode == "DARK")
                {
                    rule.media.appendMedium(`(prefers-color-scheme: ${lightTheme})`);

                    if (rule.media.mediaText.includes(darkTheme))
                    {
                        rule.media.deleteMedium(`(prefers-color-scheme: ${darkTheme})`);
                    }
                }
            }
        }
    }
}