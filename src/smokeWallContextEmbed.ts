import OBR from "@owlbear-rodeo/sdk";
import "./css/style.css";
import { Constants } from "./utilities/bsConstants";

OBR.onReady(async () =>
{
    const wallIds = await OBR.player.getSelection();
    if (!wallIds) return await OBR.popover.close(Constants.CONTEXTID);
    const visionOwnerSelect = document.getElementById('wallVisionSelect') as HTMLSelectElement;
    const wallDepthSelect = document.getElementById('wallDepthSelect') as HTMLSelectElement;

    const unitItems = await OBR.scene.items.getItems(item => wallIds?.includes(item.id));
    const party = await OBR.party.getPlayers();

    const selfItem = document.createElement("option");
    selfItem.value = "000000";
    selfItem.textContent = "Everyone";
    visionOwnerSelect.appendChild(selfItem);

    for (const player of party)
    {
        const previewItem = document.createElement("option");
        previewItem.value = player.id;
        previewItem.textContent = player.name;
        previewItem.style.color = player.color;
        visionOwnerSelect.appendChild(previewItem);
    }

    visionOwnerSelect.value = '';
    if (unitItems.length === 1)
    {
        const token = unitItems[0];
        const viewers = token.metadata[`${Constants.EXTENSIONID}/wallViewers`] as string[];
        const depth = token.metadata[`${Constants.EXTENSIONID}/wallDepth`] as string;
        if (viewers?.length > 0)
        {
            visionOwnerSelect.value = viewers[0];
        }
        else
        {
            visionOwnerSelect.value = "000000";
        }

        if (depth) wallDepthSelect.value = depth;
        else wallDepthSelect.value = "0";
    }

    visionOwnerSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (const item of items)
            {
                if (target.value === "000000")
                {
                    delete item.metadata[`${Constants.EXTENSIONID}/wallViewers`];
                }
                else
                {
                    item.metadata[`${Constants.EXTENSIONID}/wallViewers`] = [target.value];
                }
            }
        });
    };

    wallDepthSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (const item of items)
            {
                if (target.value === "0")
                {
                    delete item.metadata[`${Constants.EXTENSIONID}/wallDepth`];
                }
                else
                {
                    item.metadata[`${Constants.EXTENSIONID}/wallDepth`] = target.value;
                }
            }
        });
    };
});