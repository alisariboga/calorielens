import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image, Modal,
  SafeAreaView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { mealApi, foodApi } from '../api/client';
import type { FoodItem, MealItemInput } from '../types/shared-types';

export default function LogMealScreen({ navigation, route }: any) {
  const dateParam: string | undefined = route.params?.date;
  const autoScan: boolean = route.params?.autoScan ?? false;
  const initialItems: MealItemInput[] = route.params?.initialItems ?? [];
  const initialPhotoUri: string | undefined = route.params?.initialPhotoUri;
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [usedPhoto, setUsedPhoto] = useState(!!initialPhotoUri);
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUri ?? null);
  const [items, setItems] = useState<MealItemInput[]>(initialItems);
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [usdaResults, setUsdaResults] = useState<(FoodItem & { source: string })[]>([]);
  const [usdaSearching, setUsdaSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    foodApi.search('', 300).then(setAllFoods).catch(() => {});
  }, []);

  useEffect(() => {
    if (autoScan) handleScanFood();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) { setUsdaResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setUsdaSearching(true);
      foodApi.usdaSearch(searchQuery.trim())
        .then(setUsdaResults).catch(() => setUsdaResults([]))
        .finally(() => setUsdaSearching(false));
    }, 500);
  }, [searchQuery]);

  const filteredFoods = searchQuery.trim()
    ? allFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const toJpegBase64 = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return result.base64!;
  };

  const handleScanFood = async () => {
    setShowSheet(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      setUsedPhoto(true);
      const base64 = await toJpegBase64(uri);
      analyzePhoto(base64, 'image/jpeg');
    }
  };

  const handlePhotoLibrary = async () => {
    setShowSheet(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow photo access'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      setUsedPhoto(true);
      const base64 = await toJpegBase64(uri);
      analyzePhoto(base64, 'image/jpeg');
    }
  };

  const analyzePhoto = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    try {
      const result = await mealApi.analyzePhoto(base64, mimeType);
      if (result.detectedFoods.length > 0) {
        setItems(prev => [...prev, ...result.detectedFoods.map(f => ({
          name: f.name, quantityG: f.suggestedQuantityG,
          caloriesPer100g: f.caloriesPer100g, proteinPer100g: f.proteinPer100g,
          carbsPer100g: f.carbsPer100g, fatPer100g: f.fatPer100g
        }))]);
      } else {
        Alert.alert('No food detected', 'Please add items manually');
      }
    } catch (err: any) {
      Alert.alert('Analysis failed', err?.response?.data?.error || err?.message || 'Please add items manually');
    } finally {
      setAnalyzing(false);
    }
  };

  const addItem = (food: FoodItem) => {
    setItems(prev => [...prev, { foodItemId: food.id, name: food.name, quantityG: food.defaultServingG }]);
    setSearchQuery(''); setUsdaResults([]);
  };

  const addUsdaItem = (food: FoodItem & { source: string }) => {
    setItems(prev => [...prev, {
      name: food.name, quantityG: food.defaultServingG,
      caloriesPer100g: food.caloriesPer100g, proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g, fatPer100g: food.fatPer100g
    }]);
    setSearchQuery(''); setUsdaResults([]);
  };

  const updateItem = (index: number, field: 'name' | 'quantityG', value: string | number) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const getDateTime = () => {
    if (!dateParam) return undefined;
    const now = new Date();
    const [y, m, d] = dateParam.split('-').map(Number);
    return new Date(y, m - 1, d, now.getHours(), now.getMinutes()).toISOString();
  };

  const handleSubmit = async () => {
    if (items.length === 0) { Alert.alert('Error', 'Add at least one food item'); return; }
    setLoading(true);
    try {
      await mealApi.create({ mealType, method: usedPhoto ? 'photo' : 'text', dateTime: getDateTime(), items });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>

          {/* Meal Type */}
          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.row}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.chip, mealType === t && styles.chipActive]} onPress={() => setMealType(t)}>
                <Text style={[styles.chipText, mealType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Photo preview & analyzing */}
          {photoUri && (
            <View style={styles.photoSection}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              {analyzing && (
                <View style={styles.analyzingRow}>
                  <ActivityIndicator size="small" color="#4f46e5" />
                  <Text style={styles.analyzingText}> Analyzing with AI...</Text>
                </View>
              )}
            </View>
          )}
          {!photoUri && analyzing && (
            <View style={styles.analyzingRow}>
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text style={styles.analyzingText}> Analyzing with AI...</Text>
            </View>
          )}

          {/* Added Items */}
          {items.length > 0 && (
            <View>
              <Text style={styles.label}>Meal Items</Text>
              {items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <TextInput style={styles.itemName} value={item.name}
                    onChangeText={v => updateItem(index, 'name', v)} />
                  <TextInput style={styles.itemQty} value={String(item.quantityG)}
                    onChangeText={v => updateItem(index, 'quantityG', parseFloat(v) || 0)}
                    keyboardType="numeric" />
                  <Text style={styles.itemUnit}>g</Text>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Food Search */}
          <Text style={styles.label}>Add Foods</Text>
          <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery}
            placeholder="Search foods... (2+ chars for USDA)" />

          {(filteredFoods.length > 0 || usdaSearching || usdaResults.length > 0) && (
            <View style={styles.foodList}>
              <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 260 }}>
                {filteredFoods.slice(0, 5).map(food => (
                  <TouchableOpacity key={food.id} style={styles.foodItem} onPress={() => addItem(food)}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodMeta}>{food.caloriesPer100g} cal/100g</Text>
                  </TouchableOpacity>
                ))}
                {usdaSearching && (
                  <View style={styles.searchingRow}>
                    <ActivityIndicator size="small" color="#4f46e5" />
                    <Text style={styles.searchingText}> Searching USDA...</Text>
                  </View>
                )}
                {usdaResults.length > 0 && (
                  <>
                    <Text style={styles.usdaHeader}>USDA FoodData Central</Text>
                    {usdaResults.slice(0, 8).map(food => (
                      <TouchableOpacity key={food.id} style={[styles.foodItem, styles.usdaItem]} onPress={() => addUsdaItem(food)}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodMeta}>{food.caloriesPer100g} cal/100g · <Text style={{ color: '#16a34a' }}>USDA</Text></Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity style={[styles.submitBtn, (loading || items.length === 0) && styles.submitDisabled]}
            onPress={handleSubmit} disabled={loading || items.length === 0}>
            <Text style={styles.submitText}>{loading ? 'Saving...' : 'Log Meal'}</Text>
          </TouchableOpacity>

          {/* Bottom padding so FAB doesn't overlap content */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, showSheet && styles.fabOpen]}
        onPress={() => setShowSheet(v => !v)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>{showSheet ? '✕' : '+'}</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowSheet(false)}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {/* Handle bar */}
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Add Food</Text>

            <View style={styles.cardGrid}>
              {/* Scan Food */}
              <TouchableOpacity style={styles.card} onPress={handleScanFood} activeOpacity={0.8}>
                <Text style={styles.cardIcon}>📷</Text>
                <Text style={styles.cardLabel}>Scan Food</Text>
              </TouchableOpacity>

              {/* Photo Library */}
              <TouchableOpacity style={styles.card} onPress={handlePhotoLibrary} activeOpacity={0.8}>
                <Text style={styles.cardIcon}>🖼️</Text>
                <Text style={styles.cardLabel}>Photo Library</Text>
              </TouchableOpacity>
            </View>

            {/* Safe area spacer */}
            <View style={{ height: Platform.OS === 'ios' ? 24 : 8 }} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1 },
  inner: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  chipText: { fontSize: 13, color: '#374151', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
  photoSection: { marginTop: 12 },
  photoPreview: { width: '100%', height: 200, borderRadius: 10 },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  analyzingText: { color: '#4f46e5', fontSize: 13 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, backgroundColor: '#fff', padding: 8, borderRadius: 8 },
  itemName: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 6, fontSize: 13 },
  itemQty: { width: 60, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 6, fontSize: 13, textAlign: 'center' },
  itemUnit: { fontSize: 13, color: '#6b7280' },
  removeBtn: { color: '#ef4444', fontSize: 16, padding: 4 },
  searchInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, backgroundColor: '#fff', fontSize: 14 },
  foodList: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginTop: 4 },
  foodItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  usdaItem: { backgroundColor: '#f0fdf4' },
  foodName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  foodMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  searchingRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  searchingText: { fontSize: 13, color: '#4f46e5' },
  usdaHeader: { fontSize: 11, fontWeight: '600', color: '#9ca3af', padding: 8, backgroundColor: '#f9fafb' },
  submitBtn: { backgroundColor: '#4f46e5', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabOpen: { backgroundColor: '#374151' },
  fabIcon: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' },

  /* Bottom sheet */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  cardIcon: { fontSize: 32 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
