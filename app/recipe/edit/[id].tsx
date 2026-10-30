import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaperBackground } from '../../../components/paper/PaperBackground';
import { PaperCard } from '../../../components/paper/PaperCard';
import { BackIcon } from '../../../components/paper/UiIcons';
import { RecipeForm, type RecipeDraft } from '../../../components/recipe/RecipeForm';
import { getRecipe, saveRecipe } from '../../../lib/db';
import { fonts, paper } from '../../../lib/theme';
import type { Recipe } from '../../../types/recipe';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = id ? await getRecipe(id) : null;
      if (active) {
        setRecipe(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function save(draft: RecipeDraft) {
    if (!recipe) return;
    await saveRecipe({ ...recipe, ...draft });
    router.back();
  }

  return (
    <PaperBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Cancel editing" onPress={() => router.back()}>
              <PaperCard shape="b" lift={3} contentStyle={styles.iconBtn}>
                <BackIcon />
              </PaperCard>
            </Pressable>
            <Text style={styles.title}>Edit recipe</Text>
          </View>
          {loading ? <ActivityIndicator color={paper.red} /> : null}
          {!loading && !recipe ? <Text style={styles.missing}>Recipe not found.</Text> : null}
          {recipe ? (
            <RecipeForm
              initial={{ title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps }}
              submitLabel="Save changes"
              onSubmit={save}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  iconBtn: {
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  missing: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  title: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
  },
});
