import { Image, Item } from '@owlbear-rodeo/sdk';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import tw from 'twin.macro';
import { PageContainer, PageTitle } from './SharedStyledComponents';
import { SettingsTooltip } from './SettingsTooltip';
import { getMainPageTooltips } from './MainPageTooltipContent';
import { useSceneStore } from '../helpers/BSCache';
import { useSmokeTheme } from '../helpers/ThemeContext';
import { isTokenWithVisionForUI } from '../helpers/ItemFilters';
import { TokenConstants } from '../helpers/MetadataKeys';
import { useTranslation } from '../i18n/Translation';

const ListWrap = styled.div`
  ${tw`w-full`}
  padding: 12px;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(6, 34px);
  gap: 16px;
  align-items: center;
  margin-bottom: 8px;
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(6, 34px);
  gap: 16px;
  align-items: center;
  padding: 6px 0;
`;

const HeaderCell = styled.div`
  ${tw`text-xs font-semibold flex items-center justify-center`}
  opacity: 0.8;
  text-align: center;
`;

const HeaderIcon = styled.img`
  width: 24px;
  height: 24px;
  display: block;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.15));
`;

const NameCell = styled.div`
  ${tw`text-lg font-medium`}
  text-align: left;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ValueCell = styled.div`
  ${tw`text-lg`}
  text-align: center;
  opacity: 0.95;
`;

const EmptyState = styled.div`
  ${tw`text-sm`}
  opacity: 0.7;
`;

interface VisionData {
  range: number;
  collision: number;
  innerAngle: number;
  outerAngle: number;
  falloff: number;
  darkness: number;
}

const isImageItem = (item: Item): item is Image => {
  return item.type === 'IMAGE';
};

const getVisionData = (token: Image): VisionData => {
  const range = token.metadata[TokenConstants.VISION_RANGE];
  const collision = token.metadata[TokenConstants.VISION_SOURCE];
  const innerAngle = token.metadata[TokenConstants.VISION_IN_ANGLE];
  const outerAngle = token.metadata[TokenConstants.VISION_OUT_ANGLE];
  const falloff = token.metadata[TokenConstants.VISION_FALLOFF];
  const darkness = token.metadata[TokenConstants.VISION_DARKNESS];

  return {
    range: typeof range === 'number' && Number.isFinite(range) ? range : 30,
    collision: typeof collision === 'number' && Number.isFinite(collision) ? collision : 0,
    innerAngle: typeof innerAngle === 'number' && Number.isFinite(innerAngle) ? innerAngle : 360,
    outerAngle: typeof outerAngle === 'number' && Number.isFinite(outerAngle) ? outerAngle : 360,
    falloff: typeof falloff === 'number' && Number.isFinite(falloff) ? falloff : 1,
    darkness: typeof darkness === 'number' && Number.isFinite(darkness) ? darkness : 0,
  };
};

export const PlayerPage = () => {
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();
  const tooltips = useMemo(() => getMainPageTooltips(t), [t]);
  const items = useSceneStore((state) => state.items);
  const playerData = useSceneStore((state) => state.playerData);

  const imageItems = useMemo(() => items.filter(isImageItem), [items]);

  const imageById = useMemo(() => {
    const map = new Map<string, Image>();
    for (const image of imageItems) {
      map.set(image.id, image);
    }
    return map;
  }, [imageItems]);

  const ownedTokens = useMemo(() => {
    if (!playerData?.id) {
      return [] as Image[];
    }

    return imageItems.filter((item) => {
      return isTokenWithVisionForUI(item) && item.createdUserId === playerData.id;
    });
  }, [imageItems, playerData?.id]);

  const getEffectiveToken = (token: Image): Image => {
    const linkedTo = token.metadata[TokenConstants.LINKED_TO];
    if (typeof linkedTo !== 'string' || linkedTo.length === 0 || linkedTo === token.id) {
      return token;
    }

    return imageById.get(linkedTo) ?? token;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PageContainer theme={theme}>
        <PageTitle theme={theme}>{t('nav.player')}</PageTitle>
          {ownedTokens.length === 0 ? (
            <EmptyState>{t('player.emptyOwnedVision')}</EmptyState>
          ) : (
            <ListWrap>
              <HeaderRow>
                <HeaderCell />
                <HeaderCell>
                  <SettingsTooltip theme={theme} text={tooltips.visionRange}>
                    <HeaderIcon src="/visionRange.svg" alt={t('presets.range')} />
                  </SettingsTooltip>
                </HeaderCell>
                <HeaderCell>
                  <SettingsTooltip theme={theme} text={tooltips.visionCollision}>
                    <HeaderIcon src="/visionBumper.svg" alt={t('presets.collision')} />
                  </SettingsTooltip>
                </HeaderCell>
                <HeaderCell>
                  <SettingsTooltip theme={theme} text={tooltips.visionInnerAngle}>
                    <HeaderIcon src="/visionInner.svg" alt={t('presets.innerAngle')} />
                  </SettingsTooltip>
                </HeaderCell>
                <HeaderCell>
                  <SettingsTooltip theme={theme} text={tooltips.visionOuterAngle}>
                    <HeaderIcon src="/visionOuter.svg" alt={t('presets.outerAngle')} />
                  </SettingsTooltip>
                </HeaderCell>
                <HeaderCell>
                  <SettingsTooltip theme={theme} text={tooltips.visionFalloff}>
                    <HeaderIcon src="/visionFalloff.svg" alt={t('presets.falloff')} />
                  </SettingsTooltip>
                </HeaderCell>
                <HeaderCell>
                  <SettingsTooltip theme={theme} text={tooltips.visionDarkness}>
                    <HeaderIcon src="/darkvision.svg" alt={t('presets.darkvision')} />
                  </SettingsTooltip>
                </HeaderCell>
              </HeaderRow>

              {ownedTokens.map((token) => {
                const effectiveToken = getEffectiveToken(token);
                const vision = getVisionData(effectiveToken);
                const unitName = token.text?.plainText || token.name;

                return (
                  <DataRow key={token.id}>
                    <NameCell>{unitName}</NameCell>
                    <ValueCell>{vision.range}</ValueCell>
                    <ValueCell>{vision.collision}</ValueCell>
                    <ValueCell>{vision.innerAngle}</ValueCell>
                    <ValueCell>{vision.outerAngle}</ValueCell>
                    <ValueCell>{Math.round(vision.falloff * 10) / 10}</ValueCell>
                    <ValueCell>{vision.darkness}</ValueCell>
                  </DataRow>
                );
              })}
            </ListWrap>
          )}
      </PageContainer>
    </motion.div>
  );
};
