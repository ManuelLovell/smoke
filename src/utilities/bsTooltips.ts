import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function SetupTooltips(idSelect: string, tooltipContent: string)
{
    const element = document.getElementById(`${idSelect}`);
    if (!element) return;
    tippy(element, {
        content: tooltipContent,
        theme: 'battlesystem',
    });
};

export function CreateTooltips()
{
    const tooltips = new Map<string, string>();
    tooltips.set(`tip_gmtokens`, "Note: GM-owned tokens give universal vision.");
    
    tooltips.set(`visionRangeHeader`, "Range: How far this token can see.");
    tooltips.set(`visionFalloffHeader`, "Falloff: The blurred edge of the vision range.");
    tooltips.set(`visionBlindHeader`, "Blind: If this token is temporarily without sight.");
    tooltips.set(`visionHideHeader`, "Move token to the 'Out-of-Sight' list");
    
    tooltips.set(`visionBumperHeader`, "Collision Distance: How close this tokenk can get to an active wall.");
    tooltips.set(`visionInAngleHeader`, "Inner Angle: Inner angle of token vision, for hard edge, match with Outer Angle");
    tooltips.set(`visionOutAngleHeader`, "Outer Angle:  Outer angle of token vision, for hard edge, match with Inner Angle");
    tooltips.set(`visionDarkHeader`, "Greyscale: Change vision to greyscale coloring.");

    tooltips.set(`tip_spectretokens`, "Spectre tokens are only visible to specific players. Enable vision here after it has been Spectred.");

    tooltips.set(`tip_fogfill`, "Toggle to enable/disable fog fill for the scene.");
    tooltips.set(`tip_disablevision`, "Toggle to enable/disable vision for all tokens in scene.");
    tooltips.set(`tip_persistence`, "Toggle to enable/disable persistence vision for tokens. This will leave the map revealed as they travel.");
    tooltips.set(`tip_playerdoors`, "Toggle to enable/disable players being able to see and use doors on their own.");
    tooltips.set(`tip_ownerrings`, "Toggle to enable/disable the colored rings seen around a player to indicate their vision radius. GM-Only.");
    tooltips.set(`tip_gridsnap`, "Toggle to enable/disable grid snapping when drawing Obstruction Lines and Objects. This is separate from the default OBR Snap setting.");
    
    tooltips.set(`doublewall_button`, "This will change ALL walls within the scene to be double-sided, so they cannot be passed from either side.");
    tooltips.set(`block_button`, "This will set all walls to be Blocking walls, so that tokens cannot move past them.");
    tooltips.set(`unblock_button`, "This will set all walls to be Passable walls, so that tokens can move through them.");
    tooltips.set(`lock_button`, "This will lock all obstruction lines, so they cannot be accidentally (or purposefully) moved.");
    tooltips.set(`unlock_button`, "This will unlock all obstruction lines so they can be moved and/or editted.");
    tooltips.set(`reset_persistence`, "This will reset all persistence on a map, for all players in the room.");

    tooltips.forEach((value, key) => { SetupTooltips(key, value); });
}