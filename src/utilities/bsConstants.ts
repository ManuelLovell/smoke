import { Command, Layer, PathCommand } from "@owlbear-rodeo/sdk";

export class Constants
{
    static EXTENSIONID = "com.battle-system.smoke";
    static RESETID = "com.battle-system.smoke-reset";
    static SPECTREID = "com.battle-system.spectre";
    static EXTENSIONWHATSNEW = "com.battle-system.smoke-whatsnew";
    static LINETOOLID = "com.battle-system.linetool";
    static POLYTOOLID = "com.battle-system.polytool";
    static ELEVATIONTOOLID = "com.battle-system.elevationtool";
    static ELEVATIONWARNID = "com.battle-system.elevationwarn";
    static BRUSHTOOLID = "com.battle-system.brushtool";
    static PROCESSEDID = "com.battle-system.processing";
    static LABELSID = "com.battle-system.labels";
    static GRIDID = "d9953ba1-f417-431c-8a39-3c3376e3caf0";
    static SPECTREBROADCASTID = "SPECTREBROADCAST";
    static RESETPERSISTID = "RESETPERSISTID";

    static LINELAYER: Layer = "POINTER";

    static ATTENUATIONDEFAULT = "30";
    static SOURCEDEFAULT = "3";
    static FALLOFFDEFAULT = "0";
    static INANGLEDEFAULT = "360";
    static OUTANGLEDEFAULT = "360";
    static CHECKREGISTRATION = 'https://vrwtdtmnbyhaehtitrlb.supabase.co/functions/v1/patreon-check';
    static ANONAUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

    static TRAILINGCOLLAR: PathCommand[] = [
        [Command.MOVE, 250, 250],
        [Command.LINE, 250, 220],
        [Command.LINE, 320, 220],
        [Command.LINE, 320, 280],
        [Command.LINE, 280, 280],
        [Command.LINE, 280, 200],
        [Command.LINE, 220, 200],
        [Command.LINE, 220, 300],
        [Command.LINE, 380, 280],
        [Command.LINE, 380, 230],
        [Command.LINE, 380, 180],
        [Command.CLOSE],
        [Command.MOVE, 250, 270],
        [Command.CUBIC, 300, 270, 350, 260, 350, 250],
        [Command.CUBIC, 350, 240, 300, 230, 250, 230],
        [Command.CUBIC, 200, 230, 150, 240, 150, 250],
        [Command.CUBIC, 150, 260, 200, 270, 250, 270],
        [Command.CLOSE]
    ];

    static DOOROPEN: PathCommand[] = [
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

    static SMOKEHTML = `
    <div id="contextMenu" class="context-menu" style="display: none">
        Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div class="visionTitle grid-3">Tokens with Vision Enabled<div class="note" title='Note: GM-owned tokens give universal vision.'>📝</div>
        <div id="visionPanelToggleContainer"></div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="token_list_div" class="grid-3" padding-bottom: 8px;">
            <table id="smokeUnitTablePrime" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup> 
                <thead>
                    <tr id="visionPanelMain">
                        <th>Name</th>
                        <th id="visionRangeHeader" class="clickable-header" title="Vision Range"><img class="menu_svg" src="./visionRange.svg"></th>
                        <th id="visionFalloffHeader" class="clickable-header" title="Vision Edge Fade"><img class="menu_svg" src="./visionFalloff.svg"></th>
                        <th id="visionBlindHeader" class="clickable-header" title="Disable Vision for a Token"><img class="menu_svg" src="./blind.svg"></th>
                        <th id="visionHideHeader" class="clickable-header" title="Move token to the 'Out-of-Sight' list"><img class="menu_svg" src="./eyeclosed.svg"></th>
                    </tr>
                    <tr id="visionPanelSub" style="display: none;">
                        <th>Name</th>
                        <th id="visionBumperHeader" class="clickable-header" title="Token Wall Collision Distance"><img class="menu_svg" src="./visionBumper.svg"></th>
                        <th id="visionInAngleHeader" class="clickable-header" title="Vision Inner Angle (For hard edge, match with Outer Angle)"><img class="menu_svg" src="./visionInner.svg"></th>
                        <th id="visionOutAngleHeader" class="clickable-header" title="Vision Outer Angle (For hard edge, match with Inner Angle)"><img class="menu_svg" src="./visionOuter.svg"></th>
                        <th id="visionHideHeader" class="clickable-header" title="Move token to the 'Out-of-Sight' list"><img class="menu_svg" src="./eyeclosed.svg"></th>
                    </tr>
                </thead>
                <tbody id="token_list"></tbody>
            </table>
            <table id="smokeUnitTableSub" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup>
                <tbody id="hidden_list" style="display:none;">~ <input type="button" value="Out-of-Sight List: Click to Show" class="settingsButton" style="width: 60% !important;" id="hideListToggle"> ~</tbody>
            </table>
        </div>
    </div>
    `;

    static SPECTREHTML = `
    <div class="visionTitle grid-3">Tokens with Spectre Enabled
        <div class="note" title='Spectre tokens are only visible to specific players. Enable vision here after it has been Spectred.'>📝</div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="ghostContainer" class="grid-3">
            <table style="margin: auto; padding: 0; width: 100%">
            <colgroup>
                <col style="width: 50%;">
                <col style="width: 25%;">
                <col style="width: 25%;">
            </colgroup>
            <tbody id="ghostList">
            </tbody></table>
            </div> 
        </div>
    </div>
    `;

    static SETTINGSHTML = `
        <div id="settings-ui">
            <table id="settingsTable">
                <colgroup>
                    <col style="width: 30%;">
                    <col style="width: 10%;">
                    <col style="width: 10%;">
                    <col style="width: 30%;">
                    <col style="width: 10%;">
                    <col style="width: 10%;">
                </colgroup>
                <tbody>
                    <tr>
                        <td colspan="2"><label for="toggle_fogfill" title="Toggle Fog Fill for the Scene">FogFill</label></td>
                        <td><input type="checkbox" id="toggle_fogfill"></td>
                        <td colspan="2"><label for="disable_vision" title="Toggles vision for all tokens">Disable Vision</label></td>
                        <td><input type="checkbox" id="disable_vision"></td>
                    </tr>
                    <tr>
                        <td><label for="toggle_persistence" title="Toggle Persistence with Map Revealing">Persistence</label></td>
                        <td><button id="reset_persistence"><img class="setting_svg" src="./reset.svg"></button></td>
                        <td><input type="checkbox" id="toggle_persistence"></td>
                        <td colspan="2"><label for="snap_checkbox" title-"Toggle doors being visible to players">Player-Visible Doors</label></td>
                        <td><input type="checkbox" id="door_checkbox"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="toggle_ownerlines" title="Show colored rings around to indicate token's vision owner">Owner Highlight</label></td>
                        <td><input type="checkbox" id="toggle_ownerlines"></td>
                        <td colspan="2"><label for="snap_checkbox" title="Toggle Grid Snapping when drawing Obstruction Lines">Grid Snap</label></td>
                        <td><input type="checkbox" id="snap_checkbox"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="toggle_placeholder" title="Setting Needed">Placeholder</label></td>
                        <td><input type="checkbox" id="toggle_placeholder"></td>
                        <td colspan="3"><input class="settingsButton" type="button" id="doublewall_button" value="Double-Side Walls"></td>
                    </tr>
                    <tr>
                        <td colspan="3"><input class="settingsButton" type="button" id="block_button" value="Block Walls"></td>
                        <td colspan="3"><input class="settingsButton" type="button" id="unblock_button" value="Unblock Walls"></td>
                    </tr>
                    <tr>
                        <td colspan="3"><input class="settingsButton" type="button" id="lock_button" value="Lock Lines" title="Lock all Obstruction Lines on the Scene"></td>
                        <td colspan="3"><input class="settingsButton" type="button" id="unlock_button" value="Unlock Lines" title="Unlock all Obstruction Lines on the Scene"></td>
                    </tr>
                    <tr>
                        <td colspan="6" style="text-align: center; font-weight: bold;">Tool Options</td>
                    </tr>
                    <tr>
                        <td colspan="6">
                            <div id="toolOptions">
                                Width: <input id="tool_width" type="number" value="8" style="width: 40px;" maxlength="2">
                                 - Color: <input id="tool_color" type="text" maxlength="7">
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
                        <td colspan="4">Import files from <a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a></br>and other tools.</td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <div class="custom-file-input">
                                <label for="import_file" id="import_file_name">Choose File...</label>
                                <input id="import_file" type="file">
                            </div>
                        </td>
                        <td colspan="2"><input type="button" id="import_button" value="Import" disabled></td>
                    </tr>
                    <tr>
                        <td colspan="2" >Format</br><select id="import_format"><option value="scene">UVTT Scene</option><option value="foundry">Foundry</option><option value="uvtt">Universal VTT</option></select></td>
                        <td colspan="2">Alignment</br><select id="map_align"><option selected>Loading..</option></select></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="dpi_autodetect" title="Whether or not to automatically detect the DPI of imported data based">DPI Autodetect</label></td>
                        <td colspan="2">
                            <input type="checkbox" id="dpi_autodetect" checked>
                            <input id="import_dpi" disabled type="text" value="150" maxlength="4">
                        </td>
                    </tr>
                </tbody>
                <div id="import_errors" class="grid-3"></div>
            </table>
        </div>`;

    static MARKDOWNHELP = `
<a id="smoke" name="smoke"></a>
<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#quick-start-smoke">Smoke: Quick Start</a>
      <li><a href="#quick-start-spectre">Spectre: Quick Start</a></li>
      <li><a href="#overview">Smoke & Spectre UI Overview</a>
      <ul>
        <li><a href="#ui-smoke">Smoke Panel</a></li>
        <li><a href="#ui-spectre">Spectre Panel</a></li>
        <li><a href="#ui-settings">Settings Panel</a></li>
        <li><a href="#ui-info">Info Panel</a></li>
        <li><a href="#ui-issue">Issue Indicator</a></li>
        <li><a href="#ui-switch">Processing Switch</a></li>
        <li><a href="#ui-tools">Drawing Tools</a></li>
        <li><a href="#ui-convert">Drawing Conversions</a></li>
        <li><a href="#ui-convert">Elevation Tools</a></li>
      </ul></li>
      <li><a href="#obstruct-tools">Smoke: Using the Obstruction Tools</a>
      <ul>
        <li><a href="#obstruct-line">The Obstruction Line</a></li>
        <li><a href="#obstruct-poly">The Obstruction Polygon</a></li>
        <li><a href="#obstruct-brush">The Obstruction Paintbrush</a></li>
      </ul></li>
      <li><a href="#smoke-tokens">Smoke: Using Tokens</a>
      <ul>
        <li><a href="#smoke-vision">Changing a token's vision range</a></li>
        <li><a href="#smoke-player">Who can see this token's view?</a></li>
      </ul></li>
      <li><a href="#smoke-advanced">Smoke: Advanced Features</a>
      <ul>
        <li><a href="#smoke-light">Using Light Sources</a></li>
        <li><a href="#smoke-doors"> Using Doors</a></li>
        <li><a href="#smoke-autohide"> Using Auto-Hide</a></li>
        <li><a href="#smoke-customfog"> Using Custom Fog Backgrounds</a></li>
      </ul></li>
      <li><a href="#smoke-elevation">Smoke: Elevation Mapping</a>
      <ul>
        <li><a href="#smoke-elevation-map">How it works</a></li>
        <li><a href="#smoke-elevation-tools">The Mapping Layer Tools</a></li>
        <li><a href="#smoke-elevation-view">The Mapping View Toggle</a></li>
      </ul></li>
      <li><a href="#smoke-import">Smoke: Importing Fog Files</a></li>
      <li><a href="#spectre-usage">Spectre: Usage and Use Cases</a></li>
      <li><a href="#spectre-works">Spectre: How it works</a>
      <ul>
        <li><a href="#spectre-vision">Who can see the token</a></li>
        <li><a href="#spectre-tokens">Where do the tokens go</a></li>
        <li><a href="#spectre-limits">How many things can be Spectred?</a></li>
      </ul></li>
    <li><a href="#support">Support</a></li>
  </ol>
</details>

<p align="right">(<a href="#smoke">back to top</a>)</p>


## Smoke: Quick Start <a id="quick-start-smoke" name="quick-start-smoke"></a>
So, your game starts in an hour and you've prepped nothing - but you want to distract them with some fog. Sure.
1. Add an IMAGE to the MAP layer, and in settings make sure Autodetect Maps is enabled OR leave Autodetect Maps off, and only draw within the pink-dashed boundary.
2. Click the 'Glasses' icon in the toolbar, and select the Line tool.  Draw to your heart's content.
3. Add a token to the scene. On that token, through the context-menu, 'Enable Vision'.
4. (Optional: Assign ownership of that token to a specific player, so they can only see through that token.)
5. Click the checkbox at the top of Smoke&Spectre to turn on processing.
6. Done!

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: Quick Start <a id="quick-start-spectre" name="quick-start-spectre"></a>
You need to drive someone crazy in a hurry, I get it.  Just make sure the player is in the game first for this to work.
1. On the token in the scene, that you want to be visible to ONLY certain players - open the context-menu and select "Spectre".  This will make the token visible to YOU, and no one else.
2. In the 'Spectre' window of the extension, you will now see that token. In the drop-down, select the player(s) you want to be able to see that token.
3. Done! Only those specific players (And yourself) can see that token.

<p align="right">(<a href="#smoke">back to top</a>)</p>
 
## Smoke & Spectre UI Overview <a id="overview" name="overview">

#### <a id="ui-smoke"></a>1. Smoke Panel
This panel holds information on all tokens that have Vision Enabled.  This includes Light sources as well as Character Tokens. A token only gets to this list if you click 'Enable Vision' on it.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-panel.webp)
The options next to a token's name are;
1. Viewing Range: Set the desired radius for a token's vision range.
2. Infinite Vision: Give a token 'infinite' viewing range.
3. Light Source: Designate a token to be a Light Source, which will extend a character's vision range (more in the Light Sources section).
4. Blind Vision: So a token no longer has vision.
5. Filter Away: Move a token to the 'Out of Sight List'. (This is just an 'out of the way' area, if you happen to have a lot of tokens in the list that do not really require your attention - like 50 torches)

Also, if you right-click a token's name you can assign an owner for a token quickly and easily (Even if you do not have owner-only permissions turned on in your room)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-spectre"></a>2. Spectre Panel
This panel holds information on all tokens that have been 'Spectred'.  

<i>Note: When a token has been 'Spectred', it has been removed from the scene that items generally exist in. This can cause some issues with other extensions that might try to interact with the Spectred item, if they are not scoped to ignore these 'out-of-play' local items. In general, only do Spectre things with Spectred tokens.</i>
![gmview view](https://battle-system.com/owlbear/smoke-docs/spectre-panel.webp)
The options next to a token's name are;
1. Set Viewer(s): Designate which other players are able to see this token.
2. Delete: Remove the Spectre from play.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-settings"></a>3. Settings Panel
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-settings.webp)
The settings for smoke are generally saved to the Scene, as each scene might have different needs to make it work.  The options are as follows;
1. Auto-Detect Maps: When enabled, Smoke will looks for images on the Map layer of your scene and determine the bounds for calculations based on the images position.  If you have multiple maps, it will make a box around all of them and base the calculations on that.  When disabled, Smoke will add a Boundary Box to the scene and constrain it's calculations to that.  You can stretch the box using the OBR tools or set the dimensions in the Height/Width boxes that appear when the setting is disabled.
2. Persistence: When enabled, Smoke will leave area 'unfogged' that your tokens have passed through.
3. Persistence Reset: This will clear all of the fog shapes in the area your token has walked through.
4. Trailing Fog: When used with Persistence, Smoke will 'semi-fog' the area that your token's have passed through but are not within active viewing range.
5. Trailing Fog: Auto-Hide: When this setting is enabled, a token that has 'Auto-hide' turned on will disappear when inside the semi-fogged areas of Trailing Fog.
6. Trailing Fog: Color: This allows you to select the color and opacity of the trailing fog on your map.
7. Grid Snap: When enabled, the Smoke's drawing tools will snap to the grid points when drawing. (Note: You can hold CTRL while drawing to temporarily disable this.)
8. Player-Visible Doors: When enabled, players will be able to see any doors you have enabled on the map. When disabled, players cannot see any door icons.
9. Convert from Dynamic Fog: If you were using the basic Dynamic Fog extension before I took over, this would convert your scene items over.
10. Unlock Fog Backgrounds: If you have Converted a Custom Fog Background in the scene, this will unlock that image so that you can manipulate it again.
11. Unlock/Lock Lines: By default, when you draw an obstruction it will be auto-locked to make sure they are not moved on accident.  Use these buttons to lock/unlock all lines so that they can be manipulated again. 
12. Default Elevation Mapping: This will determine the 'base level' a token/wall is at when using Elevation Mapping.  Leave this setting at 0 if you are not using Elevation Mapping.
13. Tool Options: This is for customizing the style of the lines that are created when drawing with the Obstruction Tools.
14. Import: Smoke is able to accept the UVTT format for building a scene for you. Select the map and Import, and the map image, obstructions, doors and light sources will be created in a new scene.

#### <a id="ui-info"></a>4. Info Panel
As Owlbear Rodeo runs in your browser, as does Smoke. All calculations are made on your device.  This window will output performance times to give you an idea of how processing is going.
Maps with a massive amount of obstructions (1000+) can take a little longer to process on a slower machine, but with recent updates the time difference should be negligible.
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-info.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-issue"></a>5. Issue Indicator
This little light is an early-warning if someone is having problems processing on the scene.
This could be from something as simple as not having a token that they can see through, or the extension having issues running on their machine.  You can click this indicator to see which player is having issues to narrow it down.
Green means things are good.
Yellow means nothing is started/enabled, but no reason to worry.
Red means something went wrong.
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-switch"></a>6. Processing Switch
This checkbox turns on/off the Fog processing for the extension. When turned off, you don't need to worry about any vision calculations or fog fills.
Though be sure to turn it on when you are ready to start using Dynamic Fog.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-tools"></a>7. Drawing Tools
Added to the OBR Toolbar are Smoke's drawing tools.
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

1. Obstruction Polygon: This tool is slightly different, in that it will create a closed shape - but the inside will be visible.  This is useful for items like 'Large Boulders' on a map, where the player can see that it's a boulder, but they cannot see past it.
2. Obstruction Line: This is your default tool for making an obstruction. Just click in your scene to create points for the line, and select Finish (or push Enter) when you're done.
3. Obstruction Paintbrush: This tool creates obstructions by the grid. Click and drag to fill in the desired area, and when you let go walls will be created around the shape you have painted. This is useful for maps that are blocky and/or very square with angular hallways.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>8. Drawing Conversions
If you prefer to use the base Owlbear Rodeo drawing tools, you can.  All shapes created via the default tools can be converted into an Obstruction.  Just right-click the shape and select 'Convert to Obstruction'.
This will remove the shape/line/drawing as it was, and recreate it as an Obstruction object.
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-convert.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>9. Elevation Tools
Also on the Smoke Toolbar are the Elevation Mapping tools;
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)
1. Elevation Layers: Elevation Mapping Layers 1-5 let you draw a shape at that elevation level, and all points (from obstructions or tokens) when processed will be drawn with that depth in mind.  A quick example, if you draw an obstruction around a house on your map - and then draw around the house with Elevation 1 - you won't be able to see around/above the house when on the ground, but if you put the token on the house it will be able to see everywhere.
2. Elevation Selection Tool: This let's you select your Elevation Layers.
3. Elevation View Toggle: This toggles on/off the visibility of the Elevation Layers, as they should be hidden away when not being configured. (They still take effect when not seen.)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Using the Obstruction Tools <a id="obstruct-tools" name="obstruct-tools">

When drawing obstructions, you have some options in the form of buttons...
1. Finish: This will complete your line based on the points you added to the scene. You can also push "ENTER" on the keyboard instead of clicking the button.
2. Cancel: This will remove all points and stop any line-drawing in process. You can also push "ESC" on the keyboard.
3. Undo: This will remove the last point you have placed. You can also push "Z" on the keyboard. (Not CTRL+Z, just 'Z')

#### <a id="obstruct-line"></a>1. The Obstruction Line
The line tool is the basic building block for scenes, and likely will be the most used when creating a scene.
By default, they block vision no matter what side of the line you are on. (The 'hidden' area is seen from the GM view in this screenshot, so it's only lightly obscured by darkness.)
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-line.webp)
<i> Note: You are able to change how the default vision works for a line by going to the context-menu for a line and changing between Two-Sided, One-Sided Left and One-sided Right.  The icon that is CURRENTLY being shown is the state the line is currently in. Refer to the icon for a simple idea of how it works - where the X is in relation to the line, is where you cannot see through it if the token is in that spot.</i>

You can also toggle an Obstruction Line's ability to block vision by clicking 'Disable/Enable Vision Line' in the context menu.
In addition to that, you can also toggle a line into a 'Door'.  Which works similar to the Vision toggle, but adds a door icon. More on this in the Doors section.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="obstruct-poly"></a>2. The Obstruction Polygon
The polygon tool is more of a special case, it creates a closed shape where the INSIDE is visible from the outside. The area 'behind' that shape though, you are unable to see.

The use-case for this is generally with objects that are large (and the player would know what it is on sight), but they cannot see behind it.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-poly.webp)
It can also be useful when attached to a large 'Monster' token, as the players would be able to view the token - but not be able to view behind it. (In case it's so big that it blocks vision!)

Polygons also block vision if you are INSIDE of the shape. As in, you'll be able to see the area around you (within the shape) but not see outside of it.  This could be useful if the shape is around a 'barrel' - and a player wants to hide inside. They will not be able to peer out of the barrel.

There is no hard-rule to how this thing is used, so it's really up to you to determine the best case. Feel free to experiment.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="obstruct-brush"></a>3. The Obstruction Brush
The brush tool is a quick-setup tool for maps that are blocky in nature, with lots of square rooms and hallways (Meaning, not a cave with lots of jagged its).

It's based on the grid, so be sure to line your map up accordingly first. After that, just click and drag as the brush highlights the squares it will draw obstruction lines around.  The benefits of this tool is it will let you setup large maps rather quickly by just coloring them in.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-brush.webp)
That said, there are pros and cons.
Pro: All contiguous parallel lines will be joined together, reducing the overall amount of obstruction lines in the scene. (So less processing!)
Con: Since all lines are joined, it can be more difficult to create a door in a long wall - because the wall will be one slid piece.
For this specific issue, adding a Door, it might be beneficial to 'bump out' a square where the door will be, so the line will be separate there.
<i>Note: Alternatively, there are other extensions out there that allow more advanced line manipulation (cutting, joining, segmenting) that you could use to alter the lines.  Feel free to use those to edit your scene, too.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Using Tokens <a id="smoke-tokens" name="smoke-tokens">

#### <a id="smoke-vision"></a>1. Changing a token's vision range
In the Smoke Panel, once a token has had it's Vision Enabled, the token will appear on the list with some options. The default radius is 30, but you can change this to whatever suits your needs.![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-vision.webp)
If you select the 'Infinite' toggle, it will over-ride the radius.
If you select the 'Blind' toggle, it will disable vision for the token.
<i>Note: The Light Source toggle should not be used for character tokens. You'll just confuse yourself for using it on a character if you are unsure.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-vision"></a>2. Who can see this token's view?
When a token is added to the scene, the OWNER of that token is the person who added it to the scene. Normally this is the GM.
When vision is enabled on a token (and it's owner is the GM) every player is able to see the vision for this token.  This is useful if you do not want everyone in your game to have their own personalized vision based on their token.
If you do want people to only see from the viewpoint of their token, you want to make sure they are the owner of that token.

To speed up the flow of assigning ownership, you have two options:
1. Let players drag in their own tokens. If they brought it in, they're the owner! Then just enable vision on it.
2. Right-click a token's name in the Smoke Panel, and you are able to assign an owner to a token from a list of **players currently in the room**.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-player.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>
  
## Smoke: Advanced Features <a id="smoke-advanced" name="smoke-advanced">

#### <a id="smoke-light"></a>1. Using Light Sources
When you turn a token into a 'Light Source', it will largely look the same unless something is obstructing the full view of that light source.
What a light source does, is stop a token from giving general vision in it's area - and instead only give vision based on what a token WITH vision can see of it.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light.webp)
This is easiest to see with narrow hallways.  If you add a light source to a small room, and then have a narrow hallway between it and a character token with vision, you will see that the vision the torch gives is constricted.

If you're looking to have your characters explore a dark area where they have to hold torches, it's a simple task.   Create torch tokens, enable vision, set them as a light source and then attach them to the characters.  Your other players will then be able to see each other when the light of the torch is not behind something obstructing it.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light2.webp)
<i>Given that light sources are not needed to be manipulated often, it's often better to move them to the 'Out-of-Sight' list, to clean up the clutter in the Smoke panel.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-doors"></a>2. Using Doors
In the context-menu for an Obstruction Line, there is an option for 'Enable Door'.
Enabling a door will draw a 'Door' icon on top of that line, which can be toggled to turn on/off the obstruction properties for that line (thus opening the door, allowing people to see through).
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-door.webp)
You can 'disable' a door and remove the door icon through the same process, selecting 'Disable Door'.
You can toggle the opening of a door in two ways;
1. Double click the door icon.
2. Select 'Open Door' on the context menu

By default, only a GM can see doors on a map.  If you would like your players to be able to see doors, select the option in the Settings panel.
If your players are a little click-happy, you can 'Lock Door' to stop players from being able to toggle them open.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-autohide"></a>3. Using Auto-hide
If you have 'Trailing Fog + Autohide' enabled, there will be an extra option in the context menu for tokens. Auto-Hide.
Turning this on will make token's 'disappear' when they are outside of viewable range for a token and inside the trailing fog area.
Trailing fog can be useful for areas that were explored and you want your player's to have some recollection of, but sometimes you don't want them to actively see everything that's happening in a room they are not currently in.
This option is for that scenario.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-customfog"></a>4. Using Custom Fog
Sometimes flat-colored fog isn't exactly what you're going for.  If you want things to get a little fancy, Custom Fog is a great feature to spruce things up.  It does require a little more process to get going though. Which is setting up a separate fog image to overlay on your map.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog1.webp)
The basic steps are;
1. Make sure your Custom Fog image is on the Map layer.
2. Overlay the Custom Fog image on top of your regular map.
3. On the context-menu for the Custom Fog image, select 'Convert to Fog Background'.
4. Done!

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog2.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Elevation Mapping <a id="smoke-elevation" name="smoke-elevation">
Elevation Mapping allows you to add some depth to your 2D Scene, by assigning 'areas' to the map where certain points/tokens are higher than others.

#### <a id="smoke-elevation-map"></a>1. How it works
When setting up elevation, you have a few layers to play with. (I've limited this to six to keep things simple, but technically it can be expanded.)
The default layer - 0 - has the special property of ignoring elevation. When you are using Smoke & Spectre without any elevation mappings, it's using layer 0.  *Any obstructions on layer 0 cannot be seen past, no matter what layer the token is on!*
With layers 1-6, this is where the calculations become different. If you have a token and an obstruction both within a Layer 1 mapping, the token can see PAST the obstruction!
But if you have a token with a Layer 1 mapping, and an obstruction within a Layer 2 Mapping, the player CANNOT see past the obstruction. Because the obstruction is at a higher depth.

Now for an active example;
Here is a token on an island map. Their vision is not obstructed at all. I have toggled on the Elevation Mapping View so I can use the tools.  I have used Elevation Mapping Layer-1 tool to surround the area I'm going to be working in. (This is to make sure no obstructions I draw within here end up on Elevation Mapping Layer-0, and thus always block vision.)
![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-1.webp)

Next, I draw obstruction lines around the items I want to block vision. (This screenshot has the Elevation Mapping View toggled off, so that you can see easier.)
Notice how the obstruction lines don't block a single thing.  This is because the token AND the obstructions all exist within the Elevation Mapping Layer-1 area.  So they are all at the same depth.
![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-2.webp)

With the base work done, I want to make sure my rocks are higher up - so that I can't see past them when I'm on the ground, and if I stood upon them - I can see the top of them and everything below.  So I'm going to use the Elevation Mapping Layer-1 Tool and draw an area around my rocks.
I draw my mappings AROUND the obstructions, fairly closely. This is because if a player is standing CLOSE to the object, I do not want them to accidentally be within that mapping.
<i>Note: You can layer mappings, and the highest layer will always take priority.</i>

Notice that while on the beach area, I can no longer see past the rocks.![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-3.webp)
But when standing on the rocks (within Elevation Mapping Layer-1, the same that the obstruction lines are in), I can see on top of them and off the sides!
![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-4.webp)
But I can still see the next rock above me.. so I'm going to use the next numbered elevation mapping tool.
![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-5.webp)
Now I can no longer see to the top, but I can see below.  Turn off the Elevation Mapping View so that the layers hide themselves and the effect is complete.
![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-6.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-elevation-tools"></a>2. The Mapping Layer Tools
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)
The numbered mountains on the Obstruction Tool Bar are the Elevation Mapping Layer Tools.
Or "MEL" if you want to read it as Mapping Elevation Layer, which for the suck of not writing it a million times - I will.
Each MEL Tool has a number next to it designating what layer it interacts with.
Tier 1 is Blue colored.
Tier 2 is Green colored.
Tier 3 is Yellow colored.
Tier 4 is Orange colored.
Tier 5 is Red colored.
They mimic a regular elevation map that you would see for mountains.  You can stack these mappings if you want, and for any points within several shapes - only the highest mapping is considered.
Meaning, if you circled your entire map in Tier 1, and then drew in the center as Tier 5 - any points in that center would be considered at Tier 5.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-elevation-view"></a>3. The Mapping View Toggle
The last two tools are the MEL Select Tool and MEL View Toggle.
Since the layers can cause a lot of visual clutter, you need to enable the toggle in order to see/use them.
This is also for people who do not want to use them do not need to see anything about it.
When the View is toggled on, the MEL tools are all enabled and you can draw.  When you turn the MEL View off - the information is then saved to the scene, and the visual indications of the layers are removed.
To make things easier and not have to swap between different tool bars, the MEL Select Tool exists so you can grab a layer and interact with it while staying on the Obstruction Tool Bar.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Importing Fog Files <a id="smoke-import" name="smoke-import">
You can find information on the UVTT Format here - [ArkenForge UVTT](https://arkenforge.com/universal-vtt-files/) as well as a sample file to try it out [here](https://www.dropbox.com/s/s494c3l6bnblmbu/The%20Pig%20and%20Whistle%20tavern.uvtt?dl=1).
UVTT Files have the .uvtt extension (Though some may differ depending on the application the VTT they were designed for).  Smoke&Spectre can accept general UVTT scenes as well as ones configured for Foundry (more may be added in the future).
When importing a scene, you will be asked where you want to import the Map to in your OBR storage - and the rest will handled for you.
For the other types, it generally expects the map to already be within the scene - so select the map from the Alignment dropdown, and then import your file.  It may take some trial and error depending on the DPI of the map (Not all files are made the same!). Owlbear's default DPI is 150 per grid unit.
<i>Note: There are some exceptions to this rule, where some files are outright badly configured.  There isn't much to be done in this case, so use your best judgement to align the map to the obstruction lines once they are imported.</i>
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-import.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: Usage and Use Cases<a id="spectre-usage" name="spectre-usage">
Spectre is completely different form dynamic fog, in the sense that the two have nothing to do with each other!
Zip! Zero! Nothing!
They are together simply because I thought combined that they created a dramatic event for scenes.

When a token becomes  a "Spectre", it becomes viewable to only you. The person who has made it a spectre.  You are able to see it on your screen all the same though. You are then able to select which people within your room you want to be able to view that token.
Why would you want to do this?
1. Perhaps you have some notes on the screen that you do not want to be 'hidden' because they become partially transparent and hard to read. If you Spectre it, it will maintain it's visibility and only be visible to you.
2. One of your players is haunted by ghosts only they can see.  You could Spectre a ghost, and make it only visible to them. Then when that player begins asking questions about the ghost, everyone else would just assume they are crazy - because no one else sees it.
3. Maybe one of your players has Truesight.  You could set up a seemingly boring room with few things in it, which is what other players would see - and then load it up with Spectre'd props like gold, bodies, books, etc that only they can see.

There's no defined list in how you go about it, but the general idea is controlling their perception (Which is very much where Smoke & Spectre intersect on their use cases.)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: How it works<a id="spectre-works" name="spectre-works">
Now, <i> from a technical perspective</i>...
Spectre removes an item from the scene, and recreates it as a local item.  Local items are 'temporary' items that are only seen by the creator. Local items generally have the caveat of disappearing on refresh, but Spectre snapshots everything to your scene so you will not lose your items on a refresh.

A drawback to this is that a Spectre item isn't a 'real' item. So other extensions cannot (Should not) interact with a Spectre'd token.
You can still manipulate a Spectre'd token, in terms of moving and resizing it. A player can also interact with the token if they need to. The way the Spectre'd token update will be a little 'choppier' though, as again, it's not a real item so the way OBR generally animates tokens moving/resizing doesn't happen here.

From a thematic perspective, there are ways around this. You could hide the tokens before moving them, or simply wait until the token is out of their view range. Or blind your player for a moment before doing your updates.
Or just.. do it in front of them. The difference isn't super noticeable, I just feel the need to point it out.
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="spectre-vision"></a>1. Who can see the token
On the Spectre Panel, when a token has been Spectre'd you'll see it pop up here. Next to the token's name is a player drop down.
You can select as many other players as you want to be able to view this token.
You can only select players that are in the room, as the list is populated based on that.
By default, when you Spectre a token you are the only person that can see it.  For everyone else, it'll look as if it was deleted.
![gmview view](https://battle-system.com/owlbear/smoke-docs/spectre-vision.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="spectre-tokens"></a>2. Where do the tokens go
Spectre'd token data is bundled up and stored in your scene. So if you decide to clear out your scene metadata, the Spectre'd token information will also go along with it.  In general, scene data is rather large (it uses your OBR storage, and if you have subscribed you probably have a ton of it) - but Spectre does place a cap on how many things you can it enabled on in the scene for data transmission purposes.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="spectre-limits"></a>3. How many things can be Spectred?
Fourteen items per scene.  14. That's it.
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Support

If you have questions, please join the [Owlbear Rodeo Discord](https://discord.gg/UY8AXjhzhe).

Or you can reach out to me at manuel@battle-system.com.
You can also support these projects at the [Battle-System Patreon](https://www.patreon.com/battlesystem).
<p align="right">(<a href="#smoke">back to top</a>)</p>`;
}