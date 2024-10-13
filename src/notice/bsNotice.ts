import OBR from "@owlbear-rodeo/sdk";
import '/src/notice/notice-style.css'
import { Constants } from "../utilities/bsConstants";

const whatsnew = document.querySelector<HTMLDivElement>('#bs-notice')!;
const footer = document.querySelector<HTMLElement>('#bs-notice-notes')!;

whatsnew.innerHTML = `
  <div id="newsContainer">
    <h1>Smoke & Spectre! 3.0</h1>
    Large thank you to the OBR Devs for all of the development that let these changes be possible.
    <br>
    <br> Smoke & Spectre 3.0 is officially released.  There have been a lot of changes and new features - walls, real-time lighting and more.
    So check the the <a href="https://www.patreon.com/battlesystem">Battle-System Patreon</a> for the full changelog, or jump right in and try it for yourself.
    <br>
    <br> (This will close in 10 seconds and should only show once.)
  </div>
`;

OBR.onReady(async () =>
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const subscriberId = urlParams.get('subscriber')!;
    const subscriber = subscriberId === "true";

    footer.innerHTML = `
        <div id="footButtonContainer">
            <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
            <button id="patreonButton" type="button" ${subscriber ? 'title="Thank you for subscribing!"' : 'title="Check out the Battle-System Patreon"'}>
            ${subscriber ? '<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />'
            : '<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        </div>
        <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
        `;

    const closebutton = document.getElementById('closeButton');
    closebutton!.onclick = async () =>
    {
        await OBR.modal.close(Constants.EXTENSIONNOTICE);
    };

    const discordButton = document.getElementById('discordButton');
    discordButton!.onclick = async (e) =>
    {
        e.preventDefault();
        window.open("https://discord.gg/u5RYMkV98s", "_blank");
    };

    const patreonButton = document.getElementById('patreonButton');
    patreonButton!.onclick = async (e) =>
    {
        e.preventDefault();
        window.open("https://www.patreon.com/battlesystem", "_blank");
    };

    setTimeout(async () =>
    { await OBR.modal.close(Constants.EXTENSIONNOTICE) }, 10000);
});
