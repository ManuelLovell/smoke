import { Command, Layer, PathCommand } from "@owlbear-rodeo/sdk";

export enum PathCommands
{
    MOVE = 0,
    LINE = 1,
    QUAD = 2,
    CONIC = 3,
    CUBIC = 4,
    CLOSE = 5
}

export class Constants
{
    static EXTENSIONID = "com.battle-system.smoke";
    static EXTENSIONNOTICE = "com.battle-system.smoke-notice";
    static RESETID = "com.battle-system.smoke-reset";
    static SPECTREID = "com.battle-system.spectre";
    static EXTENSIONWHATSNEW = "com.battle-system.smoke-whatsnew";
    static LINETOOLID = "com.battle-system.linetool";
    static POLYTOOLID = "com.battle-system.polytool";
    static ELEVATIONTOOLID = "com.battle-system.elevationtool";
    static ELEVATIONWARNID = "com.battle-system.elevationwarn";
    static BRUSHTOOLID = "com.battle-system.brushtool";
    static PROCESSEDID = "com.battle-system.processing";
    static CONTEXTID = "com.battle-system.smoke-context";
    static GRIDID = "d9953ba1-f417-431c-8a39-3c3376e3caf0";
    static SPECTREBROADCASTID = "SPECTREBROADCAST";
    static WARNINGCASTID = "SMOKEWARNINGCAST";
    static RESETPERSISTID = "RESETPERSISTID";

    static DEFAULTLINECOLOR = '#000000';
    static DEFAULTLINEWIDTH = 8;
    static DEFAULTLINESTROKE: number[] = [];
    static LINELAYER: Layer = "POINTER";
    static DOORCOLOR = "#4000ff";
    static WINDOWCOLOR = "#ADD8E6";

    static ATTENUATIONDEFAULT = "30";
    static SOURCEDEFAULT = "0";
    static FALLOFFDEFAULT = "0";
    static DARKVISIONDEFAULT = "0";
    static INANGLEDEFAULT = "360";
    static OUTANGLEDEFAULT = "360";
    static CHECKREGISTRATION = 'https://vrwtdtmnbyhaehtitrlb.supabase.co/functions/v1/patreon-check';
    static ANONAUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

    static DOOROPEN = 'https://battle-system.com/owlbear/smoke-docs/opendoor.svg';
    static DOORCLOSED = 'https://battle-system.com/owlbear/smoke-docs/closeddoor.svg';
    static DOORLOCKED = 'https://battle-system.com/owlbear/smoke-docs/lockeddoor.svg';

    static TRAILINGCOLLAR: PathCommand[] = [
        [Command.MOVE, 250, 250],
        [Command.LINE, 250, 220],
        [Command.LINE, 320, 220],
        [Command.LINE, 320, 280],
        [Command.LINE, 280, 280],
        [Command.LINE, 280, 200],
        [Command.LINE, 220, 200],
        [Command.LINE, 220, 300],
        [Command.LINE, 380, 280],
        [Command.LINE, 380, 230],
        [Command.LINE, 380, 180],
        [Command.CLOSE],
        [Command.MOVE, 250, 270],
        [Command.CUBIC, 300, 270, 350, 260, 350, 250],
        [Command.CUBIC, 350, 240, 300, 230, 250, 230],
        [Command.CUBIC, 200, 230, 150, 240, 150, 250],
        [Command.CUBIC, 150, 260, 200, 270, 250, 270],
        [Command.CLOSE]
    ];

    static FOGGYSTYLE = "FOGGY";
    static SPOOKYSTYLE = "SPOOKY";
    static DRIPSTYLE = "DRIP";
    static COSMICSTYLE = "COSMIC";
    static WEIRDSTYLE = "WEIRD";
    static FLESHSTYLE = "FLESH";
    static WATERSTYLE = "WATER";
    static ENHANCEDFOGSTYLES: Map<string, string> = new Map(
        [["0", "Map Fog"],
        ["100", "Flat Fog"]]
    );

    static ENHANCEDFOGEFECTS: { key: string, value: string }[] = [
        {
            key: "NONE",
            value: "None"
        },
        {
            key: this.DRIPSTYLE,
            value: "Drip"
        },
        {
            key: this.COSMICSTYLE,
            value: "Cosmic"
        },
        {
            key: this.FLESHSTYLE,
            value: "Flesh"
        },
        {
            key: this.FOGGYSTYLE,
            value: "Foggy"
        },
        {
            key: this.SPOOKYSTYLE,
            value: "Spooky"
        },
        {
            key: this.WATERSTYLE,
            value: "Water"
        },
        {
            key: this.WEIRDSTYLE,
            value: "Weird"
        }];

    static WATERSHADER = `
        uniform vec2 size;
        uniform float time;
        const int ITER_GEOMETRY = 3;
        const int ITER_FRAGMENT = 5;
        const float SEA_HEIGHT = 0.6;
        const float SEA_CHOPPY = 4.0;
        const float SEA_SPEED = 0.8;
        const float SEA_FREQ = 0.16;
        const vec3 SEA_BASE = vec3(0.1, 0.19, 0.22);
        const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
        const mat2 octave_m = mat2(1.6, 1.2, -1.2, 1.6);
        const int NUM_STEPS = 8;
        const float PI	 	= 3.141592;
        const float EPSILON	= 1e-3;

        float hash(vec2 p)
        {
            float h = dot(p, vec2(127.1, 311.7));	
            return fract(sin(h) * 43758.5453123);
        }

        float noise(in vec2 p)
        {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y); // No need for normalized -1 to 1 here.
        }

        float diffuse(vec3 n, vec3 l, float p)
        {
            return pow(dot(n, l) * 0.4 + 0.6, p);
        }

        float specular(vec3 n, vec3 l, vec3 e, float s)
        {
            float nrm = (s + 8.0) / (PI * 8.0);
            return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
        }

        float sea_octave(vec2 uv, float choppy)
        {
            uv += noise(uv);        
            vec2 wv = 1.0 - abs(sin(uv));
            vec2 swv = abs(cos(uv));    
            wv = mix(wv, swv, wv);
            return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
        }

        float map(vec3 p)
        {
            float freq = SEA_FREQ; // => 0.16
            float amp = SEA_HEIGHT; // => 0.6
            float choppy = SEA_CHOPPY; // => 4.0
            
            // XZ plane.
            vec2 uv = p.xz;
            
            float d, h = 0.0;    
            
            // ITER_GEOMETRY => 3
            for (int i = 0; i < ITER_GEOMETRY; i++)
            {       
                d = sea_octave((uv + (1.0 + time * 0.8)) * freq, choppy);
                d += sea_octave((uv - (1.0 + time * 0.8)) * freq, choppy);
                h += d * amp;
                uv *= octave_m;
                freq *= 2.0;
                amp *= 0.2;
                choppy = mix(choppy, 1.0, 0.2);
            }
            
            return p.y - h;
        }

        float map_detailed(vec3 p)
        {
            float freq = SEA_FREQ;
            float amp = SEA_HEIGHT;
            float choppy = SEA_CHOPPY;
            
            vec2 uv = p.xz;
            
            float d, h = 0.0;
            
            // ITER_FRAGMENT = 5
            
            for (int i = 0; i < ITER_FRAGMENT; i++)
            {        
                d = sea_octave((uv + (1.0 + time * 0.8)) * freq, choppy);
                d += sea_octave((uv - (1.0 + time * 0.8)) * freq, choppy);
                h += d * amp;        
                uv *= octave_m;
                freq *= 2.0;
                amp *= 0.2;
                choppy = mix(choppy, 1.0, 0.2);
            }
            
            return p.y - h;
        }

        vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist)
        {
            float fresnel = clamp(1.0 - dot(n, -eye), 0.0, 1.0);
            fresnel = fresnel * fresnel * fresnel * 0.65;
                
            vec3 skyColor = vec3(0.0, 0.2, 0.5);    
            vec3 refracted = SEA_BASE + diffuse(n, l, 80.0) * SEA_WATER_COLOR * 0.12; 
            
            vec3 color = mix(refracted, skyColor, fresnel);
            
            float atten = max(1.0 - dot(dist, dist) * 0.001, 0.0);
            color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
            
            color += vec3(specular(n, l, eye,60.0));
            
            return color;
        }

        vec3 getNormal(vec3 p, float eps)
        {
            vec3 n;
            n.y = map_detailed(p);    
            n.x = map_detailed(vec3(p.x + eps, p.y, p.z)) - n.y;
            n.z = map_detailed(vec3(p.x, p.y, p.z + eps)) - n.y;
            n.y = eps;
            return normalize(n);
        }

        float heightMapTracing(vec3 ori, vec3 dir, out vec3 p)
        {
            float tm = 0.0;
            
            float tx = 1000.0;
            
            // Calculate 1000m far distance map.
            float hx = map(ori + dir * tx);
            
            // if hx over 0.0 is that ray on the sky. right?
            if(hx > 0.0)
            {
                p = vec3(0.0);
                return tx;   
            }
            
            float hm = map(ori + dir * tm);    
            float tmid = 0.0;
            
            // NUM_STEPS = 8
            for (int i = 0; i < NUM_STEPS; i++)
            {
                // Calculate weight for 'tm' and 'tx' mixing.
                float f = hm / (hm - hx);
                
                tmid = mix(tm, tx, f);                   
                p = ori + dir * tmid;
                
                float hmid = map(p);
                
                if (hmid < 0.0)
                {
                    tx = tmid;
                    hx = hmid;
                }
                else
                {
                    tm = tmid;
                    hm = hmid;
                }
            }
            
            return tmid;
        }

        half4 main(float2 fragCoord) 
        {
            vec2 uv = fragCoord.xy / size.xy;
            uv = uv * 2.0 - 1.0;
        
            const vec3 light = normalize(vec3(0.0, 1.0, 0.8)); 
            // Top-down view modifications
            vec3 ori = vec3(0.0, 10.0, 0.0);  // Camera high above the sea
            vec3 dir = normalize(vec3(uv.x, -1.0, uv.y));  // Remap UV to create top-down projection
            
            // tracing
            vec3 p;
            heightMapTracing(ori, dir, p);
            
            vec3 dist = p - ori;
            vec3 n = getNormal(p, dot(dist, dist) * (0.1 / size.x));
            
            // color
            vec3 sea = getSeaColor(p, n, light, dir, dist);
            
            return vec4(sea, 1.0);
        }
        `;

    static ANNIHILATIONSHADER = `
        uniform vec2 size;
        uniform float time;

        mat2 rot(float a) {
            float PI = 3.14159265359;
            return mat2(cos(a+PI*vec4(0,1.5,0.5,0)));
        }

        vec4 hash( in vec2 p ) {
            vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
            p4 += dot(p4, p4.wzxy+19.19);
            return fract((p4.xxyz+p4.yzzw)*p4.zywx);
        }

        // value noise
        vec4 noise( in vec2 p ) {
            p*=200.0;
            vec2 i = floor( p );
            vec2 f = fract( p );
            vec2 u = f*f*(3.0-2.0*f);
            return mix( mix( hash( i + vec2(0.0,0.0) ), 
                            hash( i + vec2(1.0,0.0) ), u.x),
                        mix( hash( i + vec2(0.0,1.0) ), 
                            hash( i + vec2(1.0,1.0) ), u.x), u.y);
        }

        // domain warped noise
        float liquid( in vec2 p ) {
            p += noise(vec2(0, time*0.0005)-(p*=rot(0.1)*vec2(2.5, 0.5))).rg*0.01;
            p += noise(vec2(0, time*0.0002)+(p*=rot(0.2)*2.5)).ba*0.01;
            p += noise(p*=6.5).rg*0.005;
            return noise(p*0.1).a;
        }

        // used for normal calculation
        float height( in vec3 p ) {
            return p.z-liquid(p.xy)*0.001;
        }

        // normal from central differences
        vec3 normal( in vec2 uv ) {
            const vec2 e = vec2(0.0, 0.0001);
            vec3 p = vec3(uv, 0);
            return normalize(vec3(height(p-e.yxx)-height(p+e.yxx),
                                height(p-e.xyx)-height(p+e.xyx),
                                height(p-e.xxy)-height(p+e.xxy)));
        }

        // custom cubemap
        vec3 cubemap( in vec3 dir ) {
            vec3 color = cos(dir*vec3(1, 9, 2)+vec3(2, 3, 1))*0.5+0.5;
            color = (color * vec3(0.8, 0.3, 0.7)) + vec3(0.2);
            color *= dir.y*0.5+0.5;
            color += exp(6.0*dir.y-2.0)*0.05;
            color = pow(color, vec3(1.0/2.2));
            return color;
        }
            
        half4 main(float2 coord) {
            half4 fragColor;

            vec2 uv = (coord-size.xy*0.5)/size.x;
            vec3 dir = normalize(vec3(uv, 0.2));
            
            vec3 norm = normal(uv*0.02);
            dir = reflect(dir, norm);
            
            dir.xz *= rot(time*0.5);
            dir.yz *= rot(sin(time*0.2)*0.3);
            
            fragColor.rgb = cubemap(dir);
            
            fragColor.rgb = clamp(fragColor.rgb, vec3(0), vec3(1));
            fragColor.rgb = mix(fragColor.rgb, vec3(0), dot(uv, uv)*1.0);
            
            fragColor.a = 0.5;

            return fragColor;
        }
    `;

    static FLESHSHADER = `
        uniform vec2 size; // Uniform variable for size
        uniform float time; // Uniform variable for time

        mat2 rotate2D(float r) {
            return mat2(cos(r), sin(r), -sin(r), cos(r)); // Rotation matrix
        }

        // Main function
        half4 main(vec2 coord) {
            half4 o = half4(0); // Initialize output color
            vec2 n, N, q, p = (coord.xy * 2.0 - size) / size.y; // Fragment coordinates adjusted
            float S = 5.0, a = 0.0, j = 0.0; // Initialize S, a, and j

            // Rotation matrix
            mat2 m = rotate2D(5.0);

            // Loop for calculations
            for (float j = 0.0; j < 30.0; j += 1.0) {
                S *= 1.2; // Scale S
                p *= m; // Apply rotation to p
                n *= m; // Apply rotation to n
                q = p * S + j + n + time + sin(time) * 0.8; // Update q
                a += dot(cos(q) / S, size / size); // Accumulate a
                n += q = sin(q); // Update n and set q to sin(q)
                N += q / (S + 60.0); // Update N
            }

            // Final adjustments to output color
            o += 0.1 - a * 0.1; // Adjust output color based on a
            o.r *= 5.0; // Enhance the red channel
            o += min(0.7, 0.001 / length(N)); // Add to output based on N
            o -= o * dot(p, p) * 0.7; // Modify output color based on p
            o.a = 0.95;
            return o; // Return final color
        }
        `
        ;
    static WEIRDSHADER = `
        uniform vec2 size;
        uniform float time;

        mat2 rotate2D(float r) {
            return mat2(cos(r), sin(r), -sin(r), cos(r));
        }

        // Main function
        half4 main(vec2 coord) {
            half4 o = half4(0); // Initialize output color
            vec2 p = coord.xy / size.y; // Adjusted fragment coordinates
            vec2 n = vec2(0.0); // Initialize n
            vec2 q = vec2(0.0); // Initialize q
            vec2 N = vec2(0.0); // Declare and initialize N
            float S = 9.0; // Scaling factor
            float a = 0.0; // Initialize a
            float j = 0.0; // Initialize j

            // Rotation matrix
            mat2 m = rotate2D(5.0);

            // Loop for calculations
            for (float j = 0.0; j < 30.0; j += 1.0) {
                p *= m; // Apply rotation to p
                n *= m; // Apply rotation to n
                q = p * S + j + n + time; // Update q
                a += dot(cos(q) / S, size / size); // Accumulate a
                n += q = sin(q); // Update n and set q to sin(q)
                N += q / (S + 60.0); // Update N
                S *= 1.2; // Scale S
            }

            // Final adjustments to output color
            o += pow(max(o - o, (a + 0.5) * 0.055 * half4(6, 1, 2, 75) + 0.003 / length(N)), o - o + 0.45); 

            return o; // Return final color
        }
        `
        ;
    static COSMICSHADER = `
        uniform vec2 size;
        uniform float time;
        const int iterations = 17;
        const float formuparam = 0.53;

        const int volsteps = 20;
        const float stepsize = 0.1;

        const float zoom  = 0.800;
        const float tile  = 0.850;
        const float speed = 0.010;

        const float brightness = 0.0015;
        const float darkmatter = 0.300;
        const float distfading = 0.730;
        const float saturation = 0.850;

        half4 main(float2 coord) {
            //get coords and direction
            vec2 uv=coord / size;
            uv.y*=size.y/size.x;
            vec3 dir=vec3(uv*zoom,1.);
            float time=time*speed+.25;
                    
            vec3 from = vec3(1.0, 0.5, 0.5);
            from += vec3(time * 2.0, time, -2.0);

            //volumetric rendering
            float s=0.1,fade=1.;
            vec3 v=vec3(0.);
            for (int r=0; r<volsteps; r++) {
                vec3 p=from+s*dir*.5;
                p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
                float pa,a=pa=0.;
                for (int i=0; i<iterations; i++) { 
                    p=abs(p)/dot(p,p)-formuparam; // the magic formula
                    a+=abs(length(p)-pa); // absolute sum of average change
                    pa=length(p);
                }
                float dm=max(0.,darkmatter-a*a*.001); //dark matter
                a*=a*a; // add contrast
                if (r>6) fade*=1.-dm; // dark matter, don't render near
                //v+=vec3(dm,dm*.5,0.);
                v+=fade;
                v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
                fade*=distfading; // distance fading
                s+=stepsize;
            }
            v=mix(vec3(length(v)),v,saturation); //color adjust
            return vec4(v*.01, 0.85);
        }`
        ;

    static FOGGYSHADER = `
        uniform vec2 size;
        uniform float time;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 3.0;
            
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(st * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            
            return value;
        }

        half4 main(float2 coord) {
            vec2 p = coord / size;
            
            // Cloud effect
            float cloudNoise = fbm(p * 8.0 + time * 0.1);
            cloudNoise = smoothstep(0.3, 0.7, cloudNoise);
            
            // white clouds with transparency
            return half4(0.5, 0.5, 0.5, cloudNoise * 0.3);
        }
    `;

    static SPOOKYSHADER = `
        uniform vec2 size;
        uniform float time;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.75;
            float frequency = 2.5;
            
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(st * frequency);
                frequency *= 1.8;
                amplitude *= 0.5;
            }
            
            return value;
        }

        half4 main(float2 coord) {
            vec2 p = coord / size;
            
            // Increased movement speed from 0.08 to 0.15
            float cloudNoise = fbm(p * 4 + time * 0.15);
            
            cloudNoise = smoothstep(0.08, 0.8, cloudNoise);
            
            // Same high base opacity with cloud variation
            float opacity = 0.44 + (cloudNoise * 0.5);
            
            // Darker cloud color (reduced from 0.03, 0.01, 0.05)
            return half4(0.01, 0.005, 0.02, opacity);
        }
    `;

    static TRAILINGFOGSHADER = `
        uniform vec3 darknessColor;
        uniform shader scene;
        uniform float darknessLevel;
        uniform mat3 modelView;

        half4 main(float2 coord) {
            vec2 uv = (vec3(coord, 1) * modelView).xy;
            half4 sceneColor = scene.eval(uv);

            // Create a dark overlay color
            vec3 overlayColor = darknessColor * darknessLevel;
            half4 darkColor = half4(overlayColor, darknessLevel);
            
            // Return the overlay color with the specified alpha
            return mix(sceneColor, darkColor, darkColor.a);
        }
    `;

    static TRAILINGFOGREVEALSHADER = `
        uniform shader scene;
        uniform vec2 size;
        uniform mat3 modelView;

        half4 main(float2 coord) {
            vec2 sceneCoord = (vec3(coord, 1) * modelView).xy;

            half4 sceneColor = scene.eval(sceneCoord);

            vec2 center = size * 0.5;
            float aspectRatioInv = size.y / size.x; // Precompute inverse of aspect ratio
            vec2 diff = coord - center;
            diff.x *= aspectRatioInv; // Avoid division by multiplying by the inverse
            float distSquared = dot(diff, diff); // Avoid sqrt by using squared distance

            float radiusSquared = (min(size.x, size.y) * 0.5) * (min(size.x, size.y) * 0.5);

            float mask = step(distSquared, radiusSquared);

            // Interpolate between scene color and black
            return mix(half4(0, 0, 0, 0), sceneColor, mask);
        }
    `;

    static DARKVISIONSHADER = `
        uniform vec2 size;
        uniform vec2 center;
        uniform float radius;
        uniform float clear;
        uniform float smoothwidth;

        half4 main(float2 coord) {
            vec2 normalizedCoord = coord / size;
            float dist = distance(normalizedCoord, center);
            
            float innerAlpha = smoothstep(clear, clear + smoothwidth, dist);
            
            float outerAlpha = 1.0 - step(radius, dist);
            
            float alpha = innerAlpha * outerAlpha;
            
            return half4(0.5, 0.5, 0.5, alpha);
        }
    `;

    static SMOKEMOBILEMAIN = `
    <div id="tabControls">
                    <div class="controlContainer">
                        <div class="even-set-button-container">
                            <button class="view-button selected" id="smokeViewToggle"><img class="menu_svg" src="./icon.svg"></button>
                            <button class="view-button" id="spectreViewToggle"><img class="menu_svg" src="./ghost.svg"></button>
                            <button class="view-button" id="helpViewToggle"><img class="menu_svg" src="./help.svg"></button>
                            <button class="view-button" id="settingsViewToggle"><img class="menu_svg" src="./settings.svg"></button>
                        </div>
                        <div id="patreonContainer"></div>
                    </div>
                </div>
                <div id="smokeViewPanel" class="panel"></div>
                <div id="spectreViewPanel" class="panel" style="display: none;"></div>
                <div id="settingsViewPanel" class="panel" style="display: none;"></div>
                <div id="helpViewPanel" class="panel" style="display: none;">
                    <div id="markdownHelpContainer"></div>
                </div>
    `;
    static SMOKEMOBILEHTML = `
    <div id="contextMenu" class="context-menu" style="display: none">
        Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div class="visionTitle grid-3">Vision Enabled<div id="tip_gmtokens" class="note">📝</div>
        <div id="visionPanelToggleContainer"></div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="token_list_div" class="grid-3" padding-bottom: 8px;">
            <table id="smokeUnitTablePrime" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup> 
                <thead>
                    <tr id="visionPanelMain">
                        <th>Name</th>
                        <th id="visionRangeHeader" class="clickable-header"><img id="visionRangeSvg" class="menu_svg" src="./visionRange.svg"></th>
                        <th id="visionFalloffHeader" class="clickable-header"><img id="visionFalloffSvg" class="menu_svg" src="./visionFalloff.svg"></th>
                        <th id="visionBlindHeader" class="clickable-header"><img class="menu_svg" src="./blind.svg"></th>
                        <th id="visionHideHeader" class="clickable-header"><img class="menu_svg" src="./eyeclosed.svg"></th>
                    </tr>
                    <tr id="visionPanelSub" style="display: none;">
                        <th>Name</th>
                        <th id="visionBumperHeader" class="clickable-header"><img id="visionBumperSvg" class="menu_svg" src="./visionBumper.svg"></th>
                        <th id="visionInAngleHeader" class="clickable-header"><img id="visionInnerSvg" class="menu_svg" src="./visionInner.svg"></th>
                        <th id="visionOutAngleHeader" class="clickable-header"><img id="visionOuterSvg" class="menu_svg" src="./visionOuter.svg"></th>
                        <th id="visionDarkHeader" class="clickable-header"><img id="visionDarkSvg" class="menu_svg" src="./darkvision.svg"></th>
                    </tr>
                </thead>
                <tbody id="token_list"></tbody>
            </table>
            <table id="smokeUnitTableSub" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup>
                <tbody id="hidden_list" style="display:none;">~ <input type="button" value="Tap to Show List" class="settingsButton" style="width: 60% !important;" id="hideListToggle"> ~</tbody>
            </table>
        </div>
    </div>
    `;

    static SMOKEMAIN = `
    <div id="tabControls">
                    <div class="controlContainer">
                        <div class="even-set-button-container">
                            <button class="view-button selected" id="smokeViewToggle">Smoke</button>
                            <button class="view-button" id="spectreViewToggle">Spectre</button>
                            <button class="view-button" id="helpViewToggle">Help</button>
                            <button class="view-button" id="settingsViewToggle">Settings</button>
                        </div>
                        <div id="patreonContainer"></div>
                    </div>
                </div>
                <div id="smokeViewPanel" class="panel"></div>
                <div id="spectreViewPanel" class="panel" style="display: none;"></div>
                <div id="settingsViewPanel" class="panel" style="display: none;"></div>
                <div id="helpViewPanel" class="panel" style="display: none;">
                    <div id="markdownHelpContainer"></div>
                </div>
    `;

    static SMOKEHTML = `
    <div id="contextMenu" class="context-menu" style="display: none">
        Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div class="visionTitle grid-3">Tokens with Vision Enabled<div id="tip_gmtokens" class="note">📝</div>
        <div id="visionPanelToggleContainer"></div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="token_list_div" class="grid-3" padding-bottom: 8px;">
            <table id="smokeUnitTablePrime" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup> 
                <thead>
                    <tr id="visionPanelMain">
                        <th>Name</th>
                        <th id="visionRangeHeader" class="clickable-header"><img id="visionRangeSvg" class="menu_svg" src="./visionRange.svg"></th>
                        <th id="visionFalloffHeader" class="clickable-header"><img id="visionFalloffSvg" class="menu_svg" src="./visionFalloff.svg"></th>
                        <th id="visionBlindHeader" class="clickable-header"><img class="menu_svg" src="./blind.svg"></th>
                        <th id="visionHideHeader" class="clickable-header"><img class="menu_svg" src="./eyeclosed.svg"></th>
                    </tr>
                    <tr id="visionPanelSub" style="display: none;">
                        <th>Name</th>
                        <th id="visionBumperHeader" class="clickable-header"><img id="visionBumperSvg" class="menu_svg" src="./visionBumper.svg"></th>
                        <th id="visionInAngleHeader" class="clickable-header"><img id="visionInnerSvg" class="menu_svg" src="./visionInner.svg"></th>
                        <th id="visionOutAngleHeader" class="clickable-header"><img id="visionOuterSvg" class="menu_svg" src="./visionOuter.svg"></th>
                        <th id="visionDarkHeader" class="clickable-header"><img id="visionDarkSvg" class="menu_svg" src="./darkvision.svg"></th>
                    </tr>
                </thead>
                <tbody id="token_list"></tbody>
            </table>
            <table id="smokeUnitTableSub" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup>
                <tbody id="hidden_list" style="display:none;">~ <input type="button" value="Out-of-Sight List: Click to Show" class="settingsButton" style="width: 60% !important;" id="hideListToggle"> ~</tbody>
            </table>
        </div>
    </div>
    `;

    static SPECTREHTML = `
    <div class="visionTitle grid-3">Tokens with Spectre Enabled
        <div id= "tip_spectretokens" class="note">📝</div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="ghostContainer" class="grid-3">
            <table style="margin: auto; padding: 0; width: 100%">
            <colgroup>
                <col style="width: 50%;">
                <col style="width: 25%;">
                <col style="width: 25%;">
            </colgroup>
            <tbody id="ghostList">
            </tbody></table>
            </div> 
        </div>
    </div>
    `;
    static SETTINGSHTML = `
    <div id="settings-ui">
        <table id="settingsTable">
            <colgroup>
                <col style="width: 30%;">
                <col style="width: 10%;">
                <col style="width: 10%;">
                <col style="width: 30%;">
                <col style="width: 10%;">
                <col style="width: 10%;">
            </colgroup>
            <tbody>
                <tr>
                    <td colspan="2"><label for="toggle_fogfill" id="tip_fogfill">FogFill</label></td>
                    <td><input type="checkbox" id="toggle_fogfill"></td>
                    <td colspan="2"><label for="disable_vision" id="tip_disablevision">Disable Vision</label></td>
                    <td><input type="checkbox" id="disable_vision"></td>
                </tr>
                <tr>
                    <td><label for="toggle_persistence" id="tip_persistence">Persistence</label></td>
                    <td><button id="reset_persistence"><img class="setting_svg" src="./reset.svg"></button></td>
                    <td><input type="checkbox" id="toggle_persistence"></td>
                    <td colspan="2"><label for="toggle_trailingfog" id="tip_trailingfog">Trailing Fog (Beta)</label></td>
                    <td><input type="checkbox" id="toggle_trailingfog"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="toggle_ownerlines" id="tip_ownerrings">Owner Highlight</label></td>
                    <td><input type="checkbox" id="toggle_ownerlines"></td>
                    <td colspan="2"><label for="toggle_autohide" id="tip_autohide">Autohide (Beta)</label></td>
                    <td><input type="checkbox" id="toggle_autohide"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="toggle_unitcontextmenu" id="tip_unitcontextmenu">Show Unit Menu</label></td>
                    <td><input type="checkbox" id="toggle_unitcontextmenu"></td>
                    <td colspan="2"><label for="toggle_wallcontextmenu" id="tip_wallcontextmenu">Show Wall Menu</label></td>
                    <td><input type="checkbox" id="toggle_wallcontextmenu"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="toggle_gmwalls" id="tip_gmwalls">Wall Pass (GM)</label></td>
                    <td><input type="checkbox" id="toggle_gmwalls"></td>
                    <td colspan="2"><label for="snap_checkbox" id="tip_gridsnap">Grid Snap</label></td>
                    <td><input type="checkbox" id="snap_checkbox"></td>
                </tr>
                <tr>
                    <td><label for="toggle_defaultelevation" id="tip_defaultelevation">Default Elevation</label></td>
                    <td colspan="2"><select name="elevationDefault" id="default_elevation_select">
                        <option value="-10">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                    </td>
                    <td><label for="toggle_elevationstyle" id="tip_elevationstyle">Elevation Style</label></td>
                    <td colspan="2"><select name="elevationStyle" id="elevation_style_select">
                        <option value="false">Mesa</option>
                        <option value="true">City</option>
                    </select>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><label for="door_checkbox" id="tip_playerdoors">Players See Doors</label></td>
                    <td><input type="checkbox" id="door_checkbox"></td>
                    <td colspan="2"><label for="warnings_checkbox" id="tip_hardwarewarnings">HW Warnings</label></td>
                    <td><input type="checkbox" id="warnings_checkbox"></td>
                </tr>
                <tr>
                    <td colspan="3"><select class="settingsButton" id="preview_select"></select></td>
                    <td colspan="3"><input class="settingsButton" type="button" id="doublewall_button" value="Double-Side Walls"></td>
                </tr>
                <tr>
                    <td colspan="3"><input class="settingsButton" type="button" id="block_button" value="Block Walls"></td>
                    <td colspan="3"><input class="settingsButton" type="button" id="unblock_button" value="Unblock Walls"></td>
                </tr>
                <tr>
                    <td colspan="3"><input class="settingsButton" type="button" id="lock_button" value="Lock Lines"></td>
                    <td colspan="3"><input class="settingsButton" type="button" id="unlock_button" value="Unlock Lines"></td>
                </tr>
                <tr>
                    <td colspan="6" style="text-align: center; font-weight: bold;">Tool Options</td>
                </tr>
                <tr>
                    <td colspan="6">
                        <div id="toolOptions">
                            Width: <input id="tool_width" type="number" value="8" style="width: 40px;" maxlength="2">
                             - Color: <input id="tool_color" type="text" maxlength="7">
                             - Style: <select id="tool_style">
                                <option value="solid" selected>Solid</option>
                                <option value="dotted">Dotted</option>
                            </select>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="6" style="text-align: center; font-weight: bold;">Vision Defaults</td>
                </tr>
                <tr>
                    <td colspan="2"><label for="visionDefaultInput" id="tip_visionDefault">Vision</label></td>
                    <td><input type="number" id="visionDefaultInput"></td>
                    <td colspan="2"><label for="collisionDefaultInput" id="tip_collisionDefault">Collision</label></td>
                    <td><input type="number" id="collisionDefaultInput"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="falloffDefaultInput" id="tip_falloffDefault">Falloff</label></td>
                    <td><input type="number" id="falloffDefaultInput"></td>
                    <td colspan="2"><label for="greyscaleDefaultInput" id="tip_greyscaleDefault">Greyscale</label></td>
                    <td><input type="number" id="greyscaleDefaultInput"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="innerAngleDefaultInput" id="tip_innerAngleDefault">Inner-Angle</label></td>
                    <td><input type="number" id="innerAngleDefaultInput"></td>
                    <td colspan="2"><label for="outerAngleDefaultInput" id="tip_outerAngleDefault">Outer-Angle</label></td>
                    <td><input type="number" id="outerAngleDefaultInput"></td>
                </tr>
            </tbody>
        </table>

        <table id="importTable">
            <colgroup>
                <col style="width: 35%;">
                <col style="width: 15%;">
                <col style="width: 35%;">
                <col style="width: 15%;">
            </colgroup>
            <tbody>
                <tr>
                    <td colspan="4" class="tableHeader">Import</td>
                </tr>
                <tr>
                    <td colspan="4">Import files from <a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a></br>and other tools.</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="custom-file-input">
                            <label for="import_file" id="import_file_name">Choose File...</label>
                            <input id="import_file" type="file" accept=".dd2vtt, .ddvtt, .uvtt, .fvtt, .json">
                        </div>
                    </td>
                    <td colspan="2"><input type="button" id="import_button" value="Import" disabled></td>
                </tr>
                <tr>
                    <td colspan="2" >Format</br><select id="import_format"><option value="scene">UVTT/DDVTT Scene</option><option value="foundry">Foundry</option><option value="uvtt">Universal VTT</option></select></td>
                    <td colspan="2">Alignment</br><select id="map_align"><option selected>Loading..</option></select></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="dpi_autodetect" id="tip_importdpi">DPI Autodetect</label></td>
                    <td colspan="2">
                        <input type="checkbox" id="dpi_autodetect" checked>
                        <input id="import_dpi" disabled type="text" value="150" maxlength="4">
                    </td>
                </tr>
            </tbody>
            <div id="import_errors" class="grid-3"></div>
        </table>
    </div>`;

    static SETTINGSMOBILEHTML = `
<div id="settings-ui">
    <div class="grid-container">
        <div>
            <label for="toggle_fogfill" id="tip_fogfill">FogFill</label>
            <input type="checkbox" id="toggle_fogfill">
        </div>
        <div>
            <label for="disable_vision" id="tip_disablevision">Disable Vision</label>
            <input type="checkbox" id="disable_vision">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="snap_checkbox" id="tip_gridsnap">Grid Snap</label>
            <input type="checkbox" id="snap_checkbox">
        </div>
        <div>
            <label for="toggle_persistence" id="tip_persistence">Persistence</label>
            <button class="mobile-presistence"id="reset_persistence"><img class="setting_svg" src="./reset.svg"></button>
            <input type="checkbox" id="toggle_persistence">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_trailingfog" id="tip_trailingfog">Trailing Fog (Beta)</label>
            <input type="checkbox" id="toggle_trailingfog">
        </div>
        <div>
            <label for="toggle_autohide" id="tip_autohide">Autohide (Beta)</label>
            <input type="checkbox" id="toggle_autohide">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_unitcontextmenu" id="tip_unitcontextmenu">Show Unit Menu</label>
            <input type="checkbox" id="toggle_unitcontextmenu">
        </div>
        <div>
            <label for="toggle_wallcontextmenu" id="tip_wallcontextmenu">Show Wall Menu</label>
            <input type="checkbox" id="toggle_wallcontextmenu">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_gmwalls" id="tip_gmwalls">Wall Pass (GM)</label>
            <input type="checkbox" id="toggle_gmwalls">
        </div>
        <div>
            <label for="toggle_ownerlines" id="tip_ownerrings">Owner Highlight</label>
            <input type="checkbox" id="toggle_ownerlines">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_defaultelevation" id="tip_defaultelevation">Default Elevation</label>
            <select name="elevationDefault" id="default_elevation_select" style="width: 80px;">
                <option value="-10">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </div>
        <div>
            <label for="toggle_elevationstyle" id="tip_elevationstyle">Elevation Style</label>
            <select name="elevationStyle" id="elevation_style_select" style="width: 80px;">
                        <option value="false">Mesa</option>
                        <option value="true">City</option>
            </select>
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="door_checkbox" id="tip_playerdoors">Players See Doors</label>
            <input type="checkbox" id="door_checkbox">
        </div>
        <div>
            <label for="warnings_checkbox" id="tip_hardwarewarnings">HW Warnings</label>
            <input type="checkbox" id="warnings_checkbox">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <select class="settingsButton" id="preview_select"></select>
        </div>
        <div>
            <input class="settingsButton" type="button" id="doublewall_button" value="Double-Side Walls">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <input class="settingsButton" type="button" id="block_button" value="Block Walls">
        </div>
        <div>
            <input class="settingsButton" type="button" id="unblock_button" value="Unblock Walls">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <input class="settingsButton" type="button" id="lock_button" value="Lock Lines">
        </div>
        <div>
            <input class="settingsButton" type="button" id="unlock_button" value="Unlock Lines">
        </div>
    </div>

    <div style="text-align: center; font-weight: bold;">
        Tool Options
    </div>

    <div class="grid-container">
        <div style="display:flex; width: 100%;place-content: space-evenly;">
            <label>Width:</label>
            <input id="tool_width" type="number" value="8" style="width: 40px;" maxlength="2">
            <div class="mobile-color"> 
                <input id="tool_color" type="text" maxlength="7">
            </div>
        </div>
        <label>Style:</label>
        <select id="tool_style">
            <option value="solid" selected>Solid</option>
            <option value="dotted">Dotted</option>
        </select>
    </div>

    <div style="text-align: center; font-weight: bold;">
        Vision Defaults
    </div>

    <div class="grid-container">
        <div>
            <label for="visionDefaultInput" id="tip_visionDefault">Vision</label>
            <input type="number" id="visionDefaultInput">
        </div>
        <div>
            <label for="collisionDefaultInput" id="tip_collisionDefault">Collision</label>
            <input type="number" id="collisionDefaultInput">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="falloffDefaultInput" id="tip_falloffDefault">Falloff</label>
            <input type="number" id="falloffDefaultInput">
        </div>
        <div>
            <label for="greyscaleDefaultInput" id="tip_greyscaleDefault">Greyscale</label>
            <input type="number" id="greyscaleDefaultInput">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="innerAngleDefaultInput" id="tip_innerAngleDefault">Inner-Angle</label>
            <input type="number" id="innerAngleDefaultInput">
        </div>
        <div>
            <label for="outerAngleDefaultInput" id="tip_outerAngleDefault">Outer-Angle</label>
            <input type="number" id="outerAngleDefaultInput">
        </div>
    </div>

    <div id="importTable">
        <div class="tableHeader">Import</div>

        <div>Import files from <a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a><br>and other tools.</div>

        <div class="grid-container">
            <div class="custom-file-input">
                <label for="import_file" id="import_file_name">Choose File...</label>
                <input id="import_file" type="file" accept=".dd2vtt, .ddvtt, .uvtt, .fvtt, .json">
            </div>
            <div>
                <input type="button" id="import_button" value="Import" disabled>
            </div>
        </div>

        <div class="grid-container">
            <div>
                <label>Format</label>
                <select id="import_format">
                    <option value="scene">UVTT/DDVTT Scene</option>
                    <option value="foundry">Foundry</option>
                    <option value="uvtt">Universal VTT</option>
                </select>
            </div>
            <div>
                <label>Alignment</label>
                <select id="map_align">
                    <option selected>Loading..</option>
                </select>
            </div>
        </div>

        <div class="grid-container">
            <div style="align-items: center;">
                <label for="dpi_autodetect" id="tip_importdpi">DPI Autodetect</label>
                <input class="mobile-import-dpi-input" id="import_dpi" disabled type="text" value="150" maxlength="4">
                <input type="checkbox" id="dpi_autodetect" checked>
            </div>
        </div>

        <div id="import_errors" class="grid-3"></div>
    </div>
</div>
`;

    static MARKDOWNHELP = `
<a id="smoke" name="smoke"></a>
<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#quick-start-smoke">Smoke: Quick Start</a>
      <li><a href="#quick-start-spectre">Spectre: Quick Start</a></li>
      <li><a href="#overview">Smoke & Spectre UI Overview</a>
      <ul>
        <li><a href="#ui-smoke">Smoke Panel</a></li>
        <li><a href="#ui-spectre">Spectre Panel</a></li>
        <li><a href="#ui-settings">Settings Panel</a></li>
        <li><a href="#ui-tools">Drawing Tools</a></li>
        <li><a href="#ui-convert">Drawing Conversions</a></li>
        <li><a href="#ui-convert">Elevation Tools</a></li>
      </ul></li>
      <li><a href="#obstruct-tools">Smoke: Using the Obstruction Tools</a>
      <ul>
        <li><a href="#obstruct-line">The Obstruction Line</a></li>
        <li><a href="#obstruct-poly">The Obstruction Polygon</a></li>
        <li><a href="#obstruct-brush">The Obstruction Paintbrush</a></li>
      </ul></li>
      <li><a href="#smoke-tokens">Smoke: Using Tokens</a>
      <ul>
        <li><a href="#smoke-vision">Changing a token's vision range</a></li>
        <li><a href="#smoke-player">Who can see this token's view?</a></li>
        <li><a href="#smoke-linked">Linked Vision</a></li>
      </ul></li>
      <li><a href="#smoke-advanced">Smoke: Advanced Features</a>
      <ul>
        <li><a href="#smoke-light">Using Light Sources</a></li>
        <li><a href="#smoke-doors"> Using Doors & Windows</a></li>
        <li><a href="#smoke-customfog"> Using Custom Fog Backgrounds</a></li>
        <li><a href="#smoke-fogeffects"> Using Fog Effects</a></li>
      </ul></li>
      <li><a href="#smoke-elevation">Smoke: Elevation Mapping</a>
      <ul>
        <li><a href="#smoke-elevation-map">How it works</a></li>
        <li><a href="#smoke-elevation-tools">The Mapping Layer Tools</a></li>
        <li><a href="#smoke-elevation-view">The Mapping View Toggle</a></li>
      </ul></li>
      <li><a href="#smoke-import">Smoke: Importing Fog Files</a></li>
      <li><a href="#spectre-usage">Spectre: Usage and Use Cases</a></li>
      <li><a href="#spectre-works">Spectre: How it works</a>
      <ul>
        <li><a href="#spectre-vision">Who can see the token</a></li>
        <li><a href="#spectre-tokens">Where do the tokens go</a></li>
        <li><a href="#spectre-limits">How many things can be Spectred?</a></li>
      </ul></li>
    <li><a href="#support">Support</a></li>
  </ol>
</details>

<p align="right">(<a href="#smoke">back to top</a>)</p>


## Smoke: Quick Start <a id="quick-start-smoke" name="quick-start-smoke"></a>
So, your game starts in an hour and you've prepped nothing - but you want to distract them with some fog. Sure.

1. Click the 'Glasses' icon in the toolbar, and select the Line tool.  Draw to your heart's content.
2. Add a token to the scene. On that token, through the context-menu, 'Enable Vision'.
3. (Optional: Assign ownership of that token to a specific player, so they can only see through that token.)
4. Click the checkbox in settings  to turn on Fog Fill.
5. Done!

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: Quick Start <a id="quick-start-spectre" name="quick-start-spectre"></a>
You need to drive someone crazy in a hurry, I get it.  Just make sure the player is in the game first for this to work.
1. On the token in the scene, that you want to be visible to ONLY certain players - open the context-menu and select "Spectre".  This will make the token visible to YOU, and no one else.
2. In the 'Spectre' window of the extension, you will now see that token. In the drop-down, select the player(s) you want to be able to see that token.
3. Done! Only those specific players (And yourself) can see that token.

<p align="right">(<a href="#smoke">back to top</a>)</p>
 
## Smoke & Spectre UI Overview <a id="overview" name="overview">

#### <a id="ui-smoke"></a>1. Smoke Panel
This panel holds information on all tokens that have Vision Enabled.  This includes Light sources as well as Character Tokens. A token only gets to this list if you click 'Enable Vision' on it.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-panel.webp)
There are two sets of options to configure a token's vision range;
For Basic Settings:
1. Range: Set the desired radius for a token's vision range.
2. Falloff: Change the edge of a tokens' vision range from a hard line to a soft blur (Try values 0 - 5).
3. Disable: Disable a single token's vision - useful for a quick 'Blind' status.
4. Move to Out-of-Sight List: Moves this token to the lower list which can be hidden from view. Useful if you have lots of items in the scene but the majority of them will never be changed/updated
For Advanced Settings:
1. Collision: Set how far away from the token's center collision will occur when using unpassable walls. If the collision range is set too high, it could prove difficult to move a token in a narrow hallway.
2. Inner/Outer Angle: When looking to use coned vision, set these to the angle in which you would like to constrain vision.  The direction doesn't matter as much, as you can rotate the token and the cone will follow it.
3. Greyscale: Enable to remove color from a token's vision radius, useful for a 'Darkvision' effect.  This will set the entire vision radius to greyscale.

Also, if you right-click a token's name you can assign an owner for a token quickly and easily (Even if you do not have owner-only permissions turned on in your room)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-spectre"></a>2. Spectre Panel
This panel holds information on all tokens that have been 'Spectred'.  

<i>Note: When a token has been 'Spectred', it has been removed from the scene that items generally exist in. This can cause some issues with other extensions that might try to interact with the Spectred item, if they are not scoped to ignore these 'out-of-play' local items. In general, only do Spectre things with Spectred tokens.</i>
![gmview view](https://battle-system.com/owlbear/smoke-docs/spectre-panel.webp)
The options next to a token's name are;
1. Set Viewer(s): Designate which other players are able to see this token.
2. Delete: Remove the Spectre from play.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-settings"></a>3. Settings Panel

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-settings.webp)

The settings for smoke are generally saved to the Scene, as each scene might have different needs to make it work.  The options are as follows;
1. Fog Fill: This will enable/disable the Fog Fill in the Owlbear Rodeo Fog settings.  S&S3.0 requires fog fill in order  to do dynamic fog processing (but does not require it for collision detection). This is a  deviation from S&S2.0 where fog could be calculated in a small area via the bounding grid - which is no longer possible.
2. Disable Vision: This will disable vision for ALL tokens that have vision enabled.  Useful if you need to blind the entire group, but do not wish to click each individual token.
3. Persistence/Reset: This will enable/disable Persistence on your map. Persistence will keep areas that a token has stopped as 'discovered', and it will not be covered in fog when the token moves away.  The 'reset' button next to the toggle will reset the uncovered areas for everyone currently in the room.
4. Trailing Fog (Beta): Trailing fog puts an 'overlay' over the entire map that darkens it further. When an area is visited by a token with vision, this area is left 'revealed' but slightly darker than the area the token is currently in.  This is to show that an area was explored, but no one is present. Trailing fog REQUIRES Persistence to be enabled to work. As for it's BETA status, it currently does not check collision data so will always show a full radius around the token.
5. Owner Highlight: This will enable/disable the colored rings that indicate a player's viewable range as a GM.
6. Autohide (Beta): Autohide adds a new context menu option for tokens (Enable Autohide).  When this is toggled on for a token, that token will AUTOMATICALLY be changed to 'Hidden' when a token with vision is not in visible range of it. As for it's BETA status, it currently does not check collision data so will always show a full radius around the token.
7. Show Unit Menu: This enables the 'Unit Context Menu' where you can change a unit's vision parameters directly on the token.  It will also show the 'Advanced' options for a unit, allowing you to change it's owner or assign it a dedicated elevation level to be at (a case for flying units).
8. Show Wall Menu: This enables the 'Wall Context Menu' where you can see the 'Advanced' options for a wall.  This includes assigning it a SPECIFIC viewer to interact with and assigning a dedicated elevation level.
9. Wall Pass (GM): When enabled, allows a GM the ability to drag a token through walls - even if the walls have blocking enabled.
10. Grid Snap: This will enable/disable the custom grid snapping used for drawing Obstruction Lines/Objects in S&S (Note: You can hold CTRL while drawing to temporarily disable this.). <i>This is independent of the default Snap setting in OBR.</i>
11. Default Elevation:  This will assign the default elevation for all areas where an Elevation Mapping does not exist.
12. Elevation Style: This will swap between the Mesa and City wall styles, which change how elevation layers above 0 interact.
13. Players-See-Doors: This will allow player's to see and interact with doors that have been created.

14. Double-Side Walls: This will change all walls on the map to be double-sided walls. This can be useful if an imported map lacked the information, and you do not wish to set each wall individually.
15. Block/Unblock Walls: By default, when you draw an obstruction it will be passable (with the exception of the Obstruction Brush tool).  This will block/unblock all walls so that tokens ability to pass them is changed.
16. Lock/Unlock Lines: By default, when you draw an obstruction it will be auto-locked to make sure they are not moved on accident.  Use these buttons to lock/unlock all lines so that they can be manipulated again. 
17. Tool Options: This is for customizing the style of the lines that are created when drawing with the Obstruction Tools
18. Vision Defaults: This allows you to set the defaults for a token when their vision is enabled.
19. Import: Smoke is able to accept the UVTT format for building a scene for you. Select the map and Import, and the map image, obstructions, doors and light sources will be created in a new scene.

#### <a id="ui-tools"></a>7. Drawing Tools
Added to the OBR Toolbar are Smoke's drawing tools.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

1. Obstruction Polygon: This tool is slightly different, in that it will create a closed shape - but the inside will be visible.  This is useful for items like 'Large Boulders' on a map, where the player can see that it's a boulder, but they cannot see past it.
2. Obstruction Line: This is your default tool for making an obstruction. Just click in your scene to create points for the line, and select Finish (or push Enter) when you're done.
3. Obstruction Paintbrush: This tool creates obstructions by the grid. Click and drag to fill in the desired area, and when you let go walls will be created around the shape you have painted. This is useful for maps that are blocky and/or very square with angular hallways.
    - This brush should reflect what the currently selected grid option is in Owlbear Rodeo, and supports Square, Hexagon and Isometric grids.
4. Trim Tool: This tool will allow you to click two points on a line, and 'cut' it from the base line. Allowing you to easily lop off a section you didn't intend on, or add a door/window.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>8. Drawing Conversions
If you prefer to use the base Owlbear Rodeo drawing tools, you can.  All shapes and lines created via the default tools can be converted into an Obstruction.  Just right-click the shape and select 'Convert to Obstruction'.
This will remove the shape/line/drawing as it was, and recreate it as an Obstruction object.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-convert.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>9. Elevation Tools
Also on the Smoke Toolbar are the Elevation Mapping tools;

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

1. Elevation Layers: Elevation Mapping Layers 1-5 let you draw a shape at that elevation level, and all points (from obstructions or tokens) when processed will be drawn with that depth in mind.  A quick example (with Mesa style), if you draw an obstruction around a house on your map - and then draw around the house with Elevation 1 - you won't be able to see around/above the house when on the ground, but if you put the token on the house it will be able to see everywhere.
2. Elevation Selection Tool: This let's you select your Elevation Layers.
3. Elevation View Toggle: This toggles on/off the visibility of the Elevation Layers, as they should be hidden away when not being configured. (They still take effect when not seen.)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Using the Obstruction Tools <a id="obstruct-tools" name="obstruct-tools">

When drawing obstructions, you have some options in the form of buttons...
1. Finish: This will complete your line based on the points you added to the scene. You can also push "ENTER" on the keyboard instead of clicking the button.
2. Cancel: This will remove all points and stop any line-drawing in process. You can also push "ESC" on the keyboard.
3. Undo: This will remove the last point you have placed. You can also push "Z" on the keyboard. (Not CTRL+Z, just 'Z')

#### <a id="obstruct-line"></a>1. The Obstruction Line
The line tool is the basic building block for scenes, and likely will be the most used when creating a scene.
By default, they block vision no matter what side of the line you are on. (The 'hidden' area is seen from the GM view in this screenshot, so it's only lightly obscured by darkness.)

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-line.webp)

<i> Note: You are able to change how the default vision works for a line by going to the context-menu for a line and changing between Two-Sided, and One-sided.</i>

You can also toggle an Obstruction Line's ability to block vision by clicking 'Disable/Enable Vision Line' in the context menu.
In addition to that, you can also toggle a line into a 'Door'.  Which works similar to the Vision toggle, but adds a door icon. More on this in the Doors section.
You can change how an obstruction behaves in several ways:
1. Enable/Disable Vision Line: This will toggle how this line interacts with a token's vision.
2. Swap to One-Sided/Two-Sided: This will toggle how a token sees this line. A one-sided line will block vision from one side, but allow vision from the other. A two-sided line will block vision from both sides.
	A. (When on One-sided) Swap Obstructing Side: This will change what side of the line you are able to see through.
3. Swap to Passable/Unpassable: This will change how this line behaves as a collider.  A passable line will not stop a token's movement, but an unpassable one will.
4. Enable Door: This will change the line to have 'Door' functionality. A line that has Door functionable has a few more buttons to improve flow.
	- A. Disable Door: This will disable the line behaving as a door.
	- B. Open/Close Door: This will change if a token can see through, and pass through this line.
	- C.  Lock Door: This will lock the door, so that players are unable to open it.
	- <i>Note: The 'Door' picture that appears can be double-clicked in order to open the door. It only serves the purposes of showing a door though. In order to manipulate the obstruction line that is the door - select the line.</i>
5. Enable Window: This will change the line to have 'Window' functionality. A Window line will be shown as a dashed line, and will also NOT block vision. It will block movement though.
    - <i>Note: If you want a window that can be opened, also Enable Door on the Windowed line.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="obstruct-poly"></a>2. The Obstruction Polygon
The polygon tool is more of a special case, it creates a closed shape where the INSIDE is visible from the outside. The area 'behind' that shape though, you are unable to see.

The use-case for this is generally with objects that are large (and the player would know what it is on sight), but they cannot see behind it.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-poly.webp)

It can also be useful when attached to a large 'Monster' token, as the players would be able to view the token - but not be able to view behind it. (In case it's so big that it blocks vision!)

Polygons also block vision if you are INSIDE of the shape. As in, you'll be able to see the area around you (within the shape) but not see outside of it.  This could be useful if the shape is around a 'barrel' - and a player wants to hide inside. They will not be able to peer out of the barrel.

There is no hard-rule to how this thing is used, so it's really up to you to determine the best case. Feel free to experiment.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="obstruct-brush"></a>3. The Obstruction Brush
The brush tool is a quick-setup tool for maps that are blocky in nature, with lots of square rooms and hallways (Meaning, not a cave with lots of jagged its).

It's based on the grid, so be sure to line your map up accordingly first. After that, just click and drag as the brush highlights the squares it will draw obstruction lines around.  The benefits of this tool is it will let you setup large maps rather quickly by just coloring them in.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-brush.webp)

<i>Note: While this aids in setting up large areas quickly, you might find it useful to use the 'Trim' tool after to add a door.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Using Tokens <a id="smoke-tokens" name="smoke-tokens">

#### <a id="smoke-vision"></a>1. Changing a token's vision range
In the Smoke Panel, once a token has had it's Vision Enabled, the token will appear on the list with some options. The default radius is 30, but you can change this to whatever suits your needs.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-vision.webp)

There are two sets of settings - Basic and Advanced. In order, the controls are:
1. (Basic) Vision Range.
2. (Basic) Vision Falloff.
3. (Basic) Vision Disable.
4. (Advanced) Collision Range.
5. (Advanced) Inner Vision Angle.
6. (Advanced) Outer Vision Angle.
7. (Advanced) Greyscale Vision.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-vision"></a>2. Who can see this token's view?
When a token is added to the scene, the OWNER of that token is the person who added it to the scene. Normally this is the GM.
When vision is enabled on a token (and it's owner is the GM) every player is able to see the vision for this token.  This is useful if you do not want everyone in your game to have their own personalized vision based on their token.
If you do want people to only see from the viewpoint of their token, you want to make sure they are the owner of that token.

To speed up the flow of assigning ownership, you have two options:
1. Let players drag in their own tokens. If they brought it in, they're the owner! Then just enable vision on it.
2. Right-click a token's name in the Smoke Panel, and you are able to assign an owner to a token from a list of **players who have entered the room at any point in time**.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-player.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>
  
#### <a id="smoke-linked"></a>3. Linked Vision
To quickly assign vision groups, or simply have a token 'piggy-back' another token's vision settings - you can 'Link' a token to another one. From the Vision List, click and drag the name of a token on top of the token you want to link it to.  This will 'nest' it, removing it's controls from view.  From this point on, that token will use the parent token's vision settings.

To undo this, you click and drag the name onto itself - this will remove the link.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-links.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>
  
  
## Smoke: Advanced Features <a id="smoke-advanced" name="smoke-advanced">

#### <a id="smoke-light"></a>1. Using Torchlight (Previously Light Sources)
If you need ambient lighting on a map, you need to create a 'Torch'.  This can only be token with token's on the PROP or ATTACHMENT layer.  When you open the context menu of a token on either layer, you will see the 'Create Torchlight' option.
Torchlights are added to the token vision list like all other tokens, but are appended with a 🔦 icon. All of the same settings can be used.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light.webp)

This is easiest to see with narrow hallways.  If you add a torchlight to a small room, and then have a narrow hallway between it and a character token with vision, you will see that the vision the torch gives is constricted.

If you're looking to have your characters explore a dark area where they have to hold torches, it's a simple task.   Create torch tokens, enable vision, set them as a torchlight and then attach them to the characters.  Your other players will then be able to see each other when the light of the torch is not behind something obstructing it.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light2.webp)

<i>Given that torchlights are not needed to be manipulated often, it's often better to move them to the 'Out-of-Sight' list, to clean up the clutter in the Smoke panel.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-doors"></a>2. Using Doors & Windows
In the context-menu for an Obstruction Line, there is an option for 'Enable Door' and 'Enable Window'.

Enabling a door will draw a 'Door' icon on top of that line, which can be toggled to turn on/off the obstruction properties for that line (thus opening the door, allowing people to see through).

Enabling a window will change the line to be 'dashed'.  A windowed line is able to be seen through by players, but will still block movement (if blocking is enabled).

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-door.webp)

You can 'disable' a door and remove the door icon through the same process, selecting 'Disable Door'.
You can toggle the opening of a door in two ways;
1. Double click the door icon.
2. Select 'Open Door' on the context menu

By default, only a GM can see doors on a map.  If you would like your players to be able to see doors, select the option in the Settings panel.
If your players are a little click-happy, you can 'Lock Door' to stop players from being able to toggle them open.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-customfog"></a>3. Using Custom Fog
Sometimes flat-colored fog isn't exactly what you're going for.  If you want things to get a little fancy, Custom Fog is a great feature to spruce things up.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog1.webp)

The basic steps are;
1. Make sure your Custom Fog image is on the Map layer.
2. Overlay the Custom Fog image on top of your regular map.
3. On the context-menu for the Custom Fog image, select 'Convert to Fog Background'.
4. Done!

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog2.webp)

<i>Note: To remove the Fog Background, use the Fog Tool to Select the Custom Fog Background (Because it's a Fog Item now!) and select the option to Convert the item back.</i>
<p align="right">(<a href="#smoke">back to top</a>)</p>


#### <a id="smoke-fogeffects"></a>3. Using Fog Effects

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-enhancedfog.webp)

Fog Effects is a one-touch way of getting stylish fog effects without needing to do much setup.  The flip-side is, you only have access to the ones I have created!

To add a fog-style, double-click a map to see the "Auto Fog" options.
- Effect: A list of different effects to replace the default 'fog' with.
- Style: This dictates the style.  
    - Map fog is generally see-through in a way that you can still see the base map through the effect (though it will still obscure tokens).
    - Flat fog will block the transparency, and only display the effect as fog.

<i>Note: Fog Effects are done via Shaders - and using a lot of them at once can cause some strain on lower-end devices.  Be smart in how you set your scenes up.</i>

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-enhancedfog2.webp)

<i>Note: To remove the Fog Background, use the Fog Tool to Select the Custom Fog Background (Because it's a Fog Item now!) and select the option to Convert the item back.</i>
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Elevation Mapping <a id="smoke-elevation" name="smoke-elevation">
Elevation Mapping allows you to add some depth to your 2D Scene, by assigning 'areas' to the map where certain points/tokens are higher than others.

#### <a id="smoke-elevation-map"></a>1. How it works
When setting up elevation, you have two styles and a few layers to play with. (I've limited this to six to keep things simple, but technically it can be expanded.)

The styles are "Mesa" and "City".
The idea behind Mesa style - is hills, plateaus and cliffs. 
With layers 1-6, the calculations become different. If you have a token and an obstruction both within a Layer 1 mapping, the token can see PAST the obstruction!
But if you have a token with a Layer 1 mapping, and an obstruction within a Layer 2 Mapping, the player CANNOT see past the obstruction. Because the obstruction is at a higher depth.

The "City" style is the same as you would expect on the base layer, but for all layers.

Now for an active example (with Mesa);
Here is a token on an island map. Their vision is not obstructed at all. I have toggled on the Elevation Mapping View so I can use the tools.  I have used Elevation Mapping Layer-1 tool to surround the area I'm going to be working in. (This is to make sure no obstructions I draw within here end up on Elevation Mapping Layer-0, and thus always block vision.)

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-1.webp)

Next, I draw obstruction lines around the items I want to block vision. (This screenshot has the Elevation Mapping View toggled off, so that you can see easier.)
Notice how the obstruction lines don't block a single thing.  This is because the token AND the obstructions all exist within the Elevation Mapping Layer-1 area.  So they are all at the same depth.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-2.webp)

With the base work done, I want to make sure my rocks are higher up - so that I can't see past them when I'm on the ground, and if I stood upon them - I can see the top of them and everything below.  So I'm going to use the Elevation Mapping Layer-1 Tool and draw an area around my rocks.
I draw my mappings AROUND the obstructions, fairly closely. This is because if a player is standing CLOSE to the object, I do not want them to accidentally be within that mapping.
<i>Note: You can layer mappings, and the highest layer will always take priority.</i>

Notice that while on the beach area, I can no longer see past the rocks.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-3.webp)
But when standing on the rocks (within Elevation Mapping Layer-1, the same that the obstruction lines are in), I can see on top of them and off the sides!


![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-4.webp)

But I can still see the next rock above me.. so I'm going to use the next numbered elevation mapping tool.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-5.webp)

Now I can no longer see to the top, but I can see below.  Turn off the Elevation Mapping View so that the layers hide themselves and the effect is complete.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-6.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-elevation-tools"></a>2. The Mapping Layer Tools

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

The numbered mountains on the Obstruction Tool Bar are the Elevation Mapping Layer Tools.
Or "MEL" if you want to read it as Mapping Elevation Layer, which for the suck of not writing it a million times - I will.
Each MEL Tool has a number next to it designating what layer it interacts with.
Tier 1 is Blue colored.
Tier 2 is Green colored.
Tier 3 is Yellow colored.
Tier 4 is Orange colored.
Tier 5 is Red colored.
They mimic a regular elevation map that you would see for mountains.  You can stack these mappings if you want, and for any points within several shapes - only the highest mapping is considered.
Meaning, if you circled your entire map in Tier 1, and then drew in the center as Tier 5 - any points in that center would be considered at Tier 5.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-elevation-view"></a>3. The Mapping View Toggle
The last two tools are the MEL Select Tool and MEL View Toggle.
Since the layers can cause a lot of visual clutter, you need to enable the toggle in order to see/use them.
This is also for people who do not want to use them do not need to see anything about it.
When the View is toggled on, the MEL tools are all enabled and you can draw.  When you turn the MEL View off - the information is then saved to the scene, and the visual indications of the layers are removed.
To make things easier and not have to swap between different tool bars, the MEL Select Tool exists so you can grab a layer and interact with it while staying on the Obstruction Tool Bar.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Importing Fog Files <a id="smoke-import" name="smoke-import">
You can find information on the UVTT Format here - [ArkenForge UVTT](https://arkenforge.com/universal-vtt-files/) as well as a sample file to try it out [here](https://www.dropbox.com/s/s494c3l6bnblmbu/The%20Pig%20and%20Whistle%20tavern.uvtt?dl=1).
UVTT Files have the .uvtt extension (Though some may differ depending on the application the VTT they were designed for).  Smoke&Spectre can accept general UVTT scenes as well as ones configured for Foundry (more may be added in the future).
When importing a scene, you will be asked where you want to import the Map to in your OBR storage - and the rest will handled for you.
For the other types, it generally expects the map to already be within the scene - so select the map from the Alignment dropdown, and then import your file.  It may take some trial and error depending on the DPI of the map (Not all files are made the same!). Owlbear's default DPI is 150 per grid unit.
<i>Note: There are some exceptions to this rule, where some files are outright badly configured.  There isn't much to be done in this case, so use your best judgement to align the map to the obstruction lines once they are imported.</i>
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-import.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: Usage and Use Cases<a id="spectre-usage" name="spectre-usage">
Spectre is completely different form dynamic fog, in the sense that the two have nothing to do with each other!
Zip! Zero! Nothing!
They are together simply because I thought combined that they created a dramatic event for scenes.

When a token becomes  a "Spectre", it becomes viewable to only you. The person who has made it a spectre.  You are able to see it on your screen all the same though. You are then able to select which people within your room you want to be able to view that token.
Why would you want to do this?
1. Perhaps you have some notes on the screen that you do not want to be 'hidden' because they become partially transparent and hard to read. If you Spectre it, it will maintain it's visibility and only be visible to you.
2. One of your players is haunted by ghosts only they can see.  You could Spectre a ghost, and make it only visible to them. Then when that player begins asking questions about the ghost, everyone else would just assume they are crazy - because no one else sees it.
3. Maybe one of your players has Truesight.  You could set up a seemingly boring room with few things in it, which is what other players would see - and then load it up with Spectre'd props like gold, bodies, books, etc that only they can see.

There's no defined list in how you go about it, but the general idea is controlling their perception (Which is very much where Smoke & Spectre intersect on their use cases.)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: How it works<a id="spectre-works" name="spectre-works">
Now, <i> from a technical perspective</i>...
Spectre removes an item from the scene, and recreates it as a local item.  Local items are 'temporary' items that are only seen by the creator. Local items generally have the caveat of disappearing on refresh, but Spectre snapshots everything to your scene so you will not lose your items on a refresh.

A drawback to this is that a Spectre item isn't a 'real' item. So other extensions cannot (Should not) interact with a Spectre'd token.
You can still manipulate a Spectre'd token, in terms of moving and resizing it. A player can also interact with the token if they need to. The way the Spectre'd token update will be a little 'choppier' though, as again, it's not a real item so the way OBR generally animates tokens moving/resizing doesn't happen here.

From a thematic perspective, there are ways around this. You could hide the tokens before moving them, or simply wait until the token is out of their view range. Or blind your player for a moment before doing your updates.
Or just.. do it in front of them. The difference isn't super noticeable, I just feel the need to point it out.
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="spectre-vision"></a>1. Who can see the token
On the Spectre Panel, when a token has been Spectre'd you'll see it pop up here. Next to the token's name is a player drop down.
You can select as many other players as you want to be able to view this token.
You can only select players that are in the room, as the list is populated based on that.
By default, when you Spectre a token you are the only person that can see it.  For everyone else, it'll look as if it was deleted.
![gmview view](https://battle-system.com/owlbear/smoke-docs/spectre-vision.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="spectre-tokens"></a>2. Where do the tokens go
Spectre'd token data is bundled up and stored in your scene. So if you decide to clear out your scene metadata, the Spectre'd token information will also go along with it.  In general, scene data is rather large (it uses your OBR storage, and if you have subscribed you probably have a ton of it) - but Spectre does place a cap on how many things you can it enabled on in the scene for data transmission purposes.

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Support

If you have questions, please join the [Owlbear Rodeo Discord](https://discord.gg/u5RYMkV98s).

Or you can reach out to me at manuel@battle-system.com.
You can also support these projects at the [Battle-System Patreon](https://www.patreon.com/battlesystem).
<p align="right">(<a href="#smoke">back to top</a>)</p>`;
}