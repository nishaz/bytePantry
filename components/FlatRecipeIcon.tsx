import { StyleSheet, View } from 'react-native';

import { FlatImage } from './FlatImage';
import { colors } from '../lib/theme';

interface FlatRecipeIconProps {
  label: string;
}

export function FlatRecipeIcon({ label }: FlatRecipeIconProps) {
  return (
    <View style={styles.box}>
      <FlatImage label={label} size={40} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: colors.iconBox,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
});
