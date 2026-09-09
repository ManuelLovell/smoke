import OBR from '@owlbear-rodeo/sdk';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { PageContainer, PageTitle, Card, ControlLabel, ControlRow, SectionTitle, SmallInput, InlineActionButton } from './SharedStyledComponents';
import { useSmokeTheme } from '../helpers/ThemeContext';
import { useTranslation } from '../i18n/Translation';
import { VisionPreset, loadPresets, addPreset, deletePreset, getMaxPresets } from '../helpers/PresetManager';
import { TokenConstants } from '../helpers/MetadataKeys';

const CompactInput = styled.input<{ theme: any }>`
  ${tw`w-16 p-1 text-sm bg-gray-900 border border-gray-700 text-white rounded`}
  font-family: 'Courier New', monospace;
  
  &:focus {
    outline: none;
    ${tw`border-purple-500 bg-gray-800`}
  }
`;

const IconLabel = styled.div<{ theme: any }>`
  ${tw`flex items-center gap-2`}
  font-size: 0.875rem;
`;

const IconImg = styled.img`
  ${tw`w-4 h-4 opacity-75`}
  filter: brightness(1.1);
`;

const PresetRow = styled.div<{ theme: any }>`
  ${tw`flex items-center gap-3 justify-between`}
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const PresetFormGrid = styled.div<{ theme: any }>`
  ${tw`grid gap-2 mb-3`}
  grid-template-columns: 1fr 1fr;
`;

const PresetDetails = styled.div<{ theme: any }>`
  ${tw`text-xs flex flex-wrap gap-2`}
  margin-top: 4px;
  justify-content: center;
`;

const PresetIcon = styled.img<{ theme: any }>`
  ${tw`w-4 h-4`}
`;

const VISION_RANGE_DEFAULT = '30';
const VISION_SOURCE_DEFAULT = '0';
const VISION_FALLOFF_DEFAULT = '1';
const VISION_DARK_DEFAULT = '0';
const VISION_INNER_ANGLE_DEFAULT = '360';
const VISION_OUTER_ANGLE_DEFAULT = '360';

export const PresetsPage = () => {
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();

  // Preset creation form state
  const [presetName, setPresetName] = useState('');
  const [presetVisionRange, setPresetVisionRange] = useState(VISION_RANGE_DEFAULT);
  const [presetVisionSource, setPresetVisionSource] = useState(VISION_SOURCE_DEFAULT);
  const [presetVisionFalloff, setPresetVisionFalloff] = useState(VISION_FALLOFF_DEFAULT);
  const [presetVisionDark, setPresetVisionDark] = useState(VISION_DARK_DEFAULT);
  const [presetVisionInnerAngle, setPresetVisionInnerAngle] = useState(VISION_INNER_ANGLE_DEFAULT);
  const [presetVisionOuterAngle, setPresetVisionOuterAngle] = useState(VISION_OUTER_ANGLE_DEFAULT);

  // Preset list state
  const [presets, setPresets] = useState<VisionPreset[]>([]);

  // Load presets on mount
  useEffect(() => {
    const loadStoredPresets = async () => {
      const stored = await loadPresets();
      setPresets(stored);
    };
    void loadStoredPresets();
  }, []);

  const handleSavePreset = async () => {
    const name = presetName.trim();

    if (!name) {
      await OBR.notification.show(t('presets.notifications.enterName'), 'WARNING');
      return;
    }

    const newPreset: VisionPreset = {
      id: crypto.randomUUID(),
      name,
      visionRange: presetVisionRange,
      visionSourceRange: presetVisionSource,
      visionFallOff: presetVisionFalloff,
      visionDark: presetVisionDark,
      visionInAngle: presetVisionInnerAngle,
      visionOutAngle: presetVisionOuterAngle,
    };

    const result = await addPreset(newPreset);

    if (!result.success) {
      await OBR.notification.show(result.message, 'WARNING');
      return;
    }

    const updated = await loadPresets();
    setPresets(updated);

    // Clear form
    setPresetName('');
    setPresetVisionRange(VISION_RANGE_DEFAULT);
    setPresetVisionSource(VISION_SOURCE_DEFAULT);
    setPresetVisionFalloff(VISION_FALLOFF_DEFAULT);
    setPresetVisionDark(VISION_DARK_DEFAULT);
    setPresetVisionInnerAngle(VISION_INNER_ANGLE_DEFAULT);
    setPresetVisionOuterAngle(VISION_OUTER_ANGLE_DEFAULT);

    await OBR.notification.show(t('presets.notifications.saved', { name }), 'SUCCESS');
  };

  const handleApplyPreset = async (preset: VisionPreset) => {
    const selection = await OBR.player.getSelection();

    if (!selection || selection.length === 0) {
      await OBR.notification.show(t('presets.notifications.selectTokens'), 'WARNING');
      return;
    }

    await OBR.scene.items.updateItems(selection, (items) => {
      for (const item of items) {
        item.metadata[TokenConstants.VISION_RANGE] = preset.visionRange;
        item.metadata[TokenConstants.VISION_DARKNESS] = preset.visionDark;
        item.metadata[TokenConstants.VISION_SOURCE] = preset.visionSourceRange;
        item.metadata[TokenConstants.VISION_FALLOFF] = preset.visionFallOff;
        item.metadata[TokenConstants.VISION_IN_ANGLE] = preset.visionInAngle;
        item.metadata[TokenConstants.VISION_OUT_ANGLE] = preset.visionOutAngle;
      }
    });

    await OBR.notification.show(t('presets.notifications.applied', { name: preset.name, count: selection.length }), 'SUCCESS');
  };

  const handleDeletePreset = async (presetId: string) => {
    await deletePreset(presetId);
    const updated = await loadPresets();
    setPresets(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PageContainer theme={theme}>
        <PageTitle theme={theme}>{t('presets.pageTitle')}</PageTitle>

        {/* Preset Creation */}
        <Card theme={theme}>
          <ControlRow theme={theme}>
            <ControlLabel theme={theme}>{t('presets.presetName')}</ControlLabel>
            <SmallInput
              theme={theme}
              type="text"
              placeholder={t('presets.namePlaceholder')}
              maxLength={30}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </ControlRow>

          <PresetFormGrid theme={theme}>
            <PresetRow theme={theme}>
              <IconLabel theme={theme}>
                <IconImg src="/visionRange.svg" alt={t('presets.visionRange')} />
                {t('presets.visionRange')}
              </IconLabel>
              <CompactInput
                theme={theme}
                type="number"
                min={0}
                max={999}
                value={presetVisionRange}
                onChange={(e) => setPresetVisionRange(e.target.value)}
              />
            </PresetRow>

            <PresetRow theme={theme}>
              <IconLabel theme={theme}>
                <IconImg src="/visionBumper.svg" alt={t('presets.collisionDistance')} />
                {t('presets.collisionDistance')}
              </IconLabel>
              <CompactInput
                theme={theme}
                type="number"
                min={0}
                max={999}
                value={presetVisionSource}
                onChange={(e) => setPresetVisionSource(e.target.value)}
              />
            </PresetRow>

            <PresetRow theme={theme}>
              <IconLabel theme={theme}>
                <IconImg src="/visionInner.svg" alt={t('presets.innerAngle')} />
                {t('presets.innerAngle')}
              </IconLabel>
              <CompactInput
                theme={theme}
                type="number"
                min={-360}
                max={360}
                value={presetVisionInnerAngle}
                onChange={(e) => setPresetVisionInnerAngle(e.target.value)}
              />
            </PresetRow>

            <PresetRow theme={theme}>
              <IconLabel theme={theme}>
                <IconImg src="/visionOuter.svg" alt={t('presets.outerAngle')} />
                {t('presets.outerAngle')}
              </IconLabel>
              <CompactInput
                theme={theme}
                type="number"
                min={-360}
                max={360}
                value={presetVisionOuterAngle}
                onChange={(e) => setPresetVisionOuterAngle(e.target.value)}
              />
            </PresetRow>

            <PresetRow theme={theme}>
              <IconLabel theme={theme}>
                <IconImg src="/visionFalloff.svg" alt={t('presets.falloff')} />
                {t('presets.falloff')}
              </IconLabel>
              <CompactInput
                theme={theme}
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={presetVisionFalloff}
                onChange={(e) => setPresetVisionFalloff(e.target.value)}
              />
            </PresetRow>

            <PresetRow theme={theme}>
              <IconLabel theme={theme}>
                <IconImg src="/darkvision.svg" alt={t('presets.darkvision')} />
                {t('presets.darkvision')}
              </IconLabel>
              <CompactInput
                theme={theme}
                type="number"
                min={0}
                max={999}
                value={presetVisionDark}
                onChange={(e) => setPresetVisionDark(e.target.value)}
              />
            </PresetRow>
          </PresetFormGrid>

          <ControlRow theme={theme}>
            ({presets.length}/{getMaxPresets()})
            <InlineActionButton
              theme={theme}
              onClick={() => void handleSavePreset()}
            >
              {t('presets.savePreset')}
            </InlineActionButton>
          </ControlRow>
        </Card>

        {/* Preset List */}
        <Card theme={theme}>
          <SectionTitle theme={theme}>{t('presets.savedPresets')}</SectionTitle>

          {presets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              {t('presets.noPresets')}
            </div>
          ) : (
            <div>
              {presets.map((preset) => (
                <div key={preset.id} style={{ marginBottom: '12px', padding: '10px', backgroundColor: `rgba(0, 0, 0, 0.2)`, borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem' }}>{preset.name}</div>
                      <PresetDetails theme={theme}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <PresetIcon src="/visionRange.svg" alt={t('presets.range')} />
                          {preset.visionRange}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <PresetIcon src="/visionBumper.svg" alt={t('presets.collision')} />
                          {preset.visionSourceRange}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <PresetIcon src="/visionInner.svg" alt={t('presets.inner')} />
                          {preset.visionInAngle}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <PresetIcon src="/visionOuter.svg" alt={t('presets.outer')} />
                          {preset.visionOutAngle}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <PresetIcon src="/visionFalloff.svg" alt={t('presets.falloff')} />
                          {preset.visionFallOff}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <PresetIcon src="/darkvision.svg" alt={t('presets.dark')} />
                          {preset.visionDark}
                        </span>
                      </PresetDetails>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <InlineActionButton
                        theme={theme}
                        onClick={() => void handleApplyPreset(preset)}
                        style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                      >
                        {t('presets.apply')}
                      </InlineActionButton>
                      <InlineActionButton
                        theme={theme}
                        onClick={() => void handleDeletePreset(preset.id)}
                        style={{ padding: '4px 8px' }}
                      >
                        <Trash2 size={14} />
                      </InlineActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageContainer>
    </motion.div>
  );
};
