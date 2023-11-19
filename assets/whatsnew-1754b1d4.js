import{O as e,C as n}from"./constants-68d4f0c0.js";const a=document.querySelector("#smoke-whatsnew"),r=document.querySelector("#smoke-whatsnew-notes"),s=`
<div>
  <div class="title">Smoke & Spectre! Help</div>
  </br>
  <sub>Token Ownership </sub>
  </br>
  <li>If you are logged in and pull a token from your own dock, you are automatically the owner of that token.
  </br>
  <li>You can also have a GM assign you as owner, if they use the Player action button, go to Player Permissions and turn on "Owner Only".
  </br>
  After this, they can assign owners on a token's ContextMenu anytime.
  </br>
  <li>If your GM is using Clash! they can also assign ownership by right-clicking a unit in the Initiative List.
  </br>
  </br>
  <sub>Token Vision</sub>
  </br>
  <li>If you see 'Vision Disabled' on a token in your list, it means the GM has not enabled vision for that token.
  </br>
  <li>GM-Owned tokens with vision share their vision with all players..
</div>`,l=`
  <div>
    <h1>Smoke & Spectre! 19/11/2023</h1>
    </br>
    <li>Clicking the "Enable Dynamic Fog" button OFF now REMOVES THE FOG FILL. BE AWARE.
    <li>Added more clarity on the player-end. Their window now shows a list of all tokens they own in the scene and if it has vision enabled.
    <li>Also added a help button on Player end, to explain how vision works and what THEY can do to fix that. (Generally it means they don't own a token)
    </br>
    See you around~ Battle-System (Que!)
    </br>
    </br>
    <h1>Smoke & Spectre! 15/11/2023</h1>
    </br>
    <li>Fixed a bug with the fog color selector hitting the rate limit.
    <li>Added some resilience to Spectre - it'll now backup your Spectre'd objects to the scene. So you can refresh and keep your spectres.
    <li>They will lose their targets though (and on the player end, if you refresh, they disappear for that duration anyway). But you can set them again.
    <li>Also you should be able to 'Un-Spectre' now.
    </br>
    See you around~ Battle-System (Que!)
    </br>
    </br>
    <h1>Smoke & Spectre! 27/10/2023</h1>
    <b>New feature release, including:</b>
    <ul>
    <li><b>Doors!</b> Enable the new door option on obstruction lines, then double click the door icon to quickly toggle the line visibility.</li>
    <li><b>Fog backgrounds!</b> Maps can now be converted into a fog background image and fixed in place, or unlocked again to be put back on the map layer.</li>
    <li><b>Performance improvements!</b> Several significant performance improvements, as well as a toggle for speed/accuracy. Complex paths are also simplified automatically on import.</li>
    <li><b>Bug fixes!</b> Numerous bug fixes, particularly when importing from UVTT.</li>
    </ul>
    </br>
    See you on discord! - <i>Doggsaurus</i>
    </br>
    </br>
    (Threw in some updates to have themes handled explicitly by OBR, and adding a warning if LocalStorage is disabled. Some features require it. ~Que)
    </br>
    </br>
    <h1>Smoke & Spectre! 10/10/2023</h1>
    <b>New feature release, including:</b>
    <ul>
    <li><b>Torches!</b> Setting a token to a torch makes it visible when other player tokens have line of sight to it.</li>
    <li><b>Autohide!</b> New button added on tokens so they can now be set to hide automatically when trailing fog is turned on and they're outside the current view</li>
    <li>Performance improvements for persistent fog</li>
    <li>Obstruction lines can now be rotated, including when attached to other tokens</li>
    <li>UI / Usability improvements - new main menu style, additional tooltips on many options.</li>
    </ul>
    </br>
    Let us know how you go, on discord - <i>Doggosaurus</i>.
    </br>
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
`;e.onReady(async()=>{const o=window.location.search,t=new URLSearchParams(o).get("gethelp");a.innerHTML=t?s:l,r.innerHTML=`
    <a href="https://discord.gg/ANZKDmWzr6" target="_blank">Join the OBR Discord!</a>
    <div class="mask"></div>
    </div>
    <div class="close">⤬</div>`;const i=document.querySelector(".close");i.onclick=async()=>{await e.modal.close(n.EXTENSIONWHATSNEW)}});
