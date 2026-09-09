import { createGlobalStyle } from 'styled-components'
import { globalStyles } from 'twin.macro'
import { rgbaFromHex } from '../helpers/ThemeConstants'
import { SmokeTheme } from '../interfaces/theme'

interface GlobalStylesProps {
  theme: SmokeTheme;
}

const GlobalStyles = createGlobalStyle<GlobalStylesProps>`
  ${globalStyles as any}
  
  :root {
    --smoke-primary: ${props => props.theme.PRIMARY};
    --smoke-offset: ${props => props.theme.OFFSET};
    --smoke-background: ${props => props.theme.BACKGROUND};
    --smoke-border: ${props => props.theme.BORDER};
  }

  /* Base styling for the entire app */
  html {
    }
  body {
    color: ${props => props.theme.PRIMARY};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.PRIMARY};
  }

  /* Links */
  a {
    color: ${props => props.theme.OFFSET};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => rgbaFromHex(props.theme.BACKGROUND, 0.3)};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => rgbaFromHex(props.theme.OFFSET, 0.5)};
    border-radius: 5px;
    
    &:hover {
      background: ${props => rgbaFromHex(props.theme.OFFSET, 0.7)};
    }
  }
  
  /* Below animations are for modal created using React-Modal */
  .ReactModal__Overlay {
    transition: transform 300ms ease-in-out;
    transition-delay: 100ms;
    transform: scale(0);
  }
  .ReactModal__Overlay--after-open{
    transform: scale(1);
  }
  .ReactModal__Overlay--before-close{
    transform: scale(0);
  }
`;

export default GlobalStyles;