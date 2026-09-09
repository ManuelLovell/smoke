import './styles/App.css';
import { useSceneStore } from './helpers/BSCache';
import { Suspense, lazy, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './components/NavigationComponent';
import { AppContainer, ContentArea } from './components/NavigationStyles';

import { useSmokeTheme } from './helpers/ThemeContext';
import GlobalStyles from './styles/GlobalStyles';
import styled from 'styled-components';
import { useTranslation } from './i18n/Translation';
import { TrackSMOKEEvent } from './metrics/SmokeMetrics';
import { initializeSMOKEMetricsQueue } from './metrics/SmokeMetricsQueue';

type PageType = 'Main' | 'Player' | 'Spectre' | 'Presets' | 'Settings' | 'Import';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #1e2232;
  color: #ffffff;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-top-color: #9d99ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 20px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
`;

const PageLoadingState = styled.div`
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainPage = lazy(async () => ({ default: (await import('./components/MainPage')).MainPage }));
const PlayerPage = lazy(async () => ({ default: (await import('./components/PlayerPage')).PlayerPage }));
const SpectrePage = lazy(async () => ({ default: (await import('./components/SpectrePage')).SpectrePage }));
const PresetsPage = lazy(async () => ({ default: (await import('./components/PresetsPage')).PresetsPage }));
const SettingsPage = lazy(async () => ({ default: (await import('./components/SettingsPage')).SettingsPage }));
const ImportPage = lazy(async () => ({ default: (await import('./components/ImportPage')).ImportPage }));

function App() {
  const { sceneReady, cacheReady, playerData } = useSceneStore();
  const { theme } = useSmokeTheme();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<PageType>('Main');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isCurrentUserGm = String(playerData?.role || '').toUpperCase() === 'GM';
  const isAppReady = sceneReady && cacheReady;

  const renderPage = () => {
    if (!isCurrentUserGm) {
      return <PlayerPage key="player" />;
    }

    switch (currentPage) {
      case 'Main':
        return <MainPage key="main" />;
      case 'Spectre':
        return <SpectrePage key="spectre" />;
      case 'Presets':
        return <PresetsPage key="presets" />;
      case 'Settings':
        return <SettingsPage key="settings" />;
      case 'Import':
        return <ImportPage key="import" />;
    }

    return null;
  };

  const navigateTo = (page: PageType) => {
    if (!isCurrentUserGm && (page === 'Settings' || page === 'Import' || page === 'Presets' || page === 'Spectre')) {
      setCurrentPage('Player');
      setIsMenuOpen(false);
      return;
    }

    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    const stopMetricsQueue = initializeSMOKEMetricsQueue();

    return () => {
      stopMetricsQueue();
    };
  }, [isAppReady]);

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    void TrackSMOKEEvent({
      eventName: 'app_opened',
      eventCategory: 'app',
      playerId: playerData?.id ?? null,
      success: true,
      metadata: {
        role: playerData?.role ?? null,
      },
    });
  }, [isAppReady, playerData?.id, playerData?.role]);

  return (
    <>
      <GlobalStyles theme={theme} />
      {!sceneReady || !cacheReady ? (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>
            {!sceneReady ? t('app.connectingScene') : 
             !cacheReady ? t('app.loadingCache') : 
             t('app.loadingFallback')}
          </LoadingText>
        </LoadingContainer>
      ) : (
        <AppContainer>
          <ContentArea theme={theme} $backgroundUrl={theme.BACKGROUND_URL}>
            <Suspense fallback={<PageLoadingState><LoadingSpinner /></PageLoadingState>}>
              <AnimatePresence mode="wait">
                {renderPage()}
              </AnimatePresence>
            </Suspense>
          </ContentArea>

          {isCurrentUserGm && (
            <Navigation
              isOpen={isMenuOpen}
              currentPage={currentPage}
              onToggle={() => setIsMenuOpen(!isMenuOpen)}
              onNavigate={navigateTo}
            />
          )}
        </AppContainer>
      )}
    </>
  )
}

export default App
