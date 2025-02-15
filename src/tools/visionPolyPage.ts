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
    buttonFinish.value = "Finish Polygon";
    buttonFinish.type = "button";
    buttonFinish.onclick = async () =>
    {
        await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/POLYGONEVENT`, "FINISH", { destination: "LOCAL" });
    };

    const buttonCancel = document.createElement('input');
    buttonCancel.id = "endLine";
    buttonCancel.classList.add("end-line");
    buttonCancel.value = "Cancel Polygon";
    buttonCancel.type = "button";
    buttonCancel.onclick = async () =>
    {
        await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/POLYGONEVENT`, "CANCEL", { destination: "LOCAL" });
    };

    const buttonUndo = document.createElement('input');
    buttonUndo.id = "undoLine";
    buttonUndo.classList.add("end-line");
    buttonUndo.value = "Undo Point";
    buttonUndo.type = "button";
    buttonUndo.onclick = async () =>
    {
        await OBR.broadcast.sendMessage(`${Constants.EXTENSIONID}/POLYGONEVENT`, "UNDO", { destination: "LOCAL" });
    };

    buttonContainer.appendChild(buttonFinish);
    buttonContainer.appendChild(buttonCancel);
    buttonContainer.appendChild(buttonUndo);
});