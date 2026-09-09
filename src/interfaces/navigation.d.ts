
type PageType = 'Main' | 'Spectre' | 'Player' | 'Presets' | 'Settings' | 'Import';

interface NavigationProps {
    isOpen: boolean;
    currentPage: PageType;
    onToggle: () => void;
    onNavigate: (page: PageType) => void;
    canAccessInitiativeList?: boolean;
}

interface NavigationProps {
  isOpen: boolean;
  currentPage: PageType;
  onToggle: () => void;
  onNavigate: (page: PageType) => void;
  canAccessInitiativeList?: boolean;
}