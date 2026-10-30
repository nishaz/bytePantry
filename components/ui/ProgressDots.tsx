import { StyleSheet, View } from 'react-native';

import { colors } from '../../lib/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={[styles.dot, index <= current && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    backgroundColor: colors.line,
    borderRadius: 2,
    flex: 1,
    height: 3,
  },
  dotActive: {
    backgroundColor: colors.berry,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
});
