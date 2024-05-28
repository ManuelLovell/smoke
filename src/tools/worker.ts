import PathKitInit from "pathkit-wasm/bin/pathkit";
import wasm from "pathkit-wasm/bin/pathkit.wasm?url";

const PathKit = await PathKitInit({ locateFile: () => wasm });

self.onerror = function (event)
{
    console.log("There was an error with the fog worker.");
    console.log(event);
};

self.onmessageerror = function (_event)
{
    console.log("Error on message event for fog worker.");
};

// Set the onmessage event handler within the worker constructor
self.onmessage = function (e)
{
    const { numb, polygons, mapOffset, mapSize } = e.data;
    const pathBuilder = new PathKit.SkOpBuilder();
    const mapPath = PathKit.NewPath().rect(mapOffset[0], mapOffset[1], mapSize[0], mapSize[1]);
    pathBuilder.add(mapPath, PathKit.PathOp.UNION);
    mapPath.delete();

    for (const polygon of polygons)
    {
        const shape = polygon.fromShape;
        const polygonPath = PathKit.NewPath();
        polygonPath.moveTo(polygon.pointset[0].x, polygon.pointset[0].y);
        for (let j = 1; j < polygon.pointset.length; j++)
        {
            polygonPath.lineTo(polygon.pointset[j].x, polygon.pointset[j].y);
        }
        polygonPath.closePath();

        if (shape.style.closed !== false)
        {
            const shapePath = PathKit.NewPath();
            shapePath.moveTo(shape.points[0].x * shape.scale.x + shape.position.x, shape.points[0].y * shape.scale.y + shape.position.y);
            for (let i = 1; i < shape.points.length - 1; i++)
            {
                shapePath.lineTo(shape.points[i].x * shape.scale.x + shape.position.x, shape.points[i].y * shape.scale.y + shape.position.y);
            }
            shapePath.closePath();
            polygonPath.op(shapePath, PathKit.PathOp.DIFFERENCE);
            shapePath.delete();
        }

        pathBuilder.add(polygonPath, PathKit.PathOp.DIFFERENCE);
        polygonPath.delete();
    }

    let path;
    try
    {
        path = pathBuilder.resolve();
    } catch (error)
    {
        console.error("Error resolving path:", error);
        self.postMessage({ numb, messageData: null });
        return;
    }

    path.simplify();
    const svgPath = path.toCmds();
    path.delete();
    pathBuilder.delete();

    self.postMessage({ numb, messageData: svgPath });
};