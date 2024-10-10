import{O as o,C as c}from"./bsConstants-CliuOKs_.js";const i=document.querySelector("#bs-notice"),l=document.querySelector("#bs-notice-notes");i.innerHTML=`
  <div id="newsContainer">
    <h1>Smoke & Spectre! 3.0</h1>
    Large thank you to the OBR Devs for all of the development that let these changes be possible.
    <br>
    <br> Smoke & Spectre 3.0 is officially released.  There have been a lot of changes and new features - walls, real-time lighting and more.
    So check the the <a href="https://www.patreon.com/battlesystem">Battle-System Patreon</a> for the full changelog, or jump right in and try it for yourself.
    <br>
    <br> (This popup should only show once, so don't kill me.)
  </div>
`;o.onReady(async()=>{const n=window.location.search,e=new URLSearchParams(n).get("subscriber")==="true";l.innerHTML=`
        <div id="footButtonContainer">
            <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
            <button id="patreonButton" type="button" ${e?'title="Thank you for subscribing!"':'title="Check out the Battle-System Patreon"'}>
            ${e?'<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />':'<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        </div>
        <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
        `;const s=document.getElementById("closeButton");s.onclick=async()=>{await o.modal.close(c.EXTENSIONNOTICE)};const r=document.getElementById("discordButton");r.onclick=async t=>{t.preventDefault(),window.open("https://discord.gg/u5RYMkV98s","_blank")};const a=document.getElementById("patreonButton");a.onclick=async t=>{t.preventDefault(),window.open("https://www.patreon.com/battlesystem","_blank")}});
