import { FlatRecipeIcon } from './FlatRecipeIcon';

interface RecipeThumbProps {
  label: string;
}

export function RecipeThumb({ label }: RecipeThumbProps) {
  return <FlatRecipeIcon label={label} />;
}
