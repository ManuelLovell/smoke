export function distance(P1: { x: number; y: number; }, P2: { x: number; y: number; })
{
    return Math.sqrt((P1.x - P2.x) * (P1.x - P2.x) + (P1.y - P2.y) * (P1.y - P2.y));
}

export function squareDistance(P1: { x: number; y: number; }, P2: { x: number; y: number; })
{
    return (P1.x - P2.x) * (P1.x - P2.x) + (P1.y - P2.y) * (P1.y - P2.y);
}

export function comparePosition(p1: { x: any; y: any; }, p2: { x: any; y: any; })
{
    return p1.x == p2.x && p1.y == p2.y;
}

export function isClose(x1: number, x2: number, tol?: number)
{
    if (tol === undefined)
        tol = 0.01;
    return Math.abs(x1 - x2) <= tol;
}

export function mod(n: number, m: number)
{
    return ((n % m) + m) % m;
}
