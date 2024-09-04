import OBR from "@owlbear-rodeo/sdk";
import "../css/style.css";
import { Constants } from "../utilities/bsConstants";

OBR.onReady(async () =>
{
    const buttonContainer = document.getElementById("buttonContainer") as HTMLDivElement;
    buttonContainer.style.placeContent = "space-evenly";
    buttonContainer.style.display = "flex";
    buttonContainer.style.width = "100%";

    const buttonFinish = document.createElement('input');
    buttonFinish.id = "endLine";
    buttonFinish.classList.add("ele-line");
    buttonFinish.classList.add("mysteryButton");
    buttonFinish.style.paddingLeft = "6px";
    buttonFinish.style.paddingRight = "6px";
    buttonFinish.value = "Finish Polygon";
    buttonFinish.type = "button";
    buttonFinish.onclick = async () =>
    {
        await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/ELEVATIONEVENT`, "FINISH", { destination: "LOCAL" });
    };

    const buttonCancel = document.createElement('input');
    buttonCancel.id = "endLine";
    buttonCancel.classList.add("ele-line");
    buttonCancel.classList.add("mysteryButton");
    buttonCancel.style.paddingLeft = "6px";
    buttonCancel.style.paddingRight = "6px";
    buttonCancel.value = "Cancel Polygon";
    buttonCancel.type = "button";
    buttonCancel.onclick = async () =>
    {
        await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/ELEVATIONEVENT`, "CANCEL", { destination: "LOCAL" });
    };

    const buttonUndo = document.createElement('input');
    buttonUndo.id = "undoLine";
    buttonUndo.classList.add("ele-line");
    buttonUndo.classList.add("mysteryButton");
    buttonUndo.style.paddingLeft = "6px";
    buttonUndo.style.paddingRight = "6px";
    buttonUndo.value = "Undo Point";
    buttonUndo.type = "button";
    buttonUndo.onclick = async () =>
    {
        await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/ELEVATIONEVENT`, "UNDO", { destination: "LOCAL" });
    };

    buttonContainer.appendChild(buttonFinish);
    buttonContainer.appendChild(buttonCancel);
    buttonContainer.appendChild(buttonUndo);
});