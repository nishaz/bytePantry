import { Vibration } from 'react-native';

/**
 * iOS / Android: vibrate, and play the chime with expo-audio when it is installed
 * (`npx expo install expo-audio`). Without it the alarm still vibrates.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let player: any = null;

function loadAudio() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-audio');
  } catch {
    return null;
  }
}

export function startAlarm(): void {
  Vibration.vibrate([0, 500, 300, 500, 300, 500], true);
  const audio = loadAudio();
  if (!audio?.createAudioPlayer) return;
  try {
    audio.setAudioModeAsync?.({ playsInSilentMode: true }).catch?.(() => undefined);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    player = audio.createAudioPlayer(require('../assets/sounds/timer-ding.wav'));
    player.loop = true;
    player.play();
  } catch {
    player = null;
  }
}

export function stopAlarm(): void {
  Vibration.cancel();
  try {
    player?.pause?.();
    player?.remove?.();
  } catch {
    // ignore
  }
  player = null;
}
