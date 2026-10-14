/**
 * FlySync — Web Push & Audio Notification Utilities
 * Implements browser notification permissions, Web Audio API chime synthesis,
 * and Service Worker Push integration as required by PRD 4.2.
 */

// Synthesize pleasant two-tone chime via Web Audio API (zero audio file dependencies, 100% offline)
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic Tone 1: 587.33 Hz (D5) - soft gentle ping
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Harmonic Tone 2: 880.00 Hz (A5) - brighter confirmation chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.09);

    gain2.gain.setValueAtTime(0.001, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.24, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.debug('Notification audio synthesis not permitted or unavailable:', err);
  }
};

export type BrowserPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
};

export const getBrowserNotificationPermission = (): BrowserPermissionStatus => {
  if (!isPushSupported()) {
    return 'unsupported';
  }
  return Notification.permission as BrowserPermissionStatus;
};

export const requestBrowserPushPermission = async (): Promise<BrowserPermissionStatus> => {
  if (!isPushSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as BrowserPermissionStatus;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return Notification.permission as BrowserPermissionStatus;
  }
};

export interface SendPushOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  onClickUrl?: string;
  playSound?: boolean;
}

export const dispatchNativeNotification = async (options: SendPushOptions): Promise<boolean> => {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Play audio chime if requested
  if (options.playSound !== false) {
    playNotificationChime();
  }

  // Vibrate mobile device if available
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([100, 50, 150]);
    } catch {
      // ignore
    }
  }

  const notificationOptions: NotificationOptions & { renotify?: boolean } = {
    body: options.body,
    icon: options.icon || '/pwa-192x192.png',
    badge: options.badge || '/favicon-32x32.png',
    tag: options.tag || 'flysync-alert',
    renotify: true,
    data: options.data || { url: options.onClickUrl || '/' }
  };

  try {
    // Attempt ServiceWorker registration display first (ideal for PWA / background push)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(options.title, notificationOptions);
          return true;
        }
      } catch {
        // Fallback to direct window notification constructor
      }
    }

    const notification = new Notification(options.title, notificationOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClickUrl) {
        window.location.hash = options.onClickUrl;
      }
    };
    return true;
  } catch (err) {
    console.warn('Failed to dispatch native notification:', err);
    return false;
  }
};
