import{r as e}from"./motion-vendor-DDi9iG0R.js";import{n as t}from"./style-vendor-D1g7eVte.js";import{a as n,g as r,i,s as a,v as o}from"./main-BP3fxcPb.js";var s=e(),c=t.button`
  ${{position:`relative`,display:`inline-flex`,height:`1.5rem`,width:`3rem`,alignItems:`center`,borderRadius:`9999px`,transitionProperty:`background-color, border-color, color, fill, stroke`}}
  background-color: ${e=>e.$isOn?a(e.theme.OFFSET,.7):a(e.theme.BORDER,.7)};
  border: 2px solid ${e=>e.theme.BORDER};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${e=>a(e.theme.OFFSET,.3)};
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
`;const l=({label:e,isOn:t,onChange:a,disabled:l=!1})=>{let{theme:u}=n(),d=o(e=>e.playerData?.id??null);return(0,s.jsx)(c,{theme:u,$isOn:t,onClick:()=>{if(l)return;let n=!t;r.log(`${e}: ${n}`),i({eventName:`toggle_used`,eventCategory:`ui`,playerId:d,success:!0,metadata:{label:e,next_value:n}}),a(n)},role:`switch`,"aria-checked":t,"aria-label":e,"aria-disabled":l,disabled:l})};export{l as t};