import { Command, Layer, PathCommand } from "@owlbear-rodeo/sdk";

export class Constants
{
    static EXTENSIONID = "com.battle-system.smoke";
    static EXTENSIONNOTICE = "com.battle-system.smoke-notice";
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

    static DEFAULTLINECOLOR = '#000000';
    static DEFAULTLINEWIDTH = 8;
    static DEFAULTLINESTROKE: number[] = [];
    static LINELAYER: Layer = "POINTER";
    static DOORCOLOR = "#4000ff";

    static ATTENUATIONDEFAULT = "30";
    static SOURCEDEFAULT = "2";
    static FALLOFFDEFAULT = "0";
    static DARKVISIONDEFAULT = "0";
    static INANGLEDEFAULT = "360";
    static OUTANGLEDEFAULT = "360";
    static CHECKREGISTRATION = 'https://vrwtdtmnbyhaehtitrlb.supabase.co/functions/v1/patreon-check';
    static ANONAUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

    static DOOROPEN = 'https://battle-system.com/owlbear/smoke-docs/opendoor.svg';
    static DOORCLOSED = 'https://battle-system.com/owlbear/smoke-docs/closeddoor.svg';
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

    static DARKVISIONSHADER = `
        uniform vec2 size;
        uniform vec2 center;
        uniform float radius;
        uniform float clear;
        uniform float smoothwidth;

        half4 main(float2 coord) {
            vec2 normalizedCoord = coord / size;
            float dist = distance(normalizedCoord, center);
            
            float innerAlpha = smoothstep(clear, clear + smoothwidth, dist);
            
            float outerAlpha = 1.0 - step(radius, dist);
            
            float alpha = innerAlpha * outerAlpha;
            
            return half4(0.5, 0.5, 0.5, alpha);
        }
    `;

    static SMOKEHTML = `
    <div id="contextMenu" class="context-menu" style="display: none">
        Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div class="visionTitle grid-3">Tokens with Vision Enabled<div id="tip_gmtokens" class="note">📝</div>
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
                        <th id="visionRangeHeader" class="clickable-header"><img id="visionRangeSvg" class="menu_svg" src="./visionRange.svg"></th>
                        <th id="visionFalloffHeader" class="clickable-header"><img id="visionFalloffSvg" class="menu_svg" src="./visionFalloff.svg"></th>
                        <th id="visionBlindHeader" class="clickable-header"><img class="menu_svg" src="./blind.svg"></th>
                        <th id="visionHideHeader" class="clickable-header"><img class="menu_svg" src="./eyeclosed.svg"></th>
                    </tr>
                    <tr id="visionPanelSub" style="display: none;">
                        <th>Name</th>
                        <th id="visionBumperHeader" class="clickable-header"><img id="visionBumperSvg" class="menu_svg" src="./visionBumper.svg"></th>
                        <th id="visionInAngleHeader" class="clickable-header"><img id="visionInnerSvg" class="menu_svg" src="./visionInner.svg"></th>
                        <th id="visionOutAngleHeader" class="clickable-header"><img id="visionOuterSvg" class="menu_svg" src="./visionOuter.svg"></th>
                        <th id="visionDarkHeader" class="clickable-header"><img id="visionDarkSvg" class="menu_svg" src="./darkvision.svg"></th>
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
        <div id= "tip_spectretokens" class="note">📝</div>
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
                        <td colspan="2"><label for="toggle_fogfill" id="tip_fogfill">FogFill</label></td>
                        <td><input type="checkbox" id="toggle_fogfill"></td>
                        <td colspan="2"><label for="disable_vision" id="tip_disablevision">Disable Vision</label></td>
                        <td><input type="checkbox" id="disable_vision"></td>
                    </tr>
                    <tr>
                        <td><label for="toggle_persistence" id="tip_persistence">Persistence</label></td>
                        <td><button id="reset_persistence"><img class="setting_svg" src="./reset.svg"></button></td>
                        <td><input type="checkbox" id="toggle_persistence"></td>
                        <td colspan="2"><label for="snap_checkbox" id="tip_playerdoors">Player-Visible Doors</label></td>
                        <td><input type="checkbox" id="door_checkbox"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="toggle_ownerlines" id="tip_ownerrings">Owner Highlight</label></td>
                        <td><input type="checkbox" id="toggle_ownerlines"></td>
                        <td colspan="2"><label for="snap_checkbox" id="tip_gridsnap">Grid Snap</label></td>
                        <td><input type="checkbox" id="snap_checkbox"></td>
                    </tr>
                    <tr>
                        <td colspan="3"><select class="settingsButton" id="preview_select"></select></td>
                        <td colspan="3"><input class="settingsButton" type="button" id="doublewall_button" value="Double-Side Walls"></td>
                    </tr>
                    <tr>
                        <td colspan="3"><input class="settingsButton" type="button" id="block_button" value="Block Walls"></td>
                        <td colspan="3"><input class="settingsButton" type="button" id="unblock_button" value="Unblock Walls"></td>
                    </tr>
                    <tr>
                        <td colspan="3"><input class="settingsButton" type="button" id="lock_button" value="Lock Lines"></td>
                        <td colspan="3"><input class="settingsButton" type="button" id="unlock_button" value="Unlock Lines"></td>
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
                    <tr>
                        <td colspan="6" style="text-align: center; font-weight: bold;">Vision Defaults</td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="visionDefaultInput" id="tip_visionDefault">Vision</label></td>
                        <td><input type="number" id="visionDefaultInput"></td>
                        <td colspan="2"><label for="collisionDefaultInput" id="tip_collisionDefault">Collision</label></td>
                        <td><input type="number" id="collisionDefaultInput"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="falloffDefaultInput" id="tip_falloffDefault">Falloff</label></td>
                        <td><input type="number" id="falloffDefaultInput"></td>
                        <td colspan="2"><label for="greyscaleDefaultInput" id="tip_greyscaleDefault">Greyscale</label></td>
                        <td><input type="number" id="greyscaleDefaultInput"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="innerAngleDefaultInput" id="tip_innerAngleDefault">Inner-Angle</label></td>
                        <td><input type="number" id="innerAngleDefaultInput"></td>
                        <td colspan="2"><label for="outerAngleDefaultInput" id="tip_outerAngleDefault">Outer-Angle</label></td>
                        <td><input type="number" id="outerAngleDefaultInput"></td>
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
                        <td colspan="2"><label for="dpi_autodetect" id="tip_importdpi">DPI Autodetect</label></td>
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

1. Click the 'Glasses' icon in the toolbar, and select the Line tool.  Draw to your heart's content.
2. Add a token to the scene. On that token, through the context-menu, 'Enable Vision'.
3. (Optional: Assign ownership of that token to a specific player, so they can only see through that token.)
4. Click the checkbox in settings  to turn on Fog Fill.
5. Done!

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
There are two sets of options to configure a token's vision range;
For Basic Settings:
1. Range: Set the desired radius for a token's vision range.
2. Falloff: Change the edge of a tokens' vision range from a hard line to a soft blur (Try values 0 - 5).
3. Disable: Disable a single token's vision - useful for a quick 'Blind' status.
4. Move to Out-of-Sight List: Moves this token to the lower list which can be hidden from view. Useful if you have lots of items in the scene but the majority of them will never be changed/updated
For Advanced Settings:
1. Collision: Set how far away from the token's center collision will occur when using unpassable walls. If the collision range is set too high, it could prove difficult to move a token in a narrow hallway.
2. Inner/Outer Angle: When looking to use coned vision, set these to the angle in which you would like to constrain vision.  The direction doesn't matter as much, as you can rotate the token and the cone will follow it.
3. Greyscale: Enable to remove color from a token's vision radius, useful for a 'Darkvision' effect.  This will set the entire vision radius to greyscale.

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
1. Fog Fill: This will enable/disable the Fog Fill in the Owlbear Rodeo Fog settings.  S&S3.0 requires fog fill in order  to do dynamic fog processing (but does not require it for collision detection). This is a  deviation from S&S2.0 where fog could be calculated in a small area via the bounding grid - which is no longer possible.
2. Disable Vision: This will disable vision for ALL tokens that have vision enabled.  Useful if you need to blind the entire group, but do not wish to click each individual token.
3. Persistence/Reset: This will enable/disable Persistence on your map. Persistence will keep areas that a token has stopped as 'discovered', and it will not be covered in fog when the token moves away.  The 'reset' button next to the toggle will reset the uncovered areas for everyone currently in the room.
4. Player-Visible Doors: This will allow player's to see and interact with doors that have been created.
5. Owner Highlight: This will enable/disable the colored rings that indicate a player's viewable range as a GM.
6. Grid Snap: This will enable/disable the custom grid snapping used for drawing Obstruction Lines/Objects in S&S (Note: You can hold CTRL while drawing to temporarily disable this.). <i>This is independent of the default Snap setting in OBR.</i>
7. Double-Side Walls: This will change all walls on the map to be double-sided walls. This can be useful if an imported map lacked the information, and you do not wish to set each wall individually.
8. Block/Unblock Walls: By default, when you draw an obstruction it will be passable (with the exception of the Obstruction Brush tool).  This will block/unblock all walls so that tokens ability to pass them is changed.
9. Lock/Unlock Lines: By default, when you draw an obstruction it will be auto-locked to make sure they are not moved on accident.  Use these buttons to lock/unlock all lines so that they can be manipulated again. 
11. Tool Options: This is for customizing the style of the lines that are created when drawing with the Obstruction Tools.
12. Import: Smoke is able to accept the UVTT format for building a scene for you. Select the map and Import, and the map image, obstructions, doors and light sources will be created in a new scene.

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
<i> Note: You are able to change how the default vision works for a line by going to the context-menu for a line and changing between Two-Sided, and One-sided.</i>

You can also toggle an Obstruction Line's ability to block vision by clicking 'Disable/Enable Vision Line' in the context menu.
In addition to that, you can also toggle a line into a 'Door'.  Which works similar to the Vision toggle, but adds a door icon. More on this in the Doors section.
You can change how an obstruction behaves in several ways:
1. Enable/Disable Vision Line: This will toggle how this line interacts with a token's vision.
2. Swap to One-Sided/Two-Sided: This will toggle how a token sees this line. A one-sided line will block vision from one side, but allow vision from the other. A two-sided line will block vision from both sides.
	A. (When on One-sided) Swap Obstructing Side: This will change what side of the line you are able to see through.
3. Swap to Passable/Unpassable: This will change how this line behaves as a collider.  A passable line will not stop a token's movement, but an unpassable one will.
4. Enable Door: This will change the line to have 'Door' functionality. A line that has Door functionable has a few more buttons to improve flow.
	A. Disable Door: This will disable the line behaving as a door.
	B. Open/Close Door: This will change if a token can see through, and pass through this line.
	C.  Lock Door: This will lock the door, so that players are unable to open it.
	<i>Note: The 'Door' picture that appears can be double-clicked in order to open the door. It only serves the purposes of showing a door though. In order to manipulate the obstruction line that is the door - select the line.</i>

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
There are two sets of settings - Basic and Advanced. In order, the controls are:
1. (Basic) Vision Range.
2. (Basic) Vision Falloff.
3. (Basic) Vision Disable.
4. (Advanced) Collision Range.
5. (Advanced) Inner Vision Angle.
6. (Advanced) Outer Vision Angle.
7. (Advanced) Greyscale Vision.

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

#### <a id="smoke-light"></a>1. Using Torchlight (Previously Light Sources)
If you need ambient lighting on a map, you need to create a 'Torch'.  This can only be token with token's on the PROP layer.  When you open the context menu of a token on the PROP layer, you will see the 'Create Torchlight' option.
Torchlights are added to the token vision list like all other tokens, but are appended with a 🔦icon. All of the same settings can be used.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light.webp)
This is easiest to see with narrow hallways.  If you add a torchlight to a small room, and then have a narrow hallway between it and a character token with vision, you will see that the vision the torch gives is constricted.

If you're looking to have your characters explore a dark area where they have to hold torches, it's a simple task.   Create torch tokens, enable vision, set them as a torchlight and then attach them to the characters.  Your other players will then be able to see each other when the light of the torch is not behind something obstructing it.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light2.webp)
<i>Given that torchlights are not needed to be manipulated often, it's often better to move them to the 'Out-of-Sight' list, to clean up the clutter in the Smoke panel.</i>

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

#### <a id="smoke-customfog"></a>3. Using Custom Fog
Sometimes flat-colored fog isn't exactly what you're going for.  If you want things to get a little fancy, Custom Fog is a great feature to spruce things up.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog1.webp)
The basic steps are;
1. Make sure your Custom Fog image is on the Map layer.
2. Overlay the Custom Fog image on top of your regular map.
3. On the context-menu for the Custom Fog image, select 'Convert to Fog Background'.
4. Done!

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog2.webp)
<i>Note: To remove the Fog Background, use the Fog Tool to Select the Custom Fog Background (Because it's a Fog Item now!) and select the option to Convert the item back.</i>
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

## Support

If you have questions, please join the [Owlbear Rodeo Discord](https://discord.gg/u5RYMkV98s).

Or you can reach out to me at manuel@battle-system.com.
You can also support these projects at the [Battle-System Patreon](https://www.patreon.com/battlesystem).
<p align="right">(<a href="#smoke">back to top</a>)</p>`;
}