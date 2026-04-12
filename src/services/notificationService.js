/**
 * Notification service for managing notifications and sounds
 */

// Beep sound - Base64 encoded WAV file (500ms beep)
const NOTIFICATION_SOUND_DATA =
  'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==';

let audioContext = null;

/**
 * Initialize audio context for sound playback
 */
export const initAudioContext = () => {
  if (typeof window !== 'undefined' && !audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
};

/**
 * Play a simple beep sound
 * Creates a beep using Web Audio API for better compatibility
 */
export const playNotificationSound = (volume = 0.3, duration = 300) => {
  try {
    initAudioContext();

    if (!audioContext) {
      console.warn('AudioContext not available for notification sound');
      return;
    }

    // Resume audio context if suspended (required by some browsers after user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;
    const noteLength = duration / 1000;

    // Create oscillator (generates the tone)
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 800; // 800Hz frequency for pleasant beep

    // Create gain node (controls volume)
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + noteLength);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Play the beep
    oscillator.start(now);
    oscillator.stop(now + noteLength);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

/**
 * Request notification permission from user (for browser notifications)
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  return false;
};

/**
 * Show browser notification
 */
export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/notification-icon.png',
        badge: '/notification-badge.png',
        ...options,
      });
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }
};

/**
 * Format notification message based on type
 */
export const getNotificationMessage = (notification) => {
  const { type, actor } = notification;
  const actorName = actor?.username || 'Someone';

  switch (type) {
    case 'follow':
      return `${actorName} followed you`;
    case 'message':
      return `${actorName} sent you a message`;
    case 'group_invite':
      return `${actorName} added you to a group chat`;
    default:
      return 'You have a new notification';
  }
};

/**
 * Get notification target route based on type
 */
export const getNotificationRoute = (notification) => {
  const { type, actor, group } = notification;

  switch (type) {
    case 'follow':
      return `/profile/${actor?.id}`;
    case 'message':
      return `/messages/${actor?.id}`;
    case 'group_invite':
      return '/messages'; // or '/messages?tab=invites' if you want to filter
    default:
      return '/dashboard';
  }
};

export default {
  playNotificationSound,
  requestNotificationPermission,
  showBrowserNotification,
  getNotificationMessage,
  getNotificationRoute,
  initAudioContext,
};
