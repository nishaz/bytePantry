/** Web: play the bundled chime with an <audio> element. */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chime = require('../assets/sounds/timer-ding.wav');

let audio: HTMLAudioElement | null = null;

export function startAlarm(): void {
  try {
    const src = typeof chime === 'string' ? chime : (chime?.uri ?? chime?.default ?? '');
    audio = new Audio(src);
    audio.loop = true;
    void audio.play().catch(() => undefined);
  } catch {
    // Browsers may block sound until the page has been tapped; the visual alarm still shows.
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([400, 200, 400]);
}

export function stopAlarm(): void {
  audio?.pause();
  audio = null;
}
