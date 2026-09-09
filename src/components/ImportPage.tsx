import OBR from '@owlbear-rodeo/sdk';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PageContainer, PageTitle, Button, Card, ControlRow, InlineActionButton, ModalText, SmallInput, SmallSelect, SubControlHint, SubControlLabel, SubControlRow, StyledCheckbox, SectionTitle } from './SharedStyledComponents';
import { PopupModal } from './PopupModal';
import { useSceneStore } from '../helpers/BSCache';
import { useSmokeTheme } from '../helpers/ThemeContext';
import { useTranslation } from '../i18n/Translation';
import { convertOBRFogToSmokeObstructions, convertSmokeObstructionsToOBRFog } from '../helpers/WallOperations';

type ImportFormat = 'scene' | 'foundry' | 'uvtt';

const fileHasImportableWalls = (input: unknown): boolean => {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const parsedInput = input as {
    walls?: unknown[];
    line_of_sight?: unknown[];
    objects_line_of_sight?: unknown[];
  };

  return Boolean(
    (Array.isArray(parsedInput.walls) && parsedInput.walls.length > 0)
    || (Array.isArray(parsedInput.line_of_sight) && parsedInput.line_of_sight.length > 0)
    || (Array.isArray(parsedInput.objects_line_of_sight) && parsedInput.objects_line_of_sight.length > 0)
  );
};

const readAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('import.error.readFile'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('import.error.readFile'));
    reader.readAsText(file);
  });
};

export const ImportPage = () => {
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();
  const items = useSceneStore((state) => state.items);

  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState(t('import.fileButtonDefault'));
  const [importErrors, setImportErrors] = useState('');
  const [importObject, setImportObject] = useState<unknown>(null);
  const [importFormat, setImportFormat] = useState<ImportFormat>('scene');
  const [selectedMapId, setSelectedMapId] = useState('');
  const [dpiAutodetect, setDpiAutodetect] = useState(true);
  const [importDpi, setImportDpi] = useState('150');
  const [isImporting, setIsImporting] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);

  const mapOptions = useMemo(() => {
    return items
      .filter((item) => item.layer === 'MAP')
        .map((item) => ({ id: item.id, name: item.name || t('import.unnamedMap') }));
  }, [items]);

  const canImport = useMemo(() => {
    if (!importObject || isImporting) {
      return false;
    }

    if (importFormat === 'scene') {
      return true;
    }

    return selectedMapId.length > 0;
  }, [importObject, importFormat, isImporting, selectedMapId]);

  useEffect(() => {
    if (mapOptions.length === 0) {
      setSelectedMapId('');
      return;
    }

    const selectedStillExists = mapOptions.some((map) => map.id === selectedMapId);
    if (!selectedStillExists) {
      setSelectedMapId(mapOptions[0].id);
    }
  }, [mapOptions, selectedMapId]);

  const handleImportClick = () => {
    if (!canImport) {
      return;
    }

    setIsImportConfirmOpen(true);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImportObject(null);
      setSelectedFileName(t('import.fileButtonDefault'));
      return;
    }

    setImportErrors('');
    setImportObject(null);
    setSelectedFileName(file.name);

    try {
      const contents = await readAsText(file);
      const parsedData = JSON.parse(contents) as unknown;

      if (!fileHasImportableWalls(parsedData)) {
        const message = t('import.error.noWalls');
        setImportErrors(message);
        await OBR.notification.show(`Smoke: ${message}`, 'ERROR');
        return;
      }

      setImportObject(parsedData);
      await OBR.notification.show(t('import.success.loaded'), 'SUCCESS');
    } catch {
      const message = t('import.error.invalidJson');
      setImportErrors(message);
      await OBR.notification.show(`Smoke: ${message}`, 'ERROR');
    }
  };

  const runImport = async () => {
    if (!importObject) {
      return;
    }

    setIsImporting(true);
    setImportErrors('');

    try {
      const { FogImportEntry, ImportScene } = await import('../scripts/importUVTT');

      if (importFormat === 'scene') {
        await ImportScene(importObject as any, document.createElement('div'));
      } else {
        const parsedDpi = Number.parseInt(importDpi, 10);
        const dpiValue = dpiAutodetect || Number.isNaN(parsedDpi) ? 0 : parsedDpi;
        await FogImportEntry(importFormat, importObject, dpiValue, selectedMapId);
      }
    } catch (error) {
      const message = error instanceof Error
        ? (error.message === 'import.error.readFile' ? t('import.error.readFile') : error.message)
        : t('import.error.unexpected');
      setImportErrors(message);
      await OBR.notification.show(`Smoke: ${message}`, 'ERROR');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    setIsImportConfirmOpen(false);
    await runImport();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PageContainer theme={theme}>
        <PageTitle theme={theme}>{t('nav.import')}</PageTitle>

        <input
          ref={importFileInputRef}
          type="file"
          accept=".dd2vtt,.ddvtt,.uvtt,.fvtt,.json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Card theme={theme}>
          <SubControlHint theme={theme}>
            {t('import.description')}
          </SubControlHint>

          <SubControlRow theme={theme}>
            <SubControlLabel theme={theme}>{selectedFileName}</SubControlLabel>
            <Button theme={theme} variant="secondary" onClick={() => importFileInputRef.current?.click()}>
              {t('import.fileButton')}
            </Button>
          </SubControlRow>

          <SubControlRow theme={theme}>
            <SubControlLabel theme={theme}>{t('import.formatLabel')}</SubControlLabel>
            <SmallSelect
              theme={theme}
              value={importFormat}
              onChange={(event) => setImportFormat(event.target.value as ImportFormat)}
            >
              <option value="scene">{t('import.format.scene')}</option>
              <option value="foundry">{t('import.format.foundry')}</option>
              <option value="uvtt">{t('import.format.uvtt')}</option>
            </SmallSelect>
          </SubControlRow>

          <SubControlRow theme={theme}>
            <SubControlLabel theme={theme}>{t('import.alignmentMap')}</SubControlLabel>
            <SmallSelect
              theme={theme}
              value={selectedMapId}
              onChange={(event) => setSelectedMapId(event.target.value)}
              disabled={importFormat === 'scene'}
            >
              {mapOptions.length === 0 ? (
                <option value="">{t('import.noMapFound')}</option>
              ) : mapOptions.map((map) => (
                <option key={map.id} value={map.id}>{map.name}</option>
              ))}
            </SmallSelect>
          </SubControlRow>

          <SubControlRow theme={theme}>
            <SubControlLabel theme={theme}>{t('import.dpiAutodetect')}</SubControlLabel>
            <StyledCheckbox
              theme={theme}
              type="checkbox"
              checked={dpiAutodetect}
              onChange={(event) => setDpiAutodetect(event.target.checked)}
            />
          </SubControlRow>

          <SubControlRow theme={theme}>
            <SubControlLabel theme={theme}>{t('import.manualDpi')}</SubControlLabel>
            <SmallInput
              theme={theme}
              type="number"
              value={importDpi}
              min={1}
              step={1}
              disabled={dpiAutodetect || importFormat === 'scene'}
              onChange={(event) => setImportDpi(event.target.value)}
            />
          </SubControlRow>

          {importErrors ? (
            <SubControlHint theme={theme}>{importErrors}</SubControlHint>
          ) : null}

          <SubControlRow theme={theme}>
            <SubControlLabel theme={theme}>
              {importFormat !== 'scene' && mapOptions.length === 0
                ? t('import.status.noScene')
                : t('import.status.ready')}
            </SubControlLabel>
            <Button theme={theme} onClick={handleImportClick} disabled={!canImport}>
              {isImporting ? t('import.action.importing') : t('import.action.import')}
            </Button>
          </SubControlRow>
        </Card>

        <Card theme={theme}>
          <SectionTitle theme={theme}>{t('import.fogConverters.title')}</SectionTitle>

          <ControlRow theme={theme}>
            <InlineActionButton
              theme={theme}
              onClick={() => void convertOBRFogToSmokeObstructions()}
              title={t('import.fogConverters.toSmokeTitle')}
            >
              {t('import.fogConverters.toSmokeButton')}
            </InlineActionButton>
          </ControlRow>

          <ControlRow theme={theme}>
            <InlineActionButton
              theme={theme}
              onClick={() => void convertSmokeObstructionsToOBRFog()}
              title={t('import.fogConverters.toFogTitle')}
            >
              {t('import.fogConverters.toFogButton')}
            </InlineActionButton>
          </ControlRow>
        </Card>
      </PageContainer>

      <PopupModal
        isOpen={isImportConfirmOpen}
        title={t('settings.confirmImportTitle')}
        onClose={() => setIsImportConfirmOpen(false)}
        actions={(
          <>
            <Button theme={theme} variant="secondary" onClick={() => setIsImportConfirmOpen(false)}>
              {t('settings.cancel')}
            </Button>
            <Button theme={theme} onClick={() => void handleConfirmImport()}>
              {t('settings.continue')}
            </Button>
          </>
        )}
      >
        <ModalText theme={theme}>
          {t('settings.importConfirmMessage')}
        </ModalText>
      </PopupModal>
    </motion.div>
  );
};
