import"../modulepreload-polyfill-COjsJUhz.js";import"../icons-vendor-B_eIY2Jz.js";import{d as e}from"../obr-vendor-C3bwD0JM.js";import{t}from"../BSConstants-B9xxLN8d.js";import{t as n}from"../Translation-DhiQCBW4.js";var r=document.querySelector(`#bs-notice`),i=document.querySelector(`#bs-notice-notes`);r.innerHTML=`
  <div id="newsContainer">
        <h1>${n.t(`notice.title`)}</h1>
        ${n.t(`notice.bodyLine1`)}
    <br>
        <br> ${n.t(`notice.bodyLine2`)}
        ${n.t(`notice.bodyLine3`)}
    <br>
        <br> ${n.t(`notice.bodyLine4`)}
  </div>
`,e.onReady(async()=>{let r=window.location.search,a=new URLSearchParams(r).get(`subscriber`)===`true`;i.innerHTML=`
        <div id="footButtonContainer">
            <button id="discordButton" type="button" title="${n.t(`notice.discordTitle`)}"><embed class="svg discord" src="/w-discord.svg" /></button>
            <button id="patreonButton" type="button" ${a?`title="${n.t(`notice.subscribedTitle`)}"`:`title="${n.t(`notice.patreonTitle`)}"`}>
            ${a?`<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />`:`<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />`}</button>
        </div>
        <button id="closeButton" type="button" title="${n.t(`notice.closeTitle`)}"><embed class="svg close" src="/w-close.svg" /></button>
        `;let o=document.getElementById(`closeButton`);o.onclick=async()=>{await e.modal.close(t.EXTENSIONNOTICE)};let s=document.getElementById(`discordButton`);s.onclick=async e=>{e.preventDefault(),window.open(`https://discord.gg/u5RYMkV98s`,`_blank`)};let c=document.getElementById(`patreonButton`);c.onclick=async e=>{e.preventDefault(),window.open(`https://www.patreon.com/battlesystem`,`_blank`)},setTimeout(async()=>{await e.modal.close(t.EXTENSIONNOTICE)},1e4)});