import { useCallback, useRef, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.jsx';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useHeading } from './hooks/useHeading.js';
import { useRoadSnap } from './hooks/useRoadSnap.js';
import { useSmoothPosition } from './hooks/useSmoothPosition.js';
import { useProximityAlerts } from './hooks/useProximityAlerts.js';
import { useWakeLock } from './hooks/useWakeLock.js';
import { MapView } from './components/MapView.jsx';
import { BottomSheet } from './components/BottomSheet.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { InstallPrompt } from './components/InstallPrompt.jsx';
import { RecenterButton } from './components/RecenterButton.jsx';
import { Splash } from './components/Splash.jsx';
import cameras from './data/camaras_parana.json';
import './App.css';

function withViewTransition(fn) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && document.startViewTransition) {
    document.startViewTransition(fn);
  } else {
    fn();
  }
}

function AppShell() {
  const { settings } = useSettings();
  const { fix, error, status } = useGeolocation();
  const { heading } = useHeading();
  const snappedFix = useRoadSnap(fix);
  const smooth = useSmoothPosition(snappedFix ?? fix, heading);
  const speedKmh =
    smooth.sampled.hasFix && typeof smooth.sampled.speed === 'number'
      ? Math.max(0, Math.round(smooth.sampled.speed * 3.6))
      : null;
  const { camerasWithDistance, nearest, speedingAt } = useProximityAlerts({
    position: smooth.sampled,
    cameras,
    earlyRadius: settings.earlyRadius,
    nearRadius: settings.nearRadius,
    voiceEnabled: settings.voiceEnabled,
    vibrationEnabled: settings.vibrationEnabled,
    speedKmh,
  });

  useWakeLock(true); // la pantalla no debe apagarse sola mientras se navega

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const recenterRef = useRef(null);

  const registerRecenter = useCallback((fn) => {
    recenterRef.current = fn;
  }, []);

  const handleRecenter = useCallback(() => {
    recenterRef.current?.();
    setIsFollowing(true);
  }, []);

  const waitingForFirstFix = !smooth.sampled.hasFix && status !== 'error';

  const openSettings = () => withViewTransition(() => setSettingsOpen(true));
  const closeSettings = () => withViewTransition(() => setSettingsOpen(false));

  return (
    <div className="app-root">
      <MapView
        smooth={smooth}
        camerasWithDistance={camerasWithDistance}
        vehicleId={settings.vehicleId}
        registerRecenter={registerRecenter}
        onFollowChange={setIsFollowing}
      />

      {status === 'error' && !smooth.sampled.hasFix && (
        <div className="gpsBanner">{error ?? 'GPS no disponible'}</div>
      )}

      <InstallPrompt />

      {!isFollowing && smooth.sampled.hasFix && <RecenterButton onClick={handleRecenter} />}

      <BottomSheet
        speedKmh={speedKmh}
        nearest={nearest}
        earlyRadius={settings.earlyRadius}
        speedingAt={speedingAt}
        onOpenSettings={openSettings}
        onRecenter={handleRecenter}
      />

      {settingsOpen && <SettingsPanel onClose={closeSettings} />}

      {waitingForFirstFix && <Splash />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AppShell />
      </SettingsProvider>
    </ThemeProvider>
  );
}
