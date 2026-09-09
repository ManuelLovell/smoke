import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { rgbaFromHex } from '../helpers/ThemeConstants';
import { createPortal } from 'react-dom';
import { SmokeTheme } from '../interfaces/theme';

const TooltipAnchor = styled.span<{ theme: SmokeTheme }>`
  display: inline-flex;
  align-items: center;
`;

const TooltipBubble = styled.span<{ theme: SmokeTheme; $left: number; $top: number; $arrowX: number; $placement: 'top' | 'bottom' }>`
  position: fixed;
  left: ${props => `${props.$left}px`};
  top: ${props => `${props.$top}px`};
  z-index: 99999;
  width: max-content;
  max-width: min(320px, calc(100vw - 16px));
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${props => rgbaFromHex(props.theme.BORDER, 0.9)};
  background: ${props => rgbaFromHex(props.theme.BACKGROUND, 0.96)};
  color: ${props => props.theme.PRIMARY};
  font-size: 12px;
  line-height: 1.3;
  text-align: left;
  box-shadow: 0 8px 24px ${props => rgbaFromHex(props.theme.BACKGROUND, 0.65)};
  backdrop-filter: blur(8px);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    left: clamp(12px, ${props => `${props.$arrowX}px`}, calc(100% - 12px));
    ${props => props.$placement === 'bottom' ? 'bottom: 100%;' : 'top: 100%;'}
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    ${props => props.$placement === 'bottom'
    ? `border-bottom: 6px solid ${rgbaFromHex(props.theme.BACKGROUND, 0.96)};`
    : `border-top: 6px solid ${rgbaFromHex(props.theme.BACKGROUND, 0.96)};`}
  }
`;

const TooltipTrigger = styled.span`
  display: inline-flex;
  align-items: center;
`;

interface SettingsTooltipProps {
  theme: SmokeTheme;
  text: string;
  children: React.ReactNode;
}

export const SettingsTooltip = ({ theme, text, children }: SettingsTooltipProps) => {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const bubbleRef = useRef<HTMLSpanElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; arrowX: number; placement: 'top' | 'bottom' }>({
    left: 8,
    top: 8,
    arrowX: 16,
    placement: 'bottom',
  });

  const updatePosition = () => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const bubbleWidth = bubbleRect.width;
    const bubbleHeight = bubbleRect.height;
    const viewportPadding = 8;
    const verticalGap = 8;
    const anchorX = rect.left + (rect.width / 2);
    const unclampedLeft = anchorX - (bubbleWidth / 2);
    const maxLeft = window.innerWidth - bubbleWidth - viewportPadding;
    const left = Math.min(Math.max(unclampedLeft, viewportPadding), Math.max(viewportPadding, maxLeft));

    const preferredBottomTop = rect.bottom + verticalGap;
    const preferredTopTop = rect.top - bubbleHeight - verticalGap;
    const canRenderBottom = preferredBottomTop + bubbleHeight <= (window.innerHeight - viewportPadding);
    const canRenderTop = preferredTopTop >= viewportPadding;
    const placement: 'top' | 'bottom' = canRenderBottom || !canRenderTop ? 'bottom' : 'top';
    const top = placement === 'bottom'
      ? preferredBottomTop
      : Math.max(viewportPadding, preferredTopTop);
    const arrowX = anchorX - left;

    setPosition({ left, top, arrowX, placement });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    const onReposition = () => {
      updatePosition();
    };

    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [isOpen]);

  return (
    <TooltipAnchor theme={theme}>
      <TooltipTrigger
        ref={triggerRef}
        tabIndex={0}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {children}
      </TooltipTrigger>
      {isOpen && (
        createPortal(
          <TooltipBubble
            ref={bubbleRef}
            theme={theme}
            role="tooltip"
            $left={position.left}
            $top={position.top}
            $arrowX={position.arrowX}
            $placement={position.placement}
          >
            {text}
          </TooltipBubble>,
          document.body,
        )
      )}
    </TooltipAnchor>
  );
};
