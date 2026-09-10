import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { DEFAULT_THEME } from '../../helpers/ThemeConstants';
import { useTranslation } from '../../i18n/Translation';

interface NumberRollerProps {
  value: number;
  onChange: (value: number, source?: 'manual' | 'drag' | 'preset') => void;
  min?: number;
  max?: number;
  step?: number;
  accent?: string;
}

const RollerContainer = styled.div`
  width: 46px;
  height: 40px;
  border-radius: 8px;
  position: relative;
  background: #31363A;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  cursor: ns-resize;
  border: 2px solid #1B1E1F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: #EDEAE3;
`;

const FillBar = styled.div<{ $fillPct: number; $accent?: string }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${props => props.$fillPct}%;
  background: ${props => props.$accent || '#C98A3E'};
  opacity: 0.35;
  transition: height 120ms ease;
  pointer-events: none;
`;

const ValueDisplay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
`;

const StyledInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #EDEAE3;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  z-index: 3;
`;

const ChevronButton = styled.button<{ $position: 'top' | 'bottom' }>`
  position: absolute;
  ${props => props.$position}: 1px;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  border: none;
  color: rgba(237, 234, 227, 0.45);
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;

  &:hover {
    color: rgba(237, 234, 227, 0.7);
  }
`;

export const NumberRoller: React.FC<NumberRollerProps> = ({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  accent = DEFAULT_THEME.OFFSET,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [displayValue, setDisplayValue] = useState(value);
  const dragRef = useRef<{ startY: number; startVal: number; currentVal: number; moved: boolean } | null>(null);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const clamp = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    // Round to step precision
    const steppedValue = Math.round(clamped / step) * step;
    // Round to avoid floating point errors
    const decimals = (step.toString().split('.')[1] || '').length;
    return parseFloat(steppedValue.toFixed(decimals));
  };

  const commitDraft = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    const nextValue = Number.isNaN(parsed) ? 0 : parsed;
    onChange(nextValue, 'manual');
    setEditing(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editing) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startVal: value, currentVal: value, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.clientY;
    if (Math.abs(dy) > 4) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;
    
    // Calculate how many steps have been moved
    const stepsToMove = Math.round(dy / 6);
    const next = clamp(dragRef.current.startVal + stepsToMove * step);
    
    if (next !== dragRef.current.currentVal) {
      dragRef.current.currentVal = next;
      setDisplayValue(next);
    }
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    const wasDrag = dragRef.current.moved;
    const finalValue = dragRef.current.currentVal;
    dragRef.current = null;
    if (wasDrag) {
      if (finalValue !== value) onChange(finalValue, 'drag');
      setDraft(String(finalValue));
      setDisplayValue(finalValue);
    } else {
      setDraft(String(value));
      setEditing(true);
    }
  };

  const handleStep = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(clamp(value + delta * step), 'preset');
  };

  const fillPct = Math.max(0, Math.min(100, ((displayValue - min) / (max - min)) * 100));

  return (
    <RollerContainer
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <FillBar $fillPct={fillPct} $accent={accent} />
      {editing ? (
        <StyledInput
          autoFocus
          value={draft}
          onChange={(e) => {
            // Allow digits and a single decimal point
            let val = e.target.value;
            // Remove multiple decimal points
            const decimalCount = (val.match(/\./g) || []).length;
            if (decimalCount > 1) {
              val = val.replace(/\.(?=.*\.)/g, '');
            }
            setDraft(val.replace(/[^\d.]/g, ''));
          }}
          onBlur={() => commitDraft(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft(draft);
            if (e.key === 'Escape') setEditing(false);
          }}
          inputMode="decimal"
        />
      ) : (
        <>
          <ValueDisplay>{Number(displayValue.toFixed(3))}</ValueDisplay>
          <ChevronButton
            $position="top"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => handleStep(1, e)}
            aria-label={t('common.increase')}
          >
            <ChevronUp size={8} />
          </ChevronButton>
          <ChevronButton
            $position="bottom"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => handleStep(-1, e)}
            aria-label={t('common.decrease')}
          >
            <ChevronDown size={8} />
          </ChevronButton>
        </>
      )}
    </RollerContainer>
  );
};
