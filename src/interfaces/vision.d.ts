interface ObstructionLine
{
    startPosition: Vector2,
    endPosition: Vector2,
    originalShape: any,
    oneSided: string
}

interface Polygon
{
    pointset: Vector2[],
    fromShape: any
}