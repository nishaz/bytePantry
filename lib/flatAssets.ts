import type { SceneEquipment } from './stepSceneLayout';
import { flatRegistry, type FlatAssetKey } from './flatRegistry';

const aliasToKey: Record<string, FlatAssetKey> = {
  apple: 'apple',
  banana: 'banana',
  broccoli: 'broccoli',
  bread: 'bread',
  butter: 'butter',
  carrot: 'carrot',
  cheese: 'cheese',
  cheese_gouda: 'cheese',
  drink: 'drink',
  flour: 'flour',
  garlic: 'garlic',
  greens: 'greens',
  spinach: 'greens',
  vegetable_bellpepper_green: 'greens',
  herb: 'greens',
  lemon: 'lemon',
  oil: 'oil-bottle',
  oil_bottle: 'oil-bottle',
  onion: 'onion',
  orange: 'orange',
  pasta: 'pasta',
  pepper: 'pepper',
  bell_pepper: 'pepper',
  pie: 'pie',
  potato: 'potato',
  vegetable_potato: 'potato',
  rice: 'rice',
  salad: 'salad',
  sandwich: 'sandwich',
  sauce: 'sauce-jar',
  sauce_bottle: 'sauce-bottle',
  sauce_jar: 'sauce-jar',
  soup: 'soup-bowl',
  soup_bowl: 'soup-bowl',
  strawberry: 'strawberry',
  berry: 'strawberry',
  yogurt: 'yogurt',
  tomato: 'tomato',
  vegetable_tomato: 'tomato',
  egg: 'egg',
  eggs: 'egg',
  eggs_brown: 'egg',
  eggs_white: 'egg',
  omelette: 'egg',
  omelet: 'egg',
  milk: 'milk',
  soymilk_soy: 'milk',
  soymilk: 'milk',
  pancake: 'flour',
  bowl: 'bowl',
  ingredient: 'bowl',
  cutting_board: 'cutting-board',
  board: 'cutting-board',
  pan: 'pan',
  skillet: 'pan',
  blender: 'blender',
  oven: 'oven',
  pot: 'pot',
  stove: 'pot',
  stovetop: 'pot',
  mic: 'mic',
  link: 'link',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

export function resolveFlatAssetKey(label: string, fallback: FlatAssetKey = 'bowl'): FlatAssetKey {
  const key = normalizeKey(label);
  if (!key) {
    return fallback;
  }

  const hyphenKey = key.replace(/_/g, '-') as FlatAssetKey;
  if (hyphenKey in flatRegistry) {
    return hyphenKey;
  }

  if (key in flatRegistry) {
    return key as FlatAssetKey;
  }

  if (aliasToKey[key]) {
    return aliasToKey[key];
  }

  for (const [alias, assetKey] of Object.entries(aliasToKey)) {
    if (key.includes(alias) || alias.includes(key)) {
      return assetKey;
    }
  }

  return fallback;
}

/** @deprecated Use resolveFlatAssetKey — kept for call-site migration */
export function resolveFlatImage(label: string, fallback: FlatAssetKey = 'bowl'): FlatAssetKey {
  return resolveFlatAssetKey(label, fallback);
}

export function getFlatImage(key: FlatAssetKey): FlatAssetKey {
  return key;
}

export function getToolAssetKey(equipment: SceneEquipment): FlatAssetKey {
  switch (equipment) {
    case 'cutting_board':
      return 'cutting-board';
    case 'stovetop':
      return 'pot';
    case 'pan':
      return 'pan';
    case 'blender':
      return 'blender';
    case 'oven':
      return 'oven';
    default:
      return 'bowl';
  }
}

/** @deprecated Use getToolAssetKey */
export function getToolImage(equipment: SceneEquipment): FlatAssetKey {
  return getToolAssetKey(equipment);
}

export type { FlatAssetKey } from './flatRegistry';
export { flatRegistry } from './flatRegistry';
