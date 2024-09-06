import OBR from "@owlbear-rodeo/sdk";
import '/src/css/new-style.css'
import { Constants } from "./utilities/bsConstants";


const whatsnew = document.querySelector<HTMLDivElement>('#bs-whatsnew')!;
const footer = document.querySelector<HTMLElement>('#bs-whatsnew-notes')!;

const whatsNewMessage = `
    <div id="newsContainer">
        <h1>Smoke & Spectre 3.0! 10/1</h1>
        Large thank you to the OBR Devs for all of the development that let these changes be possible.
        </br>
        Scenes should all be backwards compatible, with the exception of tweak on torches.
        </br> - Old torches should still give vision, just they will be recognized as 'characters' instead of 'props'.
        </br>
        </br> Brief Summary of Changes:
        </br> - Tokens now have Vision Radius, Vision Fall Off (Blur at the edge of a token), Wall Collision Distance (How close they can be before being stopped by a wall) as well as Inner/Outer Angles (for setting a cone on vision).
        </br> - Vision/Collision checks are done realtime, so you'll see it as you move the token around.
        </br> - Walls can be set to have collision, so a unit cannot pass through.
        </br> - Spectre was rewritten (again) for efficiency. Most/all past limitations should be gone.
        </br> - Trailing Fog, Auto-Hide and Background-Image Fog are currently removed.
        </br>
        </br> Known Issues:
        </br> - Persistent vision from a token can trigger the vision of a torch.
        </br> - A token with 'conal' vision can only interact with the token on the viewable part.
        </br>
        </br> The rest of the changelog will be posted to the Patreon. Link is on the below on the bottom-left of this popup.
    </div>
`;

OBR.onReady(async () =>
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const subscriberId = urlParams.get('subscriber')!;
    const subscriber = subscriberId === "true";
    whatsnew.innerHTML = whatsNewMessage;

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
