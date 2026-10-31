import type { Action, Step } from '../types/recipe';

export type SceneEquipment = 'cutting_board' | 'pan' | 'oven' | 'blender' | 'stovetop';
export type ScenePerspective = 'topdown' | 'front';
export type SceneSurface = 'counter' | 'stove' | 'under-counter';

const EQUIPMENT_LABELS: Record<SceneEquipment, string> = {
  cutting_board: 'cutting board',
  pan: 'pan',
  oven: 'oven',
  blender: 'blender',
  stovetop: 'stove',
};

export function getSceneEquipment(step: Step): SceneEquipment {
  const tool = step.tool.trim().toLowerCase();

  if (tool.includes('blender')) return 'blender';
  if (tool.includes('board')) return 'cutting_board';
  if (tool.includes('pan') || tool.includes('skillet')) return 'pan';
  if (tool.includes('oven')) return 'oven';
  if (tool.includes('pot') || tool.includes('saucepan')) return 'stovetop';

  switch (step.action) {
    case 'chop':
      return 'cutting_board';
    case 'fry':
      return 'pan';
    case 'bake':
      return 'oven';
    case 'blend':
      return 'blender';
    case 'mix':
    case 'stir':
    case 'pour':
    default:
      return 'stovetop';
  }
}

export function getEquipmentLabel(equipment: SceneEquipment): string {
  return EQUIPMENT_LABELS[equipment];
}

/** Side wall + window only for front-facing appliances like the blender. */
export function getScenePerspective(equipment: SceneEquipment): ScenePerspective {
  return equipment === 'blender' ? 'front' : 'topdown';
}

/** Where the equipment sits in the kitchen. */
export function getSceneSurface(equipment: SceneEquipment): SceneSurface {
  switch (equipment) {
    case 'pan':
    case 'stovetop':
      return 'stove';
    case 'oven':
      return 'under-counter';
    default:
      return 'counter';
  }
}

export function inferAction(text: string): Action {
  const lower = text.toLowerCase();
  if (/\b(chop|dice|mince|slice|cut)\b/.test(lower)) return 'chop';
  if (/\b(fry|saut[eé]|sear)\b/.test(lower)) return 'fry';
  if (/\b(bake|roast)\b/.test(lower)) return 'bake';
  if (/\b(blend|puree|smoothie)\b/.test(lower)) return 'blend';
  if (/\b(stir|whisk|simmer|boil)\b/.test(lower)) return 'stir';
  if (/\b(pour|drizzle|add)\b/.test(lower)) return 'pour';
  if (/\b(mix|combine|fold)\b/.test(lower)) return 'mix';
  return 'mix';
}

/** Which paper cook scene to show for a step. */
export function getPaperSceneKind(step: Step): 'board' | 'pan' | 'pot' | 'oven' | 'blender' | 'bowl' {
  const tool = step.tool.trim().toLowerCase();
  const text = step.text.toLowerCase();
  if (tool.includes('bowl') || (!tool && /\b(whisk|beat|mix|combine|fold|knead)\b/.test(text))) return 'bowl';
  switch (getSceneEquipment(step)) {
    case 'cutting_board':
      return 'board';
    case 'pan':
      return 'pan';
    case 'oven':
      return 'oven';
    case 'blender':
      return 'blender';
    default:
      return step.action === 'mix' ? 'bowl' : 'pot';
  }
}

/** Minutes mentioned in a step ("simmer for 10 minutes"), if any. */
export function stepTimerMinutes(text: string): number | null {
  const match = text.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(?:\d+\s*)?(min|mins|minute|minutes|hr|hrs|hour|hours)\b/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return match[2].startsWith('h') ? n * 60 : n;
}

export interface StepTimerInfo {
  minutes: number;
  /** Shown under the clock, e.g. "Per side · usual time". */
  note: string;
  /** True when the recipe didn't say a time and we're using a typical one. */
  estimated: boolean;
}

/**
 * Typical times for steps that need watching even when the recipe doesn't say how long.
 * Checked in order; the first match wins. Anything not listed gets no timer.
 */
const TYPICAL_TIMES: { match: RegExp; minutes: number; note: string }[] = [
  { match: /\b(steak|ribeye|sirloin|fillet|filet|lamb chop|pork chop)s?\b.*\b(sear|cook|fry|grill|pan)|\b(sear|grill|fry|cook)\b.*\b(steak|ribeye|sirloin|fillet|filet)/, minutes: 3, note: 'Per side, medium-rare' },
  { match: /\b(salmon|fish|cod|tuna)\b.*\b(sear|fry|pan|cook)|\b(sear|pan[- ]fry)\b.*\b(salmon|fish|cod)/, minutes: 4, note: 'Skin side down' },
  { match: /\b(chicken breast|chicken thigh)s?\b.*\b(sear|fry|cook|pan)|\b(sear|pan[- ]fry)\b.*\bchicken\b/, minutes: 6, note: 'Per side, until cooked through' },
  { match: /\bsoft[- ]boil/, minutes: 6, note: 'Soft-boiled eggs' },
  { match: /\b(hard[- ]boil|boil (the )?eggs?)\b/, minutes: 10, note: 'Hard-boiled eggs' },
  { match: /\b(boil|cook)\b.*\b(pasta|spaghetti|penne|noodles|linguine|fettuccine|macaroni)\b|\b(pasta|spaghetti|penne|noodles)\b.*\b(boil|al dente)\b/, minutes: 10, note: 'Until al dente' },
  { match: /\b(cook|simmer|boil)\b.*\brice\b|\brice\b.*\b(cook|simmer)\b/, minutes: 18, note: 'Lid on, low heat' },
  { match: /\bcaramel[iy]ze\b.*\bonions?\b/, minutes: 20, note: 'Low and slow' },
  { match: /\bpancakes?\b|\bcr[eê]pes?\b/, minutes: 2, note: 'Per side' },
  { match: /\bfry\b.*\beggs?\b|\beggs?\b.*\bfry\b/, minutes: 3, note: 'Until the white sets' },
  { match: /\btoast\b/, minutes: 3, note: 'Until golden' },
  { match: /\b(cookies?)\b.*\bbake\b|\bbake\b.*\bcookies?\b/, minutes: 12, note: 'Until edges are golden' },
  { match: /\b(muffins?|cupcakes?)\b/, minutes: 20, note: 'Until a skewer comes out clean' },
  { match: /\b(banana bread|loaf)\b/, minutes: 55, note: 'Until a skewer comes out clean' },
  { match: /\bbake\b.*\bcake\b|\bcake\b.*\bbake\b/, minutes: 30, note: 'Until a skewer comes out clean' },
  { match: /\broast\b.*\b(potato|potatoes|veg|vegetables)\b/, minutes: 35, note: 'Turn halfway' },
];

/** The timer a step needs: the time the recipe states, a typical time for things like steak, or none. */
export function stepTimer(text: string): StepTimerInfo | null {
  const stated = stepTimerMinutes(text);
  const lower = text.toLowerCase();
  const perSide = /\b(each|per) side\b/.test(lower);
  if (stated !== null) {
    return { minutes: stated, note: perSide ? 'Per side' : 'From the recipe', estimated: false };
  }
  for (const typical of TYPICAL_TIMES) {
    if (typical.match.test(lower)) {
      return { minutes: typical.minutes, note: `${typical.note} · usual time`, estimated: true };
    }
  }
  return null;
}
