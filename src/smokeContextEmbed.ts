import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import "./css/style.css";
import { Constants } from "./utilities/bsConstants";

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

    const unitItems = await OBR.scene.items.getItems(item => unitsIds?.includes(item.id));
    const sceneMetadata = await OBR.scene.getMetadata();

    if (unitItems.length === 1)
    {
        const token = unitItems[0];
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
    }
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
        await OBR.scene.items.updateItems(unitItems, items =>
        {
            items[0].metadata[`${Constants.EXTENSIONID}/visionRange`] = target.value;
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

        await OBR.scene.items.updateItems(unitItems, items =>
        {
            items[0].metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = target.value;
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

        await OBR.scene.items.updateItems(unitItems, items =>
        {
            items[0].metadata[`${Constants.EXTENSIONID}/visionFallOff`] = target.value;
        });
    };

    visionInnerInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (value < 0)
            target.value = "0";
        if (value > 360)
            target.value = "360";
        if (isNaN(value))
            target.value = GetVisionDefault('visionInAngleDefault');
        await OBR.scene.items.updateItems(unitItems, items =>
        {
            items[0].metadata[`${Constants.EXTENSIONID}/visionInAngle`] = target.value;
        });
    };

    visionOuterInput.onchange = async (event: Event) =>
    {
        if (!event || !event.target) return;

        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        if (value < 0)
            target.value = "0";
        if (value > 360)
            target.value = "360";
        if (isNaN(value))
            target.value = GetVisionDefault('visionOutAngleDefault');
        await OBR.scene.items.updateItems(unitItems, items =>
        {
            items[0].metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = target.value;
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
        await OBR.scene.items.updateItems(unitItems, items =>
        {
            items[0].metadata[`${Constants.EXTENSIONID}/visionDark`] = target.value;
        });
    };

    function GetVisionDefault(key: string): string
    {
        const cacheValue = sceneMetadata[`${Constants.EXTENSIONID}/${key}`] as string;
        if (!cacheValue) return Constants.ATTENUATIONDEFAULT;
        else return cacheValue;
    }
});