import OBR from "@owlbear-rodeo/sdk";
import { lineMode } from "./tools/visionLineMode";
import { polygonMode } from "./tools/visionPolygonMode";
import { brushMode } from "./tools/visionBrushMode";
import { Constants } from "./utilities/bsConstants";

export async function SetupTools(): Promise<void>
{
    // This is the tool the extension offers to draw vision liens
    await OBR.tool.create({
        id: `${Constants.EXTENSIONID}/vision-tool`,
        icons: [
            {
                icon: "/icon.svg",
                label: "Setup Vision",
            },
        ],
        async onClick()
        {
            await OBR.tool.activateTool(`${Constants.EXTENSIONID}/vision-tool`);
        },
    });

    // Create "add polygon" mode
    await OBR.tool.createMode({
        id: `${Constants.EXTENSIONID}/add-vision-polygon-mode`,
        icons: [
            {
                icon: "/object.svg",
                label: "Add Obstruction Object",
                filter: {
                    activeTools: [`${Constants.EXTENSIONID}/vision-tool`],
                },
            },
        ],
        onToolDown: polygonMode.onToolClick,
        onToolMove: polygonMode.onToolMove,
        onKeyDown: polygonMode.onKeyDown,
        preventDrag: { dragging: false }
    });

    // Create "add line" mode
    await OBR.tool.createMode({
        id: `${Constants.EXTENSIONID}/add-vision-line-mode`,
        icons: [
            {
                icon: "/line.svg",
                label: "Add Obstruction Line",
                filter: {
                    activeTools: [`${Constants.EXTENSIONID}/vision-tool`],
                },
            },
        ],
        onToolDown: lineMode.onToolClick, // Tool 'click' is slightly less responsive compared to check for the down state, clearly this wont allow dragging
        onToolMove: lineMode.onToolMove,
        onKeyDown: lineMode.onKeyDown,
        preventDrag: { dragging: false }
    });

    // Create "brush" mode
    await OBR.tool.createMode({
        id: `${Constants.EXTENSIONID}/add-vision-brush-mode`,
        icons: [
            {
                icon: "/brush.svg",
                label: "Paint Obstructions by Grid",
                filter: {
                    activeTools: [`${Constants.EXTENSIONID}/vision-tool`],
                },
            },
        ],
        onToolDown: brushMode.onActivate,
        onToolUp: brushMode.onDeactivate,
        onToolDragStart: brushMode.onDragStart,
        onToolDragMove: brushMode.onDragMove,
        onToolDragEnd: brushMode.onDragEnd,
        onToolDragCancel: brushMode.onDragCancel,
    });
}