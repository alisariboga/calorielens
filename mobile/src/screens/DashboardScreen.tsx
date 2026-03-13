import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, RefreshControl, Modal, Platform, ActivityIndicator, Pressable
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useFocusEffect } from '@react-navigation/native';
import { summaryApi, debtApi, mealApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { DailySummary, WeeklySummary, DebtStatus } from '../types/shared-types';

const today = () => new Date().toISOString().split('T')[0];

function formatDate(date: string) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function DashboardScreen({ navigation }: any) {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(today());
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [debtStatus, setDebtStatus] = useState<DebtStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [scanning, setScanning] = useState(false);

  const loadData = useCallback(async (date: string) => {
    try {
      const [daily, weekly, debt] = await Promise.all([
        summaryApi.getByDate(date),
        summaryApi.getWeek(),
        debtApi.getStatus(),
      ]);
      setDailySummary(daily);
      setWeeklySummary(weekly);
      setDebtStatus(debt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(selectedDate); }, [selectedDate]));

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split('T')[0];
    if (newDate <= today()) setSelectedDate(newDate);
  };

  const handleDeleteMeal = (mealId: string) => {
    Alert.alert('Delete Meal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await mealApi.delete(mealId);
          loadData(selectedDate);
        }
      }
    ]);
  };

  const analyzeAndNavigate = async (uri: string) => {
    setScanning(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri, [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const detected = await mealApi.analyzePhoto(manipulated.base64!, 'image/jpeg');
      const initialItems = detected.detectedFoods.map(f => ({
        name: f.name, quantityG: f.suggestedQuantityG,
        caloriesPer100g: f.caloriesPer100g, proteinPer100g: f.proteinPer100g,
        carbsPer100g: f.carbsPer100g, fatPer100g: f.fatPer100g,
      }));
      if (initialItems.length === 0) Alert.alert('No food detected', 'Try again or add manually');
      navigation.navigate('LogMeal', { date: selectedDate, initialItems, initialPhotoUri: uri });
    } catch (err: any) {
      Alert.alert('Analysis failed', err?.response?.data?.error || err?.message || 'Please try again');
    } finally {
      setScanning(false);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    await analyzeAndNavigate(result.assets[0].uri);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow photo library access'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    await analyzeAndNavigate(result.assets[0].uri);
  };

  const handleScanFood = () => {
    setShowSheet(false);
    // animationType="none" so modal is already gone; small delay for React to flush
    setTimeout(() => {
      Alert.alert('Add Food Photo', 'Choose a source', [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }, 50);
  };

  if (loading || !dailySummary || !profile) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  const isToday = selectedDate === today();
  const percentConsumed = Math.min(100, (dailySummary.consumedCalories / dailySummary.targetCalories) * 100);

  return (
    <View style={styles.screen}>
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(selectedDate); }} />}>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateBtn}>
          <Text style={styles.dateBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {isToday && <Text style={styles.todayLabel}>Today</Text>}
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} style={[styles.dateBtn, isToday && styles.dateBtnDisabled]} disabled={isToday}>
          <Text style={[styles.dateBtnText, isToday && { color: '#d1d5db' }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Macro Cards */}
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Target</Text>
          <Text style={styles.cardValue}>{dailySummary.targetCalories}</Text>
          {dailySummary.debtPayback > 0 && <Text style={styles.debtNote}>-{dailySummary.debtPayback} debt</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Consumed</Text>
          <Text style={styles.cardValue}>{dailySummary.consumedCalories}</Text>
          <Text style={styles.cardSub}>{percentConsumed.toFixed(0)}%</Text>
        </View>
        <View style={[styles.card, dailySummary.remainingCalories < 0 && styles.cardDanger]}>
          <Text style={styles.cardLabel}>Remaining</Text>
          <Text style={[styles.cardValue, dailySummary.remainingCalories < 0 ? { color: '#dc2626' } : { color: '#16a34a' }]}>
            {dailySummary.remainingCalories}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Protein</Text>
          <Text style={styles.cardValue}>{dailySummary.protein}g</Text>
          <Text style={styles.cardSub}>C:{dailySummary.carbs}g F:{dailySummary.fat}g</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${percentConsumed}%` as any }]} />
        </View>
      </View>

      {/* Debt Status */}
      {debtStatus && debtStatus.totalRemaining > 0 && (
        <TouchableOpacity style={styles.debtBanner} onPress={() => navigation.navigate('Debt')}>
          <Text style={styles.debtBannerTitle}>Active Calorie Debt</Text>
          <Text style={styles.debtBannerSub}>
            {debtStatus.totalRemaining} cal remaining · Today: -{debtStatus.todayPayback} cal
          </Text>
          <Text style={styles.debtBannerLink}>Manage →</Text>
        </TouchableOpacity>
      )}

      {/* Meals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{isToday ? "Today's Meals" : `Meals — ${formatDate(selectedDate)}`}</Text>
          <TouchableOpacity style={styles.addBtn}
            onPress={() => navigation.navigate('LogMeal', { date: selectedDate })}>
            <Text style={styles.addBtnText}>+ Log Meal</Text>
          </TouchableOpacity>
        </View>

        {dailySummary.meals.length === 0 ? (
          <Text style={styles.emptyText}>No meals logged yet</Text>
        ) : (
          dailySummary.meals.map((meal) => {
            const totalCal = meal.items.reduce((s, i) => s + i.calories, 0);
            return (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View>
                    <Text style={styles.mealType}>{meal.mealType}</Text>
                    <Text style={styles.mealTime}>
                      {new Date(meal.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.mealActions}>
                    <Text style={styles.mealCal}>{Math.round(totalCal)} cal</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('EditMeal', { mealId: meal.id })}>
                      <Text style={styles.editBtn}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)}>
                      <Text style={styles.deleteBtn}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {meal.items.map((item, idx) => (
                  <Text key={idx} style={styles.mealItem}>• {item.name} ({item.quantityG}g)</Text>
                ))}
              </View>
            );
          })
        )}
      </View>

      {/* Weekly Summary */}
      {weeklySummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          {weeklySummary.days.map((day) => {
            const pct = day.targetCalories > 0 ? Math.min(100, (day.consumedCalories / day.targetCalories) * 100) : 0;
            const isSelected = day.date === selectedDate;
            return (
              <TouchableOpacity key={day.date} onPress={() => setSelectedDate(day.date)}>
                <View style={[styles.weekDay, isSelected && styles.weekDaySelected]}>
                  <Text style={[styles.weekDayLabel, isSelected && { color: '#4f46e5', fontWeight: '700' }]}>
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </Text>
                  <View style={styles.weekBar}>
                    <View style={[styles.weekBarFill, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={styles.weekCal}>{day.consumedCalories}/{day.targetCalories}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Bottom padding for FAB */}
      <View style={{ height: 80 }} />
    </ScrollView>

    {/* Floating Action Button */}
    <TouchableOpacity
      style={[styles.fab, showSheet && styles.fabOpen]}
      onPress={() => setShowSheet(v => !v)}
      activeOpacity={0.85}
    >
      <Text style={styles.fabIcon}>{showSheet ? '✕' : '+'}</Text>
    </TouchableOpacity>

    {/* Scanning overlay */}
    {scanning && (
      <View style={styles.scanOverlay}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.scanOverlayText}>Analyzing food...</Text>
      </View>
    )}

    {/* Bottom Sheet */}
    <Modal
      visible={showSheet}
      transparent
      animationType="none"
      onRequestClose={() => setShowSheet(false)}
    >
      <Pressable style={styles.modalRoot} onPress={() => setShowSheet(false)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Quick Add</Text>
          <View style={styles.cardGrid}>
            <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]} onPress={handleScanFood}>
              <Text style={styles.actionCardIcon}>📷</Text>
              <Text style={styles.actionCardLabel}>Scan Food</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => { setShowSheet(false); navigation.navigate('LogMeal', { date: selectedDate }); }}>
              <Text style={styles.actionCardIcon}>🔍</Text>
              <Text style={styles.actionCardLabel}>Food Database</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => { setShowSheet(false); Alert.alert('Coming Soon', 'Log Exercise will be available soon!'); }}>
              <Text style={styles.actionCardIcon}>🏋️</Text>
              <Text style={styles.actionCardLabel}>Log Exercise</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => { setShowSheet(false); navigation.navigate('SavedFoods', { date: selectedDate }); }}>
              <Text style={styles.actionCardIcon}>🔖</Text>
              <Text style={styles.actionCardLabel}>Saved Foods</Text>
            </Pressable>
          </View>
          <View style={{ height: Platform.OS === 'ios' ? 24 : 8 }} />
        </Pressable>
      </Pressable>
    </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dateNav: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  dateBtn: { padding: 8 },
  dateBtnDisabled: { opacity: 0.3 },
  dateBtnText: { fontSize: 20, color: '#4f46e5' },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  todayLabel: { fontSize: 12, color: '#4f46e5' },
  cards: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8 },
  card: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardDanger: { borderWidth: 2, borderColor: '#fca5a5' },
  cardLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  cardSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  debtNote: { fontSize: 11, color: '#ea580c', marginTop: 2 },
  progressContainer: { paddingHorizontal: 16, marginBottom: 8 },
  progressBg: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#4f46e5', borderRadius: 3 },
  debtBanner: { margin: 16, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12, padding: 16 },
  debtBannerTitle: { fontWeight: '600', color: '#9a3412' },
  debtBannerSub: { fontSize: 13, color: '#c2410c', marginTop: 4 },
  debtBannerLink: { fontSize: 13, color: '#4f46e5', marginTop: 8 },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  addBtn: { backgroundColor: '#4f46e5', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyText: { color: '#9ca3af', textAlign: 'center', paddingVertical: 24 },
  mealCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  mealType: { fontWeight: '600', color: '#111827', textTransform: 'capitalize' },
  mealTime: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  mealActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealCal: { fontWeight: 'bold', color: '#111827' },
  editBtn: { fontSize: 12, color: '#4f46e5' },
  deleteBtn: { fontSize: 12, color: '#ef4444' },
  mealItem: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  weekDay: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  weekDaySelected: { backgroundColor: '#eef2ff', borderRadius: 8, paddingHorizontal: 8 },
  weekDayLabel: { width: 60, fontSize: 12, color: '#6b7280' },
  weekBar: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  weekBarFill: { height: 8, backgroundColor: '#4f46e5', borderRadius: 4 },
  weekCal: { fontSize: 11, color: '#9ca3af', width: 80, textAlign: 'right' },

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
  modalRoot: {
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
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardPressed: { backgroundColor: '#e5e7eb' },
  actionCardIcon: { fontSize: 32, marginBottom: 8 },
  actionCardLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },

  /* Scanning overlay */
  scanOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  scanOverlayText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
