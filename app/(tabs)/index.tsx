import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt, dishColor, dishKindFor } from '../../components/paper/DishArt';
import { IngredientArt } from '../../components/paper/IngredientArt';
import { dealIn, popIn } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { FlameIcon } from '../../components/paper/UiIcons';
import { listPlan, rollingWeek, type MealSlot } from '../../lib/mealPlan';
import { matchRecipe, pickCookNow } from '../../lib/pantryMatch';
import { levelFor, XP_PER_STEP, XP_RECIPE_BONUS } from '../../lib/profile';
import { cutCorners, estimateRecipeMinutes, fonts, paper } from '../../lib/theme';
import { useKitchen } from '../../lib/useKitchen';
import type { FridgeItem } from '../../types/fridge';
import type { Recipe } from '../../types/recipe';

function mealLabel(): string {
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { weekday: 'long' });
  const h = now.getHours();
  const meal = h < 11 ? 'breakfast' : h < 16 ? 'lunch' : 'supper';
  return `${day} ${meal} plans`;
}

function expiryText(days: number): { label: string; color: string } {
  if (days <= 0) return { label: 'Use today', color: paper.redDeep };
  if (days === 1) return { label: '1 day', color: paper.amberText };
  return { label: `${days} days`, color: paper.greenDeep };
}

/** The meal that matters next: tonight's dinner in the afternoon, today's lunch in the morning. */
function nextSlots(): { label: string; dayIndex: number; slot: MealSlot }[] {
  const h = new Date().getHours();
  if (h < 14) {
    return [
      { label: 'Lunch today', dayIndex: 0, slot: 'lunch' },
      { label: 'Tonight', dayIndex: 0, slot: 'dinner' },
    ];
  }
  if (h < 21) {
    return [
      { label: 'Tonight', dayIndex: 0, slot: 'dinner' },
      { label: 'Tomorrow', dayIndex: 1, slot: 'lunch' },
    ];
  }
  return [
    { label: 'Tomorrow lunch', dayIndex: 1, slot: 'lunch' },
    { label: 'Tomorrow dinner', dayIndex: 1, slot: 'dinner' },
  ];
}

const SLOT_TINT: Record<MealSlot, { tint: string; text: string }> = {
  lunch: { tint: '#FFF3DA', text: paper.amberText },
  dinner: { tint: '#FBE3DC', text: paper.redDeep },
  dessert: { tint: '#F4E4EE', text: '#7A3B5C' },
  extras: { tint: '#E4F0DF', text: paper.greenDeep },
};

export default function KitchenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes, fridge, profile } = useKitchen();
  const [planned, setPlanned] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      const week = rollingWeek();
      listPlan(week[0].key, week[1].key)
        .then((rows) => setPlanned(Object.fromEntries(rows.map((r) => [`${r.day}|${r.slot}`, r.recipeId]))))
        .catch(() => undefined);
    }, []),
  );

  const cookNow = pickCookNow(recipes, fridge);
  const expiring = fridge.filter((item) => item.daysUntilExpiry <= 3).slice(0, 6);
  const heroXp = cookNow ? cookNow.recipe.steps.length * XP_PER_STEP + XP_RECIPE_BONUS : 0;
  const level = levelFor(profile.xp);
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const week = rollingWeek();

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.kicker}>{mealLabel()}</Text>
            <Text style={styles.hello}>Hey, chef!</Text>
          </View>
          <View style={[styles.streak, cutCorners.b]}>
            <FlameIcon size={16} />
            <Text style={styles.streakText}>
              {profile.streak} day{profile.streak === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <View style={[styles.level, cutCorners.c]} accessibilityLabel={`Level ${level.level}, ${level.into} of ${level.span} XP`}>
          <View style={[styles.levelBadge, cutCorners.b]}>
            <Text style={styles.levelBadgeText}>Lv {level.level}</Text>
          </View>
          <Text style={styles.levelTitle} numberOfLines={1}>
            {level.title}
          </Text>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${Math.max(4, (level.into / level.span) * 100)}%` }]} />
          </View>
          <Text style={styles.levelNum}>
            {level.into} / {level.span}
          </Text>
        </View>

        {cookNow ? (
          <Animated.View entering={popIn()}>
            <PaperCard color={paper.red} shape="d" lift={4} contentStyle={styles.hero}>
              <View style={styles.flex}>
                <Text style={styles.heroKicker}>
                  {cookNow.missing.length === 0 ? 'You can cook this now' : `Missing ${cookNow.missing.length}`}
                </Text>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {cookNow.recipe.title}
                </Text>
                <Text style={styles.heroMeta}>
                  {cookNow.have} of {cookNow.total} ingredients · {estimateRecipeMinutes(cookNow.recipe.steps.length)} min · +{heroXp} XP
                </Text>
                <PaperButton
                  label="Let's cook"
                  color={paper.card}
                  textColor={paper.ink}
                  size="sm"
                  onPress={() => router.push(`/cook/${cookNow.recipe.id}`)}
                  style={styles.heroBtn}
                />
              </View>
              <DishArt title={cookNow.recipe.title} size={96} />
            </PaperCard>
          </Animated.View>
        ) : (
          <PaperCard color={paper.red} shape="d" lift={4} contentStyle={styles.hero}>
            <View style={styles.flex}>
              <Text style={styles.heroKicker}>Your recipe box is empty</Text>
              <Text style={styles.heroTitle}>Save your first recipe</Text>
              <PaperButton label="Add one" color={paper.card} textColor={paper.ink} size="sm" onPress={() => router.push('/add')} style={styles.heroBtn} />
            </View>
          </PaperCard>
        )}

        <View style={styles.planRow}>
          {nextSlots().map((s) => {
            const day = week[s.dayIndex];
            const recipe: Recipe | undefined = byId.get(planned[`${day.key}|${s.slot}`] ?? '');
            const tint = SLOT_TINT[s.slot];
            return (
              <Pressable
                key={s.label}
                accessibilityRole="button"
                accessibilityLabel={recipe ? `${s.label}: ${recipe.title}` : `${s.label}: plan a meal`}
                onPress={() => (recipe ? router.push(`/recipe/${recipe.id}`) : router.push('/plan'))}
                style={[styles.planSlot, cutCorners.c, recipe ? { backgroundColor: tint.tint } : styles.planEmpty]}
              >
                {recipe ? (
                  <DishArt title={recipe.title} size={36} />
                ) : (
                  <View style={[styles.planPlus, cutCorners.b]}>
                    <Text style={[styles.planPlusText, { color: tint.text }]}>+</Text>
                  </View>
                )}
                <View style={styles.flex}>
                  <Text style={[styles.planLabel, { color: tint.text }]}>{s.label}</Text>
                  <Text style={[styles.planTitle, !recipe && styles.planTitleEmpty]} numberOfLines={1}>
                    {recipe ? recipe.title : 'Plan a meal'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>Use it up</Text>
            <Pressable accessibilityRole="link" onPress={() => router.push('/fridge')} hitSlop={10}>
              <Text style={styles.link}>Pantry</Text>
            </Pressable>
          </View>
          {expiring.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {expiring.map((item: FridgeItem, index) => {
                const exp = expiryText(item.daysUntilExpiry);
                return (
                  <Animated.View key={item.id} entering={dealIn(index)} style={[styles.chip, cutCorners.c]}>
                    <IngredientArt name={item.spriteName || item.name} size={26} shadow={false} />
                    <View>
                      <Text style={styles.chipName}>{item.name}</Text>
                      <Text style={[styles.chipExpiry, { color: exp.color }]}>{exp.label}</Text>
                    </View>
                  </Animated.View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.empty}>Everything in your fridge is fresh.</Text>
          )}
        </View>

        <View>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>Recipe box</Text>
            {recipes.length > 6 ? (
              <Pressable accessibilityRole="link" onPress={() => router.push('/recipes')} hitSlop={10}>
                <Text style={styles.link}>See all {recipes.length}</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.grid}>
            {recipes.slice(0, 6).map((recipe, index) => {
              const match = matchRecipe(recipe, fridge);
              const color = dishColor(dishKindFor(recipe.title));
              const light = color === paper.yellow || color === paper.blue || color === paper.orange;
              const fg = light ? paper.ink : paper.card;
              return (
                <Animated.View key={recipe.id} entering={dealIn(index + 2)} style={styles.gridCell}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${recipe.title}, have ${match.have} of ${match.total}`}
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                    style={({ pressed }) => [styles.tile, cutCorners[index % 2 ? 'b' : 'c'], { backgroundColor: color }, pressed && styles.pressed]}
                  >
                    <DishArt title={recipe.title} size={58} />
                    <Text style={[styles.tileTitle, { color: fg }]} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <Text style={[styles.tileMeta, { color: fg }]}>
                      Have {match.have}/{match.total}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flexDirection: 'row',
    gap: 7,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 6,
  },
  chipExpiry: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  chipName: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    lineHeight: 15,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 4,
    paddingRight: 8,
  },
  content: {
    gap: 12,
    paddingHorizontal: 16,
  },
  empty: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  flex: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCell: {
    width: '31.8%',
  },
  header: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
  },
  hello: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 12,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  heroKicker: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroMeta: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    marginTop: 3,
    opacity: 0.92,
  },
  heroTitle: {
    color: paper.card,
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 24,
    marginTop: 2,
  },
  kicker: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  level: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  levelBadge: {
    backgroundColor: paper.green,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  levelBadgeText: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  levelFill: {
    backgroundColor: paper.yellow,
    borderRadius: 4,
    height: '100%',
  },
  levelNum: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
  },
  levelTitle: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    maxWidth: 110,
  },
  levelTrack: {
    backgroundColor: paper.kraft,
    borderRadius: 4,
    flex: 1,
    height: 7,
    overflow: 'hidden',
  },
  link: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    textDecorationLine: 'underline',
  },
  planEmpty: {
    borderColor: paper.kraftDeep,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  planLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  planPlus: {
    alignItems: 'center',
    backgroundColor: paper.card,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  planPlusText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    lineHeight: 20,
  },
  planRow: {
    flexDirection: 'row',
    gap: 8,
  },
  planSlot: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  planTitle: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  planTitleEmpty: {
    color: paper.inkSoft,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  section: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 17,
  },
  sectionHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  streak: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  tile: {
    alignItems: 'center',
    minHeight: 112,
    paddingBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  tileMeta: {
    alignSelf: 'stretch',
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    marginTop: 2,
    opacity: 0.85,
  },
  tileTitle: {
    alignSelf: 'stretch',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 15,
    minHeight: 30,
  },
});
