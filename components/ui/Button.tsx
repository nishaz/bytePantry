import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radii } from '../../lib/theme';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'ghost';
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', small, disabled, style, ...rest }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' ? styles.ghost : styles.primary,
        small && styles.small,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          variant === 'ghost' ? styles.ghostLabel : styles.primaryLabel,
          small && styles.smallLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.button,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 22,
  },
  disabled: {
    opacity: 0.4,
  },
  ghost: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
  },
  ghostLabel: {
    color: colors.ink,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  primary: {
    backgroundColor: colors.butter,
  },
  primaryLabel: {
    color: colors.butterText,
  },
  small: {
    borderRadius: 16,
    minHeight: 32,
    paddingHorizontal: 12,
  },
  smallLabel: {
    fontSize: 11,
  },
});
