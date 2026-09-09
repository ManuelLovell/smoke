import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "../helpers/BSConstants";
import { Translation } from "../i18n/Translation";

const whatsnew = document.querySelector<HTMLDivElement>('#bs-notice')!;
const footer = document.querySelector<HTMLElement>('#bs-notice-notes')!;

whatsnew.innerHTML = `
  <div id="newsContainer">
        <h1>${Translation.t('notice.title')}</h1>
        ${Translation.t('notice.bodyLine1')}
    <br>
        <br> ${Translation.t('notice.bodyLine2')}
        ${Translation.t('notice.bodyLine3')}
    <br>
        <br> ${Translation.t('notice.bodyLine4')}
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
            <button id="discordButton" type="button" title="${Translation.t('notice.discordTitle')}"><embed class="svg discord" src="/w-discord.svg" /></button>
            <button id="patreonButton" type="button" ${subscriber ? `title="${Translation.t('notice.subscribedTitle')}"` : `title="${Translation.t('notice.patreonTitle')}"`}>
            ${subscriber ? '<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />'
            : '<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        </div>
        <button id="closeButton" type="button" title="${Translation.t('notice.closeTitle')}"><embed class="svg close" src="/w-close.svg" /></button>
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
