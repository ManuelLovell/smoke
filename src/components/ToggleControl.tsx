import styled from 'styled-components';
import tw from 'twin.macro';
import LOGGER from '../helpers/Logger';
import { useSmokeTheme } from '../helpers/ThemeContext';
import { rgbaFromHex } from '../helpers/ThemeConstants';
import { useSceneStore } from '../helpers/BSCache';
import { TrackSMOKEEvent } from '../metrics/SmokeMetrics';
import { SmokeTheme } from '../interfaces/theme';

const ToggleSwitch = styled.button<{ $isOn: boolean; theme: SmokeTheme }>`
  ${tw`relative inline-flex h-6 w-12 items-center rounded-full transition-colors`}
  background-color: ${props => props.$isOn 
    ? rgbaFromHex(props.theme.OFFSET, 0.7)
    : rgbaFromHex(props.theme.BORDER, 0.7)};
  border: 2px solid ${props => props.theme.BORDER};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => rgbaFromHex(props.theme.OFFSET, 0.3)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &::after {
    content: '';
    ${tw`inline-block h-4 w-4 transform rounded-full transition-transform`}
    background-color: ${props => props.theme.PRIMARY};
    ${props => props.$isOn ? 'transform: translateX(1.375rem);' : 'transform: translateX(0.25rem);'}
  }
`;

interface ToggleControlProps {
  label: string;
  isOn: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ToggleControl = ({ label, isOn, onChange, disabled = false }: ToggleControlProps) => {
  const { theme } = useSmokeTheme();
  const playerId = useSceneStore((state) => state.playerData?.id ?? null);
  
  return (
    <ToggleSwitch
      theme={theme}
      $isOn={isOn}
      onClick={() => {
        if (disabled) return;

        const newValue = !isOn;
        LOGGER.log(`${label}: ${newValue}`);
        void TrackSMOKEEvent({
          eventName: 'toggle_used',
          eventCategory: 'ui',
          playerId,
          success: true,
          metadata: {
            label,
            next_value: newValue,
          },
        });
        onChange(newValue);
      }}
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
    />
  );
};
