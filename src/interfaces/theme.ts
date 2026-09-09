export type SmokeTheme = {
    PRIMARY: string;
    OFFSET: string;
    BACKGROUND: string;
    BORDER: string;
    BACKGROUND_URL?: string;
}

export type ThemeContextType = {
  theme: SmokeTheme;
  setTheme: (theme: SmokeTheme) => void;
  updateThemeFromSystem: (
    primary: string,
    offset: string,
    background: string,
    border: string,
    backgroundUrl?: string
  ) => void;
}