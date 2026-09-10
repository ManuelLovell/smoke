import OBR from '@owlbear-rodeo/sdk';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageContainer, PageTitle, Card, ControlLabel, ControlRow, SectionTitle, SmallInput, SmallSelect } from './SharedStyledComponents';
import { SettingsTooltip } from './SettingsTooltip';
import { getSettingsTooltips } from './SettingsTooltipContent';
import { SettingsConstants } from '../helpers/MetadataKeys';
import { Constants } from '../helpers/BSConstants';
import { useSceneStore } from '../helpers/BSCache'; 
import { useSmokeTheme } from '../helpers/ThemeContext';
import { useTranslation } from '../i18n/Translation';

const normalizeHexColor = (raw: unknown, fallback: string): string => (typeof raw === 'string' && /^#[a-f0-9]{6}$/i.test(raw) ? raw : fallback);


export const DefaultsPage = () => {
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();
  const sceneMetadata = useSceneStore((state) => state.sceneMetadata);
  const cacheReady = useSceneStore((state) => state.cacheReady);
  const [toolWidth, setToolWidth] = useState('8');
  const [toolColor, setToolColor] = useState('#000000');
  const [doorLineColor, setDoorLineColor] = useState(Constants.DOORCOLOR);
  const [windowLineColor, setWindowLineColor] = useState(Constants.WINDOWCOLOR);
  const [toolStyle, setToolStyle] = useState<'solid' | 'dotted'>('solid');
  const [defaultVisionRange, setDefaultVisionRange] = useState('30');
  const [defaultVisionSource, setDefaultVisionSource] = useState('0');
  const [defaultVisionDarkness, setDefaultVisionDarkness] = useState('0');
  const [defaultVisionInnerAngle, setDefaultVisionInnerAngle] = useState('360');
  const [defaultVisionOuterAngle, setDefaultVisionOuterAngle] = useState('360');
  const [defaultVisionFalloff, setDefaultVisionFalloff] = useState('0');
  const [defaultElevationLevel, setDefaultElevationLevel] = useState('-10');
  const [controlMode, setControlMode] = useState<'flywheel' | 'roller'>('flywheel');
  const tooltips = getSettingsTooltips(t);

  // Load settings from cached metadata when it changes
  useEffect(() => {
    if (!cacheReady) return;

    const savedToolWidth = sceneMetadata[SettingsConstants.TOOL_WIDTH];
    if (savedToolWidth !== undefined) {
      setToolWidth(String(savedToolWidth));
    }

    const savedToolColor = sceneMetadata[SettingsConstants.TOOL_COLOR];
    setToolColor(normalizeHexColor(savedToolColor, '#000000'));

    const savedDoorLineColor = sceneMetadata[SettingsConstants.DOOR_LINE_COLOR];
    setDoorLineColor(normalizeHexColor(savedDoorLineColor, Constants.DOORCOLOR));

    const savedWindowLineColor = sceneMetadata[SettingsConstants.WINDOW_LINE_COLOR];
    setWindowLineColor(normalizeHexColor(savedWindowLineColor, Constants.WINDOWCOLOR));

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PageContainer theme={theme}>
        <PageTitle theme={theme}>{t('settings.defaultspageTitle')}</PageTitle>

        <Card theme={theme}>

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
              type="color"
              value={toolColor}
              onChange={async (event) => {
                const normalized = normalizeHexColor(event.target.value, '#000000');
                setToolColor(normalized);
                await saveData(SettingsConstants.TOOL_COLOR, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.doorLineColor}>{t('settings.doorLineColor')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="color"
              value={doorLineColor}
              onChange={async (event) => {
                const normalized = normalizeHexColor(event.target.value, Constants.DOORCOLOR);
                setDoorLineColor(normalized);
                await saveData(SettingsConstants.DOOR_LINE_COLOR, normalized);
              }}
            />
          </ControlRow>

          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>
              <SettingsTooltip theme={theme} text={tooltips.windowLineColor}>{t('settings.windowLineColor')}</SettingsTooltip>
            </ControlLabel>
            <SmallInput
              theme={theme}
              type="color"
              value={windowLineColor}
              onChange={async (event) => {
                const normalized = normalizeHexColor(event.target.value, Constants.WINDOWCOLOR);
                setWindowLineColor(normalized);
                await saveData(SettingsConstants.WINDOW_LINE_COLOR, normalized);
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

        </Card>
      </PageContainer>
    </motion.div>
  );
};
