import OBR from "@owlbear-rodeo/sdk";
import '/src/css/new-style.css'
import { Constants } from "./utilities/bsConstants";


const whatsnew = document.querySelector<HTMLDivElement>('#bs-whatsnew')!;
const footer = document.querySelector<HTMLElement>('#bs-whatsnew-notes')!;

const needHelpMessage = `
    <div id="newsContainer">
        <div class="title">Smoke & Spectre! Help</div>
    </div>`;

const whatsNewMessage = `
    <div id="newsContainer">
        <h1>Smoke & Spectre 3.0! 8/30</h1>
        It's here.
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
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
