import type { TranslationKey } from '../i18n/translations/en';

type Translate = (key: TranslationKey, variables?: Record<string, string | number | boolean | null | undefined>) => string;

export const getSettingsTooltips = (t: Translate) => ({
  wallsGridSnap: t('settings.tooltips.wallsGridSnap'),
  wallsPersistenceLimit: t('settings.tooltips.wallsPersistenceLimit'),
  toolWidth: t('settings.tooltips.toolWidth'),
  toolColor: t('settings.tooltips.toolColor'),
  doorLineColor: t('settings.tooltips.doorLineColor'),
  windowLineColor: t('settings.tooltips.windowLineColor'),
  toolStyle: t('settings.tooltips.toolStyle'),
  defaultVisionRange: t('settings.tooltips.defaultVisionRange'),
  defaultVisionSource: t('settings.tooltips.defaultVisionSource'),
  defaultVisionDarkness: t('settings.tooltips.defaultVisionDarkness'),
  defaultVisionInnerAngle: t('settings.tooltips.defaultVisionInnerAngle'),
  defaultVisionOuterAngle: t('settings.tooltips.defaultVisionOuterAngle'),
  defaultVisionFalloff: t('settings.tooltips.defaultVisionFalloff'),
  defaultElevationLevel: t('settings.tooltips.defaultElevationLevel'),
  partyOwnerLines: t('settings.tooltips.partyOwnerLines'),
  fogPersistence: t('settings.tooltips.fogPersistence'),
  fogAutoHide: t('settings.tooltips.fogAutoHide'),
  fogTrailing: t('settings.tooltips.fogTrailing'),
  fogPlayerSeeDoors: t('settings.tooltips.fogPlayerSeeDoors'),
  fogDisableVision: t('settings.tooltips.fogDisableVision'),
  fogFilled: t('settings.tooltips.fogFilled'),
  wallsBlockingGm: t('settings.tooltips.wallsBlockingGm'),
  menuUnitContext: t('settings.tooltips.menuUnitContext'),
  menuWallContext: t('settings.tooltips.menuWallContext'),
  otherWarnings: t('settings.tooltips.otherWarnings'),
  enableConsoleLogging: t('settings.tooltips.enableConsoleLogging'),
} as const);
