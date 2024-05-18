interface UVTT
{
    format: number; // decimal format version number

    resolution: {
        x: number; // width resolution
        y: number; // height resolution
        map_origin: {
            x: number; // usually 0
            y: number; // usually 0
        };
        map_size: {
            x: number; // size in squares (width)
            y: number; // size in squares (height)
        };
        pixels_per_grid: number; // number of pixels per square
    };

    line_of_sight: Array<Array<{ x: number; y: number }>>; // array of x,y values for line of sight
    objects_line_of_sight: Array<Array<{ x: number; y: number }>>; // array of x,y values per object for line of sight

    portals: Array<{
        position: {
            x: number;
            y: number;
        };
        bounds: Array<{ x: number; y: number }>;
        rotation: number; // radians
        closed: boolean;
        freestanding: boolean;
    }>;

    environment: {
        baked_lighting: boolean; // is lighting baked into this image?
        ambient_light: string; // ambient lighting color code hex
    };

    lights: Array<{
        position: { x: number; y: number };
        range: number;
        intensity: number;
        color: string; // light color code hex
        shadows: boolean;
    }>;
    image: string; // base64 encoded PNG or WEBP
}
