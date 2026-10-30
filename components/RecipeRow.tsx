import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, formatRecipeMeta } from '../lib/theme';
import type { Recipe } from '../types/recipe';
import { RecipeThumb } from './RecipeThumb';

interface RecipeRowProps {
  recipe: Recipe;
  onPress: () => void;
}

function thumbLabel(recipe: Recipe): string {
  return recipe.ingredients[0] ?? recipe.title;
}

export function RecipeRow({ recipe, onPress }: RecipeRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <RecipeThumb label={thumbLabel(recipe)} />
      <View style={styles.copy}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.meta}>
          {formatRecipeMeta(recipe.source, recipe.steps.length)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
  },
  meta: {
    color: colors.muted,
    fontFamily: fonts.bodyRegular,
    fontSize: 12.5,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15.5,
  },
});
