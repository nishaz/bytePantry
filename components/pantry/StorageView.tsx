import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { shelfFor } from '../../lib/fridgeDb';
import { fonts, paper } from '../../lib/theme';
import type { FridgeItem, StorageLocation } from '../../types/fridge';
import { IngredientArt } from '../paper/IngredientArt';
import { PaperButton } from '../paper/PaperButton';

const SHELVES: Record<StorageLocation, string[]> = {
  fridge: ['Top shelf', 'Bottom shelf', 'Crisper drawer'],
  cupboard: ['Dry goods', 'Jars & bottles', 'Veg basket'],
};

export function expiryDot(days: number): string {
  if (days <= 0) return paper.red;
  if (days <= 2) return paper.yellow;
  return paper.green;
}

interface StorageViewProps {
  location: StorageLocation;
  items: FridgeItem[];
  onSelect: (item: FridgeItem) => void;
  onClose: () => void;
}

/** Inside of the fridge or cupboard, with doors that swing open on arrival. */
export function StorageView({ location, items, onSelect, onClose }: StorageViewProps) {
  const isFridge = location === 'fridge';
  const open = useSharedValue(0);
  const light = useSharedValue(0);

  useEffect(() => {
    open.value = withSpring(1, { damping: 13, stiffness: 90 });
    light.value = withDelay(250, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, [light, open]);

  const leftDoor = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${-open.value * 108}deg` }],
    opacity: 1 - open.value * 0.25,
  }));
  const rightDoor = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${open.value * 108}deg` }],
    opacity: 1 - open.value * 0.25,
  }));
  const lightStyle = useAnimatedStyle(() => ({ opacity: light.value }));

  const groups = SHELVES[location]
    .map((label) => ({ label, items: items.filter((item) => shelfFor(item) === label) }))
    .filter((group) => group.items.length > 0);
  let tileIndex = 0;

  return (
    <View style={styles.wrap}>
      <View style={[styles.shadow, isFridge ? styles.fridgeCorners : styles.cupCorners]} />
      <View
        style={[
          styles.inside,
          isFridge ? styles.fridgeInside : styles.cupInside,
          isFridge ? styles.fridgeCorners : styles.cupCorners,
        ]}
      >
        {isFridge ? <Animated.View style={[{ pointerEvents: 'none' }, styles.bulb, lightStyle]} /> : null}
        <ScrollView contentContainerStyle={styles.shelves} showsVerticalScrollIndicator={false}>
          {groups.length === 0 ? (
            <Text style={[styles.empty, !isFridge && styles.textLight]}>Nothing here for this filter.</Text>
          ) : null}
          {groups.map((group) => (
            <View key={group.label} style={styles.shelf}>
              <Text style={[styles.shelfLabel, !isFridge && styles.textLight]}>{group.label}</Text>
              <View style={styles.items}>
                {group.items.map((item) => {
                  const delay = 260 + tileIndex++ * 55;
                  return (
                    <Animated.View key={item.id} entering={ZoomIn.delay(delay).springify().damping(11)}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${item.name}, ${item.amount}`}
                        onPress={() => onSelect(item)}
                        style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
                      >
                        <View>
                          <IngredientArt name={item.spriteName || item.name} size={52} />
                          {isFridge || item.daysUntilExpiry <= 7 ? (
                            <View style={[styles.dot, { backgroundColor: expiryDot(item.daysUntilExpiry) }]} />
                          ) : null}
                        </View>
                        <Text style={[styles.tileName, !isFridge && styles.textLight]} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
              <View style={[styles.board, isFridge ? styles.glass : styles.wood]} />
            </View>
          ))}
        </ScrollView>
      </View>

      {isFridge ? (
        <Animated.View
          
          style={[{ pointerEvents: 'none' }, styles.door, styles.fridgeCorners, { transformOrigin: 'left center' }, leftDoor]}
        />
      ) : (
        <>
          <Animated.View
            
            style={[{ pointerEvents: 'none' }, styles.cupDoor, styles.cupDoorL, { transformOrigin: 'left center' }, leftDoor]}
          />
          <Animated.View
            
            style={[{ pointerEvents: 'none' }, styles.cupDoor, styles.cupDoorR, { transformOrigin: 'right center' }, rightDoor]}
          />
        </>
      )}

      <PaperButton
        label={isFridge ? 'Close fridge' : 'Close cupboard'}
        color={isFridge ? paper.ink : paper.card}
        textColor={isFridge ? paper.card : paper.ink}
        size="sm"
        onPress={onClose}
        style={styles.close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    bottom: 0,
    height: 9,
    left: -14,
    position: 'absolute',
    right: -14,
  },
  close: {
    bottom: 14,
    position: 'absolute',
    right: 14,
  },
  cupCorners: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 20,
  },
  cupDoor: {
    backgroundColor: '#D9A673',
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: '50%',
  },
  cupDoorL: {
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 16,
    left: 0,
  },
  cupDoorR: {
    borderBottomRightRadius: 14,
    borderTopRightRadius: 20,
    right: 0,
  },
  cupInside: {
    backgroundColor: '#8E6440',
    borderColor: paper.brown,
  },
  door: {
    backgroundColor: paper.card,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dot: {
    borderColor: paper.card,
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    position: 'absolute',
    right: -4,
    top: -2,
    width: 14,
  },
  empty: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    paddingTop: 30,
    textAlign: 'center',
  },
  fridgeCorners: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 30,
  },
  fridgeInside: {
    backgroundColor: '#EAF2EF',
    borderColor: paper.card,
  },
  glass: {
    backgroundColor: '#CFE0DA',
    borderTopColor: '#B9CEC6',
    borderTopWidth: 2,
  },
  inside: {
    borderWidth: 10,
    flex: 1,
    overflow: 'hidden',
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 80,
  },
  bulb: {
    alignSelf: 'center',
    backgroundColor: '#FFE9A8',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 10,
    position: 'absolute',
    top: 0,
    width: 70,
  },
  light: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,240,190,0.4)',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    height: 70,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  shadow: {
    backgroundColor: paper.shadow,
    bottom: -7,
    left: 6,
    position: 'absolute',
    right: -6,
    top: 7,
  },
  shelf: {
    paddingBottom: 16,
    position: 'relative',
  },
  shelfLabel: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  shelves: {
    gap: 6,
    paddingBottom: 80,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  textLight: {
    color: '#F3E2C6',
  },
  tile: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    width: 74,
  },
  tileName: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  tilePressed: {
    transform: [{ scale: 0.92 }, { rotate: '-4deg' }],
  },
  wood: {
    backgroundColor: '#D9A673',
    height: 12,
  },
  wrap: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
  },
});
