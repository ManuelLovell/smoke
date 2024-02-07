import OBR, { Image, Item, buildShape } from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/constants";
import { sceneCache } from "./utilities/globals";
import { SMOKEMAIN } from "./smokeMain";
import { isBackgroundBorder } from "./utilities/itemFilters";

export async function AddBorderIfNoAutoDetect()
{
    const foundBorder = sceneCache.items.filter(isBackgroundBorder);
    if (!sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`])
    {
        if (foundBorder.length == 0)
        {
            let drawing = buildShape().width(sceneCache.gridDpi * 30).height(sceneCache.gridDpi * 30).visible(false).shapeType("RECTANGLE").visible(true).locked(false).strokeColor("pink").strokeOpacity(.5).fillOpacity(0).strokeDash([200, 500]).strokeWidth(50).build() as any;
            drawing.metadata[`${Constants.EXTENSIONID}/isBackgroundImage`] = true;
            drawing.metadata[`${Constants.EXTENSIONID}/grid`] = true;
            drawing.id = Constants.GRIDID;
            await OBR.scene.items.addItems([drawing]);
        }
    }

    if (sceneCache.metadata[`${Constants.EXTENSIONID}/autodetectEnabled`] === true
        && foundBorder.length > 0)
    {
        await OBR.scene.items.deleteItems([Constants.GRIDID]);
    }
}

/** Its actually Unit ID, not player.. */
export function AddUnitVisionUI(player: Item)
{
    function HideMenu()
    {
        document.getElementById("contextMenu")!
            .style.display = "none"
    }

    const tr = document.getElementById(`tr-${player.id}`);
    if (tr)
    {
        // Update with current information
        const name = tr.getElementsByClassName("token-name")[0] as HTMLTableRowElement;
        const rangeInput = tr.getElementsByClassName("token-vision-range")[0] as HTMLInputElement;
        const unlimitedCheckbox = tr.getElementsByClassName("unlimited-vision")[0] as HTMLInputElement;
        const blindCheckbox = tr.getElementsByClassName("no-vision")[0] as HTMLInputElement;

        if (name) name.innerText = player.name;
        if (rangeInput)
        {
            if (!unlimitedCheckbox.checked && !blindCheckbox.checked)
                rangeInput.value = player.metadata[`${Constants.EXTENSIONID}/visionRange`] !== undefined
                    ? player.metadata[`${Constants.EXTENSIONID}/visionRange`] as string
                    : Constants.VISIONDEFAULT;
        }
        if (unlimitedCheckbox)
        {
            unlimitedCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionRange`] === 0;
        }
        if (blindCheckbox)
        {
            blindCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean;
        }
        if (unlimitedCheckbox.checked || blindCheckbox.checked)
            rangeInput.setAttribute("disabled", "disabled");
        else
            rangeInput.removeAttribute("disabled");
    }
    else
    {
        const ownerColor = sceneCache.players.find(owner => player.createdUserId === owner.id)?.color;
        const currentPlayer = sceneCache.items.find(x => x.id === player.id)!;
        // Create new item for this token
        const newTr = document.createElement("tr");
        newTr.id = `tr-${currentPlayer.id}`;
        newTr.className = "token-table-entry";
        newTr.innerHTML = `<td id="contextLocator" data-color="${ownerColor}" class="token-name">${currentPlayer.name}</td>
                           <td class="token-vision-container" title="The unit of measurement for your grid"><input class="token-vision-range" type="number" value=${Constants.VISIONDEFAULT}><span class="unit">units</span></td>
                           <td class="token-vision-container-grid">
                            <div class="vision-container-div">
                                <label class="cbutton" title="Unlimited vision range"><input type="checkbox" class="unlimited-vision"><span class="emoji">&infin;</span></label>
                                <label class="cbutton" title="Turn token into a light source"><input type="checkbox" class="torch-vision"><span class="emoji">&#128294;</span></label>
                                <label class="cbutton" title="Disable vision on this token"><input type="checkbox" class="no-vision"><span class="emoji">&#8856;</span></label>
                            </div>
                           </td>`;
        SMOKEMAIN.table!.appendChild(newTr);

        // Register event listeners
        const rangeInput = newTr.getElementsByClassName("token-vision-range")[0] as HTMLInputElement;
        const unlimitedCheckbox = newTr.getElementsByClassName("unlimited-vision")[0] as HTMLInputElement;
        const torchCheckbox = newTr.getElementsByClassName("torch-vision")[0] as HTMLInputElement;
        const blindCheckbox = newTr.getElementsByClassName("no-vision")[0] as HTMLInputElement;
        const nameLabel = (newTr.getElementsByClassName("token-name")[0] as HTMLTableCellElement).style.textShadow = `
        -2px -2px 2px ${ownerColor},
        2px -2px 2px ${ownerColor},
        -2px 2px 2px ${ownerColor},
        2px 2px 2px ${ownerColor}`;

        if (rangeInput)
        {
            if (!unlimitedCheckbox.checked && !blindCheckbox.checked)
                rangeInput.value = player.metadata[`${Constants.EXTENSIONID}/visionRange`]
                    ? player.metadata[`${Constants.EXTENSIONID}/visionRange`] as string
                    : Constants.VISIONDEFAULT;
        }
        if (unlimitedCheckbox)
        {
            unlimitedCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionRange`] === 0;
        }
        if (torchCheckbox)
        {
            torchCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionTorch`] as boolean;
        }
        if (blindCheckbox)
        {
            blindCheckbox.checked = player.metadata[`${Constants.EXTENSIONID}/visionBlind`] as boolean;
        }
        if (unlimitedCheckbox.checked || blindCheckbox.checked)
            rangeInput.setAttribute("disabled", "disabled");
        else
            rangeInput.removeAttribute("disabled");

        rangeInput.onchange = async (event: Event) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = sceneCache.items.find(x => x.id === player.id)!;

            const target = event.target as HTMLInputElement;
            const value = parseInt(target.value);
            if (value < 0)
                target.value = "0";
            if (value > 999)
                target.value = "999";
            await OBR.scene.items.updateItems([thisPlayer], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionRange`] = value;
            });
        };

        unlimitedCheckbox.onclick = async (event: MouseEvent) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = sceneCache.items.find(x => x.id === player.id)!;

            let value = 0;
            const target = event.target as HTMLInputElement;
            if (target.checked)
            {
                rangeInput.setAttribute("disabled", "disabled");
                blindCheckbox.checked = false;
            }
            else
            {
                value = parseInt(rangeInput.value);
                rangeInput.removeAttribute("disabled");
            }
            await OBR.scene.items.updateItems([thisPlayer], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionRange`] = value;
            });
        };

        blindCheckbox.onclick = async (event: MouseEvent) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = sceneCache.items.find(x => x.id === player.id)!;

            const target = event.target as HTMLInputElement;
            if (target.checked)
            {
                rangeInput.setAttribute("disabled", "disabled");
            }
            else
            {
                rangeInput.removeAttribute("disabled");
            }
            await OBR.scene.items.updateItems([thisPlayer], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionBlind`] = target.checked;
            });
        };

        torchCheckbox.onclick = async (event: MouseEvent) =>
        {
            if (!event || !event.target) return;
            // Grab from scene to avoid a snapshot of the playerstate
            const thisPlayer = sceneCache.items.find(x => x.id === player.id)!;

            const target = event.target as HTMLInputElement;

            await OBR.scene.items.updateItems([thisPlayer], items =>
            {
                items[0].metadata[`${Constants.EXTENSIONID}/visionTorch`] = target.checked;
            });
        };

        rangeInput.addEventListener("mousewheel", async () =>
        {
            // default behavior is fine here - this allows mousewheel to adjust the number up and down when the input is selected
        });

        // Add a contextmenu to allow swapping the owner of the token without needing the permissions setting
        newTr.oncontextmenu = async function (e)
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
                const target = e.target as HTMLUListElement;

                const unitId = contextMenu.getAttribute("currentUnit")!;
                const newColor = sceneCache.players.find(owner => target.id === owner.id)?.color;
                const tr = document.getElementById(`tr-${unitId}`) as HTMLTableRowElement;
                const cell = tr.getElementsByClassName("token-name")[0] as HTMLTableCellElement;
                if (newColor)
                {
                    cell.style.textShadow = `
                    -2px -2px 2px ${newColor},
                    2px -2px 2px ${newColor},
                    -2px 2px 2px ${newColor},
                    2px 2px 2px ${newColor}`;
                }
                else { cell.style.textShadow = "" }

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
                // Don't let the menu go off window, it'll cut
                const adjustedLeft = Math.min(e.pageX, window.innerWidth - 150);
                const adjustedTop = Math.min(e.pageY, (window.innerHeight > 300 ? window.innerHeight - 50 : window.innerHeight) - 120);

                contextMenu.style.display = 'block';
                contextMenu.style.left = adjustedLeft + "px";
                contextMenu.style.top = adjustedTop + "px";
            }
        }
    }
}