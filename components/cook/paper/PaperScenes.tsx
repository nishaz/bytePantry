import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { paper } from '../../../lib/theme';
import { IngredientArt } from '../../paper/IngredientArt';
import { Buzz, Drop, Hop, Pop, Spin, Steam, Toss, useLoop, Wobble } from './anim';

export type PaperSceneKind = 'board' | 'pan' | 'pot' | 'oven' | 'blender' | 'bowl';

/** The scenes are drawn on a 320×320 stage and scaled to fit the screen. */
export const STAGE = 320;

/** Live values from the player's gestures. Omit for the ambient (looping) version of a scene. */
export interface ScenePlay {
  /** Board: how many times the player has tapped to chop. */
  chops?: number;
  /** Pot: spoon angle in degrees, driven by circling a finger. */
  stirAngle?: SharedValue<number>;
  /** Blender: true while the button is held. */
  blending?: boolean;
  /** Blender: 0-1 how full the jug is. */
  fill?: SharedValue<number>;
  /** Bowl: whisk offset in stage px, driven by swiping. */
  whiskX?: SharedValue<number>;
}

interface SceneProps {
  ingredients: string[];
  play?: ScenePlay;
}

/* ---------- Chop: knife on a board, pieces hop off ---------- */
function BoardScene({ ingredients, play }: SceneProps) {
  const main = ingredients[0] ?? 'onion';
  const second = ingredients[1];
  const chop = useSharedValue(0);
  const chops = play?.chops;
  useEffect(() => {
    if (chops !== undefined) {
      if (chops > 0) {
        chop.value = withSequence(
          withTiming(1, { duration: 120, easing: Easing.in(Easing.quad) }),
          withTiming(0.9, { duration: 40 }),
          withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) }),
        );
      }
      return;
    }
    chop.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 210, easing: Easing.in(Easing.quad) }),
        withTiming(0.9, { duration: 50 }),
        withTiming(0, { duration: 290, easing: Easing.out(Easing.quad) }),
      ),
      -1,
    );
  }, [chop, chops]);
  const knife = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(chop.value, [0, 1], [-28, 2])}deg` }],
  }));
  const board = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(chop.value, [0.85, 1], [0, 3], 'clamp') }] }));

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.abs, { left: 0, top: 120 }, board]}>
        <Svg width={320} height={170} viewBox="0 0 320 170">
          <Rect x="14" y="18" width="270" height="140" rx="26" fill={paper.shadow} />
          <Rect x="6" y="8" width="270" height="140" rx="26" fill={paper.brown} />
          <Rect x="18" y="20" width="246" height="116" rx="18" fill="#D9A673" />
          <Rect x="268" y="58" width="48" height="30" rx="15" fill={paper.brown} />
          <Circle cx="298" cy="73" r="6" fill={paper.kraft} />
          <Path d="M40 48h110M40 112h70" stroke="#C99561" strokeWidth={5} strokeLinecap="round" />
        </Svg>
        <View style={[styles.abs, { left: 34, top: 36 }]}>
          <IngredientArt name={main} size={84} />
        </View>
        {second ? (
          <View style={[styles.abs, { left: 20, top: 92 }]}>
            <IngredientArt name={second} size={46} />
          </View>
        ) : null}
        {chops === undefined ? (
          <>
            <Hop x={128} y={62} dx={-70} delay={0}>
              <IngredientArt name={main} size={24} shadow={false} />
            </Hop>
            <Hop x={140} y={66} dx={60} delay={550}>
              <IngredientArt name={second ?? main} size={20} shadow={false} />
            </Hop>
            <Hop x={136} y={70} dx={-30} height={36} delay={275} duration={900}>
              <IngredientArt name={main} size={16} shadow={false} />
            </Hop>
          </>
        ) : (
          Array.from({ length: Math.min(chops * 2, 16) }, (_, i) => (
            <Toss key={i} x={132} y={64} dx={(i % 2 ? 1 : -1) * (24 + ((i * 23) % 70))} dy={-20 + ((i * 17) % 50)}>
              <IngredientArt name={i % 3 === 2 && second ? second : main} size={18 + (i % 3) * 3} shadow={false} />
            </Toss>
          ))
        )}
      </Animated.View>
      <Animated.View style={[styles.abs, { left: 120, top: 10, width: 200, height: 180, transformOrigin: '92% 88%' }, knife]}>
        <Svg width={200} height={180} viewBox="0 0 200 180">
          <Path d="M20 160L130 50l14 14L62 172c-14 6-42 5-42-12z" fill="#E7EBEE" stroke={paper.ink} strokeWidth={2.5} />
          <Path d="M34 154l92-92" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" />
          <Rect x="128" y="14" width="28" height="72" rx="12" fill={paper.red} transform="rotate(45 142 50)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

/* ---------- Fry: pan shakes, ingredients drop and sizzle ---------- */
function PanScene({ ingredients }: SceneProps) {
  const items = ingredients.slice(0, 3);
  return (
    <View style={styles.stage}>
      <Wobble style={[styles.abs, { left: 0, top: 10, width: 320, height: 300 }]} deg={2}>
        <Svg width={320} height={300} viewBox="0 0 320 300">
          <Rect x="236" y="134" width="84" height="28" rx="14" fill={paper.ink} transform="rotate(12 240 148)" />
          <Circle cx="150" cy="156" r="128" fill={paper.shadow} />
          <Circle cx="142" cy="148" r="128" fill={paper.ink} />
          <Circle cx="142" cy="148" r="108" fill={paper.panIn} />
        </Svg>
        <Spin duration={6000} style={[styles.abs, { left: 34, top: 40, width: 216, height: 216 }]}>
          <Svg width={216} height={216} viewBox="0 0 216 216">
            <Path d="M40 108c0-36 36-62 72-54s54 46 36 72-54 26-62 4 10-36 28-30" fill="none" stroke={paper.yellow} strokeWidth={9} strokeLinecap="round" opacity={0.5} />
          </Svg>
        </Spin>
        <Buzz amount={1.2} duration={220} style={[styles.abs, { left: 0, top: 0, width: 320, height: 300 }]}>
          {items.map((name, i) => (
            <Drop key={`${name}-${i}`} x={[86, 150, 110][i]} y={[102, 128, 168][i]} delay={i * 520}>
              <IngredientArt name={name} size={52} />
            </Drop>
          ))}
        </Buzz>
        <Pop x={70} y={150} color={paper.yellow} size={13} />
        <Pop x={196} y={110} color={paper.red} size={11} delay={330} />
        <Pop x={168} y={196} color={paper.card} size={10} delay={660} />
        <Pop x={120} y={90} color={paper.yellow} size={9} delay={500} />
      </Wobble>
      <Steam x={100} y={-10} />
      <Steam x={160} y={0} delay={1100} />
    </View>
  );
}

/* ---------- Stir / simmer: spoon circles a bubbling pot ---------- */
function PotScene({ ingredients, play }: SceneProps) {
  const items = ingredients.slice(0, 3);
  const bubble = useLoop(1200, 0, true, Easing.inOut(Easing.sin));
  const bubbleStyle = (offset: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      const t = (bubble.value + offset) % 1;
      return { opacity: interpolate(t, [0, 0.5, 1], [0, 1, 0]), transform: [{ scale: interpolate(t, [0, 1], [0.3, 1.1]) }] };
    });
  const b1 = bubbleStyle(0);
  const b2 = bubbleStyle(0.35);
  const b3 = bubbleStyle(0.7);

  return (
    <View style={styles.stage}>
      <Svg style={[styles.abs, { left: 0, top: 20 }]} width={320} height={300} viewBox="0 0 320 300">
        <Rect x="4" y="134" width="40" height="22" rx="11" fill={paper.ink} />
        <Rect x="276" y="134" width="40" height="22" rx="11" fill={paper.ink} />
        <Circle cx="166" cy="152" r="126" fill={paper.shadow} />
        <Circle cx="160" cy="146" r="126" fill="#9AA3A8" />
        <Circle cx="160" cy="146" r="108" fill={paper.red} />
      </Svg>
      <Spin duration={5000} angle={play?.stirAngle} factor={0.6} style={[styles.abs, { left: 52, top: 58, width: 216, height: 216 }]}>
        <Svg width={216} height={216} viewBox="0 0 216 216">
          <Path d="M28 108a80 80 0 0 1 80-80M188 108a80 80 0 0 1-80 80M63 108a45 45 0 0 1 45-45M153 108a45 45 0 0 1-45 45" fill="none" stroke="#F2885F" strokeWidth={10} strokeLinecap="round" />
        </Svg>
        {items.map((name, i) => (
          <View key={`${name}-${i}`} style={[styles.abs, { left: [40, 120, 80][i], top: [60, 90, 140][i] }]}>
            <IngredientArt name={name} size={40} />
          </View>
        ))}
      </Spin>
      <Animated.View style={[styles.bubble, { left: 108, top: 120 }, b1]} />
      <Animated.View style={[styles.bubble, { left: 196, top: 186, width: 16, height: 16 }, b2]} />
      <Animated.View style={[styles.bubble, { left: 178, top: 104, width: 14, height: 14 }, b3]} />
      <Spin duration={3000} angle={play?.stirAngle} style={[styles.abs, { left: 40, top: 46, width: 240, height: 240 }]}>
        <Svg style={[styles.abs, { left: 116, top: 12 }]} width={130} height={40} viewBox="0 0 130 40">
          <Rect x="10" y="14" width="118" height="12" rx="6" fill={paper.brown} />
          <Ellipse cx="18" cy="20" rx="16" ry="12" fill="#D9A673" />
        </Svg>
      </Spin>
      <Steam x={110} y={-20} />
      <Steam x={180} y={-10} delay={1100} />
    </View>
  );
}

/* ---------- Bake: oven glows, dish puffs up, heat waves ---------- */
function OvenScene({ ingredients }: SceneProps) {
  const glow = useLoop(1400, 0, true, Easing.inOut(Easing.sin));
  const rise = useLoop(3000, 0, true, Easing.inOut(Easing.sin));
  const flick = useLoop(380, 0, true);
  const dial = useLoop(4000);
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.75 + glow.value * 0.25 }));
  const riseStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.75 + rise.value * 0.3 }] }));
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + flick.value * 0.35 }] }));
  const dialStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${Math.floor(dial.value * 12) * 30}deg` }] }));
  const topping = ingredients[0];

  return (
    <View style={styles.stage}>
      {[0, 1, 2].map((i) => (
        <HeatWave key={i} x={92 + i * 52} delay={i * 600} />
      ))}
      <View style={[styles.abs, { left: 14, top: 44, width: 292, height: 272 }]}>
        <Svg style={StyleSheet.absoluteFill} width={292} height={272} viewBox="0 0 292 272">
          <Rect x="10" y="10" width="280" height="260" rx="26" fill={paper.shadow} />
          <Rect x="2" y="2" width="280" height="260" rx="26" fill={paper.card} />
          <Rect x="2" y="2" width="280" height="54" rx="26" fill={paper.ink} />
          <Rect x="2" y="36" width="280" height="20" fill={paper.ink} />
          <Circle cx="80" cy="29" r="13" fill={paper.yellow} />
          <Rect x="140" y="20" width="110" height="16" rx="8" fill={paper.panIn} />
          <Rect x="146" y="24" width="50" height="8" rx="4" fill={paper.red} />
          <Rect x="24" y="72" width="236" height="164" rx="18" fill={paper.ink} />
          <Rect x="24" y="244" width="236" height="10" rx="5" fill={paper.steel} />
        </Svg>
        <Animated.View style={[styles.abs, { left: 28, top: 16, width: 26, height: 26, alignItems: 'center' }, dialStyle]}>
          <View style={{ width: 4, height: 11, borderRadius: 2, backgroundColor: paper.ink }} />
        </Animated.View>
        <Animated.View style={[styles.window, glowStyle]} />
        <View style={[styles.abs, { left: 52, top: 182, width: 180, height: 8, borderRadius: 4, backgroundColor: paper.panIn }]} />
        <Animated.View style={[styles.abs, { left: 70, top: 108, width: 144, height: 76, transformOrigin: '50% 100%' }, riseStyle]}>
          <Svg width={144} height={76} viewBox="0 0 144 76">
            <Path d="M6 76c0-44 30-70 66-70s66 26 66 70z" fill={paper.yellow} />
            <Path d="M24 50l20-14M58 46l20-16M92 50l20-14" stroke={paper.cream} strokeWidth={6} strokeLinecap="round" />
          </Svg>
        </Animated.View>
        {topping ? (
          <View style={[styles.abs, { left: 120, top: 100 }]}>
            <IngredientArt name={topping} size={44} />
          </View>
        ) : null}
        <Svg style={[styles.abs, { left: 64, top: 182 }]} width={156} height={22} viewBox="0 0 156 22">
          <Path d="M0 0h156l-8 20H8z" fill={paper.brown} />
        </Svg>
        {[90, 140, 190].map((x, i) => (
          <Animated.View key={x} style={[styles.abs, { left: x, top: 210, width: 10, height: 18, transformOrigin: '50% 100%' }, flameStyle]}>
            <Svg width={10} height={18} viewBox="0 0 10 18">
              <Path d={i === 1 ? 'M5 18c-5-6 0-10 0-16 5 6 6 10 0 16z' : 'M5 18c-5-6 1-9 1-15 4 6 5 9-1 15z'} fill={paper.red} />
            </Svg>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

function HeatWave({ x, delay }: { x: number; delay: number }) {
  const p = useLoop(1800, delay, false, Easing.out(Easing.quad));
  const s = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.3, 1], [0, 0.85, 0]),
    transform: [{ translateY: 40 - 60 * p.value }, { scaleX: 1 + 0.3 * p.value }],
  }));
  return (
    <Animated.View style={[styles.abs, { left: x, top: 0 }, s]}>
      <Svg width={40} height={30} viewBox="0 0 40 30">
        <Path d="M4 20c6-10 10 10 16 0s10 10 16 0" fill="none" stroke={paper.orange} strokeWidth={4} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

/* ---------- Blend: blender buzzes, contents swirl and fill ---------- */
function BlenderScene({ ingredients, play }: SceneProps) {
  const loopFill = useLoop(4000, 0, true, Easing.inOut(Easing.quad));
  const lid = useLoop(240, 0, true);
  const interactive = play?.blending !== undefined;
  const running = interactive ? !!play?.blending : true;
  const fillValue = play?.fill;
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.12 + (fillValue ? fillValue.value : loopFill.value) * 0.88 }],
  }));
  const lidStyle = useAnimatedStyle(() => ({ transform: [{ translateY: running ? -4 * lid.value : 0 }] }));
  const items = ingredients.slice(0, 4);
  const liquid = items.some((i) => /berr|straw|beet/.test(i.toLowerCase())) ? '#E86A8A' : paper.green;

  return (
    <View style={styles.stage}>
      <Buzz amount={2} duration={120} paused={!running} style={[styles.abs, { left: 70, top: 0, width: 180, height: 320 }]}>
        <Svg style={StyleSheet.absoluteFill} width={180} height={320} viewBox="0 0 180 320">
          <Rect x="30" y="244" width="124" height="72" rx="16" fill={paper.shadow} />
          <Rect x="24" y="238" width="124" height="72" rx="16" fill={paper.red} />
          <Circle cx="86" cy="274" r="15" fill={paper.card} />
          <Rect x="83" y="262" width="6" height="12" rx="3" fill={paper.ink} />
          <Path d="M26 44h120l-14 194H40z" fill={paper.card} opacity={0.8} />
          <Path d="M146 82h16a10 10 0 0 1 10 10v74a10 10 0 0 1-10 10h-22" fill="none" stroke={paper.ink} strokeWidth={8} />
        </Svg>
        <Animated.View style={[styles.liquid, { backgroundColor: liquid, transformOrigin: '50% 100%' }, fillStyle]} />
        <Spin duration={500} paused={!running} style={[styles.abs, { left: 40, top: 120, width: 92, height: 92 }]}>
          {items.map((name, i) => (
            <View key={`${name}-${i}`} style={[styles.abs, { left: [0, 52, 26, 50][i], top: [30, 6, 56, 50][i] }]}>
              <IngredientArt name={name} size={36} shadow={false} />
            </View>
          ))}
        </Spin>
        <Svg style={StyleSheet.absoluteFill} width={180} height={320} viewBox="0 0 180 320" pointerEvents="none">
          <Path d="M26 44h120l-14 194H40z" fill="none" stroke={paper.ink} strokeWidth={4} />
        </Svg>
        <Animated.View style={[styles.abs, { left: 18, top: 18 }, lidStyle]}>
          <Svg width={136} height={32} viewBox="0 0 136 32">
            <Rect x="2" y="12" width="132" height="18" rx="8" fill={paper.ink} />
            <Rect x="51" y="0" width="34" height="16" rx="6" fill={paper.ink} />
          </Svg>
        </Animated.View>
      </Buzz>
      {running ? (
        <>
          <Pop x={60} y={80} color={liquid} size={12} />
          <Pop x={262} y={110} color={liquid} size={10} delay={500} />
        </>
      ) : null}
    </View>
  );
}

/* ---------- Mix / whisk / pour: whisk swishes through batter ---------- */
function BowlScene({ ingredients, play }: SceneProps) {
  const t = useLoop(1000);
  const whiskX = play?.whiskX;
  const whisk = useAnimatedStyle(() => {
    if (whiskX) {
      return { transform: [{ translateX: whiskX.value }, { rotate: `${(whiskX.value / 60) * 16}deg` }] };
    }
    const a = t.value * Math.PI * 2;
    return { transform: [{ translateX: Math.cos(a) * 34 }, { translateY: Math.sin(a) * 8 }, { rotate: `${Math.cos(a) * 14}deg` }] };
  });
  const ripple = useAnimatedStyle(() => ({
    transform: [
      { scaleX: whiskX ? 1 - (Math.abs(whiskX.value) / 60) * 0.06 : 1 - Math.abs(Math.sin(t.value * Math.PI * 2)) * 0.06 },
    ],
  }));
  const items = ingredients.slice(0, 2);

  return (
    <View style={styles.stage}>
      {items.map((name, i) => (
        <Drop key={`${name}-${i}`} x={[96, 176][i]} y={150} delay={i * 700}>
          <IngredientArt name={name} size={44} />
        </Drop>
      ))}
      <Svg style={[styles.abs, { left: 0, top: 150 }]} width={320} height={170} viewBox="0 0 320 170">
        <Ellipse cx="166" cy="160" rx="146" ry="10" fill={paper.shadow} />
        <Path d="M12 30h296c0 76-60 128-148 128S12 106 12 30z" fill={paper.blue} />
        <Path d="M36 98c34 18 214 18 248 0" stroke={paper.card} strokeWidth={6} fill="none" opacity={0.6} />
        <Ellipse cx="160" cy="30" rx="148" ry="22" fill="#5E8FB8" />
      </Svg>
      <Animated.View style={[styles.abs, { left: 26, top: 164, width: 268, height: 36 }, ripple]}>
        <Svg width={268} height={36} viewBox="0 0 268 36">
          <Ellipse cx="134" cy="18" rx="132" ry="16" fill="#F2DDA0" />
          <Path d="M74 18c18-9 36 9 54 0s36 9 54 0" stroke={paper.yellow} strokeWidth={5} fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.abs, { left: 122, top: 10, transformOrigin: '50% 0%' }, whisk]}>
        <Svg width={76} height={190} viewBox="0 0 80 200">
          <Rect x="32" y="0" width="16" height="80" rx="8" fill={paper.red} />
          <Path d="M40 80c-30 30-30 100 0 110 30-10 30-80 0-110zM40 80c-14 30-14 100 0 110 14-10 14-80 0-110z" fill="none" stroke="#9AA3A8" strokeWidth={5} />
        </Svg>
      </Animated.View>
      <Pop x={70} y={170} color="#F2DDA0" size={11} />
      <Pop x={240} y={172} color="#F2DDA0" size={9} delay={500} />
    </View>
  );
}

const SCENES: Record<PaperSceneKind, (props: SceneProps) => React.JSX.Element> = {
  board: BoardScene,
  pan: PanScene,
  pot: PotScene,
  oven: OvenScene,
  blender: BlenderScene,
  bowl: BowlScene,
};

/** Draws the animated scene for a step at whatever size the screen gives it. */
export function PaperScene({
  kind,
  ingredients,
  size,
  play,
}: {
  kind: PaperSceneKind;
  ingredients: string[];
  size: number;
  play?: ScenePlay;
}) {
  const Scene = SCENES[kind];
  const scale = size / STAGE;
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.scaler, { transform: [{ scale }] }]}>
        <Scene ingredients={ingredients} play={play} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: {
    position: 'absolute',
  },
  bubble: {
    borderColor: paper.card,
    borderRadius: 12,
    borderWidth: 3,
    height: 22,
    position: 'absolute',
    width: 22,
  },
  liquid: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    height: 120,
    left: 42,
    opacity: 0.85,
    position: 'absolute',
    top: 116,
    width: 92,
  },
  scaler: {
    height: STAGE,
    left: '50%',
    marginLeft: -STAGE / 2,
    marginTop: -STAGE / 2,
    position: 'absolute',
    top: '50%',
    width: STAGE,
  },
  stage: {
    height: STAGE,
    position: 'relative',
    width: STAGE,
  },
  window: {
    backgroundColor: paper.orange,
    borderRadius: 12,
    height: 148,
    left: 34,
    position: 'absolute',
    top: 80,
    width: 216,
  },
});
