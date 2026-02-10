
import "./css/style.css";
import "@melloware/coloris/dist/coloris.css";
import Coloris from "@melloware/coloris";
import * as showdown from 'showdown';
import OBR, { Item, Image, Player } from '@owlbear-rodeo/sdk';
import { BSCACHE } from './utilities/bsSceneCache.ts';
import { Constants } from "./utilities/bsConstants.ts";
import { SetupContextMenus } from "./smokeSetupContextMenus.ts";
import { isTokenWithVisionForUI, isTokenWithVisionIOwn, isTorch } from "./utilities/itemFilters.ts";
import { SetupGMInputHandlers } from "./smokeHandlers.ts";
import { UpdateMaps } from "./tools/importUVTT.ts";
import { SetupTools } from "./tools/smokeSetupTools.ts";
import { SMOKEMACHINE } from "./smokeProcessor.ts";
import { SPECTREMACHINE } from "./SpectreTwo.ts";
import * as Utilities from "./utilities/bsUtilities.ts";
import 'tippy.js/dist/border.css';
import { CreateTooltips } from "./utilities/bsTooltips.ts";
import { ViewportFunctions } from "./utilities/bsViewport.ts";
import { GetDarkvisionDefault, GetFalloffRangeDefault, GetInnerAngleDefault, GetOuterAngleDefault, GetSourceRangeDefault, GetVisionRangeDefault } from "./tools/visionToolUtilities.ts";
import { ClickableInput } from "./utilities/bsClickableInput.ts";

export class SmokeMain
{
    public mainWindow = document.getElementById('app') as HTMLDivElement;

    public smokeViewToggle?: HTMLButtonElement;
    public spectreViewToggle?: HTMLButtonElement;
    public settingsViewToggle?: HTMLButtonElement;
    public helpViewToggle?: HTMLButtonElement;

    public smokeViewPanel?: HTMLDivElement;
    public spectreViewPanel?: HTMLDivElement;
    public settingsViewPanel?: HTMLDivElement;
    public helpViewPanel?: HTMLDivElement;

    public patreonContainer?: HTMLDivElement;

    public onVisionPanelMain = true;
    public visionPanelMain?: HTMLTableRowElement;
    public visionPanelSub?: HTMLTableRowElement;
    public smokeUnitTablePrime?: HTMLTableElement;
    public smokeUnitTableSub?: HTMLTableElement;

    public tokenList?: HTMLTableSectionElement;
    public hiddenList?: HTMLTableSectionElement;

    public version: string;

    private draggedRow: HTMLTableRowElement | null = null;

    constructor(version: string)
    {
        this.version = `SMOKEANDSPECTRE-${version}`;
    }

    public async Stop()
    {
        await OBR.action.setHeight(100);
        await OBR.action.setWidth(300);
        this.mainWindow!.innerHTML =
            `
        <div id="stopScreen">
            Awaiting Scene...
        </div>
        `;
    }

    public async Start()
    {
        /// Temporary message for letting people be aware
        function isLocalStorageEnabled()
        {
            const testKey = 'test';
            try
            {
                localStorage.setItem(testKey, '1');
                localStorage.removeItem(testKey);
                return true; // localStorage is enabled
            } catch (error)
            {
                return false; // localStorage is disabled or not supported
            }
        }

        // Hardware Acceleration Test
        const hardwareAccel = Utilities.IsHardwareAccelerationEnabled().hasHardwareAcceleration;
        await OBR.player.setMetadata({ [`${Constants.EXTENSIONID}/hardwareAcceleration`]: hardwareAccel });
        if (!hardwareAccel)
        {
            await OBR.broadcast.sendMessage(
                Constants.WARNINGCASTID,
                OBR.player.id,
                { destination: "REMOTE" });
        }
        // Hardware Acceleration Test

        if (BSCACHE.playerRole === "GM")
        {
            await OBR.action.setHeight(530);
            await OBR.action.setWidth(420);

            const width = await OBR.viewport.getWidth();
            const useMobile = width < 400;

            this.mainWindow!.innerHTML = useMobile ? Constants.SMOKEMOBILEMAIN : Constants.SMOKEMAIN;
            this.smokeViewToggle = document.getElementById("smokeViewToggle") as HTMLButtonElement;
            this.spectreViewToggle = document.getElementById("spectreViewToggle") as HTMLButtonElement;
            this.settingsViewToggle = document.getElementById("settingsViewToggle") as HTMLButtonElement;
            this.helpViewToggle = document.getElementById("helpViewToggle") as HTMLButtonElement;

            this.smokeViewPanel = document.getElementById("smokeViewPanel") as HTMLDivElement;
            this.spectreViewPanel = document.getElementById("spectreViewPanel") as HTMLDivElement;
            this.settingsViewPanel = document.getElementById("settingsViewPanel") as HTMLDivElement;
            this.helpViewPanel = document.getElementById("helpViewPanel") as HTMLDivElement;

            this.patreonContainer = document.getElementById("patreonContainer") as HTMLDivElement;

            // Setup Panels before hitting Handlers
            this.smokeViewPanel.innerHTML = useMobile ? Constants.SMOKEMOBILEHTML : Constants.SMOKEHTML;
            this.spectreViewPanel.innerHTML = Constants.SPECTREHTML;
            this.settingsViewPanel.innerHTML = useMobile ? Constants.SETTINGSMOBILEHTML : Constants.SETTINGSHTML;

            // Setup Player Owner Context Menu
            const playerContextMenu = document.getElementById("playerListing")!;
            playerContextMenu.appendChild(this.GetEmptyContextItem("Self"));

            // Setup Player Owner Context Menu
            const playerPreviewMenu = document.getElementById("preview_select")!;
            playerPreviewMenu.innerHTML = "";
            const selfItem = document.createElement("option");
            selfItem.value = BSCACHE.playerId;
            selfItem.textContent = `View As: Self`;
            playerPreviewMenu.appendChild(selfItem);

            for (const player of BSCACHE.party)
            {
                const listItem = document.createElement("li");
                listItem.id = player.id;
                listItem.textContent = player.name;
                listItem.style.color = player.color;
                playerContextMenu.appendChild(listItem);

                const previewItem = document.createElement("option");
                previewItem.value = player.id;
                previewItem.textContent = `View As: ${player.name}`
                previewItem.style.color = player.color;
                playerPreviewMenu.appendChild(previewItem);
            };

            Coloris.init();
            await SetupContextMenus()
            this.SetupHelpDocuments();
            this.SetupGMPanelHandlers();
            await this.UpdateVisionList();
            SetupGMInputHandlers(useMobile);
            UpdateMaps();
            SetupTools();
            CreateTooltips();
            await SPECTREMACHINE.Initialize();

            // Warnings Check
            if (!hardwareAccel)
                await Utilities.HardwareWarning(true);
            // Warnings Check for Party
            await Utilities.HardwareWarning(false, BSCACHE.party);
        }
        else
        {
            // player view logic
            await OBR.action.setHeight(300);
            await OBR.action.setWidth(300);
            this.mainWindow!.innerHTML = `
                <div id="titleHolder" style="display: flex; width: 100%;">
                    <div style="width:60%;">Tokens You Own</div>
                    <div style="width:30%;">Vision</div>
                    <div style="width:10%;" id="patreonContainer"></div>
                </div>
                <div id="playerView" class="scrollable-table">
                    <table id="playerViewTable">
                    <thead>
                        <tr id="playerViewTableHeader">
                            <th style="width: 70%;"></th>
                            <th style="width: 20%;"></th>
                            <th style="width: 10%;"></th>
                        </tr>
                    </thead>
                        <tbody id="playerViewTableBody">
                        </tbody>
                    </table>
                </div>
            `;
            this.UpdatePlayerView();
            this.patreonContainer = document.getElementById("patreonContainer") as HTMLDivElement;

            // Warnings Check
            if (!hardwareAccel)
                await Utilities.HardwareWarning(true);
            // Warnings Check
        }
        await this.InitializeScene();
        this.patreonContainer?.appendChild(Utilities.GetPatreonButton());
    }

    private UpdatePlayerView()
    {
        const tokensIOwn = BSCACHE.sceneItems.filter(x => isTokenWithVisionIOwn(x)) as Image[];
        const tokenTableEntries = document.getElementsByClassName("token-table-entry") as HTMLCollectionOf<HTMLTableRowElement>;

        this.CleanVisionList(tokensIOwn, tokenTableEntries);

        const playerTable = document.getElementById('playerViewTable') as HTMLTableElement;
        for (const token of tokensIOwn)
        {
            const existingRow = document.getElementById(`pl-${token.id}`) as HTMLTableRowElement;
            if (existingRow)
            {
                const name = existingRow.getElementsByClassName("token-name")[0] as HTMLTableRowElement;
                const visionRange = existingRow.getElementsByClassName("token-aradius")[0] as HTMLInputElement;
                const distanceType = existingRow.getElementsByClassName("token-distancetype")[0] as HTMLInputElement;
                if (name) name.textContent = token.text?.plainText || token.name;
                if (visionRange) visionRange.textContent = token.metadata[`${Constants.EXTENSIONID}/visionRange`] !== undefined
                    ? token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string
                    : GetVisionRangeDefault();
                if (distanceType) distanceType.textContent = BSCACHE.gridUnit;
            }
            else
            {
                const tokenRow = document.createElement('tr');
                tokenRow.id = `pl-${token.id}`;
                tokenRow.classList.add("token-table-entry");

                const nameCell = document.createElement('td');
                nameCell.textContent = token.text?.plainText || token.name;
                nameCell.classList.add("player-token-name");
                tokenRow.appendChild(nameCell);

                const distanceCell = document.createElement('td');
                distanceCell.textContent = token.metadata[`${Constants.EXTENSIONID}/visionRange`] !== undefined
                    ? token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string
                    : GetVisionRangeDefault();
                tokenRow.appendChild(distanceCell);

                const distanceTypeCell = document.createElement('td');
                distanceTypeCell.textContent = BSCACHE.gridUnit;
                tokenRow.appendChild(distanceTypeCell);

                playerTable.appendChild(tokenRow);
            }
        }
    }

    public GetEmptyContextItem(textContent: string)
    {
        const listItem = document.createElement("li");
        listItem.id = BSCACHE.playerId;
        listItem.textContent = textContent;
        return listItem;
    }

    private SetupGMPanelHandlers()
    {
        this.SetupViewPanel();
        this.smokeViewToggle!.onclick = (e) =>
        {
            e.preventDefault();
            TogglePanel(SMOKEMAIN.smokeViewToggle!, SMOKEMAIN.smokeViewPanel!);
        };

        this.spectreViewToggle!.onclick = (e) =>
        {
            e.preventDefault();
            TogglePanel(SMOKEMAIN.spectreViewToggle!, SMOKEMAIN.spectreViewPanel!);
        };

        this.settingsViewToggle!.onclick = (e) =>
        {
            e.preventDefault();
            TogglePanel(SMOKEMAIN.settingsViewToggle!, SMOKEMAIN.settingsViewPanel!);
        };

        this.helpViewToggle!.onclick = (e) =>
        {
            e.preventDefault();
            TogglePanel(SMOKEMAIN.helpViewToggle!, SMOKEMAIN.helpViewPanel!);
        };

        function TogglePanel(button: HTMLButtonElement, panel: HTMLDivElement)
        {
            SMOKEMAIN.smokeViewToggle?.classList.remove("selected");
            SMOKEMAIN.spectreViewToggle?.classList.remove("selected");
            SMOKEMAIN.settingsViewToggle?.classList.remove("selected");
            SMOKEMAIN.helpViewToggle?.classList.remove("selected");

            SMOKEMAIN.smokeViewPanel!.style.display = "none";
            SMOKEMAIN.spectreViewPanel!.style.display = "none";
            SMOKEMAIN.settingsViewPanel!.style.display = "none";
            SMOKEMAIN.helpViewPanel!.style.display = "none";

            button.classList.add("selected");
            panel.style.display = "block";
        }
    }

    public async OnDataChange()
    {
        await SMOKEMACHINE.Run();
        await SPECTREMACHINE.Run();

        if (BSCACHE.playerRole === "GM")
        {
            await this.UpdateVisionList();
            UpdateMaps();
        }
        else
        {
            this.UpdatePlayerView();
        }
    }

    public async InitializeScene()
    {
        await SMOKEMACHINE.Initialize();
        await SMOKEMACHINE.Run();
        await SPECTREMACHINE.Run();

        // Refreshing on created local items
        await SMOKEMACHINE.Run();
    }

    public async UpdateVisionList()
    {
        const tokenTable = document.getElementById('token_list') as HTMLTableSectionElement;
        if (!tokenTable) return;

        const tokensWithVision = BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item));
        const tokenTableEntries = document.getElementsByClassName("token-table-entry") as HTMLCollectionOf<HTMLTableRowElement>;

        this.CleanVisionList(tokensWithVision, tokenTableEntries);

        // Single filter loop for speed
        const [linkedTokens, unlinkedTokens] = tokensWithVision.reduce(
            ([linked, unlinked], token) =>
            {
                const isLinked = token.metadata[`${Constants.EXTENSIONID}/linkedTo`] !== undefined;
                if (isLinked)
                {
                    linked.push(token);
                } else
                {
                    unlinked.push(token);
                }
                return [linked, unlinked];
            },
            [[], []] as [typeof tokensWithVision, typeof tokensWithVision]
        );

        // Linked first so the parents show up
        for (const token of unlinkedTokens)
        {
            const tableRow = document.getElementById(`tr-${token.id}`) as HTMLTableRowElement;
            if (tableRow)
                this.UpdateTokenOnVisionList(token, tableRow);
            else
                this.AddTokenToVisionList(token);
        }

        // Unlinked after
        const orphanedIds: string[] = [];
        for (const token of linkedTokens)
        {
            const tableRow = document.getElementById(`tr-${token.id}`) as HTMLTableRowElement;
            if (tableRow)
                this.UpdateTokenOnVisionList(token, tableRow, true);
            else
                this.AddTokenToVisionList(token, true);

            const parentToken = BSCACHE.sceneItems.find(x => x.id === token.metadata[`${Constants.EXTENSIONID}/linkedTo`]);
            if (!parentToken) orphanedIds.push(token.id);
        }

        // Cleanup expired links
        if (orphanedIds.length > 0)
            await OBR.scene.items.updateItems<Item>(orphanedIds, tokens =>
            {
                for (let token of tokens)
                {
                    delete token.metadata[`${Constants.EXTENSIONID}/linkedTo`];
                }
            });
    }

    private SetupDragAndDrop(tableElement: HTMLTableElement)
    {
        if (!tableElement) return;
        tableElement.ondragstart = (e) =>
        {
            const target = e.target as HTMLElement;
            const isTokenNameCell = target.closest('td')?.classList.contains('token-name');

            if (isTokenNameCell)
            {
                const row = target.closest('tr') as HTMLTableRowElement;

                if (row && row.tagName === 'TR')
                {
                    this.draggedRow = row;

                    // If it's a parent, dont let it get nested
                    const nextRow = row.nextElementSibling as HTMLTableRowElement;
                    if (nextRow && nextRow.dataset.linkedto && !this.draggedRow.dataset.linkedto)
                    {
                        e.preventDefault();
                        return;
                    }

                    row.classList.add('dragging');
                    e.dataTransfer?.setData('text/plain', row.outerHTML);
                }
            } else
            {
                // Prevent dragging if not on the 'name' cell
                e.preventDefault();
            }
        };


        tableElement.ondragend = () =>
        {
            if (this.draggedRow)
            {
                this.draggedRow.classList.remove('dragging');
                this.draggedRow = null;
            }
        };

        tableElement.ondragover = (e) =>
        {
            e.preventDefault(); // Allow drop
            const target = e.target as HTMLElement;

            if (target.tagName === 'TD' || target.tagName === 'TR')
            {
                const row = target.closest('tr') as HTMLTableRowElement;
                if (row && this.draggedRow !== row)
                {
                    row.classList.add('drop-target');
                }
            }
        };

        tableElement.ondragleave = (e) =>
        {
            const target = e.target as HTMLElement;
            const row = target.closest('tr') as HTMLTableRowElement;

            if (row)
            {
                row.classList.remove('drop-target');
            }
        };

        tableElement.ondrop = async (e) =>
        {
            e.preventDefault();
            if (!tableElement) return;

            const target = e.target as HTMLElement;
            const targetRow = target.closest('tr') as HTMLTableRowElement;
            if (targetRow && this.draggedRow !== targetRow)
            {
                const targetId = targetRow.id.slice(3);
                let targetToken = BSCACHE.sceneItems.find(x => x.id === targetId);

                if (targetToken && targetToken.metadata[`${Constants.EXTENSIONID}/linkedTo`])
                {
                    // If the target is already linked, we want to link to the same parent
                    const existingLink = targetToken.metadata[`${Constants.EXTENSIONID}/linkedTo`] as string;
                    targetToken = BSCACHE.sceneItems.find(x => x.id === existingLink);
                }

                if (this.draggedRow && targetToken && targetRow && this.draggedRow !== targetRow)
                {
                    targetRow.classList.remove('drop-target');

                    const tbody = tableElement.querySelector('tbody')!;
                    const tokenId = this.draggedRow.id.slice(3);

                    // Always insert after for psuedo-nesting
                    tbody.insertBefore(this.draggedRow, targetRow.nextSibling);
                    this.toggleRowVisibility(this.draggedRow, true);
                    this.draggedRow.dataset.linkedto = targetToken.id;
                    await OBR.scene.items.updateItems([tokenId], (tokens) =>
                    {
                        for (let token of tokens)
                        {
                            // This is now a child of the target row
                            token.metadata[`${Constants.EXTENSIONID}/linkedTo`] = targetToken.id;
                            token.metadata[`${Constants.EXTENSIONID}/hiddenToken`] = targetToken.metadata[`${Constants.EXTENSIONID}/hiddenToken`];
                        }
                    });
                }
            }
            else if (this.draggedRow)
            {
                const tokenId = this.draggedRow.id.slice(3);
                this.toggleRowVisibility(this.draggedRow, false);
                delete this.draggedRow.dataset.linkedto;

                //Unlink Code
                await OBR.scene.items.updateItems([tokenId], (tokens) =>
                {
                    for (let token of tokens)
                    {
                        delete token.metadata[`${Constants.EXTENSIONID}/linkedTo`];
                    }
                });
            }
        };
    }

    private SetupMassEditors()
    {
        const visionRangeSubmit = async (value: number, torch: boolean) =>
        {
            let cleanValue = value;
            if (value < 0)
                cleanValue = 0;
            if (value > 999)
                cleanValue = 999;
            const tokensWithVision = torch ? BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item)) : BSCACHE.sceneItems.filter(item => !isTorch(item) && isTokenWithVisionForUI(item));
            await OBR.scene.items.updateItems(tokensWithVision.map(x => x.id), items =>
            {
                for (let item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/visionRange`] = cleanValue.toString();
                }
            });
        };

        const visionFalloff = async (value: number, torch: boolean) =>
        {
            let cleanValue = value;
            if (value < 0)
                cleanValue = 0;
            if (value > 10)
                cleanValue = 10;
            const tokensWithVision = torch ? BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item)) : BSCACHE.sceneItems.filter(item => !isTorch(item) && isTokenWithVisionForUI(item));
            await OBR.scene.items.updateItems(tokensWithVision.map(x => x.id), items =>
            {
                for (let item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/visionFallOff`] = cleanValue.toString();
                }
            });
        };

        const visionBumper = async (value: number, torch: boolean) =>
        {
            let cleanValue = value;
            if (value < 0)
                cleanValue = 0;
            if (value > 999)
                cleanValue = 999;
            const tokensWithVision = torch ? BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item)) : BSCACHE.sceneItems.filter(item => !isTorch(item) && isTokenWithVisionForUI(item));
            await OBR.scene.items.updateItems(tokensWithVision.map(x => x.id), items =>
            {
                for (let item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = cleanValue.toString();
                }
            });
        }

        const visionInner = async (value: number, torch: boolean) =>
        {
            let cleanValue = value;
            if (value < 0)
                cleanValue = 0;
            if (value > 360)
                cleanValue = 360;
            const tokensWithVision = torch ? BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item)) : BSCACHE.sceneItems.filter(item => !isTorch(item) && isTokenWithVisionForUI(item));
            await OBR.scene.items.updateItems(tokensWithVision.map(x => x.id), items =>
            {
                for (let item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/visionInAngle`] = cleanValue.toString();
                }
            });
        };

        const visionOuter = async (value: number, torch: boolean) =>
        {
            let cleanValue = value;
            if (value < 0)
                cleanValue = 0;
            if (value > 360)
                cleanValue = 360;
            const tokensWithVision = torch ? BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item)) : BSCACHE.sceneItems.filter(item => !isTorch(item) && isTokenWithVisionForUI(item));
            await OBR.scene.items.updateItems(tokensWithVision.map(x => x.id), items =>
            {
                for (let item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = cleanValue.toString();
                }
            });
        };

        const visionDark = async (value: number, torch: boolean) =>
        {
            let cleanValue = value;
            if (value < 0)
                cleanValue = 0;
            if (value > 999)
                cleanValue = 999;
            const tokensWithVision = torch ? BSCACHE.sceneItems.filter(item => isTokenWithVisionForUI(item)) : BSCACHE.sceneItems.filter(item => !isTorch(item) && isTokenWithVisionForUI(item));
            await OBR.scene.items.updateItems(tokensWithVision.map(x => x.id), items =>
            {
                for (let item of items)
                {
                    item.metadata[`${Constants.EXTENSIONID}/visionDark`] = cleanValue.toString();
                }
            });
        };

        new ClickableInput('#visionRangeSvg', visionRangeSubmit, "Vision Range");
        new ClickableInput('#visionFalloffSvg', visionFalloff, "Falloff Range");
        new ClickableInput('#visionBumperSvg', visionBumper, "Collision Range");
        new ClickableInput('#visionInnerSvg', visionInner, "Inner Angle");
        new ClickableInput('#visionOuterSvg', visionOuter, "Outer Angle");
        new ClickableInput('#visionDarkSvg', visionDark, "Greyscale");
    }

    private SetupViewPanel()
    {
        const viewPanelToggleContainer = document.getElementById('visionPanelToggleContainer') as HTMLDivElement;
        this.visionPanelMain = document.getElementById('visionPanelMain') as HTMLTableRowElement;
        this.visionPanelSub = document.getElementById('visionPanelSub') as HTMLTableRowElement;
        this.smokeUnitTablePrime = document.getElementById('smokeUnitTablePrime') as HTMLTableElement;
        this.smokeUnitTableSub = document.getElementById('smokeUnitTableSub') as HTMLTableElement;

        this.SetupMassEditors();
        this.SetupDragAndDrop(this.smokeUnitTablePrime);
        this.SetupDragAndDrop(this.smokeUnitTableSub);

        const viewPanelToggle = document.createElement('input');
        viewPanelToggle.type = 'button';
        viewPanelToggle.value = "Show Advanced";
        viewPanelToggle.classList.add('view-panel-toggle');
        viewPanelToggle.onclick = () =>
        {
            this.visionPanelMain!.style.display = this.onVisionPanelMain ? "none" : "table-row";
            this.visionPanelSub!.style.display = this.onVisionPanelMain ? "table-row" : "none";

            const mainControls = document.getElementsByClassName('vision-panel-main-input') as HTMLCollectionOf<HTMLInputElement>;
            const subControls = document.getElementsByClassName('vision-panel-sub-input') as HTMLCollectionOf<HTMLInputElement>;

            for (let i = 0; i < mainControls.length; i++)
            {
                if (this.onVisionPanelMain)
                {
                    this.fadeOut(mainControls[i], () => this.fadeIn(subControls[i], "inline-block"));
                }
                else
                {
                    this.fadeOut(subControls[i], () => this.fadeIn(mainControls[i], "inline-block"));
                }
            }
            viewPanelToggle.value = this.onVisionPanelMain ? "Show Basic" : "Show Advanced";
            this.onVisionPanelMain = !this.onVisionPanelMain;
        };
        viewPanelToggleContainer.appendChild(viewPanelToggle);
    }

    private AddTokenToVisionList(token: Item, linked = false)
    {
        // Set Ownership Stylings
        let owner = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${token.createdUserId}`] as Player;
        let ownerColor = owner?.color;
        let ownerText = owner?.name ? `This token is owned by ${owner.name}.` : "This token is owned by you.";

        if (!ownerColor && (token.createdUserId !== BSCACHE.playerId))
        {
            ownerColor = "#aeb0af";
            ownerText = "This tokens owner is not in the room currently.";
        }

        // References to the unique tbody of the respective tables
        const tokenTable = document.getElementById('token_list') as HTMLTableSectionElement;
        const hiddenTable = document.getElementById('hidden_list') as HTMLTableSectionElement;

        const isTorch = token.metadata[`${Constants.EXTENSIONID}/isTorch`] === true;
        const newTableRow = document.createElement('tr');
        newTableRow.id = `tr-${token.id}`;
        newTableRow.className = "token-table-entry";
        newTableRow.classList.add('slide-row');
        newTableRow.draggable = true;

        // Name Block
        const nameCell = document.createElement('td');
        nameCell.id = `name-${token.id}`;
        if (isTorch)
        {
            nameCell.innerText = `🔦${token.name} `;
            nameCell.title = 'This is a torch, which can be seen by other tokens with vision when in range.';
        }
        else
        {
            nameCell.innerText = token.name;
            nameCell.title = ownerText;
            nameCell.setAttribute("data-color", ownerColor);
            nameCell.style.textShadow = `
                -2px -2px 2px ${ownerColor},
                2px -2px 2px ${ownerColor},
                -2px 2px 2px ${ownerColor},
                2px 2px 2px ${ownerColor}`;
        }
        nameCell.classList.add("token-name");
        if (ownerColor === "#aeb0af")
        {
            nameCell.style.color = "black !important";
            nameCell.style.fontStyle = "italic";
        }
        nameCell.draggable = true;

        nameCell.onclick = async () =>
        {
            ViewportFunctions.CenterViewportOnImage(token.id);
            await OBR.player.select([token.id]);
        };

        // CELL ONE - Vision Range / Vision Bumper
        // Attenuation Radius
        const cellOne = document.createElement('td');
        const aRadiusInput = document.createElement('input');
        aRadiusInput.type = 'number';
        aRadiusInput.value = token.metadata[`${Constants.EXTENSIONID}/visionRange`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string
            : GetVisionRangeDefault();
        aRadiusInput.classList.add("token-aradius");
        aRadiusInput.classList.add("vision-panel-main-input");
        aRadiusInput.style.display = this.onVisionPanelMain ? "inline-block" : "none";
        aRadiusInput.draggable = false;

        aRadiusInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;

            const target = event.target as HTMLInputElement;
            const value = parseInt(target.value);
            if (value < 0)
                target.value = "0";
            if (value > 999)
                target.value = "999";
            if (isNaN(value))
                target.value = GetVisionRangeDefault();
            await OBR.scene.items.updateItems([thisPlayer.id], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionRange`] = target.value;
            });
        };

        // Source Radius
        const sRadiusInput = document.createElement('input');
        sRadiusInput.type = 'number';
        sRadiusInput.style.display = "none";
        sRadiusInput.value = token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string
            : GetSourceRangeDefault();
        sRadiusInput.classList.add("token-sradius");
        sRadiusInput.classList.add("vision-panel-sub-input");
        sRadiusInput.style.display = !this.onVisionPanelMain ? "inline-block" : "none";
        sRadiusInput.draggable = false;

        sRadiusInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;

            const target = event.target as HTMLInputElement;
            const value = parseFloat(target.value);
            if (value < 0)
                target.value = "0";
            if (value > 999)
                target.value = "999";
            if (isNaN(value))
                target.value = GetSourceRangeDefault();

            await OBR.scene.items.updateItems([thisPlayer.id], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionSourceRange`] = target.value;
            });
        };

        cellOne.appendChild(aRadiusInput);
        cellOne.appendChild(sRadiusInput);

        // CELL TWO - Vision Falloff / Vision Inner Angle
        // Falloff Radius
        const cellTwo = document.createElement('td');
        const falloffInput = document.createElement('input');
        falloffInput.type = 'number';
        falloffInput.value = token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string
            : GetFalloffRangeDefault();
        falloffInput.classList.add("token-falloff");
        falloffInput.classList.add("vision-panel-main-input");
        falloffInput.style.display = this.onVisionPanelMain ? "inline-block" : "none";
        falloffInput.draggable = false;

        falloffInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;

            const target = event.target as HTMLInputElement;
            const value = parseFloat(target.value);
            if (value < 0)
                target.value = "0";
            if (value > 10)
                target.value = "10";
            if (isNaN(value))
                target.value = GetFalloffRangeDefault();

            await OBR.scene.items.updateItems([thisPlayer.id], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionFallOff`] = target.value;
            });
        };

        // Inner Angle Cone
        const innerAngInput = document.createElement('input');
        innerAngInput.type = 'number';
        innerAngInput.style.display = "none";
        innerAngInput.value = token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string
            : GetInnerAngleDefault();
        innerAngInput.classList.add("token-innerang");
        innerAngInput.classList.add("vision-panel-sub-input");
        innerAngInput.style.display = !this.onVisionPanelMain ? "inline-block" : "none";
        innerAngInput.draggable = false;

        innerAngInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;

            const target = event.target as HTMLInputElement;
            const value = parseInt(target.value);
            if (value < 0)
                target.value = "0";
            if (value > 360)
                target.value = "360";
            if (isNaN(value))
                target.value = GetInnerAngleDefault();
            await OBR.scene.items.updateItems([thisPlayer.id], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionInAngle`] = target.value;
            });
        };

        cellTwo.appendChild(falloffInput);
        cellTwo.appendChild(innerAngInput);

        // CELL THREE - Vision Blind / Vision Outer Angle
        const cellThree = document.createElement('td');
        const blindUnitInput = document.createElement('input');
        blindUnitInput.type = 'checkbox';
        blindUnitInput.checked = token.metadata[`${Constants.EXTENSIONID}/visionBlind`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean
            : false;
        blindUnitInput.classList.add("token-blind");
        blindUnitInput.classList.add("vision-panel-main-input");
        blindUnitInput.style.display = this.onVisionPanelMain ? "inline-block" : "none";
        blindUnitInput.draggable = false;

        blindUnitInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            const target = event.target as HTMLInputElement;
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;
            await OBR.scene.items.updateItems([thisPlayer.id], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionBlind`] = target.checked;
            });
        };

        // Outer Angle Cone
        const outerAngInput = document.createElement('input');
        outerAngInput.type = 'number';
        outerAngInput.style.display = "none";
        outerAngInput.value = token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string
            : GetOuterAngleDefault();
        outerAngInput.classList.add("token-outerang");
        outerAngInput.classList.add("vision-panel-sub-input");
        outerAngInput.style.display = !this.onVisionPanelMain ? "inline-block" : "none";
        outerAngInput.draggable = false;

        outerAngInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;

            const target = event.target as HTMLInputElement;
            const value = parseInt(target.value);
            if (value < 0)
                target.value = "0";
            if (value > 360)
                target.value = "360";
            if (isNaN(value))
                target.value = GetOuterAngleDefault();
            await OBR.scene.items.updateItems([thisPlayer.id], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionOutAngle`] = target.value;
            });
        };

        cellThree.appendChild(blindUnitInput);
        cellThree.appendChild(outerAngInput);

        // CELL FOUR - Vision Hidden List / DarkVision
        const cellFour = document.createElement('td');
        const hideUnitInput = document.createElement('input');
        hideUnitInput.type = 'image';
        hideUnitInput.src = '/swap.svg';
        hideUnitInput.checked = token.metadata[`${Constants.EXTENSIONID}/hiddenToken`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/hiddenToken`] as boolean
            : false;
        hideUnitInput.classList.add("token-hide");
        hideUnitInput.classList.add("vision-panel-main-input");
        hideUnitInput.style.display = this.onVisionPanelMain ? "inline-block" : "none";
        hideUnitInput.draggable = false;

        hideUnitInput.onclick = async (event: Event) =>
        {
            if (!event || !event.target) return;
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;

            const target = event.target as HTMLInputElement;
            target.checked = !target.checked;
            const thisRow = document.getElementById(`tr-${token.id}`) as HTMLTableRowElement;

            if (target.checked)
            {
                thisRow.classList.add('slide-out');
                setTimeout(() =>
                {
                    // If this is a linked child, it came with a parent, set it after
                    //thisRow.dataset.linkedto ? SMOKEMAIN.hiddenList!.appendChild(thisRow) : SMOKEMAIN.hiddenList!.prepend(thisRow);
                    if (thisRow.dataset.linkedto)
                    {
                        const parentLink = SMOKEMAIN.hiddenList!.querySelector<HTMLTableRowElement>(`#tr-${thisRow.dataset.linkedto}`);
                        if (parentLink)
                        {
                            parentLink.parentNode!.insertBefore(thisRow, parentLink.nextSibling);
                        }
                    }
                    else
                        SMOKEMAIN.hiddenList!.prepend(thisRow);

                    thisRow.classList.remove('slide-out');
                    thisRow.classList.add('slide-in');

                    // Hide child rows
                    const tableRows = SMOKEMAIN.tokenList!.querySelectorAll<HTMLTableRowElement>('tr');
                    if (tableRows.length > 0 && !thisRow.dataset.linkedto)
                    {
                        const linkedRows = Array.from(tableRows).filter(row => row.dataset.linkedto === token.id);
                        for (const row of linkedRows)
                        {
                            const hideRowButton = row.querySelector<HTMLInputElement>(".token-hide");
                            if (hideRowButton) hideRowButton.click();
                        }
                    }

                    setTimeout(async () =>
                    {
                        thisRow.classList.remove('slide-in');
                        await OBR.scene.items.updateItems([thisPlayer.id], items =>
                        {
                            items[0].metadata[`${Constants.EXTENSIONID}/hiddenToken`] = target.checked;
                        });
                    }, 10);
                }, 250);

            } else
            {
                thisRow.classList.add('slide-out');
                setTimeout(() =>
                {
                    SMOKEMAIN.tokenList!.appendChild(thisRow);

                    thisRow.classList.remove('slide-out');
                    thisRow.classList.add('slide-in');

                    // Show child rows
                    const tableRows = SMOKEMAIN.hiddenList!.querySelectorAll<HTMLTableRowElement>('tr');
                    if (tableRows.length > 0 && !thisRow.dataset.linkedto)
                    {
                        const linkedRows = Array.from(tableRows).filter(row => row.dataset.linkedto === token.id);
                        for (const row of linkedRows)
                        {
                            const hideRowButton = row.querySelector<HTMLInputElement>(".token-hide");
                            if (hideRowButton) hideRowButton.click();
                        }
                    }
                    setTimeout(async () =>
                    {
                        thisRow.classList.remove('slide-in');
                        await OBR.scene.items.updateItems([thisPlayer.id], items =>
                        {
                            items[0].metadata[`${Constants.EXTENSIONID}/hiddenToken`] = target.checked;
                        });
                    }, 10);
                }, 250);
            }
        };

        const darkVisionInput = document.createElement('input');
        darkVisionInput.type = 'number';
        darkVisionInput.value = token.metadata[`${Constants.EXTENSIONID}/visionDark`] !== undefined
            ? token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string
            : GetDarkvisionDefault();
        darkVisionInput.classList.add("token-darkvision");
        darkVisionInput.classList.add("vision-panel-sub-input");
        darkVisionInput.style.display = !this.onVisionPanelMain ? "inline-block" : "none";
        darkVisionInput.draggable = false;

        darkVisionInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = BSCACHE.sceneItems.find(x => x.id === token.id)!;

            const target = event.target as HTMLInputElement;
            const value = parseInt(target.value);
            if (value < 0)
                target.value = "0";
            if (value > 999)
                target.value = "999";
            if (isNaN(value))
                target.value = GetVisionRangeDefault();
            await OBR.scene.items.updateItems([thisPlayer.id], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionDark`] = target.value;
            });
        };

        cellFour.appendChild(hideUnitInput);
        cellFour.appendChild(darkVisionInput);

        // Append all cells to the row
        newTableRow.appendChild(nameCell);
        newTableRow.appendChild(cellOne);
        newTableRow.appendChild(cellTwo);
        newTableRow.appendChild(cellThree);
        newTableRow.appendChild(cellFour);

        if (linked)
        {
            const parentId = token.metadata[`${Constants.EXTENSIONID}/linkedTo`] as string;
            const parentTable = tokenTable.querySelector(`#tr-${parentId}`) ? tokenTable : hiddenTable;
            const targetRow = parentTable.querySelector(`#tr-${parentId}`);
            newTableRow.dataset.linkedto = parentId;
            newTableRow.classList.add('linked-row');
            if (targetRow)
            {
                // Always insert after for psuedo-nesting
                parentTable.insertBefore(newTableRow, targetRow.nextSibling);
                this.toggleRowVisibility(newTableRow, true);
            }
        }
        else
        {
            // Add to either table
            if (token.metadata[`${Constants.EXTENSIONID}/hiddenToken`] === true)
            {
                hiddenTable!.prepend(newTableRow);
            }
            else
            {
                tokenTable!.appendChild(newTableRow);
            }
        }

        const inputs = newTableRow.querySelectorAll('input');
        inputs.forEach(input =>
        {
            input.addEventListener('dragstart', event =>
            {
                event.stopPropagation(); // Prevent drag from activating
            });
        });

        function HideMenu()
        {
            document.getElementById("contextMenu")!
                .style.display = "none"
        }

        // Add a contextmenu to allow swapping the owner of the token without needing the permissions setting
        newTableRow.oncontextmenu = async function (e)
        {
            e.preventDefault();
            const oldRow = e.currentTarget as HTMLTableRowElement;

            const contextMenu = document.getElementById("contextMenu")!;

            const onClickContext = (e: Event) =>
            {
                e.preventDefault();
            };

            // Add event listener for CTXMenu selection
            const onClickListItem = async (e: MouseEvent) =>
            {
                const fullGroup = [...BSCACHE.party, { id: BSCACHE.playerId, color: BSCACHE.playerColor, name: BSCACHE.playerName }];
                const target = e.target as HTMLUListElement;

                const unitId = contextMenu.getAttribute("currentUnit")!;
                const tr = document.getElementById(`tr-${unitId}`) as HTMLTableRowElement;
                const cell = tr.getElementsByClassName("token-name")[0] as HTMLTableCellElement;

                const newOwner = fullGroup.find(newplayer => target.id === newplayer.id);
                if (newOwner)
                {
                    const updatedText = newOwner.name !== BSCACHE.playerName ? `This token is owned by ${newOwner.name}.` : "This token is owned by you.";
                    cell.title = updatedText;
                    cell.setAttribute("data-color", ownerColor);
                    cell.style.textShadow = `
                    -2px -2px 2px ${newOwner.color},
                    2px -2px 2px ${newOwner.color},
                    -2px 2px 2px ${newOwner.color},
                    2px 2px 2px ${newOwner.color}`;
                }
                else
                {
                    cell.title = "Unable to update owner name";
                    cell.style.textShadow = "";
                }

                await OBR.scene.items.updateItems([unitId], items =>
                {
                    for (const item of items)
                    {
                        item.createdUserId = target.id;
                    }
                });

                contextMenu.style.display = "none";
                e.stopPropagation();

                window.removeEventListener("click", onClickOutside);
                contextMenu.removeEventListener("click", onClickListItem);
                contextMenu.removeEventListener("contextmenu", onClickContext);
            };

            // Store unit ID
            contextMenu.setAttribute("currentUnit", oldRow.id.substring(3));

            // Add listener to click away
            const onClickOutside = () =>
            {
                contextMenu.style.display = "none";
                window.removeEventListener("click", onClickOutside);
                contextMenu.removeEventListener("click", onClickListItem);
                contextMenu.removeEventListener("contextmenu", onClickContext);
            };

            contextMenu.addEventListener("click", onClickListItem);
            contextMenu.addEventListener("contextmenu", onClickContext);
            window.addEventListener("click", onClickOutside);

            if (contextMenu.style.display == "block")
            {
                HideMenu();
            }
            else
            {
                // Added height adjustments for lengty token lists
                const contextItems = document.getElementById("playerListing")!.children.length;
                const height = (contextItems + 1) * 34;

                // Don't let the menu go off window, it'll cut
                const adjustedLeft = Math.min(e.pageX, window.innerWidth - 150);
                let adjustedTop = Math.min(e.pageY, (window.innerHeight > 300 ? window.innerHeight - 50 : window.innerHeight) - 120);

                // If the action window is less than the height of the context menu and where it's going to be, it'll run off the end
                // Adjust to have it end at the bottom
                if (window.innerHeight < height + adjustedTop)
                {
                    adjustedTop = window.innerHeight - height;
                }

                contextMenu.style.display = 'block';
                contextMenu.style.left = adjustedLeft + "px";
                contextMenu.style.top = adjustedTop + "px";
            }
        }
    }

    private UpdateTokenOnVisionList(token: Item, tableRow: HTMLTableRowElement, linked = false)
    {
        this.toggleRowVisibility(tableRow, linked);
        if (linked)
        {
            if (!tableRow.dataset.linkedto) tableRow.dataset.linkedto = token.metadata[`${Constants.EXTENSIONID}/linkedTo`] as string;
            if (!tableRow.classList.contains('linked-row')) tableRow.classList.add('linked-row');
        }
        else
        {
            if (tableRow.dataset.linkedto) delete tableRow.dataset.linkedto;
            if (tableRow.classList.contains('linked-row')) tableRow.classList.remove('linked-row');
        }

        // Update Ownership Stylings
        const owner = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/USER-${token.createdUserId}`] as Player;
        let ownerColor = owner?.color;
        let ownerText = owner?.name ? `This token is owned by ${owner.name}.` : "This token is owned by you.";

        const isTorch = token.metadata[`${Constants.EXTENSIONID}/isTorch`] === true;

        if (!ownerColor && (token.createdUserId !== BSCACHE.playerId))
        {
            ownerColor = "#aeb0af";
            ownerText = "This tokens owner is not in the room currently.";
        }

        // Update with current information
        const name = tableRow.getElementsByClassName("token-name")[0] as HTMLTableRowElement;
        const aradiusInput = tableRow.getElementsByClassName("token-aradius")[0] as HTMLInputElement;
        const sradiusInput = tableRow.getElementsByClassName("token-sradius")[0] as HTMLInputElement;
        const falloffsInput = tableRow.getElementsByClassName("token-falloff")[0] as HTMLInputElement;
        const innerAngInput = tableRow.getElementsByClassName("token-innerang")[0] as HTMLInputElement;
        const outerAngInput = tableRow.getElementsByClassName("token-outerang")[0] as HTMLInputElement;
        const blindInput = tableRow.getElementsByClassName("token-blind")[0] as HTMLInputElement;
        const darkvisionInput = tableRow.getElementsByClassName("token-darkvision")[0] as HTMLInputElement;

        if (name) 
        {
            if (isTorch)
            {
                name.innerText = `🔦${token.name} `;
                name.title = 'This is a torch, which can be seen by other tokens with vision when in range.';
            }
            else
            {
                name.innerText = token.name;
                name.title = ownerText;
                name.setAttribute("data-color", ownerColor);
                name.style.textShadow = `
                    -2px -2px 2px ${ownerColor},
                    2px -2px 2px ${ownerColor},
                    -2px 2px 2px ${ownerColor},
                    2px 2px 2px ${ownerColor}`;
            }
        }
        if (aradiusInput)
        {
            aradiusInput.value = token.metadata[`${Constants.EXTENSIONID}/visionRange`] !== undefined
                ? token.metadata[`${Constants.EXTENSIONID}/visionRange`] as string
                : GetVisionRangeDefault();
        }
        if (sradiusInput)
        {
            sradiusInput.value = token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] !== undefined
                ? token.metadata[`${Constants.EXTENSIONID}/visionSourceRange`] as string
                : GetSourceRangeDefault();
        }
        if (falloffsInput)
        {
            falloffsInput.value = token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] !== undefined
                ? token.metadata[`${Constants.EXTENSIONID}/visionFallOff`] as string
                : GetFalloffRangeDefault();
        }
        if (innerAngInput)
        {
            innerAngInput.value = token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] !== undefined
                ? token.metadata[`${Constants.EXTENSIONID}/visionInAngle`] as string
                : GetInnerAngleDefault();
        }
        if (outerAngInput)
        {
            outerAngInput.value = token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] !== undefined
                ? token.metadata[`${Constants.EXTENSIONID}/visionOutAngle`] as string
                : GetOuterAngleDefault();
        }
        if (blindInput)
        {
            blindInput.checked = token.metadata[`${Constants.EXTENSIONID}/visionBlind`] !== undefined
                ? token.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean
                : false;
        }
        if (darkvisionInput)
        {
            darkvisionInput.value = token.metadata[`${Constants.EXTENSIONID}/visionDark`] !== undefined
                ? token.metadata[`${Constants.EXTENSIONID}/visionDark`] as string
                : GetDarkvisionDefault();
        }
    }

    private CleanVisionList(tokensWithVision: Item[], tokenTableEntries: HTMLCollectionOf<HTMLTableRowElement>)
    {
        for (const tokenEntry of tokenTableEntries)
        {
            const tokenId = tokenEntry.id.slice(3);
            if (!tokensWithVision.some(token => token.id === tokenId))
            {
                tokenEntry.remove();
            }
        }
    }

    private SetupHelpDocuments()
    {
        const converter = new showdown.Converter();
        const helpHtml = converter.makeHtml(Constants.MARKDOWNHELP);
        const helpContainer = document.getElementById("markdownHelpContainer") as HTMLDivElement;
        helpContainer.innerHTML = helpHtml;
    }

    private fadeOut = (element: HTMLElement, callback: () => void) =>
    {
        element.style.opacity = '0';
        setTimeout(() =>
        {
            element.style.display = 'none';
            callback();
        }, 300);
    };

    private fadeIn = (element: HTMLElement, display: string) =>
    {
        element.style.opacity = '0';
        element.style.display = display;
        setTimeout(() =>
        {
            element.style.opacity = '1';
        }, 10);
    };

    private toggleRowVisibility = (row: HTMLTableRowElement, nested: boolean) =>
    {
        nested ? row.classList.add("linked-row") : row.classList.remove("linked-row");
        const cells = row.querySelectorAll('td');
        cells.forEach((cell) =>
        {
            cell.classList.contains('token-name') ?
                (cell.style.textIndent = nested ? "20px" : "0px") :
                (cell.style.visibility = nested ? 'hidden' : "visible");
        });
    }
}

export const SMOKEMAIN = new SmokeMain("3.60");
OBR.onReady(async () =>
{
    // Startup Handler code for delayed Scene Readiness
    const sceneReady = await OBR.scene.isReady();

    const whatsnewpage = document.getElementById('papp');
    const contextmaps = document.getElementById('contextmenu');
    if (whatsnewpage || contextmaps) return;

    if (sceneReady === false)
    {
        const startup = OBR.scene.onReadyChange(async (ready) =>
        {
            if (ready)
            {
                startup(); // Kill startup Handler
                await StartSmokeAndSpectre();
            }
        });
    }
    else
    {
        await StartSmokeAndSpectre();
    }
});


async function StartSmokeAndSpectre(): Promise<void>
{
    await BSCACHE.InitializeCache();
    BSCACHE.SetupHandlers(); // Possible move to after initialization
    await SMOKEMAIN.Start();
}