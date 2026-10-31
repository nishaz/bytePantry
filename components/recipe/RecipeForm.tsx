import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { DEFAULT_SERVINGS } from '../../lib/scaleIngredients';
import { inferAction } from '../../lib/stepSceneLayout';
import { cutCorners, fonts, paper } from '../../lib/theme';
import type { Step } from '../../types/recipe';
import { IngredientArt } from '../paper/IngredientArt';
import { PaperButton } from '../paper/PaperButton';
import { PaperCard } from '../paper/PaperCard';

export interface RecipeDraft {
  title: string;
  ingredients: string[];
  steps: Step[];
  servings: number;
}

function parseIngredients(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** One step per line. Lines that didn't change keep their saved tool/ingredient details. */
function parseSteps(raw: string, previous: Step[]): Step[] {
  const byText = new Map(previous.map((step) => [step.text, step]));
  return raw
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean)
    .map((text) => byText.get(text) ?? { text, action: inferAction(text), ingredient: '', tool: '' });
}

interface RecipeFormProps {
  initial?: Partial<RecipeDraft>;
  submitLabel: string;
  onSubmit: (draft: RecipeDraft) => Promise<void>;
}

export function RecipeForm({ initial, submitLabel, onSubmit }: RecipeFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [servings, setServings] = useState(initial?.servings ?? DEFAULT_SERVINGS);
  const [ingredientsText, setIngredientsText] = useState(initial?.ingredients?.join('\n') ?? '');
  const [stepsText, setStepsText] = useState(initial?.steps?.map((s) => s.text).join('\n') ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const ingredients = parseIngredients(ingredientsText);

  async function submit() {
    const trimmed = title.trim();
    const steps = parseSteps(stepsText, initial?.steps ?? []);
    if (!trimmed) {
      setError('Give your recipe a name.');
      return;
    }
    if (steps.length === 0) {
      setError('Add at least one step, one per line.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit({ title: trimmed, ingredients, steps, servings });
    } catch (e) {
      console.error(e);
      setError('Could not save the recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PaperCard shape="a" lift={5} contentStyle={styles.form}>
      <Text style={styles.label}>Recipe name</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Sunday pancakes"
        placeholderTextColor={paper.inkSoft}
        style={[styles.input, cutCorners.c]}
        accessibilityLabel="Recipe name"
      />

      <Text style={styles.label}>Serves</Text>
      <ServingsStepper value={servings} onChange={setServings} />

      <Text style={styles.label}>Ingredients (with amounts, for this many people)</Text>
      <TextInput
        value={ingredientsText}
        onChangeText={setIngredientsText}
        placeholder={'200g flour\n2 eggs\n300ml milk'}
        placeholderTextColor={paper.inkSoft}
        multiline
        style={[styles.input, styles.multiline, cutCorners.c]}
        accessibilityLabel="Ingredients, separated by commas or new lines"
      />
      {ingredients.length > 0 ? (
        <View style={styles.preview}>
          {ingredients.slice(0, 12).map((name, i) => (
            <Animated.View key={`${name}-${i}`} entering={FadeIn.delay(i * 40)} style={styles.previewItem}>
              <IngredientArt name={name} size={36} />
              <Text style={styles.previewText} numberOfLines={1}>
                {name}
              </Text>
            </Animated.View>
          ))}
        </View>
      ) : null}

      <Text style={styles.label}>Steps (one per line)</Text>
      <TextInput
        value={stepsText}
        onChangeText={setStepsText}
        placeholder={'Mix the batter\nFry in a pan for 3 minutes\nServe warm'}
        placeholderTextColor={paper.inkSoft}
        multiline
        style={[styles.input, styles.multiline, styles.steps, cutCorners.c]}
        accessibilityLabel="Steps, one per line"
      />
      <Text style={styles.tip}>Tip: mention a time like "simmer for 10 minutes" and you'll get a timer.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PaperButton label={saving ? 'Saving…' : submitLabel} size="lg" disabled={saving} onPress={submit} style={styles.save} />
    </PaperCard>
  );
}

/** − 2 people + control, shared by the form and the recipe page. */
export function ServingsStepper({ value, onChange, compact }: { value: number; onChange: (n: number) => void; compact?: boolean }) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fewer people"
        disabled={value <= 1}
        onPress={() => onChange(Math.max(1, value - 1))}
        style={[styles.stepBtn, cutCorners.b, value <= 1 && styles.stepDisabled, compact && styles.stepBtnCompact]}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={[styles.stepValue, compact && styles.stepValueCompact]} accessibilityLiveRegion="polite">
        {value} {value === 1 ? 'person' : 'people'}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="More people"
        disabled={value >= 24}
        onPress={() => onChange(Math.min(24, value + 1))}
        style={[styles.stepBtn, cutCorners.c, compact && styles.stepBtnCompact]}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepBtn: {
    alignItems: 'center',
    backgroundColor: paper.yellow,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  stepBtnCompact: {
    height: 38,
    width: 38,
  },
  stepBtnText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    lineHeight: 26,
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepValue: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 20,
    minWidth: 104,
    textAlign: 'center',
  },
  stepValueCompact: {
    fontSize: 17,
    minWidth: 92,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  error: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    marginTop: 10,
  },
  form: {
    padding: 18,
  },
  input: {
    backgroundColor: paper.kraft,
    color: paper.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  preview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  previewItem: {
    alignItems: 'center',
    width: 62,
  },
  previewText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  save: {
    marginTop: 18,
  },
  steps: {
    minHeight: 130,
  },
  tip: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 12.5,
    marginTop: 6,
  },
});
