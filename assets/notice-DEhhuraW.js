import{O as e,C as n}from"./bsConstants-DGhg8OOo.js";const i=document.querySelector("#bs-notice"),l=document.querySelector("#bs-notice-notes");i.innerHTML=`
  <div id="newsContainer">
    <h1>Smoke & Spectre! 3.0</h1>
    Large thank you to the OBR Devs for all of the development that let these changes be possible.
    <br>
    <br> Smoke & Spectre 3.0 is officially released.  There have been a lot of changes and new features - walls, real-time lighting and more.
    So check the the <a href="https://www.patreon.com/battlesystem">Battle-System Patreon</a> for the full changelog, or jump right in and try it for yourself.
    <br>
    <br> (This will close in 10 seconds and should only show once.)
  </div>
`;e.onReady(async()=>{const s=window.location.search,o=new URLSearchParams(s).get("subscriber")==="true";l.innerHTML=`
        <div id="footButtonContainer">
            <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
            <button id="patreonButton" type="button" ${o?'title="Thank you for subscribing!"':'title="Check out the Battle-System Patreon"'}>
            ${o?'<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />':'<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        </div>
        <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
        `;const r=document.getElementById("closeButton");r.onclick=async()=>{await e.modal.close(n.EXTENSIONNOTICE)};const a=document.getElementById("discordButton");a.onclick=async t=>{t.preventDefault(),window.open("https://discord.gg/u5RYMkV98s","_blank")};const c=document.getElementById("patreonButton");c.onclick=async t=>{t.preventDefault(),window.open("https://www.patreon.com/battlesystem","_blank")},setTimeout(async()=>{await e.modal.close(n.EXTENSIONNOTICE)},1e4)});
