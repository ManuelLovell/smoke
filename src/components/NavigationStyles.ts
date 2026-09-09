import tw from 'twin.macro';
import styled from "styled-components";
import { motion } from 'framer-motion';
import { rgbaFromHex } from '../helpers/ThemeConstants';
import { SmokeTheme } from '../interfaces/theme';

export const AppContainer = tw.div`
  flex flex-col h-screen relative bg-transparent
`;

export const ContentArea = styled.div<{ theme: SmokeTheme; $backgroundUrl?: string }>`
  ${tw`flex-1 overflow-auto relative`}
  scrollbar-gutter: stable;
  
  ${props => props.$backgroundUrl && `
    &::before {
      content: '';
      position: fixed;
      height: 350px;
      width: 350px;
      right: 0;
      bottom: 56px;
      filter: blur(2px);
      background-image: url(${props.$backgroundUrl});
      background-size: contain;
      background-repeat: no-repeat;
      background-position: bottom right;
      opacity: 0.3;
      pointer-events: none;
      z-index: -1;
    }
  `}
`;

export const MenuOverlay = styled(motion.div) <{ theme: SmokeTheme }>`
  ${tw`fixed top-0 left-0 bottom-0 w-[150px] flex flex-col z-[1000] backdrop-blur`}
  background: #2e2838;
  border: 2px solid ${props => props.theme.BORDER};
  border-radius: 16px;
`;

export const MenuHeader = styled.div<{ theme: SmokeTheme }>`
  ${tw`p-5 flex-none`}
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid ${props => props.theme.BORDER};
  background-color: ${props => props.theme.OFFSET};
  border-radius: 12px 12px 0 0;
`;

export const MenuSubText = styled.div<{ theme: SmokeTheme }>`
  ${tw`text-sm mt-1 flex-1`}
  padding: 8px 6px;
  overflow-y: auto;
  text-align: center;
  color: ${props => rgbaFromHex(props.theme.PRIMARY, 0.7)};
`;

export const MenuTitle = styled.h2<{ theme: SmokeTheme }>`
  ${tw`m-0 font-bold text-2xl`}
  color: ${props => props.theme.PRIMARY};
`;

export const LocaleSwitcherWrap = styled.div`
  position: relative;
`;

export const LocaleButton = styled.button<{ theme: SmokeTheme; $open?: boolean }>`
  ${tw`w-full flex items-center justify-between gap-2 cursor-pointer`}
  padding: 8px 10px;
  border-radius: 999px;
  border: 2px solid ${props => props.theme.BORDER};
  background: ${props => props.$open
    ? rgbaFromHex(props.theme.BACKGROUND, 0.82)
    : rgbaFromHex(props.theme.BACKGROUND, 0.68)};
  color: ${props => props.theme.PRIMARY};
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: ${props => rgbaFromHex(props.theme.BACKGROUND, 0.86)};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const LocaleButtonLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

export const LocaleButtonText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: small;
  font-weight: 600;
`;

export const LocaleMenu = styled.div<{ theme: SmokeTheme }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  padding: 6px;
  border-radius: 14px;
  border: 2px solid ${props => props.theme.BORDER};
  background: ${props => rgbaFromHex(props.theme.BACKGROUND, 0.94)};
  box-shadow: 0 10px 24px ${props => rgbaFromHex(props.theme.BACKGROUND, 0.45)};
  z-index: 2;
`;

export const LocaleOption = styled.button<{ theme: SmokeTheme; $active?: boolean }>`
  ${tw`w-full flex items-center justify-between cursor-pointer border-none`}
  padding: 8px 10px;
  border-radius: 10px;
  background: ${props => props.$active
    ? rgbaFromHex(props.theme.OFFSET, 0.42)
    : 'transparent'};
  color: ${props => props.theme.PRIMARY};
  font-size: 13px;
  text-align: left;

  &:hover {
    background: ${props => rgbaFromHex(props.theme.OFFSET, 0.32)};
  }
`;

export const MenuInfo = styled.p<{ theme: SmokeTheme }>`
  ${tw`m-0 text-sm`}
  color: ${props => rgbaFromHex(props.theme.PRIMARY, 0.7)};
`;

export const MenuSpacer = tw.div`
  flex-1
`;

export const MenuNav = styled.nav<{ theme: SmokeTheme }>`
  ${tw`pt-2 pb-[50px] px-0 flex-none`}
  border-top: 1px solid ${props => props.theme.BORDER};
`;

export const NavButton = styled.button<{ $isActive: boolean; theme: SmokeTheme }>`
  ${tw`w-full py-3 px-5 border-none text-left cursor-pointer text-[15px] transition-colors`}
  background-color: ${props => props.$isActive
    ? props.theme.OFFSET
    : 'transparent'};
  color: ${props => props.theme.PRIMARY};
  font-weight: ${props => props.$isActive ? 600 : 400};
  
  &:hover {
    background-color: ${props => rgbaFromHex(props.theme.OFFSET, 0.5)};
  }
`;

export const Backdrop = tw.div`
  fixed top-0 left-0 right-0 bottom-0
  bg-black-60
  z-[999]
`;

export const MenuButtonBuffer = tw.div`
  w-12 h-12 backdrop-blur rounded-full fixed z-[1000] flex items-center justify-center bottom-[2px] left-[2px]
`;

export const MenuButton = styled.button<{ theme: SmokeTheme }>`
  ${tw`fixed w-10 h-10 rounded-full cursor-pointer flex items-center justify-center shadow-md z-[1001]`}
  border: 2px solid ${props => props.theme.OFFSET};
  color: ${props => props.theme.PRIMARY};
`;
