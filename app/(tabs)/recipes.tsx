import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt, dishColor, dishKindFor, type DishKind } from '../../components/paper/DishArt';
import { ChipRow, FilterChip } from '../../components/paper/FilterChip';
import { dealIn } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperCard } from '../../components/paper/PaperCard';
import { matchRecipe } from '../../lib/pantryMatch';
import { cutCorners, estimateRecipeMinutes, fonts, formatSource, paper } from '../../lib/theme';
import { useKitchen } from '../../lib/useKitchen';

const TYPE_FOR_KIND: Record<DishKind, string> = {
  omelette: 'Breakfast',
  pasta: 'Pasta',
  soup: 'Soup',
  salad: 'Salad',
  rice: 'Rice',
  pie: 'Baking',
  sandwich: 'Sandwiches',
  smoothie: 'Drinks',
  bowl: 'Other',
};
const TYPE_ORDER = ['All', 'Breakfast', 'Pasta', 'Soup', 'Salad', 'Rice', 'Baking', 'Sandwiches', 'Drinks', 'Other'];

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes, fridge } = useKitchen();
  const [type, setType] = useState('All');
  const [query, setQuery] = useState('');
  const [cookNow, setCookNow] = useState(false);
  const [quick, setQuick] = useState(false);
  const [rescue, setRescue] = useState(false);

  const enriched = useMemo(
    () =>
      recipes.map((recipe) => {
        const match = matchRecipe(recipe, fridge);
        const kind = dishKindFor(recipe.title);
        return { recipe, match, kind, type: TYPE_FOR_KIND[kind], minutes: estimateRecipeMinutes(recipe.steps.length) };
      }),
    [fridge, recipes],
  );

  const types = TYPE_ORDER.filter((t) => t === 'All' || enriched.some((r) => r.type === t));
  const q = query.trim().toLowerCase();
  const shown = enriched.filter(
    (r) =>
      (type === 'All' || r.type === type) &&
      (!cookNow || r.match.missing.length === 0) &&
      (!quick || r.minutes <= 20) &&
      (!rescue || r.match.usesExpiring) &&
      (!q || r.recipe.title.toLowerCase().includes(q) || r.recipe.ingredients.some((i) => i.toLowerCase().includes(q))),
  );

  return (
    <PaperBackground>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Recipe box</Text>
          <Text style={styles.count}>
            {shown.length} of {recipes.length}
          </Text>
        </View>
        <View style={[styles.search, cutCorners.c]}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Circle cx="11" cy="11" r="7" fill="none" stroke={paper.inkSoft} strokeWidth={2.6} />
            <Path d="M20 20l-4-4" stroke={paper.inkSoft} strokeWidth={2.6} strokeLinecap="round" />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes or ingredients"
            placeholderTextColor={paper.inkSoft}
            style={styles.searchInput}
            accessibilityLabel="Search recipes"
            returnKeyType="search"
          />
        </View>
      </View>

      <View>
        <ChipRow options={types} value={type} onChange={setType} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toggles}>
          <FilterChip variant="toggle" label="Can cook now" active={cookNow} onPress={() => setCookNow((v) => !v)} />
          <FilterChip variant="toggle" label="Under 20 min" active={quick} onPress={() => setQuick((v) => !v)} />
          <FilterChip variant="toggle" label="Uses expiring" active={rescue} onPress={() => setRescue((v) => !v)} />
        </ScrollView>
      </View>

      <FlatList
        data={shown}
        keyExtractor={(item) => item.recipe.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        ListEmptyComponent={
          <Text style={styles.empty}>{recipes.length ? 'No recipes match these filters.' : 'No recipes yet. Tap + to add one.'}</Text>
        }
        renderItem={({ item, index }) => {
          const { recipe, match, kind, minutes } = item;
          const ready = match.missing.length === 0;
          const pct = match.total ? match.have / match.total : 0;
          return (
            <Animated.View entering={dealIn(Math.min(index, 8))}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Cook ${recipe.title}`}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <PaperCard shape={index % 2 ? 'b' : 'a'} tilt={index % 2 ? 0.6 : -0.6} lift={4} contentStyle={styles.card}>
                  <View style={[styles.art, cutCorners.c, { backgroundColor: dishColor(kind) }]}>
                    <DishArt title={recipe.title} size={70} />
                  </View>
                  <View style={styles.copy}>
                    <View style={styles.badges}>
                      {ready ? (
                        <Text style={[styles.badge, { backgroundColor: paper.green }]}>Cook now</Text>
                      ) : null}
                      {match.usesExpiring ? (
                        <Text style={[styles.badge, { backgroundColor: paper.red }]}>Uses expiring</Text>
                      ) : null}
                    </View>
                    <Text style={styles.name} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <Text style={styles.meta}>
                      {minutes} min · {formatSource(recipe.source)}
                    </Text>
                    <View style={styles.haveRow}>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            { width: `${Math.max(6, pct * 100)}%`, backgroundColor: ready ? paper.green : paper.yellow },
                          ]}
                        />
                      </View>
                      <Text style={styles.have}>
                        {match.have}/{match.total}
                      </Text>
                    </View>
                  </View>
                </PaperCard>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  art: {
    alignItems: 'center',
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  badge: {
    borderRadius: 7,
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  count: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  empty: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    paddingTop: 40,
    textAlign: 'center',
  },
  fill: {
    borderRadius: 5,
    height: '100%',
  },
  have: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  haveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  header: {
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  list: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  meta: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 12.5,
    marginTop: 2,
  },
  name: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 23,
    marginTop: 3,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  search: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: paper.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 44,
  },
  title: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
  },
  titleRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggles: {
    gap: 8,
    paddingBottom: 6,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  track: {
    backgroundColor: paper.kraft,
    borderRadius: 5,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
});
