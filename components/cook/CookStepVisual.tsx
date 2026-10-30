import type { Action } from '../../types/recipe';
import type { SceneEquipment } from '../../lib/stepSceneLayout';
import { BakeOvenScene } from './scenes/BakeOvenScene';
import { BakeStoveScene } from './scenes/BakeStoveScene';
import { BlendScene } from './scenes/BlendScene';
import { ChopScene } from './scenes/ChopScene';
import { FryScene } from './scenes/FryScene';
import { StirScene } from './scenes/StirScene';

interface CookStepVisualProps {
  width: number;
  height: number;
  action: Action;
  equipment: SceneEquipment;
  ingredients: string[];
}

export function CookStepVisual({ width, height, action, equipment, ingredients }: CookStepVisualProps) {
  if (action === 'chop' || equipment === 'cutting_board') {
    return <ChopScene width={width} height={height} ingredients={ingredients} />;
  }
  if (action === 'blend' || equipment === 'blender') {
    return <BlendScene width={width} height={height} ingredients={ingredients} />;
  }
  if (action === 'fry' || equipment === 'pan') {
    return <FryScene width={width} height={height} ingredients={ingredients} />;
  }
  if (action === 'bake' && equipment === 'oven') {
    return <BakeOvenScene width={width} height={height} ingredients={ingredients} />;
  }
  if (equipment === 'stovetop' || action === 'bake') {
    return <BakeStoveScene width={width} height={height} ingredients={ingredients} />;
  }
  if (action === 'stir' || action === 'mix' || action === 'pour') {
    return <StirScene width={width} height={height} ingredients={ingredients} />;
  }
  return <StirScene width={width} height={height} ingredients={ingredients} />;
}
