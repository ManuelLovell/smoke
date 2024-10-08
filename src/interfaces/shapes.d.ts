interface Polygon 
{
    pointset: pointset,
    fromShape: line.originalShape
}

interface CutCurve
{
    extracted: Vector2[];
    remaining: Vector2[][];
}

// DELETE ?
// interface Detail
// {
//     awaitTimer: Timer;
//     computeTimer: Timer;
//     allItems: Image[];
//     size: number[];
//     offset: number[];
//     scale: number[];
//     tokensWithVision: Image[];
//     visionShapes: Image[];
//     invalidateCache: boolean;
// }