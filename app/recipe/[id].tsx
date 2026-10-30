import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt, dishColor, dishKindFor } from '../../components/paper/DishArt';
import { IngredientArt } from '../../components/paper/IngredientArt';
import { Bob, dealIn } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { BackIcon, CheckIcon, PencilIcon, TrashIcon } from '../../components/paper/UiIcons';
import { deleteRecipe, getRecipe } from '../../lib/db';
import { listFridgeItems } from '../../lib/fridgeDb';
import { matchRecipe } from '../../lib/pantryMatch';
import { XP_PER_STEP, XP_RECIPE_BONUS } from '../../lib/profile';
import { getPaperSceneKind } from '../../lib/stepSceneLayout';
import { cutCorners, estimateRecipeMinutes, fonts, formatSource, paper } from '../../lib/theme';
import type { FridgeItem } from '../../types/fridge';
import type { Recipe } from '../../types/recipe';

const SCENE_LABEL: Record<string, { label: string; color: string }> = {
  board: { label: 'Chop', color: paper.brown },
  pan: { label: 'Fry', color: paper.ink },
  pot: { label: 'Stir', color: paper.red },
  oven: { label: 'Bake', color: paper.orange },
  blender: { label: 'Blend', color: paper.purple },
  bowl: { label: 'Mix', color: paper.blue },
};

export default function RecipeOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [r, f] = await Promise.all([id ? getRecipe(id) : Promise.resolve(null), listFridgeItems()]);
        if (active) {
          setRecipe(r);
          setFridge(f);
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  if (loading) {
    return (
      <PaperBackground style={styles.centered}>
        <ActivityIndicator size="large" color={paper.red} />
      </PaperBackground>
    );
  }
  if (!recipe) {
    return (
      <PaperBackground style={styles.centered}>
        <Text style={styles.missing}>Recipe not found.</Text>
        <PaperButton label="Go back" onPress={() => router.back()} />
      </PaperBackground>
    );
  }

  const match = matchRecipe(recipe, fridge);
  const missing = new Set(match.missing);
  const kind = dishKindFor(recipe.title);
  const color = dishColor(kind);
  const lightBg = color === paper.yellow || color === paper.blue || color === paper.orange;
  const fg = lightBg ? paper.ink : paper.card;
  const totalXp = recipe.steps.length * XP_PER_STEP + XP_RECIPE_BONUS;

  async function remove() {
    if (!recipe) return;
    await deleteRecipe(recipe.id);
    router.back();
  }

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
            <PaperCard shape="b" lift={3} contentStyle={styles.iconBtn}>
              <BackIcon />
            </PaperCard>
          </Pressable>
          <View style={styles.topRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit recipe"
              onPress={() => router.push(`/recipe/edit/${recipe.id}`)}
            >
              <PaperCard shape="c" lift={3} color={paper.yellow} contentStyle={styles.iconBtn}>
                <PencilIcon size={21} />
              </PaperCard>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Delete recipe" onPress={() => setConfirmDelete(true)}>
              <PaperCard shape="b" lift={3} contentStyle={styles.iconBtn}>
                <TrashIcon size={21} color={paper.redDeep} />
              </PaperCard>
            </Pressable>
          </View>
        </View>

        <Animated.View entering={FadeInDown.springify().damping(15)}>
          <PaperCard color={color} shape="d" tilt={-1} lift={6} contentStyle={styles.hero}>
            <Bob distance={6} rock={3} style={styles.heroArt}>
              <DishArt title={recipe.title} size={150} />
            </Bob>
            <Text style={[styles.title, { color: fg }]}>{recipe.title}</Text>
            <View style={styles.statRow}>
              {[
                `${estimateRecipeMinutes(recipe.steps.length)} min`,
                `${recipe.steps.length} steps`,
                `+${totalXp} XP`,
                formatSource(recipe.source),
              ].map((stat) => (
                <View key={stat} style={[styles.stat, cutCorners.b]}>
                  <Text style={styles.statText}>{stat}</Text>
                </View>
              ))}
            </View>
          </PaperCard>
        </Animated.View>

        <View>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>Ingredients</Text>
            <Text style={[styles.haveText, { color: missing.size ? paper.amberText : paper.greenDeep }]}>
              Have {match.have} of {match.total}
            </Text>
          </View>
          <View style={styles.ingGrid}>
            {recipe.ingredients.map((name, i) => {
              const have = !missing.has(name);
              return (
                <Animated.View key={`${name}-${i}`} entering={ZoomIn.delay(120 + i * 50).springify().damping(12)} style={styles.ingCell}>
                  <PaperCard shape={i % 2 ? 'b' : 'c'} tilt={i % 2 ? 1.5 : -1.5} lift={3} contentStyle={styles.ing}>
                    <IngredientArt name={name} size={44} />
                    <Text style={styles.ingName} numberOfLines={2}>
                      {name}
                    </Text>
                    <View style={[styles.ingBadge, { backgroundColor: have ? paper.green : paper.kraftDeep }]}>
                      {have ? <CheckIcon size={12} /> : <Text style={styles.needText}>need</Text>}
                    </View>
                  </PaperCard>
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={[styles.section, styles.sectionGap]}>Steps</Text>
          <View style={styles.steps}>
            {recipe.steps.map((step, i) => {
              const scene = SCENE_LABEL[getPaperSceneKind(step)];
              return (
                <Animated.View key={`${i}-${step.text}`} entering={dealIn(i + 2)}>
                  <PaperCard shape={i % 2 ? 'b' : 'a'} lift={3} contentStyle={styles.step}>
                    <View style={[styles.stepNum, cutCorners.c]}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.stepText}>{step.text}</Text>
                      <Text style={[styles.stepTag, { color: scene.color === paper.ink ? paper.inkSoft : scene.color }]}>
                        {scene.label}
                      </Text>
                    </View>
                  </PaperCard>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <PaperButton label="Start cooking" size="lg" onPress={() => router.push(`/cook/${recipe.id}`)} />
      </View>

      {confirmDelete ? (
        <Animated.View entering={FadeIn.duration(150)} style={styles.backdrop}>
          <Pressable accessibilityLabel="Cancel" style={StyleSheet.absoluteFill} onPress={() => setConfirmDelete(false)} />
          <Animated.View entering={ZoomIn.springify().damping(13)} style={styles.confirmWrap}>
            <PaperCard shape="d" tilt={-1} lift={6} contentStyle={styles.confirm}>
              <Text style={styles.confirmTitle}>Delete this recipe?</Text>
              <Text style={styles.confirmText}>"{recipe.title}" will be removed from your recipe box. This can't be undone.</Text>
              <View style={styles.confirmActions}>
                <PaperButton
                  label="Keep it"
                  color={paper.kraft}
                  textColor={paper.ink}
                  size="sm"
                  onPress={() => setConfirmDelete(false)}
                  style={styles.flex}
                />
                <PaperButton label="Delete" color={paper.red} size="sm" onPress={remove} style={styles.flex} />
              </View>
            </PaperCard>
          </Animated.View>
        </Animated.View>
      ) : null}
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(43,35,32,0.4)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  centered: {
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
  },
  confirm: {
    padding: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  confirmText: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: 6,
  },
  confirmTitle: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 24,
  },
  confirmWrap: {
    alignSelf: 'stretch',
  },
  content: {
    gap: 22,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  footer: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  haveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
  },
  hero: {
    alignItems: 'center',
    padding: 20,
  },
  heroArt: {
    marginBottom: 4,
  },
  iconBtn: {
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  ing: {
    alignItems: 'center',
    gap: 2,
    minHeight: 104,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  ingBadge: {
    alignItems: 'center',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
    position: 'absolute',
    right: 6,
    top: 6,
  },
  ingCell: {
    width: '30.5%',
  },
  ingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ingName: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  missing: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  needText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  section: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  sectionGap: {
    marginBottom: 10,
  },
  sectionHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stat: {
    backgroundColor: paper.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
  },
  statText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  stepNum: {
    alignItems: 'center',
    backgroundColor: paper.ink,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepNumText: {
    color: paper.card,
    fontFamily: fonts.display,
    fontSize: 16,
  },
  stepTag: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  stepText: {
    color: paper.ink,
    fontFamily: fonts.body,
    fontSize: 15.5,
    lineHeight: 21,
  },
  steps: {
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topRight: {
    flexDirection: 'row',
    gap: 12,
  },
});
