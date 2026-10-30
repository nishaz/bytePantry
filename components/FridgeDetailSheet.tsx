import { StyleSheet, Text, View } from 'react-native';

import { Button } from './ui/Button';
import { getExpiryColor, getExpiryLabel, getExpiryStatus } from '../lib/fridgeExpiry';
import { colors, fonts } from '../lib/theme';
import type { FridgeItem } from '../types/fridge';

interface FridgeDetailSheetProps {
  item: FridgeItem;
  onClose: () => void;
}

export function FridgeDetailSheet({ item, onClose }: FridgeDetailSheetProps) {
  const status = getExpiryStatus(item.daysUntilExpiry);

  return (
    <View style={styles.sheet}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>

      <View style={styles.row}>
        <Text style={styles.rowText}>
          Amount: <Text style={styles.bold}>{item.amount}</Text>
        </Text>
        <View style={[styles.tag, { backgroundColor: getExpiryColor(status) }]}>
          <Text style={styles.tagText}>{getExpiryLabel(item.daysUntilExpiry)}</Text>
        </View>
      </View>

      <View style={styles.nav}>
        <Button label="Close" variant="ghost" onPress={onClose} style={styles.btn} />
        <Button label="Log use (soon)" variant="ghost" disabled style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontFamily: fonts.body,
  },
  btn: {
    flex: 1,
  },
  category: {
    color: colors.muted,
    fontFamily: fonts.bodyRegular,
    fontSize: 12.5,
    marginBottom: 10,
  },
  name: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 16,
    marginBottom: 2,
  },
  nav: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowText: {
    color: colors.ink,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: 18,
    bottom: 10,
    left: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'absolute',
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    zIndex: 4,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  tagText: {
    color: '#fff',
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
  },
});
