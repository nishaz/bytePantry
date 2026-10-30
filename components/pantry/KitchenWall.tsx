import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { cutCorners, fonts, paper } from '../../lib/theme';
import type { FridgeItem } from '../../types/fridge';
import { IngredientArt } from '../paper/IngredientArt';
import { Bob, Wiggle } from '../paper/Motion';

interface KitchenWallProps {
  fridgeItems: FridgeItem[];
  cupboardItems: FridgeItem[];
  onOpenFridge: () => void;
  onOpenCupboard: () => void;
}

/** Illustrated kitchen: tap the fridge or the cupboard to look inside. */
export function KitchenWall({ fridgeItems, cupboardItems, onOpenFridge, onOpenCupboard }: KitchenWallProps) {
  const expiring = fridgeItems.filter((item) => item.daysUntilExpiry <= 2);
  const urgent = [...fridgeItems, ...cupboardItems].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)[0];
  const magnets = fridgeItems.slice(0, 2);

  return (
    <View style={styles.room}>
      <View style={styles.wall} />
      <View style={styles.floor} />
      <View style={styles.skirting} />

      <View style={styles.layout}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open the fridge, ${fridgeItems.length} items, ${expiring.length} expiring soon`}
          onPress={onOpenFridge}
          style={({ pressed }) => [styles.fridgeWrap, pressed && styles.pressed]}
        >
          <View style={[StyleSheet.absoluteFill, styles.fridgeShadow]} />
          <Bob distance={1.5} rock={0} duration={1100} style={styles.fridge}>
            <View style={styles.freezerLine} />
            <View style={[styles.handle, { top: 46, height: 52 }]} />
            <View style={[styles.handle, { top: 150, height: 100 }]} />
            {magnets.map((item, i) => (
              <View key={item.id} style={[styles.magnet, i ? { top: 214, right: 20, transform: [{ rotate: '-10deg' }] } : null]}>
                <IngredientArt name={item.name} size={38} />
              </View>
            ))}
            {urgent ? (
              <View style={styles.note}>
                <Text style={styles.noteText} numberOfLines={3}>
                  Use the {urgent.name.toLowerCase()}!
                </Text>
              </View>
            ) : null}
            <Text style={styles.fridgeLabel}>Fridge</Text>
            <Text style={styles.count}>{fridgeItems.length} items</Text>
          </Bob>
          {expiring.length > 0 ? (
            <Wiggle style={styles.badge}>
              <Text style={styles.badgeText}>{expiring.length} expiring</Text>
            </Wiggle>
          ) : null}
        </Pressable>

        <View style={styles.right}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open the cupboard, ${cupboardItems.length} items`}
            onPress={onOpenCupboard}
            style={({ pressed }) => [styles.cupWrap, pressed && styles.pressed]}
          >
            <View style={[StyleSheet.absoluteFill, cutCorners.b, styles.cupShadow]} />
            <View style={[styles.cupboard, cutCorners.b]}>
              <View style={[styles.cupDoor, { borderTopLeftRadius: 9, borderBottomLeftRadius: 9 }]}>
                <View style={[styles.knob, { right: 8 }]} />
              </View>
              <View style={[styles.cupDoor, { borderTopRightRadius: 9, borderBottomRightRadius: 9 }]}>
                <View style={[styles.knob, { left: 8 }]} />
              </View>
            </View>
            <Text style={styles.cupLabel}>Cupboard</Text>
            <Text style={styles.cupCount}>{cupboardItems.length} items</Text>
          </Pressable>

          <View style={styles.counterDecor}>
            <Bob distance={0} rock={3} duration={1600}>
              <Svg width={32} height={62} viewBox="0 0 30 60">
                <Rect x="6" y="22" width="18" height="38" rx="4" fill={paper.red} />
                <Path d="M15 22C5 12 8 0 15 0s10 12 0 22z" fill={paper.green} />
                <Path d="M15 22c-2-6 0-12 6-16" stroke={paper.greenDeep} strokeWidth={2} fill="none" />
              </Svg>
            </Bob>
            <Svg width={100} height={58} viewBox="0 0 100 58">
              <Circle cx="30" cy="22" r="14" fill={paper.red} />
              <Circle cx="56" cy="18" r="13" fill={paper.yellow} />
              <Path d="M70 10c8 2 14 10 12 18-8 0-14-8-12-18z" fill={paper.yellow} />
              <Path d="M4 26h92c0 18-20 30-46 30S4 44 4 26z" fill={paper.blue} />
            </Svg>
          </View>
          <View style={styles.counterTop} />
        </View>
      </View>
      <Text style={styles.hint}>Tap the fridge or cupboard to look inside</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: paper.red,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    position: 'absolute',
    right: -6,
    top: -12,
  },
  badgeText: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  count: {
    bottom: 12,
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  counterTop: {
    backgroundColor: '#8E6440',
    borderRadius: 4,
    height: 12,
    marginHorizontal: -6,
  },
  counterDecor: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 'auto',
  },
  cupboard: {
    backgroundColor: paper.brown,
    flexDirection: 'row',
    gap: 8,
    height: 150,
    padding: 10,
  },
  cupCount: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textAlign: 'center',
  },
  cupDoor: {
    backgroundColor: '#D9A673',
    borderRadius: 7,
    flex: 1,
  },
  cupLabel: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  cupShadow: {
    backgroundColor: paper.shadow,
    height: 150,
    transform: [{ translateX: 6 }, { translateY: 7 }],
  },
  cupWrap: {
    position: 'relative',
  },
  floor: {
    backgroundColor: paper.brown,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 420,
  },
  freezerLine: {
    backgroundColor: paper.kraftDeep,
    height: 5,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 124,
  },
  fridge: {
    backgroundColor: paper.card,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 30,
    flex: 1,
    overflow: 'hidden',
  },
  fridgeLabel: {
    bottom: 30,
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 21,
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  fridgeShadow: {
    backgroundColor: paper.shadow,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 30,
    transform: [{ translateX: 7 }, { translateY: 8 }],
  },
  fridgeWrap: {
    height: 398,
    width: '46%',
  },
  handle: {
    backgroundColor: paper.steel,
    borderRadius: 5,
    left: 14,
    position: 'absolute',
    width: 10,
  },
  hint: {
    color: paper.card,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 446,
  },
  knob: {
    backgroundColor: paper.ink,
    borderRadius: 5,
    height: 24,
    position: 'absolute',
    top: 52,
    width: 9,
  },
  layout: {
    flexDirection: 'row',
    gap: 18,
    height: 420,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  magnet: {
    position: 'absolute',
    right: 16,
    top: 28,
    transform: [{ rotate: '8deg' }],
  },
  note: {
    backgroundColor: paper.yellow,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 6,
    padding: 7,
    position: 'absolute',
    right: 18,
    top: 150,
    transform: [{ rotate: '-5deg' }],
    width: 76,
  },
  noteText: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  right: {
    flex: 1,
  },
  room: {
    flex: 1,
    minHeight: 470,
  },
  skirting: {
    backgroundColor: '#8E6440',
    height: 12,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 412,
  },
  wall: {
    backgroundColor: '#D9C3A0',
    height: 420,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
