import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt, dishColor, dishKindFor } from '../../components/paper/DishArt';
import { SectionTitle, StreakBadge, XpBar } from '../../components/paper/Hud';
import { IngredientArt } from '../../components/paper/IngredientArt';
import { Bob, dealIn, Wiggle } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { matchRecipe, pickCookNow } from '../../lib/pantryMatch';
import { estimateRecipeMinutes, fonts, paper } from '../../lib/theme';
import { useKitchen } from '../../lib/useKitchen';
import { XP_PER_STEP, XP_RECIPE_BONUS } from '../../lib/profile';
import type { FridgeItem } from '../../types/fridge';

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
  return { label: `${days} days`, color: paper.amberText };
}

function UseItUpChip({ item, index }: { item: FridgeItem; index: number }) {
  const exp = expiryText(item.daysUntilExpiry);
  return (
    <Animated.View entering={dealIn(index)}>
      <PaperCard shape={index % 2 ? 'c' : 'b'} tilt={index % 2 ? -1.5 : 1} lift={3} contentStyle={styles.chip}>
        {item.daysUntilExpiry <= 0 ? (
          <Wiggle>
            <IngredientArt name={item.name} size={38} />
          </Wiggle>
        ) : (
          <IngredientArt name={item.name} size={38} />
        )}
        <View>
          <Text style={styles.chipName}>{item.name}</Text>
          <Text style={[styles.chipExpiry, { color: exp.color }]}>{exp.label}</Text>
        </View>
      </PaperCard>
    </Animated.View>
  );
}

export default function KitchenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes, fridge, profile } = useKitchen();

  const cookNow = pickCookNow(recipes, fridge);
  const expiring = fridge.filter((item) => item.daysUntilExpiry <= 3).slice(0, 6);
  const heroXp = cookNow ? cookNow.recipe.steps.length * XP_PER_STEP + XP_RECIPE_BONUS : 0;

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>{mealLabel()}</Text>
            <Text style={styles.hello}>Hey, chef!</Text>
          </View>
          <StreakBadge days={profile.streak} />
        </View>

        <XpBar xp={profile.xp} />

        {cookNow ? (
          <Animated.View entering={dealIn(0)}>
            <PaperCard color={paper.red} shape="d" tilt={-1} lift={6} contentStyle={styles.hero}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroKicker}>
                  {cookNow.missing.length === 0 ? 'You can cook this now' : `Missing ${cookNow.missing.length}`}
                </Text>
                <Text style={styles.heroTitle}>{cookNow.recipe.title}</Text>
                <Text style={styles.heroMeta}>
                  {cookNow.have} of {cookNow.total} ingredients · {estimateRecipeMinutes(cookNow.recipe.steps.length)} min · +{heroXp} XP
                </Text>
                <PaperButton
                  label="Let's cook"
                  color={paper.card}
                  textColor={paper.ink}
                  size="md"
                  onPress={() => router.push(`/recipe/${cookNow.recipe.id}`)}
                  style={styles.heroBtn}
                />
              </View>
              <Bob style={styles.heroArt} distance={7} rock={3}>
                <DishArt title={cookNow.recipe.title} size={136} />
              </Bob>
            </PaperCard>
          </Animated.View>
        ) : (
          <PaperCard color={paper.red} shape="d" tilt={-1} lift={6} contentStyle={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>Your recipe box is empty</Text>
              <Text style={styles.heroTitle}>Save your first recipe</Text>
              <PaperButton
                label="Add one"
                color={paper.card}
                textColor={paper.ink}
                onPress={() => router.push('/add')}
                style={styles.heroBtn}
              />
            </View>
          </PaperCard>
        )}

        <View>
          <SectionTitle
            title="Use it up"
            right={
              <Pressable accessibilityRole="link" onPress={() => router.push('/fridge')} hitSlop={10}>
                <Text style={styles.link}>Pantry</Text>
              </Pressable>
            }
          />
          {expiring.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {expiring.map((item, index) => (
                <UseItUpChip key={item.id} item={item} index={index} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.empty}>Everything in your fridge is fresh.</Text>
          )}
        </View>

        <View>
          <SectionTitle
            title="Recipe box"
            right={
              recipes.length > 4 ? (
                <Pressable accessibilityRole="link" onPress={() => router.push('/recipes')} hitSlop={10}>
                  <Text style={styles.link}>See all {recipes.length}</Text>
                </Pressable>
              ) : null
            }
          />
          <View style={styles.grid}>
            {recipes.slice(0, 4).map((recipe, index) => {
              const match = matchRecipe(recipe, fridge);
              const kind = dishKindFor(recipe.title);
              const color = dishColor(kind);
              const light = color === paper.yellow || color === paper.blue || color === paper.orange;
              return (
                <Animated.View key={recipe.id} entering={dealIn(index + 2)} style={styles.gridCell}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Cook ${recipe.title}`}
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <PaperCard
                      color={color}
                      shape={index % 2 ? 'b' : 'c'}
                      tilt={index % 2 ? 1.5 : -1}
                      lift={4}
                      contentStyle={styles.recipeCard}
                    >
                      <DishArt title={recipe.title} size={78} />
                      <Text style={[styles.recipeTitle, { color: light ? paper.ink : paper.card }]} numberOfLines={2}>
                        {recipe.title}
                      </Text>
                      <Text style={[styles.recipeMeta, { color: light ? paper.ink : paper.card }]}>
                        Have {match.have} of {match.total}
                      </Text>
                    </PaperCard>
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
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipExpiry: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  chipName: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  chipRow: {
    gap: 12,
    paddingBottom: 8,
    paddingRight: 8,
    paddingTop: 2,
  },
  content: {
    gap: 22,
    paddingHorizontal: 20,
  },
  empty: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  gridCell: {
    width: '47.5%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hello: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
  },
  hero: {
    flexDirection: 'row',
    minHeight: 178,
    padding: 18,
  },
  heroArt: {
    position: 'absolute',
    right: 0,
    top: 18,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 110,
  },
  heroKicker: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroMeta: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
  },
  heroTitle: {
    color: paper.card,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 33,
    marginBottom: 4,
    marginTop: 6,
  },
  kicker: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  link: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  recipeCard: {
    minHeight: 168,
    padding: 12,
  },
  recipeMeta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    marginTop: 2,
  },
  recipeTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 21,
    marginTop: 4,
  },
});
