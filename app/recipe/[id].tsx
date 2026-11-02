import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt, dishColor, dishKindFor } from '../../components/paper/DishArt';
import { IngredientArt } from '../../components/paper/IngredientArt';
import { Bob, dealIn } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { BackIcon, CheckIcon, LinkIcon, PencilIcon, ShareIcon, TrashIcon } from '../../components/paper/UiIcons';
import { CollectibleCard, LockedCard } from '../../components/recipe/CollectibleCard';
import { ServingsStepper } from '../../components/recipe/RecipeForm';
import { CARD_UNLOCK_COOKS, deleteRecipe, getRecipe, listRecipes } from '../../lib/db';
import { listFridgeItems } from '../../lib/fridgeDb';
import { estimateNutrition } from '../../lib/nutrition';
import { matchRecipe } from '../../lib/pantryMatch';
import { XP_PER_STEP, XP_RECIPE_BONUS } from '../../lib/profile';
import { DEFAULT_SERVINGS, scaleIngredient } from '../../lib/scaleIngredients';
import { shareCard } from '../../lib/shareCard';
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
  const { id, card } = useLocalSearchParams<{ id: string; card?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [people, setPeople] = useState<number | null>(null);
  const [cardNumber, setCardNumber] = useState(1);
  const scrollRef = useRef<ScrollView>(null);
  const cardRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [r, f, all] = await Promise.all([id ? getRecipe(id) : Promise.resolve(null), listFridgeItems(), listRecipes()]);
        if (active) {
          setRecipe(r);
          setFridge(f);
          // Card numbers follow the order recipes were added: your first recipe is #001.
          const oldestFirst = [...all].sort((a, b) => a.createdAt - b.createdAt);
          setCardNumber(Math.max(1, oldestFirst.findIndex((x) => x.id === id) + 1));
          if (card === '1') setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 500);
          setPeople((current) => current ?? r?.servings ?? DEFAULT_SERVINGS);
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [id, card]),
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
  const baseServings = recipe.servings ?? DEFAULT_SERVINGS;
  const serves = people ?? baseServings;
  const factor = serves / baseServings;
  const cooks = recipe.timesCooked ?? 0;
  const unlocked = cooks >= CARD_UNLOCK_COOKS;
  const nutrition = recipe.nutrition ?? estimateNutrition(recipe.ingredients, baseServings);
  const minutes = estimateRecipeMinutes(recipe.steps.length);
  const share = () => shareCard(cardRef, recipe.title, nutrition, cooks);

  async function remove() {
    if (!recipe) return;
    await deleteRecipe(recipe.id);
    router.back();
  }

  return (
    <PaperBackground>
      <ScrollView
        ref={scrollRef}
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
            {unlocked ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Share recipe card" onPress={share}>
                <PaperCard shape="b" lift={3} color={paper.green} contentStyle={styles.iconBtn}>
                  <ShareIcon size={21} color={paper.card} />
                </PaperCard>
              </Pressable>
            ) : null}
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
                `${minutes} min`,
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

        <PaperCard shape="b" lift={3} contentStyle={styles.servesCard}>
          <View style={styles.flex}>
            <Text style={styles.servesLabel}>Cooking for</Text>
            {serves !== baseServings ? (
              <Pressable accessibilityRole="button" onPress={() => setPeople(baseServings)} hitSlop={8}>
                <Text style={styles.servesReset}>Recipe makes {baseServings} · reset</Text>
              </Pressable>
            ) : (
              <Text style={styles.servesHint}>Amounts update as you change it</Text>
            )}
          </View>
          <ServingsStepper value={serves} onChange={setPeople} compact />
        </PaperCard>

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
                    <Text style={styles.ingName} numberOfLines={3}>
                      {scaleIngredient(name, factor)}
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

        {recipe.sourceUrl ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => recipe.sourceUrl && Linking.openURL(recipe.sourceUrl)}
            style={styles.original}
          >
            <LinkIcon size={18} color={paper.inkSoft} />
            <Text style={styles.originalText} numberOfLines={1}>
              Open the original post
            </Text>
          </Pressable>
        ) : null}

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

        <View style={styles.cardSection}>
          <Text style={styles.section}>Recipe card</Text>
          <Text style={styles.cardHint}>
            {unlocked
              ? 'Yours to keep. Cook it more to level up its rarity.'
              : `Cook it ${CARD_UNLOCK_COOKS} times to unlock a shareable card with its stats.`}
          </Text>
          <Animated.View entering={FadeIn.delay(200)} style={styles.cardWrap}>
            {unlocked ? (
              <CollectibleCard
                ref={cardRef}
                title={recipe.title}
                nutrition={nutrition}
                cooks={cooks}
                servings={baseServings}
                minutes={minutes}
                steps={recipe.steps.length}
                number={cardNumber}
                width={300}
              />
            ) : (
              <LockedCard title={recipe.title} cooks={cooks} width={300} />
            )}
          </Animated.View>
          {unlocked ? (
            <PaperButton label="Share card" color={paper.green} icon={<ShareIcon size={20} color={paper.card} />} onPress={share} style={styles.shareBtn} />
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <PaperButton
          label={`Start cooking for ${serves}`}
          size="lg"
          onPress={() => router.push({ pathname: '/cook/[id]', params: { id: recipe.id, serves: String(serves) } })}
        />
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
  cardHint: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 14,
    marginBottom: 14,
    marginTop: 2,
  },
  cardSection: {
    alignItems: 'stretch',
  },
  cardWrap: {
    alignItems: 'center',
  },
  shareBtn: {
    alignSelf: 'center',
    marginTop: 20,
  },
  original: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  originalText: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  servesCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  servesHint: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 12.5,
  },
  servesLabel: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 19,
  },
  servesReset: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    textDecorationLine: 'underline',
  },
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
