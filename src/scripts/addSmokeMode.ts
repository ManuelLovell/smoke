import OBR, { KeyEvent, Shape, ToolContext, ToolEvent, Vector2, buildShape } from "@owlbear-rodeo/sdk";

const SMOKE_Z_INDEX = -0.00001;

let interaction: [any, any] | [any] | null = null;
let dragStartPosition: Vector2 | null = null;

function applyRectangleBounds(shape: Shape, start: Vector2, end: Vector2): void
{
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const width = Math.max(Math.abs(end.x - start.x), 1);
    const height = Math.max(Math.abs(end.y - start.y), 1);

    shape.position = { x: minX, y: minY };
    shape.width = width;
    shape.height = height;
    shape.layer = "FOG";
    shape.shapeType = "RECTANGLE";
    shape.style.fillColor = "#000000";
    shape.style.fillOpacity = 1;
    shape.style.strokeWidth = 0;
    shape.disableAutoZIndex = true;
    shape.zIndex = SMOKE_Z_INDEX;
}

async function cancelInteraction(): Promise<void>
{
    if (!interaction)
    {
        dragStartPosition = null;
        return;
    }

    const [, stop] = interaction;
    stop();

    interaction = null;
    dragStartPosition = null;
}

async function onDragStart(_: ToolContext, event: ToolEvent): Promise<void>
{
    if (event.transformer)
    {
        return;
    }

    await cancelInteraction();

    dragStartPosition = event.pointerPosition;

    const smokeRectangle = buildShape()
        .shapeType("RECTANGLE")
        .position({ x: dragStartPosition.x, y: dragStartPosition.y })
        .width(1)
        .height(1)
        .fillColor("#000000")
        .fillOpacity(1)
        .strokeWidth(0)
        .layer("FOG")
        .name("Smoke")
        .disableAutoZIndex(true)
        .zIndex(SMOKE_Z_INDEX)
        .build();

    interaction = await OBR.interaction.startItemInteraction(smokeRectangle);
}

function onDragMove(_: ToolContext, event: ToolEvent): void
{
    if (!interaction || !dragStartPosition || event.transformer)
    {
        return;
    }

    const [update] = interaction;
    update((shape: Shape) =>
    {
        applyRectangleBounds(shape, dragStartPosition as Vector2, event.pointerPosition);
    });
}

async function onDragEnd(_: ToolContext, event: ToolEvent): Promise<void>
{
    if (!interaction || !dragStartPosition)
    {
        return;
    }

    const [update, stop] = interaction;
    const finalRectangle = update((shape: Shape) =>
    {
        applyRectangleBounds(shape, dragStartPosition as Vector2, event.pointerPosition);
    });

    stop();
    interaction = null;
    dragStartPosition = null;

    await OBR.scene.items.addItems([finalRectangle]);
}

async function onDragCancel(_: ToolContext, _event: ToolEvent): Promise<void>
{
    await cancelInteraction();
}

async function onKeyDown(_: ToolContext, event: KeyEvent): Promise<void>
{
    if (event.key === "Escape")
    {
        await cancelInteraction();
    }
}

export const addSmokeMode = { onDragStart, onDragMove, onDragEnd, onDragCancel, onKeyDown };
