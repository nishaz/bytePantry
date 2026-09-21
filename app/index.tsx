import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RecipeCard } from '../components/RecipeCard';
import { listRecipes } from '../lib/db';
import type { Recipe } from '../types/recipe';

export default function HomeScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const loadRecipes = useCallback(async () => {
    const items = await listRecipes();
    setRecipes(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={() => router.push('/add-recipe')}
      >
        <Text style={styles.addButtonText}>+ Add Recipe</Text>
      </Pressable>

      {recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your pantry is empty</Text>
          <Text style={styles.emptyText}>Add a recipe to see animated cooking steps.</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => router.push(`/recipe/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#ea580c',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#78716c',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#431407',
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
});
