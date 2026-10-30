import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { FridgeItemIcon } from './FridgeItemIcon';
import { getExpiryColor, getExpiryLabel, getExpiryStatus } from '../lib/fridgeExpiry';
import { colors, fonts } from '../lib/theme';
import type { FridgeItem } from '../types/fridge';

interface FridgeListViewProps {
  items: FridgeItem[];
  onSelect: (item: FridgeItem) => void;
}

export function FridgeListView({ items, onSelect }: FridgeListViewProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const status = getExpiryStatus(item.daysUntilExpiry);
        return (
          <Pressable onPress={() => onSelect(item)} style={styles.row}>
            <FridgeItemIcon item={item} size={30} showDot={false} />
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: getExpiryColor(status) }]}>
              <Text style={styles.tagText}>{getExpiryLabel(item.daysUntilExpiry)}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  amount: {
    color: colors.muted,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 2,
  },
  copy: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  name: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 14.5,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
