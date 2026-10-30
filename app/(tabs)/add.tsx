import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IngredientArt } from '../../components/paper/IngredientArt';
import { Bob } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { LinkIcon, MicIcon, PencilIcon } from '../../components/paper/UiIcons';
import { createRecipeId, saveRecipe } from '../../lib/db';
import { inferAction } from '../../lib/stepSceneLayout';
import { cutCorners, fonts, paper } from '../../lib/theme';
import type { Recipe, Step } from '../../types/recipe';

function parseIngredients(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSteps(raw: string): Step[] {
  return raw
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean)
    .map((text) => ({ text, action: inferAction(text), ingredient: '', tool: '' }));
}

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [link, setLink] = useState('');
  const [linkNote, setLinkNote] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [voiceNote, setVoiceNote] = useState(false);
  const [title, setTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const ingredients = parseIngredients(ingredientsText);

  async function handleSave() {
    const trimmed = title.trim();
    const steps = parseSteps(stepsText);
    if (!trimmed) return setError('Give your recipe a name.');
    if (steps.length === 0) return setError('Add at least one step, one per line.');
    setError('');
    const recipe: Recipe = {
      id: createRecipeId(),
      title: trimmed,
      ingredients,
      steps,
      source: link.trim() ? 'link' : 'manual',
      createdAt: Date.now(),
    };
    setSaving(true);
    try {
      await saveRecipe(recipe);
      setTitle('');
      setIngredientsText('');
      setStepsText('');
      setLink('');
      setShowForm(false);
      router.push(`/recipe/${recipe.id}`);
    } catch (e) {
      console.error(e);
      setError('Could not save the recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PaperBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 130 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.kicker}>New recipe</Text>
            <Text style={styles.title}>Add a recipe</Text>
          </View>

          <PaperCard color={paper.red} shape="d" tilt={-1} lift={6} contentStyle={styles.linkCard}>
            <View style={styles.linkHead}>
              <View style={[styles.iconBubble, cutCorners.c]}>
                <LinkIcon color={paper.red} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.linkTitle}>Paste a link</Text>
                <Text style={styles.linkSub}>TikTok, Instagram, YouTube or any recipe site</Text>
              </View>
            </View>
            <View style={[styles.linkField, cutCorners.c]}>
              <TextInput
                value={link}
                onChangeText={(t) => {
                  setLink(t);
                  setLinkNote(false);
                }}
                placeholder="https://…"
                placeholderTextColor={paper.inkSoft}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.linkInput}
                accessibilityLabel="Recipe link"
              />
              <PaperButton
                label="Import"
                color={paper.ink}
                size="sm"
                disabled={!link.trim()}
                onPress={() => {
                  setLinkNote(true);
                  setShowForm(true);
                }}
              />
            </View>
            {linkNote ? (
              <Animated.View entering={FadeIn}>
                <Text style={styles.linkNote}>
                  Automatic import isn't connected yet. Your link is saved with the recipe; type the details below.
                </Text>
              </Animated.View>
            ) : null}
          </PaperCard>

          <View style={styles.tiles}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setVoiceNote(true)}
              style={({ pressed }) => [styles.flex, pressed && styles.pressed]}
            >
              <PaperCard shape="b" tilt={1} lift={4} contentStyle={styles.tile}>
                <Bob distance={3} rock={4}>
                  <MicIcon size={30} color={paper.purple} />
                </Bob>
                <Text style={styles.tileTitle}>Say it</Text>
                <Text style={styles.tileSub}>{voiceNote ? 'Coming soon!' : 'Talk through it'}</Text>
              </PaperCard>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowForm(true)}
              style={({ pressed }) => [styles.flex, pressed && styles.pressed]}
            >
              <PaperCard color={paper.yellow} shape="c" tilt={-1.5} lift={4} contentStyle={styles.tile}>
                <Bob distance={3} rock={4} delay={300}>
                  <PencilIcon size={30} />
                </Bob>
                <Text style={styles.tileTitle}>Type it</Text>
                <Text style={styles.tileSub}>Write it yourself</Text>
              </PaperCard>
            </Pressable>
          </View>

          {showForm ? (
            <Animated.View entering={FadeInDown.springify().damping(15)}>
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

                <Text style={styles.label}>Ingredients</Text>
                <TextInput
                  value={ingredientsText}
                  onChangeText={setIngredientsText}
                  placeholder="flour, eggs, milk"
                  placeholderTextColor={paper.inkSoft}
                  multiline
                  style={[styles.input, styles.multiline, cutCorners.c]}
                  accessibilityLabel="Ingredients, separated by commas or new lines"
                />
                {ingredients.length > 0 ? (
                  <View style={styles.preview}>
                    {ingredients.slice(0, 10).map((name, i) => (
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
                  placeholder={'Mix the batter\nFry in a pan\nServe warm'}
                  placeholderTextColor={paper.inkSoft}
                  multiline
                  style={[styles.input, styles.multiline, styles.steps, cutCorners.c]}
                  accessibilityLabel="Steps, one per line"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <PaperButton
                  label={saving ? 'Saving…' : 'Save & start cooking'}
                  size="lg"
                  disabled={saving}
                  onPress={handleSave}
                  style={styles.save}
                />
              </PaperCard>
            </Animated.View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingHorizontal: 20,
  },
  error: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    marginTop: 10,
  },
  flex: {
    flex: 1,
  },
  form: {
    padding: 18,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: paper.card,
    height: 46,
    justifyContent: 'center',
    width: 46,
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
  kicker: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  label: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  linkCard: {
    gap: 14,
    padding: 18,
  },
  linkField: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  linkHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  linkInput: {
    color: paper.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 40,
  },
  linkNote: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  linkSub: {
    color: paper.card,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  linkTitle: {
    color: paper.card,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
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
  tile: {
    alignItems: 'flex-start',
    gap: 6,
    minHeight: 130,
    padding: 16,
  },
  tileSub: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  tileTitle: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 21,
  },
  tiles: {
    flexDirection: 'row',
    gap: 16,
  },
  title: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
  },
});
