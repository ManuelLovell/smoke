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
    const tempPath = PathKit.NewPath().rect(mapOffset[0], mapOffset[1], mapSize[0], mapSize[1]);
    pathBuilder.add(tempPath, PathKit.PathOp.UNION);
    tempPath.delete();

    for (const polygon of polygons)
    {
        const shape = polygon.fromShape;
        const newPath = PathKit.NewPath();

        newPath.moveTo(polygon.pointset[0].x, polygon.pointset[0].y);
        for (let j = 1; j < polygon.pointset.length; j++)
        {
            newPath.lineTo(polygon.pointset[j].x, polygon.pointset[j].y);
        }
        newPath.closePath();

        if (shape.style.closed !== false)
        {
            const shapePath = PathKit.NewPath();
            shapePath.moveTo(shape.points[0].x * shape.scale.x + shape.position.x, shape.points[0].y * shape.scale.y + shape.position.y);
            for (let i = 1; i < shape.points.length - 1; i++)
            {
                shapePath.lineTo(shape.points[i].x * shape.scale.x + shape.position.x, shape.points[i].y * shape.scale.y + shape.position.y);
            }
            shapePath.closePath();
            newPath.op(shapePath, PathKit.PathOp.DIFFERENCE);
            shapePath.delete();
        }
        
        pathBuilder.add(newPath, PathKit.PathOp.DIFFERENCE);
        newPath.delete();
    }
    const path = pathBuilder.resolve();
    path.simplify();
    
    const svgPath = path.toCmds();
    path.delete();
    pathBuilder.delete();
    self.postMessage({numb: numb, messageData: svgPath});
};