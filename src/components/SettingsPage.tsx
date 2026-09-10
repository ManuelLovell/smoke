import OBR from '@owlbear-rodeo/sdk';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { PageContainer, PageTitle, Card, ControlLabel, ControlRow, SectionTitle, SmallInput, SmallSelect, InlineActionButton, InlineActionSubButton } from './SharedStyledComponents';
import { ToggleControl } from './ToggleControl';
import { SettingsTooltip } from './SettingsTooltip';
import { getSettingsTooltips } from './SettingsTooltipContent';
import { SettingsConstants } from '../helpers/MetadataKeys';
import { Constants } from '../helpers/BSConstants';
import { useSceneStore } from '../helpers/BSCache'; 
import { useSmokeTheme } from '../helpers/ThemeContext';
import { useTranslation } from '../i18n/Translation';
import { SMOKEMACHINE } from '../scripts/smokeProcessor';
import {
  makeAllWallsDoubleSided,
  blockAllWalls,
  unblockAllWalls,
  lockAllLines,
  unlockAllLines,
} from '../helpers/WallOperations';
import { SetupUnitContextMenu, SetupWallContextMenu } from './ContextMenuComponent';


export const SettingsPage = () => {
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();
  const sceneMetadata = useSceneStore((state) => state.sceneMetadata);
  const fogFilled = useSceneStore((state) => state.fogFilled);
  const cacheReady = useSceneStore((state) => state.cacheReady);
  const partyData = useSceneStore((state) => state.partyData);
  const playerData = useSceneStore((state) => state.playerData);
  const previewSelectRef = useRef<HTMLSelectElement>(null);

  const [partyOwnerLines, setPartyOwnerLines] = useState(false);
  const [fogPersistence, setFogPersistence] = useState(false);
  const [fogAutoHide, setFogAutoHide] = useState(false);
  const [fogTrailing, setFogTrailing] = useState(false);
  const [fogPlayerSeeDoors, setFogPlayerSeeDoors] = useState(false);
  const [fogDisableVision, setFogDisableVision] = useState(false);
  const [fogFilledState, setFogFilledState] = useState(fogFilled);
  const [wallsBlockingGm, setWallsBlockingGm] = useState(false);
  const [menuUnitContext, setMenuUnitContext] = useState(false);
  const [menuWallContext, setMenuWallContext] = useState(false);
  const [otherWarnings, setOtherWarnings] = useState(false);
  const [enableConsoleLogging, setEnableConsoleLogging] = useState(false);
  const [wallsGridSnap, setWallsGridSnap] = useState('10');
  const [wallsPersistenceLimit, setWallsPersistenceLimit] = useState('100');
  const [toolWidth, setToolWidth] = useState('8');
  const [toolColor, setToolColor] = useState('#000000');
  const [toolStyle, setToolStyle] = useState<'solid' | 'dotted'>('solid');
  const [defaultVisionRange, setDefaultVisionRange] = useState('30');
  const [defaultVisionSource, setDefaultVisionSource] = useState('0');
  const [defaultVisionDarkness, setDefaultVisionDarkness] = useState('0');
  const [defaultVisionInnerAngle, setDefaultVisionInnerAngle] = useState('360');
  const [defaultVisionOuterAngle, setDefaultVisionOuterAngle] = useState('360');
  const [defaultVisionFalloff, setDefaultVisionFalloff] = useState('0');
  const [defaultElevationLevel, setDefaultElevationLevel] = useState('-10');
  const [controlMode, setControlMode] = useState<'flywheel' | 'roller'>('flywheel');
  const [selectedPreviewPlayerId, setSelectedPreviewPlayerId] = useState<string>('');
  const tooltips = getSettingsTooltips(t);

  // Initialize preview player selection
  useEffect(() => {
    if (!playerData?.id) return;
    setSelectedPreviewPlayerId(playerData.id);
  }, [playerData?.id]);

  // Sync preview selection with DOM and trigger processor
  useEffect(() => {
    if (previewSelectRef.current) {
      previewSelectRef.current.value = selectedPreviewPlayerId;
    }
  }, [selectedPreviewPlayerId]);

  // Load settings from cached metadata when it changes
  useEffect(() => {
    if (!cacheReady) return;

    if (sceneMetadata[SettingsConstants.PARTY_OWNER_LINES] !== undefined) {
      setPartyOwnerLines(sceneMetadata[SettingsConstants.PARTY_OWNER_LINES] as boolean);
    }

    const persistenceEnabled = sceneMetadata[SettingsConstants.FOG_PERSISTENCE] === true;
    setFogPersistence(persistenceEnabled);

    if (sceneMetadata[SettingsConstants.FOG_AUTOHIDE] !== undefined) {
      setFogAutoHide(sceneMetadata[SettingsConstants.FOG_AUTOHIDE] as boolean);
    }

    const trailingEnabled = sceneMetadata[SettingsConstants.FOG_TRAILING] === true;
    setFogTrailing(persistenceEnabled ? trailingEnabled : false);

    if (sceneMetadata[SettingsConstants.FOG_PLAYER_SEE_DOORS] !== undefined) {
      setFogPlayerSeeDoors(sceneMetadata[SettingsConstants.FOG_PLAYER_SEE_DOORS] as boolean);
    }

    if (sceneMetadata[SettingsConstants.FOG_DISABLE_VISION] !== undefined) {
      setFogDisableVision(sceneMetadata[SettingsConstants.FOG_DISABLE_VISION] as boolean);
    }

    if (sceneMetadata[SettingsConstants.WALLS_BLOCKING_GM] !== undefined) {
      setWallsBlockingGm(sceneMetadata[SettingsConstants.WALLS_BLOCKING_GM] as boolean);
    }

    if (sceneMetadata[SettingsConstants.MENU_UNIT_CONTEXT] !== undefined) {
      setMenuUnitContext(sceneMetadata[SettingsConstants.MENU_UNIT_CONTEXT] as boolean);
    }

    if (sceneMetadata[SettingsConstants.MENU_WALL_CONTEXT] !== undefined) {
      setMenuWallContext(sceneMetadata[SettingsConstants.MENU_WALL_CONTEXT] as boolean);
    }

    if (sceneMetadata[SettingsConstants.OTHER_WARNINGS] !== undefined) {
      setOtherWarnings(sceneMetadata[SettingsConstants.OTHER_WARNINGS] as boolean);
    }

    if (sceneMetadata[SettingsConstants.ENABLE_CONSOLE_LOGGING] !== undefined) {
      setEnableConsoleLogging(sceneMetadata[SettingsConstants.ENABLE_CONSOLE_LOGGING] as boolean);
    }

    const gridSnap = sceneMetadata[SettingsConstants.WALLS_GRID_SNAP];
    if (gridSnap !== undefined) {
      setWallsGridSnap(String(gridSnap));
    }

    const persistenceLimit = sceneMetadata[SettingsConstants.WALLS_PERSISTENCE_LIMIT];
    if (persistenceLimit !== undefined) {
      setWallsPersistenceLimit(String(persistenceLimit));
    }

    const savedToolWidth = sceneMetadata[SettingsConstants.TOOL_WIDTH];
    if (savedToolWidth !== undefined) {
      setToolWidth(String(savedToolWidth));
    }

    const savedToolColor = sceneMetadata[SettingsConstants.TOOL_COLOR];
    if (typeof savedToolColor === 'string' && savedToolColor.length > 0) {
      setToolColor(savedToolColor);
    }

    const savedToolStyle = sceneMetadata[SettingsConstants.TOOL_STYLE] as unknown;
    if (Array.isArray(savedToolStyle)) {
      setToolStyle(savedToolStyle.length > 0 ? 'dotted' : 'solid');
    }

    const savedVisionRange = sceneMetadata[SettingsConstants.DEFAULT_VISION_RANGE];
    if (savedVisionRange !== undefined) {
      setDefaultVisionRange(String(savedVisionRange));
    }

    const savedVisionSource = sceneMetadata[SettingsConstants.DEFAULT_VISION_SOURCE];
    if (savedVisionSource !== undefined) {
      setDefaultVisionSource(String(savedVisionSource));
    }

    const savedVisionDarkness = sceneMetadata[SettingsConstants.DEFAULT_VISION_DARKNESS];
    if (savedVisionDarkness !== undefined) {
      setDefaultVisionDarkness(String(savedVisionDarkness));
    }

    const savedVisionInnerAngle = sceneMetadata[SettingsConstants.DEFAULT_VISION_IN_ANGLE];
    if (savedVisionInnerAngle !== undefined) {
      setDefaultVisionInnerAngle(String(savedVisionInnerAngle));
    }

    const savedVisionOuterAngle = sceneMetadata[SettingsConstants.DEFAULT_VISION_OUT_ANGLE];
    if (savedVisionOuterAngle !== undefined) {
      setDefaultVisionOuterAngle(String(savedVisionOuterAngle));
    }

    const savedVisionFalloff = sceneMetadata[SettingsConstants.DEFAULT_VISION_FALLOFF];
    if (savedVisionFalloff !== undefined) {
      setDefaultVisionFalloff(String(savedVisionFalloff));
    }

    const savedDefaultElevation = sceneMetadata[SettingsConstants.DEFAULT_ELEVATION_LEVEL];
    if (savedDefaultElevation !== undefined) {
      setDefaultElevationLevel(String(savedDefaultElevation));
    }

    const savedControlMode = sceneMetadata[SettingsConstants.CONTROL_MODE];
    if (savedControlMode === 'roller') {
      setControlMode('roller');
    } else {
      setControlMode('flywheel');
    }
  }, [cacheReady, sceneMetadata]);

  const saveData = async (key: string, value: unknown) => {
      await OBR.scene.setMetadata({ [key]: value });
  };

  const clampIntegerValue = (raw: string, min: number, max: number, fallback: number): string => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      return String(fallback);
    }

    return String(Math.max(min, Math.min(max, parsed)));
  };

  const clampFloatValue = (raw: string, min: number, max: number, fallback: number): string => {
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed)) {
      return String(fallback);
    }

    return String(Math.max(min, Math.min(max, parsed)));
  };

  const handlePersistenceToggle = async (value: boolean) => {
    setFogPersistence(value);
    await saveData(SettingsConstants.FOG_PERSISTENCE, value);

    if (!value) {
      setFogTrailing(false);
      await saveData(SettingsConstants.FOG_TRAILING, false);
    }
  };

  const handlePersistenceReset = async () => {
    await OBR.broadcast.sendMessage(Constants.RESETPERSISTID, true, { destination: 'ALL' });
  };

  const handlePreviewPlayerChange = async (playerId: string) => {
    setSelectedPreviewPlayerId(playerId);
    await SMOKEMACHINE.Run();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PageContainer theme={theme}>
        <PageTitle theme={theme}>{t('settings.pageTitle')}</PageTitle>

        <Card theme={theme}>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.fogFilled}>{t('settings.fogFilled')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.fogFilled')}
              isOn={fogFilledState}
              onChange={async (value) => {
                setFogFilledState(value);
                await OBR.scene.fog.setFilled(value);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.fogDisableVision}>{t('settings.fogDisableVision')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.fogDisableVision')}
              isOn={fogDisableVision}
              onChange={async (value) => {
                setFogDisableVision(value);
                await saveData(SettingsConstants.FOG_DISABLE_VISION, value);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.partyOwnerLines}>{t('settings.partyOwnerLines')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.partyOwnerLines')}
              isOn={partyOwnerLines}
              onChange={async (value) => {
                setPartyOwnerLines(value);
                await saveData(SettingsConstants.PARTY_OWNER_LINES, value);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.fogAutoHide}>{t('settings.fogAutoHide')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.fogAutoHide')}
              isOn={fogAutoHide}
              onChange={async (value) => {
                setFogAutoHide(value);
                await saveData(SettingsConstants.FOG_AUTOHIDE, value);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.fogPlayerSeeDoors}>{t('settings.fogPlayerSeeDoors')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.fogPlayerSeeDoors')}
              isOn={fogPlayerSeeDoors}
              onChange={async (value) => {
                setFogPlayerSeeDoors(value);
                await saveData(SettingsConstants.FOG_PLAYER_SEE_DOORS, value);
              }}
            />
          </ControlRow>
          
          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.wallsBlockingGm}>{t('settings.wallsBlockingGm')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.wallsBlockingGm')}
              isOn={wallsBlockingGm}
              onChange={async (value) => {
                setWallsBlockingGm(value);
                await saveData(SettingsConstants.WALLS_BLOCKING_GM, value);
              }}
            />
          </ControlRow>


          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.wallsGridSnap}>{t('settings.wallsGridSnap')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={1}
              max={100}
              value={wallsGridSnap}
              onChange={(event) => setWallsGridSnap(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(wallsGridSnap, 1, 100, 10);
                setWallsGridSnap(normalized);
                await saveData(SettingsConstants.WALLS_GRID_SNAP, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.defaultElevationLevel}>{t('settings.defaultElevationLevel')}</SettingsTooltip>
            </ControlLabel>
            <SmallSelect
              theme={theme}
              value={defaultElevationLevel}
              onChange={async (event) => {
                const nextValue = event.target.value;
                setDefaultElevationLevel(nextValue);
                await saveData(SettingsConstants.DEFAULT_ELEVATION_LEVEL, nextValue);
              }}
            >
              <option value="-10">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </SmallSelect>
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={t('settings.preview.tooltip')}>{t('settings.preview.label')}</SettingsTooltip>
            </ControlLabel>
            <SmallSelect
              ref={previewSelectRef}
              id="preview_select"
              theme={theme}
              value={selectedPreviewPlayerId}
              onChange={(event) => void handlePreviewPlayerChange(event.target.value)}
            >
              {playerData && (
                <option value={playerData.id}>
                  {t('settings.preview.self')}
                </option>
              )}
              {partyData.map((player) => (
                <option key={player.id} value={player.id}>
                  {t('settings.preview.player', { name: player.name })}
                </option>
              ))}
            </SmallSelect>
          </ControlRow>

          <SectionTitle theme={theme}>{t('settings.Persistence')}</SectionTitle>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.fogPersistence}>{t('settings.fogPersistence')}</SettingsTooltip>
            </ControlLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InlineActionSubButton
                theme={theme}
                onClick={() => void handlePersistenceReset()}
                aria-label={t('settings.persistence.reset')}
                title={t('settings.persistence.reset')}
              >
                <RotateCcw size={14} />
              </InlineActionSubButton>
              <ToggleControl
                label={t('settings.fogPersistence')}
                isOn={fogPersistence}
                onChange={(value) => {
                  void handlePersistenceToggle(value);
                }}
              />
            </div>
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.wallsPersistenceLimit}>{t('settings.wallsPersistenceLimit')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={1}
              max={999}
              value={wallsPersistenceLimit}
              onChange={(event) => setWallsPersistenceLimit(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(wallsPersistenceLimit, 1, 999, 100);
                setWallsPersistenceLimit(normalized);
                await saveData(SettingsConstants.WALLS_PERSISTENCE_LIMIT, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.fogTrailing}>{t('settings.fogTrailing')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.fogTrailing')}
              isOn={fogTrailing}
              disabled={!fogPersistence}
              onChange={async (value) => {
                if (!fogPersistence) return;
                setFogTrailing(value);
                await saveData(SettingsConstants.FOG_TRAILING, value);
              }}
            />
          </ControlRow>

          <SectionTitle theme={theme}>{t('settings.ContextMenus')}</SectionTitle>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.menuUnitContext}>{t('settings.menuUnitContext')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.menuUnitContext')}
              isOn={menuUnitContext}
              onChange={async (value) => {
                setMenuUnitContext(value);
                await saveData(SettingsConstants.MENU_UNIT_CONTEXT, value);
                SetupUnitContextMenu(value);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.menuWallContext}>{t('settings.menuWallContext')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.menuWallContext')}
              isOn={menuWallContext}
              onChange={async (value) => {
                setMenuWallContext(value);
                await saveData(SettingsConstants.MENU_WALL_CONTEXT, value);
                SetupWallContextMenu(value);
              }}
            />
          </ControlRow>

          <SectionTitle theme={theme}>{t('settings.ToolConfiguration')}</SectionTitle>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={t('settings.controlMode.tooltip')}>{t('settings.controlMode.label')}</SettingsTooltip>
            </ControlLabel>
            <SmallSelect
              theme={theme}
              value={controlMode}
              onChange={async (event) => {
                const nextValue = event.target.value as 'flywheel' | 'roller';
                setControlMode(nextValue);
                await saveData(SettingsConstants.CONTROL_MODE, nextValue);
              }}
            >
              <option value="flywheel">{t('settings.controlMode.flywheel')}</option>
              <option value="roller">{t('settings.controlMode.roller')}</option>
            </SmallSelect>
          </ControlRow>
          
          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.toolColor}>{t('settings.toolColor')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="text"
              value={toolColor}
              onChange={(event) => setToolColor(event.target.value)}
              onBlur={async () => {
                const normalized = /^#[a-f0-9]{6}$/i.test(toolColor) ? toolColor : '#000000';
                setToolColor(normalized);
                await saveData(SettingsConstants.TOOL_COLOR, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.toolStyle}>{t('settings.toolStyle')}</SettingsTooltip>
            </ControlLabel>
            <SmallSelect
              theme={theme}
              value={toolStyle}
              onChange={async (event) => {
                const styleValue = event.target.value as 'solid' | 'dotted';
                setToolStyle(styleValue);
                await saveData(SettingsConstants.TOOL_STYLE, styleValue === 'solid' ? [] : [25, 25]);
              }}
            >
              <option value="solid">{t('settings.toolStyleSolid')}</option>
              <option value="dotted">{t('settings.toolStyleDotted')}</option>
            </SmallSelect>
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.toolWidth}>{t('settings.toolWidth')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={1}
              max={100}
              value={toolWidth}
              onChange={(event) => setToolWidth(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(toolWidth, 1, 100, 8);
                setToolWidth(normalized);
                await saveData(SettingsConstants.TOOL_WIDTH, normalized);
              }}
            />
          </ControlRow>

          <SectionTitle theme={theme}>{t('settings.VisionDefaults')}</SectionTitle>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.defaultVisionRange}>{t('settings.defaultVisionRange')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={0}
              max={999}
              value={defaultVisionRange}
              onChange={(event) => setDefaultVisionRange(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(defaultVisionRange, 0, 999, 30);
                setDefaultVisionRange(normalized);
                await saveData(SettingsConstants.DEFAULT_VISION_RANGE, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.defaultVisionSource}>{t('settings.defaultVisionSource')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={0}
              max={999}
              value={defaultVisionSource}
              onChange={(event) => setDefaultVisionSource(event.target.value)}
              onBlur={async () => {
                const normalized = clampFloatValue(defaultVisionSource, 0, 999, 0);
                setDefaultVisionSource(normalized);
                await saveData(SettingsConstants.DEFAULT_VISION_SOURCE, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.defaultVisionDarkness}>{t('settings.defaultVisionDarkness')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={0}
              max={999}
              value={defaultVisionDarkness}
              onChange={(event) => setDefaultVisionDarkness(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(defaultVisionDarkness, 0, 999, 0);
                setDefaultVisionDarkness(normalized);
                await saveData(SettingsConstants.DEFAULT_VISION_DARKNESS, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.defaultVisionInnerAngle}>{t('settings.defaultVisionInnerAngle')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={-360}
              max={360}
              value={defaultVisionInnerAngle}
              onChange={(event) => setDefaultVisionInnerAngle(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(defaultVisionInnerAngle, -360, 360, 360);
                setDefaultVisionInnerAngle(normalized);
                await saveData(SettingsConstants.DEFAULT_VISION_IN_ANGLE, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.defaultVisionOuterAngle}>{t('settings.defaultVisionOuterAngle')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={-360}
              max={360}
              value={defaultVisionOuterAngle}
              onChange={(event) => setDefaultVisionOuterAngle(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(defaultVisionOuterAngle, -360, 360, 360);
                setDefaultVisionOuterAngle(normalized);
                await saveData(SettingsConstants.DEFAULT_VISION_OUT_ANGLE, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.defaultVisionFalloff}>{t('settings.defaultVisionFalloff')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={defaultVisionFalloff}
              onChange={(event) => setDefaultVisionFalloff(event.target.value)}
              onBlur={async () => {
                const normalized = clampFloatValue(defaultVisionFalloff, 0, 10, 0);
                setDefaultVisionFalloff(normalized);
                await saveData(SettingsConstants.DEFAULT_VISION_FALLOFF, normalized);
              }}
            />
          </ControlRow>

          <SectionTitle theme={theme}>{t('settings.Other')}</SectionTitle>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.otherWarnings}>{t('settings.otherWarnings')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.otherWarnings')}
              isOn={otherWarnings}
              onChange={async (value) => {
                setOtherWarnings(value);
                await saveData(SettingsConstants.OTHER_WARNINGS, value);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.enableConsoleLogging}>{t('settings.enableConsoleLogging')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.enableConsoleLogging')}
              isOn={enableConsoleLogging}
              onChange={async (value) => {
                setEnableConsoleLogging(value);
                await saveData(SettingsConstants.ENABLE_CONSOLE_LOGGING, value);
              }}
            />
          </ControlRow>

          <SectionTitle theme={theme}>{t('settings.wallOperations.title')}</SectionTitle>

          <ControlRow theme={theme}>
            <InlineActionButton
              theme={theme}
              onClick={() => void makeAllWallsDoubleSided()}
              title={t('settings.wallOperations.doubleSided.title')}
            >
              {t('settings.wallOperations.doubleSided.label')}
            </InlineActionButton>
          </ControlRow>

          <ControlRow theme={theme}>
            <InlineActionButton
              theme={theme}
              onClick={() => void blockAllWalls()}
              title={t('settings.wallOperations.block.title')}
            >
              {t('settings.wallOperations.block.label')}
            </InlineActionButton>
            <InlineActionButton
              theme={theme}
              onClick={() => void unblockAllWalls()}
              title={t('settings.wallOperations.unblock.title')}
            >
              {t('settings.wallOperations.unblock.label')}
            </InlineActionButton>
          </ControlRow>

          <ControlRow theme={theme}>
            <InlineActionButton
              theme={theme}
              onClick={() => void lockAllLines()}
              title={t('settings.wallOperations.lock.title')}
            >
              {t('settings.wallOperations.lock.label')}
            </InlineActionButton>
            <InlineActionButton
              theme={theme}
              onClick={() => void unlockAllLines()}
              title={t('settings.wallOperations.unlock.title')}
            >
              {t('settings.wallOperations.unlock.label')}
            </InlineActionButton>
          </ControlRow>

        </Card>
      </PageContainer>
    </motion.div>
  );
};
