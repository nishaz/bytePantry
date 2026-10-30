/** Shared 24×24 viewBox layout + animation timing (matches flat cook artifact). */

export const VIEWBOX = 24;
export const EQUIPMENT_FILL = 0.78;

export const ANIM = {
  chop: { durationMs: 450, liftUnits: 3 },
  stir: { durationMs: 600, rotateDeg: 14, pivotY: 4, pivotX: 12 },
  fry: { sizzleMs: 280, delaysMs: [0, 120, 240] },
  blend: { spinMs: 500 },
  steam: { riseMs: 1200, delaysMs: [0, 500] },
} as const;

export function sceneScale(width: number, height: number): number {
  return (Math.min(width, height) / VIEWBOX) * EQUIPMENT_FILL;
}

export function vb(scale: number, units: number): number {
  return units * scale;
}

/** Ingredient placement regions (% of scene box). */
export const INGREDIENT_WELLS = {
  board: { left: '10%', right: '38%', top: '32%', bottom: '18%' },
  pan: { left: '22%', right: '22%', top: '28%', bottom: '30%' },
  bowl: { left: '24%', right: '24%', top: '38%', bottom: '32%' },
  blenderJar: { left: '26%', right: '26%', top: '34%', bottom: '36%' },
  pot: { left: '30%', right: '30%', top: '36%', bottom: '34%' },
  ovenTray: { left: '28%', right: '28%', top: '54%', bottom: '22%' },
} as const;
