import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { levelFor } from '../../lib/profile';
import { fonts, paper } from '../../lib/theme';
import { PaperCard } from './PaperCard';
import { FlameIcon } from './UiIcons';

/** Level badge + XP bar that springs to its value on mount. */
export function XpBar({ xp }: { xp: number }) {
  const info = levelFor(xp);
  const ratio = Math.min(1, info.into / info.span);
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withSpring(ratio, { damping: 12, stiffness: 90 });
  }, [fill, ratio]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.max(0.04, fill.value) * 100}%` }));

  return (
    <PaperCard shape="b" lift={3} contentStyle={styles.xpCard}>
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>Lv {info.level}</Text>
      </View>
      <View style={styles.xpBody}>
        <View style={styles.xpRow}>
          <Text style={styles.xpTitle}>{info.title}</Text>
          <Text style={styles.xpCount}>
            {info.into} / {info.span} XP
          </Text>
        </View>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      </View>
    </PaperCard>
  );
}

/** Streak counter with a flickering paper flame. */
export function StreakBadge({ days }: { days: number }) {
  const flick = useSharedValue(0);
  useEffect(() => {
    flick.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [flick]);
  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${flick.value * 5}deg` }, { scaleY: 1 + flick.value * 0.06 }],
  }));

  return (
    <PaperCard shape="c" tilt={2} lift={3} contentStyle={styles.streak}>
      <Animated.View style={flameStyle}>
        <FlameIcon size={20} />
      </Animated.View>
      <Text style={styles.streakNum}>{days}</Text>
      <Text style={styles.streakLabel}>{days === 1 ? 'day' : 'days'}</Text>
    </PaperCard>
  );
}

export function SectionTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: paper.yellow,
    borderRadius: 6,
    height: '100%',
  },
  levelBadge: {
    backgroundColor: paper.green,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: {
    color: paper.card,
    fontFamily: fonts.display,
    fontSize: 15,
  },
  section: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 21,
  },
  streak: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  streakLabel: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  streakNum: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 19,
  },
  track: {
    backgroundColor: paper.kraft,
    borderRadius: 6,
    height: 10,
    marginTop: 5,
    overflow: 'hidden',
  },
  xpBody: {
    flex: 1,
  },
  xpCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  xpCount: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpTitle: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});
