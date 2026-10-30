import { StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { fonts, paper } from '../../lib/theme';
import type { FridgeItem } from '../../types/fridge';
import { IngredientArt } from '../paper/IngredientArt';
import { PaperButton } from '../paper/PaperButton';
import { PaperCard } from '../paper/PaperCard';

export function expiryLabel(days: number): string {
  if (days < 0) return `Expired ${-days} day${days === -1 ? '' : 's'} ago`;
  if (days === 0) return 'Use today';
  if (days === 1) return '1 day left';
  if (days > 60) return 'Keeps for months';
  return `${days} days left`;
}

export function expiryTextColor(days: number): string {
  if (days <= 0) return paper.redDeep;
  if (days <= 2) return paper.amberText;
  return paper.greenDeep;
}

interface ItemSheetProps {
  item: FridgeItem;
  bottom: number;
  onClose: () => void;
  onUsedUp: () => void;
  onEdit: () => void;
}

export function ItemSheet({ item, bottom, onClose, onUsedUp, onEdit }: ItemSheetProps) {
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(15)}
      exiting={SlideOutDown.duration(180)}
      style={[styles.wrap, { bottom }]}
    >
      <PaperCard shape="d" lift={6} contentStyle={styles.card}>
        <View style={styles.row}>
          <IngredientArt name={item.spriteName || item.name} size={68} />
          <View style={styles.copy}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.amount} · {item.category} · {item.location === 'fridge' ? 'Fridge' : 'Cupboard'}
            </Text>
            <Text style={[styles.exp, { color: expiryTextColor(item.daysUntilExpiry) }]}>
              {expiryLabel(item.daysUntilExpiry)}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <PaperButton label="Close" color={paper.kraft} textColor={paper.ink} size="sm" onPress={onClose} style={styles.flex} />
          <PaperButton label="Edit" color={paper.yellow} textColor={paper.ink} size="sm" onPress={onEdit} style={styles.flex} />
          <PaperButton label="Used it up" color={paper.green} size="sm" onPress={onUsedUp} style={styles.flex} />
        </View>
      </PaperCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  card: {
    padding: 16,
  },
  copy: {
    flex: 1,
  },
  exp: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
  meta: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  name: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  wrap: {
    left: 14,
    position: 'absolute',
    right: 14,
    zIndex: 10,
  },
});
