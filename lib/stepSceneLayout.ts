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

export type PaperSceneKind = 'board' | 'pan' | 'pot' | 'oven' | 'blender' | 'bowl';

/** Where the cooking happens, if the step names it ("in the same pan", "transfer to a blender"). */
const EQUIPMENT_WORDS: [RegExp, PaperSceneKind][] = [
  [/\b(blender|food processor|nutribullet|stick blender|hand blender)\b/, 'blender'],
  [/\b(frying pan|fry pan|skillet|wok|griddle|pan)\b/, 'pan'],
  [/\b(saucepan|stockpot|pot|dutch oven|casserole)\b/, 'pot'],
  [/\b(oven|baking (tray|sheet|dish|tin)|roasting tin|loaf (pan|tin)|cake tin|air ?fryer)\b/, 'oven'],
  [/\b(chopping board|cutting board|board)\b/, 'board'],
  [/\b(bowl|jug)\b/, 'bowl'],
];

/** Cooking verbs, each with the scene it happens in. Earliest verb in the step wins. */
const VERB_SCENES: [RegExp, PaperSceneKind][] = [
  [/\b(chop|chopped|dice|mince|slice|cut|grate|peel|halve|quarter|shred|julienne|deseed)\b/, 'board'],

  [/\b(fry|fried|saut[eé]e?|sear|melt|soften|brown|caramel[iz]se|toast|stir[- ]fry|crisp|flip|scramble|pan[- ]fry)\b/, 'pan'],
  [/\b(bake|roast|broil|grill|air[- ]fry)\b/, 'oven'],
  [/\b(blend|blitz|pur[eé]e|process|smoothie)\b/, 'blender'],
  [/\b(simmer|boil|poach|stew|reduce|bring (it )?to (the|a) boil|steam)\b/, 'pot'],
  [/\b(whisk|beat|mix|combine|fold|knead|marinate|toss|stir together|mash|dress)\b/, 'bowl'],
];

/** Assembling on the counter (rolling, filling, layering) only when nothing else names a place. */
const ASSEMBLY = /\b(roll|wrap|assemble|layer|spread|fill|stuff|crumble|thread|skewer|shape)\b/;

/** Steps like "add the spinach" or "season well" happen wherever the food already is. */
const FOLLOW_ON = /\b(add|pour|season|stir|cook|heat|tip|transfer|return|leave|let|cover|serve|top|sprinkle|squeeze)\b/;

function firstHit(lower: string, table: [RegExp, PaperSceneKind][]): { kind: PaperSceneKind; at: number } | null {
  let best: { kind: PaperSceneKind; at: number } | null = null;
  for (const [re, kind] of table) {
    const m = lower.match(re);
    if (m && m.index !== undefined && (!best || m.index < best.at)) best = { kind, at: m.index };
  }
  return best;
}

/** Scene for a piece of step text, or null when the text alone doesn't say. */
export function sceneFromText(text: string): PaperSceneKind | null {
  const lower = text.toLowerCase();
  // "Transfer to a blender and blitz" names the blender; "in the same pan" names the pan.
  const equipment = firstHit(lower, EQUIPMENT_WORDS);
  const verb = firstHit(lower, VERB_SCENES);
  if (equipment && verb) {
    // A knife verb happens on the board even if a pan is mentioned later ("slice, then add to the pan").
    if (verb.kind === 'board' && verb.at < equipment.at) return 'board';
    return equipment.kind;
  }
  return equipment?.kind ?? verb?.kind ?? (ASSEMBLY.test(lower) ? 'board' : null);
}

export function inferAction(text: string): Action {
  switch (sceneFromText(text)) {
    case 'board':
      return 'chop';
    case 'pan':
      return 'fry';
    case 'oven':
      return 'bake';
    case 'blender':
      return 'blend';
    case 'pot':
      return 'stir';
    case 'bowl':
      return 'mix';
    default:
      return /\b(pour|drizzle|add)\b/i.test(text) ? 'pour' : 'mix';
  }
}

function sceneFromTool(tool: string): PaperSceneKind | null {
  const t = tool.trim().toLowerCase();
  if (!t) return null;
  return firstHit(t, EQUIPMENT_WORDS)?.kind ?? null;
}

/**
 * Which paper cook scene to show for a step. `previous` is the scene of the step before, so
 * "Add the lentils and season" keeps showing the pot the food is already in.
 */
export function getPaperSceneKind(step: Step, previous: PaperSceneKind | null = null): PaperSceneKind {
  const fromTool = sceneFromTool(step.tool);
  if (fromTool) return fromTool;
  const fromText = sceneFromText(step.text);
  if (fromText) return fromText;
  // Food stays in a pan, pot, bowl or oven between steps; it doesn't stay in the blender or on the board.
  const carries = previous === 'pan' || previous === 'pot' || previous === 'bowl' || previous === 'oven';
  if (carries && FOLLOW_ON.test(step.text.toLowerCase())) return previous;
  if (/\b(cook|heat)\b/i.test(step.text)) return 'pan';
  return carries ? previous : 'bowl';
}

/** Scene for every step in order, carrying the pot/pan forward through "add…" steps. */
export function sceneKindsFor(steps: Step[]): PaperSceneKind[] {
  const out: PaperSceneKind[] = [];
  let prev: PaperSceneKind | null = null;
  for (const step of steps) {
    const kind = getPaperSceneKind(step, prev);
    out.push(kind);
    prev = kind;
  }
  return out;
}

/**
 * Split a step that does two different things in two places
 * ("Simmer for 10 minutes. Season well & blend until smooth.") into one step per place.
 * Sentences that don't name a place of their own ("Season well.") stay with the one before.
 */
export function splitMixedSteps(steps: Step[]): Step[] {
  const out: Step[] = [];
  for (const step of steps) {
    const sentences = step.text.split(/(?<=[.!?])\s+(?=[A-Z])/).map((x) => x.trim()).filter(Boolean);
    if (sentences.length < 2 || step.tool.trim()) {
      out.push(step);
      continue;
    }
    const groups: { text: string; kind: PaperSceneKind | null }[] = [];
    for (const sentence of sentences) {
      const kind = sceneFromText(sentence);
      const last = groups[groups.length - 1];
      if (last && (kind === null || last.kind === null || kind === last.kind)) {
        last.text += ` ${sentence}`;
        last.kind = last.kind ?? kind;
      } else {
        groups.push({ text: sentence, kind });
      }
    }
    if (groups.length < 2) {
      out.push(step);
      continue;
    }
    for (const g of groups) out.push({ ...step, text: g.text, action: inferAction(g.text) });
  }
  return out;
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
  // Each rule needs the cooking action itself ("sear", "boil", "bake"…), so "in a loaf pan, mix…" never gets a timer.
  { match: /\b(sear|grill|pan[- ]?fry|fry|cook)\b.*\b(steaks?|ribeye|sirloin|fillets?|filet|lamb chops?|pork chops?)\b|\b(steaks?|ribeye|sirloin)\b.*\b(sear|grill|pan[- ]?fry)\b/, minutes: 3, note: 'Per side, medium-rare' },
  { match: /\b(sear|pan[- ]?fry|fry)\b.*\b(salmon|fish|cod|tuna|sea bass)\b/, minutes: 4, note: 'Skin side down' },
  { match: /\b(sear|pan[- ]?fry|fry|grill)\b.*\bchicken\b/, minutes: 6, note: 'Per side, until cooked through' },
  { match: /\bsoft[- ]?boil/, minutes: 6, note: 'Soft-boiled eggs' },
  { match: /\b(hard[- ]?boil|boil (the )?eggs?)\b/, minutes: 10, note: 'Hard-boiled eggs' },
  { match: /\b(boil|cook)\b.*\b(pasta|spaghetti|penne|noodles|linguine|fettuccine|macaroni)\b/, minutes: 10, note: 'Until al dente' },
  { match: /\b(cook|simmer|boil)\b.*\brice\b/, minutes: 18, note: 'Lid on, low heat' },
  { match: /\bboil\b.*\b(potato|potatoes|pumpkin|squash|sweet potato)\b/, minutes: 15, note: 'Until a fork slides in' },
  { match: /\bcarameli[sz]e\b.*\bonions?\b/, minutes: 20, note: 'Low and slow' },
  { match: /\b(cook|fry|flip)\b.*\b(pancakes?|cr[eê]pes?)\b/, minutes: 2, note: 'Per side' },
  { match: /\bfry\b.*\beggs?\b/, minutes: 3, note: 'Until the white sets' },
  { match: /\btoast (the )?(bread|slices?|buns?)\b/, minutes: 3, note: 'Until golden' },
  { match: /\bbake\b.*\bcookies?\b/, minutes: 12, note: 'Until edges are golden' },
  { match: /\bbake\b.*\b(muffins?|cupcakes?)\b/, minutes: 20, note: 'Until a skewer comes out clean' },
  { match: /\bbake\b.*\b(banana bread|loaf|bread)\b/, minutes: 55, note: 'Until a skewer comes out clean' },
  { match: /\bbake\b.*\b(cake|brownies?)\b/, minutes: 30, note: 'Until a skewer comes out clean' },
  { match: /\bbake\b.*\boats\b/, minutes: 30, note: 'Until set in the middle' },
  { match: /\broast\b.*\b(potato|potatoes|veg|vegetables|pumpkin|squash)\b/, minutes: 35, note: 'Turn halfway' },
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
