import{n as e}from"./rolldown-runtime-xNPNHALf.js";import{d as t}from"./icons-vendor-BpXzVROX.js";import{d as n}from"./react-vendor-BMLPjHd5.js";import{r}from"./motion-vendor-DDi9iG0R.js";import{i}from"./ThemeContext-BrJdz178.js";import{n as a}from"./style-vendor-BMLvKWKs.js";var o=e(t(),1),s=n(),c=r(),l=a.span`
  display: inline-flex;
  align-items: center;
`,u=a.span`
  position: fixed;
  left: ${e=>`${e.$left}px`};
  top: ${e=>`${e.$top}px`};
  z-index: 99999;
  width: max-content;
  max-width: min(320px, calc(100vw - 16px));
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${e=>i(e.theme.BORDER,.9)};
  background: ${e=>i(e.theme.BACKGROUND,.96)};
  color: ${e=>e.theme.PRIMARY};
  font-size: 12px;
  line-height: 1.3;
  text-align: left;
  box-shadow: 0 8px 24px ${e=>i(e.theme.BACKGROUND,.65)};
  backdrop-filter: blur(8px);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    left: clamp(12px, ${e=>`${e.$arrowX}px`}, calc(100% - 12px));
    ${e=>e.$placement===`bottom`?`bottom: 100%;`:`top: 100%;`}
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    ${e=>e.$placement===`bottom`?`border-bottom: 6px solid ${i(e.theme.BACKGROUND,.96)};`:`border-top: 6px solid ${i(e.theme.BACKGROUND,.96)};`}
  }
`,d=a.span`
  display: inline-flex;
  align-items: center;
`;const f=({theme:e,text:t,children:n})=>{let r=(0,o.useRef)(null),i=(0,o.useRef)(null),[a,f]=(0,o.useState)(!1),[p,m]=(0,o.useState)({left:8,top:8,arrowX:16,placement:`bottom`}),h=()=>{let e=r.current,t=i.current;if(!e||!t)return;let n=e.getBoundingClientRect(),a=t.getBoundingClientRect(),o=a.width,s=a.height,c=n.left+n.width/2,l=c-o/2,u=window.innerWidth-o-8,d=Math.min(Math.max(l,8),Math.max(8,u)),f=n.bottom+8,p=n.top-s-8,h=f+s<=window.innerHeight-8||!(p>=8)?`bottom`:`top`;m({left:d,top:h===`bottom`?f:Math.max(8,p),arrowX:c-d,placement:h})};return(0,o.useEffect)(()=>{if(!a)return;h();let e=()=>{h()};return window.addEventListener(`resize`,e),window.addEventListener(`scroll`,e,!0),()=>{window.removeEventListener(`resize`,e),window.removeEventListener(`scroll`,e,!0)}},[a]),(0,c.jsxs)(l,{theme:e,children:[(0,c.jsx)(d,{ref:r,tabIndex:0,onMouseEnter:()=>f(!0),onMouseLeave:()=>f(!1),onFocus:()=>f(!0),onBlur:()=>f(!1),children:n}),a&&(0,s.createPortal)((0,c.jsx)(u,{ref:i,theme:e,role:`tooltip`,$left:p.left,$top:p.top,$arrowX:p.arrowX,$placement:p.placement,children:t}),document.body)]})};export{f as t};