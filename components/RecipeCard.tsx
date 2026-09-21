import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.meta}>
        {recipe.ingredients.length} ingredients · {recipe.steps.length} steps
      </Text>
      {recipe.source ? <Text style={styles.source}>{recipe.source}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.85,
  },
  meta: {
    color: '#78716c',
    fontSize: 14,
    marginTop: 4,
  },
  source: {
    color: '#a8a29e',
    fontSize: 12,
    marginTop: 6,
  },
  title: {
    color: '#431407',
    fontSize: 18,
    fontWeight: '700',
  },
});
