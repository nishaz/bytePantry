import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bob } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { LinkIcon, MicIcon, PencilIcon } from '../../components/paper/UiIcons';
import { RecipeForm, type RecipeDraft } from '../../components/recipe/RecipeForm';
import { createRecipeId, saveRecipe } from '../../lib/db';
import { cutCorners, fonts, paper } from '../../lib/theme';

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [link, setLink] = useState('');
  const [linkNote, setLinkNote] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [voiceNote, setVoiceNote] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function save(draft: RecipeDraft) {
    const id = createRecipeId();
    await saveRecipe({ id, ...draft, source: link.trim() ? 'link' : 'manual', createdAt: Date.now() });
    setLink('');
    setLinkNote(false);
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
              <RecipeForm key={formKey} submitLabel="Save & start cooking" onSubmit={save} />
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
