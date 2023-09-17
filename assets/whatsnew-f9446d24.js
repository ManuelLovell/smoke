import{O as e,C as t}from"./constants-4214fcbb.js";const s=document.querySelector("#smoke-whatsnew"),n=document.querySelector("#smoke-whatsnew-notes");s.innerHTML=`
  <div>
    <h1>Smoke & Spectre! 9/16</h1>
    Fixed a bug where the boundary input was going crazy if you changed the scale of the box.
    </br>
    Possibly fixed a bug to do with enabling vision lines for DFog1.0 lines.
    </br>
    Updated the messaging on the Spectre control to show 'No players' if there is no one in game to set vision to.
    </br>
    Also updated the control to refresh on player changes.
    </br>
    'General Stability Fixes.'
    </br>
    </br>
`;e.onReady(async()=>{n.innerHTML=`
    <a href="https://discord.gg/ANZKDmWzr6" target="_blank">Join the OBR Discord!</a>
    <div class="mask"></div>
    </div>
    <div class="close">⤬</div>`;const o=document.querySelector(".close");o.onclick=async()=>{await e.modal.close(t.EXTENSIONWHATSNEW)}});
