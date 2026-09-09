import{n as e}from"./rolldown-runtime-xNPNHALf.js";import{d as t,l as n,n as r,t as i}from"./icons-vendor-BpXzVROX.js";import"./react-vendor-BMLPjHd5.js";import{d as a}from"./obr-vendor-CnAfirNi.js";import{r as o,t as s}from"./motion-vendor-DDi9iG0R.js";import"./state-vendor-BGHfjabw.js";import{t as c}from"./BSConstants-BGwuYoi3.js";import"./vendor-BzuDUZ9Q.js";import{n as l,t as u}from"./Translation-DKmTBNbC.js";import{n as d}from"./style-vendor-D1g7eVte.js";import{a as f,v as p}from"./main-BP3fxcPb.js";import{a as m,c as h,l as g}from"./SharedStyledComponents-oC_dSL7i.js";var _=e(t(),1),v=o(),y=d.div`
  ${{position:`relative`}}
  width: 100%;
`,b=d.div`
  ${{display:`flex`,cursor:`pointer`,flexWrap:`wrap`,gap:`0.25rem`,borderRadius:`0.25rem`,borderWidth:`1px`,"--tw-border-opacity":`1`,borderColor:`rgb(74 85 104 / var(--tw-border-opacity, 1))`,"--tw-bg-opacity":`1`,backgroundColor:`rgb(26 32 44 / var(--tw-bg-opacity, 1))`,padding:`0.25rem`}}
  min-height: 32px;
  opacity: ${e=>e.disabled?.5:1};
  pointer-events: ${e=>e.disabled?`none`:`auto`};
  
  &:focus-within {
    ${{"--tw-border-opacity":`1`,borderColor:`rgb(159 122 234 / var(--tw-border-opacity, 1))`,"--tw-bg-opacity":`1`,backgroundColor:`rgb(45 55 72 / var(--tw-bg-opacity, 1))`}}
  }
`,x=d.div`
  ${{display:`flex`,alignItems:`center`,gap:`0.25rem`,borderRadius:`0.25rem`,"--tw-bg-opacity":`1`,backgroundColor:`rgb(128 90 213 / var(--tw-bg-opacity, 1))`,padding:`0.25rem`,fontSize:`0.875rem`,"--tw-text-opacity":`1`,color:`rgb(255 255 255 / var(--tw-text-opacity, 1))`}}
  white-space: nowrap;
`,S=d.button`
  ${{marginLeft:`0.25rem`,display:`flex`,alignItems:`center`,justifyContent:`center`,borderRadius:`0.25rem`,":hover":{"--tw-bg-opacity":`1`,backgroundColor:`rgb(107 70 193 / var(--tw-bg-opacity, 1))`}}}
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
`,C=d.div`
  ${{position:`absolute`,left:`0`,right:`0`,zIndex:`50`,marginTop:`0.25rem`,width:`100%`,borderRadius:`0.25rem`,borderWidth:`1px`,"--tw-border-opacity":`1`,borderColor:`rgb(74 85 104 / var(--tw-border-opacity, 1))`,"--tw-bg-opacity":`1`,backgroundColor:`rgb(26 32 44 / var(--tw-bg-opacity, 1))`}}
  display: ${e=>e.$isOpen?`block`:`none`};
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`,w=d.div`
  ${{cursor:`pointer`,paddingLeft:`0.75rem`,paddingRight:`0.75rem`,paddingTop:`0.5rem`,paddingBottom:`0.5rem`,":hover":{"--tw-bg-opacity":`1`,backgroundColor:`rgb(45 55 72 / var(--tw-bg-opacity, 1))`}}}
  background-color: ${e=>e.$isSelected?`rgba(168, 85, 247, 0.2)`:`transparent`};
  color: ${e=>e.$isSelected?`#a855f7`:`#ffffff`};
  font-weight: ${e=>e.$isSelected?`600`:`normal`};
  
  &:hover {
    background-color: ${e=>e.$isSelected?`rgba(168, 85, 247, 0.3)`:`rgba(168, 85, 247, 0.1)`};
  }
`,T=d.span`
  ${{paddingTop:`0.25rem`,paddingBottom:`0.25rem`,"--tw-text-opacity":`1`,color:`rgb(160 174 192 / var(--tw-text-opacity, 1))`}}
  font-size: 0.875rem;
`,E=d.div`
  margin-left: auto;
  color: #999;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;const D=({options:e,value:t,onChange:r,placeholder:a=u.t(`common.selectItemsPlaceholder`),disabled:o=!1,theme:s})=>{let[c,l]=(0,_.useState)(!1),d=(0,_.useRef)(null);(0,_.useEffect)(()=>{let e=e=>{d.current&&!d.current.contains(e.target)&&l(!1)};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]);let f=e=>{t.includes(e)?r(t.filter(t=>t!==e)):r([...t,e])},p=(e,n)=>{e.stopPropagation(),r(t.filter(e=>e!==n))},m=t.map(t=>e.find(e=>e.value===t)?.label).filter(Boolean);return(0,v.jsxs)(y,{ref:d,theme:s,children:[(0,v.jsxs)(b,{theme:s,disabled:o,onClick:()=>!o&&l(!c),children:[(()=>(0,v.jsx)(v.Fragment,{children:m.length===0?(0,v.jsx)(T,{theme:s,children:a}):m.map((e,n)=>(0,v.jsxs)(x,{theme:s,children:[e,(0,v.jsx)(S,{theme:s,onClick:e=>p(e,t[n]),type:`button`,children:(0,v.jsx)(i,{size:12})})]},t[n]))}))(),(0,v.jsx)(E,{children:(0,v.jsx)(n,{size:16})})]}),(0,v.jsx)(C,{theme:s,$isOpen:c,children:e.map(e=>(0,v.jsx)(w,{theme:s,$isSelected:t.includes(e.value),onClick:()=>f(e.value),children:e.label},e.value))})]})};var O=d.div`
  ${{marginBottom:`0.5rem`,display:`flex`,alignItems:`flex-start`,gap:`0.75rem`,borderRadius:`0.25rem`,"--tw-bg-opacity":`0.25`,backgroundColor:`rgb(0 0 0 / var(--tw-bg-opacity, 1))`,paddingLeft:`0.75rem`,paddingRight:`0.75rem`,paddingTop:`0.75rem`,paddingBottom:`0.75rem`}}
  
  &:last-child {
    margin-bottom: 0;
  }
`,k=d.div`
  ${{flex:`1 1 0%`}}
`,A=d.div`
  ${{marginBottom:`0.5rem`,fontWeight:`600`}}
  font-size: 0.95rem;
`,j=d.div`
  ${{marginBottom:`0.5rem`}}
  min-width: 0;
`,M=d.label`
  ${{marginBottom:`0.25rem`,display:`block`,fontSize:`0.75rem`,"--tw-text-opacity":`1`,color:`rgb(203 213 224 / var(--tw-text-opacity, 1))`}}
`,N=d.div`
  ${{display:`flex`,flexShrink:`0`,gap:`0.5rem`}}
`,P=d.div`
  ${{paddingLeft:`1rem`,paddingRight:`1rem`,paddingTop:`2rem`,paddingBottom:`2rem`,textAlign:`center`}}
  font-size: 0.9rem;
`,F=d.button`
  ${{display:`flex`,alignItems:`center`,justifyContent:`center`}}
  padding: 4px 8px;
`,I=`${c.SPECTREID}/isSpectre`,L=`${c.SPECTREID}/spectreViewers`;const R=()=>{let{theme:e}=f(),{t}=l(),n=p(e=>e.items),i=p(e=>e.partyData),o=p(e=>e.playerData),[c,u]=(0,_.useState)([]);(0,_.useEffect)(()=>{u(n.filter(e=>e.metadata[I]===!0))},[n]);let d=i.filter(e=>e.id!==o?.id),y=async(e,n)=>{try{await a.scene.items.updateItems([e],e=>{e[0].metadata[L]=n})}catch(e){console.error(`Error updating spectre viewers:`,e),await a.notification.show(t(`spectre.error.updateViewers`),`ERROR`)}},b=async e=>{try{await a.scene.items.deleteItems([e])}catch(e){console.error(`Error deleting spectre:`,e),await a.notification.show(t(`spectre.error.delete`),`ERROR`)}},x=e=>{let t=e.metadata[L];return Array.isArray(t)?t:[]};return(0,v.jsx)(s.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},children:(0,v.jsxs)(h,{theme:e,children:[(0,v.jsx)(g,{theme:e,children:t(`spectre.pageTitle`)}),c.length===0?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(P,{theme:e,children:t(`spectre.noSpectres`)}),(0,v.jsx)(P,{theme:e,children:t(`spectre.noSpectresInfo`)})]}):(0,v.jsx)(`div`,{children:c.map(n=>{let i=x(n),a=d.map(e=>({value:e.id,label:e.name}));return(0,v.jsxs)(O,{theme:e,children:[(0,v.jsxs)(k,{theme:e,children:[(0,v.jsx)(A,{theme:e,children:n.name}),(0,v.jsxs)(j,{theme:e,children:[(0,v.jsx)(M,{theme:e,children:t(`spectre.selectViewers`)}),(0,v.jsx)(D,{options:a,value:i,onChange:e=>void y(n.id,e),placeholder:t(`spectre.chooseViewers`),theme:e})]})]}),(0,v.jsx)(N,{theme:e,children:(0,v.jsx)(m,{theme:e,onClick:()=>void b(n.id),as:F,children:(0,v.jsx)(r,{size:14})})})]},n.id)})})]})})};export{R as SpectrePage};