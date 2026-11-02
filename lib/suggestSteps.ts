import { dishKindFor, type DishKind } from '../components/paper/DishArt';
import { resolveIngredientKey } from '../components/paper/IngredientArt';

/**
 * Draft cooking steps from a title + ingredient list, for imports whose post only had the ingredients.
 * It's a template per kind of dish, filled with the recipe's own ingredients, so the cook still checks it.
 */

const UNIT =
  /^(cups?|c|tbsps?|tablespoons?|tsps?|teaspoons?|g|grams?|kg|ml|l|litres?|liters?|oz|ounces?|lbs?|pounds?|pinch(es)?|dash(es)?|cloves?|cans?|tins?|handfuls?|slices?|pieces?|sticks?|bunch(es)?|large|small|medium|heaped|level|heads?|of|a|an|about|fresh|freshly|chopped|diced|sliced|minced|grated|ground|frozen|cooked|raw|boneless|skinless)$/i;

/** "1 cup whole grain rolled oats, divided" → "whole grain rolled oats" */
export function ingredientName(line: string): string {
  const head = line.replace(/\(.*?\)/g, ' ').split(/[,;]| - | – /)[0];
  const words = head
    .replace(/[\d½¼¾⅓⅔⅛/.]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  while (words.length > 1 && UNIT.test(words[0])) words.shift();
  return words.join(' ').toLowerCase().trim();
}

type Role = 'veg' | 'aromatic' | 'protein' | 'starch' | 'liquid' | 'sauce' | 'wet' | 'dry' | 'mixin' | 'fruit' | 'cheese' | 'fat' | 'season' | 'herb' | 'egg';

const ROLE: Record<string, Role> = {
  onion: 'aromatic', garlic: 'aromatic', ginger: 'aromatic', chili: 'aromatic', spring_onion: 'aromatic', leek: 'aromatic', celery: 'aromatic',
  tomato: 'veg', carrot: 'veg', mushroom: 'veg', potato: 'veg', bell_pepper: 'veg', broccoli: 'veg', corn: 'veg', cucumber: 'veg', spinach: 'veg',
  pumpkin: 'veg', butternut_squash: 'veg', sweet_potato: 'veg', zucchini: 'veg', eggplant: 'veg', cauliflower: 'veg', cabbage: 'veg', lettuce: 'veg',
  peas: 'veg', green_beans: 'veg', asparagus: 'veg', beetroot: 'veg', radish: 'veg', avocado: 'veg', olive: 'veg', pickle: 'veg',
  chicken: 'protein', meat: 'protein', fish: 'protein', shrimp: 'protein', tofu: 'protein', bacon: 'protein', sausage: 'protein',
  beans: 'protein', chickpeas: 'protein', lentils: 'protein',
  egg: 'egg',
  pasta: 'starch', noodles: 'starch', rice: 'starch', bread: 'starch', tortilla: 'starch',
  stock: 'liquid', water: 'liquid', coconut: 'liquid', milk: 'wet', cream: 'wet',
  tomato_sauce: 'sauce', soy_sauce: 'sauce', vinegar: 'sauce', honey: 'wet', maple_syrup: 'wet', peanut_butter: 'wet', yogurt: 'wet', vanilla: 'wet',
  flour: 'dry', sugar: 'dry', oats: 'dry', breadcrumbs: 'dry', salt: 'season', spices: 'season', sesame: 'season',
  chocolate: 'mixin', nuts: 'mixin',
  apple: 'fruit', banana: 'fruit', strawberry: 'fruit', lemon: 'fruit', lime: 'fruit', orange: 'fruit', grapes: 'fruit', pineapple: 'fruit', mango: 'fruit',
  peach: 'fruit', pear: 'fruit', cherry: 'fruit', blueberry: 'fruit', raspberry: 'fruit', watermelon: 'fruit', kiwi: 'fruit', pomegranate: 'fruit',
  cheese: 'cheese', mozzarella: 'cheese', parmesan: 'cheese', feta: 'cheese', cream_cheese: 'wet', ice_cream: 'wet',
  butter: 'fat', oil: 'fat', herbs: 'herb', coffee: 'liquid', tea: 'liquid',
};

interface Item {
  name: string;
  key: string | null;
  role: Role | null;
}

function list(items: Item[]): string {
  const names = [...new Set(items.map((i) => i.name))];
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

const BAKE_MINUTES: Partial<Record<DishKind, number>> = { cookies: 12, cake: 30, loaf: 55, pie: 40, oats: 30, pizza: 12, roast: 45 };

export function suggestSteps(title: string, ingredients: string[]): string[] {
  const items: Item[] = ingredients.map((line) => {
    const key = resolveIngredientKey(line);
    return { name: ingredientName(line) || line.toLowerCase(), key, role: key ? ROLE[key] ?? null : null };
  });
  const by = (...roles: Role[]) => items.filter((i) => i.role && roles.includes(i.role));
  const has = (...keys: string[]) => items.some((i) => i.key && keys.includes(i.key));
  const kind = dishKindFor(title);
  const t = title.toLowerCase();
  const steps: string[] = [];

  const handheld = ['taco', 'burger', 'sandwich'].includes(kind);
  const RAW = ['avocado', 'lettuce', 'cabbage', 'cucumber', 'tomato', 'radish', 'pickle', 'olive', 'spring_onion'];
  const toppings = handheld ? items.filter((i) => RAW.includes(i.key ?? '') || i.key === 'lime' || i.key === 'lemon') : [];
  const toChop = by('aromatic', 'veg').filter((i) => !['peas', 'corn', 'spinach', 'lettuce', 'olive', 'pickle'].includes(i.key ?? ''));
  const protein = by('protein').filter((i) => !['beans', 'chickpeas', 'lentils'].includes(i.key ?? ''));
  const pulses = by('protein').filter((i) => ['beans', 'chickpeas', 'lentils'].includes(i.key ?? ''));
  const aromatics = by('aromatic').filter((i) => !toppings.includes(i));
  const veg = by('veg').filter((i) => !toppings.includes(i));
  const cheese = by('cheese');
  const herbs = by('herb');
  const finish = [...cheese, ...herbs];

  const isBake =
    ['cookies', 'cake', 'loaf', 'pie'].includes(kind) || (kind === 'oats' && /bake|baked|bar|muffin/.test(t)) || /muffin|brownie|bake\b/.test(t);

  if (isBake) {
    const minutes = /muffin/.test(t) ? 20 : BAKE_MINUTES[kind] ?? 30;
    const wet = items.filter((i) => i.role === 'wet' || i.role === 'egg' || i.role === 'fat' || (i.role === 'veg' && i.key === 'pumpkin') || i.key === 'banana');
    const dry = by('dry', 'season');
    const extra = items.filter((i) => i.role === 'mixin' || (i.role === 'fruit' && i.key !== 'banana' && i.key !== 'lemon'));
    steps.push(`Preheat the oven to 180°C (350°F) and grease or line your ${kind === 'cookies' ? 'baking tray' : kind === 'loaf' || /loaf/.test(t) ? 'loaf pan' : 'baking dish'}`);
    if (wet.length) steps.push(`Whisk together the ${list(wet)} in a bowl`);
    if (dry.length) steps.push(`Mix the ${list(dry)} in a second bowl`);
    steps.push(`Fold the wet ingredients into the dry until just combined${extra.length ? `, then fold in the ${list(extra)}` : ''}`);
    steps.push(
      kind === 'cookies'
        ? `Scoop onto the tray and bake for ${minutes} minutes until golden at the edges`
        : `Pour into the ${/loaf/.test(t) || kind === 'loaf' ? 'loaf pan' : 'dish'} and bake for ${minutes} minutes until a skewer comes out clean`,
    );
    steps.push('Let it cool for 10 minutes before serving');
    return steps;
  }

  if (kind === 'smoothie') {
    steps.push(`Add the ${list(items)} to the blender`);
    steps.push('Blend for 1 minute until smooth');
    steps.push('Pour into a glass and serve straight away');
    return steps;
  }

  if (kind === 'oats') {
    const liquid = items.filter((i) => ['milk', 'water', 'yogurt', 'coconut'].includes(i.key ?? ''));
    const toppings = items.filter((i) => i.role === 'fruit' || i.role === 'mixin' || i.key === 'honey' || i.key === 'maple_syrup');
    if (/overnight/.test(t)) {
      steps.push(`Stir the oats with the ${list(liquid) || 'milk'} in a jar`);
      steps.push('Cover and leave in the fridge overnight');
    } else {
      steps.push(`Add the oats and ${list(liquid) || 'milk'} to a pot`);
      steps.push('Simmer, stirring, for 5 minutes until creamy');
    }
    if (toppings.length) steps.push(`Top with the ${list(toppings)} and serve`);
    return steps;
  }

  if (kind === 'salad') {
    const dressing = items.filter((i) => ['oil', 'lemon', 'lime', 'vinegar', 'honey', 'soy_sauce', 'salt', 'spices'].includes(i.key ?? ''));
    const rest = items.filter((i) => !dressing.includes(i));
    if (protein.length) steps.push(`Cook the ${list(protein)} in a hot pan for 6 minutes until done, then slice`);
    const chop = rest.filter((i) => i.role === 'veg' || i.role === 'aromatic' || i.role === 'fruit');
    if (chop.length) steps.push(`Wash and chop the ${list(chop)}`);
    if (dressing.length) steps.push(`Whisk the ${list(dressing)} into a dressing`);
    steps.push(`Toss everything together${cheese.length ? ` and top with the ${list(cheese)}` : ''}, then serve`);
    return steps;
  }

  if (kind === 'omelette' || (kind === 'bowl' && has('egg') && items.length <= 6)) {
    const fillings = items.filter((i) => i.role === 'veg' || i.role === 'aromatic' || i.role === 'protein');
    steps.push(`Whisk the eggs${has('milk') ? ' with the milk' : ''} and a pinch of salt`);
    if (fillings.length) steps.push(`Fry the ${list(fillings)} in a little butter for 3 minutes`);
    steps.push(`Pour in the eggs${cheese.length ? ` and scatter over the ${list(cheese)}` : ''}`);
    steps.push('Cook for 2 minutes until just set, then fold and serve');
    return steps;
  }

  if (kind === 'pancakes') {
    steps.push(`Whisk the ${list(by('dry', 'season')) || 'flour'} with the ${list(items.filter((i) => i.role === 'wet' || i.role === 'egg')) || 'milk and eggs'} into a smooth batter`);
    steps.push('Heat a lightly buttered pan over medium heat');
    steps.push('Pour in a ladle of batter and fry for 2 minutes until bubbles form, then flip');
    const toppings = items.filter((i) => i.role === 'fruit' || i.key === 'maple_syrup' || i.key === 'honey' || i.role === 'mixin');
    steps.push(toppings.length ? `Stack them up and top with the ${list(toppings)}` : 'Stack them up and serve warm');
    return steps;
  }

  if (kind === 'steak' || kind === 'roast') {
    const meat = protein.length ? protein : items.slice(0, 1);
    steps.push(`Pat the ${list(meat)} dry and season well with salt${has('spices') ? ' and the spices' : ''}`);
    if (kind === 'roast') {
      if (toChop.length) steps.push(`Chop the ${list(toChop)} and spread them in a roasting tin`);
      steps.push(`Roast the ${list(meat)} at 200°C (400°F) for 45 minutes until cooked through`);
    } else {
      steps.push(`Sear the ${list(meat)} in a very hot pan for 3 minutes per side`);
      if (toChop.length) steps.push(`Fry the ${list(toChop)} in the same pan for 4 minutes`);
    }
    steps.push('Rest for 5 minutes, then slice and serve');
    return steps;
  }

  // Savoury pan / pot dishes: pasta, rice, noodles, soup, curry, stir-fry, tacos, burgers and the rest.
  const starch = by('starch').filter((i) => i.key !== 'bread');
  const sauce = by('sauce');
  const liquid = by('liquid');
  const season = by('season');

  if (toChop.length) steps.push(`Chop the ${list(toChop)}`);
  if (starch.some((i) => i.key === 'pasta' || i.key === 'noodles')) {
    const s = starch.filter((i) => i.key === 'pasta' || i.key === 'noodles');
    steps.push(`Boil the ${list(s)} in salted water for ${s.some((i) => i.key === 'noodles') ? 4 : 10} minutes, then drain`);
  }
  if (starch.some((i) => i.key === 'rice') && kind !== 'stirfry') {
    steps.push('Rinse the rice and simmer it with a lid on for 18 minutes');
  }

  if (kind === 'stirfry') {
    if (protein.length) steps.push(`Stir-fry the ${list(protein)} in a hot wok with a little oil for 5 minutes`);
    const v = [...aromatics, ...veg];
    if (v.length) steps.push(`Add the ${list(v)} and stir-fry for 3 minutes`);
    steps.push(`Stir in the ${list([...sauce, ...season]) || 'sauce'}${starch.length ? ` and the ${list(starch)}` : ''}, tossing until glossy`);
    if (finish.length) steps.push(`Finish with the ${list(finish)} and serve`);
    else steps.push('Serve straight away');
    return steps;
  }

  if (aromatics.length) steps.push(`Fry the ${list(aromatics)} in a little oil for 5 minutes until soft`);
  if (protein.length) {
    steps.push(
      aromatics.length
        ? `Add the ${list(protein)} and cook for 6 minutes until browned`
        : `Cook the ${list(protein)} in a hot pan with a little oil for 6 minutes until golden`,
    );
  }
  const otherVeg = veg.filter((i) => !aromatics.includes(i));
  if (otherVeg.length && (kind === 'soup' || kind === 'curry')) steps.push(`Stir in the ${list(otherVeg)}${season.length ? ` and ${list(season)}` : ''}`);
  else if (otherVeg.length) steps.push(`Add the ${list(otherVeg)} and fry for 4 minutes`);

  if (kind === 'soup' || kind === 'curry' || liquid.length || pulses.length) {
    const pour = [...sauce, ...liquid, ...pulses];
    steps.push(`Pour in the ${list(pour) || 'stock'} and simmer for ${kind === 'soup' ? 20 : 15} minutes`);
    if (kind === 'soup' && /cream|blend|puree|bisque|pumpkin|squash/.test(t + ' ' + ingredients.join(' ').toLowerCase())) {
      steps.push('Blend until smooth');
    }
  } else if (sauce.length) {
    steps.push(`Stir in the ${list(sauce)} and simmer for 10 minutes`);
  }

  if (starch.some((i) => i.key === 'pasta' || i.key === 'noodles')) steps.push('Toss the drained pasta through the sauce');
  if (['taco', 'burger', 'sandwich'].includes(kind)) {
    const base = by('starch').length ? list(by('starch')) : kind === 'burger' ? 'buns' : kind === 'taco' ? 'tortillas' : 'bread';
    const top = [...toppings, ...finish];
    steps.push(`Warm the ${base} and pile everything in${top.length ? `, topped with the ${list(top)}` : ''}`);
  } else {
    steps.push(finish.length ? `Season to taste, top with the ${list(finish)} and serve` : 'Season to taste and serve');
  }
  if (steps.length === 1) steps.unshift(`Get the ${list(items.slice(0, 4))} ready`);
  return steps;
}
