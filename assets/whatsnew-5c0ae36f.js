import{O as e,C as t}from"./constants-4214fcbb.js";const i=document.querySelector("#smoke-whatsnew"),n=document.querySelector("#smoke-whatsnew-notes");i.innerHTML=`
  <div>
    <h1>Smoke & Spectre! 9/28</h1>
    <b>New feature release, including:</b>
    <ul>
    <li>Persistent Fog! Previously revealed areas can optionally stay visible.</li>
    <li>Trailing Fog with colour and opacity controls</li>
    <li>Automatic map detection</li>
    <li>Built-in Importer for Dungeon Alchemist / Foundry / UVTT</li>
    <li>New Settings UI (cog icon at the top)</li>
    <li>General bug fixes including vision lines outside of the map sometimes breaking</li>
    </br>
    Have fun! <i>Doggosaurus</i>.
    </br>
    </br>
    <h1>Smoke & Spectre! 9/24</h1>
    Attaching tokens to a NOTE will let you toggle vision on/off via that Note's vision button.
    </br>
    Also added Blind.
    </br>
    You can thank Andrew.
    </br>
    </br>
    <h1>Smoke & Spectre! 9/20</h1>
    Added a toggle for the grid snapping, for those who don't want it.
    </br>
    Also added snapping to the polygon tool, because I apparently forgot.
    </br>
    </br>
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
