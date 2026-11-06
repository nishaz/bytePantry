import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt } from '../../components/paper/DishArt';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { BagIcon, CheckIcon } from '../../components/paper/UiIcons';
import {
  addPlanned,
  groupPlan,
  listPlan,
  MEAL_SLOTS,
  removePlanned,
  rollingWeek,
  weekRangeLabel,
  type MealSlot,
  type PlanDay,
} from '../../lib/mealPlan';
import { matchRecipe } from '../../lib/pantryMatch';
import { cutCorners, estimateRecipeMinutes, fonts, paper } from '../../lib/theme';
import { useKitchen } from '../../lib/useKitchen';
import type { Recipe } from '../../types/recipe';

const SLOT_STYLE: Record<MealSlot, { text: string; tint: string; short: string }> = {
  lunch: { text: paper.amberText, tint: '#FFF3DA', short: 'Lunch' },
  dinner: { text: paper.redDeep, tint: '#FBE3DC', short: 'Dinner' },
  dessert: { text: '#7A3B5C', tint: '#F4E4EE', short: 'Sweet' },
  extras: { text: paper.greenDeep, tint: '#E4F0DF', short: 'Extra' },
};

type Key = string; // `${day}|${slot}`
const keyOf = (day: string, slot: MealSlot): Key => `${day}|${slot}`;
const splitKey = (key: Key) => {
  const [day, slot] = key.split('|');
  return { day, slot: slot as MealSlot };
};

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes, fridge } = useKitchen();
  const [days, setDays] = useState<PlanDay[]>(() => rollingWeek());
  const [plan, setPlan] = useState<Record<Key, string[]>>({});
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selected, setSelected] = useState(0);
  const [sheet, setSheet] = useState<Key | null>(null);
  const [shopping, setShopping] = useState(false);

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const load = useCallback(async () => {
    const week = rollingWeek();
    setDays(week);
    const rows = await listPlan(week[0].key, week[week.length - 1].key);
    setPlan(groupPlan(rows));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Recipes in a slot, skipping any that were deleted from the recipe box.
  const idsIn = useCallback((key: Key) => (plan[key] ?? []).filter((id) => byId.has(id)), [plan, byId]);

  const toggle = useCallback(
    async (key: Key, recipeId: string) => {
      const { day, slot } = splitKey(key);
      const has = (plan[key] ?? []).includes(recipeId);
      setPlan((p) => ({ ...p, [key]: has ? (p[key] ?? []).filter((x) => x !== recipeId) : [...(p[key] ?? []), recipeId] }));
      if (has) await removePlanned(day, slot, recipeId);
      else await addPlanned(day, slot, recipeId);
    },
    [plan],
  );

  const shoppingGroups = useMemo(() => {
    const seen = new Map<string, { recipe: Recipe; when: string[]; missing: string[] }>();
    for (const d of days) {
      for (const s of MEAL_SLOTS) {
        for (const id of idsIn(keyOf(d.key, s.key))) {
          const recipe = byId.get(id)!;
          const when = `${d.short} ${s.label.toLowerCase()}`;
          const entry = seen.get(id);
          if (entry) entry.when.push(when);
          else seen.set(id, { recipe, when: [when], missing: matchRecipe(recipe, fridge).missing });
        }
      }
    }
    return [...seen.values()].filter((g) => g.missing.length > 0);
  }, [days, idsIn, byId, fridge]);
  const needCount = shoppingGroups.reduce((n, g) => n + g.missing.length, 0);

  const day = days[selected] ?? days[0];

  return (
    <PaperBackground>
      <View style={styles.flex}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.flex}>
            <Text style={styles.range}>{weekRangeLabel(days)}</Text>
            <Text style={styles.title}>Meal plan</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Shopping list, ${needCount} items`} onPress={() => setShopping(true)}>
            <PaperCard shape="c" lift={2} contentStyle={styles.needBtn}>
              <BagIcon size={15} />
              <Text style={styles.needText}>{needCount ? `Need ${needCount}` : 'All set'}</Text>
            </PaperCard>
          </Pressable>
        </View>

        <View style={[styles.segment, cutCorners.c]} accessibilityRole="tablist">
          {(['day', 'week'] as const).map((v) => (
            <Pressable
              key={v}
              accessibilityRole="tab"
              accessibilityState={{ selected: view === v }}
              onPress={() => setView(v)}
              style={[styles.segBtn, cutCorners.b, view === v && styles.segOn]}
            >
              <Text style={styles.segText}>{v === 'day' ? 'Day' : 'Week'}</Text>
            </Pressable>
          ))}
        </View>

        {view === 'day' ? (
          <>
            <View style={styles.strip}>
              {days.map((d, i) => {
                const on = i === selected;
                const dots = MEAL_SLOTS.filter((s) => idsIn(keyOf(d.key, s.key)).length > 0);
                return (
                  <Pressable
                    key={d.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${d.name}, ${dots.length} meals planned`}
                    onPress={() => setSelected(i)}
                    style={[styles.pill, cutCorners.b, on && styles.pillOn]}
                  >
                    <Text style={[styles.pillShort, on && styles.pillTextOn]}>{d.short}</Text>
                    <Text style={[styles.pillDate, on && styles.pillTextOn]}>{d.date.getDate()}</Text>
                    <View style={styles.dots}>
                      {dots.map((s) => (
                        <View key={s.key} style={[styles.dot, { backgroundColor: SLOT_STYLE[s.key].text }]} />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView contentContainerStyle={[styles.dayList, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
              <Text style={styles.dayName}>
                {day.name} · {day.full}
              </Text>
              {MEAL_SLOTS.map((s) => {
                const key = keyOf(day.key, s.key);
                const ids = idsIn(key);
                const st = SLOT_STYLE[s.key];
                return (
                  <PaperCard key={key} shape="b" lift={2} contentStyle={styles.slotCard}>
                    <View style={styles.slotHead}>
                      <Text style={[styles.slotLabel, { color: st.text }]}>{s.label}</Text>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Add to ${day.name} ${s.label.toLowerCase()}`} hitSlop={10} onPress={() => setSheet(key)}>
                        <Text style={[styles.addText, { color: st.text }]}>+ Add</Text>
                      </Pressable>
                    </View>
                    {ids.length === 0 ? (
                      <Pressable accessibilityRole="button" onPress={() => setSheet(key)}>
                        <Text style={styles.nothing}>Nothing yet</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.items}>
                        {ids.map((id) => {
                          const r = byId.get(id)!;
                          return (
                            <Animated.View key={id} entering={FadeIn.duration(180)} style={[styles.item, cutCorners.c, { backgroundColor: st.tint }]}>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Open ${r.title}`}
                                onPress={() => router.push(`/recipe/${r.id}`)}
                                style={styles.itemMain}
                              >
                                <DishArt title={r.title} size={30} />
                                <Text style={styles.itemText} numberOfLines={1}>
                                  {r.title}
                                </Text>
                              </Pressable>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${r.title}`}
                                hitSlop={8}
                                onPress={() => toggle(key, id)}
                                style={styles.remove}
                              >
                                <Text style={styles.removeText}>×</Text>
                              </Pressable>
                            </Animated.View>
                          );
                        })}
                      </View>
                    )}
                  </PaperCard>
                );
              })}
            </ScrollView>
          </>
        ) : (
          <ScrollView contentContainerStyle={[styles.week, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
            <View style={styles.weekRow}>
              <View style={styles.weekDayCol} />
              {MEAL_SLOTS.map((s) => (
                <Text key={s.key} style={[styles.weekHead, { color: SLOT_STYLE[s.key].text }]}>
                  {SLOT_STYLE[s.key].short}
                </Text>
              ))}
            </View>
            {days.map((d, i) => (
              <View key={d.key} style={styles.weekRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${d.name}`}
                  onPress={() => {
                    setSelected(i);
                    setView('day');
                  }}
                  style={[styles.weekDayCol, styles.weekDay, cutCorners.b, i === 0 && styles.pillOn]}
                >
                  <Text style={[styles.pillShort, i === 0 && styles.pillTextOn]}>{d.short}</Text>
                  <Text style={[styles.pillDate, i === 0 && styles.pillTextOn]}>{d.date.getDate()}</Text>
                </Pressable>
                {MEAL_SLOTS.map((s) => {
                  const key = keyOf(d.key, s.key);
                  const ids = idsIn(key);
                  const st = SLOT_STYLE[s.key];
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityLabel={`${d.name} ${s.label}: ${ids.length ? ids.map((id) => byId.get(id)!.title).join(', ') : 'empty'}`}
                      onPress={() => setSheet(key)}
                      style={[styles.cell, cutCorners.c, ids.length ? { backgroundColor: st.tint } : styles.cellEmpty]}
                    >
                      {ids.length === 0 ? <Text style={styles.cellPlus}>+</Text> : null}
                      {ids.slice(0, 2).map((id, n) => (
                        <View key={id} style={n === 1 ? styles.cellSecond : null}>
                          <DishArt title={byId.get(id)!.title} size={ids.length > 1 ? 28 : 36} />
                        </View>
                      ))}
                      {ids.length > 2 ? (
                        <View style={styles.cellMore}>
                          <Text style={styles.cellMoreText}>+{ids.length - 2}</Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
            <Text style={styles.weekHint}>Tap a box to add recipes · tap a day for its full list</Text>
          </ScrollView>
        )}

        {sheet ? (
          <PickSheet
            slotKey={sheet}
            days={days}
            recipes={recipes}
            fridge={fridge}
            chosen={plan[sheet] ?? []}
            onToggle={(id) => toggle(sheet, id)}
            onClose={() => setSheet(null)}
          />
        ) : null}

        {shopping ? <ShoppingSheet groups={shoppingGroups} onClose={() => setShopping(false)} /> : null}
      </View>
    </PaperBackground>
  );
}

/** Pick any number of recipes for one meal. */
function PickSheet({
  slotKey,
  days,
  recipes,
  fridge,
  chosen,
  onToggle,
  onClose,
}: {
  slotKey: Key;
  days: PlanDay[];
  recipes: Recipe[];
  fridge: Parameters<typeof matchRecipe>[1];
  chosen: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { day, slot } = splitKey(slotKey);
  const d = days.find((x) => x.key === day);
  const st = SLOT_STYLE[slot];
  const label = MEAL_SLOTS.find((s) => s.key === slot)?.label ?? '';
  const q = query.trim().toLowerCase();
  const shown = recipes.filter((r) => !q || r.title.toLowerCase().includes(q) || r.ingredients.some((i) => i.toLowerCase().includes(q)));

  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
      <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        entering={SlideInDown.duration(220).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(160)}
        style={[styles.sheet, styles.pickSheet, { paddingBottom: insets.bottom + 96 }]}
      >
        <View style={styles.grabber} />
        <View style={styles.sheetHead}>
          <View style={styles.flex}>
            <Text style={[styles.slotLabel, { color: st.text }]}>
              {d?.name} · {label}
            </Text>
            <Text style={styles.sheetTitle}>Add recipes</Text>
          </View>
          <PaperButton label="Done" color={paper.green} size="sm" onPress={onClose} />
        </View>
        <View style={[styles.search, cutCorners.c]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your recipes"
            placeholderTextColor={paper.inkSoft}
            style={styles.searchInput}
            accessibilityLabel="Search your recipes"
          />
        </View>
        <ScrollView style={styles.pickList} contentContainerStyle={styles.pickContent} keyboardShouldPersistTaps="handled">
          {shown.length === 0 ? <Text style={styles.empty}>{recipes.length ? 'No recipes match.' : 'Add a recipe first.'}</Text> : null}
          {shown.map((r) => {
            const on = chosen.includes(r.id);
            const m = matchRecipe(r, fridge);
            return (
              <Pressable
                key={r.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => onToggle(r.id)}
                style={[styles.pickRow, cutCorners.c, on && { backgroundColor: st.tint, borderColor: st.text }]}
              >
                <DishArt title={r.title} size={40} />
                <View style={styles.flex}>
                  <Text style={styles.pickTitle} numberOfLines={1}>
                    {r.title}
                  </Text>
                  <Text style={styles.pickMeta}>
                    {estimateRecipeMinutes(r.steps.length)} min · have {m.have}/{m.total}
                  </Text>
                </View>
                <View style={[styles.pickMark, cutCorners.b, on && { backgroundColor: st.text }]}>
                  {on ? <CheckIcon size={14} color={paper.card} /> : <Text style={styles.pickPlus}>+</Text>}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

function ShoppingSheet({
  groups,
  onClose,
}: {
  groups: { recipe: Recipe; when: string[]; missing: string[] }[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
      <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        entering={SlideInDown.duration(220).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(160)}
        style={[styles.sheet, styles.pickSheet, { paddingBottom: insets.bottom + 96 }]}
      >
        <View style={styles.grabber} />
        <Text style={styles.sheetTitle}>Shopping for the week</Text>
        <Text style={styles.pickMeta}>What your planned meals need that isn't in your pantry.</Text>
        <ScrollView style={styles.pickList} contentContainerStyle={styles.shopContent}>
          {groups.length === 0 ? <Text style={styles.empty}>Nothing to buy. Your pantry covers the plan.</Text> : null}
          {groups.map((g) => (
            <View key={g.recipe.id}>
              <Text style={styles.shopFor}>
                {g.recipe.title} <Text style={styles.pickMeta}>· {g.when.join(', ')}</Text>
              </Text>
              {g.missing.map((item) => {
                const k = `${g.recipe.id}:${item}`;
                const done = ticked.has(k);
                return (
                  <Pressable
                    key={k}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                    onPress={() =>
                      setTicked((t) => {
                        const next = new Set(t);
                        if (next.has(k)) next.delete(k);
                        else next.add(k);
                        return next;
                      })
                    }
                    style={styles.shopItem}
                  >
                    <View style={[styles.box, cutCorners.b, done && styles.boxOn]}>{done ? <CheckIcon size={14} /> : null}</View>
                    <Text style={[styles.shopText, done && styles.shopDone]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
        <PaperButton label="Done" color={paper.green} onPress={onClose} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  addText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  backdrop: {
    backgroundColor: 'rgba(43,35,32,0.45)',
    bottom: 0,
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  box: {
    alignItems: 'center',
    backgroundColor: paper.kraft,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  boxOn: {
    backgroundColor: paper.green,
  },
  cell: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
  },
  cellEmpty: {
    backgroundColor: 'rgba(255,248,236,0.5)',
    borderColor: paper.kraftDeep,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  cellMore: {
    backgroundColor: paper.ink,
    borderRadius: 6,
    paddingHorizontal: 4,
    position: 'absolute',
    right: 3,
    top: 2,
  },
  cellMoreText: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  cellPlus: {
    color: paper.kraftDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  cellSecond: {
    marginLeft: -10,
  },
  dayList: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dayName: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  dot: {
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 2,
    height: 4,
  },
  empty: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    paddingVertical: 20,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: paper.kraftDeep,
    borderRadius: 3,
    height: 5,
    width: 40,
  },
  header: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    maxWidth: '100%',
    paddingLeft: 2,
    paddingRight: 4,
    paddingVertical: 2,
  },
  itemMain: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 5,
  },
  itemText: {
    color: paper.ink,
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  needBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  needText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  nothing: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    marginTop: 4,
  },
  pickContent: {
    gap: 6,
    paddingBottom: 6,
  },
  pickList: {
    maxHeight: 420,
  },
  pickMark: {
    alignItems: 'center',
    backgroundColor: paper.kraft,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  pickMeta: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
  },
  pickPlus: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 17,
  },
  pickRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pickSheet: {
    maxHeight: '88%',
  },
  pickTitle: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flex: 1,
    gap: 2,
    paddingBottom: 5,
    paddingTop: 6,
  },
  pillDate: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 18,
  },
  pillOn: {
    backgroundColor: paper.ink,
  },
  pillShort: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  pillTextOn: {
    color: paper.card,
  },
  range: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  remove: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  removeText: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  search: {
    backgroundColor: paper.kraft,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 10,
  },
  searchInput: {
    color: paper.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 38,
  },
  segBtn: {
    alignItems: 'center',
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  segOn: {
    backgroundColor: paper.card,
  },
  segText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  segment: {
    backgroundColor: paper.kraftDeep,
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 3,
  },
  sheet: {
    backgroundColor: paper.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 26,
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  sheetTitle: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 20,
  },
  shopContent: {
    gap: 14,
    paddingBottom: 6,
  },
  shopDone: {
    color: paper.inkSoft,
    textDecorationLine: 'line-through',
  },
  shopFor: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 15,
    marginBottom: 4,
  },
  shopItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 38,
  },
  shopText: {
    color: paper.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
  },
  slotCard: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  slotHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slotLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  strip: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  week: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  weekDay: {
    justifyContent: 'center',
    paddingLeft: 6,
  },
  weekDayCol: {
    width: 52,
  },
  weekHead: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  weekHint: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  weekRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 4,
  },
});
