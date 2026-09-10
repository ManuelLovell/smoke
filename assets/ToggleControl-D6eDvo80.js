import{r as e}from"./motion-vendor-BNb6luHb.js";import{n as t}from"./BSCache-BxqOfeuy.js";import{n,r}from"./SmokeMetrics-5WIKUN4a.js";import{i,n as a}from"./ThemeContext-BKlw7sqx.js";import{n as o}from"./style-vendor-Wr67SRHu.js";var s=e(),c=o.button`
  ${{position:`relative`,display:`inline-flex`,height:`1.5rem`,width:`3rem`,alignItems:`center`,borderRadius:`9999px`,transitionProperty:`background-color, border-color, color, fill, stroke`}}
  background-color: ${e=>e.$isOn?i(e.theme.OFFSET,.7):i(e.theme.BORDER,.7)};
  border: 2px solid ${e=>e.theme.BORDER};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${e=>i(e.theme.OFFSET,.3)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &::after {
    content: '';
    ${{display:`inline-block`,height:`1rem`,width:`1rem`,transform:`translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))`,borderRadius:`9999px`,transitionProperty:`transform`}}
    background-color: ${e=>e.theme.PRIMARY};
    ${e=>e.$isOn?`transform: translateX(1.375rem);`:`transform: translateX(0.25rem);`}
  }
`;const l=({label:e,isOn:i,onChange:o,disabled:l=!1})=>{let{theme:u}=a(),d=t(e=>e.playerData?.id??null);return(0,s.jsx)(c,{theme:u,$isOn:i,onClick:()=>{if(l)return;let t=!i;r.log(`${e}: ${t}`),n({eventName:`toggle_used`,eventCategory:`ui`,playerId:d,success:!0,metadata:{label:e,next_value:t}}),o(t)},role:`switch`,"aria-checked":i,"aria-label":e,"aria-disabled":l,disabled:l})};export{l as t};