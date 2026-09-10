import{m as e}from"./obr-vendor-C3bwD0JM.js";let t=function(e){return e.EXTENSIONID=`com.battle-system.smoke`,e.BROADCASTCHANNEL=`SMOKE-BROADCAST`,e}({});const n={USE_APP_METRICS:!0,METRICS_BATCH_SIZE:25,METRICS_FLUSH_MS:1e4};let r=function(e){return e[e.MOVE=0]=`MOVE`,e[e.LINE=1]=`LINE`,e[e.QUAD=2]=`QUAD`,e[e.CONIC=3]=`CONIC`,e[e.CUBIC=4]=`CUBIC`,e[e.CLOSE=5]=`CLOSE`,e}({}),i=function(e){return e.North=`NORTH`,e.Northeast=`NORTHEAST`,e.East=`EAST`,e.Southeast=`SOUTHEAST`,e.South=`SOUTH`,e.Southwest=`SOUTHWEST`,e.West=`WEST`,e.Northwest=`NORTHWEST`,e}({});var a=class{static{this.UP=`UP`}static{this.DOWN=`DOWN`}static{this.LEFT=`LEFT`}static{this.RIGHT=`RIGHT`}static{this.DELAY=500}static{this.SHORTDELAY=300}static{this.EXTENSIONID=`com.battle-system.smoke`}static{this.EXTENSIONNOTICE=`com.battle-system.smoke-notice`}static{this.PROGRESSBAR=`com.battle-system.smoke-progress`}static{this.CONVERSIONOVERLAY=`com.battle-system.smoke-converting`}static{this.RESETID=`com.battle-system.smoke-reset`}static{this.SPECTREID=`com.battle-system.spectre`}static{this.EXTENSIONWHATSNEW=`com.battle-system.smoke-whatsnew`}static{this.LINETOOLID=`com.battle-system.linetool`}static{this.POLYTOOLID=`com.battle-system.polytool`}static{this.ELEVATIONTOOLID=`com.battle-system.elevationtool`}static{this.ELEVATIONWARNID=`com.battle-system.elevationwarn`}static{this.BRUSHTOOLID=`com.battle-system.brushtool`}static{this.PROCESSEDID=`com.battle-system.processing`}static{this.CONTEXTID=`com.battle-system.smoke-context`}static{this.GRIDID=`d9953ba1-f417-431c-8a39-3c3376e3caf0`}static{this.SPECTREBROADCASTID=`SPECTREBROADCAST`}static{this.WARNINGCASTID=`SMOKEWARNINGCAST`}static{this.RESETPERSISTID=`RESETPERSISTID`}static{this.DEFAULTLINECOLOR=`#000000`}static{this.DEFAULTLINEWIDTH=8}static{this.DEFAULTLINESTROKE=[]}static{this.LINELAYER=`POINTER`}static{this.DOORCOLOR=`#4de600`}static{this.WINDOWCOLOR=`#ADD8E6`}static{this.ATTENUATIONDEFAULT=`30`}static{this.SOURCEDEFAULT=`0`}static{this.FALLOFFDEFAULT=`0`}static{this.DARKVISIONDEFAULT=`0`}static{this.INANGLEDEFAULT=`360`}static{this.OUTANGLEDEFAULT=`360`}static{this.DOOROPEN=`https://battle-system.com/owlbear/smoke-docs/opendoor.svg`}static{this.DOORCLOSED=`https://battle-system.com/owlbear/smoke-docs/closeddoor.svg`}static{this.DOORLOCKED=`https://battle-system.com/owlbear/smoke-docs/lockeddoor.svg`}static{this.TRAILINGCOLLAR=[[e.MOVE,250,250],[e.LINE,250,220],[e.LINE,320,220],[e.LINE,320,280],[e.LINE,280,280],[e.LINE,280,200],[e.LINE,220,200],[e.LINE,220,300],[e.LINE,380,280],[e.LINE,380,230],[e.LINE,380,180],[e.CLOSE],[e.MOVE,250,270],[e.CUBIC,300,270,350,260,350,250],[e.CUBIC,350,240,300,230,250,230],[e.CUBIC,200,230,150,240,150,250],[e.CUBIC,150,260,200,270,250,270],[e.CLOSE]]}static{this.FOGGYSTYLE=`FOGGY`}static{this.SPOOKYSTYLE=`SPOOKY`}static{this.DRIPSTYLE=`DRIP`}static{this.COSMICSTYLE=`COSMIC`}static{this.WEIRDSTYLE=`WEIRD`}static{this.FLESHSTYLE=`FLESH`}static{this.WATERSTYLE=`WATER`}static{this.ENHANCEDFOGSTYLES=new Map([[`0`,`Map Fog`],[`100`,`Flat Fog`]])}static{this.ENHANCEDFOGEFECTS=[{key:`NONE`,value:`None`},{key:this.DRIPSTYLE,value:`Drip`},{key:this.COSMICSTYLE,value:`Cosmic`},{key:this.FLESHSTYLE,value:`Flesh`},{key:this.FOGGYSTYLE,value:`Foggy`},{key:this.SPOOKYSTYLE,value:`Spooky`},{key:this.WATERSTYLE,value:`Water`},{key:this.WEIRDSTYLE,value:`Weird`}]}static{this.WATERSHADER=`
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
        `}static{this.ANNIHILATIONSHADER=`
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
    `}static{this.FLESHSHADER=`
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
        `}static{this.WEIRDSHADER=`
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
        `}static{this.COSMICSHADER=`
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
        }`}static{this.FOGGYSHADER=`
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
    `}static{this.SPOOKYSHADER=`
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
    `}static{this.TRAILINGFOGSHADER=`
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
    `}static{this.TRAILINGFOGREVEALSHADER=`
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
    `}static{this.DARKVISIONSHADER=`
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
    `}};export{r as a,t as i,i as n,n as r,a as t};