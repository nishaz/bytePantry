import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bob } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { LinkIcon, MicIcon, PencilIcon } from '../../components/paper/UiIcons';
import { RecipeForm, type RecipeDraft } from '../../components/recipe/RecipeForm';
import { createRecipeId, saveRecipe } from '../../lib/db';
import { ImportError, importRecipeFromLink } from '../../lib/importRecipe';
import { parseFreeTextRecipe } from '../../lib/recipeParse';
import { parseServings } from '../../lib/scaleIngredients';
import { suggestSteps } from '../../lib/suggestSteps';
import { inferAction } from '../../lib/stepSceneLayout';
import { cutCorners, fonts, paper } from '../../lib/theme';

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [link, setLink] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [voiceNote, setVoiceNote] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importNote, setImportNote] = useState('');
  const [prefill, setPrefill] = useState<(Partial<Omit<RecipeDraft, 'nutrition'>> & { stepsGuessed?: boolean }) | undefined>(undefined);
  const [imported, setImported] = useState<{ source: string; sourceUrl: string } | null>(null);
  const [pasteText, setPasteText] = useState('');

  /** Returns true when the steps had to be drafted because the post only listed ingredients. */
  function fillForm(draft: { title: string; ingredients: string[]; steps: string[]; servings: number | null }): boolean {
    const guessed = draft.steps.length === 0 && draft.ingredients.length > 0;
    const steps = guessed ? suggestSteps(draft.title, draft.ingredients) : draft.steps;
    setPrefill({
      title: draft.title,
      ingredients: draft.ingredients,
      steps: steps.map((text) => ({ text, action: inferAction(text), ingredient: '', tool: '' })),
      servings: draft.servings ?? undefined,
      stepsGuessed: guessed,
    });
    setFormKey((k) => k + 1);
    setShowForm(true);
    return guessed;
  }

  async function runImport() {
    setImporting(true);
    setImportError('');
    setImportNote('');
    try {
      const result = await importRecipeFromLink(link);
      setImported({ source: result.source, sourceUrl: result.sourceUrl });
      const guessed = fillForm(result);
      setImportNote(
        guessed
          ? 'The post only had ingredients, so I drafted the steps. Check them over, then save.'
          : result.complete
            ? 'Imported! Give it a quick check, then save.'
            : 'Got part of it. Fill in what is missing, then save.',
      );
    } catch (e) {
      setImportError(e instanceof ImportError ? e.message : 'Something went wrong reading that link.');
    } finally {
      setImporting(false);
    }
  }

  function fillFromText() {
    const parsed = parseFreeTextRecipe(pasteText, 'My recipe');
    const guessed = fillForm({ ...parsed, servings: parseServings(pasteText) });
    setImportError('');
    setImportNote(
      guessed ? 'No steps in that text, so I drafted some. Check them over, then save.' : 'Filled in from your text. Check it over, then save.',
    );
  }

  async function save(draft: RecipeDraft) {
    const id = createRecipeId();
    await saveRecipe({
      id,
      ...draft,
      source: imported?.source ?? (link.trim() ? 'link' : 'manual'),
      sourceUrl: imported?.sourceUrl ?? (link.trim() || null),
      createdAt: Date.now(),
    });
    setLink('');
    setImported(null);
    setImportNote('');
    setPrefill(undefined);
    setPasteText('');
    setShowForm(false);
    setFormKey((k) => k + 1);
    router.push(`/cook/${id}`);
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
                  setImportError('');
                }}
                onSubmitEditing={() => link.trim() && runImport()}
                placeholder="https://…"
                placeholderTextColor={paper.inkSoft}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.linkInput}
                accessibilityLabel="Recipe link"
              />
              <PaperButton
                label={importing ? '' : 'Import'}
                icon={importing ? <ActivityIndicator color={paper.card} /> : undefined}
                color={paper.ink}
                size="sm"
                disabled={!link.trim() || importing}
                onPress={runImport}
              />
            </View>
            {importing ? (
              <Animated.View entering={FadeIn} style={styles.reading}>
                <Bob distance={3} rock={6} duration={500}>
                  <PencilIcon size={20} color={paper.card} />
                </Bob>
                <Text style={styles.linkNote}>Reading the recipe…</Text>
              </Animated.View>
            ) : null}
            {importNote ? (
              <Animated.View entering={FadeIn}>
                <Text style={styles.linkNote}>{importNote}</Text>
              </Animated.View>
            ) : null}
            {importError ? (
              <Animated.View entering={FadeIn} style={[styles.errorBox, cutCorners.c]}>
                <Text style={styles.errorText}>{importError}</Text>
                <TextInput
                  value={pasteText}
                  onChangeText={setPasteText}
                  placeholder="Paste the caption or recipe text here"
                  placeholderTextColor={paper.inkSoft}
                  multiline
                  style={[styles.pasteInput, cutCorners.b]}
                  accessibilityLabel="Recipe text to fill in from"
                />
                <PaperButton
                  label="Fill in from text"
                  color={paper.yellow}
                  textColor={paper.ink}
                  size="sm"
                  disabled={!pasteText.trim()}
                  onPress={fillFromText}
                />
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
              <RecipeForm key={formKey} initial={prefill} submitLabel="Save & start cooking" onSubmit={save} />
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
  flex: {
    flex: 1,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: paper.card,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  kicker: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
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
  errorBox: {
    backgroundColor: paper.card,
    gap: 10,
    padding: 12,
  },
  errorText: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
  },
  pasteInput: {
    backgroundColor: paper.kraft,
    color: paper.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 90,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  reading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
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
  pressed: {
    transform: [{ scale: 0.97 }],
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
