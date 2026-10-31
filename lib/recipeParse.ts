/**
 * Pure text → recipe parsing used by link import. No network, no React Native imports,
 * so it can be unit-tested with plain Node.
 */

export interface ParsedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  frac12: '½',
  frac14: '¼',
  frac34: '¾',
  deg: '°',
  ndash: '–',
  mdash: '—',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  hellip: '…',
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

export function stripTags(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/* ---------------- schema.org JSON-LD (recipe websites) ---------------- */

type Json = unknown;

function isRecipeNode(node: Json): node is Record<string, Json> {
  if (!node || typeof node !== 'object') return false;
  const type = (node as Record<string, Json>)['@type'];
  return type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'));
}

function findRecipeNode(node: Json): Record<string, Json> | null {
  if (!node || typeof node !== 'object') return null;
  if (isRecipeNode(node)) return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findRecipeNode(child);
      if (found) return found;
    }
    return null;
  }
  const obj = node as Record<string, Json>;
  for (const key of ['@graph', 'mainEntity', 'mainEntityOfPage', 'itemListElement']) {
    if (key in obj) {
      const found = findRecipeNode(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

function textOf(value: Json): string {
  if (typeof value === 'string') return stripTags(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, Json>;
    if (typeof obj.text === 'string') return stripTags(obj.text);
    if (typeof obj.name === 'string') return stripTags(obj.name);
  }
  return '';
}

function instructionsOf(value: Json): string[] {
  if (!value) return [];
  if (typeof value === 'string') return splitSentencesOrLines(stripTags(value));
  if (Array.isArray(value)) return value.flatMap(instructionsOf);
  if (typeof value === 'object') {
    const obj = value as Record<string, Json>;
    if (obj['@type'] === 'HowToSection' || Array.isArray(obj.itemListElement)) {
      return instructionsOf(obj.itemListElement);
    }
    const text = textOf(obj);
    return text ? [text] : [];
  }
  return [];
}

/** Pull a recipe out of every <script type="application/ld+json"> block on a page. */
export function parseJsonLdRecipe(html: string): ParsedRecipe | null {
  const blocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of blocks) {
    const body = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
    let data: Json;
    try {
      data = JSON.parse(body);
    } catch {
      continue;
    }
    const node = findRecipeNode(data);
    if (!node) continue;
    const ingredientsRaw = node.recipeIngredient ?? node.ingredients;
    const ingredients = (Array.isArray(ingredientsRaw) ? ingredientsRaw : [])
      .map((i) => cleanLine(textOf(i)))
      .filter(Boolean);
    const steps = instructionsOf(node.recipeInstructions).map(cleanLine).filter(Boolean);
    const title = textOf(node.name) || 'Imported recipe';
    if (ingredients.length || steps.length) return { title, ingredients, steps };
  }
  return null;
}

export function metaContent(html: string, key: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
    'i',
  );
  const m = html.match(re);
  const value = m?.[1] ?? m?.[2];
  return value ? decodeEntities(value) : null;
}

/* ---------------- free text (captions, video descriptions) ---------------- */

const INGREDIENT_HEADER = /^(ingredients?|you(?:'|’)ll need|what you need|shopping list)\b/i;
const STEP_HEADER = /^(method|instructions?|directions?|steps?|how to( make)?( it)?|preparation|recipe)\b\s*:?\s*$/i;
const UNIT =
  /\b(\d+\s*)?(cups?|cup|tbsp|tbs|tablespoons?|tsp|teaspoons?|g|grams?|kg|ml|l|litres?|liters?|oz|ounces?|lbs?|pounds?|pinch|dash|cloves?|cans?|tins?|slices?|handful|bunch|sticks?|pieces?|large|medium|small)\b/i;
const QUANTITY = /^(\d+([./]\d+)?|[½¼¾⅓⅔⅛]|a |an |one |two |three |few |some |half )/i;
const COOKING_VERB =
  /\b(add|bake|boil|chop|cook|combine|cut|dice|drain|fold|fry|grate|heat|knead|marinate|melt|mix|place|pour|preheat|put|remove|roast|saut[eé]|season|serve|simmer|slice|spread|stir|toss|transfer|whisk|blend|bring|let|leave|top|garnish|sear|flip|cover|rest|wash|peel|mince)\b/i;

/** Remove bullets, numbering, emoji decoration and hashtags from one line. */
export function cleanLine(line: string): string {
  return line
    .replace(/#[\p{L}\p{N}_]+/gu, '')
    .replace(/^[\s\-–—•*·▪►▶✔✓☑️✅➡️👉🔸🔹⭐️]+/u, '')
    .replace(/^(step\s*)?\d+\s*[.):-]\s*/i, '')
    .replace(/^\p{Extended_Pictographic}+\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentencesOrLines(text: string): string[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function looksLikeIngredient(line: string): boolean {
  if (line.length > 80) return false;
  return QUANTITY.test(line) || (UNIT.test(line) && !COOKING_VERB.test(line.split(' ')[0] ?? ''));
}

function looksLikeStep(line: string): boolean {
  return COOKING_VERB.test(line) && line.split(' ').length >= 3;
}

/**
 * Parse a caption like:
 *   "Garlic butter pasta 🍝 Ingredients: 200g spaghetti, 3 cloves garlic … Method: 1. Boil … 2. Melt …"
 * Works with headed sections, numbered steps, bullet lists, or just a block of lines.
 */
export function parseFreeTextRecipe(raw: string, fallbackTitle = 'Imported recipe'): ParsedRecipe {
  const text = decodeEntities(raw)
    .replace(/\r/g, '')
    // "(serves 4)" would otherwise look like a numbered step "4)".
    .replace(/\(\s*((?:serves|servings?|for|makes)\b[^)]*)\)/gi, ' $1 ')
    // Put inline section headers and numbered steps on their own lines.
    .replace(/\s*\b(ingredients?|method|instructions|directions|steps)\s*:\s*/gi, '\n$1:\n')
    .replace(/\s+(?=(?:step\s*)?\d{1,2}[.)]\s+\D)/gi, '\n');

  let lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  // One long unstructured paragraph: work sentence by sentence instead.
  if (lines.length <= 2 && !lines.some((l) => INGREDIENT_HEADER.test(l) || STEP_HEADER.test(l.replace(/[:：]\s*$/, '')))) {
    lines = lines.flatMap((l) => l.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)).map((l) => l.trim()).filter(Boolean);
  }

  let title = '';
  const ingredients: string[] = [];
  const steps: string[] = [];
  let mode: 'intro' | 'ingredients' | 'steps' = 'intro';

  for (const original of lines) {
    const header = original.replace(/[:：]\s*$/, '').trim();
    if (INGREDIENT_HEADER.test(header) && header.length < 30) {
      mode = 'ingredients';
      continue;
    }
    if (STEP_HEADER.test(header) && header.length < 30) {
      mode = 'steps';
      continue;
    }
    const line = cleanLine(original);
    if (!line) continue;

    if (mode === 'intro') {
      if (!title && !looksLikeIngredient(line) && !looksLikeStep(line)) {
        title = line.replace(/[!.]+$/, '');
        continue;
      }
      if (looksLikeIngredient(line)) ingredients.push(...splitIngredientLine(line));
      else if (looksLikeStep(line)) steps.push(line);
      continue;
    }
    if (mode === 'ingredients') {
      if (looksLikeStep(line) && !looksLikeIngredient(line) && /^\d/.test(original.trim())) {
        mode = 'steps';
        steps.push(line);
      } else {
        ingredients.push(...splitIngredientLine(line));
      }
      continue;
    }
    steps.push(line);
  }

  // A caption with no step lines at all: treat each sentence that sounds like an action as a step.
  if (steps.length === 0) {
    const sentences = splitSentencesOrLines(lines.join(' '));
    for (const s of sentences) {
      const c = cleanLine(s);
      if (looksLikeStep(c) && !ingredients.includes(c)) steps.push(c);
    }
  }

  // Still no ingredient list? Pick quantities out of the steps ("add 2 eggs", "2 cups cooked rice").
  if (ingredients.length === 0) {
    const re = /(?:^|\s)((?:\d+(?:[./]\d+)?|[½¼¾])\s*(?:(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|g|kg|ml|oz|cloves?|cans?|slices?|handfuls?)\s+(?:of\s+)?)?[a-z][a-z-]*(?:\s+[a-z][a-z-]*){0,2}?)(?=\s*(?:[,.;!]|\band\b|\bthen\b|\bfor\b|\bin\b|$))/gi;
    for (const step of steps) {
      for (const m of step.matchAll(re)) {
        const item = m[1].trim();
        if (!/\b(min|mins|minutes?|hours?|seconds?|degrees?)\b/i.test(item)) ingredients.push(item);
      }
    }
  }

  return {
    title: shortenTitle(title) || fallbackTitle,
    ingredients: dedupe(ingredients).slice(0, 40),
    steps: dedupe(steps).slice(0, 30),
  };
}

/** "200g pasta, 2 eggs, salt" on one line becomes three ingredients. */
function splitIngredientLine(line: string): string[] {
  if (line.includes(',') && line.split(',').every((part) => part.trim().split(' ').length <= 6)) {
    return line.split(',').map((p) => p.trim().replace(/[.;]+$/, '')).filter(Boolean);
  }
  return [line.replace(/[.;]+$/, '')];
}

function shortenTitle(title: string): string {
  const t = title
    .replace(/\s*[|–—-]\s*(tiktok|instagram|youtube).*$/i, '')
    .replace(/[\s,.(-]*\b(serves|servings?|for)\s*:?\s*\d+\b.*$/i, '')
    .replace(/\p{Extended_Pictographic}|\uFE0F/gu, '')
    .replace(/[\s!.,:;-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= 60) return t;
  const cut = t.slice(0, 60);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ---------------- links ---------------- */

export type LinkSource = 'tiktok' | 'instagram' | 'youtube' | 'website';

export function detectSource(url: string): LinkSource {
  const host = url.toLowerCase();
  if (host.includes('tiktok.com')) return 'tiktok';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
  return 'website';
}

export function normaliseUrl(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/https?:\/\/\S+/i);
  const candidate = match ? match[0] : /^[\w-]+(\.[\w-]+)+\//.test(trimmed) ? `https://${trimmed}` : null;
  if (!candidate) return null;
  try {
    return new URL(candidate.replace(/[)\]>,.]+$/, '')).toString();
  } catch {
    return null;
  }
}

/** YouTube watch pages embed the full description as JSON. */
export function youtubeDescription(html: string): string | null {
  const m = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
  if (!m) return null;
  try {
    return JSON.parse(`"${m[1]}"`);
  } catch {
    return m[1].replace(/\\n/g, '\n');
  }
}

/** Instagram's og:description reads `123 likes, 4 comments - user on date: "caption"`. */
export function instagramCaption(html: string): string | null {
  const desc = (metaContent(html, 'og:description') ?? metaContent(html, 'description'))?.trim();
  if (!desc) return null;
  const quoted = desc.match(/:\s*["“]([\s\S]*)["”]\s*\.?$/);
  return quoted ? quoted[1] : desc;
}
