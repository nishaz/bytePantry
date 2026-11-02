import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { cutCorners, fonts, paper } from '../../../lib/theme';
import { IngredientArt } from '../../paper/IngredientArt';
import { tileIn } from '../../paper/Motion';

const COLLAPSED = 4;

/** "Uses" line for a cook step: small wrapping chips, so the scene keeps most of the screen. */
export function StepIngredients({ items, stepKey }: { items: string[]; stepKey: number }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const shown = open ? items : items.slice(0, COLLAPSED);
  const hidden = items.length - shown.length;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Uses</Text>
      {shown.map((name, i) => (
        <Animated.View key={`${stepKey}-${i}-${name}`} entering={tileIn(i)} style={[styles.chip, cutCorners.c]}>
          <IngredientArt name={name} size={22} shadow={false} />
          <Text style={styles.text} numberOfLines={1}>
            {name}
          </Text>
        </Animated.View>
      ))}
      {items.length > COLLAPSED ? (
        <Pressable accessibilityRole="button" onPress={() => setOpen((o) => !o)} hitSlop={8} style={[styles.more, cutCorners.b]}>
          <Text style={styles.moreText}>{open ? 'Less' : `+${hidden} more`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: paper.card,
    flexDirection: 'row',
    gap: 5,
    maxWidth: '100%',
    paddingLeft: 4,
    paddingRight: 9,
    paddingVertical: 3,
  },
  label: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    marginRight: 2,
    textTransform: 'uppercase',
  },
  more: {
    backgroundColor: paper.kraftDeep,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  moreText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  text: {
    color: paper.ink,
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
  },
});
