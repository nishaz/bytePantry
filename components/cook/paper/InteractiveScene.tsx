import { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';

import { fonts, paper } from '../../../lib/theme';
import { PaperCard } from '../../paper/PaperCard';
import { PaperScene, STAGE, type PaperSceneKind } from './PaperScenes';

export const GAME_BONUS_XP = 5;

const GAMES: Partial<Record<PaperSceneKind, { prompt: string; done: string }>> = {
  board: { prompt: 'Tap the board to chop!', done: 'Perfectly chopped!' },
  pot: { prompt: 'Circle your finger to stir!', done: 'Silky smooth!' },
  blender: { prompt: 'Press and hold to blend!', done: 'Blended to perfection!' },
  bowl: { prompt: 'Swipe side to side to whisk!', done: 'Nice and fluffy!' },
};

const CHOP_TARGET = 6;
const STIR_TARGET_DEG = 1080;
const BLEND_TARGET_MS = 2500;
const WHISK_TARGET = 900;

export function hasMiniGame(kind: PaperSceneKind): boolean {
  return kind in GAMES;
}

interface InteractiveSceneProps {
  kind: PaperSceneKind;
  ingredients: string[];
  size: number;
  /** Called once when the mini-game is finished. */
  onComplete: () => void;
}

/** Cook scene the player drives: tap to chop, circle to stir, hold to blend, swipe to whisk. */
export function InteractiveScene({ kind, ingredients, size, onComplete }: InteractiveSceneProps) {
  const game = GAMES[kind];
  const scale = size / STAGE;
  const [progress, setProgress] = useState(0);
  const [chops, setChops] = useState(0);
  const [blending, setBlending] = useState(false);
  const stirAngle = useSharedValue(0);
  const fill = useSharedValue(0);
  const whiskX = useSharedValue(0);
  const done = progress >= 1;
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  function report(next: number) {
    const clamped = Math.min(1, next);
    setProgress((prev) => (Math.abs(clamped - prev) >= 0.02 || clamped === 1 ? clamped : prev));
    if (clamped >= 1 && !doneRef.current) {
      doneRef.current = true;
      onCompleteRef.current();
    }
  }

  // Stir: track the finger's angle around the pot's centre.
  const stir = useRef({ last: 0, total: 0 });
  const stirResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        stir.current.last = Math.atan2(locationY - size / 2, locationX - size / 2);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const a = Math.atan2(locationY - size / 2, locationX - size / 2);
        let delta = ((a - stir.current.last) * 180) / Math.PI;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        stir.current.last = a;
        stirAngle.value += delta;
        stir.current.total += Math.abs(delta);
        report(stir.current.total / STIR_TARGET_DEG);
      },
    }),
  ).current;

  // Whisk: the whisk follows horizontal swipes.
  const whisk = useRef({ start: 0, lastX: 0, total: 0 });
  const whiskResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        whisk.current.start = whiskX.value;
        whisk.current.lastX = whiskX.value;
      },
      onPanResponderMove: (_, g) => {
        const x = Math.max(-60, Math.min(60, whisk.current.start + g.dx / scale));
        whisk.current.total += Math.abs(x - whisk.current.lastX);
        whisk.current.lastX = x;
        whiskX.value = x;
        report(whisk.current.total / WHISK_TARGET);
      },
      onPanResponderRelease: () => {
        whiskX.value = withSpring(0, { damping: 8 });
      },
    }),
  ).current;

  // Blend: fill the jug while the button is held.
  useEffect(() => {
    if (!blending) return undefined;
    const id = setInterval(() => {
      fill.value = Math.min(1, fill.value + 50 / BLEND_TARGET_MS);
      report(fill.value);
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blending]);

  const scene = (
    <PaperScene
      kind={kind}
      ingredients={ingredients}
      size={size}
      play={
        kind === 'board'
          ? { chops }
          : kind === 'pot'
            ? { stirAngle }
            : kind === 'blender'
              ? { blending, fill }
              : kind === 'bowl'
                ? { whiskX }
                : undefined
      }
    />
  );

  let surface = scene;
  if (kind === 'board') {
    surface = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chop"
        onPress={() => {
          setChops((c) => c + 1);
          report((chops + 1) / CHOP_TARGET);
        }}
      >
        {scene}
      </Pressable>
    );
  } else if (kind === 'pot') {
    surface = (
      <View accessibilityLabel="Stir the pot by circling your finger" {...stirResponder.panHandlers}>
        {scene}
      </View>
    );
  } else if (kind === 'bowl') {
    surface = (
      <View accessibilityLabel="Whisk by swiping side to side" {...whiskResponder.panHandlers}>
        {scene}
      </View>
    );
  } else if (kind === 'blender') {
    surface = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hold to blend"
        onPressIn={() => setBlending(true)}
        onPressOut={() => setBlending(false)}
      >
        {scene}
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      {surface}
      {game ? (
        <Animated.View entering={FadeIn.delay(300)} style={styles.meterWrap}>
          <PaperCard shape="c" tilt={-1} lift={3} color={done ? paper.green : paper.card} contentStyle={styles.meter}>
            {done ? (
              <Animated.Text entering={ZoomIn.springify().damping(10)} style={[styles.prompt, styles.donePrompt]}>
                {game.done} +{GAME_BONUS_XP} bonus XP
              </Animated.Text>
            ) : (
              <>
                <Text style={styles.prompt}>{game.prompt}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.max(4, progress * 100)}%` }]} />
                </View>
              </>
            )}
          </PaperCard>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  donePrompt: {
    color: paper.card,
    textAlign: 'center',
  },
  fill: {
    backgroundColor: paper.yellow,
    borderRadius: 5,
    height: '100%',
  },
  meter: {
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  meterWrap: {
    alignSelf: 'center',
    marginTop: 4,
    minWidth: 240,
  },
  prompt: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  track: {
    backgroundColor: paper.kraft,
    borderRadius: 5,
    height: 9,
    overflow: 'hidden',
  },
  wrap: {
    alignItems: 'center',
  },
});
