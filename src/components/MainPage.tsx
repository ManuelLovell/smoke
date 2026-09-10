import OBR, { Image } from '@owlbear-rodeo/sdk';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import tw from 'twin.macro';
import { PageContainer, StyledCheckbox } from './SharedStyledComponents';
import { useSmokeTheme } from '../helpers/ThemeContext';
import { useSceneStore } from '../helpers/BSCache';
import { PresetInput } from './inputs/PresetInput';
import { ToggleControl } from './ToggleControl';
import { SettingsTooltip } from './SettingsTooltip';
import { getMainPageTooltips } from './MainPageTooltipContent';
import { isTokenWithVisionForUI } from '../helpers/ItemFilters';
import { TokenConstants, SettingsConstants } from '../helpers/MetadataKeys';
import { DEFAULT_THEME } from '../helpers/ThemeConstants';
import { ViewportFunctions } from '../scripts/bsViewport';
import { EyeOffIcon, Link } from 'lucide-react';
import { useTranslation } from '../i18n/Translation';

// Vision parameter metadata keys - using TokenConstants from MetadataKeys
const VISION_RANGE_KEY = TokenConstants.VISION_RANGE;
const VISION_DARKNESS_KEY = TokenConstants.VISION_DARKNESS;
const VISION_SOURCE_KEY = TokenConstants.VISION_SOURCE;
const VISION_FALLOFF_KEY = TokenConstants.VISION_FALLOFF;
const VISION_IN_ANGLE_KEY = TokenConstants.VISION_IN_ANGLE;
const VISION_OUT_ANGLE_KEY = TokenConstants.VISION_OUT_ANGLE;
const VISION_BLIND_KEY = TokenConstants.VISION_BLIND;
const LINKED_TO_KEY = TokenConstants.LINKED_TO;
const HIDDEN_TOKEN_KEY = TokenConstants.HIDDEN_TOKEN;

// Stat colors for each parameter
const STAT_COLORS = [
  '#C98A3E', // brass - range
  '#4E8C82', // teal - collision
  '#8C6E9C', // plum - inner angle
  '#B3583F', // rust - outer angle
  '#5B7FA6', // steel - falloff
  '#9AA53F', // olive - darkness
];

const MainPageContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100%;
`;

const PageHeaderRow = styled.div<{ theme: any }>`
  ${tw`flex items-center justify-between gap-3`}
  border: 2px solid ${props => props.theme.BORDER};
  background-color: ${props => props.theme.OFFSET};
  border-radius: 6px;
  padding: 4px 8px;
  margin-bottom: 8px;
`;

const HeaderTitle = styled.h1<{ theme: any }>`
  margin: 0;
  padding-left: 12px;
  color: ${props => props.theme.PRIMARY};
  font-size: 20px;
  font-weight: bold;
  font-variant: small-caps;
`;

const HeaderRight = styled.div`
  ${tw`flex items-center gap-2`}
`;

const HeaderToggleLabel = styled.span<{ theme: any }>`
  ${tw`text-xs font-semibold`}
  color: ${props => props.theme.PRIMARY};
  opacity: 0.9;
`;

const GridContainer = styled.div`
  ${tw`overflow-auto`}
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    padding: 0 8px;
    justify-content: stretch;
  }
`;

const GridTable = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  row-gap: 2px;
  min-width: max-content;
  height: 100%;
  margin: 0 auto;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    width: 100%;
    min-width: 0;
    row-gap: 10px;
  }
`;

const HeaderCell = styled.div<{ $accent?: string }>`
  ${tw`text-xs font-semibold`}
  color: ${props => props.$accent || '#8B9190'};
  text-align: center;
  padding: 8px 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: none;
  }
`;

const MobileColumnHeaders = styled.div`
  display: none;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: 28px 8px repeat(3, 44px) 8px 28px;
    justify-content: center;
    grid-template-areas:
      'link . range collision inner . blind'
      '. . outer falloff darkness . .';
    row-gap: 8px;
    column-gap: 0;
    padding: 2px 8px 6px;
  }
`;

const MobileHeaderItem = styled.div<{ $area: string; $accent?: string }>`
  display: none;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: flex;
    grid-area: ${props => props.$area};
    align-items: center;
    justify-content: center;
    color: ${props => props.$accent || '#8B9190'};
  }
`;

const HeaderIcon = styled.img`
  width: 22px;
  height: 22px;
  display: block;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.15));
`;

const TokenNameCell = styled.div<{ $isDragging?: boolean; $isDropTarget?: boolean; $isSelected?: boolean }>`
  color: ${props => props.$isSelected ? '#e05cae' : '#fff'};
  font-weight: ${props => props.$isSelected ? '800' : '400'};
  display: flex;
  word-break: break-word;
  text-align: center;
  cursor: pointer;
  opacity: ${props => props.$isDragging ? 0.55 : 1};
  outline: ${props => props.$isDropTarget ? '2px dashed rgba(237, 234, 227, 0.65)' : 'none'};
  border-radius: 6px;
  padding: 2px 6px;
`;

const TokenOwnerCell = styled.div`
  ${tw`text-xs`}
  line-height: 2.2;
  color: rgba(237, 234, 227, 0.7);
  font-family: 'IBM Plex Mono', monospace;
  text-align: center;
  padding-left: 6px;
`;

const TokenHeaderCell = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding-top: 4px;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-column: auto;
    grid-area: name;
    padding-top: 0;
  }
`;

const ParameterCell = styled.div<{ $mobileArea?: string }>`
  ${tw`flex flex-col items-center gap-2`}
  padding: 0 4px;
  align-self: center;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: ${props => props.$mobileArea || 'auto'};
    width: 44px;
    padding: 0;
  }
`;

const LinkIndicatorCell = styled.div`
  ${tw`flex items-center justify-center`}
  padding: 0 2px;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: link;
    justify-self: center;
  }
`;

const BlindCell = styled(ParameterCell)`
  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    grid-area: blind;
  }
`;

const TokenGridRow = styled.div`
  grid-column: 1 / -1;
  display: contents;

  @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
    display: grid;
    grid-template-columns: 28px 8px repeat(3, 44px) 8px 28px;
    justify-content: center;
    grid-template-areas:
      'name name name name name name name'
      'link . range collision inner . blind'
      'link . outer falloff darkness . blind';
    row-gap: 6px;
    column-gap: 6px;
    padding: 6px 8px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  }
`;

const OwnerModalOverlay = styled.div<{ $isOpen: boolean }>`
  ${tw`fixed inset-0 z-50`}
  background-color: rgba(0, 0, 0, 0.6);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const OwnerModalContent = styled.div<{ theme: any }>`
  ${tw`rounded-lg shadow-lg p-6 max-w-sm w-full`}
  background-color: rgb(82, 77, 114);
  border: 2px solid ${props => props.theme.BORDER};
  max-height: 70vh;
  overflow-y: auto;
`;

const OwnerModalTitle = styled.h2<{ theme: any }>`
  ${tw`text-lg font-bold mb-4`}
  color: ${props => props.theme.PRIMARY};
`;

const OwnerPlayerList = styled.div<{ theme: any }>`
  ${tw`flex flex-col gap-2`}
`;

const OwnerModalSection = styled.div<{ theme: any }>`
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.BORDER};
`;

const OwnerModalActionRow = styled.div`
  ${tw`flex gap-4`}
  justify-content: space-between;
`;

const OwnerPlayerItem = styled.button<{ theme: any }>`
  ${tw`w-full text-left px-4 py-3 rounded cursor-pointer transition-all`}
  background-color: ${props => props.theme.OFFSET};
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: ${props => props.theme.OFFSET}dd;
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
`;

const EmptyState = styled.div`
  ${tw`text-center py-12 px-4`}
  color: rgba(237, 234, 227, 0.9  );
  font-size: 0.9rem;
`;

interface VisionData {
  range: number;
  collision: number;
  innerAngle: number;
  outerAngle: number;
  falloff: number;
  darkness: number;
  blind: boolean;
  hidden: boolean;
}

type BulkVisionField = 'range' | 'collision' | 'innerAngle' | 'outerAngle' | 'falloff' | 'darkness';

interface BulkEditConfig {
  key: string;
  min: number;
  max: number;
  presets: number[];
  step?: number;
  accent: string;
  label: string;
}

const HeaderIconButton = styled.button<{ $accent?: string }>`
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${props => props.$accent || 'rgba(255, 255, 255, 0.35)'};
    background: rgba(255, 255, 255, 0.08);
  }
`;

const BulkEditModalContent = styled.div<{ theme: any }>`
  ${tw`rounded-lg shadow-lg p-4`}
  background-color: rgb(82, 77, 114);
  border: 2px solid ${props => props.theme.BORDER};
  width: 220px;
`;

const BulkEditModalTitle = styled.h3<{ theme: any }>`
  ${tw`text-sm font-bold text-center mb-3`}
  color: ${props => props.theme.PRIMARY};
`;

export const MainPage = () => {
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();
  const items = useSceneStore((state) => state.items);
  const partyData = useSceneStore((state) => state.partyData);
  const playerData = useSceneStore((state) => state.playerData);
  const sceneMetadata = useSceneStore((state) => state.sceneMetadata);

  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [selectedTokenForOwner, setSelectedTokenForOwner] = useState<string | null>(null);
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [dropTargetTokenId, setDropTargetTokenId] = useState<string | null>(null);
  const [bulkEditField, setBulkEditField] = useState<BulkVisionField | null>(null);
  const [bulkEditValue, setBulkEditValue] = useState(0);
  const [hideHiddenTokens, setHideHiddenTokens] = useState(true);
  const tooltips = useMemo(() => getMainPageTooltips(t), [t]);


  const mode = useMemo(() => {
    const saved = sceneMetadata[SettingsConstants.CONTROL_MODE];
    return (saved === 'roller' ? 'roller' : 'flywheel') as 'flywheel' | 'roller';
  }, [sceneMetadata]);

  const bulkEditConfigs = useMemo<Record<BulkVisionField, BulkEditConfig>>(() => ({
    range: {
      key: VISION_RANGE_KEY,
      min: 0,
      max: 120,
      presets: [0, 15, 30, 45, 60, 75, 90],
      accent: STAT_COLORS[0],
      label: t('presets.range'),
    },
    collision: {
      key: VISION_SOURCE_KEY,
      min: 0,
      max: 20,
      presets: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      accent: STAT_COLORS[1],
      label: t('presets.collision'),
    },
    innerAngle: {
      key: VISION_IN_ANGLE_KEY,
      min: 0,
      max: 360,
      presets: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360],
      accent: STAT_COLORS[2],
      label: t('presets.innerAngle'),
    },
    outerAngle: {
      key: VISION_OUT_ANGLE_KEY,
      min: 0,
      max: 360,
      presets: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360],
      accent: STAT_COLORS[3],
      label: t('presets.outerAngle'),
    },
    falloff: {
      key: VISION_FALLOFF_KEY,
      min: 0,
      max: 1,
      step: 0.1,
      presets: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      accent: STAT_COLORS[4],
      label: t('presets.falloff'),
    },
    darkness: {
      key: VISION_DARKNESS_KEY,
      min: 0,
      max: 100,
      presets: [0, 15, 30, 45, 60, 75, 90],
      accent: STAT_COLORS[5],
      label: t('presets.darkvision'),
    },
  }), [t]);

  const ownerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const player of partyData) {
      if (typeof player.id === 'string' && player.id.length > 0) {
        map.set(player.id, player.name || t('main.unknownOwner'));
      }
    }
    return map;
  }, [partyData, t]);

  // Filter tokens with vision and optionally hide entries marked as hiddenToken.
  const tokens = useMemo(() => {
    const tokensWithVision = items.filter((item) => isTokenWithVisionForUI(item)) as Image[];
    if (!hideHiddenTokens) {
      return tokensWithVision;
    }
    return tokensWithVision.filter((token) => token.metadata[HIDDEN_TOKEN_KEY] !== true);
  }, [hideHiddenTokens, items]);

  const getLinkedParentId = (token: Image): string | null => {
    const linkedTo = token.metadata[LINKED_TO_KEY];
    if (typeof linkedTo !== 'string' || linkedTo.length === 0) {
      return null;
    }
    if (linkedTo === token.id) {
      return null;
    }
    return linkedTo;
  };

  const tokenById = useMemo(() => {
    const map = new Map<string, Image>();
    for (const token of tokens) {
      map.set(token.id, token);
    }
    return map;
  }, [tokens]);

  const childIdsByParent = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const token of tokens) {
      const parentId = getLinkedParentId(token);
      if (!parentId || !tokenById.has(parentId)) {
        continue;
      }
      const existing = map.get(parentId) ?? [];
      existing.push(token.id);
      map.set(parentId, existing);
    }
    return map;
  }, [tokenById, tokens]);

  const linkedParentIdByTokenId = useMemo(() => {
    const map = new Map<string, string>();
    for (const token of tokens) {
      const parentId = getLinkedParentId(token);
      if (parentId && tokenById.has(parentId)) {
        map.set(token.id, parentId);
      }
    }
    return map;
  }, [tokenById, tokens]);

  const orderedTokens = useMemo(() => {
    const roots: Image[] = [];
    for (const token of tokens) {
      if (!linkedParentIdByTokenId.has(token.id)) {
        roots.push(token);
      }
    }

    const ordered: Image[] = [];
    const visited = new Set<string>();

    const appendToken = (tokenId: string) => {
      if (visited.has(tokenId)) {
        return;
      }

      const token = tokenById.get(tokenId);
      if (!token) {
        return;
      }

      visited.add(tokenId);
      ordered.push(token);

      const children = childIdsByParent.get(tokenId) ?? [];
      for (const childId of children) {
        appendToken(childId);
      }
    };

    for (const root of roots) {
      appendToken(root.id);
    }

    for (const token of tokens) {
      if (!visited.has(token.id)) {
        ordered.push(token);
      }
    }

    return ordered;
  }, [childIdsByParent, linkedParentIdByTokenId, tokenById, tokens]);

  // Provide proper defaults for vision parameters
  const getVisionData = (token: Image): VisionData => {
    const range = token.metadata[VISION_RANGE_KEY];
    const collision = token.metadata[VISION_SOURCE_KEY];
    const innerAngle = token.metadata[VISION_IN_ANGLE_KEY];
    const outerAngle = token.metadata[VISION_OUT_ANGLE_KEY];
    const falloff = token.metadata[VISION_FALLOFF_KEY];
    const darkness = token.metadata[VISION_DARKNESS_KEY];
    const blind = token.metadata[VISION_BLIND_KEY];
    const hidden = token.metadata[HIDDEN_TOKEN_KEY];

    const getNumericValue = (value: unknown, fallback: number): number => {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }

      if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? fallback : parsed;
      }

      return fallback;
    };

    return {
      range: getNumericValue(range, 30),
      collision: getNumericValue(collision, 0),
      innerAngle: getNumericValue(innerAngle, 360),
      outerAngle: getNumericValue(outerAngle, 360),
      falloff: getNumericValue(falloff, 1.0),
      darkness: getNumericValue(darkness, 0),
      blind: blind === true,
      hidden: hidden === true,
    };
  };

  // Normalize and validate a vision parameter before saving
  const normalizeVisionParameter = (key: string, value: number): number => {
    // Handle NaN values by returning appropriate defaults
    if (Number.isNaN(value) || value === null || value === undefined) {
      // Return sensible defaults for each parameter
      if (key === VISION_RANGE_KEY) return 30;
      if (key === VISION_SOURCE_KEY) return 0;
      if (key === VISION_IN_ANGLE_KEY) return 360;
      if (key === VISION_OUT_ANGLE_KEY) return 360;
      if (key === VISION_FALLOFF_KEY) return 1.0;
      if (key === VISION_DARKNESS_KEY) return 0;
      return value;
    }

    // Apply min/max bounds based on parameter type
    let min = 0;
    let max = 120;

    if (key === VISION_SOURCE_KEY) {
      min = 0;
      max = 20;
    } else if (key === VISION_IN_ANGLE_KEY || key === VISION_OUT_ANGLE_KEY) {
      min = 0;
      max = 360;
    } else if (key === VISION_FALLOFF_KEY) {
      min = 0;
      max = 1;
    } else if (key === VISION_DARKNESS_KEY) {
      min = 0;
      max = 100;
    } else if (key === VISION_RANGE_KEY) {
      min = 0;
      max = 120;
    }

    return Math.max(min, Math.min(max, value));
  };

  const handleNameClick = async (tokenId: string) => {
    await ViewportFunctions.CenterViewportOnImage(tokenId);
    await OBR.player.select([tokenId]);
  };

  const handleTokenRightClick = (token: Image, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedTokenForOwner(token.id);
    setOwnerModalOpen(true);
  };

  const handleOwnerSelect = async (newOwnerId: string) => {
    if (!selectedTokenForOwner) return;

    try {
      await OBR.scene.items.updateItems([selectedTokenForOwner], (items) => {
        if (items.length > 0) {
          items[0].createdUserId = newOwnerId;
        }
      });

      setOwnerModalOpen(false);
      setSelectedTokenForOwner(null);
      await OBR.notification.show(t('main.notifications.ownerUpdated'), 'SUCCESS');
    } catch (error) {
      console.error('Error updating token owner:', error);
      await OBR.notification.show(t('main.notifications.ownerUpdateFailed'), 'ERROR');
    }
  };

  const wouldCreateCycle = (sourceTokenId: string, parentTokenId: string): boolean => {
    if (sourceTokenId === parentTokenId) {
      return true;
    }

    const stack = [parentTokenId];
    const visited = new Set<string>();
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current)) {
        continue;
      }
      if (current === sourceTokenId) {
        return true;
      }
      visited.add(current);
      const children = childIdsByParent.get(current) ?? [];
      for (const childId of children) {
        stack.push(childId);
      }
    }

    return false;
  };

  const unlinkToken = async (tokenId: string) => {
    await OBR.scene.items.updateItems([tokenId], (items) => {
      if (items.length === 0) {
        return;
      }
      delete items[0].metadata[LINKED_TO_KEY];
    });
  };

  const handleTokenDragStart = (token: Image, event: React.DragEvent<HTMLDivElement>) => {
    const hasChildren = (childIdsByParent.get(token.id)?.length ?? 0) > 0;
    if (hasChildren) {
      event.preventDefault();
      void OBR.notification.show(t('main.notifications.unlinkChildrenBeforeDrag'), 'WARNING');
      return;
    }

    setDraggedTokenId(token.id);
    setDropTargetTokenId(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', token.id);
  };

  const handleTokenDragEnd = () => {
    setDraggedTokenId(null);
    setDropTargetTokenId(null);
  };

  const handleTokenDragOver = (targetTokenId: string, event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedTokenId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dropTargetTokenId !== targetTokenId) {
      setDropTargetTokenId(targetTokenId);
    }
  };

  const handleTokenDrop = async (targetToken: Image, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const sourceTokenId = event.dataTransfer.getData('text/plain') || draggedTokenId;
    setDraggedTokenId(null);
    setDropTargetTokenId(null);

    if (!sourceTokenId) {
      return;
    }

    const sourceToken = tokenById.get(sourceTokenId);
    if (!sourceToken) {
      return;
    }

    try {
      if (sourceTokenId === targetToken.id) {
        await unlinkToken(sourceTokenId);
        await OBR.notification.show(t('main.notifications.linkRemoved'), 'SUCCESS');
        return;
      }

      const targetParentId = linkedParentIdByTokenId.get(targetToken.id) ?? targetToken.id;
      if (wouldCreateCycle(sourceTokenId, targetParentId)) {
        await OBR.notification.show(t('main.notifications.linkLoopCancelled'), 'WARNING');
        return;
      }

      const hiddenTokenState = targetToken.metadata[HIDDEN_TOKEN_KEY];
      await OBR.scene.items.updateItems([sourceTokenId], (items) => {
        if (items.length === 0) {
          return;
        }
        items[0].metadata[LINKED_TO_KEY] = targetParentId;
        items[0].metadata[HIDDEN_TOKEN_KEY] = hiddenTokenState;
      });

      await OBR.notification.show(t('main.notifications.linkedToParent'), 'SUCCESS');
    } catch (error) {
      console.error('Error linking token:', error);
      await OBR.notification.show(t('main.notifications.linkUpdateFailed'), 'ERROR');
    }
  };

  const updateVisionParameter = async (
    tokenId: string,
    key: string,
    value: number,
    source: 'manual' | 'drag' | 'preset' = 'drag'
  ) => {
    try {
      const normalizedValue = source === 'manual' ? value : normalizeVisionParameter(key, value);

      await OBR.scene.items.updateItems([tokenId], (items) => {
        items[0].metadata[key] = normalizedValue;
      });
    } catch (error) {
      console.error('Error updating vision parameter:', error);
      await OBR.notification.show(t('main.notifications.visionUpdateFailed'), 'ERROR');
    }
  };

  const updateVisionParameterForAll = async (
    key: string,
    value: number,
    source: 'manual' | 'drag' | 'preset' = 'drag'
  ) => {
    const tokenIds = tokens.map((token) => token.id);
    if (tokenIds.length === 0) {
      return;
    }

    try {
      const normalizedValue = source === 'manual' ? value : normalizeVisionParameter(key, value);

      await OBR.scene.items.updateItems(tokenIds, (sceneItems) => {
        for (const item of sceneItems) {
          item.metadata[key] = normalizedValue;
        }
      });
    } catch (error) {
      console.error('Error updating vision parameter for all tokens:', error);
      await OBR.notification.show(t('main.notifications.visionUpdateFailed'), 'ERROR');
    }
  };

  const openBulkEdit = (field: BulkVisionField) => {
    const firstToken = orderedTokens[0];
    if (firstToken) {
      const linkedParentId = linkedParentIdByTokenId.get(firstToken.id);
      const tokenSettings = linkedParentId ? tokenById.get(linkedParentId) ?? firstToken : firstToken;
      const vision = getVisionData(tokenSettings);
      setBulkEditValue(vision[field]);
    } else {
      setBulkEditValue(bulkEditConfigs[field].min);
    }

    setBulkEditField(field);
  };

  const updateVisionBlind = async (tokenId: string, isBlind: boolean) => {
    try {
      await OBR.scene.items.updateItems([tokenId], (items) => {
        if (items.length === 0) {
          return;
        }
        items[0].metadata[VISION_BLIND_KEY] = isBlind;
      });
    } catch (error) {
      console.error('Error updating blind parameter:', error);
      await OBR.notification.show(t('main.notifications.blindUpdateFailed'), 'ERROR');
    }
  };

  const selectedToken = useMemo(() => {
    if (!selectedTokenForOwner) {
      return undefined;
    }

    return items.find((item) => item.id === selectedTokenForOwner) as Image | undefined;
  }, [items, selectedTokenForOwner]);

  const selectedTokenIsHidden = selectedToken?.metadata?.[HIDDEN_TOKEN_KEY] === true;

  const handleSetHiddenTokenMetadata = async (hidden: boolean) => {
    if (!selectedTokenForOwner) {
      return;
    }

    try {
      await OBR.scene.items.updateItems([selectedTokenForOwner], (sceneItems) => {
        if (sceneItems.length === 0) {
          return;
        }

        if (hidden) {
          sceneItems[0].metadata[HIDDEN_TOKEN_KEY] = true;
        } else {
          delete sceneItems[0].metadata[HIDDEN_TOKEN_KEY];
        }
      });
      await OBR.notification.show(hidden ? t('main.notifications.tokenHidden') : t('main.notifications.tokenVisible'), 'SUCCESS');
    } catch (error) {
      console.error('Error updating hidden token metadata:', error);
      await OBR.notification.show(t('main.notifications.hiddenUpdateFailed'), 'ERROR');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <MainPageContainer theme={theme}>
        <PageHeaderRow theme={theme}>
          <HeaderTitle theme={theme}>{t('main.tokensTitle')}</HeaderTitle>
          <HeaderRight>
            <SettingsTooltip
              theme={theme}
              text={t('main.tooltips.ignoreHiddenTokens')}
            >
              <HeaderToggleLabel theme={theme}>
                {t('main.ignoreHiddenTokens')}
              </HeaderToggleLabel>
            </SettingsTooltip>
            <ToggleControl
              label={t('main.ignoreHiddenTokensAria')}
              isOn={hideHiddenTokens}
              onChange={setHideHiddenTokens}
            />
          </HeaderRight>
        </PageHeaderRow>

        {tokens.length === 0 ? (
          <EmptyState>{hideHiddenTokens ? t('main.emptyState.noVisibleTokens') : t('main.emptyState.noTokens')}</EmptyState>
        ) : (
          <GridContainer>
            <GridTable $columns={8}>
              {/* Headers */}
              <HeaderCell $accent={theme.BORDER}>
                <SettingsTooltip
                  theme={theme}
                  text={t('main.tooltips.linkInstructions')}
                >
                  <Link size={22} color={theme.PRIMARY} />
                </SettingsTooltip>
              </HeaderCell>
              <HeaderCell $accent={STAT_COLORS[0]}>
                <SettingsTooltip theme={theme} text={tooltips.visionRange}>
                  <HeaderIconButton $accent={STAT_COLORS[0]} onClick={() => openBulkEdit('range')} aria-label={t('presets.range')}>
                    <HeaderIcon src="/visionRange.svg" alt={t('presets.range')} />
                  </HeaderIconButton>
                </SettingsTooltip>
              </HeaderCell>
              <HeaderCell $accent={STAT_COLORS[1]}>
                <SettingsTooltip theme={theme} text={tooltips.visionCollision}>
                  <HeaderIconButton $accent={STAT_COLORS[1]} onClick={() => openBulkEdit('collision')} aria-label={t('presets.collision')}>
                    <HeaderIcon src="/visionBumper.svg" alt={t('presets.collision')} />
                  </HeaderIconButton>
                </SettingsTooltip>
              </HeaderCell>
              <HeaderCell $accent={STAT_COLORS[2]}>
                <SettingsTooltip theme={theme} text={tooltips.visionInnerAngle}>
                  <HeaderIconButton $accent={STAT_COLORS[2]} onClick={() => openBulkEdit('innerAngle')} aria-label={t('presets.innerAngle')}>
                    <HeaderIcon src="/visionInner.svg" alt={t('presets.innerAngle')} />
                  </HeaderIconButton>
                </SettingsTooltip>
              </HeaderCell>
              <HeaderCell $accent={STAT_COLORS[3]}>
                <SettingsTooltip theme={theme} text={tooltips.visionOuterAngle}>
                  <HeaderIconButton $accent={STAT_COLORS[3]} onClick={() => openBulkEdit('outerAngle')} aria-label={t('presets.outerAngle')}>
                    <HeaderIcon src="/visionOuter.svg" alt={t('presets.outerAngle')} />
                  </HeaderIconButton>
                </SettingsTooltip>
              </HeaderCell>
              <HeaderCell $accent={STAT_COLORS[4]}>
                <SettingsTooltip theme={theme} text={tooltips.visionFalloff}>
                  <HeaderIconButton $accent={STAT_COLORS[4]} onClick={() => openBulkEdit('falloff')} aria-label={t('presets.falloff')}>
                    <HeaderIcon src="/visionFalloff.svg" alt={t('presets.falloff')} />
                  </HeaderIconButton>
                </SettingsTooltip>
              </HeaderCell>
              <HeaderCell $accent={STAT_COLORS[5]}>
                <SettingsTooltip theme={theme} text={tooltips.visionDarkness}>
                  <HeaderIconButton $accent={STAT_COLORS[5]} onClick={() => openBulkEdit('darkness')} aria-label={t('presets.darkvision')}>
                    <HeaderIcon src="/darkvision.svg" alt={t('presets.darkvision')} />
                  </HeaderIconButton>
                </SettingsTooltip>
              </HeaderCell>
              <HeaderCell $accent={theme.BORDER}>
                <SettingsTooltip theme={theme} text={tooltips.visionBlind}>
                  <EyeOffIcon style={{ color: '#fff' }} />
                </SettingsTooltip>
              </HeaderCell>

              <MobileColumnHeaders>
                <MobileHeaderItem $area="link" $accent={theme.BORDER}>
                  <SettingsTooltip
                    theme={theme}
                    text={t('main.tooltips.linkInstructions')}
                  >
                    <Link size={20} color={theme.PRIMARY} />
                  </SettingsTooltip>
                </MobileHeaderItem>
                <MobileHeaderItem $area="range" $accent={STAT_COLORS[0]}>
                  <SettingsTooltip theme={theme} text={tooltips.visionRange}>
                    <HeaderIconButton $accent={STAT_COLORS[0]} onClick={() => openBulkEdit('range')} aria-label={t('presets.range')}>
                      <HeaderIcon src="/visionRange.svg" alt={t('presets.range')} />
                    </HeaderIconButton>
                  </SettingsTooltip>
                </MobileHeaderItem>
                <MobileHeaderItem $area="collision" $accent={STAT_COLORS[1]}>
                  <SettingsTooltip theme={theme} text={tooltips.visionCollision}>
                    <HeaderIconButton $accent={STAT_COLORS[1]} onClick={() => openBulkEdit('collision')} aria-label={t('presets.collision')}>
                      <HeaderIcon src="/visionBumper.svg" alt={t('presets.collision')} />
                    </HeaderIconButton>
                  </SettingsTooltip>
                </MobileHeaderItem>
                <MobileHeaderItem $area="inner" $accent={STAT_COLORS[2]}>
                  <SettingsTooltip theme={theme} text={tooltips.visionInnerAngle}>
                    <HeaderIconButton $accent={STAT_COLORS[2]} onClick={() => openBulkEdit('innerAngle')} aria-label={t('presets.innerAngle')}>
                      <HeaderIcon src="/visionInner.svg" alt={t('presets.innerAngle')} />
                    </HeaderIconButton>
                  </SettingsTooltip>
                </MobileHeaderItem>
                <MobileHeaderItem $area="outer" $accent={STAT_COLORS[3]}>
                  <SettingsTooltip theme={theme} text={tooltips.visionOuterAngle}>
                    <HeaderIconButton $accent={STAT_COLORS[3]} onClick={() => openBulkEdit('outerAngle')} aria-label={t('presets.outerAngle')}>
                      <HeaderIcon src="/visionOuter.svg" alt={t('presets.outerAngle')} />
                    </HeaderIconButton>
                  </SettingsTooltip>
                </MobileHeaderItem>
                <MobileHeaderItem $area="falloff" $accent={STAT_COLORS[4]}>
                  <SettingsTooltip theme={theme} text={tooltips.visionFalloff}>
                    <HeaderIconButton $accent={STAT_COLORS[4]} onClick={() => openBulkEdit('falloff')} aria-label={t('presets.falloff')}>
                      <HeaderIcon src="/visionFalloff.svg" alt={t('presets.falloff')} />
                    </HeaderIconButton>
                  </SettingsTooltip>
                </MobileHeaderItem>
                <MobileHeaderItem $area="darkness" $accent={STAT_COLORS[5]}>
                  <SettingsTooltip theme={theme} text={tooltips.visionDarkness}>
                    <HeaderIconButton $accent={STAT_COLORS[5]} onClick={() => openBulkEdit('darkness')} aria-label={t('presets.darkvision')}>
                      <HeaderIcon src="/darkvision.svg" alt={t('presets.darkvision')} />
                    </HeaderIconButton>
                  </SettingsTooltip>
                </MobileHeaderItem>
                <MobileHeaderItem $area="blind" $accent={theme.BORDER}>
                  <SettingsTooltip theme={theme} text={tooltips.visionBlind}>
                    <EyeOffIcon style={{ color: '#fff' }} />
                  </SettingsTooltip>
                </MobileHeaderItem>
              </MobileColumnHeaders>

              {/* Token rows */}
              {orderedTokens.map((token) => {
                const linkedParentId = linkedParentIdByTokenId.get(token.id);
                const linkedParent = linkedParentId ? tokenById.get(linkedParentId) : undefined;
                const tokenSettings = linkedParent ?? token;
                const vision = getVisionData(tokenSettings);
                const ownerName = ownerNameById.get(token.createdUserId) || t('main.ownerFallback');
                const isDropTarget = dropTargetTokenId === token.id;
                const isDragging = draggedTokenId === token.id;
                return (
                  <TokenGridRow key={token.id}>
                    <TokenHeaderCell>
                      <TokenNameCell
                        draggable
                        $isDragging={isDragging}
                        $isDropTarget={isDropTarget}
                        $isSelected={playerData && playerData.selection?.[0] === token.id ? true : false}
                        onClick={() => handleNameClick(token.id)}
                        onContextMenu={(e) => handleTokenRightClick(token, e)}
                        onDragStart={(e) => handleTokenDragStart(token, e)}
                        onDragEnd={handleTokenDragEnd}
                        onDragOver={(e) => handleTokenDragOver(token.id, e)}
                        onDragLeave={() => {
                          if (dropTargetTokenId === token.id) {
                            setDropTargetTokenId(null);
                          }
                        }}
                        onDrop={(e) => handleTokenDrop(token, e)}
                      >
                        {token.name} <TokenOwnerCell> - {ownerName}</TokenOwnerCell></TokenNameCell>
                    </TokenHeaderCell>

                    <LinkIndicatorCell>
                      {linkedParent ? (
                        <SettingsTooltip
                          theme={theme}
                          text={t('main.linkedTo', { token: linkedParent.text?.plainText || linkedParent.name || t('main.parentTokenFallback') })}
                        >
                          <Link size={20} color={theme.OFFSET} />
                        </SettingsTooltip>
                      ) : null}
                    </LinkIndicatorCell>

                    <ParameterCell $mobileArea="range">
                      <PresetInput
                        value={vision.range}
                        onChange={(v, source) => updateVisionParameter(tokenSettings.id, VISION_RANGE_KEY, v, source)}
                        min={0}
                        max={120}
                        accent={DEFAULT_THEME.OFFSET}
                        mode={mode}
                        presets={[0, 15, 30, 45, 60, 75, 90]}
                      />
                    </ParameterCell>

                    <ParameterCell $mobileArea="collision">
                      <PresetInput
                        value={vision.collision}
                        onChange={(v, source) => updateVisionParameter(tokenSettings.id, VISION_SOURCE_KEY, v, source)}
                        min={0}
                        max={20}
                        accent={DEFAULT_THEME.OFFSET}
                        mode={mode}
                        presets={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]}
                      />
                    </ParameterCell>

                    <ParameterCell $mobileArea="inner">
                      <PresetInput
                        value={vision.innerAngle}
                        onChange={(v, source) => updateVisionParameter(tokenSettings.id, VISION_IN_ANGLE_KEY, v, source)}
                        min={0}
                        max={360}
                        accent={DEFAULT_THEME.OFFSET}
                        mode={mode}
                        presets={[0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360]}
                      />
                    </ParameterCell>

                    <ParameterCell $mobileArea="outer">
                      <PresetInput
                        value={vision.outerAngle}
                        onChange={(v, source) => updateVisionParameter(tokenSettings.id, VISION_OUT_ANGLE_KEY, v, source)}
                        min={0}
                        max={360}
                        accent={DEFAULT_THEME.OFFSET}
                        mode={mode}
                        presets={[0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360]}
                      />
                    </ParameterCell>

                    <ParameterCell $mobileArea="falloff">
                      <PresetInput
                        value={Math.round(vision.falloff * 10) / 10}
                        onChange={(v, source) => updateVisionParameter(tokenSettings.id, VISION_FALLOFF_KEY, v, source)}
                        min={0}
                        max={1}
                        accent={DEFAULT_THEME.OFFSET}
                        mode={mode}
                        step={0.1}
                        presets={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                      />
                    </ParameterCell>

                    <ParameterCell $mobileArea="darkness">
                      <PresetInput
                        value={vision.darkness}
                        onChange={(v, source) => updateVisionParameter(tokenSettings.id, VISION_DARKNESS_KEY, v, source)}
                        min={0}
                        max={100}
                        accent={DEFAULT_THEME.OFFSET}
                        mode={mode}
                        presets={[0, 15, 30, 45, 60, 75, 90]}
                      />
                    </ParameterCell>

                    <BlindCell>
                      <StyledCheckbox
                        theme={theme}
                        type="checkbox"
                        checked={vision.blind}
                        onChange={(e) => updateVisionBlind(tokenSettings.id, e.target.checked)}
                        aria-label={t('main.aria.blind')}
                      />
                    </BlindCell>
                  </TokenGridRow>
                );
              })}
            </GridTable>
          </GridContainer>
        )}

        <OwnerModalOverlay $isOpen={ownerModalOpen} onClick={() => setOwnerModalOpen(false)}>
          <OwnerModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <OwnerModalTitle theme={theme}>{t('main.modal.changeTokenOwner')}</OwnerModalTitle>
            <OwnerPlayerList theme={theme}>
              {partyData.map((player) => (
                <OwnerPlayerItem
                  key={player.id}
                  theme={theme}
                  style={{ background: player.color + '50' || theme.OFFSET, textShadow: '2px 2px 2px rgba(0, 0, 0, 0.9)' }}
                  onClick={() => handleOwnerSelect(player.id)}
                >
                  {player.name}
                </OwnerPlayerItem>
              ))}
              {playerData && (
                <OwnerPlayerItem
                  key={playerData.id}
                  theme={theme}
                  style={{ textShadow: '2px 2px 2px rgba(0, 0, 0, 0.9)' }}
                  onClick={() => handleOwnerSelect(playerData.id)}
                >
                  {t('main.modal.youLabel', { name: playerData.name })}
                </OwnerPlayerItem>
              )}
            </OwnerPlayerList>

            <OwnerModalSection theme={theme}>
              <OwnerModalActionRow>
                <HeaderToggleLabel theme={theme}>
                  {t('main.modal.addToHiddenList')}
                </HeaderToggleLabel>
                <StyledCheckbox
                  theme={theme}
                  type="checkbox"
                  checked={selectedTokenIsHidden}
                  onChange={() => handleSetHiddenTokenMetadata(!selectedTokenIsHidden)}
                  aria-label={t('main.aria.hideTokenFromList')}
                />
              </OwnerModalActionRow>
            </OwnerModalSection>
          </OwnerModalContent>
        </OwnerModalOverlay>

        <OwnerModalOverlay $isOpen={bulkEditField !== null} onClick={() => setBulkEditField(null)}>
          <BulkEditModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            {bulkEditField ? (
              <>
                <BulkEditModalTitle theme={theme}>{bulkEditConfigs[bulkEditField].label}</BulkEditModalTitle>
                <PresetInput
                  value={bulkEditValue}
                  onChange={(value, source) => {
                    setBulkEditValue(value);
                    void updateVisionParameterForAll(bulkEditConfigs[bulkEditField].key, value, source);
                  }}
                  min={bulkEditConfigs[bulkEditField].min}
                  max={bulkEditConfigs[bulkEditField].max}
                  accent={bulkEditConfigs[bulkEditField].accent}
                  mode={mode}
                  step={bulkEditConfigs[bulkEditField].step}
                  presets={bulkEditConfigs[bulkEditField].presets}
                />
                <BulkEditModalTitle style={{ paddingTop: '10px' }} theme={theme}>Bulk Edit</BulkEditModalTitle> 
              </>
            ) : null}
          </BulkEditModalContent>
        </OwnerModalOverlay>
      </MainPageContainer>
    </motion.div>
  );
};
