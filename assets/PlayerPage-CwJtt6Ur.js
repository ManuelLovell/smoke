import{d as e}from"./icons-vendor-BpXzVROX.js";import"./react-vendor-BMLPjHd5.js";import"./obr-vendor-CnAfirNi.js";import{r as t,t as n}from"./motion-vendor-DDi9iG0R.js";import"./state-vendor-BGHfjabw.js";import"./BSConstants-BGwuYoi3.js";import"./vendor-BzuDUZ9Q.js";import{n as r}from"./Translation-DKmTBNbC.js";import{n as i}from"./style-vendor-D1g7eVte.js";import{a,u as o,v as s}from"./main-CqF9V8S0.js";import{c,l}from"./SharedStyledComponents-DbwU693m.js";import{t as u}from"./SettingsTooltip-Dib63exk.js";import{t as d}from"./MainPageTooltipContent-DEVXrGJE.js";import{n as f}from"./MetadataKeys-BLswop8o.js";var p=e(),m=t(),h=i.div`
  ${{width:`100%`}}
  padding: 12px;
`,g=i.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(6, 34px);
  gap: 16px;
  align-items: center;
  margin-bottom: 8px;
`,_=i.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(6, 34px);
  gap: 16px;
  align-items: center;
  padding: 6px 0;
`,v=i.div`
  ${{display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:`0.75rem`,fontWeight:`600`}}
  opacity: 0.8;
  text-align: center;
`,y=i.img`
  width: 24px;
  height: 24px;
  display: block;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.15));
`,b=i.div`
  ${{fontSize:`1.125rem`,fontWeight:`500`}}
  text-align: left;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,x=i.div`
  ${{fontSize:`1.125rem`}}
  text-align: center;
  opacity: 0.95;
`,S=i.div`
  ${{fontSize:`0.875rem`}}
  opacity: 0.7;
`,C=e=>e.type===`IMAGE`,w=e=>{let t=e.metadata[f.VISION_RANGE],n=e.metadata[f.VISION_SOURCE],r=e.metadata[f.VISION_IN_ANGLE],i=e.metadata[f.VISION_OUT_ANGLE],a=e.metadata[f.VISION_FALLOFF],o=e.metadata[f.VISION_DARKNESS];return{range:typeof t==`number`&&Number.isFinite(t)?t:30,collision:typeof n==`number`&&Number.isFinite(n)?n:0,innerAngle:typeof r==`number`&&Number.isFinite(r)?r:360,outerAngle:typeof i==`number`&&Number.isFinite(i)?i:360,falloff:typeof a==`number`&&Number.isFinite(a)?a:1,darkness:typeof o==`number`&&Number.isFinite(o)?o:0}};const T=()=>{let{theme:e}=a(),{t}=r(),i=(0,p.useMemo)(()=>d(t),[t]),T=s(e=>e.items),E=s(e=>e.playerData),D=(0,p.useMemo)(()=>T.filter(C),[T]),O=(0,p.useMemo)(()=>{let e=new Map;for(let t of D)e.set(t.id,t);return e},[D]),k=(0,p.useMemo)(()=>E?.id?D.filter(e=>o(e)&&e.createdUserId===E.id):[],[D,E?.id]),A=e=>{let t=e.metadata[f.LINKED_TO];return typeof t!=`string`||t.length===0||t===e.id?e:O.get(t)??e};return(0,m.jsx)(n.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},children:(0,m.jsxs)(c,{theme:e,children:[(0,m.jsx)(l,{theme:e,children:t(`nav.player`)}),k.length===0?(0,m.jsx)(S,{children:t(`player.emptyOwnedVision`)}):(0,m.jsxs)(h,{children:[(0,m.jsxs)(g,{children:[(0,m.jsx)(v,{}),(0,m.jsx)(v,{children:(0,m.jsx)(u,{theme:e,text:i.visionRange,children:(0,m.jsx)(y,{src:`/visionRange.svg`,alt:t(`presets.range`)})})}),(0,m.jsx)(v,{children:(0,m.jsx)(u,{theme:e,text:i.visionCollision,children:(0,m.jsx)(y,{src:`/visionBumper.svg`,alt:t(`presets.collision`)})})}),(0,m.jsx)(v,{children:(0,m.jsx)(u,{theme:e,text:i.visionInnerAngle,children:(0,m.jsx)(y,{src:`/visionInner.svg`,alt:t(`presets.innerAngle`)})})}),(0,m.jsx)(v,{children:(0,m.jsx)(u,{theme:e,text:i.visionOuterAngle,children:(0,m.jsx)(y,{src:`/visionOuter.svg`,alt:t(`presets.outerAngle`)})})}),(0,m.jsx)(v,{children:(0,m.jsx)(u,{theme:e,text:i.visionFalloff,children:(0,m.jsx)(y,{src:`/visionFalloff.svg`,alt:t(`presets.falloff`)})})}),(0,m.jsx)(v,{children:(0,m.jsx)(u,{theme:e,text:i.visionDarkness,children:(0,m.jsx)(y,{src:`/darkvision.svg`,alt:t(`presets.darkvision`)})})})]}),k.map(e=>{let t=w(A(e));return(0,m.jsxs)(_,{children:[(0,m.jsx)(b,{children:e.text?.plainText||e.name}),(0,m.jsx)(x,{children:t.range}),(0,m.jsx)(x,{children:t.collision}),(0,m.jsx)(x,{children:t.innerAngle}),(0,m.jsx)(x,{children:t.outerAngle}),(0,m.jsx)(x,{children:Math.round(t.falloff*10)/10}),(0,m.jsx)(x,{children:t.darkness})]},e.id)})]})]})})};export{T as PlayerPage};