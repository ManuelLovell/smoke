import OBR from "@owlbear-rodeo/sdk";
import '/src/css/new-style.css'
import { Constants } from "./utilities/constants";


const whatsnew = document.querySelector<HTMLDivElement>('#bs-whatsnew')!;
const footer = document.querySelector<HTMLElement>('#bs-whatsnew-notes')!;

const needHelpMessage = `
  <div id="newsContainer">
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
    <div id="newsContainer">
        <h1>Smoke & Spectre! 4/11</h1>
        Minor bugfix.
        </br> Addressed the lag when clicking to place a point when drawing obstructions.
        </br> As always, I don't mind the feedback - but realize this is something released for free, that I work on in my free time. Try not to come off as an entitled twerp when doing so. It's appreciated.
        </br>
        <h1>Smoke & Spectre! 4/3/2024</h1>
        Minor bugfix/update.
        </br> Better handling for multiple GMs. Previously, a change in role would not trigger Smoke to reload the UI and set the appropriate handlers. Now it does! (or should).
        <h1>Smoke & Spectre! 2/25/2024</h1>
        'Bigger' update today!
        </br> Finally got around to making the brush tool. It's been on my list for awhile, because I really want to smooth the curve of making dungeons.
        </br> This is part 1, and part 2 is later down the pipe.
        </br>
        <img class="news-image" src="/smokebrush.gif" alt="Smokey GIF">
        </br> If you like seeing these updates and ease of use updates, be sure to show some support at Patreon! (It's free unless you don't want it to be free.)
        <h1>Smoke & Spectre! 2/17/2024</h1>
        Minor fix for rotated maps not calculating fog in the right spot with auto-detect.
        </br> To be clear, it's maps rotated in increments of 90s. If you're doing something else I don't know what to do with you.
        </br>
        <h1>Smoke & Spectre! 2/6/2024</h1>
        Minor update. Fixed the non-functioning 'Cancel Polygon' button'.
        </br>
        <h1>Smoke & Spectre! 2/6/2024</h1>
        That darn bounding grid.
        </br> I've turned it off by default.  It now deletes instead of hides if you have auto-detect on.
        </br> I also added a fake-menu button that just tells you what it is when you select it.
        </br> I hope this helps.
        </br>
        <h1>Smoke & Spectre! 1/31/2024</h1>
        Hello again!  Minor (but needed) changes today.
        </br> You'll notice the 'Finish' and 'Cancel' labels that have plagued you for so long are gone. They have been moved.
        </br> Their new home is in the little info popup at the top of the screen when you start using the tool. So you should have an easier time getting those perfect end-to-end lines now.
        </br> Sorry this one took so long!
        </br>
        </br>
        <h1>Smoke & Spectre! 1/16/2024</h1>
        </br>
        Minor bug fix for some bad null checking in.. a really obscure scenario.
        </br>
        </br>
        <h1>Smoke & Spectre! 1/14/2024</h1>
        </br>
        Minor change on the UI, as not everyone is using the same measurement system.  Smoke's measurements don't really reflect whatever the 'unit' is set as in OBR (So if it was set to FT, Bananas, Puppies - it still functioned the same.) To reflect this, the measurement is now just called 'units'. It's a nothing change, but hopefully makes things clearer.
        </br>
        </br>
        <h1>Smoke & Spectre! 12/22/2023</h1>
        </br>
        <li>To cut out the middle-man of having to turn on "Owner-Only" on tokens for per-player-vision to work, you can now RIGHT-CLICK a unit in the Smoke! window and assign it's owner there. One and done.
        </br>
        See you around~ Battle-System (Que!)
        </br>
        </br>
        <h1>Smoke & Spectre! 10/12/2023</h1>
        </br>
        <li>So.. in an effort to smooth out future development, did a large refactor.  Overall, it should run cleaner and more consistent. Less dupliated calls all around.  Scene changes are handled with more grace.
        <li>Added a notification bubble so you can tell when things are processing. With large-scale maps (with thousands and thousands of obstructions) performance can take a couple seconds if you're using ACCURATE mode (It's still near instant with Fast).
        <li>Enabling torches visibly disables 'Performance: Fast' mode. (It always did, but it was never told to the user.)
        <li>Lots of fixes. I didn't count. Find me on Discord if I missed something.
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
    </div>
`;

OBR.onReady(async () =>
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const help = urlParams.get('gethelp')!;
    const subscriberId = urlParams.get('subscriber')!;
    const subscriber = subscriberId === "true";
    whatsnew.innerHTML = help ? needHelpMessage : whatsNewMessage;

    footer.innerHTML = `
    <div id="footButtonContainer">
        <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
        <button id="patreonButton" type="button" ${subscriber ? 'title="Thank you for subscribing!"' : 'title="Check out the Battle-System Patreon"'}>
        ${subscriber ? '<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />'
            : '<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        <button id="basicTutorial" type="button" title="Go to the Basic Tutorial, created by the OBR Community Manager Andrew.">Basic</br>Tutorial</button>
        <button id="advTutorial" type="button" title="Go to the Basic Tutorial, created by the OBR Community Manager Andrew.">Advanced</br>Tutorial</button>
    </div>
    <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
    `;
    // footer.innerHTML = `
    // <div id="buttonWrapper">
    //     <a href="https://www.patreon.com/battlesystem" target="_blank">Patreon!</a>
    //     <a href="https://discord.gg/ANZKDmWzr6" target="_blank">Discord!</a>
    //     <a href="https://www.reddit.com/r/OwlbearRodeo/s/OHvSwEEQCw" target="_blank">Basic\nTutorial</a>
    //     <a href="https://www.reddit.com/r/OwlbearRodeo/s/U19IoydcHP" target="_blank">Advanced\nTutorial</a>
    // </div>
    // <div class="close">⤬</div>`;

    const closebutton = document.getElementById('closeButton');
    closebutton!.onclick = async () =>
    {
        await OBR.modal.close(Constants.EXTENSIONWHATSNEW);
    };

    const patreonButton = document.getElementById('patreonButton');
    patreonButton!.onclick = async (e) =>
    {
        e.preventDefault();
        window.open("https://www.patreon.com/battlesystem", "_blank");
    };

    const discordButton = document.getElementById('discordButton');
    discordButton!.onclick = async (e) =>
    {
        e.preventDefault();
        window.open("https://discord.gg/ANZKDmWzr6", "_blank");
    };
    
    const basicButton = document.getElementById('basicTutorial');
    basicButton!.onclick = async (e) =>
    {
        e.preventDefault();
        window.open("https://www.reddit.com/r/OwlbearRodeo/s/OHvSwEEQCw", "_blank");
    };
    
    const advButton = document.getElementById('advTutorial');
    advButton!.onclick = async (e) =>
    {
        e.preventDefault();
        window.open("https://www.reddit.com/r/OwlbearRodeo/s/U19IoydcHP", "_blank");
    };
});
