import type { FC } from 'react';

import {
  Apple,
  Banana,
  BakedPasta,
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
import { Link } from '../components/icons/Link';
import { Mic } from '../components/icons/Mic';
import { Milk } from '../components/icons/Milk';
import { Oven } from '../components/icons/Oven';
import { Tomato } from '../components/icons/Tomato';
import type { FlatIconProps } from '../components/icons/types';

export type FlatAssetKey =
  | 'apple'
  | 'banana'
  | 'broccoli'
  | 'bread'
  | 'butter'
  | 'carrot'
  | 'cheese'
  | 'corn'
  | 'cucumber'
  | 'drink'
  | 'flour'
  | 'garlic'
  | 'grape'
  | 'greens'
  | 'lemon'
  | 'mushroom'
  | 'oil-bottle'
  | 'onion'
  | 'orange'
  | 'pasta'
  | 'pasta-dry'
  | 'pasta-dish'
  | 'baked-pasta'
  | 'ramen'
  | 'burger'
  | 'rice-dish'
  | 'pepper'
  | 'pie'
  | 'pie-full'
  | 'potato'
  | 'rice'
  | 'salad'
  | 'sandwich'
  | 'sauce-bottle'
  | 'sauce-jar'
  | 'soup-bowl'
  | 'strawberry'
  | 'yogurt'
  | 'tomato'
  | 'egg'
  | 'milk'
  | 'bowl'
  | 'mic'
  | 'link'
  | 'cutting-board'
  | 'oven'
  | 'pan'
  | 'blender'
  | 'pot';

export type FlatAssetEntry = { kind: 'icon'; Icon: FC<FlatIconProps> };

export const flatRegistry: Record<FlatAssetKey, FlatAssetEntry> = {
  apple: { kind: 'icon', Icon: Apple },
  banana: { kind: 'icon', Icon: Banana },
  broccoli: { kind: 'icon', Icon: Broccoli },
  bread: { kind: 'icon', Icon: Bread },
  butter: { kind: 'icon', Icon: Butter },
  carrot: { kind: 'icon', Icon: Carrot },
  cheese: { kind: 'icon', Icon: Cheese },
  corn: { kind: 'icon', Icon: Corn },
  cucumber: { kind: 'icon', Icon: Cucumber },
  drink: { kind: 'icon', Icon: Drink },
  flour: { kind: 'icon', Icon: Flour },
  garlic: { kind: 'icon', Icon: Garlic },
  grape: { kind: 'icon', Icon: Grape },
  greens: { kind: 'icon', Icon: Greens },
  lemon: { kind: 'icon', Icon: Lemon },
  mushroom: { kind: 'icon', Icon: Mushroom },
  'oil-bottle': { kind: 'icon', Icon: OilBottle },
  onion: { kind: 'icon', Icon: Onion },
  orange: { kind: 'icon', Icon: Orange },
  pasta: { kind: 'icon', Icon: Pasta },
  'pasta-dry': { kind: 'icon', Icon: PastaDry },
  'pasta-dish': { kind: 'icon', Icon: PastaDish },
  'baked-pasta': { kind: 'icon', Icon: BakedPasta },
  ramen: { kind: 'icon', Icon: Ramen },
  burger: { kind: 'icon', Icon: Burger },
  'rice-dish': { kind: 'icon', Icon: RiceDish },
  pepper: { kind: 'icon', Icon: Pepper },
  pie: { kind: 'icon', Icon: Pie },
  'pie-full': { kind: 'icon', Icon: PieFull },
  potato: { kind: 'icon', Icon: Potato },
  rice: { kind: 'icon', Icon: Rice },
  salad: { kind: 'icon', Icon: Salad },
  sandwich: { kind: 'icon', Icon: Sandwich },
  'sauce-bottle': { kind: 'icon', Icon: SauceBottle },
  'sauce-jar': { kind: 'icon', Icon: SauceJar },
  'soup-bowl': { kind: 'icon', Icon: SoupBowl },
  strawberry: { kind: 'icon', Icon: Strawberry },
  yogurt: { kind: 'icon', Icon: Yogurt },
  tomato: { kind: 'icon', Icon: Tomato },
  egg: { kind: 'icon', Icon: Egg },
  milk: { kind: 'icon', Icon: Milk },
  bowl: { kind: 'icon', Icon: Bowl },
  mic: { kind: 'icon', Icon: Mic },
  link: { kind: 'icon', Icon: Link },
  'cutting-board': { kind: 'icon', Icon: CuttingBoard },
  oven: { kind: 'icon', Icon: Oven },
  blender: { kind: 'icon', Icon: Blender },
  pan: { kind: 'icon', Icon: Pan },
  pot: { kind: 'icon', Icon: Bowl },
};
