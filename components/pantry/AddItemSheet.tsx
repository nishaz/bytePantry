import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { addFridgeItem, defaultLocationFor } from '../../lib/fridgeDb';
import { fonts, paper } from '../../lib/theme';
import { INGREDIENT_CATEGORIES, type StorageLocation } from '../../types/fridge';
import { FilterChip } from '../paper/FilterChip';
import { IngredientArt } from '../paper/IngredientArt';
import { PaperButton } from '../paper/PaperButton';
import { PaperCard } from '../paper/PaperCard';

const EXPIRY_OPTIONS = [
  { label: 'Today', days: 0 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: 'Months', days: 180 },
];

interface AddItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddItemSheet({ visible, onClose, onSaved }: AddItemSheetProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Produce');
  const [location, setLocation] = useState<StorageLocation>('fridge');
  const [days, setDays] = useState(7);
  const [saving, setSaving] = useState(false);

  function reset() {
    setName('');
    setAmount('');
    setCategory('Produce');
    setLocation('fridge');
    setDays(7);
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addFridgeItem({ name: name.trim(), amount: amount.trim() || '1', category, location, days });
      reset();
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
        <PaperCard shape="d" lift={6} style={styles.sheetWrap} contentStyle={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={styles.head}>
              <IngredientArt name={name || '?'} size={60} />
              <Text style={styles.title}>Add to pantry</Text>
            </View>

            <Text style={styles.label}>What is it?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Carrots"
              placeholderTextColor={paper.inkSoft}
              style={styles.input}
              accessibilityLabel="Ingredient name"
            />

            <Text style={styles.label}>How much?</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 1 bag"
              placeholderTextColor={paper.inkSoft}
              style={styles.input}
              accessibilityLabel="Amount"
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.wrapRow}>
              {INGREDIENT_CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={category === c}
                  onPress={() => {
                    setCategory(c);
                    setLocation(defaultLocationFor(c));
                  }}
                />
              ))}
            </View>

            <Text style={styles.label}>Where does it live?</Text>
            <View style={styles.wrapRow}>
              <FilterChip label="Fridge" active={location === 'fridge'} onPress={() => setLocation('fridge')} />
              <FilterChip label="Cupboard" active={location === 'cupboard'} onPress={() => setLocation('cupboard')} />
            </View>

            <Text style={styles.label}>Use within</Text>
            <View style={styles.wrapRow}>
              {EXPIRY_OPTIONS.map((o) => (
                <FilterChip key={o.label} label={o.label} active={days === o.days} onPress={() => setDays(o.days)} />
              ))}
            </View>

            <View style={styles.actions}>
              <PaperButton label="Cancel" color={paper.kraft} textColor={paper.ink} onPress={onClose} style={styles.flex} />
              <PaperButton
                label={saving ? 'Saving…' : 'Put it away'}
                color={paper.red}
                disabled={!name.trim() || saving}
                onPress={save}
                style={styles.flex}
              />
            </View>
          </ScrollView>
        </PaperCard>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backdrop: {
    backgroundColor: 'rgba(43,35,32,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  content: {
    padding: 18,
  },
  flex: {
    flex: 1,
  },
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: paper.kraft,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 16,
    color: paper.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  label: {
    color: paper.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 14,
  },
  sheet: {
    maxHeight: 640,
  },
  sheetWrap: {
    marginBottom: 12,
  },
  title: {
    color: paper.ink,
    fontFamily: fonts.display,
    fontSize: 26,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
});
