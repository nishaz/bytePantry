import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../lib/theme';

interface SkyToggleProps {
  isNight: boolean;
  onPress: () => void;
}

export function SkyToggle({ isNight, onPress }: SkyToggleProps) {
  return (
    <Pressable
      accessibilityLabel={isNight ? 'Switch to daytime sky' : 'Switch to nighttime sky'}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>Sky</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 12,
  },
  label: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.85,
  },
});
