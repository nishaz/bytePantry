import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DishArt } from '../../components/paper/DishArt';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { BagIcon, CheckIcon } from '../../components/paper/UiIcons';
import {
  clearPlanned,
  listPlan,
  MEAL_SLOTS,
  rollingWeek,
  setPlanned,
  weekRangeLabel,
  type MealSlot,
  type PlanDay,
} from '../../lib/mealPlan';
import { estimateNutrition } from '../../lib/nutrition';
import { matchRecipe } from '../../lib/pantryMatch';
import { DEFAULT_SERVINGS } from '../../lib/scaleIngredients';
import { cutCorners, estimateRecipeMinutes, fonts, paper } from '../../lib/theme';
import { useKitchen } from '../../lib/useKitchen';
import type { Recipe } from '../../types/recipe';

const SLOT_STYLE: Record<MealSlot, { text: string; tint: string }> = {
  lunch: { text: paper.amberText, tint: '#FFF3DA' },
  dinner: { text: paper.redDeep, tint: '#FBE3DC' },
  dessert: { text: '#7A3B5C', tint: '#F4E4EE' },
  extras: { text: paper.greenDeep, tint: '#E4F0DF' },
};

type Key = string; // `${day}|${slot}`
const keyOf = (day: string, slot: MealSlot): Key => `${day}|${slot}`;
const splitKey = (key: Key) => {
  const [day, slot] = key.split('|');
  return { day, slot: slot as MealSlot };
};

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GHOST = 92;

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes, fridge } = useKitchen();
  const [days, setDays] = useState<PlanDay[]>(() => rollingWeek());
  const [plan, setPlan] = useState<Record<Key, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [target, setTarget] = useState<Key | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hover, setHover] = useState<Key | null>(null);
  const [sheet, setSheet] = useState<Key | null>(null);
  const [shopping, setShopping] = useState(false);
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const load = useCallback(async () => {
    const week = rollingWeek();
    setDays(week);
    const rows = await listPlan(week[0].key, week[week.length - 1].key);
    setPlan(Object.fromEntries(rows.map((r) => [keyOf(r.day, r.slot), r.recipeId])));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ---------- placing ----------
  const place = useCallback(async (key: Key, recipeId: string) => {
    const { day, slot } = splitKey(key);
    setPlan((p) => ({ ...p, [key]: recipeId }));
    setPicked(null);
    setTarget(null);
    await setPlanned(day, slot, recipeId);
  }, []);

  const remove = useCallback(
    async (key: Key) => {
      const previous = plan[key];
      const { day, slot } = splitKey(key);
      setPlan((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
      setSheet(null);
      await clearPlanned(day, slot);
      const r = previous ? byId.get(previous) : null;
      if (previous) {
        setToast({ text: `Removed ${r?.title ?? 'meal'}`, undo: () => place(key, previous) });
      }
    },
    [plan, byId, place],
  );

  const move = useCallback(
    async (from: Key, toDay: string) => {
      const { slot } = splitKey(from);
      const to = keyOf(toDay, slot);
      if (to === from) return;
      const moving = plan[from];
      const there = plan[to];
      if (!moving) return;
      setPlan((p) => {
        const next = { ...p, [to]: moving };
        if (there) next[from] = there;
        else delete next[from];
        return next;
      });
      setSheet(to);
      await setPlanned(toDay, slot, moving);
      const fromParts = splitKey(from);
      if (there) await setPlanned(fromParts.day, fromParts.slot, there);
      else await clearPlanned(fromParts.day, fromParts.slot);
    },
    [plan],
  );

  // ---------- layout bookkeeping for drag and drop ----------
  const rootRef = useRef<View>(null);
  const listRef = useRef<ScrollView>(null);
  const listBoxRef = useRef<View>(null);
  const rootWin = useRef({ x: 0, y: 0 });
  const listWin = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const scrollY = useRef(0);
  const contentH = useRef(0);
  const dayRect = useRef<Record<string, Rect>>({});
  const gridRect = useRef<Record<string, Rect>>({});
  const slotRect = useRef<Record<Key, Rect>>({});
  const pointer = useRef({ x: 0, y: 0 });
  const edgeDir = useRef(0);
  const edgeSince = useRef(0);
  const hoverRef = useRef<Key | null>(null);
  const ghost = useRef(new RNAnimated.ValueXY({ x: -999, y: -999 })).current;

  const rect = (e: LayoutChangeEvent): Rect => {
    const { x, y, width, height } = e.nativeEvent.layout;
    return { x, y, w: width, h: height };
  };

  const hitTest = useCallback((px: number, py: number): Key | null => {
    const lw = listWin.current;
    if (py < lw.y || py > lw.y + lw.h) return null;
    for (const [key, s] of Object.entries(slotRect.current)) {
      const { day } = splitKey(key);
      const d = dayRect.current[day];
      const g = gridRect.current[day];
      if (!d || !g) continue;
      const left = lw.x + d.x + g.x + s.x;
      const top = lw.y + d.y + g.y + s.y - scrollY.current;
      if (px >= left && px <= left + s.w && py >= top && py <= top + s.h) return key;
    }
    return null;
  }, []);

  const updateHover = useCallback(() => {
    const k = hitTest(pointer.current.x, pointer.current.y);
    if (k !== hoverRef.current) {
      hoverRef.current = k;
      setHover(k);
    }
  }, [hitTest]);

  const dragStart = useCallback((id: string, px: number, py: number) => {
    rootRef.current?.measureInWindow((x, y) => {
      rootWin.current = { x, y };
      ghost.setValue({ x: px - x - GHOST / 2, y: py - y - GHOST / 2 });
    });
    listBoxRef.current?.measureInWindow((x, y, w, h) => {
      listWin.current = { x, y, w, h };
    });
    pointer.current = { x: px, y: py };
    setPicked(null);
    setTarget(null);
    setDragId(id);
  }, [ghost]);

  const dragMove = useCallback(
    (px: number, py: number) => {
      pointer.current = { x: px, y: py };
      ghost.setValue({ x: px - rootWin.current.x - GHOST / 2, y: py - rootWin.current.y - GHOST / 2 });
      const lw = listWin.current;
      // Rest near the top or bottom edge of the day list to scroll it. A short wait means just
      // passing through the edge on the way up from the tray doesn't scroll the list.
      const dir = py > lw.y + lw.h - 60 && py <= lw.y + lw.h ? 1 : py < lw.y + 50 && py > lw.y - 60 ? -1 : 0;
      if (dir !== edgeDir.current) {
        edgeDir.current = dir;
        edgeSince.current = Date.now();
      }
      updateHover();
    },
    [ghost, updateHover],
  );

  const dragEnd = useCallback(
    (cancelled: boolean) => {
      const key = cancelled ? null : hoverRef.current;
      const id = dragId;
      edgeDir.current = 0;
      hoverRef.current = null;
      setHover(null);
      setDragId(null);
      ghost.setValue({ x: -999, y: -999 });
      if (key && id) place(key, id);
    },
    [dragId, ghost, place],
  );

  useEffect(() => {
    if (!dragId) return;
    const timer = setInterval(() => {
      if (!edgeDir.current || Date.now() - edgeSince.current < 350) return;
      const max = Math.max(0, contentH.current - listWin.current.h);
      const next = Math.min(max, Math.max(0, scrollY.current + edgeDir.current * 9));
      if (next === scrollY.current) return;
      scrollY.current = next;
      listRef.current?.scrollTo({ y: next, animated: false });
      updateHover();
    }, 16);
    return () => clearInterval(timer);
  }, [dragId, updateHover]);

  function jumpTo(day: string) {
    const d = dayRect.current[day];
    if (d) listRef.current?.scrollTo({ y: Math.max(0, d.y - 8), animated: true });
  }

  // ---------- derived ----------
  const holding = dragId ?? picked;
  const tabBarSpace = insets.bottom + 84;
  const planned = days.flatMap((d) =>
    MEAL_SLOTS.map((s) => ({ day: d, slot: s.key, key: keyOf(d.key, s.key), recipe: byId.get(plan[keyOf(d.key, s.key)] ?? '') }))
      .filter((x): x is typeof x & { recipe: Recipe } => !!x.recipe),
  );
  const shoppingGroups = useMemo(() => {
    const seen = new Map<string, { recipe: Recipe; when: string[]; missing: string[] }>();
    for (const p of planned) {
      const entry = seen.get(p.recipe.id);
      const when = `${p.day.short} ${MEAL_SLOTS.find((s) => s.key === p.slot)?.label.toLowerCase()}`;
      if (entry) entry.when.push(when);
      else seen.set(p.recipe.id, { recipe: p.recipe, when: [when], missing: matchRecipe(p.recipe, fridge).missing });
    }
    return [...seen.values()].filter((g) => g.missing.length > 0);
  }, [planned, fridge]);
  const needCount = shoppingGroups.reduce((n, g) => n + g.missing.length, 0);

  const trayHint = dragId
    ? 'Drop it on a slot'
    : target
      ? `Pick a recipe for ${describeKey(target, days)}`
      : picked
        ? 'Now tap a slot'
        : 'Hold and drag up, or tap then tap a slot';

  const sheetRecipe = sheet ? byId.get(plan[sheet] ?? '') : undefined;

  return (
    <PaperBackground>
      <View ref={rootRef} style={styles.flex} collapsable={false}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.flex}>
            <Text style={styles.kicker}>Meal plan</Text>
            <Text style={styles.title}>Next 7 days</Text>
            <Text style={styles.range}>{weekRangeLabel(days)}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Shopping list, ${needCount} items`} onPress={() => setShopping(true)}>
            <PaperCard shape="c" lift={3} contentStyle={styles.needBtn}>
              <BagIcon size={18} />
              <Text style={styles.needText}>{needCount ? `Need ${needCount}` : 'All set'}</Text>
            </PaperCard>
          </Pressable>
        </View>

        <View style={styles.strip}>
          {days.map((d) => {
            const dots = MEAL_SLOTS.filter((s) => plan[keyOf(d.key, s.key)] && byId.has(plan[keyOf(d.key, s.key)]));
            const today = d.index === 0;
            return (
              <Pressable
                key={d.key}
                accessibilityRole="button"
                accessibilityLabel={`${d.name}, ${dots.length} planned`}
                onPress={() => jumpTo(d.key)}
                style={[styles.pill, cutCorners.b, today && styles.pillToday]}
              >
                <Text style={[styles.pillShort, today && styles.pillTextToday]}>{d.short}</Text>
                <Text style={[styles.pillDate, today && styles.pillTextToday]}>{d.date.getDate()}</Text>
                <View style={styles.dots}>
                  {dots.map((s) => (
                    <View key={s.key} style={[styles.dot, { backgroundColor: SLOT_STYLE[s.key].text }]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View
          ref={listBoxRef}
          style={styles.flex}
          collapsable={false}
          onLayout={() =>
            listBoxRef.current?.measureInWindow((x, y, w, h) => {
              listWin.current = { x, y, w, h };
            })
          }
        >
        <ScrollView
          ref={listRef}
          style={styles.flex}
          contentContainerStyle={styles.list}
          scrollEnabled={!dragId}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollY.current = e.nativeEvent.contentOffset.y;
          }}
          onContentSizeChange={(_, h) => {
            contentH.current = h;
          }}
          showsVerticalScrollIndicator={false}
        >
          {days.map((d) => (
            <View
              key={d.key}
              onLayout={(e) => {
                dayRect.current[d.key] = rect(e);
              }}
            >
              <PaperCard shape={d.index % 2 ? 'b' : 'a'} lift={4} contentStyle={styles.dayCard}>
                <View style={styles.dayHead}>
                  <Text style={styles.dayName}>{d.name}</Text>
                  <Text style={styles.dayFull}>{d.full}</Text>
                </View>
                <View
                  style={styles.grid}
                  onLayout={(e) => {
                    // Card face padding is part of the grid's offset inside the day row.
                    gridRect.current[d.key] = rect(e);
                  }}
                >
                  {MEAL_SLOTS.map((s) => {
                    const key = keyOf(d.key, s.key);
                    const recipe = byId.get(plan[key] ?? '');
                    const isHover = hover === key;
                    const isTarget = target === key;
                    const st = SLOT_STYLE[s.key];
                    return (
                      <View
                        key={key}
                        style={styles.slotCell}
                        onLayout={(e) => {
                          slotRect.current[key] = rect(e);
                        }}
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={recipe ? `${d.name} ${s.label}: ${recipe.title}` : `Plan ${s.label.toLowerCase()} for ${d.name}`}
                          onPress={() => {
                            if (picked) place(key, picked);
                            else if (recipe) setSheet(key);
                            else setTarget(isTarget ? null : key);
                          }}
                          style={[
                            styles.slot,
                            cutCorners.c,
                            recipe
                              ? { backgroundColor: st.tint, borderColor: 'transparent', borderStyle: 'solid' }
                              : holding || isTarget
                                ? styles.slotReady
                                : styles.slotEmpty,
                            isHover && styles.slotHover,
                          ]}
                        >
                          {recipe ? (
                            <Animated.View key={recipe.id} entering={FadeIn.duration(200)} style={styles.slotFilled}>
                              <DishArt title={recipe.title} size={40} />
                              <View style={styles.flex}>
                                <Text style={[styles.slotLabel, { color: isHover ? paper.ink : st.text }]}>{s.label}</Text>
                                <Text style={styles.slotTitle} numberOfLines={2}>
                                  {recipe.title}
                                </Text>
                              </View>
                            </Animated.View>
                          ) : (
                            <View>
                              <Text style={[styles.slotLabel, { color: isHover ? paper.ink : st.text }]}>{s.label}</Text>
                              <Text style={styles.slotHint}>{isHover ? 'Let go to add' : holding ? 'Drop here' : isTarget ? 'Pick below' : 'Empty'}</Text>
                            </View>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </PaperCard>
            </View>
          ))}
        </ScrollView>
        </View>

        <View style={[styles.tray, { paddingBottom: tabBarSpace }]}>
          <View style={styles.trayHead}>
            <Text style={styles.trayTitle}>Your recipes</Text>
            <Text style={[styles.trayHint, (holding || target) && styles.trayHintActive]} numberOfLines={1}>
              {recipes.length ? trayHint : 'Add a recipe first'}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trayRow} scrollEnabled={!dragId}>
            {recipes.map((r) => (
              <TrayChip
                key={r.id}
                recipe={r}
                active={holding === r.id}
                faded={dragId === r.id}
                onTap={() => {
                  if (target) place(target, r.id);
                  else setPicked((p) => (p === r.id ? null : r.id));
                }}
                onDragStart={dragStart}
                onDragMove={dragMove}
                onDragEnd={dragEnd}
              />
            ))}
          </ScrollView>
        </View>

        {dragId ? (
          <RNAnimated.View style={[styles.ghost, { pointerEvents: 'none', transform: ghost.getTranslateTransform() }]}>
            <View style={[styles.ghostFace, cutCorners.c]}>
              <DishArt title={byId.get(dragId)?.title ?? ''} size={52} />
              <Text style={styles.chipText} numberOfLines={2}>
                {byId.get(dragId)?.title}
              </Text>
            </View>
          </RNAnimated.View>
        ) : null}

        {sheet && sheetRecipe ? (
          <MealSheet
            recipe={sheetRecipe}
            slotKey={sheet}
            days={days}
            fridgeMissing={matchRecipe(sheetRecipe, fridge).missing}
            onClose={() => setSheet(null)}
            onCook={() => {
              setSheet(null);
              router.push({ pathname: '/cook/[id]', params: { id: sheetRecipe.id } });
            }}
            onSwap={() => {
              setTarget(sheet);
              setSheet(null);
            }}
            onRemove={() => remove(sheet)}
            onMove={(dayKey) => move(sheet, dayKey)}
          />
        ) : null}

        {shopping ? (
          <ShoppingSheet groups={shoppingGroups} onClose={() => setShopping(false)} />
        ) : null}

        {toast ? (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={[styles.toast, cutCorners.b, { bottom: tabBarSpace + 120 }]}>
            <Text style={styles.toastText}>{toast.text}</Text>
            {toast.undo ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => {
                  toast.undo?.();
                  setToast(null);
                }}
              >
                <Text style={styles.toastUndo}>Undo</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </PaperBackground>
  );
}

function describeKey(key: Key, days: PlanDay[]): string {
  const { day, slot } = splitKey(key);
  const d = days.find((x) => x.key === day);
  return `${d?.short ?? ''} ${MEAL_SLOTS.find((s) => s.key === slot)?.label.toLowerCase() ?? ''}`.trim();
}

/** A recipe in the tray: tap to pick it, or hold (or drag upward) to carry it to a slot. */
function TrayChip({
  recipe,
  active,
  faded,
  onTap,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  recipe: Recipe;
  active: boolean;
  faded: boolean;
  onTap: () => void;
  onDragStart: (id: string, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (cancelled: boolean) => void;
}) {
  // Latest callbacks in a ref so the responder (created once) never calls stale ones.
  const cb = useRef({ onTap, onDragStart, onDragMove, onDragEnd });
  cb.current = { onTap, onDragStart, onDragMove, onDragEnd };
  const dragging = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef({ x: 0, y: 0 });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          last.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
          timer.current = setTimeout(() => {
            dragging.current = true;
            cb.current.onDragStart(recipe.id, last.current.x, last.current.y);
          }, 260);
        },
        onPanResponderMove: (e, g) => {
          last.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
          if (dragging.current) {
            cb.current.onDragMove(last.current.x, last.current.y);
            return;
          }
          // A clear upward flick starts dragging straight away; sideways is left to the tray's scroll.
          if (g.dy < -12 && Math.abs(g.dy) > Math.abs(g.dx)) {
            if (timer.current) clearTimeout(timer.current);
            dragging.current = true;
            cb.current.onDragStart(recipe.id, last.current.x, last.current.y);
          } else if (Math.abs(g.dx) > 8 && timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
          }
        },
        onPanResponderRelease: (_, g) => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = null;
          if (dragging.current) {
            dragging.current = false;
            cb.current.onDragEnd(false);
          } else if (Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8) {
            cb.current.onTap();
          }
        },
        onPanResponderTerminate: () => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = null;
          if (dragging.current) {
            dragging.current = false;
            cb.current.onDragEnd(true);
          }
        },
        onPanResponderTerminationRequest: () => !dragging.current,
      }),
    [recipe.id],
  );

  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}. Tap to pick, hold to drag.`}
      accessibilityState={{ selected: active }}
      style={[styles.chip, cutCorners.c, active && styles.chipActive, faded && styles.chipFaded]}
    >
      <DishArt title={recipe.title} size={52} />
      <Text style={styles.chipText} numberOfLines={2}>
        {recipe.title}
      </Text>
    </View>
  );
}

function MealSheet({
  recipe,
  slotKey,
  days,
  fridgeMissing,
  onClose,
  onCook,
  onSwap,
  onRemove,
  onMove,
}: {
  recipe: Recipe;
  slotKey: Key;
  days: PlanDay[];
  fridgeMissing: string[];
  onClose: () => void;
  onCook: () => void;
  onSwap: () => void;
  onRemove: () => void;
  onMove: (day: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { day, slot } = splitKey(slotKey);
  const d = days.find((x) => x.key === day);
  const label = MEAL_SLOTS.find((s) => s.key === slot)?.label ?? '';
  const servings = recipe.servings ?? DEFAULT_SERVINGS;
  const kcal = (recipe.nutrition ?? estimateNutrition(recipe.ingredients, servings)).calories;
  const have = recipe.ingredients.length - fridgeMissing.length;
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
      <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        entering={SlideInDown.duration(220).easing(Easing.out(Easing.cubic))}
        exiting={SlideOutDown.duration(160)}
        style={[styles.sheet, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.grabber} />
        <View style={styles.sheetHead}>
          <View style={[styles.sheetArt, cutCorners.c]}>
            <DishArt title={recipe.title} size={84} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.slotLabel, { color: SLOT_STYLE[slot].text, fontSize: 12 }]}>
              {d?.name} · {label}
            </Text>
            <Text style={styles.sheetTitle}>{recipe.title}</Text>
            <Text style={styles.sheetMeta}>
              {estimateRecipeMinutes(recipe.steps.length)} min · serves {servings} · {kcal} kcal
            </Text>
          </View>
        </View>

        <View style={[styles.haveRow, cutCorners.b]}>
          <View style={[styles.haveBadge, { backgroundColor: fridgeMissing.length ? paper.yellow : paper.green }]}>
            <Text style={[styles.haveBadgeText, !fridgeMissing.length && { color: paper.card }]}>
              Have {have} of {recipe.ingredients.length}
            </Text>
          </View>
          <Text style={styles.haveText} numberOfLines={2}>
            {fridgeMissing.length ? `Need ${fridgeMissing.join(', ')}` : 'You have everything'}
          </Text>
        </View>

        <Text style={styles.moveLabel}>Move to</Text>
        <View style={styles.moveRow}>
          {days.map((x) => {
            const on = x.key === day;
            return (
              <Pressable
                key={x.key}
                accessibilityRole="button"
                accessibilityLabel={`Move to ${x.name}`}
                accessibilityState={{ selected: on }}
                onPress={() => onMove(x.key)}
                style={[styles.moveDay, cutCorners.b, on && styles.moveDayOn]}
              >
                <Text style={[styles.pillShort, on && styles.pillTextToday]}>{x.short}</Text>
                <Text style={[styles.pillDate, on && styles.pillTextToday]}>{x.date.getDate()}</Text>
              </Pressable>
            );
          })}
        </View>

        <PaperButton label="Start cooking" size="lg" onPress={onCook} />
        <View style={styles.sheetActions}>
          <PaperButton label="Swap recipe" color={paper.kraft} textColor={paper.ink} size="sm" onPress={onSwap} style={styles.flex} />
          <PaperButton label="Remove" color={paper.card} textColor={paper.redDeep} size="sm" onPress={onRemove} style={styles.flex} />
        </View>
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
        style={[styles.sheet, styles.shopSheet, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.grabber} />
        <Text style={styles.sheetTitle}>Shopping for the week</Text>
        <Text style={styles.sheetMeta}>What your planned meals need that isn't in your pantry.</Text>
        <ScrollView style={styles.shopList} contentContainerStyle={styles.shopContent}>
          {groups.length === 0 ? <Text style={styles.empty}>Nothing to buy. Your pantry covers the plan.</Text> : null}
          {groups.map((g) => (
            <View key={g.recipe.id}>
              <Text style={styles.shopFor}>
                {g.recipe.title} <Text style={styles.shopWhen}>· {g.when.join(', ')}</Text>
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
  chip: {
    alignItems: 'center',
    backgroundColor: paper.card,
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 8,
    width: 88,
  },
  chipActive: {
    backgroundColor: paper.yellow,
    transform: [{ translateY: -4 }, { rotate: '-3deg' }],
  },
  chipFaded: {
    opacity: 0.35,
  },
  chipText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    lineHeight: 14,
    textAlign: 'center',
  },
  dayCard: {
    padding: 12,
  },
  dayFull: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  dayHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dayName: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 19,
  },
  dot: {
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  dots: {
    flexDirection: 'row',
    gap: 2,
    height: 5,
  },
  empty: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    paddingVertical: 20,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  ghost: {
    height: GHOST,
    left: 0,
    position: 'absolute',
    top: 0,
    width: GHOST,
    zIndex: 30,
  },
  ghostFace: {
    alignItems: 'center',
    backgroundColor: paper.yellow,
    paddingHorizontal: 4,
    paddingVertical: 8,
    transform: [{ rotate: '-5deg' }, { scale: 1.06 }],
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: paper.kraftDeep,
    borderRadius: 3,
    height: 5,
    marginBottom: 4,
    width: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  haveBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  haveBadgeText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  haveRow: {
    alignItems: 'center',
    backgroundColor: paper.cream,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  haveText: {
    color: paper.ink,
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  header: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  kicker: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: {
    gap: 14,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  moveDay: {
    alignItems: 'center',
    backgroundColor: paper.kraft,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  moveDayOn: {
    backgroundColor: paper.ink,
  },
  moveLabel: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  moveRow: {
    flexDirection: 'row',
    gap: 5,
  },
  needBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  needText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flex: 1,
    gap: 2,
    paddingBottom: 6,
    paddingTop: 7,
  },
  pillDate: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 20,
  },
  pillShort: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    textTransform: 'uppercase',
  },
  pillTextToday: {
    color: paper.card,
  },
  pillToday: {
    backgroundColor: paper.ink,
  },
  range: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    marginTop: 2,
  },
  sheet: {
    backgroundColor: paper.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 28,
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  sheetArt: {
    alignItems: 'center',
    backgroundColor: paper.yellow,
    height: 84,
    justifyContent: 'center',
    width: 98,
  },
  sheetHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  sheetMeta: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    marginTop: 2,
  },
  sheetTitle: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 23,
    lineHeight: 27,
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
    fontSize: 16,
    marginBottom: 6,
  },
  shopItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 40,
  },
  shopList: {
    maxHeight: 380,
  },
  shopSheet: {
    maxHeight: '85%',
  },
  shopText: {
    color: paper.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  shopWhen: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  slot: {
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  slotCell: {
    width: '48.5%',
  },
  slotEmpty: {
    borderColor: paper.kraftDeep,
    borderStyle: 'dashed',
  },
  slotFilled: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  slotHint: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
  slotHover: {
    backgroundColor: paper.yellow,
    borderColor: paper.ink,
    borderStyle: 'solid',
    transform: [{ scale: 1.03 }],
  },
  slotLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  slotReady: {
    backgroundColor: paper.cream,
    borderColor: paper.orange,
    borderStyle: 'dashed',
  },
  slotTitle: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 15.5,
  },
  strip: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: paper.ink,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'absolute',
    right: 20,
    zIndex: 25,
  },
  toastText: {
    color: paper.card,
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  toastUndo: {
    color: paper.yellow,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  tray: {
    backgroundColor: paper.kraftDeep,
    borderTopColor: 'rgba(43,35,32,0.12)',
    borderTopWidth: 2,
    paddingTop: 10,
  },
  trayHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  trayHint: {
    color: paper.inkSoft,
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  trayHintActive: {
    color: paper.redDeep,
  },
  trayRow: {
    gap: 10,
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  trayTitle: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 16,
  },
});
