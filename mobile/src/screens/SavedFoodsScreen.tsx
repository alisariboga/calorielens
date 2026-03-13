import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator, Pressable
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { savedFoodsApi } from '../api/client';
import type { SavedFood, CreateSavedFoodRequest } from '../types/shared-types';

const emptyForm: CreateSavedFoodRequest = {
  name: '', caloriesPer100g: 0,
  proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, defaultServingG: 100,
};

export default function SavedFoodsScreen({ navigation, route }: any) {
  const selectMode: boolean = route.params?.selectMode ?? false;
  const [foods, setFoods] = useState<SavedFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateSavedFoodRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await savedFoodsApi.list();
      setFoods(data);
    } catch {
      Alert.alert('Error', 'Could not load saved foods');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(load);

  const handleDelete = (food: SavedFood) => {
    Alert.alert('Delete', `Remove "${food.name}" from saved foods?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await savedFoodsApi.delete(food.id);
          setFoods(prev => prev.filter(f => f.id !== food.id));
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Food name is required'); return; }
    if (!form.caloriesPer100g) { Alert.alert('Error', 'Calories are required'); return; }
    setSaving(true);
    try {
      const created = await savedFoodsApi.create(form);
      setFoods(prev => [created, ...prev]);
      setShowForm(false);
      setForm(emptyForm);
    } catch {
      Alert.alert('Error', 'Could not save food');
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (food: SavedFood) => {
    const item = {
      name: food.name,
      quantityG: food.defaultServingG,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
    };
    if (selectMode) {
      navigation.navigate('LogMeal', {
        date: route.params?.date,
        initialItems: [item],
      });
    } else {
      navigation.navigate('LogMeal', {
        initialItems: [item],
      });
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#4f46e5" /></View>;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={foods}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyTitle}>No saved foods yet</Text>
            <Text style={styles.emptySub}>Tap + to add your favourite foods for quick access</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity style={styles.info} onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.caloriesPer100g} cal · P:{item.proteinPer100g}g C:{item.carbsPer100g}g F:{item.fatPer100g}g
                {' '}· {item.defaultServingG}g serving
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => handleSelect(item)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Food Modal */}
      <Modal visible={showForm} transparent animationType="none" onRequestClose={() => setShowForm(false)}>
        <Pressable style={styles.modalRoot} onPress={() => setShowForm(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Saved Food</Text>

            <Text style={styles.fieldLabel}>Food Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={v => setForm(p => ({ ...p, name: v }))}
              placeholder="e.g. Chicken Breast"
            />

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Calories / 100g *</Text>
                <TextInput style={styles.input} keyboardType="numeric"
                  value={form.caloriesPer100g ? String(form.caloriesPer100g) : ''}
                  onChangeText={v => setForm(p => ({ ...p, caloriesPer100g: parseFloat(v) || 0 }))}
                  placeholder="0" />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Serving (g)</Text>
                <TextInput style={styles.input} keyboardType="numeric"
                  value={form.defaultServingG ? String(form.defaultServingG) : ''}
                  onChangeText={v => setForm(p => ({ ...p, defaultServingG: parseFloat(v) || 100 }))}
                  placeholder="100" />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldThird}>
                <Text style={styles.fieldLabel}>Protein (g)</Text>
                <TextInput style={styles.input} keyboardType="numeric"
                  value={form.proteinPer100g ? String(form.proteinPer100g) : ''}
                  onChangeText={v => setForm(p => ({ ...p, proteinPer100g: parseFloat(v) || 0 }))}
                  placeholder="0" />
              </View>
              <View style={styles.fieldThird}>
                <Text style={styles.fieldLabel}>Carbs (g)</Text>
                <TextInput style={styles.input} keyboardType="numeric"
                  value={form.carbsPer100g ? String(form.carbsPer100g) : ''}
                  onChangeText={v => setForm(p => ({ ...p, carbsPer100g: parseFloat(v) || 0 }))}
                  placeholder="0" />
              </View>
              <View style={styles.fieldThird}>
                <Text style={styles.fieldLabel}>Fat (g)</Text>
                <TextInput style={styles.input} keyboardType="numeric"
                  value={form.fatPer100g ? String(form.fatPer100g) : ''}
                  onChangeText={v => setForm(p => ({ ...p, fatPer100g: parseFloat(v) || 0 }))}
                  placeholder="0" />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleAdd}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Food'}</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 100 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 32 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 3 },
  addBtn: {
    backgroundColor: '#4f46e5', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 12, marginLeft: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  deleteBtn: { padding: 8, marginLeft: 4 },
  deleteBtnText: { color: '#9ca3af', fontSize: 16 },

  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4f46e5',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4f46e5', shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  fabIcon: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' },

  /* Modal / sheet */
  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#d1d5db',
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },

  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 10, fontSize: 14, backgroundColor: '#fff', marginBottom: 12,
  },
  fieldRow: { flexDirection: 'row', gap: 8 },
  fieldHalf: { flex: 1 },
  fieldThird: { flex: 1 },

  saveBtn: {
    backgroundColor: '#4f46e5', borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
