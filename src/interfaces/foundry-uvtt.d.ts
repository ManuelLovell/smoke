interface FoundryUVTT
{
    name: string;
    width: number;
    height: number;
    grid: number;
    shiftX: number;
    shiftY: number;
    gridDistance: number;
    gridUnits: string;
    padding: number;
    gridColor: string;
    gridAlpha: number;
    globalLight: boolean;
    darkness: number;
    lights: FoundryLight[];
    walls: FoundryWall[];
    img: string | null;
    foreground: string | null;
}

interface FoundryLight
{
    x: number;
    y: number;
    dim: number;
    bright: number;
    tintColor: string;
    tintAlpha: number;
}

interface FoundryWall
{
    c: [number, number, number, number];  // [x1, y1, x2, y2]
    move: number;    // 0 or 1
    sense: number;   // 0 or 1
    sound: number;   // 0 or 1
    door: number;    // 0 or 1
}