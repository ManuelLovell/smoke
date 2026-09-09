import OBR from '@owlbear-rodeo/sdk';
import { BSCACHE } from './BSCache';
import { Constants } from './BSConstants';
import { isVisionLine } from './ItemFilters';
import { Sleep } from './BSUtilities';
import { convertObstructionLinesToFog, convertFogToObstructionLines } from './ConversionHelpers';
import { Translation } from '../i18n/Translation';

/**
 * Make all vision lines double-sided
 */
export async function makeAllWallsDoubleSided(): Promise<void> {
  const allFogLines = BSCACHE.sceneItems.filter(x => isVisionLine(x));

  if (allFogLines.length === 0) {
    await OBR.notification.show(Translation.t('wallOps.noWallsFound'), 'WARNING');
    return;
  }

  await BSCACHE.ToggleBusy(true);

  try {
    for (let i = 0; i < allFogLines.length; i += 64) {
      const batch = allFogLines.slice(i, i + 64);
      await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) => {
        for (let path of paths) {
          path.metadata[`${Constants.EXTENSIONID}/doubleSided`] = true;
        }
      });
      await Sleep(100);
    }
    await OBR.notification.show(Translation.t('wallOps.doubleSidedSuccess', { count: allFogLines.length }), 'SUCCESS');
  } catch (error) {
    console.error('Error making walls double-sided:', error);
    await OBR.notification.show(Translation.t('wallOps.doubleSidedError'), 'ERROR');
  } finally {
    await BSCACHE.ToggleBusy(false);
  }
}

/**
 * Block all vision lines (make them passable/blocking)
 */
export async function blockAllWalls(): Promise<void> {
  const allFogLines = BSCACHE.sceneItems.filter(x => isVisionLine(x));

  if (allFogLines.length === 0) {
    await OBR.notification.show(Translation.t('wallOps.noWallsFound'), 'WARNING');
    return;
  }

  await BSCACHE.ToggleBusy(true);

  try {
    for (let i = 0; i < allFogLines.length; i += 64) {
      const batch = allFogLines.slice(i, i + 64);
      await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) => {
        for (let path of paths) {
          path.metadata[`${Constants.EXTENSIONID}/blocking`] = true;
        }
      });
      await Sleep(100);
    }
    await OBR.notification.show(Translation.t('wallOps.blockSuccess', { count: allFogLines.length }), 'SUCCESS');
  } catch (error) {
    console.error('Error blocking walls:', error);
    await OBR.notification.show(Translation.t('wallOps.blockError'), 'ERROR');
  } finally {
    await BSCACHE.ToggleBusy(false);
  }
}

/**
 * Unblock all vision lines (make them passable)
 */
export async function unblockAllWalls(): Promise<void> {
  const allFogLines = BSCACHE.sceneItems.filter(x => isVisionLine(x));

  if (allFogLines.length === 0) {
    await OBR.notification.show(Translation.t('wallOps.noWallsFound'), 'WARNING');
    return;
  }

  await BSCACHE.ToggleBusy(true);

  try {
    for (let i = 0; i < allFogLines.length; i += 64) {
      const batch = allFogLines.slice(i, i + 64);
      await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) => {
        for (let path of paths) {
          path.metadata[`${Constants.EXTENSIONID}/blocking`] = undefined;
        }
      });
      await Sleep(100);
    }
    await OBR.notification.show(Translation.t('wallOps.unblockSuccess', { count: allFogLines.length }), 'SUCCESS');
  } catch (error) {
    console.error('Error unblocking walls:', error);
    await OBR.notification.show(Translation.t('wallOps.unblockError'), 'ERROR');
  } finally {
    await BSCACHE.ToggleBusy(false);
  }
}

/**
 * Lock all vision lines
 */
export async function lockAllLines(): Promise<void> {
  const allFogLines = BSCACHE.sceneItems.filter(x => isVisionLine(x));

  if (allFogLines.length === 0) {
    await OBR.notification.show(Translation.t('wallOps.noLinesFound'), 'WARNING');
    return;
  }

  await BSCACHE.ToggleBusy(true);

  try {
    for (let i = 0; i < allFogLines.length; i += 64) {
      const batch = allFogLines.slice(i, i + 64);
      await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) => {
        for (let path of paths) {
          path.locked = true;
        }
      });
      await Sleep(100);
    }
    await OBR.notification.show(Translation.t('wallOps.lockSuccess', { count: allFogLines.length }), 'SUCCESS');
  } catch (error) {
    console.error('Error locking lines:', error);
    await OBR.notification.show(Translation.t('wallOps.lockError'), 'ERROR');
  } finally {
    await BSCACHE.ToggleBusy(false);
  }
}

/**
 * Unlock all vision lines
 */
export async function unlockAllLines(): Promise<void> {
  const allFogLines = BSCACHE.sceneItems.filter(x => isVisionLine(x));

  if (allFogLines.length === 0) {
    await OBR.notification.show(Translation.t('wallOps.noLinesFound'), 'WARNING');
    return;
  }

  await BSCACHE.ToggleBusy(true);

  try {
    for (let i = 0; i < allFogLines.length; i += 64) {
      const batch = allFogLines.slice(i, i + 64);
      await OBR.scene.items.updateItems(batch.map(x => x.id), (paths) => {
        for (let path of paths) {
          path.locked = false;
        }
      });
      await Sleep(100);
    }
    await OBR.notification.show(Translation.t('wallOps.unlockSuccess', { count: allFogLines.length }), 'SUCCESS');
  } catch (error) {
    console.error('Error unlocking lines:', error);
    await OBR.notification.show(Translation.t('wallOps.unlockError'), 'ERROR');
  } finally {
    await BSCACHE.ToggleBusy(false);
  }
}

/**
 * Convert OBR Fog to Smoke Obstructions
 */
export async function convertOBRFogToSmokeObstructions(): Promise<void> {
  await convertFogToObstructionLines();
}

/**
 * Convert Smoke Obstructions to OBR Fog
 */
export async function convertSmokeObstructionsToOBRFog(): Promise<void> {
  await convertObstructionLinesToFog();
}
