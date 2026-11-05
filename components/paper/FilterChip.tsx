import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cutCorners, fonts, paper } from '../../lib/theme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  variant?: 'solid' | 'toggle';
  /** Smaller chip for dense filter rows. */
  compact?: boolean;
}

export function FilterChip({ label, active, onPress, variant = 'solid', compact }: FilterChipProps) {
  if (variant === 'toggle') {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: active }}
        onPress={onPress}
        style={[styles.toggle, compact && styles.toggleCompact, active ? styles.toggleOn : styles.toggleOff]}
      >
        <View style={[styles.box, { borderColor: active ? paper.card : paper.ink }]}>
          {active ? <Text style={styles.tick}>✓</Text> : null}
        </View>
        <Text style={[styles.toggleText, compact && styles.textCompact, { color: active ? paper.card : paper.ink }]}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.wrap}
    >
      <View style={[StyleSheet.absoluteFill, cutCorners.c, styles.shadow]} />
      <View style={[styles.chip, compact && styles.chipCompact, cutCorners.c, { backgroundColor: active ? paper.ink : paper.card }]}>
        <Text style={[styles.text, compact && styles.textCompact, { color: active ? paper.card : paper.ink }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

/** Horizontally scrolling row of single-select chips. */
export function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => (
        <FilterChip key={option} label={option} active={option === value} onPress={() => onChange(option)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    height: 15,
    justifyContent: 'center',
    width: 15,
  },
  chip: {
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 14,
  },
  chipCompact: {
    minHeight: 32,
    paddingHorizontal: 12,
  },
  textCompact: {
    fontSize: 12.5,
  },
  toggleCompact: {
    minHeight: 32,
    paddingHorizontal: 10,
  },
  row: {
    gap: 9,
    paddingBottom: 6,
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  shadow: {
    backgroundColor: paper.shadow,
    transform: [{ translateX: 2 }, { translateY: 3 }],
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
  },
  tick: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    lineHeight: 12,
  },
  toggle: {
    alignItems: 'center',
    borderRadius: 999,
    borderStyle: 'dashed',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  toggleOff: {
    backgroundColor: 'transparent',
    borderColor: paper.inkSoft,
  },
  toggleOn: {
    backgroundColor: paper.green,
    borderColor: paper.green,
  },
  toggleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  wrap: {
    position: 'relative',
  },
});
