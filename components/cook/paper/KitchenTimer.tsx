import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { cutCorners, fonts, paper } from '../../../lib/theme';
import { PaperButton } from '../../paper/PaperButton';
import { PaperCard } from '../../paper/PaperCard';

export interface TimerState {
  /** Step the timer belongs to. */
  step: number;
  total: number;
  left: number;
  running: boolean;
  ringing: boolean;
  /** Seconds-since-epoch target while running. */
  endAt: number | null;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Tomato kitchen timer: the dial empties as time runs out. */
function Dial({ ratio, size }: { ratio: number; size: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx="42" cy="44" r="34" fill={paper.shadow} />
      <Circle cx="40" cy="42" r="34" fill={paper.red} />
      <Path d="M40 8l4 6 7-2-4 6 7 3-8 1-6 4-6-4-8-1 7-3-4-6 7 2z" fill={paper.green} />
      <Circle cx="40" cy="42" r={r} fill="none" stroke={paper.card} strokeWidth={7} opacity={0.35} />
      <Circle
        cx="40"
        cy="42"
        r={r}
        fill="none"
        stroke={paper.card}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={`${c}`}
        strokeDashoffset={`${c * (1 - ratio)}`}
        transform="rotate(-90 40 42)"
      />
      <Rect x="38" y="16" width="4" height="10" rx="2" fill={paper.ink} transform={`rotate(${ratio * 360} 40 42)`} />
    </Svg>
  );
}

interface KitchenTimerProps {
  timer: TimerState;
  suggested: boolean;
  onToggle: () => void;
  onAdjust: (deltaSeconds: number) => void;
  onReset: () => void;
  onStopRing: () => void;
}

export function KitchenTimer({ timer, suggested, onToggle, onAdjust, onReset, onStopRing }: KitchenTimerProps) {
  const shake = useSharedValue(0);
  useEffect(() => {
    if (timer.ringing) {
      shake.value = withRepeat(
        withSequence(withTiming(-8, { duration: 60 }), withTiming(8, { duration: 120 }), withTiming(0, { duration: 60 })),
        -1,
      );
    } else {
      shake.value = withTiming(0, { duration: 100 });
    }
  }, [shake, timer.ringing]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value}deg` }] }));

  const ratio = timer.total > 0 ? timer.left / timer.total : 0;
  const idle = !timer.running && timer.left === timer.total;

  if (timer.ringing) {
    return (
      <PaperCard color={paper.green} shape="c" tilt={-1} lift={4} contentStyle={styles.card}>
        <Animated.View style={shakeStyle}>
          <Dial ratio={0} size={58} />
        </Animated.View>
        <View style={styles.flex}>
          <Text style={[styles.clock, { color: paper.card }]}>Time's up!</Text>
          <Text style={[styles.sub, { color: paper.card }]}>Check your food</Text>
        </View>
        <PaperButton label="Stop" color={paper.card} textColor={paper.ink} size="sm" onPress={onStopRing} />
      </PaperCard>
    );
  }

  return (
    <PaperCard shape="c" tilt={-1} lift={4} contentStyle={styles.card}>
      <Animated.View style={shakeStyle}>
        <Dial ratio={ratio} size={58} />
      </Animated.View>
      <View style={styles.flex}>
        <Text style={styles.clock}>{formatClock(timer.left)}</Text>
        <Text style={styles.sub}>
          {timer.running ? 'Cooking…' : idle ? (suggested ? 'Suggested time' : 'Timer ready') : 'Paused'}
        </Text>
      </View>
      <View style={styles.controls}>
        {!timer.running ? (
          <View style={styles.adjust}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="One minute less"
              onPress={() => onAdjust(-60)}
              style={[styles.adjBtn, cutCorners.b]}
            >
              <Text style={styles.adjText}>−1</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="One minute more"
              onPress={() => onAdjust(60)}
              style={[styles.adjBtn, cutCorners.c]}
            >
              <Text style={styles.adjText}>+1</Text>
            </Pressable>
          </View>
        ) : null}
        {!idle && !timer.running ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Reset timer" onPress={onReset} style={[styles.adjBtn, cutCorners.b]}>
            <Text style={styles.adjText}>↺</Text>
          </Pressable>
        ) : null}
        <PaperButton
          label={timer.running ? 'Pause' : idle ? 'Start' : 'Resume'}
          color={timer.running ? paper.yellow : paper.red}
          textColor={timer.running ? paper.ink : paper.card}
          size="sm"
          onPress={onToggle}
        />
      </View>
    </PaperCard>
  );
}

/** Small floating pill for a timer that's still running on another step. */
export function TimerPill({ timer, onPress }: { timer: TimerState; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Timer from step ${timer.step + 1}`} onPress={onPress}>
      <PaperCard
        shape="b"
        tilt={2}
        lift={3}
        color={timer.ringing ? paper.green : paper.card}
        contentStyle={styles.pill}
      >
        <Dial ratio={timer.total ? timer.left / timer.total : 0} size={26} />
        <Text style={[styles.pillText, timer.ringing && { color: paper.card }]}>
          {timer.ringing ? 'Done!' : formatClock(timer.left)}
        </Text>
        <Text style={[styles.pillStep, timer.ringing && { color: paper.card }]}>step {timer.step + 1}</Text>
      </PaperCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  adjBtn: {
    alignItems: 'center',
    backgroundColor: paper.kraft,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  adjText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  adjust: {
    flexDirection: 'row',
    gap: 6,
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clock: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  flex: {
    flex: 1,
  },
  pill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillStep: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  pillText: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 16,
  },
  sub: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
});
