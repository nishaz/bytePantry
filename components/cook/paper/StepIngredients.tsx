import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { cutCorners, fonts, paper } from '../../../lib/theme';
import { IngredientArt } from '../../paper/IngredientArt';

const COLLAPSED = 4;

/** "For this step" list: big, readable ingredient cards that wrap instead of scrolling off-screen. */
export function StepIngredients({ items, stepKey }: { items: string[]; stepKey: number }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const shown = open ? items : items.slice(0, COLLAPSED);
  const hidden = items.length - shown.length;

  return (
    <View style={[styles.card, cutCorners.b]}>
      <Text style={styles.heading}>For this step</Text>
      <View style={styles.grid}>
        {shown.map((name, i) => (
          <Animated.View
            key={`${stepKey}-${i}-${name}`}
            entering={i < COLLAPSED ? ZoomIn.delay(i * 60).springify().damping(13) : FadeIn}
            style={[styles.item, i % 2 ? cutCorners.c : cutCorners.b]}
          >
            <IngredientArt name={name} size={30} shadow={false} />
            <Text style={styles.text} numberOfLines={2}>
              {name}
            </Text>
          </Animated.View>
        ))}
      </View>
      {items.length > COLLAPSED ? (
        <Pressable accessibilityRole="button" onPress={() => setOpen((o) => !o)} hitSlop={8} style={styles.more}>
          <Text style={styles.moreText}>{open ? 'Show less' : `+${hidden} more`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: paper.card,
    marginHorizontal: 14,
    paddingBottom: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heading: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    letterSpacing: 0.6,
    marginBottom: 6,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  item: {
    alignItems: 'center',
    backgroundColor: paper.kraft,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: '49%',
  },
  more: {
    alignSelf: 'flex-start',
    marginLeft: 2,
    marginTop: 6,
  },
  moreText: {
    color: paper.redDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  text: {
    color: paper.ink,
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    lineHeight: 17,
  },
});
