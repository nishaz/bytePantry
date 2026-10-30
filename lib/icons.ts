import type { FC } from 'react';

import {
  Apple,
  BakedPasta,
  Banana,
  Bread,
  Broccoli,
  Burger,
  Butter,
  Carrot,
  Cheese,
  Corn,
  Cucumber,
  Drink,
  Flour,
  Garlic,
  Grape,
  Greens,
  Lemon,
  Mushroom,
  OilBottle,
  Onion,
  Orange,
  Pan,
  Pasta,
  PastaDish,
  PastaDry,
  Pepper,
  Pie,
  PieFull,
  Pineapple,
  Potato,
  Ramen,
  Rice,
  RiceDish,
  Salad,
  Sandwich,
  SauceBottle,
  SauceJar,
  SoupBowl,
  Strawberry,
  Yogurt,
} from '../components/icons/generated';
import { Blender } from '../components/icons/Blender';
import { Bowl } from '../components/icons/Bowl';
import { CuttingBoard } from '../components/icons/CuttingBoard';
import { Egg } from '../components/icons/Egg';
import { Generic } from '../components/icons/Generic';
import { Link } from '../components/icons/Link';
import { Mic } from '../components/icons/Mic';
import { Milk } from '../components/icons/Milk';
import { Oven } from '../components/icons/Oven';
import { Tomato } from '../components/icons/Tomato';
import { Watermelon } from '../components/icons/Watermelon';
import type { FlatIconProps } from '../components/icons/types';

export type IngredientIconComponent = FC<FlatIconProps>;

const ICON_BY_KEY: Record<string, IngredientIconComponent> = {
  apple: Apple,
  banana: Banana,
  broccoli: Broccoli,
  bread: Bread,
  butter: Butter,
  carrot: Carrot,
  cheese: Cheese,
  corn: Corn,
  cucumber: Cucumber,
  drink: Drink,
  egg: Egg,
  flour: Flour,
  garlic: Garlic,
  grape: Grape,
  greens: Greens,
  lemon: Lemon,
  milk: Milk,
  mushroom: Mushroom,
  onion: Onion,
  orange: Orange,
  pepper: Pepper,
  pineapple: Pineapple,
  potato: Potato,
  rice: Rice,
  strawberry: Strawberry,
  tomato: Tomato,
  watermelon: Watermelon,
  yogurt: Yogurt,
  oil: OilBottle,
  'oil-bottle': OilBottle,
  'sauce-bottle': SauceBottle,
  'sauce-jar': SauceJar,
  sauce: SauceJar,
  pasta: Pasta,
  'pasta-dry': PastaDry,
  'pasta-dish': PastaDish,
  'baked-pasta': BakedPasta,
  'rice-dish': RiceDish,
  ramen: Ramen,
  burger: Burger,
  sandwich: Sandwich,
  salad: Salad,
  soup: SoupBowl,
  'soup-bowl': SoupBowl,
  pie: Pie,
  'pie-full': PieFull,
  bowl: Bowl,
  pan: Pan,
  oven: Oven,
  blender: Blender,
  mic: Mic,
  link: Link,
  'cutting-board': CuttingBoard,
  board: CuttingBoard,
};

const ALIASES: Record<string, string> = {
  tomatoes: 'tomato',
  cherry_tomato: 'tomato',
  vegetable_tomato: 'tomato',
  yellow_onion: 'onion',
  red_onion: 'onion',
  white_onion: 'onion',
  scallion: 'onion',
  green_onion: 'onion',
  bell_pepper: 'pepper',
  bellpepper: 'pepper',
  capsicum: 'pepper',
  spinach: 'greens',
  kale: 'greens',
  lettuce: 'greens',
  herb: 'greens',
  herbs: 'greens',
  vegetable_bellpepper_green: 'greens',
  eggs: 'egg',
  eggs_brown: 'egg',
  eggs_white: 'egg',
  omelette: 'egg',
  omelet: 'egg',
  soymilk: 'milk',
  soymilk_soy: 'milk',
  dairy_milk: 'milk',
  cheese_gouda: 'cheese',
  cheddar: 'cheese',
  mozzarella: 'cheese',
  berry: 'strawberry',
  berries: 'strawberry',
  vegetable_potato: 'potato',
  spud: 'potato',
  noodle: 'pasta',
  noodles: 'pasta',
  spaghetti: 'pasta-dry',
  macaroni: 'pasta-dry',
  olive_oil: 'oil-bottle',
  cooking_oil: 'oil-bottle',
  vegetable_oil: 'oil-bottle',
  ketchup: 'sauce-bottle',
  hot_sauce: 'sauce-bottle',
  jam: 'sauce-jar',
  jelly: 'sauce-jar',
  broth: 'soup-bowl',
  stock: 'soup-bowl',
  pancake: 'flour',
  flour_sack: 'flour',
  ingredient: 'bowl',
};

function normalizeIngredientName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveIconKey(normalized: string): string | null {
  if (!normalized) return null;
  if (ICON_BY_KEY[normalized]) return normalized;
  if (ALIASES[normalized]) return ALIASES[normalized];

  const hyphen = normalized.replace(/_/g, '-');
  if (ICON_BY_KEY[hyphen]) return hyphen;

  for (const [alias, key] of Object.entries(ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      return key;
    }
  }

  for (const key of Object.keys(ICON_BY_KEY)) {
    const underscored = key.replace(/-/g, '_');
    if (normalized.includes(underscored) || underscored.includes(normalized)) {
      return key;
    }
  }

  return null;
}

export function getIngredientIcon(name: string): IngredientIconComponent {
  const normalized = normalizeIngredientName(name);
  const key = resolveIconKey(normalized);
  if (key && ICON_BY_KEY[key]) {
    return ICON_BY_KEY[key];
  }
  return Generic;
}

export function getIngredientIconKey(name: string): string {
  const normalized = normalizeIngredientName(name);
  return resolveIconKey(normalized) ?? 'generic';
}
