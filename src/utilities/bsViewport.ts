import OBR, { isCurve, isImage } from "@owlbear-rodeo/sdk";
import { BSCACHE } from "./bsSceneCache";

export class ViewportFunctions
{
    /**
     * Center the current OBR viewport on an image
     */
    static async CenterViewportOnImage(tokenId: any)
    {
        const ctu = BSCACHE.sceneItems.find(x => x.id === tokenId);
        const dpi = await OBR.scene.grid.getDpi();
        const scale = await OBR.viewport.getScale();
        const viewportWidth = await OBR.viewport.getWidth();
        const viewportHeight = await OBR.viewport.getHeight();
        const viewportCenter = { x: viewportWidth / 2, y: viewportHeight / 2 };
        // Scale the viewport center to match the items coordinate space
        const relativeViewportCenter = {
            x: viewportCenter.x / scale,
            y: viewportCenter.y / scale,
        };

        const imageCenter = await this.GetImageCenter(ctu, dpi);
        // Offset the image to find out what viewport position would center it
        const center = {
            x: imageCenter.x - relativeViewportCenter.x,
            y: imageCenter.y - relativeViewportCenter.y,
        };

        // Scale and invert the position to match the viewport's offset direction
        const position = {
            x: center.x * scale * -1,
            y: center.y * scale * -1,
        };

        await OBR.viewport.animateTo({
            position,
            scale,
        });
    }

    /**
     * Get the center for an OBR image
     * @param {import("@owlbear-rodeo/sdk").Image} item - The image item
     * @param {number} dpi - The base DPI of the scene
     * @returns {import("@owlbear-rodeo/sdk").Vector2}
     */
    static async GetImageCenter(ctu: any, dpi: number)
    {
        if (isImage(ctu))
        {
            const dpiScale = dpi / ctu.grid.dpi;
            const width = ctu.image.width * dpiScale;
            const height = ctu.image.height * dpiScale;
            const offsetX = (ctu.grid.offset.x / ctu.image.width) * width;
            const offsetY = (ctu.grid.offset.y / ctu.image.height) * height;
            return {
                x: ctu.position.x - offsetX + width / 2,
                y: ctu.position.y - offsetY + height / 2,
            };
        }
        else if (isCurve(ctu) && ctu.points.length > 0)
        {
            // Curve has no Position
            return {
                x: ctu.points[0].x,
                y: ctu.points[0].y
            }
        }
        else
        {
            // Text - Shape - Line - Path - Ruler
            return {
                x: ctu.position.x,
                y: ctu.position.y
            }
        }
    }
}
