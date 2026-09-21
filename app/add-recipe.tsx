import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createRecipeId, saveRecipe } from '../lib/db';
import type { Recipe, Step } from '../types/recipe';

function parseIngredients(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSteps(raw: string): Step[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({
      text,
      action: 'mix',
      ingredient: '',
      tool: '',
    }));
}

export default function AddRecipeScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Please enter a recipe title.');
      return;
    }

    const ingredients = parseIngredients(ingredientsText);
    const steps = parseSteps(stepsText);
    if (steps.length === 0) {
      Alert.alert('Missing steps', 'Please add at least one step.');
      return;
    }

    const recipe: Recipe = {
      id: createRecipeId(),
      title: trimmedTitle,
      ingredients,
      steps,
      source: 'manual',
      createdAt: Date.now(),
    };

    setSaving(true);
    try {
      await saveRecipe(recipe);
      router.replace(`/recipe/${recipe.id}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Save failed', 'Could not save the recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Grandma's tomato soup"
        placeholderTextColor="#a8a29e"
      />

      <Text style={styles.label}>Ingredients</Text>
      <Text style={styles.hint}>Separate with commas or new lines</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={ingredientsText}
        onChangeText={setIngredientsText}
        placeholder="tomatoes, onion, garlic"
        placeholderTextColor="#a8a29e"
        multiline
      />

      <Text style={styles.label}>Steps</Text>
      <Text style={styles.hint}>One step per line (default action: mix)</Text>
      <TextInput
        style={[styles.input, styles.multiline, styles.stepsInput]}
        value={stepsText}
        onChangeText={setStepsText}
        placeholder={'Chop the onion\nStir the pot\nBake for 20 minutes'}
        placeholderTextColor="#a8a29e"
        multiline
      />

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          (pressed || saving) && styles.saveButtonPressed,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Recipe'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  hint: {
    color: '#78716c',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#fdba74',
    borderRadius: 10,
    borderWidth: 2,
    color: '#292524',
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: '#431407',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#ea580c',
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 14,
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepsInput: {
    minHeight: 140,
  },
});
