import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { levelFor } from '../../../lib/profile';
import { fonts, paper } from '../../../lib/theme';
import { DishArt } from '../../paper/DishArt';
import { Bob } from '../../paper/Motion';
import { PaperButton } from '../../paper/PaperButton';
import { PaperCard } from '../../paper/PaperCard';

const CONFETTI = [paper.red, paper.yellow, paper.green, paper.blue, paper.purple, paper.orange, paper.card];

function Confetto({ index, total }: { index: number; total: number }) {
  const p = useSharedValue(0);
  const angle = (index / total) * Math.PI * 2 + (index % 3) * 0.3;
  const dist = 150 + (index % 4) * 30;
  useEffect(() => {
    p.value = withDelay(index * 12, withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) }));
  }, [index, p]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.1, 0.75, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: Math.cos(angle) * dist * p.value },
      { translateY: Math.sin(angle) * dist * p.value + 120 * p.value * p.value },
      { rotate: `${p.value * (index % 2 ? 540 : -540)}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        styles.confetto,
        {
          backgroundColor: CONFETTI[index % CONFETTI.length],
          width: index % 3 === 0 ? 10 : 15,
          height: index % 3 === 0 ? 15 : 9,
        },
        style,
      ]}
    />
  );
}

/** Burst of confetti — used for both step "Done!" and the finale. */
export function ConfettiBurst({ count = 24 }: { count?: number }) {
  return (
    <View style={[{ pointerEvents: 'none' }, styles.burst]}>
      {Array.from({ length: count }, (_, i) => (
        <Confetto key={i} index={i} total={count} />
      ))}
    </View>
  );
}

/** Floating "+15 XP" that rises and fades after finishing a step. */
export function XpPop({ amount }: { amount: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [p]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
    transform: [{ translateY: -70 * p.value }, { scale: interpolate(p.value, [0, 0.2, 1], [0.4, 1.15, 1]) }, { rotate: '-4deg' }],
  }));
  return (
    <Animated.View  style={[{ pointerEvents: 'none' }, styles.xpPop, style]}>
      <Text style={styles.xpPopText}>+{amount} XP</Text>
    </Animated.View>
  );
}

interface CelebrationProps {
  title: string;
  earned: number;
  xpBefore: number;
  xpAfter: number;
  streak: number;
  onDone: () => void;
  onAgain: () => void;
}

export function Celebration({ title, earned, xpBefore, xpAfter, streak, onDone, onAgain }: CelebrationProps) {
  const before = levelFor(xpBefore);
  const after = levelFor(xpAfter);
  const levelUp = after.level > before.level;
  const fill = useSharedValue(levelUp ? 0 : before.into / before.span);
  useEffect(() => {
    fill.value = withDelay(500, withSpring(after.into / after.span, { damping: 14 }));
  }, [after.into, after.span, fill]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.max(0.04, fill.value) * 100}%` }));

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
      <ConfettiBurst count={32} />
      <Animated.View entering={ZoomIn.springify().damping(10)} style={styles.cardWrap}>
        <PaperCard shape="d" tilt={-1.5} lift={7} contentStyle={styles.card}>
          <Bob distance={6} rock={4}>
            <DishArt title={title} size={130} />
          </Bob>
          <Text style={styles.kicker}>{levelUp ? `Level up! You're a ${after.title}` : 'Dish complete!'}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.xp}>+{earned} XP</Text>
          <View style={styles.levelRow}>
            <Text style={styles.level}>Lv {after.level}</Text>
            <View style={styles.track}>
              <Animated.View style={[styles.fill, fillStyle]} />
            </View>
          </View>
          <Text style={styles.streak}>
            {streak} day streak · keep it going tomorrow
          </Text>
          <View style={styles.actions}>
            <PaperButton label="Back to kitchen" color={paper.green} onPress={onDone} />
            <PaperButton label="Cook it again" color={paper.kraft} textColor={paper.ink} size="sm" onPress={onAgain} />
          </View>
        </PaperCard>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 18,
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(43,35,32,0.45)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 22,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 50,
  },
  burst: {
    height: 0,
    left: '50%',
    position: 'absolute',
    top: '42%',
    width: 0,
    zIndex: 2,
  },
  card: {
    alignItems: 'center',
    padding: 22,
  },
  cardWrap: {
    alignSelf: 'stretch',
  },
  confetto: {
    borderRadius: 3,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  fill: {
    backgroundColor: paper.yellow,
    borderRadius: 6,
    height: '100%',
  },
  flex: {
    flex: 1,
  },
  kicker: {
    color: paper.greenDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.6,
    marginTop: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  level: {
    color: paper.card,
    backgroundColor: paper.green,
    borderRadius: 9,
    fontFamily: fonts.display,
    fontSize: 15,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingTop: 3,
  },
  levelRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  streak: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    marginTop: 10,
  },
  title: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 33,
    textAlign: 'center',
  },
  track: {
    backgroundColor: paper.kraft,
    borderRadius: 6,
    flex: 1,
    height: 12,
    overflow: 'hidden',
  },
  xp: {
    color: paper.red,
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 52,
  },
  xpPop: {
    alignSelf: 'center',
    backgroundColor: paper.green,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    position: 'absolute',
    top: '40%',
    zIndex: 20,
  },
  xpPopText: {
    color: paper.card,
    fontFamily: fonts.display,
    fontSize: 26,
  },
});
