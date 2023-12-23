import { PathCommand } from "@owlbear-rodeo/sdk";

export class Constants
{
    static EXTENSIONID = "com.battle-system.smoke";
    static SPECTREID = "com.battle-system.spectre";
    static EXTENSIONWHATSNEW = "com.battle-system.smoke-whatsnew";
    static LINETOOLID = "com.battle-system.linetool";
    static POLYTOOLID = "com.battle-system.polytool";
    static PROCESSEDID = "com.battle-system.processing";
    static ARMINDOID = "com.armindoflores.fogofwar";
    static VISIONDEFAULT = "30";
    static LABELSID = "com.battle-system.labels";
    static DICENOTATION = /(\d+)[dD](\d+)(.*)$/i;
    static DICEMODIFIER = /([+-])(\d+)/;
    static PARENTHESESMATCH = /\((\d*d\d+\s*([+-]\s*\d+)?)\)/g;
    static PLUSMATCH = /\s(\+\d+)\s/g;
    static GRIDID = "d9953ba1-f417-431c-8a39-3c3376e3caf0";

    static DOOROPEN:PathCommand[] = [
        [0, -65.35400390625, -250],
        [1, -65.35400390625, -228.27999877929688],
        [1, -150.29598999023438, -228.27999877929688],
        [1, -150.29598999023438, 205.0780029296875],
        [1, -118.89300537109375, 205.0780029296875],
        [1, -118.89300537109375, -196.8769989013672],
        [1, -65.35400390625, -196.8769989013672],
        [1, -65.35400390625, 242.5],
        [1, 142.79598999023438, 205.0780029296875],
        [1, 142.79598999023438, 143.84298706054688],
        [1, 142.79598999023438, -212.5],
        [5], [0, -27.06201171875, 13.128997802734375],
        [4, -34.05900573730469, 13.128997802734375, -39.73200988769531, 5.7480010986328125, -39.73200988769531, -3.35699462890625],
        [4, -39.73200988769531, -12.46099853515625, -34.05900573730469, -19.841995239257812, -27.06201171875, -19.841995239257812],
        [4, -20.065017700195312, -19.841995239257812, -14.392013549804688, -12.46099853515625, -14.392013549804688, -3.35699462890625],
        [4, -14.392013549804688, 5.7480010986328125, -20.065017700195312, 13.128997802734375, -27.06201171875, 13.128997802734375],
        [5]
    ];

    static DOORCLOSED: PathCommand[] = [
        [0, -178.44699096679688, -250],
        [1, -178.44699096679688, 228.08499145507812],
        [1, 157.114013671875, 228.66598510742188],
        [1, 157.114013671875, -250],
        [5],
        [0, -146.8909912109375, 196.5830078125],
        [1, -146.8909912109375, -218.44200134277344],
        [1, 125.55398559570312, -218.44200134277344],
        [1, 125.55398559570312, -161.62899780273438],
        [1, 114.77301025390625, -161.62899780273438],
        [1, 114.77301025390625, -207.91400146484375],
        [1, -136.10699462890625, -207.91400146484375],
        [1, -136.10699462890625, 186.55398559570312],
        [1, 114.77398681640625, 186.55398559570312],
        [1, 114.77398681640625, 140.26998901367188],
        [1, 125.55499267578125, 140.26998901367188],
        [1, 125.55499267578125, 197.05499267578125],
        [5],
        [0, 114.77301025390625, -112.54100036621094],
        [1, 125.55401611328125, -112.54100036621094],
        [1, 125.55401611328125, 91.17999267578125],
        [1, 114.77301025390625, 91.17999267578125],
        [5],
        [0, -84.21299743652344, -10.67999267578125],
        [4, -84.21299743652344, -1.5319976806640625, -91.63099670410156, 5.8860015869140625, -100.781005859375, 5.8860015869140625],
        [4, -109.93099975585938, 5.8860015869140625, -117.3489990234375, -1.5319976806640625, -117.3489990234375, -10.67999267578125],
        [4, -117.3489990234375, -19.829986572265625, -109.93099975585938, -27.24798583984375, -100.781005859375, -27.24798583984375],
        [4, -91.63101196289062, -27.24798583984375, -84.2130126953125, -19.829986572265625, -84.2130126953125, -10.67999267578125],
        [5]
    ];

    static MAINPAGE = `
    <div id="contextMenu" class="context-menu" style="display: none">
    Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div id="main-ui" class="grid-main">
            <div class="visionTitle grid-3">Vision Radius</div>
            <div class="grid-3"><i>GM-owned tokens give universal vision.</i></div>
            <p class="grid-3" id="no_tokens_message">Enable vision on your character tokens.</p>
            <div id="token_list_div" class="grid-3" style="border-bottom: 1px solid white; padding-bottom: 8px;">
                <table style="margin: auto; padding: 0;">
                <tbody id="token_list"></tbody>
                </table>
            </div>
            <div class="visionTitle grid-3">Spectres!</div>
            <div id="ghostContainer" class="grid-3" style="border-bottom: 1px solid white; padding-bottom: 8px;">
                <div id="spectreWarning">
                    Spectre tokens are only visible to specific players.
                    <br>
                    Enable vision here after it's been Spectred.
                    <br>
                </div>
                <table style="margin: auto; padding: 0; width: 100%">
                <colgroup>
                    <col style="width: 50%;">
                    <col style="width: 25%;">
                    <col style="width: 25%;">
                </colgroup>
                <tbody id="ghostList">
                </tbody></table>
            </div> 
            <div id="fog_backgrounds" class="grid-3">
                <div class="visionTitle" style="display: block; padding-top:8px;">Fog Backgrounds</div>
                <div id="fog_background_list" class="grid-main" style="border-bottom: 1px solid white; padding-bottom: 8px;">
            </div>
        </div>`;

    static SETTINGSPAGE = `
        <div id="settings-ui" style="display:none;">
            <table id="settingsTable">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 10%;">
                    <col style="width: 40%;">
                    <col style="width: 10%;">
                </colgroup>
                <tbody>
                    <tr>
                        <td><label for="autodetect_checkbox" title="Automatically detect fog areas based on the current scene's maps">Autodetect Maps</label></td>
                        <td><input type="checkbox" id="autodetect_checkbox" checked></td>
                        <td><div style="display:flex;"><label for="persistence_checkbox" title="Enabling fog persistence will retain the previously viewed areas of the map">Persistence</label><input type="button" id="persistence_reset" value="Reset"></div></td>
                        <td><input type="checkbox" id="persistence_checkbox"></td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <div id="boundry_options" class="grid-3" style="display:none;">
                                <span id="map_size">Boundary Size: 
                                    <input type="number" id="mapWidth" name="Width" min="10" max="500"/> x 
                                    <input type="number" id="mapHeight" name="Height" min="10" max="500"/>
                                    <input type="button" id="mapSubmit" value="Update"/>
                                    &nbsp;&nbsp;&nbsp;
                                </span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><label for="snap_checkbox">Grid Snap</label></td>
                        <td><input type="checkbox" id="snap_checkbox"></td>
                        <td><label for="snap_checkbox">Player-Visible Doors</label></td>
                        <td><input type="checkbox" id="door_checkbox"></td>
                    </tr>
                    <tr>
                        <td colspan="4"><div id="opacityHolder">
                            <label for="fow_checkbox" title="Trailing fog shows an opaque layer for previously viewed areas that players cannot currently view">Trailing Fog + Autohide</label>
                           - <input type="checkbox" id="fow_checkbox"> -
                            <input type="text" style="width: 90px;" maxlength="9" id="fow_color" value="#00000088">
                        </div></td>
                    </tr>
                    <tr>
                        <td colspan="2"><input class="settingsButton" type="button" id="convert_button" value="Convert from Dynamic Fog"></td>
                        <td colspan="2"><input class="settingsButton" type="button" id="background_button" value="Unlock Fog Backgrounds"></td>
                    </tr>
                    <tr>
                        <td colspan="2">Performance<select id="quality">
                            <option value="accurate" selected>Accurate</option>
                            <option value="fast">Fast</option>
                        </select></td>
                        <td colspan="2"><input class="settingsButton" type="button" id="debug_button" value="Enable Debugging" title="Show debugging and performance data"></td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: center; font-weight: bold;">Tool Options</td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <div id="toolOptions">
                                Width: <input id="tool_width" type="number" value="8" style="width: 40px;" maxlength="2">
                                 - Color: <input id="tool_color" type="text" value="#000000" style="width: 74px;" maxlength="7">
                                 - Style: <select id="tool_style">
                                    <option value="solid" selected>Solid</option>
                                    <option value="dotted">Dotted</option>
                                </select>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table id="importTable">
                <colgroup>
                    <col style="width: 35%;">
                    <col style="width: 15%;">
                    <col style="width: 35%;">
                    <col style="width: 15%;">
                </colgroup>
                <tbody>
                    <tr>
                        <td colspan="4" class="tableHeader">Import</td>
                    </tr>
                    <tr>
                        <td colspan="4">Import JSON files with fog data from<br><a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a> and other tools.</td>
                    </tr>
                    <tr>
                        <td colspan="2" >Format</br><select id="import_format"><option value="foundry">Foundry</option><option value="uvtt">Universal VTT</option></select></td>
                        <td colspan="2">Alignment</br><select id="map_align" style="width: 120px;"><option selected>Loading..</option></select></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="dpi_autodetect" title="Whether or not to automatically detect the DPI of imported data based">DPI Autodetect</label></td>
                        <td><input type="checkbox" id="dpi_autodetect" checked></td>
                        <td><input id="import_dpi" disabled type="text" value="150" style="width: 32px;" maxlength="4"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><input id="import_file" style="width: 190px;" type="file"></td>
                        <td colspan="2"><input style="padding: 6px" type="button" id="import_button" value="Import" disabled></td>
                    </tr>
                </tbody>
                <div id="import_errors" class="grid-3"></div>
            </table>
        </div>`;

    static DEBUGPAGE = `
    <div id="debug_div" style="display: none;" class="grid-debug">
            <div class="visionTitle grid-2" style="text-align: center; margin-top: 16px">Performance Info</div>
            <div>Stage 1: Fog Shapes</div><div id="stage1">N/A</div>
            <div>Stage 2: Player Vision</div><div id="stage2">N/A</div>
            <div>Stage 3: Vision Ranges</div><div id="stage3">N/A</div>
            <div>Stage 4: Persistence+Trailing</div><div id="stage4">N/A</div>
            <div>Stage 5: OBR Scene</div><div id="stage5">N/A</div>
            <div>Stage 6: Autohide</div><div id="stage6">N/A</div>
            <div>Cache hits/misses</div><div><span id="cache_hits">?</span>/<span id=cache_misses>?</span></div>
        </div>`;
}