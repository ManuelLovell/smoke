import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "../utilities/bsConstants";

OBR.onReady(() =>
{
    const fillBar = document.getElementById('progressFill')!;
    const fillText = document.getElementById('progressText')!;

    fillBar.style.width = 0 + '%';

    OBR.broadcast.onMessage(Constants.PROGRESSBAR, async (data: any) =>
    {
        const progress = data.data as ProgressData;
        const percent = Math.min(100, Math.floor((progress.current / progress.total) * 100));
        
        fillText.textContent = `${percent}%`;
        fillBar.style.width = percent + '%';
        if (progress.complete)
        {
            await OBR.modal.close(Constants.PROGRESSBAR);
        }
    });

});