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
