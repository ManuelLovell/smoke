import OBR, { Image } from '@owlbear-rodeo/sdk';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { PageContainer, PageTitle, InlineActionButton } from './SharedStyledComponents';
import { useSmokeTheme } from '../helpers/ThemeContext';
import { useTranslation } from '../i18n/Translation';
import { useSceneStore } from '../helpers/BSCache';
import { MultiSelect } from './MultiSelect';
import { Constants } from '../helpers/BSConstants';

const SpectreRow = styled.div<{ theme: any }>`
  ${tw`flex items-start gap-3 py-3 px-3 bg-black bg-opacity-25 rounded mb-2`}
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SpectreInfo = styled.div<{ theme: any }>`
  ${tw`flex-1`}
`;

const SpectreName = styled.div<{ theme: any }>`
  ${tw`font-semibold mb-2`}
  font-size: 0.95rem;
`;

const SpectreViewerContainer = styled.div<{ theme: any }>`
  ${tw`mb-2`}
  min-width: 0;
`;

const SpectreViewerLabel = styled.label<{ theme: any }>`
  ${tw`text-xs text-gray-400 mb-1 block`}
`;

const SpectreActions = styled.div<{ theme: any }>`
  ${tw`flex gap-2 flex-shrink-0`}
`;

const EmptyState = styled.div<{ theme: any }>`
  ${tw`text-center py-8 px-4`}
  font-size: 0.9rem;
`;

const DeleteButton = styled.button<{ theme: any }>`
  ${tw`flex items-center justify-center`}
  padding: 4px 8px;
`;

const SPECTRE_METADATA_KEY = `${Constants.SPECTREID}/isSpectre`;
const SPECTRE_VIEWERS_KEY = `${Constants.SPECTREID}/spectreViewers`;

export const SpectrePage = () => {
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();
  const items = useSceneStore((state) => state.items);
  const partyData = useSceneStore((state) => state.partyData);
  const playerData = useSceneStore((state) => state.playerData);

  const [spectres, setSpectres] = useState<Image[]>([]);

  // Filter spectres from items
  useEffect(() => {
    const spectreItems = items.filter(
      (item) => item.metadata[SPECTRE_METADATA_KEY] === true
    ) as Image[];
    setSpectres(spectreItems);
  }, [items]);

  // Get available players (excluding current player)
  const availablePlayers = partyData.filter(
    (player) => player.id !== playerData?.id
  );

  const handleViewersChange = async (spectreId: string, selectedViewerIds: string[]) => {
    try {
      await OBR.scene.items.updateItems([spectreId], (items) => {
        items[0].metadata[SPECTRE_VIEWERS_KEY] = selectedViewerIds;
      });
    } catch (error) {
      console.error('Error updating spectre viewers:', error);
      await OBR.notification.show(t('spectre.error.updateViewers'), 'ERROR');
    }
  };

  const handleDeleteSpectre = async (spectreId: string) => {
    try {
      await OBR.scene.items.deleteItems([spectreId]);
    } catch (error) {
      console.error('Error deleting spectre:', error);
      await OBR.notification.show(t('spectre.error.delete'), 'ERROR');
    }
  };

  const getSpectreViewers = (spectre: Image): string[] => {
    const viewers = spectre.metadata[SPECTRE_VIEWERS_KEY];
    return Array.isArray(viewers) ? viewers : [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PageContainer theme={theme}>
        <PageTitle theme={theme}>{t('spectre.pageTitle')}</PageTitle>

        {spectres.length === 0 ? (
          <>
          <EmptyState theme={theme}>
            {t('spectre.noSpectres')}
          </EmptyState>
          <EmptyState theme={theme}>
            {t('spectre.noSpectresInfo')}
          </EmptyState>
          </>
        ) : (
          <div>
            {spectres.map((spectre) => {
              const currentViewers = getSpectreViewers(spectre);
              const playerOptions = availablePlayers.map((player) => ({
                value: player.id,
                label: player.name,
              }));

              return (
                <SpectreRow key={spectre.id} theme={theme}>
                  <SpectreInfo theme={theme}>
                    <SpectreName theme={theme}>{spectre.name}</SpectreName>
                    <SpectreViewerContainer theme={theme}>
                      <SpectreViewerLabel theme={theme}>
                        {t('spectre.selectViewers')}
                      </SpectreViewerLabel>
                      <MultiSelect
                        options={playerOptions}
                        value={currentViewers}
                        onChange={(newViewers) =>
                          void handleViewersChange(spectre.id, newViewers)
                        }
                        placeholder={t('spectre.chooseViewers')}
                        theme={theme}
                      />
                    </SpectreViewerContainer>
                  </SpectreInfo>
                  <SpectreActions theme={theme}>
                    <InlineActionButton
                      theme={theme}
                      onClick={() => void handleDeleteSpectre(spectre.id)}
                      as={DeleteButton}
                    >
                      <Trash2 size={14} />
                    </InlineActionButton>
                  </SpectreActions>
                </SpectreRow>
              );
            })}
          </div>
        )}
      </PageContainer>
    </motion.div>
  );
};
