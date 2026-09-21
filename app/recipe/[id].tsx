import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { IngredientList } from '../../components/IngredientList';
import { StepScene } from '../../components/StepScene';
import { getRecipe } from '../../lib/db';
import type { Recipe } from '../../types/recipe';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        if (!id) {
          setRecipe(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        const result = await getRecipe(id);
        if (active) {
          setRecipe(result);
          setLoading(false);
        }
      }

      load();
      return () => {
        active = false;
      };
    }, [id]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Recipe not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: recipe.title }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <IngredientList ingredients={recipe.ingredients} />

        <Text style={styles.sectionTitle}>Steps</Text>
        {recipe.steps.map((step, index) => (
          <View key={`${recipe.id}-step-${index}`} style={styles.stepCard}>
            <Text style={styles.stepNumber}>Step {index + 1}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
            <StepScene step={step} />
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  errorText: {
    color: '#78716c',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#431407',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  stepCard: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    padding: 14,
  },
  stepNumber: {
    color: '#ea580c',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  stepText: {
    color: '#292524',
    fontSize: 16,
    lineHeight: 22,
  },
});
