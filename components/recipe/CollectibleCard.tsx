import { forwardRef, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { CARD_UNLOCK_COOKS } from '../../lib/db';
import type { Nutrition } from '../../lib/nutrition';
import { cutCorners, fonts, paper } from '../../lib/theme';
import { DishArt, dishColor, dishKindFor, type DishKind } from '../paper/DishArt';

/** Rarity climbs the more often you cook the dish. */
export type Rarity = 'bronze' | 'silver' | 'gold' | 'holo';

export function rarityFor(cooks: number): Rarity {
  if (cooks >= 25) return 'holo';
  if (cooks >= 10) return 'gold';
  if (cooks >= 5) return 'silver';
  return 'bronze';
}

const RARITY: Record<Rarity, { label: string; stars: number; stops: string[]; next: number | null }> = {
  bronze: { label: 'Bronze', stars: 1, stops: ['#C98A52', '#E9B98A', '#A86A36'], next: 5 },
  silver: { label: 'Silver', stars: 2, stops: ['#B9B6B0', '#F2F0EC', '#9A968F'], next: 10 },
  gold: { label: 'Gold', stars: 3, stops: ['#D99A1E', '#FFE08A', '#B87A0E'], next: 25 },
  holo: { label: 'Holo', stars: 4, stops: ['#E2553B', '#F2B33D', '#5E9C58', '#7FB1D8', '#9B6FB0'], next: null },
};

const TYPE_LABEL: Record<DishKind, string> = {
  omelette: 'Breakfast', pancakes: 'Breakfast', oats: 'Breakfast', pasta: 'Pasta', ramen: 'Noodle', stirfry: 'Wok',
  sushi: 'Sushi', dumplings: 'Dumpling', curry: 'Curry', soup: 'Soup', salad: 'Fresh', rice: 'Rice', steak: 'Grill',
  roast: 'Roast', pizza: 'Pizza', sandwich: 'Handheld', burger: 'Handheld', taco: 'Handheld', pie: 'Bake', cake: 'Bake',
  cookies: 'Bake', loaf: 'Bake', smoothie: 'Drink', bowl: 'Bowl',
};

/** Macro "moves": playful names, but the numbers are the real per-serving estimate. */
const MOVES = [
  { key: 'protein', name: 'Muscle Up', what: 'Protein', color: paper.red, full: 40 },
  { key: 'carbs', name: 'Energy Burst', what: 'Carbs', color: paper.yellow, full: 90 },
  { key: 'fat', name: 'Slow Burn', what: 'Fat', color: paper.orange, full: 40 },
  { key: 'fiber', name: 'Gut Guard', what: 'Fibre', color: paper.green, full: 12 },
] as const;

export interface CollectibleCardProps {
  title: string;
  nutrition: Nutrition;
  cooks: number;
  servings: number;
  minutes: number;
  steps: number;
  number: number;
  width?: number;
}

/** The unlocked trading card. Draws at 300×420 and scales to `width`. */
export const CollectibleCard = forwardRef<View, CollectibleCardProps>(function CollectibleCard(
  { title, nutrition, cooks, servings, minutes, steps, number, width = 300 },
  ref,
) {
  const s = width / 300;
  const kind = dishKindFor(title);
  const color = dishColor(kind);
  const rarity = rarityFor(cooks);
  const r = RARITY[rarity];
  const shiny = rarity === 'gold' || rarity === 'holo';

  const sheen = useSharedValue(-1);
  useEffect(() => {
    if (!shiny) return;
    sheen.value = withRepeat(withDelay(1400, withTiming(1.6, { duration: 1600, easing: Easing.inOut(Easing.quad) })), -1, false);
  }, [sheen, shiny]);
  const sheenStyle = useAnimatedStyle(() => ({ transform: [{ translateX: sheen.value * 300 * s }, { rotate: '20deg' }] }));

  return (
    <View ref={ref} collapsable={false} style={{ width, height: 420 * s }}>
      <View style={[styles.shadow, { borderRadius: 18 * s, left: 5 * s, top: 6 * s }]} />
      {/* Rarity frame */}
      <Svg width={width} height={420 * s} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
            {r.stops.map((c, i) => (
              <Stop key={c} offset={i / (r.stops.length - 1)} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={420 * s} rx={18 * s} fill="url(#frame)" />
      </Svg>

      <View style={[styles.face, { margin: 9 * s, borderRadius: 12 * s, padding: 10 * s }]}>
        {/* Header: name + calories as the "HP" */}
        <View style={styles.head}>
          <View style={styles.flex}>
            <Text style={[styles.kicker, { fontSize: 9.5 * s }]}>
              {TYPE_LABEL[kind]} type · cooked ×{cooks}
            </Text>
            <Text style={[styles.name, { fontSize: 20 * s, lineHeight: 23 * s }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
              {title}
            </Text>
          </View>
          <View style={styles.hp}>
            <Text style={[styles.hpNum, { fontSize: 26 * s, lineHeight: 28 * s }]}>{nutrition.calories}</Text>
            <Text style={[styles.hpUnit, { fontSize: 10 * s }]}>kcal</Text>
          </View>
        </View>

        {/* Art window */}
        <View style={[styles.art, cutCorners.c, { backgroundColor: color, height: 150 * s, marginTop: 6 * s }]}>
          <View style={[styles.artDots, { pointerEvents: 'none' }]} />
          <DishArt title={title} size={170 * s} />
          <View style={[styles.artTag, { bottom: 6 * s, left: 6 * s, paddingHorizontal: 7 * s, paddingVertical: 2 * s }]}>
            <Text style={[styles.artTagText, { fontSize: 9.5 * s }]}>
              Serves {servings} · {minutes} min · {steps} steps
            </Text>
          </View>
        </View>

        {/* Moves */}
        <View style={{ gap: 5 * s, marginTop: 9 * s }}>
          {MOVES.map((m) => {
            const value = nutrition[m.key];
            const pips = value >= m.full * 0.66 ? 3 : value >= m.full * 0.33 ? 2 : 1;
            return (
              <View key={m.key} style={[styles.move, { gap: 7 * s, paddingBottom: 4 * s }]}>
                <View style={[styles.pips, { gap: 2 * s, width: 30 * s }]}>
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: 8 * s,
                        height: 8 * s,
                        borderRadius: 4 * s,
                        backgroundColor: i < pips ? m.color : paper.kraftDeep,
                        borderWidth: 1,
                        borderColor: i < pips ? paper.ink : 'transparent',
                      }}
                    />
                  ))}
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.moveName, { fontSize: 13.5 * s }]}>{m.name}</Text>
                  <Text style={[styles.moveWhat, { fontSize: 9.5 * s }]}>{m.what}</Text>
                </View>
                <Text style={[styles.moveValue, { fontSize: 18 * s }]}>
                  {value}
                  <Text style={{ fontSize: 11 * s }}>g</Text>
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={[styles.foot, { marginTop: 'auto' }]}>
          <Text style={[styles.footText, { fontSize: 9 * s }]}>
            {nutrition.estimated ? '≈ per serving, estimated' : 'per serving'}
          </Text>
          <Text style={[styles.footText, { fontSize: 9 * s }]}>
            {'★'.repeat(r.stars)} {r.label} · #{String(number).padStart(3, '0')} · Pixel Pantry
          </Text>
        </View>
      </View>

      {shiny ? (
        <View style={[StyleSheet.absoluteFill, { borderRadius: 18 * s, overflow: 'hidden', pointerEvents: 'none' }]}>
          <Animated.View style={[styles.sheen, { width: 70 * s, left: -120 * s }, sheenStyle]} />
        </View>
      ) : null}
    </View>
  );
});

/** What you see before the dish has been cooked enough times: the card's back with progress. */
export function LockedCard({ title, cooks, width = 300 }: { title: string; cooks: number; width?: number }) {
  const s = width / 300;
  const left = Math.max(0, CARD_UNLOCK_COOKS - cooks);
  return (
    <View style={{ width, height: 420 * s }}>
      <View style={[styles.shadow, { borderRadius: 18 * s, left: 5 * s, top: 6 * s }]} />
      <View style={[styles.back, { borderRadius: 18 * s, padding: 18 * s }]}>
        <View style={[styles.backInner, { borderRadius: 12 * s }]}>
          <View style={styles.ghostWrap}>
            <View style={{ opacity: 0.18 }}>
              <DishArt title={title} size={180 * s} />
            </View>
            <Text style={[styles.backQ, { fontSize: 72 * s, lineHeight: 80 * s }]}>?</Text>
          </View>
          <Text style={[styles.backTitle, { fontSize: 20 * s }]}>Locked card</Text>
          <Text style={[styles.backText, { fontSize: 13 * s, marginTop: 4 * s }]}>
            Cook this dish {CARD_UNLOCK_COOKS} times to unlock its card.{'\n'}
            {left === 1 ? 'Just 1 more to go!' : `${left} more to go.`}
          </Text>
          <View style={[styles.progress, { gap: 8 * s, marginTop: 14 * s }]}>
            {Array.from({ length: CARD_UNLOCK_COOKS }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  cutCorners.b,
                  { width: 34 * s, height: 34 * s },
                  i < cooks ? styles.progressOn : null,
                ]}
              >
                <Text style={[styles.progressText, { fontSize: 15 * s }, i < cooks ? styles.progressTextOn : null]}>
                  {i < cooks ? '✓' : i + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    alignItems: 'center',
    borderColor: paper.ink,
    borderWidth: 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artDots: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  artTag: {
    backgroundColor: 'rgba(255,248,236,0.92)',
    borderRadius: 6,
    position: 'absolute',
  },
  artTagText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
  },
  back: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: paper.ink,
  },
  backInner: {
    alignItems: 'center',
    backgroundColor: paper.kraftDeep,
    borderColor: paper.brown,
    borderStyle: 'dashed',
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    padding: 14,
  },
  backQ: {
    color: paper.ink,
    fontFamily: fonts.display,
    position: 'absolute',
  },
  ghostWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
  },
  backTitle: {
    color: paper.ink,
    fontFamily: fonts.display,
    marginTop: 6,
  },
  face: {
    backgroundColor: paper.card,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  foot: {
    alignItems: 'center',
    borderTopColor: paper.kraftDeep,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
  },
  footText: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
  },
  head: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  hp: {
    alignItems: 'flex-end',
  },
  hpNum: {
    color: paper.redDeep,
    fontFamily: fonts.display,
  },
  hpUnit: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    marginTop: -2,
    textTransform: 'uppercase',
  },
  kicker: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  move: {
    alignItems: 'center',
    borderBottomColor: paper.kraft,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  moveName: {
    color: paper.ink,
    fontFamily: fonts.display,
  },
  moveValue: {
    color: paper.ink,
    fontFamily: fonts.display,
  },
  moveWhat: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    marginTop: -1,
    textTransform: 'uppercase',
  },
  name: {
    color: paper.ink,
    fontFamily: fonts.display,
  },
  pips: {
    flexDirection: 'row',
  },
  progress: {
    flexDirection: 'row',
  },
  progressDot: {
    alignItems: 'center',
    backgroundColor: paper.card,
    justifyContent: 'center',
  },
  progressOn: {
    backgroundColor: paper.green,
  },
  progressText: {
    color: paper.inkSoft,
    fontFamily: fonts.display,
  },
  progressTextOn: {
    color: paper.card,
  },
  shadow: {
    backgroundColor: paper.shadowStrong,
    bottom: -6,
    position: 'absolute',
    right: -5,
  },
  sheen: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    bottom: -60,
    position: 'absolute',
    top: -60,
  },
});
