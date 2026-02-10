import OBR from "@owlbear-rodeo/sdk";
import "./css/style.css";
import { Constants, LIGHTDIRECTIONS } from "./utilities/bsConstants";

OBR.onReady(async () =>
{
    const unitsIds = await OBR.player.getSelection();
    if (!unitsIds) return await OBR.popover.close(Constants.CONTEXTID);

    const visionRangeInput = document.getElementById('visionContext') as HTMLInputElement;
    const visionBumperInput = document.getElementById('bumperContext') as HTMLInputElement;
    const visionFalloffInput = document.getElementById('falloffContext') as HTMLInputElement;
    const visionDarkInput = document.getElementById('darkContext') as HTMLInputElement;
    const visionInnerInput = document.getElementById('innerContext') as HTMLInputElement;
    const visionOuterInput = document.getElementById('outerContext') as HTMLInputElement;
    const visionOwnerSelect = document.getElementById('visionOwnerSelect') as HTMLSelectElement;
    const unitDepthSelect = document.getElementById('unitDepthSelect') as HTMLSelectElement;
    const visionLightDirectionSelect = document.getElementById('visionLightDirectionSelect') as HTMLSelectElement;

    for (const direction of Object.values(LIGHTDIRECTIONS))
    {
        const option = document.createElement("option");
        option.value = direction;
        option.textContent = direction.charAt(0) + direction.slice(1).toLowerCase();
        visionLightDirectionSelect.appendChild(option);
    }

    const unitItems = await OBR.scene.items.getItems(item => unitsIds?.includes(item.id));
    const party = await OBR.party.getPlayers();

    const selfItem = document.createElement("option");
    selfItem.value = await OBR.player.getId();
    selfItem.textContent = await OBR.player.getName();
    selfItem.style.color = await OBR.player.getColor();
    visionOwnerSelect.appendChild(selfItem);

    for (const player of party)
    {
        const previewItem = document.createElement("option");
        previewItem.value = player.id;
        previewItem.textContent = player.name;
        previewItem.style.color = player.color;
        visionOwnerSelect.appendChild(previewItem);
    }

    const sceneMetadata = await OBR.scene.getMetadata();

    visionOwnerSelect.value = '';
    if (unitItems.length === 1)
    {
        const token = unitItems[0];
        visionOwnerSelect.value = token.createdUserId;
        visionRangeInput.value = token.metadata[`${Constants.EXTENSIONID}/visionRange`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string
            : GetVisionDefault('visionRangeDefault');

        visionBumperInput.value = token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string
            : GetVisionDefault('visionSourceDefault');

        visionFalloffInput.value = token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string
            : GetVisionDefault('visionFallOffDefault');

        visionInnerInput.value = token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string
            : GetVisionDefault('visionInAngleDefault');

        visionOuterInput.value = token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string
            : GetVisionDefault('visionOutAngleDefault');

        visionDarkInput.value = token.metadata[`${Constants.EXTENSIONID}/visionDark`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string
            : GetVisionDefault('visionDarkDefault');

        unitDepthSelect.value = token.metadata[`${Constants.EXTENSIONID}/unitDepth`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/unitDepth`] as string
            : "0";

        visionLightDirectionSelect.value = token.metadata[`${Constants.EXTENSIONID}/visionFacing`] !== undefined
         ? token.metadata[`${Constants.EXTENSIONID}/visionFacing`] as string
         : Object.values(LIGHTDIRECTIONS)[0];
    }

    visionLightDirectionSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (const item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionFacing`] = target.value;
            }
        });
    };

    visionOwnerSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (const item of items)
            {
                item.createdUserId = target.value;
            }
        });
    };

    visionRangeInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (value < 0)
            target.value = "0";
        if (value > 999)
            target.value = "999";
        if (isNaN(value))
            target.value = GetVisionDefault('visionRangeDefault');
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (let item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionRange`] = target.value;
            }
        });
    };

    visionBumperInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (value < 0)
            target.value = "0";
        if (value > 999)
            target.value = "999";
        if (isNaN(value))
            target.value = GetVisionDefault('visionSourceDefault');

        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (let item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = target.value;
            }
        });
    };

    visionFalloffInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (value < 0)
            target.value = "0";
        if (value > 10)
            target.value = "10";
        if (isNaN(value))
            target.value = GetVisionDefault('visionFallOffDefault');

        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (let item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionFallOff`] = target.value;
            }
        });
    };

    visionInnerInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (value < -360)
            target.value = "-360";
        if (value > 360)
            target.value = "360";
        if (isNaN(value))
            target.value = GetVisionDefault('visionInAngleDefault');
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (let item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionInAngle`] = target.value;
            }
        });
    };

    visionOuterInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (value < -360)
            target.value = "-360";
        if (value > 360)
            target.value = "360";
        if (isNaN(value))
            target.value = GetVisionDefault('visionOutAngleDefault');
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (let item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = target.value;
            }
        });
    };

    visionDarkInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (value < 0)
            target.value = "0";
        if (value > 999)
            target.value = "999";
        if (isNaN(value))
            target.value = GetVisionDefault('visionDarkDefault');
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (let item of items)
            {
                item.metadata[`${Constants.EXTENSIONID}/visionDark`] = target.value;
            }
        });
    };

    unitDepthSelect.onchange = async (event) =>
    {
        const target = event.currentTarget as HTMLSelectElement;
        await OBR.scene.items.updateItems(unitItems.map(x => x.id), items =>
        {
            for (const item of items)
            {
                if (target.value === "0")
                {
                    delete item.metadata[`${Constants.EXTENSIONID}/unitDepth`];
                }
                else
                {
                    item.metadata[`${Constants.EXTENSIONID}/unitDepth`] = target.value;
                }
            }
        });
    };

    function GetVisionDefault(key: string): string
    {
        const cacheValue = sceneMetadata[`${Constants.EXTENSIONID}/${key}`] as string;
        if (!cacheValue) return Constants.ATTENUATIONDEFAULT;
        else return cacheValue;
    }
});