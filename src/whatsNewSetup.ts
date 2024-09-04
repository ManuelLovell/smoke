import OBR from "@owlbear-rodeo/sdk";
import { SMOKEMAIN } from "./smokeMain";
import { Constants } from "./utilities/bsConstants";

export function SetupWhatsNew()
{
    SMOKEMAIN.whatsNewButton!.onclick = async function ()
    {
        SMOKEMAIN.whatsNewIcon?.classList.remove("new-shine");
        await OBR.modal.open({
            id: Constants.EXTENSIONWHATSNEW,
            url: `/pages/whatsnew.html`,
            height: 500,
            width: 400,
        });
    };

    let whatsnew = localStorage.getItem(SMOKEMAIN.version);
    if (whatsnew === "false" || !whatsnew)
    {
        SMOKEMAIN.whatsNewIcon?.classList.add("new-shine");
        localStorage.setItem(SMOKEMAIN.version, "true");
    }
}