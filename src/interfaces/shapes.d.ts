interface Polygon 
{
    pointset: pointset,
    fromShape: line.originalShape
}

interface Detail
{
    awaitTimer: Timer;
    computeTimer: Timer;
    allItems: Image[];
    size: number[];
    offset: number[];
    scale: number[];
    tokensWithVision: Image[];
    visionShapes: Image[];
    invalidateCache: boolean;
}