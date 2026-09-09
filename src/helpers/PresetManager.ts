import { Constants } from './BSConstants';

export interface VisionPreset {
  id: string;
  name: string;
  visionRange: string;
  visionDark: string;
  visionSourceRange: string;
  visionFallOff: string;
  visionInAngle: string;
  visionOutAngle: string;
}

const VISION_PRESETS_KEY = `${Constants.EXTENSIONID}/visionPresets`;
const MAX_VISION_PRESETS = 20;

export async function loadPresets(): Promise<VisionPreset[]> {
  const stored = localStorage.getItem(VISION_PRESETS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function savePresets(presets: VisionPreset[]): Promise<void> {
  localStorage.setItem(VISION_PRESETS_KEY, JSON.stringify(presets));
}

export async function addPreset(preset: VisionPreset): Promise<{ success: boolean; message: string }> {
  const presets = await loadPresets();

  if (presets.length >= MAX_VISION_PRESETS) {
    return {
      success: false,
      message: `You can save up to ${MAX_VISION_PRESETS} presets. Delete one to add another.`,
    };
  }

  presets.push(preset);
  await savePresets(presets);
  return { success: true, message: '' };
}

export async function deletePreset(presetId: string): Promise<void> {
  const presets = await loadPresets();
  const updated = presets.filter(p => p.id !== presetId);
  await savePresets(updated);
}

export function getMaxPresets(): number {
  return MAX_VISION_PRESETS;
}
