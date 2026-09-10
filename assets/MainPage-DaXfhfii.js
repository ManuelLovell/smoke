import{n as e}from"./rolldown-runtime-xNPNHALf.js";import{a as t,c as n,d as r,l as i,s as a}from"./icons-vendor-BpXzVROX.js";import"./react-vendor-BMLPjHd5.js";import{d as o,g as s,h as c}from"./obr-vendor-CnAfirNi.js";import{r as l,t as u}from"./motion-vendor-DDi9iG0R.js";import"./state-vendor-C55H3284.js";import"./BSConstants-CIgOEcMM.js";import{n as d,t as f}from"./BSCache-TnHMU0hT.js";import"./SmokeMetrics-B5bosJID.js";import"./vendor-CIquYMec.js";import{n as p}from"./Translation-CqsdLp_x.js";import{l as m}from"./ItemFilters-HnDqldTJ.js";import{n as h,t as g}from"./MetadataKeys-BcqLOnQ8.js";import{n as _,r as v}from"./ThemeContext-BrJdz178.js";import{n as y}from"./style-vendor-BMLvKWKs.js";import{c as b,p as x}from"./SharedStyledComponents-5Tj7YKs-.js";import{t as S}from"./SettingsTooltip-CeZq-OEi.js";import{t as ee}from"./ToggleControl-CAEPtoYd.js";import{t as te}from"./MainPageTooltipContent-8e3VaqbV.js";var C=e(r(),1),w=l(),T=[0,15,30,45,60,75,90],E=(e,t,n,r)=>{let i=(r-90)*Math.PI/180;return{x:e+n*Math.cos(i),y:t+n*Math.sin(i)}},D=(e,t,n,r,i,a)=>{let o=E(e,t,n,i),s=E(e,t,n,a),c=E(e,t,r,a),l=E(e,t,r,i),u=a-i>180?1:0;return[`M ${o.x} ${o.y}`,`A ${n} ${n} 0 ${u} 1 ${s.x} ${s.y}`,`L ${c.x} ${c.y}`,`A ${r} ${r} 0 ${u} 0 ${l.x} ${l.y}`,`Z`].join(` `)},O=y.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`,ne=y.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #24282A;
  border: 2px solid ${e=>e.$accent||`#C98A3E`};
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  user-select: none;
  cursor: ${e=>e.$editing?`text`:`grab`};
  position: relative;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #EDEAE3;
  z-index: 1;
`,re=y.input`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  border: none;
  outline: none;
  color: #EDEAE3;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  padding: 0;
`,k=y.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8));
`,A=y.svg`
  overflow: visible;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9));
`;const ie=({value:e,onChange:t,min:n=0,max:r=99,accent:i=v.OFFSET,presets:a=T})=>{let[o,s]=(0,C.useState)(!1),[c,l]=(0,C.useState)(String(e)),[u,d]=(0,C.useState)(null),[f,p]=(0,C.useState)(null),m=(0,C.useRef)(null),h=(0,C.useRef)(null),g=e=>Math.min(r,Math.max(n,e)),_=e=>{let n=Number.parseFloat(e);t(Number.isNaN(n)?0:n,`manual`),s(!1)};return(0,w.jsxs)(O,{children:[(0,w.jsx)(ne,{ref:m,$accent:i,$editing:o?`true`:void 0,onPointerDown:e=>{if(!o&&m.current){let t=m.current.getBoundingClientRect();p({x:t.left+t.width/2,y:t.top+t.height/2}),m.current.setPointerCapture(e.pointerId),h.current={moved:!1}}},onPointerMove:e=>{if(!h.current||!f)return;let t=e.clientX-f.x,n=e.clientY-f.y;if(Math.hypot(t,n)>14){h.current.moved=!0;let e=Math.atan2(n,t)*180/Math.PI+90;e=(e+360)%360;let r=360/a.length;d(Math.round(e/r)%a.length)}else d(null)},onPointerUp:()=>{if(!h.current)return;let n=h.current.moved,r=u;h.current=null,d(null),p(null),n&&r!=null&&a[r]!==void 0?t(g(a[r]),`preset`):(l(String(e)),s(!0))},children:o?(0,w.jsx)(re,{autoFocus:!0,value:c,onChange:e=>{let t=e.target.value;(t.match(/\./g)||[]).length>1&&(t=t.replace(/\.(?=.*\.)/g,``)),l(t.replace(/[^\d.]/g,``))},onBlur:()=>_(c),onKeyDown:e=>{e.key===`Enter`&&_(c),e.key===`Escape`&&s(!1)},inputMode:`decimal`}):(0,w.jsx)(`span`,{children:e})}),f!=null&&f&&(0,w.jsx)(k,{children:(0,w.jsxs)(A,{width:`180`,height:`180`,viewBox:`0 0 180 180`,children:[a.map((t,n)=>{let r=360/a.length,o=n*r-r/2,s=n*r+r/2,c=u===n,l=e===t,d=E(90,90,66,n*r);return(0,w.jsxs)(`g`,{children:[(0,w.jsx)(`path`,{d:D(90,90,82,40,o,s),fill:c?i:l?`#506772`:`#2A2E30`,opacity:1,stroke:c?i:`#555`,strokeWidth:c?3:1.5,style:{transition:`all 80ms ease`}}),(0,w.jsx)(`text`,{x:d.x,y:d.y,fill:c?`#000`:`#FFF`,fontFamily:`'IBM Plex Mono', monospace`,fontSize:c?16:14,fontWeight:700,textAnchor:`middle`,dominantBaseline:`middle`,style:{pointerEvents:`none`,transition:`all 80ms ease`},children:t})]},n)}),(0,w.jsx)(`circle`,{cx:90,cy:90,r:38,fill:`#24282A`,stroke:i,strokeWidth:2})]})})]})};var j=y.div`
  width: 46px;
  height: 40px;
  border-radius: 8px;
  position: relative;
  background: #31363A;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  cursor: ns-resize;
  border: 2px solid #1B1E1F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: #EDEAE3;
`,M=y.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${e=>e.$fillPct}%;
  background: ${e=>e.$accent||`#C98A3E`};
  opacity: 0.35;
  transition: height 120ms ease;
  pointer-events: none;
`,N=y.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
`,ae=y.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #EDEAE3;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  z-index: 3;
`,P=y.button`
  position: absolute;
  ${e=>e.$position}: 1px;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  border: none;
  color: rgba(237, 234, 227, 0.45);
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;

  &:hover {
    color: rgba(237, 234, 227, 0.7);
  }
`;const oe=({value:e,onChange:t,min:r=0,max:a=99,step:o=1,accent:s=v.OFFSET})=>{let{t:c}=p(),[l,u]=(0,C.useState)(!1),[d,f]=(0,C.useState)(String(e)),[m,h]=(0,C.useState)(e),g=(0,C.useRef)(null);(0,C.useEffect)(()=>{h(e)},[e]);let _=e=>{let t=Math.min(a,Math.max(r,e)),n=Math.round(t/o)*o,i=(o.toString().split(`.`)[1]||``).length;return parseFloat(n.toFixed(i))},y=e=>{let n=Number.parseFloat(e);t(Number.isNaN(n)?0:n,`manual`),u(!1)},b=t=>{l||(t.currentTarget.setPointerCapture(t.pointerId),g.current={startY:t.clientY,startVal:e,currentVal:e,moved:!1})},x=e=>{if(!g.current)return;let t=g.current.startY-e.clientY;if(Math.abs(t)>4&&(g.current.moved=!0),!g.current.moved)return;let n=Math.round(t/6),r=_(g.current.startVal+n*o);r!==g.current.currentVal&&(g.current.currentVal=r,h(r))},S=()=>{if(!g.current)return;let n=g.current.moved,r=g.current.currentVal;g.current=null,n?(r!==e&&t(r,`drag`),f(String(r)),h(r)):(f(String(e)),u(!0))},ee=(n,r)=>{r.stopPropagation(),t(_(e+n*o),`preset`)};return(0,w.jsxs)(j,{onPointerDown:b,onPointerMove:x,onPointerUp:S,children:[(0,w.jsx)(M,{$fillPct:Math.max(0,Math.min(100,(m-r)/(a-r)*100)),$accent:s}),l?(0,w.jsx)(ae,{autoFocus:!0,value:d,onChange:e=>{let t=e.target.value;(t.match(/\./g)||[]).length>1&&(t=t.replace(/\.(?=.*\.)/g,``)),f(t.replace(/[^\d.]/g,``))},onBlur:()=>y(d),onKeyDown:e=>{e.key===`Enter`&&y(d),e.key===`Escape`&&u(!1)},inputMode:`decimal`}):(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(N,{children:Number(m.toFixed(3))}),(0,w.jsx)(P,{$position:`top`,onPointerDown:e=>e.stopPropagation(),onClick:e=>ee(1,e),"aria-label":c(`common.increase`),children:(0,w.jsx)(n,{size:8})}),(0,w.jsx)(P,{$position:`bottom`,onPointerDown:e=>e.stopPropagation(),onClick:e=>ee(-1,e),"aria-label":c(`common.decrease`),children:(0,w.jsx)(i,{size:8})})]})]})};var F=y.div`
  ${{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`0.5rem`}}
`,I=y.div`
  ${{display:`flex`,justifyContent:`center`}}
`,L=y.label`
  ${{fontSize:`0.75rem`,fontWeight:`600`}}
  color: ${e=>e.$accent||`#C98A3E`};
`;const R=({value:e,onChange:t,min:n,max:r,accent:i=v.OFFSET,mode:a=`flywheel`,label:o,presets:s,step:c=1})=>(0,w.jsxs)(F,{children:[o&&(0,w.jsx)(L,{$accent:i,children:o}),(0,w.jsx)(I,{children:a===`flywheel`?(0,w.jsx)(ie,{value:e,onChange:t,min:n,max:r,accent:i,presets:s}):(0,w.jsx)(oe,{value:e,onChange:t,min:n,max:r,step:c,accent:i})})]});var se=class{static async CenterViewportOnImage(e){let t=f.sceneItems.find(t=>t.id===e),n=await o.scene.grid.getDpi(),r=await o.viewport.getScale(),i=await o.viewport.getWidth(),a=await o.viewport.getHeight(),s={x:i/2,y:a/2},c={x:s.x/r,y:s.y/r},l=await this.GetImageCenter(t,n),u={x:l.x-c.x,y:l.y-c.y},d={x:u.x*r*-1,y:u.y*r*-1};await o.viewport.animateTo({position:d,scale:r})}static async GetImageCenter(e,t){if(c(e)){let n=t/e.grid.dpi,r=e.image.width*n,i=e.image.height*n,a=e.grid.offset.x/e.image.width*r,o=e.grid.offset.y/e.image.height*i;return{x:e.position.x-a+r/2,y:e.position.y-o+i/2}}else if(s(e)&&e.points.length>0)return{x:e.points[0].x,y:e.points[0].y};else return{x:e.position.x,y:e.position.y}}},z=h.VISION_RANGE,B=h.VISION_DARKNESS,V=h.VISION_SOURCE,H=h.VISION_FALLOFF,U=h.VISION_IN_ANGLE,W=h.VISION_OUT_ANGLE,ce=h.VISION_BLIND,le=h.LINKED_TO,G=h.HIDDEN_TOKEN,K=[`#C98A3E`,`#4E8C82`,`#8C6E9C`,`#B3583F`,`#5B7FA6`,`#9AA53F`],ue=y(b)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100%;
`,de=y.div`
  ${{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:`0.75rem`}}
  border: 2px solid ${e=>e.theme.BORDER};
  background-color: ${e=>e.theme.OFFSET};
  border-radius: 6px;
  padding: 4px 8px;
  margin-bottom: 8px;
`,fe=y.h1`
  margin: 0;
  padding-left: 12px;
  color: ${e=>e.theme.PRIMARY};
  font-size: 20px;
  font-weight: bold;
  font-variant: small-caps;
`,pe=y.div`
  ${{display:`flex`,alignItems:`center`,gap:`0.5rem`}}
`,me=y.span`
  ${{fontSize:`0.75rem`,fontWeight:`600`}}
  color: ${e=>e.theme.PRIMARY};
  opacity: 0.9;
`,he=y.div`
  ${{overflow:`auto`}}
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    padding: 0 8px;
    justify-content: stretch;
  }
`,ge=y.div`
  display: grid;
  grid-template-columns: repeat(${e=>e.$columns}, 1fr);
  row-gap: 2px;
  min-width: max-content;
  height: 100%;
  margin: 0 auto;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    width: 100%;
    min-width: 0;
    row-gap: 10px;
  }
`,q=y.div`
  ${{fontSize:`0.75rem`,fontWeight:`600`}}
  color: ${e=>e.$accent||`#8B9190`};
  text-align: center;
  padding: 8px 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: none;
  }
`,_e=y.div`
  display: none;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: 28px 8px repeat(3, 44px) 8px 28px;
    justify-content: center;
    grid-template-areas:
      'link . range collision inner . blind'
      '. . outer falloff darkness . .';
    row-gap: 8px;
    column-gap: 0;
    padding: 2px 8px 6px;
  }
`,J=y.div`
  display: none;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: flex;
    grid-area: ${e=>e.$area};
    align-items: center;
    justify-content: center;
    color: ${e=>e.$accent||`#8B9190`};
  }
`,Y=y.img`
  width: 22px;
  height: 22px;
  display: block;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.15));
`,ve=y.div`
  color: ${e=>e.$isSelected?`#e05cae`:`#fff`};
  font-weight: ${e=>e.$isSelected?`800`:`400`};
  display: flex;
  word-break: break-word;
  text-align: center;
  cursor: pointer;
  opacity: ${e=>e.$isDragging?.55:1};
  outline: ${e=>e.$isDropTarget?`2px dashed rgba(237, 234, 227, 0.65)`:`none`};
  border-radius: 6px;
  padding: 2px 6px;
`,ye=y.div`
  ${{fontSize:`0.75rem`}}
  line-height: 2.2;
  color: rgba(237, 234, 227, 0.7);
  font-family: 'IBM Plex Mono', monospace;
  text-align: center;
  padding-left: 6px;
`,be=y.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding-top: 4px;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-column: auto;
    grid-area: name;
    padding-top: 0;
  }
`,X=y.div`
  ${{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`0.5rem`}}
  padding: 0 4px;
  align-self: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: ${e=>e.$mobileArea||`auto`};
    width: 44px;
    padding: 0;
  }
`,xe=y.div`
  ${{display:`flex`,alignItems:`center`,justifyContent:`center`}}
  padding: 0 2px;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: link;
    justify-self: center;
  }
`,Se=y(X)`
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: blind;
  }
`,Ce=y.div`
  grid-column: 1 / -1;
  display: contents;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: grid;
    grid-template-columns: 28px 8px repeat(3, 44px) 8px 28px;
    justify-content: center;
    grid-template-areas:
      'name name name name name name name'
      'link . range collision inner . blind'
      'link . outer falloff darkness . blind';
    row-gap: 6px;
    column-gap: 6px;
    padding: 6px 8px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  }
`,we=y.div`
  ${{position:`fixed`,inset:`0`,zIndex:`50`}}
  background-color: rgba(0, 0, 0, 0.6);
  display: ${e=>e.$isOpen?`flex`:`none`};
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`,Te=y.div`
  ${{width:`100%`,maxWidth:`24rem`,borderRadius:`0.5rem`,padding:`1.5rem`,"--tw-shadow":`0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,"--tw-shadow-colored":`0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -2px var(--tw-shadow-color)`,boxShadow:`var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)`}}
  background-color: rgb(82, 77, 114);
  border: 2px solid ${e=>e.theme.BORDER};
  max-height: 70vh;
  overflow-y: auto;
`,Ee=y.h2`
  ${{marginBottom:`1rem`,fontSize:`1.125rem`,fontWeight:`700`}}
  color: ${e=>e.theme.PRIMARY};
`,De=y.div`
  ${{display:`flex`,flexDirection:`column`,gap:`0.5rem`}}
`,Oe=y.div`
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid ${e=>e.theme.BORDER};
`,ke=y.div`
  ${{display:`flex`,gap:`1rem`}}
  justify-content: space-between;
`,Ae=y.button`
  ${{width:`100%`,cursor:`pointer`,borderRadius:`0.25rem`,paddingLeft:`1rem`,paddingRight:`1rem`,paddingTop:`0.75rem`,paddingBottom:`0.75rem`,textAlign:`left`,transitionProperty:`all`}}
  background-color: ${e=>e.theme.OFFSET};
  color: ${e=>e.theme.PRIMARY};
  border: 2px solid ${e=>e.theme.BORDER};
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: ${e=>e.theme.OFFSET}dd;
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
`,je=y.div`
  ${{paddingLeft:`1rem`,paddingRight:`1rem`,paddingTop:`3rem`,paddingBottom:`3rem`,textAlign:`center`}}
  color: rgba(237, 234, 227, 0.9  );
  font-size: 0.9rem;
`,Z=y.button`
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${e=>e.$accent||`rgba(255, 255, 255, 0.35)`};
    background: rgba(255, 255, 255, 0.08);
  }
`,Me=y.div`
  ${{borderRadius:`0.5rem`,padding:`1rem`,"--tw-shadow":`0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,"--tw-shadow-colored":`0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -2px var(--tw-shadow-color)`,boxShadow:`var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)`}}
  background-color: rgb(82, 77, 114);
  border: 2px solid ${e=>e.theme.BORDER};
  width: 220px;
`,Ne=y.h3`
  ${{marginBottom:`0.75rem`,textAlign:`center`,fontSize:`0.875rem`,fontWeight:`700`}}
  color: ${e=>e.theme.PRIMARY};
`;const Pe=()=>{let{theme:e}=_(),{t:n}=p(),r=d(e=>e.items),i=d(e=>e.partyData),s=d(e=>e.playerData),c=d(e=>e.sceneMetadata),[l,f]=(0,C.useState)(!1),[h,y]=(0,C.useState)(null),[b,T]=(0,C.useState)(null),[E,D]=(0,C.useState)(null),[O,ne]=(0,C.useState)(null),[re,k]=(0,C.useState)(0),[A,ie]=(0,C.useState)(!0),j=(0,C.useMemo)(()=>te(n),[n]),M=(0,C.useMemo)(()=>c[g.CONTROL_MODE]===`roller`?`roller`:`flywheel`,[c]),N=(0,C.useMemo)(()=>({range:{key:z,min:0,max:120,presets:[0,15,30,45,60,75,90],accent:K[0],label:n(`presets.range`)},collision:{key:V,min:0,max:20,presets:[0,2,4,6,8,10,12,14,16,18,20],accent:K[1],label:n(`presets.collision`)},innerAngle:{key:U,min:0,max:360,presets:[0,36,72,108,144,180,216,252,288,324,360],accent:K[2],label:n(`presets.innerAngle`)},outerAngle:{key:W,min:0,max:360,presets:[0,36,72,108,144,180,216,252,288,324,360],accent:K[3],label:n(`presets.outerAngle`)},falloff:{key:H,min:0,max:1,step:.1,presets:[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1],accent:K[4],label:n(`presets.falloff`)},darkness:{key:B,min:0,max:100,presets:[0,15,30,45,60,75,90],accent:K[5],label:n(`presets.darkvision`)}}),[n]),ae=(0,C.useMemo)(()=>{let e=new Map;for(let t of i)typeof t.id==`string`&&t.id.length>0&&e.set(t.id,t.name||n(`main.unknownOwner`));return e},[i,n]),P=(0,C.useMemo)(()=>{let e=r.filter(e=>m(e));return A?e.filter(e=>e.metadata[G]!==!0):e},[A,r]),oe=e=>{let t=e.metadata[le];return typeof t!=`string`||t.length===0||t===e.id?null:t},F=(0,C.useMemo)(()=>{let e=new Map;for(let t of P)e.set(t.id,t);return e},[P]),I=(0,C.useMemo)(()=>{let e=new Map;for(let t of P){let n=oe(t);if(!n||!F.has(n))continue;let r=e.get(n)??[];r.push(t.id),e.set(n,r)}return e},[F,P]),L=(0,C.useMemo)(()=>{let e=new Map;for(let t of P){let n=oe(t);n&&F.has(n)&&e.set(t.id,n)}return e},[F,P]),Pe=(0,C.useMemo)(()=>{let e=[];for(let t of P)L.has(t.id)||e.push(t);let t=[],n=new Set,r=e=>{if(n.has(e))return;let i=F.get(e);if(!i)return;n.add(e),t.push(i);let a=I.get(e)??[];for(let e of a)r(e)};for(let t of e)r(t.id);for(let e of P)n.has(e.id)||t.push(e);return t},[I,L,F,P]),Fe=e=>{let t=e.metadata[z],n=e.metadata[V],r=e.metadata[U],i=e.metadata[W],a=e.metadata[H],o=e.metadata[B],s=e.metadata[ce],c=e.metadata[G],l=(e,t)=>{if(typeof e==`number`&&!Number.isNaN(e))return e;if(typeof e==`string`){let n=Number.parseFloat(e);return Number.isNaN(n)?t:n}return t};return{range:l(t,30),collision:l(n,0),innerAngle:l(r,360),outerAngle:l(i,360),falloff:l(a,1),darkness:l(o,0),blind:s===!0,hidden:c===!0}},Ie=(e,t)=>{if(Number.isNaN(t)||t==null)return e===z?30:e===V?0:e===U||e===W?360:e===H?1:e===B?0:t;let n=0,r=120;return e===V?(n=0,r=20):e===U||e===W?(n=0,r=360):e===H?(n=0,r=1):e===B?(n=0,r=100):e===z&&(n=0,r=120),Math.max(n,Math.min(r,t))},Le=async e=>{await se.CenterViewportOnImage(e),await o.player.select([e])},Re=(e,t)=>{t.preventDefault(),y(e.id),f(!0)},ze=async e=>{if(h)try{await o.scene.items.updateItems([h],t=>{t.length>0&&(t[0].createdUserId=e)}),f(!1),y(null),await o.notification.show(n(`main.notifications.ownerUpdated`),`SUCCESS`)}catch(e){console.error(`Error updating token owner:`,e),await o.notification.show(n(`main.notifications.ownerUpdateFailed`),`ERROR`)}},Be=(e,t)=>{if(e===t)return!0;let n=[t],r=new Set;for(;n.length>0;){let t=n.pop();if(!t||r.has(t))continue;if(t===e)return!0;r.add(t);let i=I.get(t)??[];for(let e of i)n.push(e)}return!1},Ve=async e=>{await o.scene.items.updateItems([e],e=>{e.length!==0&&delete e[0].metadata[le]})},He=(e,t)=>{if((I.get(e.id)?.length??0)>0){t.preventDefault(),o.notification.show(n(`main.notifications.unlinkChildrenBeforeDrag`),`WARNING`);return}T(e.id),D(null),t.dataTransfer.effectAllowed=`move`,t.dataTransfer.setData(`text/plain`,e.id)},Ue=()=>{T(null),D(null)},We=(e,t)=>{b&&(t.preventDefault(),t.dataTransfer.dropEffect=`move`,E!==e&&D(e))},Ge=async(e,t)=>{t.preventDefault();let r=t.dataTransfer.getData(`text/plain`)||b;if(T(null),D(null),r&&F.get(r))try{if(r===e.id){await Ve(r),await o.notification.show(n(`main.notifications.linkRemoved`),`SUCCESS`);return}let t=L.get(e.id)??e.id;if(Be(r,t)){await o.notification.show(n(`main.notifications.linkLoopCancelled`),`WARNING`);return}let i=e.metadata[G];await o.scene.items.updateItems([r],e=>{e.length!==0&&(e[0].metadata[le]=t,e[0].metadata[G]=i)}),await o.notification.show(n(`main.notifications.linkedToParent`),`SUCCESS`)}catch(e){console.error(`Error linking token:`,e),await o.notification.show(n(`main.notifications.linkUpdateFailed`),`ERROR`)}},Q=async(e,t,r,i=`drag`)=>{try{let n=i===`manual`?r:Ie(t,r);await o.scene.items.updateItems([e],e=>{e[0].metadata[t]=n})}catch(e){console.error(`Error updating vision parameter:`,e),await o.notification.show(n(`main.notifications.visionUpdateFailed`),`ERROR`)}},Ke=async(e,t,r=`drag`)=>{let i=P.map(e=>e.id);if(i.length!==0)try{let n=r===`manual`?t:Ie(e,t);await o.scene.items.updateItems(i,t=>{for(let r of t)r.metadata[e]=n})}catch(e){console.error(`Error updating vision parameter for all tokens:`,e),await o.notification.show(n(`main.notifications.visionUpdateFailed`),`ERROR`)}},$=e=>{let t=Pe[0];if(t){let n=L.get(t.id);k(Fe(n?F.get(n)??t:t)[e])}else k(N[e].min);ne(e)},qe=async(e,t)=>{try{await o.scene.items.updateItems([e],e=>{e.length!==0&&(e[0].metadata[ce]=t)})}catch(e){console.error(`Error updating blind parameter:`,e),await o.notification.show(n(`main.notifications.blindUpdateFailed`),`ERROR`)}},Je=(0,C.useMemo)(()=>{if(h)return r.find(e=>e.id===h)},[r,h])?.metadata?.[G]===!0,Ye=async e=>{if(h)try{await o.scene.items.updateItems([h],t=>{t.length!==0&&(e?t[0].metadata[G]=!0:delete t[0].metadata[G])}),await o.notification.show(n(e?`main.notifications.tokenHidden`:`main.notifications.tokenVisible`),`SUCCESS`)}catch(e){console.error(`Error updating hidden token metadata:`,e),await o.notification.show(n(`main.notifications.hiddenUpdateFailed`),`ERROR`)}};return(0,w.jsx)(u.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},children:(0,w.jsxs)(ue,{theme:e,children:[(0,w.jsxs)(de,{theme:e,children:[(0,w.jsx)(fe,{theme:e,children:n(`main.tokensTitle`)}),(0,w.jsxs)(pe,{children:[(0,w.jsx)(S,{theme:e,text:n(`main.tooltips.ignoreHiddenTokens`),children:(0,w.jsx)(me,{theme:e,children:n(`main.ignoreHiddenTokens`)})}),(0,w.jsx)(ee,{label:n(`main.ignoreHiddenTokensAria`),isOn:A,onChange:ie})]})]}),P.length===0?(0,w.jsx)(je,{children:n(A?`main.emptyState.noVisibleTokens`:`main.emptyState.noTokens`)}):(0,w.jsx)(he,{children:(0,w.jsxs)(ge,{$columns:8,children:[(0,w.jsx)(q,{$accent:e.BORDER,children:(0,w.jsx)(S,{theme:e,text:n(`main.tooltips.linkInstructions`),children:(0,w.jsx)(t,{size:22,color:e.PRIMARY})})}),(0,w.jsx)(q,{$accent:K[0],children:(0,w.jsx)(S,{theme:e,text:j.visionRange,children:(0,w.jsx)(Z,{$accent:K[0],onClick:()=>$(`range`),"aria-label":n(`presets.range`),children:(0,w.jsx)(Y,{src:`/visionRange.svg`,alt:n(`presets.range`)})})})}),(0,w.jsx)(q,{$accent:K[1],children:(0,w.jsx)(S,{theme:e,text:j.visionCollision,children:(0,w.jsx)(Z,{$accent:K[1],onClick:()=>$(`collision`),"aria-label":n(`presets.collision`),children:(0,w.jsx)(Y,{src:`/visionBumper.svg`,alt:n(`presets.collision`)})})})}),(0,w.jsx)(q,{$accent:K[2],children:(0,w.jsx)(S,{theme:e,text:j.visionInnerAngle,children:(0,w.jsx)(Z,{$accent:K[2],onClick:()=>$(`innerAngle`),"aria-label":n(`presets.innerAngle`),children:(0,w.jsx)(Y,{src:`/visionInner.svg`,alt:n(`presets.innerAngle`)})})})}),(0,w.jsx)(q,{$accent:K[3],children:(0,w.jsx)(S,{theme:e,text:j.visionOuterAngle,children:(0,w.jsx)(Z,{$accent:K[3],onClick:()=>$(`outerAngle`),"aria-label":n(`presets.outerAngle`),children:(0,w.jsx)(Y,{src:`/visionOuter.svg`,alt:n(`presets.outerAngle`)})})})}),(0,w.jsx)(q,{$accent:K[4],children:(0,w.jsx)(S,{theme:e,text:j.visionFalloff,children:(0,w.jsx)(Z,{$accent:K[4],onClick:()=>$(`falloff`),"aria-label":n(`presets.falloff`),children:(0,w.jsx)(Y,{src:`/visionFalloff.svg`,alt:n(`presets.falloff`)})})})}),(0,w.jsx)(q,{$accent:K[5],children:(0,w.jsx)(S,{theme:e,text:j.visionDarkness,children:(0,w.jsx)(Z,{$accent:K[5],onClick:()=>$(`darkness`),"aria-label":n(`presets.darkvision`),children:(0,w.jsx)(Y,{src:`/darkvision.svg`,alt:n(`presets.darkvision`)})})})}),(0,w.jsx)(q,{$accent:e.BORDER,children:(0,w.jsx)(S,{theme:e,text:j.visionBlind,children:(0,w.jsx)(a,{style:{color:`#fff`}})})}),(0,w.jsxs)(_e,{children:[(0,w.jsx)(J,{$area:`link`,$accent:e.BORDER,children:(0,w.jsx)(S,{theme:e,text:n(`main.tooltips.linkInstructions`),children:(0,w.jsx)(t,{size:20,color:e.PRIMARY})})}),(0,w.jsx)(J,{$area:`range`,$accent:K[0],children:(0,w.jsx)(S,{theme:e,text:j.visionRange,children:(0,w.jsx)(Z,{$accent:K[0],onClick:()=>$(`range`),"aria-label":n(`presets.range`),children:(0,w.jsx)(Y,{src:`/visionRange.svg`,alt:n(`presets.range`)})})})}),(0,w.jsx)(J,{$area:`collision`,$accent:K[1],children:(0,w.jsx)(S,{theme:e,text:j.visionCollision,children:(0,w.jsx)(Z,{$accent:K[1],onClick:()=>$(`collision`),"aria-label":n(`presets.collision`),children:(0,w.jsx)(Y,{src:`/visionBumper.svg`,alt:n(`presets.collision`)})})})}),(0,w.jsx)(J,{$area:`inner`,$accent:K[2],children:(0,w.jsx)(S,{theme:e,text:j.visionInnerAngle,children:(0,w.jsx)(Z,{$accent:K[2],onClick:()=>$(`innerAngle`),"aria-label":n(`presets.innerAngle`),children:(0,w.jsx)(Y,{src:`/visionInner.svg`,alt:n(`presets.innerAngle`)})})})}),(0,w.jsx)(J,{$area:`outer`,$accent:K[3],children:(0,w.jsx)(S,{theme:e,text:j.visionOuterAngle,children:(0,w.jsx)(Z,{$accent:K[3],onClick:()=>$(`outerAngle`),"aria-label":n(`presets.outerAngle`),children:(0,w.jsx)(Y,{src:`/visionOuter.svg`,alt:n(`presets.outerAngle`)})})})}),(0,w.jsx)(J,{$area:`falloff`,$accent:K[4],children:(0,w.jsx)(S,{theme:e,text:j.visionFalloff,children:(0,w.jsx)(Z,{$accent:K[4],onClick:()=>$(`falloff`),"aria-label":n(`presets.falloff`),children:(0,w.jsx)(Y,{src:`/visionFalloff.svg`,alt:n(`presets.falloff`)})})})}),(0,w.jsx)(J,{$area:`darkness`,$accent:K[5],children:(0,w.jsx)(S,{theme:e,text:j.visionDarkness,children:(0,w.jsx)(Z,{$accent:K[5],onClick:()=>$(`darkness`),"aria-label":n(`presets.darkvision`),children:(0,w.jsx)(Y,{src:`/darkvision.svg`,alt:n(`presets.darkvision`)})})})}),(0,w.jsx)(J,{$area:`blind`,$accent:e.BORDER,children:(0,w.jsx)(S,{theme:e,text:j.visionBlind,children:(0,w.jsx)(a,{style:{color:`#fff`}})})})]}),Pe.map(r=>{let i=L.get(r.id),a=i?F.get(i):void 0,o=a??r,c=Fe(o),l=ae.get(r.createdUserId)||n(`main.ownerFallback`),u=E===r.id;return(0,w.jsxs)(Ce,{children:[(0,w.jsx)(be,{children:(0,w.jsxs)(ve,{draggable:!0,$isDragging:b===r.id,$isDropTarget:u,$isSelected:!!(s&&s.selection?.[0]===r.id),onClick:()=>Le(r.id),onContextMenu:e=>Re(r,e),onDragStart:e=>He(r,e),onDragEnd:Ue,onDragOver:e=>We(r.id,e),onDragLeave:()=>{E===r.id&&D(null)},onDrop:e=>Ge(r,e),children:[r.name,` `,(0,w.jsxs)(ye,{children:[` - `,l]})]})}),(0,w.jsx)(xe,{children:a?(0,w.jsx)(S,{theme:e,text:n(`main.linkedTo`,{token:a.text?.plainText||a.name||n(`main.parentTokenFallback`)}),children:(0,w.jsx)(t,{size:20,color:e.OFFSET})}):null}),(0,w.jsx)(X,{$mobileArea:`range`,children:(0,w.jsx)(R,{value:c.range,onChange:(e,t)=>Q(o.id,z,e,t),min:0,max:120,accent:v.OFFSET,mode:M,presets:[0,15,30,45,60,75,90]})}),(0,w.jsx)(X,{$mobileArea:`collision`,children:(0,w.jsx)(R,{value:c.collision,onChange:(e,t)=>Q(o.id,V,e,t),min:0,max:20,accent:v.OFFSET,mode:M,presets:[0,2,4,6,8,10,12,14,16,18,20]})}),(0,w.jsx)(X,{$mobileArea:`inner`,children:(0,w.jsx)(R,{value:c.innerAngle,onChange:(e,t)=>Q(o.id,U,e,t),min:0,max:360,accent:v.OFFSET,mode:M,presets:[0,36,72,108,144,180,216,252,288,324,360]})}),(0,w.jsx)(X,{$mobileArea:`outer`,children:(0,w.jsx)(R,{value:c.outerAngle,onChange:(e,t)=>Q(o.id,W,e,t),min:0,max:360,accent:v.OFFSET,mode:M,presets:[0,36,72,108,144,180,216,252,288,324,360]})}),(0,w.jsx)(X,{$mobileArea:`falloff`,children:(0,w.jsx)(R,{value:Math.round(c.falloff*10)/10,onChange:(e,t)=>Q(o.id,H,e,t),min:0,max:1,accent:v.OFFSET,mode:M,step:.1,presets:[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]})}),(0,w.jsx)(X,{$mobileArea:`darkness`,children:(0,w.jsx)(R,{value:c.darkness,onChange:(e,t)=>Q(o.id,B,e,t),min:0,max:100,accent:v.OFFSET,mode:M,presets:[0,15,30,45,60,75,90]})}),(0,w.jsx)(Se,{children:(0,w.jsx)(x,{theme:e,type:`checkbox`,checked:c.blind,onChange:e=>qe(o.id,e.target.checked),"aria-label":n(`main.aria.blind`)})})]},r.id)})]})}),(0,w.jsx)(we,{$isOpen:l,onClick:()=>f(!1),children:(0,w.jsxs)(Te,{theme:e,onClick:e=>e.stopPropagation(),children:[(0,w.jsx)(Ee,{theme:e,children:n(`main.modal.changeTokenOwner`)}),(0,w.jsxs)(De,{theme:e,children:[i.map(t=>(0,w.jsx)(Ae,{theme:e,style:{background:t.color+`50`||e.OFFSET,textShadow:`2px 2px 2px rgba(0, 0, 0, 0.9)`},onClick:()=>ze(t.id),children:t.name},t.id)),s&&(0,w.jsx)(Ae,{theme:e,style:{textShadow:`2px 2px 2px rgba(0, 0, 0, 0.9)`},onClick:()=>ze(s.id),children:n(`main.modal.youLabel`,{name:s.name})},s.id)]}),(0,w.jsx)(Oe,{theme:e,children:(0,w.jsxs)(ke,{children:[(0,w.jsx)(me,{theme:e,children:n(`main.modal.addToHiddenList`)}),(0,w.jsx)(x,{theme:e,type:`checkbox`,checked:Je,onChange:()=>Ye(!Je),"aria-label":n(`main.aria.hideTokenFromList`)})]})})]})}),(0,w.jsx)(we,{$isOpen:O!==null,onClick:()=>ne(null),children:(0,w.jsx)(Me,{theme:e,onClick:e=>e.stopPropagation(),children:O?(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(Ne,{theme:e,children:N[O].label}),(0,w.jsx)(R,{value:re,onChange:(e,t)=>{k(e),Ke(N[O].key,e,t)},min:N[O].min,max:N[O].max,accent:N[O].accent,mode:M,step:N[O].step,presets:N[O].presets}),(0,w.jsx)(Ne,{style:{paddingTop:`10px`},theme:e,children:`Bulk Edit`})]}):null})})]})})};export{Pe as MainPage};