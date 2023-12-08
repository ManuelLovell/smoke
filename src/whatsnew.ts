import OBR from "@owlbear-rodeo/sdk";
import '/src/css/new-style.css'
import { Constants } from "./utilities/constants";


const whatsnew = document.querySelector<HTMLDivElement>('#smoke-whatsnew')!;
const footer = document.querySelector<HTMLElement>('#smoke-whatsnew-notes')!;

const needHelpMessage = `
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
</div>`;
const whatsNewMessage = `
    <div>
    <h1>Smoke & Spectre! 08/12/2023</h1>
    </br>
    <li>Lifted the Spectre restriction from Characters only. Spectre anything.. probably. :)
    </br>
    See you around~ Battle-System (Que!)
    </br>
    </br>
    <h1>Smoke & Spectre! 06/12/2023</h1>
    </br>
    <li>Sorry for the bumps lately. The 'black fog' should be fixed now (it was rendering several times and shouldn't have) and this should hopefully come with some performance improvements. Unfortunately while in the process of updating the older code, some unintended things happened. The 'worst' should be fixed as the issue was identified, and now it SHOULD be behaving as expected. Let me know if you are still seeing hiccups in rendering or otherwise. Thanks.
    </br>
    See you around~ Battle-System (Que!)
    </br>
    </br>
    <h1>Smoke & Spectre! 04/12/2023</h1>
    </br>
    <li>Update One: Tool options have been surfaced in Settings. So you can set default Line Color/Width/Style. You can thank Andrew(SeveralRecord) because it's hard to tell him no.
    <li>Update Two: Added an 'Error Indicator' to the top left. You can't miss it. You can click this to see which players are not loading correctly.  This could be from not having a token with vision enabled (So they're just blind), an error in their browser because of script blockers or maybe a bug I don't know about. But now you'll know about it before it ruins your session.  It'll update everytime fog is calculated, so if you see the light staying red - check it out.
    </br>
    See you around~ Battle-System (Que!)
    </br>
    </br>
    <h1>Smoke & Spectre! 26/11/2023</h1>
    </br>
    <li>Doggo did great work with the doors, and people have been asking about letting players see them.  So I re-organized the settings menu and added a <b>'Player-Visible Doors' option</b>.  This should allow for the toggling on/off of player's seeing doors.  As always, check your room in an incognito view to make sure it's what you're expecting!
    </br>
    </br>
    <h1>Smoke & Spectre! 23/11/2023</h1>
    </br>
    <li>Just forgot to remove the text about Spectres being a one-way transaction.
    </br>
    </br>
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
`;

OBR.onReady(async () =>
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const help = urlParams.get('gethelp')!;
    
    whatsnew.innerHTML = help ? needHelpMessage : whatsNewMessage;

    footer.innerHTML = `
    <a href="https://discord.gg/ANZKDmWzr6" target="_blank">Join the OBR Discord!</a>
    <div class="mask"></div>
    </div>
    <div class="close">⤬</div>`;

    const closebutton = document.querySelector<HTMLElement>('.close')!;
    closebutton!.onclick = async () =>
    {
        await OBR.modal.close(Constants.EXTENSIONWHATSNEW);
    };
});
