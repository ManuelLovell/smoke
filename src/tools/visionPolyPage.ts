import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";
import "../css/style.css";

OBR.onReady(async () =>
{
    const buttonContainer = document.getElementById("buttonContainer") as HTMLDivElement;
    buttonContainer.style.placeContent = "space-evenly";
    buttonContainer.style.display = "flex";
    buttonContainer.style.width = "100%";

    const buttonFinish = document.createElement('input');
    buttonFinish.id = "endLine";
    buttonFinish.classList.add("end-line");
    buttonFinish.classList.add("mysteryButton");
    buttonFinish.style.paddingLeft = "6px";
    buttonFinish.style.paddingRight = "6px";
    buttonFinish.value = "Finish Polygon";
    buttonFinish.type = "button";
    buttonFinish.onclick = async () =>
    {
        await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/finishPoly`]: true });
    };

    const buttonCancel = document.createElement('input');
    buttonCancel.id = "endLine";
    buttonCancel.classList.add("end-line");
    buttonCancel.classList.add("mysteryButton");
    buttonCancel.style.paddingLeft = "6px";
    buttonCancel.style.paddingRight = "6px";
    buttonCancel.value = "Cancel Polygon";
    buttonCancel.type = "button";
    buttonCancel.onclick = async () =>
    {
        await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/cancelPoly`]: true });
    };

    buttonContainer.appendChild(buttonFinish);
    buttonContainer.appendChild(buttonCancel);
});