import type { TranslationKey } from '../i18n/translations/en';

type Translate = (key: TranslationKey, variables?: Record<string, string | number | boolean | null | undefined>) => string;

export const getMainPageTooltips = (t: Translate) => ({
  visionRange: t('main.tooltips.visionRange'),
  visionCollision: t('main.tooltips.visionCollision'),
  visionInnerAngle: t('main.tooltips.visionInnerAngle'),
  visionOuterAngle: t('main.tooltips.visionOuterAngle'),
  visionFalloff: t('main.tooltips.visionFalloff'),
  visionDarkness: t('main.tooltips.visionDarkness'),
  visionBlind: t('main.tooltips.visionBlind'),
} as const);
