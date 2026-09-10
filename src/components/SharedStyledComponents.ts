import styled from 'styled-components';
import { rgbaFromHex } from '../helpers/ThemeConstants';
import tw from 'twin.macro';
import type { SmokeTheme } from '../interfaces/theme';

/**
 * Shared styled components that can be reused across the application
 * All components use the theme system for consistent styling
 */

export const PageContainer = styled.div<{ theme: SmokeTheme }>`
  padding: 10px;
  color: ${props => props.theme.PRIMARY};
  min-height: 100vh;
`;

export const PageTitle = styled.h1<{ theme: SmokeTheme }>`
  color: ${props => props.theme.PRIMARY};
  background-color: ${props => props.theme.OFFSET};
  padding: 2px;
  border-radius: 6px;
  border: 2px solid ${props => props.theme.BORDER};
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: bold;
  font-variant: small-caps;
`;

export const Card = styled.div<{ theme: SmokeTheme }>`
  background-color: ${props => rgbaFromHex(props.theme.BACKGROUND, 0.1)};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  padding: 10px;
  margin: 15px 0;
  backdrop-filter: blur(8px);
  gap: 10px;
  display: flex;
  flex-direction: column;
`;

export const CardHeader = styled.div<{ theme: SmokeTheme }>`
  background-color: ${props => props.theme.OFFSET};
  color: ${props => props.theme.PRIMARY};
  padding: 12px 15px;
  border-radius: 6px 6px 0 0;
  margin: -20px -20px 15px -20px;
  font-weight: 600;
  font-size: 18px;
`;

export const Button = styled.button<{ theme: SmokeTheme; variant?: 'primary' | 'secondary' }>`
  background-color: ${props => rgbaFromHex(props.theme.OFFSET, props.variant === 'secondary' ? 0.5 : 0.75)};
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  padding: 8px 8px;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => rgbaFromHex(props.theme.OFFSET, 0.9)};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Input = styled.input<{ theme: SmokeTheme }>`
  background-color: rgba(0, 0, 0, 0.5);
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  padding: 8px 8px;
  font-size: 14px;
  width: 100%;
  
  &::placeholder {
    color: ${props => rgbaFromHex(props.theme.PRIMARY, 0.5)};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.OFFSET};
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

export const TextArea = styled.textarea<{ theme: SmokeTheme }>`
  background-color: rgba(0, 0, 0, 0.5);
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  padding: 10px 15px;
  font-size: 14px;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &::placeholder {
    color: ${props => rgbaFromHex(props.theme.PRIMARY, 0.5)};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.OFFSET};
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

export const Select = styled.select<{ theme: SmokeTheme }>`
  background-color: rgba(0, 0, 0, 0.5);
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.OFFSET};
    background-color: rgba(0, 0, 0, 0.6);
  }
  
  option {
    background-color: ${props => props.theme.BACKGROUND};
    color: ${props => props.theme.PRIMARY};
  }
`;

export const Label = styled.label<{ theme: SmokeTheme }>`
  color: ${props => props.theme.PRIMARY};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
`;

export const Divider = styled.hr<{ theme: SmokeTheme }>`
  border: none;
  border-top: 2px solid ${props => props.theme.BORDER};
  margin: 20px 0;
`;

export const Text = styled.p<{ theme: SmokeTheme }>`
  color: ${props => props.theme.PRIMARY};
  line-height: 1.6;
  margin: 10px 0;
`;

export const Badge = styled.span<{ theme: SmokeTheme }>`
  background-color: ${props => rgbaFromHex(props.theme.OFFSET, 0.75)};
  color: ${props => props.theme.PRIMARY};
  border: 1px solid ${props => props.theme.BORDER};
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
`;

export const List = styled.ul<{ theme: SmokeTheme }>`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ListItem = styled.li<{ theme: SmokeTheme }>`
  padding: 12px 15px;
  border-bottom: 1px solid ${props => props.theme.BORDER};
  color: ${props => props.theme.PRIMARY};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => rgbaFromHex(props.theme.OFFSET, 0.2)};
  }
`;


// Styled Components
export const SectionTitle = styled.h2<{ theme: SmokeTheme }>`
  ${tw`text-xl font-semibold mb-4 pb-2`}
  color: ${props => props.theme.PRIMARY};
  border-bottom: 2px solid ${props => props.theme.BORDER};
`;

export const ControlRow = styled.div<{ theme: SmokeTheme }>`
  ${tw`flex items-center justify-between py-1 gap-2`}
  color: ${props => props.theme.PRIMARY};
`;

export const ControlLabel = styled.label<{ theme: SmokeTheme }>`
  ${tw`text-base cursor-pointer flex-1 text-left`}
  color: ${props => props.theme.PRIMARY};
`;

export const SubControlRow = styled.div<{ theme: SmokeTheme }>`
  ${tw`flex items-center place-content-between gap-3 ml-4`}
  color: ${props => props.theme.PRIMARY};
`;

export const SubControlLabel = styled.label<{ theme: SmokeTheme }>`
  ${tw`text-sm`}
  text-align: left;
  color: ${props => props.theme.PRIMARY};
  width: 50%;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SubControlHint = styled.p<{ theme: SmokeTheme }>`
  ${tw`text-xs mt-1`}
  color: ${props => rgbaFromHex(props.theme.PRIMARY, 0.7)};
`;

export const SmallInput = styled.input<{ theme: SmokeTheme }>`
  ${tw`rounded px-3 py-1 text-sm`}
  background-color: rgba(0, 0, 0, 0.5);
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  width: 50% !important;
  
  &::placeholder {
    color: ${props => rgbaFromHex(props.theme.PRIMARY, 0.5)};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.OFFSET};
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

export const SmallSelect = styled.select<{ theme: SmokeTheme }>`
  ${tw`rounded px-3 py-1 text-sm`}
  background-color: rgba(0, 0, 0, 0.5);
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  width: 50%;
  height: 100%;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.OFFSET};
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

export const InlineActionButton = styled.button<{ theme: SmokeTheme }>`
  background-color: ${props => rgbaFromHex(props.theme.OFFSET, 0.45)};
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  white-space: nowrap;

  &:hover {
    background-color: ${props => props.theme.OFFSET};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const InlineActionSubButton = styled.button<{ theme: SmokeTheme }>`
  background-color: ${props => rgbaFromHex(props.theme.OFFSET, 0.45)};
  color: ${props => props.theme.PRIMARY};
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 6px;
  justify-items: center;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  width: 50px;
  white-space: nowrap;

  &:hover {
    background-color: ${props => props.theme.OFFSET};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = tw.div`
  flex gap-3 mt-2 justify-center
`;

export const AuthStatus = styled.p<{ theme: SmokeTheme; $connected: boolean }>`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${props => props.$connected ? props.theme.PRIMARY : rgbaFromHex(props.theme.PRIMARY, 0.75)};
`;

export const ModalText = styled.p<{ theme: SmokeTheme }>`
  color: ${props => rgbaFromHex(props.theme.PRIMARY, 0.9)};
  margin: 0;
  line-height: 1.5;
`;

export const StyledCheckbox = styled.input<{ theme: SmokeTheme }>`
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid white;
  background: ${props => props.theme.BACKGROUND};
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${props => props.theme.OFFSET};
    transform: translateY(-1px);
  }

  &:checked {
    background: ${props => props.theme.OFFSET};
    border-color: ${props => props.theme.OFFSET};
    box-shadow: inset 0 0 0 3px ${props => props.theme.BACKGROUND};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.OFFSET};
    outline-offset: 2px;
  }
`;