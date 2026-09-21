import type { Action } from '../types/recipe';

export interface StepMotionConfig {
  action: Action;
  duration: number;
  toolBob?: number;
  toolRotate?: [number, number];
  toolTilt?: [number, number];
  ingredientBob?: number;
  ingredientScale?: [number, number];
  ingredientShake?: number;
  ingredientDrop?: number;
}

const MOTIONS: Record<Action, StepMotionConfig> = {
  chop: {
    action: 'chop',
    duration: 450,
    toolBob: 14,
  },
  stir: {
    action: 'stir',
    duration: 600,
    toolRotate: [-18, 18],
  },
  bake: {
    action: 'bake',
    duration: 900,
    ingredientScale: [1, 1.18],
  },
  pour: {
    action: 'pour',
    duration: 800,
    toolTilt: [0, 35],
    ingredientDrop: 28,
  },
  fry: {
    action: 'fry',
    duration: 350,
    ingredientShake: 8,
  },
  mix: {
    action: 'mix',
    duration: 700,
    toolBob: 6,
    ingredientBob: 6,
  },
};

export function getMotionConfig(action: Action): StepMotionConfig {
  return MOTIONS[action];
}
