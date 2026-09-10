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
  const playerData = useSceneStore((state) => state.playerData);
  const fogFilled = useSceneStore((state) => state.fogFilled);
  const cacheReady = useSceneStore((state) => state.cacheReady);
  const partyData = useSceneStore((state) => state.partyData);
  const gridSnap = useSceneStore((state) => state.gridSnap);
  const setGridSnap = useSceneStore((state) => state.setGridSnap);
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
  const [gridSnapDistance, setGridSnapDistance] = useState('10');
  const [wallsPersistenceLimit, setWallsPersistenceLimit] = useState('100');
  const [defaultElevationLevel, setDefaultElevationLevel] = useState('-10');
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

    const sceneGridSnap = sceneMetadata[SettingsConstants.GRID_SNAP];
    if (typeof sceneGridSnap === 'boolean') {
      setGridSnap(sceneGridSnap);
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

    const gridSnapDistance = sceneMetadata[SettingsConstants.GRID_SNAP_DISTANCE];
    if (gridSnapDistance !== undefined) {
      setGridSnapDistance(String(gridSnapDistance));
    }

    const persistenceLimit = sceneMetadata[SettingsConstants.WALLS_PERSISTENCE_LIMIT];
    if (persistenceLimit !== undefined) {
      setWallsPersistenceLimit(String(persistenceLimit));
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
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.gridSnap}>{t('settings.gridSnap')}</SettingsTooltip>
            </ControlLabel>
            <ToggleControl
              label={t('settings.gridSnap')}
              isOn={gridSnap}
              onChange={async (value) => {
                setGridSnap(value);
                await saveData(SettingsConstants.GRID_SNAP, value);
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
              value={gridSnapDistance}
              onChange={(event) => setGridSnapDistance(event.target.value)}
              onBlur={async () => {
                const normalized = clampIntegerValue(gridSnapDistance, 1, 100, 10);
                const numericValue = Number.parseInt(normalized, 10);
                setGridSnapDistance(normalized);
                await saveData(SettingsConstants.GRID_SNAP_DISTANCE, numericValue);
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
