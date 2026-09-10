import { OwlbearIds } from '../helpers/BSConstants';

/**
 * Settings Keys Constants
 * Central constants for all application settingss
 * Following the pattern: ${EXTENSION_ID}/keyname
 * For space, try to limit char length to 8 or fewer
 */

const EXTENSION_ID = OwlbearIds.EXTENSIONID;

export class MenuConstants {
  static CONVERT_CURVE = `${EXTENSION_ID}/convertCurve`;
  static TOGGLE_VISION_MENU = `${EXTENSION_ID}/toggleVisionMenu`;
  static TOGGLE_VISION_LINE = `${EXTENSION_ID}/toggleVisionLine`;
  static TOGGLE_DOOR_LOCK = `${EXTENSION_ID}/toggleDoorLock`;
  static TOGGLE_TORCH = `${EXTENSION_ID}/toggleTorch`;
  static TOGGLE_AUTOHIDE = `${EXTENSION_ID}/toggleAutoHide`;
  static TOGGLE_FOG_MAP = `${EXTENSION_ID}/toggleFogMap`;

  static SWITCH_ONE_SIDED = `${EXTENSION_ID}/switchOneSided`;
  static SWITCH_OBSTRUCT_SIDE = `${EXTENSION_ID}/switchObstructSide`;
  static SWITCH_BLOCKAGE = `${EXTENSION_ID}/switchBlockage`;
  static SWITCH_ADVANCED_WALL = `${EXTENSION_ID}/switchAdvancedWall`;

  static ADD_VISION_LINE_MODE = `${EXTENSION_ID}/addVisionLineMode`;
  static ADD_VISION_POLYGON_MODE = `${EXTENSION_ID}/addVisionPolygonMode`;
  static ADD_VISION_BRUSH_MODE = `${EXTENSION_ID}/addVisionBrushMode`;
  static ADD_LINE_CUTTER_MODE = `${EXTENSION_ID}/addLineCutterMode`;
  static ADD_SMOKE_RECTANGLE_MODE = `${EXTENSION_ID}/addSmokeRectangleMode`;

  static ENTER_ELEVATION_ONE = `${EXTENSION_ID}/enterElevationOne`;
  static ENTER_ELEVATION_TWO = `${EXTENSION_ID}/enterElevationTwo`;
  static ENTER_ELEVATION_THREE = `${EXTENSION_ID}/enterElevationThree`;
  static ENTER_ELEVATION_FOUR = `${EXTENSION_ID}/enterElevationFour`;
  static ENTER_ELEVATION_FIVE = `${EXTENSION_ID}/enterElevationFive`;
  static ENTER_ELEVATION_SELECT = `${EXTENSION_ID}/enterElevationSelect`;
  static ENTER_ELEVATION_MODE = `${EXTENSION_ID}/enterElevationMode`;

  static AUTO_FOG_BG = `${EXTENSION_ID}/autoFogBG`;

  static CREATE_WINDOW = `${EXTENSION_ID}/createWindow`;
  static CREATE_DOOR = `${EXTENSION_ID}/createDoor`;
  static OPEN_DOOR = `${EXTENSION_ID}/openDoor`;

  static VISION_TOOL = `${EXTENSION_ID}/visionTool`;
  static CONTEXT_MENU_EMBED = `${EXTENSION_ID}/contextMenuEmbed`;
}

export class MapConstants {
  static FOG_BACKGROUND = `${EXTENSION_ID}/hasFogBackground`;
  static FOG_BACKGROUND_STYLE = `${EXTENSION_ID}/hasFogBackgroundStyle`;
  static FOG_BACKGROUND_ID = `${EXTENSION_ID}/fogBackgroundId`;
  static FOG_BACKGROUND_EVENT = `${EXTENSION_ID}/FOGBACKGROUNDEVENT`;
}

export class TokenConstants {
  static VISION_RANGE = `${EXTENSION_ID}/visionRange`;
  static VISION_FALLOFF = `${EXTENSION_ID}/visionFallOff`;
  static VISION_IN_ANGLE = `${EXTENSION_ID}/visionInAngle`;
  static VISION_OUT_ANGLE = `${EXTENSION_ID}/visionOutAngle`;
  static VISION_DARKNESS = `${EXTENSION_ID}/visionDark`;
  static VISION_SOURCE = `${EXTENSION_ID}/visionSourceRange`;
  static VISION_BLIND = `${EXTENSION_ID}/visionBlind`;
  static VISION_FACING = `${EXTENSION_ID}/visionFacing`;

  static HIDDEN_TOKEN = `${EXTENSION_ID}/hiddenToken`;
  static LINKED_TO = `${EXTENSION_ID}/linkedTo`;
  static UNIT_DEPTH = `${EXTENSION_ID}/unitDepth`;
  static GET_PERSISTENT_LIGHT = `${EXTENSION_ID}/getPersistentLight`;

  static IS_TORCH = `${EXTENSION_ID}/isTorch`;
  static IS_FOG_EFFECT = `${EXTENSION_ID}/isFogEffect`;
  static IS_AUTO_HIDDEN = `${EXTENSION_ID}/isAutoHidden`;
  static IS_VISION_LIGHT = `${EXTENSION_ID}/isVisionLight`;
  static IS_PERSISTENT_LIGHT = `${EXTENSION_ID}/isPersistentLight`;
  static IS_TRAILING_FOG_LIGHT = `${EXTENSION_ID}/isTrailingFogLight`;
  static IS_TRAILING_FOGGER = `${EXTENSION_ID}/isTrailingFogger`;
  
  static IS_LOCAL_DECAL = `${EXTENSION_ID}/isLocalDecal`;
  static IS_LOCAL_INDICATOR_RING = `${EXTENSION_ID}/isIndicatorRing`;
  static IS_LOCAL_DARKVISION = `${EXTENSION_ID}/isDarkVision`;
}

export class WallConstants {
  static IS_DOOR = `${EXTENSION_ID}/isDoor`;
  static IS_LOCAL_DOOR = `${EXTENSION_ID}/localDoor`;
  static IS_DOOR_LOCKED = `${EXTENSION_ID}/isDoorLocked`;
  static IS_WINDOW = `${EXTENSION_ID}/isWindow`;
  static IS_VISION_LINE = `${EXTENSION_ID}/isVisionLine`;

  static DOOR_OPEN = `${EXTENSION_ID}/doorOpen`;
  static DISABLED = `${EXTENSION_ID}/disabled`;
  static BLOCKING = `${EXTENSION_ID}/blocking`;
  static DOUBLE_SIDED = `${EXTENSION_ID}/doubleSided`;

  static WALL_DEPTH = `${EXTENSION_ID}/wallDepth`;
  static WALL_VIEWERS = `${EXTENSION_ID}/wallViewers`;
}

export class PlayerConstants {
  static HARDWARE_ACCEL = `${EXTENSION_ID}/hardwareAcceleration`
}

export class SettingsConstants {
  // Other
  static PARTY_OWNER_LINES = `${EXTENSION_ID}/toggleOwnerLines`;

  static TOOL_COLOR = `${EXTENSION_ID}/toolColor`;
  static DOOR_LINE_COLOR = `${EXTENSION_ID}/doorLineColor`;
  static WINDOW_LINE_COLOR = `${EXTENSION_ID}/windowLineColor`;
  static TOOL_STYLE = `${EXTENSION_ID}/toolStyle`;
  static TOOL_WIDTH = `${EXTENSION_ID}/toolWidth`;

  static FOG_PERSISTENCE = `${EXTENSION_ID}/persistence`;
  static FOG_AUTOHIDE = `${EXTENSION_ID}/autoHide`;
  static FOG_TRAILING = `${EXTENSION_ID}/trailingFog`;
  static FOG_PLAYER_SEE_DOORS = `${EXTENSION_ID}/playerDoors`;
  static FOG_DISABLE_VISION = `${EXTENSION_ID}/disableVision`;

  static WALLS_BLOCKING_GM = `${EXTENSION_ID}/passWallsGM`;
  static WALLS_GRID_SNAP = `${EXTENSION_ID}/gridSnapWalls`;
  static WALLS_PERSISTENCE_LIMIT = `${EXTENSION_ID}/persistenceLimit`;

  static MENU_UNIT_CONTEXT = `${EXTENSION_ID}/unitContextMenu`;
  static MENU_WALL_CONTEXT = `${EXTENSION_ID}/wallContextMenu`;

  static DEFAULT_VISION_RANGE = `${EXTENSION_ID}/visionRangeDefault`;
  static DEFAULT_VISION_FALLOFF = `${EXTENSION_ID}/visionFallOffDefault`;
  static DEFAULT_VISION_IN_ANGLE = `${EXTENSION_ID}/visionInAngleDefault`;
  static DEFAULT_VISION_OUT_ANGLE = `${EXTENSION_ID}/visionOutAngleDefault`;
  static DEFAULT_VISION_DARKNESS = `${EXTENSION_ID}/visionDarkDefault`;
  static DEFAULT_VISION_SOURCE = `${EXTENSION_ID}/visionSourceDefault`;
  static DEFAULT_ELEVATION_LEVEL = `${EXTENSION_ID}/defaultElevation`;

  static VISION_PRESETS = `${EXTENSION_ID}/visionPresets`;
  static OTHER_WARNINGS = `${EXTENSION_ID}/showWarnings`;

  static CONTROL_MODE = `${EXTENSION_ID}/controlMode`;
  static ENABLE_CONSOLE_LOGGING = `${EXTENSION_ID}/enableConsoleLogging`;
}

export const getPerPlayerSettingKey = (baseKey: string, playerId?: string | null): string => {
  const trimmedPlayerId = (playerId || '').trim();
  if (!trimmedPlayerId) {
    return baseKey;
  }

  return `${baseKey}/${trimmedPlayerId}`;
};
