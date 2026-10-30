import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../lib/theme';

export function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.chip,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    color: colors.chipText,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
  },
});
