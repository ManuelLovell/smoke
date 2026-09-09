import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { DEFAULT_THEME } from '../../helpers/ThemeConstants';

interface FlyWheelProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accent?: string;
  presets?: number[];
}

const DEFAULT_PRESETS = [0, 15, 30, 45, 60, 75, 90];

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const wedgePath = (
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startDeg: number,
  endDeg: number
): string => {
  const p1 = polar(cx, cy, rOuter, startDeg);
  const p2 = polar(cx, cy, rOuter, endDeg);
  const p3 = polar(cx, cy, rInner, endDeg);
  const p4 = polar(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
};

const DialContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const DialButton = styled.div<{ $accent?: string; $editing?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #24282A;
  border: 2px solid ${props => props.$accent || '#C98A3E'};
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  user-select: none;
  cursor: ${props => props.$editing ? 'text' : 'grab'};
  position: relative;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #EDEAE3;
  z-index: 1;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  border: none;
  outline: none;
  color: #EDEAE3;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  padding: 0;
`;

const OverlayContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8));
`;

const OverlaySVG = styled.svg`
  overflow: visible;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9));
`;

export const FlyWheel: React.FC<FlyWheelProps> = ({
  value,
  onChange,
  min = 0,
  max = 99,
  accent = DEFAULT_THEME.OFFSET,
  presets = DEFAULT_PRESETS,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ moved: boolean } | null>(null);
  const maxLen = String(max).length;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const commitDraft = (raw: string) => {
    const n = clamp(parseInt(raw, 10) || 0);
    onChange(n);
    setEditing(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editing) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const c = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      setCenter(c);
      btnRef.current.setPointerCapture(e.pointerId);
      dragRef.current = { moved: false };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !center) return;
    const dx = e.clientX - center.x;
    const dy = e.clientY - center.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 14) {
      dragRef.current.moved = true;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      angle = (angle + 360) % 360;
      const degreesPerWedge = 360 / presets.length;
      const idx = Math.round(angle / degreesPerWedge) % presets.length;
      setActiveSlice(idx);
    } else {
      setActiveSlice(null);
    }
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    const wasDrag = dragRef.current.moved;
    const idx = activeSlice;
    dragRef.current = null;
    setActiveSlice(null);
    setCenter(null);
    if (wasDrag && idx != null && presets[idx] !== undefined) {
      onChange(clamp(presets[idx]));
    } else {
      setDraft(String(value));
      setEditing(true);
    }
  };

  const showOverlay = center != null;

  return (
    <DialContainer>
      <DialButton
        ref={btnRef}
        $accent={accent}
        $editing={editing ? 'true' : undefined }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {editing ? (
          <StyledInput
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, maxLen))}
            onBlur={() => commitDraft(draft)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDraft(draft);
              if (e.key === 'Escape') setEditing(false);
            }}
            inputMode="numeric"
          />
        ) : (
          <span>{value}</span>
        )}
      </DialButton>

      {showOverlay && center && (
        <OverlayContainer>
          <OverlaySVG width="180" height="180" viewBox="0 0 180 180">
            {presets.map((preset, i) => {
              const degreesPerWedge = 360 / presets.length;
              const start = i * degreesPerWedge - degreesPerWedge / 2;
              const end = i * degreesPerWedge + degreesPerWedge / 2;
              const isActive = activeSlice === i;
              const isSelected = value === preset;
              const mid = polar(90, 90, 66, i * degreesPerWedge);
              return (
                <g key={i}>
                  <path
                    d={wedgePath(90, 90, 82, 40, start, end)}
                    fill={isActive ? accent : isSelected ? '#506772' : '#2A2E30'}
                    opacity={1}
                    stroke={isActive ? accent : isSelected ? '#555' : '#555'}
                    strokeWidth={isActive ? 3 : 1.5}
                    style={{ transition: 'all 80ms ease' }}
                  />
                  <text
                    x={mid.x}
                    y={mid.y}
                    fill={isActive ? '#000' : '#FFF'}
                    fontFamily="'IBM Plex Mono', monospace"
                    fontSize={isActive ? 16 : 14}
                    fontWeight={700}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: 'none', transition: 'all 80ms ease' }}
                  >
                    {preset}
                  </text>
                </g>
              );
            })}
            <circle cx={90} cy={90} r={38} fill="#24282A" stroke={accent} strokeWidth={2} />
          </OverlaySVG>
        </OverlayContainer>
      )}
    </DialContainer>
  );
};
