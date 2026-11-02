import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt, dishColor, dishKindFor } from '../../components/paper/DishArt';
import { IngredientArt } from '../../components/paper/IngredientArt';
import { popIn } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { BackIcon, CheckIcon, LinkIcon, PencilIcon, ShareIcon, TrashIcon } from '../../components/paper/UiIcons';
import { CollectibleCard, LockedCard, rarityFor } from '../../components/recipe/CollectibleCard';
import { ServingsStepper } from '../../components/recipe/RecipeForm';
import { CARD_UNLOCK_COOKS, deleteRecipe, getRecipe, listRecipes } from '../../lib/db';
import { listFridgeItems } from '../../lib/fridgeDb';
import { estimateNutrition } from '../../lib/nutrition';
import { matchRecipe } from '../../lib/pantryMatch';
import { XP_PER_STEP, XP_RECIPE_BONUS } from '../../lib/profile';
import { DEFAULT_SERVINGS, scaleIngredient } from '../../lib/scaleIngredients';
import { shareCard } from '../../lib/shareCard';
import { sceneKindsFor, splitMixedSteps, stepTimer } from '../../lib/stepSceneLayout';
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
  const [cardOpen, setCardOpen] = useState(card === '1');
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
          if (card === '1') {
            setCardOpen(true);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 500);
          }
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
  // Same step list cook mode uses, so counts and labels match.
  const steps = splitMixedSteps(recipe.steps);
  const scenes = sceneKindsFor(steps);
  const totalXp = steps.length * XP_PER_STEP + XP_RECIPE_BONUS;
  const baseServings = recipe.servings ?? DEFAULT_SERVINGS;
  const serves = people ?? baseServings;
  const factor = serves / baseServings;
  const cooks = recipe.timesCooked ?? 0;
  const unlocked = cooks >= CARD_UNLOCK_COOKS;
  const nutrition = recipe.nutrition ?? estimateNutrition(recipe.ingredients, baseServings);
  const minutes = estimateRecipeMinutes(steps.length);
  // The card has to be on screen to be captured as an image, so open it first if it's folded away.
  const share = () => {
    if (!cardOpen) {
      setCardOpen(true);
      setTimeout(() => shareCard(cardRef, recipe.title, nutrition, cooks), 450);
    } else {
      shareCard(cardRef, recipe.title, nutrition, cooks);
    }
  };
  const rarity = rarityFor(cooks);
  const rarityLabel = { bronze: '★ Bronze', silver: '★★ Silver', gold: '★★★ Gold', holo: '★★★★ Holo' }[rarity];

  async function remove() {
    if (!recipe) return;
    await deleteRecipe(recipe.id);
    router.back();
  }

  return (
    <PaperBackground>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 96 }]}
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

        <Animated.View entering={popIn()}>
          <PaperCard color={color} shape="d" lift={4} contentStyle={styles.hero}>
            <DishArt title={recipe.title} size={84} />
            <View style={styles.flex}>
              <Text style={[styles.title, { color: fg }]} numberOfLines={3}>
                {recipe.title}
              </Text>
              <Text style={[styles.heroMeta, { color: fg }]}>
                {minutes} min · {steps.length} steps · {nutrition.calories} kcal
              </Text>
              <View style={styles.statRow}>
                <View style={[styles.stat, cutCorners.b]}>
                  <Text style={styles.statText}>+{totalXp} XP</Text>
                </View>
                <View style={[styles.stat, styles.statSoft, cutCorners.c]}>
                  <Text style={styles.statText}>{formatSource(recipe.source)}</Text>
                </View>
              </View>
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
                <View key={`${name}-${i}`} style={[styles.ing, cutCorners.c]}>
                  <IngredientArt name={name} size={26} shadow={false} />
                  <Text style={styles.ingName} numberOfLines={2}>
                    {scaleIngredient(name, factor)}
                  </Text>
                  {have ? (
                    <View style={styles.haveDot} accessibilityLabel="In your pantry">
                      <CheckIcon size={10} />
                    </View>
                  ) : (
                    <Text style={styles.needText}>need</Text>
                  )}
                </View>
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
          <PaperCard shape="a" lift={3} contentStyle={styles.steps}>
            {steps.map((step, i) => {
              const scene = SCENE_LABEL[scenes[i]];
              const timer = stepTimer(step.text);
              return (
                <View key={`${i}-${step.text}`} style={[styles.step, i < steps.length - 1 && styles.stepDivider]}>
                  <View style={[styles.stepNum, cutCorners.c]}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.stepText}>{step.text}</Text>
                    <Text style={[styles.stepTag, { color: scene.color === paper.ink ? paper.inkSoft : scene.color }]}>
                      {scene.label}
                      {timer ? ` · ${timer.minutes} min timer` : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </PaperCard>
        </View>

        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: cardOpen }}
            onPress={() => setCardOpen((o) => !o)}
          >
            <PaperCard shape="b" lift={3} contentStyle={styles.cardRow}>
              <View style={[styles.cardThumb, cutCorners.b, unlocked && { backgroundColor: color }]}>
                {unlocked ? <DishArt title={recipe.title} size={30} /> : <Text style={styles.cardThumbQ}>?</Text>}
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardRowTitle}>Recipe card</Text>
                <Text style={styles.cardRowHint}>
                  {unlocked
                    ? `${rarityLabel} · cooked ${cooks} times`
                    : `Cooked ${cooks} of ${CARD_UNLOCK_COOKS} · ${CARD_UNLOCK_COOKS - cooks} more to unlock`}
                </Text>
              </View>
              {unlocked ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Share recipe card" hitSlop={8} onPress={share} style={[styles.cardShare, cutCorners.c]}>
                  <ShareIcon size={18} color={paper.card} />
                </Pressable>
              ) : null}
              <Text style={styles.cardToggle}>{cardOpen ? 'Hide' : 'Show'}</Text>
            </PaperCard>
          </Pressable>
          {cardOpen ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.cardWrap}>
              {unlocked ? (
                <CollectibleCard
                  ref={cardRef}
                  title={recipe.title}
                  nutrition={nutrition}
                  cooks={cooks}
                  servings={baseServings}
                  minutes={minutes}
                  steps={steps.length}
                  number={cardNumber}
                  width={300}
                />
              ) : (
                <LockedCard title={recipe.title} cooks={cooks} width={300} />
              )}
            </Animated.View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <PaperButton
          label={`Start cooking for ${serves}`}
          onPress={() => router.push({ pathname: '/cook/[id]', params: { id: recipe.id, serves: String(serves) } })}
        />
      </View>

      {confirmDelete ? (
        <Animated.View entering={FadeIn.duration(150)} style={styles.backdrop}>
          <Pressable accessibilityLabel="Cancel" style={StyleSheet.absoluteFill} onPress={() => setConfirmDelete(false)} />
          <Animated.View entering={popIn()} style={styles.confirmWrap}>
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
  cardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardRowHint: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  cardRowTitle: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  cardShare: {
    alignItems: 'center',
    backgroundColor: paper.green,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  cardThumb: {
    alignItems: 'center',
    backgroundColor: paper.ink,
    height: 46,
    justifyContent: 'center',
    width: 34,
  },
  cardThumbQ: {
    color: paper.yellow,
    fontFamily: fonts.display,
    fontSize: 20,
  },
  cardToggle: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  cardWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  haveDot: {
    alignItems: 'center',
    backgroundColor: paper.green,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  heroMeta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    marginTop: 4,
  },
  statSoft: {
    backgroundColor: 'rgba(255,248,236,0.6)',
  },
  stepDivider: {
    borderBottomColor: paper.kraft,
    borderBottomWidth: 1,
  },
  original: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  originalText: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  servesCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
  },
  servesHint: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 11.5,
  },
  servesLabel: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  servesReset: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
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
    gap: 14,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  footer: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  haveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  ing: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flexDirection: 'row',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '48.8%',
  },
  ingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  ingName: {
    color: paper.ink,
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 16,
  },
  missing: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  needText: {
    backgroundColor: paper.kraft,
    borderRadius: 6,
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  section: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  sectionGap: {
    marginBottom: 8,
  },
  sectionHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    backgroundColor: paper.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  statText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  stepNum: {
    alignItems: 'center',
    backgroundColor: paper.ink,
    height: 22,
    justifyContent: 'center',
    marginTop: 1,
    width: 22,
  },
  stepNumText: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  stepTag: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  stepText: {
    color: paper.ink,
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 20,
  },
  steps: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 25,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topRight: {
    flexDirection: 'row',
    gap: 10,
  },
});
