import React, { useState, useEffect } from 'react';
import { FlySyncProvider, useFlySync } from './store/FlySyncContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/home/HomeView';
import { SearchView } from './components/search/SearchView';
import { ProfileView } from './components/profile/ProfileView';
import { WalletView } from './components/wallet/WalletView';
import { RadarView } from './components/radar/RadarView';
import { AlertsView } from './components/alerts/AlertsView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AuthModal } from './components/auth/AuthModal';
import { NewSearchModal } from './components/alerts/NewSearchModal';
import { PushPermissionModal } from './components/notifications/PushPermissionModal';
import { PushNotificationToast } from './components/notifications/PushNotificationToast';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { WifiOff } from 'lucide-react';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Portal de Administração separado por rota/hash
  const [isAdminPortal, setIsAdminPortal] = useState<boolean>(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    return hash === '#/admin' || hash === '#admin' || path === '/admin';
  });

  // Cross-view alert creation state
  const [isNewSearchModalOpen, setIsNewSearchModalOpen] = useState<boolean>(false);
  const [alertPresetOrigin, setAlertPresetOrigin] = useState<string>('');
  const [alertPresetDest, setAlertPresetDest] = useState<string>('');
  const [alertPresetMaxMiles, setAlertPresetMaxMiles] = useState<number>(50000);
  const [alertPresetProgramId, setAlertPresetProgramId] = useState<string>('');

  const { setSelectedOffer, offers } = useFlySync();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleRouteChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      setIsAdminPortal(hash === '#/admin' || hash === '#admin' || path === '/admin');
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleOpenCreateAlertForRoute = (origin: string, dest: string, maxMiles: number, progId?: string) => {
    setAlertPresetOrigin(origin);
    setAlertPresetDest(dest);
    setAlertPresetMaxMiles(maxMiles);
    setAlertPresetProgramId(progId || '');
    setIsNewSearchModalOpen(true);
  };

  const handleOpenOfferFromNotification = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setSelectedOffer(offer);
      setCurrentTab('radar');
    }
  };

  // Se o usuário acessar /admin ou #/admin, renderiza o Portal Administrativo isolado
  if (isAdminPortal) {
    return (
      <AdminPortal
        onBackToApp={() => {
          window.location.hash = '#/';
          setIsAdminPortal(false);
          setCurrentTab('radar');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0C021E] text-slate-100 flex flex-col font-sans selection:bg-[#22C55E] selection:text-slate-950 relative overflow-x-hidden">
      {/* Ambient Cosmic Starlight Glows mirroring the official Logo */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-60 left-1/3 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header do Aplicativo do Usuário */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-10 relative z-10">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={setCurrentTab}
            onSelectOffer={(offer) => {
              setSelectedOffer(offer);
              setCurrentTab('radar');
            }}
          />
        )}
        {currentTab === 'search' && (
          <SearchView
            onSelectOffer={(offer) => {
              setSelectedOffer(offer);
              setCurrentTab('radar');
            }}
            onOpenCreateAlert={handleOpenCreateAlertForRoute}
          />
        )}
        {currentTab === 'radar' && (
          <RadarView onOpenCreateAlertForRoute={handleOpenCreateAlertForRoute} />
        )}
        {currentTab === 'wallet' && <WalletView />}
        {currentTab === 'alerts' && (
          <AlertsView
            onOpenUpgrade={() => setCurrentTab('subscription')}
            onOpenOffer={handleOpenOfferFromNotification}
          />
        )}
        {currentTab === 'campaigns' && <CampaignsView />}
        {currentTab === 'subscription' && <SubscriptionView />}
        {currentTab === 'profile' && (
          <ProfileView
            onNavigate={setCurrentTab}
            onOpenUpgrade={() => setCurrentTab('subscription')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile PWA Bottom Navigation Bar */}
      <MobileNavigation currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Offline PWA Connectivity Banner */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-2xl backdrop-blur-md">
          <WifiOff className="w-4 h-4" />
          <span>Modo Offline do PWA ativo — dados locais da carteira mantidos.</span>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <NewSearchModal
        isOpen={isNewSearchModalOpen}
        onClose={() => setIsNewSearchModalOpen(false)}
        defaultOrigin={alertPresetOrigin}
        defaultDestination={alertPresetDest}
        defaultMaxMiles={alertPresetMaxMiles}
        defaultProgramId={alertPresetProgramId}
        onOpenUpgrade={() => setCurrentTab('subscription')}
      />

      {/* Push Notification Permission Manager Modal */}
      <PushPermissionModal />

      {/* Real-Time Push Toast Alert Preview */}
      <PushNotificationToast onOpenOffer={handleOpenOfferFromNotification} />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <FlySyncProvider>
        <MainApp />
      </FlySyncProvider>
    </ErrorBoundary>
  );
}

export default App;
