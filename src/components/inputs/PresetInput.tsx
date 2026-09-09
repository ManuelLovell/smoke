import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { DEFAULT_THEME } from '../../helpers/ThemeConstants';
import { FlyWheel } from './FlyWheel';
import { NumberRoller } from './NumberRoller';

interface PresetInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  accent?: string;
  mode?: 'flywheel' | 'roller';
  label?: string;
  presets?: number[];
  step?: number;
}

const Container = styled.div`
  ${tw`flex flex-col gap-2 items-center`}
`;

const ControlWrapper = styled.div`
  ${tw`flex justify-center`}
`;



const Label = styled.label<{ $accent?: string }>`
  ${tw`text-xs font-semibold`}
  color: ${props => props.$accent || '#C98A3E'};
`;

export const PresetInput: React.FC<PresetInputProps> = ({
  value,
  onChange,
  min,
  max,
  accent = DEFAULT_THEME.OFFSET,
  mode = 'flywheel',
  label,
  presets,
  step = 1,
}) => {
  return (
    <Container>
      {label && <Label $accent={accent}>{label}</Label>}
      <ControlWrapper>
        {mode === 'flywheel' ? (
          <FlyWheel value={value} onChange={onChange} min={min} max={max} accent={accent} presets={presets} />
        ) : (
          <NumberRoller value={value} onChange={onChange} min={min} max={max} step={step} accent={accent} />
        )}
      </ControlWrapper>
    </Container>
  );
};
