/**
 * Pure text → recipe parsing used by link import. No network, no React Native imports,
 * so it can be unit-tested with plain Node.
 */

export interface ParsedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  /** Per-serving numbers the post stated itself ("520 cal, 45g protein"). */
  nutrition?: StatedNutrition | null;
}

export interface StatedNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

/* ---------------- nutrition the creator wrote down ---------------- */

const NUM = String.raw`(\d{1,4}(?:[.,]\d)?)`;
const NUTRIENT_WORDS: [keyof StatedNutrition, string][] = [
  ['calories', String.raw`(?:k?cals?|kcal|calories|cal|energy)`],
  ['protein', String.raw`(?:protein|prot|p)`],
  ['carbs', String.raw`(?:carbs?|carbohydrates?|c)`],
  ['fat', String.raw`(?:fats?|f)`],
  ['fiber', String.raw`(?:fib(?:er|re)s?)`],
];

function toNum(v: string): number {
  return Math.round(Number(v.replace(',', '.')));
}

/**
 * Find stated macros anywhere in a caption: "520 cal", "Calories: 520", "45g protein", "Protein 45g",
 * "P45 C30 F12", "45P / 30C / 12F". Single letters only count next to a number with "g" or in a P/C/F run.
 */
export function parseStatedNutrition(raw: string): StatedNutrition | null {
  const text = ' ' + raw.replace(/\s+/g, ' ') + ' ';
  // Captions write macros one of two ways: "Protein: 45g" (label first) or "45g protein" (number first).
  // Whichever style shows up first in the caption is used for every macro, so "P 30g C 45g" isn't misread.
  const labelFirstAt = text.search(/\b(protein|carbs?|carbohydrates?|fats?|fib(?:er|re)|[pcf])\s*[:=]?\s*\d/i);
  const numberFirstAt = text.search(/\d\s*g\s*(protein|carbs?|carbohydrates?|fats?|fib(?:er|re)|[pcf])\b/i);
  const labelFirst = labelFirstAt >= 0 && (numberFirstAt < 0 || labelFirstAt < numberFirstAt);
  const out: StatedNutrition = {};
  for (const [key, word] of NUTRIENT_WORDS) {
    let m: RegExpMatchArray | null = null;
    if (key === 'calories') {
      m =
        text.match(new RegExp(String.raw`(?<![\w.])${NUM}\s*${word}\b`, 'i')) ??
        text.match(new RegExp(String.raw`\b${word}\s*[:=\-–]?\s*${NUM}(?![\w])`, 'i'));
    } else if (labelFirst) {
      m = text.match(new RegExp(String.raw`\b${word}\s*[:=\-–]?\s*${NUM}\s*(?:g|grams?)?(?![\w])`, 'i'));
    } else {
      m = text.match(new RegExp(String.raw`(?<![\w.])${NUM}\s*(?:g|grams?)\s*${word}\b`, 'i'));
    }
    if (!m) continue;
    const value = toNum(m[1]);
    if (key === 'calories' ? value < 20 || value > 4000 : value > 400) continue;
    out[key] = value;
  }
  const found = Object.keys(out).length;
  // A lone single-letter hit is too likely to be a false match; need calories, a spelled-out macro, or two macros.
  if (found === 0 || (found === 1 && out.calories === undefined && !/protein|carb|fat|fib/i.test(raw))) return null;
  return out;
}

const NUTRITION_LINE =
  /\b(\d+\s*(k?cals?|kcal|calories)|(calories|kcal|protein|carbs?|carbohydrates?|fats?|fib(er|re)|macros?|nutrition)\b\s*[:\-–]?\s*\d|\d+\s*g\s*(protein|carbs?|fats?|fib(er|re)))/i;

/** Lines in a caption that are about the post, not the cooking. */
const NOISE =
  /(\bfollow\b|\blike (and|&|\+) (save|share)|\bsave (this|it|for later)\b|\bshare (this|with)\b|\bcomment\b|link in (my )?bio|\bsubscribe\b|\btag (a|your)\b|\bdm (me|for)\b|\bfull recipe\b|\brecipe (below|in the comments)\b|\bturn on (post )?notifications\b|\bmore recipes\b|\bcode\b.*\boff\b|\bad\b|\bsponsored\b|\bhttps?:\/\/|\bwww\.)/i;
const META_LINE =
  /^(prep|cook|total|bake|chill)(ing)?\s*(time)?\s*[:\-–]|^(serves|servings?|makes|yield|portions?)\b|^(per serving|nutrition|macros?)\b|^(time|ready in)\s*[:\-–]/i;

/** True for caption lines that are nutrition, servings/timing info, calls to action or links. */
export function isCaptionNoise(line: string): boolean {
  const l = line.trim();
  if (!l) return true;
  if (/^@[\w.]+/.test(l)) return true;
  if (NOISE.test(l)) return true;
  if (META_LINE.test(l)) return true;
  // A short line that is mostly numbers about nutrition.
  if (NUTRITION_LINE.test(l) && !COOKING_VERB_LOOSE.test(l)) return true;
  // Only emoji / punctuation left.
  return !/[\p{L}\p{N}]/u.test(l);
}

const COOKING_VERB_LOOSE =
  /\b(add|bake|boil|chop|cook|combine|fry|mix|pour|preheat|simmer|stir|whisk|blend|roast|serve|top)\b/i;

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
    const n = node.nutrition as Record<string, Json> | undefined;
    const nutrition = n
      ? parseStatedNutrition(
          [
            n.calories ? `${textOf(n.calories)} calories` : '',
            n.proteinContent ? `protein: ${textOf(n.proteinContent)}` : '',
            n.carbohydrateContent ? `carbs: ${textOf(n.carbohydrateContent)}` : '',
            n.fatContent ? `fat: ${textOf(n.fatContent)}` : '',
            n.fiberContent ? `fiber: ${textOf(n.fiberContent)}` : '',
          ].join(' '),
        )
      : null;
    if (ingredients.length || steps.length) return { title, ingredients, steps, nutrition };
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
    .replace(/\s*\b(ingredients?|method|instructions|directions|steps|you(?:'|’)ll need|what you need)\s*:\s*/gi, '\n$1:\n')
    .replace(/\s+(?=(?:step\s*)?\d{1,2}[.)]\s+\D)/gi, '\n');

  // Work sentence by sentence, so "Mix it all. Chill overnight. Link in bio!" keeps the steps and drops the plug.
  const lines = text
    .split('\n')
    .flatMap((l) => l.split(/(?<=[.!?])\s+(?=[A-Z0-9])/))
    .map((l) => l.trim())
    .filter(Boolean);

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
    if (isCaptionNoise(line)) {
      // "Chicken pasta | 520 cal" still names the dish: keep the part before the numbers.
      if (mode === 'intro' && !title) {
        const named = line.split(/\s*[|•·([–—]\s*|\s+-\s+|\s*,\s*(?=\d)/)[0].trim();
        if (named && named !== line && !isCaptionNoise(named) && !looksLikeIngredient(named)) title = named.replace(/[!.:]+$/, '');
      }
      continue;
    }

    if (mode === 'intro') {
      if (!title && !looksLikeIngredient(line) && !looksLikeStep(line)) {
        title = line.replace(/[!.:]+$/, '');
        continue;
      }
      if (looksLikeIngredient(line)) ingredients.push(...splitIngredientLine(line));
      else if (looksLikeStep(line)) steps.push(line);
      continue;
    }
    if (mode === 'ingredients') {
      if (looksLikeStep(line) && !looksLikeIngredient(line)) {
        mode = 'steps';
        steps.push(line);
      } else {
        ingredients.push(...splitIngredientLine(line));
      }
      continue;
    }
    // In the method section, keep real instructions; skip chatty sign-offs ("Enjoy!", "So good").
    if (looksLikeStep(line) || /^\s*(step\s*)?\d{1,2}\s*[.):-]/i.test(original) || line.split(' ').length >= 6) steps.push(line);
  }

  // A caption with no step lines at all: treat each sentence that sounds like an action as a step.
  if (steps.length === 0) {
    const sentences = splitSentencesOrLines(lines.join(' '));
    for (const s of sentences) {
      const c = cleanLine(s);
      if (looksLikeStep(c) && !isCaptionNoise(c) && !ingredients.includes(c)) steps.push(c);
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

  const tidySteps = steps.map((st) => st.replace(/[\s,(]*\b(serves|makes|for)\s+\d+\s*(people|servings?)?\)?\s*$/i, '').trim()).filter(Boolean);
  return {
    title: shortenTitle(title) || fallbackTitle,
    ingredients: dedupe(ingredients).slice(0, 40),
    steps: dedupe(tidySteps).slice(0, 30),
    nutrition: parseStatedNutrition(text),
  };
}

/** "200g pasta, 2 eggs, salt" on one line becomes three ingredients. */
const PREP_NOTE =
  /^(finely |roughly |thinly |lightly |freshly )?(diced|chopped|minced|sliced|grated|peeled|crushed|drained|rinsed|halved|quartered|softened|melted|beaten|cubed|shredded|torn|deseeded|trimmed|zested|juiced|to taste|optional|for serving|to serve|divided|at room temperature|plus extra( for \w+)?)( and \w+)?$/i;

/** "200g pasta, 2 eggs, salt" on one line becomes three ingredients; "1 tin tomatoes, diced" stays one. */
function splitIngredientLine(line: string): string[] {
  const clean = line.replace(/[.;]+$/, '');
  if (!clean.includes(',') || !clean.split(',').every((part) => part.trim().split(' ').length <= 6)) return [clean];
  const out: string[] = [];
  for (const raw of clean.split(',')) {
    const part = raw.trim();
    if (!part) continue;
    // A prep note belongs to the ingredient before it.
    if (out.length && PREP_NOTE.test(part)) out[out.length - 1] += `, ${part}`;
    else out.push(part);
  }
  return out;
}

function shortenTitle(title: string): string {
  const t = title
    .replace(/\s*[|–—-]\s*(tiktok|instagram|youtube).*$/i, '')
    .replace(/[\s,.(-]*\b(serves|servings?|for)\s*:?\s*\d+\b.*$/i, '')
    .replace(/\s*[|•·,([–—-]\s*\d+\s*(k?cals?|kcal|calories|g\b).*$/i, '')
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
