import{n as e}from"./rolldown-runtime-xNPNHALf.js";import{a as t,c as n,d as r,l as i,s as a}from"./icons-vendor-BpXzVROX.js";import"./react-vendor-BMLPjHd5.js";import{d as o,g as s,h as c}from"./obr-vendor-CnAfirNi.js";import{r as l,t as u}from"./motion-vendor-DDi9iG0R.js";import"./state-vendor-BGHfjabw.js";import"./BSConstants-BGwuYoi3.js";import"./vendor-BzuDUZ9Q.js";import{n as d}from"./Translation-DKmTBNbC.js";import{n as f}from"./style-vendor-D1g7eVte.js";import{_ as p,a as m,o as h,u as g,v as _}from"./main-BP3fxcPb.js";import{c as v,p as y}from"./SharedStyledComponents-oC_dSL7i.js";import{t as b}from"./ToggleControl-BVea7rhA.js";import{t as x}from"./SettingsTooltip-CO0ky2dE.js";import{t as ee}from"./MainPageTooltipContent-DEVXrGJE.js";import{n as S,t as C}from"./MetadataKeys-BLswop8o.js";var w=e(r(),1),T=l(),E=[0,15,30,45,60,75,90],D=(e,t,n,r)=>{let i=(r-90)*Math.PI/180;return{x:e+n*Math.cos(i),y:t+n*Math.sin(i)}},O=(e,t,n,r,i,a)=>{let o=D(e,t,n,i),s=D(e,t,n,a),c=D(e,t,r,a),l=D(e,t,r,i),u=a-i>180?1:0;return[`M ${o.x} ${o.y}`,`A ${n} ${n} 0 ${u} 1 ${s.x} ${s.y}`,`L ${c.x} ${c.y}`,`A ${r} ${r} 0 ${u} 0 ${l.x} ${l.y}`,`Z`].join(` `)},k=f.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`,te=f.div`
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
`,A=f.input`
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
`,j=f.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8));
`,ne=f.svg`
  overflow: visible;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9));
`;const M=({value:e,onChange:t,min:n=0,max:r=99,accent:i=h.OFFSET,presets:a=E})=>{let[o,s]=(0,w.useState)(!1),[c,l]=(0,w.useState)(String(e)),[u,d]=(0,w.useState)(null),[f,p]=(0,w.useState)(null),m=(0,w.useRef)(null),g=(0,w.useRef)(null),_=String(r).length,v=e=>Math.min(r,Math.max(n,e)),y=e=>{t(v(parseInt(e,10)||0)),s(!1)};return(0,T.jsxs)(k,{children:[(0,T.jsx)(te,{ref:m,$accent:i,$editing:o?`true`:void 0,onPointerDown:e=>{if(!o&&m.current){let t=m.current.getBoundingClientRect();p({x:t.left+t.width/2,y:t.top+t.height/2}),m.current.setPointerCapture(e.pointerId),g.current={moved:!1}}},onPointerMove:e=>{if(!g.current||!f)return;let t=e.clientX-f.x,n=e.clientY-f.y;if(Math.hypot(t,n)>14){g.current.moved=!0;let e=Math.atan2(n,t)*180/Math.PI+90;e=(e+360)%360;let r=360/a.length;d(Math.round(e/r)%a.length)}else d(null)},onPointerUp:()=>{if(!g.current)return;let n=g.current.moved,r=u;g.current=null,d(null),p(null),n&&r!=null&&a[r]!==void 0?t(v(a[r])):(l(String(e)),s(!0))},children:o?(0,T.jsx)(A,{autoFocus:!0,value:c,onChange:e=>l(e.target.value.replace(/\D/g,``).slice(0,_)),onBlur:()=>y(c),onKeyDown:e=>{e.key===`Enter`&&y(c),e.key===`Escape`&&s(!1)},inputMode:`numeric`}):(0,T.jsx)(`span`,{children:e})}),f!=null&&f&&(0,T.jsx)(j,{children:(0,T.jsxs)(ne,{width:`180`,height:`180`,viewBox:`0 0 180 180`,children:[a.map((t,n)=>{let r=360/a.length,o=n*r-r/2,s=n*r+r/2,c=u===n,l=e===t,d=D(90,90,66,n*r);return(0,T.jsxs)(`g`,{children:[(0,T.jsx)(`path`,{d:O(90,90,82,40,o,s),fill:c?i:l?`#506772`:`#2A2E30`,opacity:1,stroke:c?i:`#555`,strokeWidth:c?3:1.5,style:{transition:`all 80ms ease`}}),(0,T.jsx)(`text`,{x:d.x,y:d.y,fill:c?`#000`:`#FFF`,fontFamily:`'IBM Plex Mono', monospace`,fontSize:c?16:14,fontWeight:700,textAnchor:`middle`,dominantBaseline:`middle`,style:{pointerEvents:`none`,transition:`all 80ms ease`},children:t})]},n)}),(0,T.jsx)(`circle`,{cx:90,cy:90,r:38,fill:`#24282A`,stroke:i,strokeWidth:2})]})})]})};var N=f.div`
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
`,P=f.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${e=>e.$fillPct}%;
  background: ${e=>e.$accent||`#C98A3E`};
  opacity: 0.35;
  transition: height 120ms ease;
  pointer-events: none;
`,F=f.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
`,I=f.input`
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
`,L=f.button`
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
`;const re=({value:e,onChange:t,min:r=0,max:a=99,step:o=1,accent:s=h.OFFSET})=>{let{t:c}=d(),[l,u]=(0,w.useState)(!1),[f,p]=(0,w.useState)(String(e)),[m,g]=(0,w.useState)(e),_=(0,w.useRef)(null),v=String(a).length;(0,w.useEffect)(()=>{g(e)},[e]);let y=e=>{let t=Math.min(a,Math.max(r,e)),n=Math.round(t/o)*o,i=(o.toString().split(`.`)[1]||``).length;return parseFloat(n.toFixed(i))},b=e=>{t(y(parseFloat(e)||0)),u(!1)},x=t=>{l||(t.currentTarget.setPointerCapture(t.pointerId),_.current={startY:t.clientY,startVal:e,currentVal:e,moved:!1})},ee=e=>{if(!_.current)return;let t=_.current.startY-e.clientY;if(Math.abs(t)>4&&(_.current.moved=!0),!_.current.moved)return;let n=Math.round(t/6),r=y(_.current.startVal+n*o);r!==_.current.currentVal&&(_.current.currentVal=r,g(r))},S=()=>{if(!_.current)return;let n=_.current.moved,r=_.current.currentVal;_.current=null,n?(r!==e&&t(r),p(String(r)),g(r)):(p(String(e)),u(!0))},C=(n,r)=>{r.stopPropagation(),t(y(e+n*o))};return(0,T.jsxs)(N,{onPointerDown:x,onPointerMove:ee,onPointerUp:S,children:[(0,T.jsx)(P,{$fillPct:(m-r)/(a-r)*100,$accent:s}),l?(0,T.jsx)(I,{autoFocus:!0,value:f,onChange:e=>{let t=e.target.value;(t.match(/\./g)||[]).length>1&&(t=t.replace(/\.(?=.*\.)/g,``)),p(t.replace(/[^\d.]/g,``).slice(0,v+1))},onBlur:()=>b(f),onKeyDown:e=>{e.key===`Enter`&&b(f),e.key===`Escape`&&u(!1)},inputMode:`decimal`}):(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(F,{children:Number(m.toFixed(3))}),(0,T.jsx)(L,{$position:`top`,onPointerDown:e=>e.stopPropagation(),onClick:e=>C(1,e),"aria-label":c(`common.increase`),children:(0,T.jsx)(n,{size:8})}),(0,T.jsx)(L,{$position:`bottom`,onPointerDown:e=>e.stopPropagation(),onClick:e=>C(-1,e),"aria-label":c(`common.decrease`),children:(0,T.jsx)(i,{size:8})})]})]})};var ie=f.div`
  ${{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`0.5rem`}}
`,ae=f.div`
  ${{display:`flex`,justifyContent:`center`}}
`,oe=f.label`
  ${{fontSize:`0.75rem`,fontWeight:`600`}}
  color: ${e=>e.$accent||`#C98A3E`};
`;const R=({value:e,onChange:t,min:n,max:r,accent:i=h.OFFSET,mode:a=`flywheel`,label:o,presets:s,step:c=1})=>(0,T.jsxs)(ie,{children:[o&&(0,T.jsx)(oe,{$accent:i,children:o}),(0,T.jsx)(ae,{children:a===`flywheel`?(0,T.jsx)(M,{value:e,onChange:t,min:n,max:r,accent:i,presets:s}):(0,T.jsx)(re,{value:e,onChange:t,min:n,max:r,step:c,accent:i})})]});var se=class{static async CenterViewportOnImage(e){let t=p.sceneItems.find(t=>t.id===e),n=await o.scene.grid.getDpi(),r=await o.viewport.getScale(),i=await o.viewport.getWidth(),a=await o.viewport.getHeight(),s={x:i/2,y:a/2},c={x:s.x/r,y:s.y/r},l=await this.GetImageCenter(t,n),u={x:l.x-c.x,y:l.y-c.y},d={x:u.x*r*-1,y:u.y*r*-1};await o.viewport.animateTo({position:d,scale:r})}static async GetImageCenter(e,t){if(c(e)){let n=t/e.grid.dpi,r=e.image.width*n,i=e.image.height*n,a=e.grid.offset.x/e.image.width*r,o=e.grid.offset.y/e.image.height*i;return{x:e.position.x-a+r/2,y:e.position.y-o+i/2}}else if(s(e)&&e.points.length>0)return{x:e.points[0].x,y:e.points[0].y};else return{x:e.position.x,y:e.position.y}}},z=S.VISION_RANGE,B=S.VISION_DARKNESS,V=S.VISION_SOURCE,H=S.VISION_FALLOFF,U=S.VISION_IN_ANGLE,W=S.VISION_OUT_ANGLE,ce=S.VISION_BLIND,G=S.LINKED_TO,K=S.HIDDEN_TOKEN,q=[`#C98A3E`,`#4E8C82`,`#8C6E9C`,`#B3583F`,`#5B7FA6`,`#9AA53F`],le=f(v)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100%;
`,ue=f.div`
  ${{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:`0.75rem`}}
  border: 2px solid ${e=>e.theme.BORDER};
  background-color: ${e=>e.theme.OFFSET};
  border-radius: 6px;
  padding: 4px 8px;
  margin-bottom: 8px;
`,de=f.h1`
  margin: 0;
  padding-left: 12px;
  color: ${e=>e.theme.PRIMARY};
  font-size: 20px;
  font-weight: bold;
  font-variant: small-caps;
`,fe=f.div`
  ${{display:`flex`,alignItems:`center`,gap:`0.5rem`}}
`,pe=f.span`
  ${{fontSize:`0.75rem`,fontWeight:`600`}}
  color: ${e=>e.theme.PRIMARY};
  opacity: 0.9;
`,me=f.div`
  ${{overflow:`auto`}}
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    padding: 0 8px;
    justify-content: stretch;
  }
`,he=f.div`
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
`,J=f.div`
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
`,ge=f.div`
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
`,Y=f.div`
  display: none;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: flex;
    grid-area: ${e=>e.$area};
    align-items: center;
    justify-content: center;
    color: ${e=>e.$accent||`#8B9190`};
  }
`,X=f.img`
  width: 22px;
  height: 22px;
  display: block;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.15));
`,_e=f.div`
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
`,ve=f.div`
  ${{fontSize:`0.75rem`}}
  line-height: 2.2;
  color: rgba(237, 234, 227, 0.7);
  font-family: 'IBM Plex Mono', monospace;
  text-align: center;
  padding-left: 6px;
`,ye=f.div`
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
`,Z=f.div`
  ${{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`0.5rem`}}
  padding: 0 4px;
  align-self: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: ${e=>e.$mobileArea||`auto`};
    width: 44px;
    padding: 0;
  }
`,be=f.div`
  ${{display:`flex`,alignItems:`center`,justifyContent:`center`}}
  padding: 0 2px;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: link;
    justify-self: center;
  }
`,xe=f(Z)`
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: blind;
  }
`,Se=f.div`
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
`,Ce=f.div`
  ${{position:`fixed`,inset:`0`,zIndex:`50`}}
  background-color: rgba(0, 0, 0, 0.6);
  display: ${e=>e.$isOpen?`flex`:`none`};
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`,we=f.div`
  ${{width:`100%`,maxWidth:`24rem`,borderRadius:`0.5rem`,padding:`1.5rem`,"--tw-shadow":`0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,"--tw-shadow-colored":`0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -2px var(--tw-shadow-color)`,boxShadow:`var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)`}}
  background-color: rgb(82, 77, 114);
  border: 2px solid ${e=>e.theme.BORDER};
  max-height: 70vh;
  overflow-y: auto;
`,Te=f.h2`
  ${{marginBottom:`1rem`,fontSize:`1.125rem`,fontWeight:`700`}}
  color: ${e=>e.theme.PRIMARY};
`,Ee=f.div`
  ${{display:`flex`,flexDirection:`column`,gap:`0.5rem`}}
`,De=f.div`
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid ${e=>e.theme.BORDER};
`,Oe=f.div`
  ${{display:`flex`,gap:`1rem`}}
  justify-content: space-between;
`,ke=f.button`
  ${{width:`100%`,cursor:`pointer`,borderRadius:`0.25rem`,paddingLeft:`1rem`,paddingRight:`1rem`,paddingTop:`0.75rem`,paddingBottom:`0.75rem`,textAlign:`left`,transitionProperty:`all`}}
  background-color: ${e=>e.theme.OFFSET};
  color: ${e=>e.theme.PRIMARY};
  border: 2px solid ${e=>e.theme.BORDER};
  font-size: 14px;

  &:hover {
    background-color: ${e=>e.theme.OFFSET}dd;
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
`,Ae=f.div`
  ${{paddingLeft:`1rem`,paddingRight:`1rem`,paddingTop:`3rem`,paddingBottom:`3rem`,textAlign:`center`}}
  color: rgba(237, 234, 227, 0.9  );
  font-size: 0.9rem;
`;const Q=()=>{let{theme:e}=m(),{t:n}=d(),r=_(e=>e.items),i=_(e=>e.partyData),s=_(e=>e.playerData),c=_(e=>e.sceneMetadata),[l,f]=(0,w.useState)(!1),[p,v]=(0,w.useState)(null),[S,E]=(0,w.useState)(null),[D,O]=(0,w.useState)(null),[k,te]=(0,w.useState)(!0),A=(0,w.useMemo)(()=>ee(n),[n]),j=(0,w.useMemo)(()=>c[C.CONTROL_MODE]===`roller`?`roller`:`flywheel`,[c]),ne=(0,w.useMemo)(()=>{let e=new Map;for(let t of i)typeof t.id==`string`&&t.id.length>0&&e.set(t.id,t.name||n(`main.unknownOwner`));return e},[i,n]),M=(0,w.useMemo)(()=>{let e=r.filter(e=>g(e));return k?e.filter(e=>e.metadata[K]!==!0):e},[k,r]),N=e=>{let t=e.metadata[G];return typeof t!=`string`||t.length===0||t===e.id?null:t},P=(0,w.useMemo)(()=>{let e=new Map;for(let t of M)e.set(t.id,t);return e},[M]),F=(0,w.useMemo)(()=>{let e=new Map;for(let t of M){let n=N(t);if(!n||!P.has(n))continue;let r=e.get(n)??[];r.push(t.id),e.set(n,r)}return e},[P,M]),I=(0,w.useMemo)(()=>{let e=new Map;for(let t of M){let n=N(t);n&&P.has(n)&&e.set(t.id,n)}return e},[P,M]),L=(0,w.useMemo)(()=>{let e=[];for(let t of M)I.has(t.id)||e.push(t);let t=[],n=new Set,r=e=>{if(n.has(e))return;let i=P.get(e);if(!i)return;n.add(e),t.push(i);let a=F.get(e)??[];for(let e of a)r(e)};for(let t of e)r(t.id);for(let e of M)n.has(e.id)||t.push(e);return t},[F,I,P,M]),re=e=>{let t=e.metadata[z],n=e.metadata[V],r=e.metadata[U],i=e.metadata[W],a=e.metadata[H],o=e.metadata[B],s=e.metadata[ce],c=e.metadata[K];return{range:typeof t==`number`&&!Number.isNaN(t)?t:30,collision:typeof n==`number`&&!Number.isNaN(n)?n:0,innerAngle:typeof r==`number`&&!Number.isNaN(r)?r:360,outerAngle:typeof i==`number`&&!Number.isNaN(i)?i:360,falloff:typeof a==`number`&&!Number.isNaN(a)?a:1,darkness:typeof o==`number`&&!Number.isNaN(o)?o:0,blind:s===!0,hidden:c===!0}},ie=(e,t)=>{if(Number.isNaN(t)||t==null)return e===z?30:e===V?0:e===U||e===W?360:e===H?1:e===B?0:t;let n=0,r=120;return e===V?(n=0,r=20):e===U||e===W?(n=0,r=360):e===H?(n=0,r=1):e===B?(n=0,r=100):e===z&&(n=0,r=120),Math.max(n,Math.min(r,t))},ae=async e=>{await se.CenterViewportOnImage(e),await o.player.select([e])},oe=(e,t)=>{t.preventDefault(),v(e.id),f(!0)},Q=async e=>{if(p)try{await o.scene.items.updateItems([p],t=>{t.length>0&&(t[0].createdUserId=e)}),f(!1),v(null),await o.notification.show(n(`main.notifications.ownerUpdated`),`SUCCESS`)}catch(e){console.error(`Error updating token owner:`,e),await o.notification.show(n(`main.notifications.ownerUpdateFailed`),`ERROR`)}},je=(e,t)=>{if(e===t)return!0;let n=[t],r=new Set;for(;n.length>0;){let t=n.pop();if(!t||r.has(t))continue;if(t===e)return!0;r.add(t);let i=F.get(t)??[];for(let e of i)n.push(e)}return!1},Me=async e=>{await o.scene.items.updateItems([e],e=>{e.length!==0&&delete e[0].metadata[G]})},Ne=(e,t)=>{if((F.get(e.id)?.length??0)>0){t.preventDefault(),o.notification.show(n(`main.notifications.unlinkChildrenBeforeDrag`),`WARNING`);return}E(e.id),O(null),t.dataTransfer.effectAllowed=`move`,t.dataTransfer.setData(`text/plain`,e.id)},Pe=()=>{E(null),O(null)},Fe=(e,t)=>{S&&(t.preventDefault(),t.dataTransfer.dropEffect=`move`,D!==e&&O(e))},Ie=async(e,t)=>{t.preventDefault();let r=t.dataTransfer.getData(`text/plain`)||S;if(E(null),O(null),r&&P.get(r))try{if(r===e.id){await Me(r),await o.notification.show(n(`main.notifications.linkRemoved`),`SUCCESS`);return}let t=I.get(e.id)??e.id;if(je(r,t)){await o.notification.show(n(`main.notifications.linkLoopCancelled`),`WARNING`);return}let i=e.metadata[K];await o.scene.items.updateItems([r],e=>{e.length!==0&&(e[0].metadata[G]=t,e[0].metadata[K]=i)}),await o.notification.show(n(`main.notifications.linkedToParent`),`SUCCESS`)}catch(e){console.error(`Error linking token:`,e),await o.notification.show(n(`main.notifications.linkUpdateFailed`),`ERROR`)}},$=async(e,t,r)=>{try{let n=ie(t,r);await o.scene.items.updateItems([e],e=>{e[0].metadata[t]=n})}catch(e){console.error(`Error updating vision parameter:`,e),await o.notification.show(n(`main.notifications.visionUpdateFailed`),`ERROR`)}},Le=async(e,t)=>{try{await o.scene.items.updateItems([e],e=>{e.length!==0&&(e[0].metadata[ce]=t)})}catch(e){console.error(`Error updating blind parameter:`,e),await o.notification.show(n(`main.notifications.blindUpdateFailed`),`ERROR`)}},Re=(0,w.useMemo)(()=>{if(p)return r.find(e=>e.id===p)},[r,p])?.metadata?.[K]===!0,ze=async e=>{if(p)try{await o.scene.items.updateItems([p],t=>{t.length!==0&&(e?t[0].metadata[K]=!0:delete t[0].metadata[K])}),await o.notification.show(n(e?`main.notifications.tokenHidden`:`main.notifications.tokenVisible`),`SUCCESS`)}catch(e){console.error(`Error updating hidden token metadata:`,e),await o.notification.show(n(`main.notifications.hiddenUpdateFailed`),`ERROR`)}};return(0,T.jsx)(u.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},children:(0,T.jsxs)(le,{theme:e,children:[(0,T.jsxs)(ue,{theme:e,children:[(0,T.jsx)(de,{theme:e,children:n(`main.tokensTitle`)}),(0,T.jsxs)(fe,{children:[(0,T.jsx)(x,{theme:e,text:n(`main.tooltips.ignoreHiddenTokens`),children:(0,T.jsx)(pe,{theme:e,children:n(`main.ignoreHiddenTokens`)})}),(0,T.jsx)(b,{label:n(`main.ignoreHiddenTokensAria`),isOn:k,onChange:te})]})]}),M.length===0?(0,T.jsx)(Ae,{children:n(k?`main.emptyState.noVisibleTokens`:`main.emptyState.noTokens`)}):(0,T.jsx)(me,{children:(0,T.jsxs)(he,{$columns:8,children:[(0,T.jsx)(J,{$accent:e.BORDER,children:(0,T.jsx)(x,{theme:e,text:n(`main.tooltips.linkInstructions`),children:(0,T.jsx)(t,{size:22,color:e.PRIMARY})})}),(0,T.jsx)(J,{$accent:q[0],children:(0,T.jsx)(x,{theme:e,text:A.visionRange,children:(0,T.jsx)(X,{src:`/visionRange.svg`,alt:n(`presets.range`)})})}),(0,T.jsx)(J,{$accent:q[1],children:(0,T.jsx)(x,{theme:e,text:A.visionCollision,children:(0,T.jsx)(X,{src:`/visionBumper.svg`,alt:n(`presets.collision`)})})}),(0,T.jsx)(J,{$accent:q[2],children:(0,T.jsx)(x,{theme:e,text:A.visionInnerAngle,children:(0,T.jsx)(X,{src:`/visionInner.svg`,alt:n(`presets.innerAngle`)})})}),(0,T.jsx)(J,{$accent:q[3],children:(0,T.jsx)(x,{theme:e,text:A.visionOuterAngle,children:(0,T.jsx)(X,{src:`/visionOuter.svg`,alt:n(`presets.outerAngle`)})})}),(0,T.jsx)(J,{$accent:q[4],children:(0,T.jsx)(x,{theme:e,text:A.visionFalloff,children:(0,T.jsx)(X,{src:`/visionFalloff.svg`,alt:n(`presets.falloff`)})})}),(0,T.jsx)(J,{$accent:q[5],children:(0,T.jsx)(x,{theme:e,text:A.visionDarkness,children:(0,T.jsx)(X,{src:`/darkvision.svg`,alt:n(`presets.darkvision`)})})}),(0,T.jsx)(J,{$accent:e.BORDER,children:(0,T.jsx)(x,{theme:e,text:A.visionBlind,children:(0,T.jsx)(a,{style:{color:`#fff`}})})}),(0,T.jsxs)(ge,{children:[(0,T.jsx)(Y,{$area:`link`,$accent:e.BORDER,children:(0,T.jsx)(x,{theme:e,text:n(`main.tooltips.linkInstructions`),children:(0,T.jsx)(t,{size:20,color:e.PRIMARY})})}),(0,T.jsx)(Y,{$area:`range`,$accent:q[0],children:(0,T.jsx)(x,{theme:e,text:A.visionRange,children:(0,T.jsx)(X,{src:`/visionRange.svg`,alt:n(`presets.range`)})})}),(0,T.jsx)(Y,{$area:`collision`,$accent:q[1],children:(0,T.jsx)(x,{theme:e,text:A.visionCollision,children:(0,T.jsx)(X,{src:`/visionBumper.svg`,alt:n(`presets.collision`)})})}),(0,T.jsx)(Y,{$area:`inner`,$accent:q[2],children:(0,T.jsx)(x,{theme:e,text:A.visionInnerAngle,children:(0,T.jsx)(X,{src:`/visionInner.svg`,alt:n(`presets.innerAngle`)})})}),(0,T.jsx)(Y,{$area:`outer`,$accent:q[3],children:(0,T.jsx)(x,{theme:e,text:A.visionOuterAngle,children:(0,T.jsx)(X,{src:`/visionOuter.svg`,alt:n(`presets.outerAngle`)})})}),(0,T.jsx)(Y,{$area:`falloff`,$accent:q[4],children:(0,T.jsx)(x,{theme:e,text:A.visionFalloff,children:(0,T.jsx)(X,{src:`/visionFalloff.svg`,alt:n(`presets.falloff`)})})}),(0,T.jsx)(Y,{$area:`darkness`,$accent:q[5],children:(0,T.jsx)(x,{theme:e,text:A.visionDarkness,children:(0,T.jsx)(X,{src:`/darkvision.svg`,alt:n(`presets.darkvision`)})})}),(0,T.jsx)(Y,{$area:`blind`,$accent:e.BORDER,children:(0,T.jsx)(x,{theme:e,text:A.visionBlind,children:(0,T.jsx)(a,{style:{color:`#fff`}})})})]}),L.map(r=>{let i=I.get(r.id),a=i?P.get(i):void 0,o=a??r,c=re(o),l=ne.get(r.createdUserId)||n(`main.ownerFallback`),u=D===r.id;return(0,T.jsxs)(Se,{children:[(0,T.jsx)(ye,{children:(0,T.jsxs)(_e,{draggable:!0,$isDragging:S===r.id,$isDropTarget:u,$isSelected:!!(s&&s.selection?.[0]===r.id),onClick:()=>ae(r.id),onContextMenu:e=>oe(r,e),onDragStart:e=>Ne(r,e),onDragEnd:Pe,onDragOver:e=>Fe(r.id,e),onDragLeave:()=>{D===r.id&&O(null)},onDrop:e=>Ie(r,e),children:[r.name,` `,(0,T.jsxs)(ve,{children:[` - `,l]})]})}),(0,T.jsx)(be,{children:a?(0,T.jsx)(x,{theme:e,text:n(`main.linkedTo`,{token:a.text?.plainText||a.name||n(`main.parentTokenFallback`)}),children:(0,T.jsx)(t,{size:20,color:e.OFFSET})}):null}),(0,T.jsx)(Z,{$mobileArea:`range`,children:(0,T.jsx)(R,{value:c.range,onChange:e=>$(o.id,z,e),min:0,max:120,accent:h.OFFSET,mode:j,presets:[0,15,30,45,60,75,90]})}),(0,T.jsx)(Z,{$mobileArea:`collision`,children:(0,T.jsx)(R,{value:c.collision,onChange:e=>$(o.id,V,e),min:0,max:20,accent:h.OFFSET,mode:j,presets:[0,2,4,6,8,10,12,14,16,18,20]})}),(0,T.jsx)(Z,{$mobileArea:`inner`,children:(0,T.jsx)(R,{value:c.innerAngle,onChange:e=>$(o.id,U,e),min:0,max:360,accent:h.OFFSET,mode:j,presets:[0,36,72,108,144,180,216,252,288,324,360]})}),(0,T.jsx)(Z,{$mobileArea:`outer`,children:(0,T.jsx)(R,{value:c.outerAngle,onChange:e=>$(o.id,W,e),min:0,max:360,accent:h.OFFSET,mode:j,presets:[0,36,72,108,144,180,216,252,288,324,360]})}),(0,T.jsx)(Z,{$mobileArea:`falloff`,children:(0,T.jsx)(R,{value:Math.round(c.falloff*10)/10,onChange:e=>$(o.id,H,e),min:0,max:1,accent:h.OFFSET,mode:j,step:.1,presets:[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]})}),(0,T.jsx)(Z,{$mobileArea:`darkness`,children:(0,T.jsx)(R,{value:c.darkness,onChange:e=>$(o.id,B,e),min:0,max:100,accent:h.OFFSET,mode:j,presets:[0,15,30,45,60,75,90]})}),(0,T.jsx)(xe,{children:(0,T.jsx)(y,{theme:e,type:`checkbox`,checked:c.blind,onChange:e=>Le(o.id,e.target.checked),"aria-label":n(`main.aria.blind`)})})]},r.id)})]})}),(0,T.jsx)(Ce,{$isOpen:l,onClick:()=>f(!1),children:(0,T.jsxs)(we,{theme:e,onClick:e=>e.stopPropagation(),children:[(0,T.jsx)(Te,{theme:e,children:n(`main.modal.changeTokenOwner`)}),(0,T.jsxs)(Ee,{theme:e,children:[i.map(t=>(0,T.jsx)(ke,{theme:e,style:{background:t.color||e.OFFSET,textShadow:`2px 2px 2px rgba(0, 0, 0, 0.9)`},onClick:()=>Q(t.id),children:t.name},t.id)),s&&(0,T.jsx)(ke,{theme:e,style:{textShadow:`2px 2px 2px rgba(0, 0, 0, 0.9)`},onClick:()=>Q(s.id),children:n(`main.modal.youLabel`,{name:s.name})},s.id)]}),(0,T.jsx)(De,{theme:e,children:(0,T.jsxs)(Oe,{children:[(0,T.jsx)(pe,{theme:e,children:n(`main.modal.addToHiddenList`)}),(0,T.jsx)(y,{theme:e,type:`checkbox`,checked:Re,onChange:()=>ze(!Re),"aria-label":n(`main.aria.hideTokenFromList`)})]})})]})})]})})};export{Q as MainPage};