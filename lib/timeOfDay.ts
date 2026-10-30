export type SkyMode = 'auto' | 'day' | 'night';

/** Night between 7pm and 6am, matching the HTML mockup. */
export function getAutoIsNight(): boolean {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 19;
}

export function resolveIsNight(mode: SkyMode): boolean {
  if (mode === 'auto') {
    return getAutoIsNight();
  }
  return mode === 'night';
}

export function toggleSkyMode(mode: SkyMode): SkyMode {
  const showingNight = resolveIsNight(mode);
  return showingNight ? 'day' : 'night';
}
