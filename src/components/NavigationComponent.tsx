import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Globe, Menu } from 'lucide-react';
import {
  MenuOverlay,
  MenuHeader,
  MenuTitle,
  MenuNav,
  NavButton,
  Backdrop,
  MenuButton,
  MenuButtonBuffer,
  MenuSubText,
  LocaleSwitcherWrap,
  LocaleButton,
  LocaleButtonLabel,
  LocaleButtonText,
  LocaleMenu,
  LocaleOption,
} from './NavigationStyles';
import { useSmokeTheme } from '../helpers/ThemeContext';
import { useSceneStore } from '../helpers/BSCache';
import { type Locale, useTranslation } from '../i18n/Translation';


export const Navigation = ({ isOpen, currentPage, onToggle, onNavigate }: NavigationProps) => {
  const { theme } = useSmokeTheme();
  const { t, locale, setLocale, availableLocales } = useTranslation();
  const playerData = useSceneStore((state) => state.playerData);
  const isCurrentUserGm = String(playerData?.role || '').toUpperCase() === 'GM';
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false);
  const localeSwitcherRef = useRef<HTMLDivElement | null>(null);

  const localeLabels = useMemo<Record<Locale, string>>(() => ({
    en: t('common.locale.en'),
    es: t('common.locale.es'),
    fr: t('common.locale.fr'),
    de: t('common.locale.de'),
  }), [t]);

  useEffect(() => {
    if (!isOpen) {
      setIsLocaleMenuOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isLocaleMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (localeSwitcherRef.current && !localeSwitcherRef.current.contains(event.target as Node)) {
        setIsLocaleMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isLocaleMenuOpen]);

  const handleLocaleSelect = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setIsLocaleMenuOpen(false);
  };

  return (
    <>
      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <MenuOverlay
            theme={theme}
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{ boxShadow: '4px 0 12px rgba(0, 0, 0, 0.05)' }}
          >
            {/* Top Section - General Info */}
            <MenuHeader theme={theme}>
              <MenuTitle theme={theme}>{t('nav.title')}</MenuTitle>
              <LocaleSwitcherWrap ref={localeSwitcherRef}>
                <LocaleButton
                  theme={theme}
                  $open={isLocaleMenuOpen}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isLocaleMenuOpen}
                  aria-label={t('nav.languageSwitcher')}
                  onClick={() => setIsLocaleMenuOpen((previous) => !previous)}
                >
                  <LocaleButtonLabel>
                    <Globe size={16} />
                    <LocaleButtonText>{localeLabels[locale]}</LocaleButtonText>
                  </LocaleButtonLabel>
                  <ChevronDown size={8} />
                </LocaleButton>
                {isLocaleMenuOpen ? (
                  <LocaleMenu theme={theme} role="listbox" aria-label={t('nav.languageOptions')}>
                    {availableLocales.map((availableLocale) => (
                      <LocaleOption
                        key={availableLocale}
                        theme={theme}
                        $active={availableLocale === locale}
                        type="button"
                        role="option"
                        aria-selected={availableLocale === locale}
                        onClick={() => handleLocaleSelect(availableLocale)}
                      >
                        <span>{localeLabels[availableLocale]}</span>
                        {availableLocale === locale ? <Check size={14} /> : null}
                      </LocaleOption>
                    ))}
                  </LocaleMenu>
                ) : null}
              </LocaleSwitcherWrap>
            </MenuHeader>
            <MenuSubText theme={theme}>
              <br />
              <br />
              </MenuSubText>

            {/* Navigation Links - Bottom Section */}
            <MenuNav theme={theme}>
              {isCurrentUserGm && (
                <NavButton
                  theme={theme}
                  $isActive={currentPage === 'Main'}
                  onClick={() => onNavigate('Main')}
                >
                  {t('nav.main')}
                </NavButton>
              )}
              {isCurrentUserGm && (
                <NavButton
                  theme={theme}
                  $isActive={currentPage === 'Spectre'}
                  onClick={() => onNavigate('Spectre')}
                >
                  {t('nav.spectre')}
                </NavButton>
              )}
              {isCurrentUserGm && (
                <NavButton
                  theme={theme}
                  $isActive={currentPage === 'Presets'}
                  onClick={() => onNavigate('Presets')}
                >
                  {t('nav.presets')}
                </NavButton>
              )}
              {!isCurrentUserGm && (
                <NavButton
                  theme={theme}
                  $isActive={currentPage === 'Player'}
                  onClick={() => onNavigate('Player')}
                >
                  {t('nav.player')}
                </NavButton>
              )}
              {isCurrentUserGm && (
                <NavButton
                  theme={theme}
                  $isActive={currentPage === 'Settings'}
                  onClick={() => onNavigate('Settings')}
                >
                  {t('nav.settings')}
                </NavButton>
              )}
              {isCurrentUserGm && (
                <NavButton
                  theme={theme}
                  $isActive={currentPage === 'Import'}
                  onClick={() => onNavigate('Import')}
                >
                  {t('nav.import')}
                </NavButton>
              )}
            </MenuNav>
          </MenuOverlay>
        )}
      </AnimatePresence>

      {/* Overlay backdrop */}
      {isOpen && <Backdrop onClick={onToggle} />}

      {/* Menu Button */}
      <MenuButtonBuffer>
        <MenuButton theme={theme} onClick={onToggle}>
          <Menu size={24} />
        </MenuButton>
      </MenuButtonBuffer>
    </>
  );
};
