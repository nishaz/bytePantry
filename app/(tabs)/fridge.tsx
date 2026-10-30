import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddItemSheet } from '../../components/pantry/AddItemSheet';
import { expiryLabel, ItemSheet } from '../../components/pantry/ItemSheet';
import { KitchenWall } from '../../components/pantry/KitchenWall';
import { StorageView } from '../../components/pantry/StorageView';
import { ChipRow } from '../../components/paper/FilterChip';
import { IngredientArt } from '../../components/paper/IngredientArt';
import { dealIn } from '../../components/paper/Motion';
import { PaperBackground } from '../../components/paper/PaperBackground';
import { PaperButton } from '../../components/paper/PaperButton';
import { PaperCard } from '../../components/paper/PaperCard';
import { PlusIcon } from '../../components/paper/UiIcons';
import { removeFridgeItem } from '../../lib/fridgeDb';
import { cutCorners, fonts, paper } from '../../lib/theme';
import { useKitchen } from '../../lib/useKitchen';
import { INGREDIENT_CATEGORIES, type FridgeItem } from '../../types/fridge';

type View_ = 'kitchen' | 'fridge' | 'cupboard' | 'list';
const FILTERS = ['All', ...INGREDIENT_CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

function pill(days: number): { bg: string; fg: string } {
  if (days <= 0) return { bg: paper.red, fg: paper.card };
  if (days <= 2) return { bg: paper.yellow, fg: paper.ink };
  return { bg: '#E3EDD9', fg: '#2E5A2B' };
}

export default function PantryScreen() {
  const insets = useSafeAreaInsets();
  const { fridge, reload, setFridge } = useKitchen();
  const [view, setView] = useState<View_>('kitchen');
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<FridgeItem | null>(null);
  const [adding, setAdding] = useState(false);

  const visible = fridge.filter((item) => filter === 'All' || item.category === filter);
  const inFridge = visible.filter((item) => item.location === 'fridge');
  const inCupboard = visible.filter((item) => item.location === 'cupboard');
  const tabBarSpace = insets.bottom + 96;
  const isList = view === 'list';

  async function usedUp(item: FridgeItem) {
    setSelected(null);
    setFridge((items) => items.filter((i) => i.id !== item.id));
    await removeFridgeItem(item.id);
  }

  const title = view === 'fridge' ? 'Fridge' : view === 'cupboard' ? 'Cupboard' : 'Pantry';

  return (
    <PaperBackground>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          <View style={[styles.segment, cutCorners.c]}>
            {(['kitchen', 'list'] as const).map((mode) => {
              const active = mode === 'list' ? isList : !isList;
              return (
                <Pressable
                  key={mode}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setSelected(null);
                    setView(mode);
                  }}
                  style={[styles.segBtn, cutCorners.b, active && styles.segBtnOn]}
                >
                  <Text style={[styles.segText, active && styles.segTextOn]}>{mode === 'list' ? 'List' : 'Kitchen'}</Text>
                </Pressable>
              );
            })}
          </View>
          <PaperButton
            accessibilityLabel="Add an ingredient"
            icon={<PlusIcon size={20} />}
            color={paper.red}
            size="sm"
            onPress={() => setAdding(true)}
          />
        </View>
      </View>

      <View>
        <ChipRow options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <View style={[styles.body, { paddingBottom: view === 'kitchen' ? 0 : tabBarSpace }]}>
        {view === 'kitchen' ? (
          <KitchenWall
            fridgeItems={inFridge}
            cupboardItems={inCupboard}
            onOpenFridge={() => setView('fridge')}
            onOpenCupboard={() => setView('cupboard')}
          />
        ) : null}
        {view === 'fridge' || view === 'cupboard' ? (
          <StorageView
            key={view}
            location={view}
            items={view === 'fridge' ? inFridge : inCupboard}
            onSelect={setSelected}
            onClose={() => {
              setSelected(null);
              setView('kitchen');
            }}
          />
        ) : null}
        {isList ? (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={styles.listHead}>
                {visible.length} {visible.length === 1 ? 'item' : 'items'} · expiring first
              </Text>
            }
            ListEmptyComponent={<Text style={styles.empty}>Nothing here yet. Tap + to add something.</Text>}
            renderItem={({ item, index }) => {
              const p = pill(item.daysUntilExpiry);
              return (
                <Animated.View entering={dealIn(Math.min(index, 8))}>
                  <Pressable accessibilityRole="button" onPress={() => setSelected(item)}>
                    <PaperCard shape={index % 2 ? 'b' : 'c'} lift={3} contentStyle={styles.row}>
                      <IngredientArt name={item.spriteName || item.name} size={42} />
                      <View style={styles.rowCopy}>
                        <Text style={styles.rowName}>{item.name}</Text>
                        <Text style={styles.rowMeta}>
                          {item.amount} · {item.location === 'fridge' ? 'Fridge' : 'Cupboard'}
                        </Text>
                      </View>
                      <View style={[styles.pill, { backgroundColor: p.bg }]}>
                        <Text style={[styles.pillText, { color: p.fg }]}>{expiryLabel(item.daysUntilExpiry)}</Text>
                      </View>
                    </PaperCard>
                  </Pressable>
                </Animated.View>
              );
            }}
          />
        ) : null}
      </View>

      {selected ? (
        <ItemSheet item={selected} bottom={tabBarSpace} onClose={() => setSelected(null)} onUsedUp={() => usedUp(selected)} />
      ) : null}

      <AddItemSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onSaved={() => {
          setAdding(false);
          reload();
        }}
      />
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginTop: 6,
  },
  empty: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    paddingTop: 30,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  list: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  listHead: {
    color: paper.inkSoft,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    marginBottom: 2,
  },
  pill: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rowCopy: {
    flex: 1,
  },
  rowMeta: {
    color: paper.inkSoft,
    fontFamily: fonts.body,
    fontSize: 12.5,
  },
  rowName: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
  },
  segBtn: {
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 12,
  },
  segBtnOn: {
    backgroundColor: paper.yellow,
  },
  segText: {
    color: '#CDBBA6',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  segTextOn: {
    color: paper.ink,
  },
  segment: {
    backgroundColor: paper.ink,
    flexDirection: 'row',
    gap: 3,
    padding: 3,
  },
  title: {
    color: paper.ink,
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 36,
    marginRight: 8,
  },
});
