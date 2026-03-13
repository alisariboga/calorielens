import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  TextInput, ScrollView, Alert, ActivityIndicator, StatusBar
} from 'react-native';
import { profileApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

type ActivityLevel = 'light' | 'moderate' | 'very_active';
type WeightUnit = 'kg' | 'lbs' | 'st_lbs';
type HeightUnit = 'cm' | 'ft_in';
type Goal = 'lose' | 'maintain' | 'gain';

const ACTIVITY_OPTIONS = [
  {
    value: 'light' as ActivityLevel,
    label: 'Light',
    icon: '🪑',
    desc: 'Jobs with long periods of sitting',
  },
  {
    value: 'moderate' as ActivityLevel,
    label: 'Moderate',
    icon: '🚶',
    desc: 'On your feet most of day',
  },
  {
    value: 'very_active' as ActivityLevel,
    label: 'Heavy',
    icon: '🏋️',
    desc: 'Manual work with lifting and walking',
  },
];

const GOAL_OPTIONS = [
  { value: 'lose' as Goal, label: 'Lose Weight', icon: '📉' },
  { value: 'maintain' as Goal, label: 'Stay the Same', icon: '⚖️' },
  { value: 'gain' as Goal, label: 'Gain Weight', icon: '📈' },
];

export default function OnboardingScreen() {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 – Gender
  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  // Step 2 – Age
  const [age, setAge] = useState('');
  // Step 3 – Weight
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weightSt, setWeightSt] = useState('');
  // Step 4 – Height
  const [heightVal, setHeightVal] = useState('');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  // Step 5 – Activity
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  // Step 6 – Goal
  const [goal, setGoal] = useState<Goal | null>(null);
  // Step 7 – Target weight
  const [targetWeightKg, setTargetWeightKg] = useState<number | null>(null);
  // Step 8 – Weekly rate
  const [weeklyRate, setWeeklyRate] = useState<number | null>(null);

  const totalSteps = goal === 'maintain' ? 6 : 8;
  const progressPercent = Math.min((step / totalSteps) * 100, 100);

  /* ── Unit conversion helpers ── */
  const getCurrentWeightKg = (): number => {
    if (weightUnit === 'kg') return parseFloat(weightValue) || 0;
    if (weightUnit === 'lbs') return (parseFloat(weightValue) || 0) * 0.453592;
    return ((parseFloat(weightSt) || 0) * 6.35029) + ((parseFloat(weightValue) || 0) * 0.453592);
  };

  const getHeightCm = (): number => {
    if (heightUnit === 'cm') return parseFloat(heightVal) || 0;
    return ((parseFloat(heightFt) || 0) * 30.48) + ((parseFloat(heightIn) || 0) * 2.54);
  };

  /* ── Target weight options ── */
  const generateTargetOptions = (): number[] => {
    const cur = Math.round(getCurrentWeightKg());
    const opts: number[] = [];
    if (goal === 'lose') {
      const min = Math.max(30, cur - 60);
      for (let w = cur - 5; w >= min; w -= 5) opts.push(w);
    } else if (goal === 'gain') {
      const max = Math.min(300, cur + 60);
      for (let w = cur + 5; w <= max; w += 5) opts.push(w);
    }
    return opts;
  };

  const weeklyRateOptions = goal === 'gain'
    ? [
        { value: 0.25, label: '0.25 kg / week', sub: '½ lb · Gradual' },
        { value: 0.5, label: '0.5 kg / week', sub: '1 lb · Recommended' },
      ]
    : [
        { value: 0.25, label: '0.25 kg / week', sub: '½ lb · Gradual' },
        { value: 0.5, label: '0.5 kg / week', sub: '1 lb · Recommended' },
        { value: 0.75, label: '0.75 kg / week', sub: '1½ lbs · Fast' },
        { value: 1.0, label: '1.0 kg / week', sub: '2 lbs · Aggressive' },
      ];

  /* ── Validation ── */
  const canContinue = (): boolean => {
    switch (step) {
      case 1: return sex !== null;
      case 2: return !!age && parseInt(age) >= 13 && parseInt(age) <= 120;
      case 3:
        if (weightUnit === 'st_lbs') return !!weightSt && !!weightValue;
        return !!weightValue && parseFloat(weightValue) > 0;
      case 4:
        if (heightUnit === 'ft_in') return !!heightFt && parseFloat(heightFt) > 0;
        return !!heightVal && parseFloat(heightVal) > 0;
      case 5: return activity !== null;
      case 6: return goal !== null;
      case 7: return targetWeightKg !== null;
      case 8: return weeklyRate !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 6 && goal === 'maintain') { handleSubmit(); return; }
    if (step === totalSteps) { handleSubmit(); return; }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  /* ── Submit ── */
  const handleSubmit = async () => {
    const weightKg = getCurrentWeightKg();
    const heightCm = getHeightCm();

    // goalRateKgPerWeek: positive = lose, 0 = maintain, negative = gain
    let goalRate = 0;
    if (goal === 'lose') goalRate = weeklyRate ?? 0.5;
    if (goal === 'gain') goalRate = -(weeklyRate ?? 0.25);

    setLoading(true);
    try {
      await profileApi.create({
        sex: sex!,
        age: parseInt(age),
        heightCm: Math.round(heightCm),
        weightKg: Math.round(weightKg * 10) / 10,
        activityLevel: activity!,
        goalRateKgPerWeek: goalRate,
      });
      await refreshProfile();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step content ── */
  const renderStep = () => {
    switch (step) {

      /* STEP 1 – Gender */
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your{'\n'}biological sex?</Text>
            <Text style={styles.stepSub}>Used for accurate calorie calculations</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderCard, sex === 'male' && styles.cardActive]}
                onPress={() => setSex('male')}
              >
                <Text style={styles.cardIcon}>🙋‍♂️</Text>
                <Text style={[styles.cardLabel, sex === 'male' && styles.cardLabelActive]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderCard, sex === 'female' && styles.cardActive]}
                onPress={() => setSex('female')}
              >
                <Text style={styles.cardIcon}>🙋‍♀️</Text>
                <Text style={[styles.cardLabel, sex === 'female' && styles.cardLabelActive]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      /* STEP 2 – Age */
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How old are you?</Text>
            <View style={styles.bigInputRow}>
              <TextInput
                style={styles.bigInput}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="25"
                maxLength={3}
                autoFocus
              />
              <Text style={styles.bigInputUnit}>years</Text>
            </View>
          </View>
        );

      /* STEP 3 – Weight */
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your{'\n'}current weight?</Text>
            <View style={styles.unitRow}>
              {(['kg', 'lbs', 'st_lbs'] as WeightUnit[]).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitBtn, weightUnit === u && styles.unitBtnActive]}
                  onPress={() => setWeightUnit(u)}
                >
                  <Text style={[styles.unitBtnText, weightUnit === u && styles.unitBtnTextActive]}>
                    {u === 'st_lbs' ? 'st & lbs' : u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {weightUnit === 'st_lbs' ? (
              <View style={styles.doubleRow}>
                <View style={styles.doubleInputWrap}>
                  <TextInput
                    style={styles.bigInput}
                    value={weightSt}
                    onChangeText={setWeightSt}
                    keyboardType="number-pad"
                    placeholder="12"
                    maxLength={3}
                    autoFocus
                  />
                  <Text style={styles.bigInputUnit}>st</Text>
                </View>
                <View style={styles.doubleInputWrap}>
                  <TextInput
                    style={styles.bigInput}
                    value={weightValue}
                    onChangeText={setWeightValue}
                    keyboardType="number-pad"
                    placeholder="7"
                    maxLength={2}
                  />
                  <Text style={styles.bigInputUnit}>lbs</Text>
                </View>
              </View>
            ) : (
              <View style={styles.bigInputRow}>
                <TextInput
                  style={styles.bigInput}
                  value={weightValue}
                  onChangeText={setWeightValue}
                  keyboardType="decimal-pad"
                  placeholder={weightUnit === 'kg' ? '70' : '154'}
                  autoFocus
                />
                <Text style={styles.bigInputUnit}>{weightUnit}</Text>
              </View>
            )}
          </View>
        );

      /* STEP 4 – Height */
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How tall are you?</Text>
            <View style={styles.unitRow}>
              {(['cm', 'ft_in'] as HeightUnit[]).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitBtn, heightUnit === u && styles.unitBtnActive]}
                  onPress={() => setHeightUnit(u)}
                >
                  <Text style={[styles.unitBtnText, heightUnit === u && styles.unitBtnTextActive]}>
                    {u === 'ft_in' ? 'ft & in' : 'cm'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {heightUnit === 'ft_in' ? (
              <View style={styles.doubleRow}>
                <View style={styles.doubleInputWrap}>
                  <TextInput
                    style={styles.bigInput}
                    value={heightFt}
                    onChangeText={setHeightFt}
                    keyboardType="number-pad"
                    placeholder="5"
                    maxLength={1}
                    autoFocus
                  />
                  <Text style={styles.bigInputUnit}>ft</Text>
                </View>
                <View style={styles.doubleInputWrap}>
                  <TextInput
                    style={styles.bigInput}
                    value={heightIn}
                    onChangeText={setHeightIn}
                    keyboardType="number-pad"
                    placeholder="9"
                    maxLength={2}
                  />
                  <Text style={styles.bigInputUnit}>in</Text>
                </View>
              </View>
            ) : (
              <View style={styles.bigInputRow}>
                <TextInput
                  style={styles.bigInput}
                  value={heightVal}
                  onChangeText={setHeightVal}
                  keyboardType="decimal-pad"
                  placeholder="175"
                  autoFocus
                />
                <Text style={styles.bigInputUnit}>cm</Text>
              </View>
            )}
          </View>
        );

      /* STEP 5 – Activity */
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your{'\n'}activity level?</Text>
            <Text style={styles.stepSub}>Based on your typical working day</Text>
            <View style={styles.listGap}>
              {ACTIVITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.listCard, activity === opt.value && styles.cardActive]}
                  onPress={() => setActivity(opt.value)}
                >
                  <Text style={styles.listCardIcon}>{opt.icon}</Text>
                  <View style={styles.listCardText}>
                    <Text style={[styles.listCardLabel, activity === opt.value && styles.cardLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.listCardSub, activity === opt.value && styles.cardSubActive]}>
                      {opt.desc}
                    </Text>
                  </View>
                  {activity === opt.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      /* STEP 6 – Goal */
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your goal?</Text>
            <View style={styles.listGap}>
              {GOAL_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.listCard, goal === opt.value && styles.cardActive]}
                  onPress={() => setGoal(opt.value)}
                >
                  <Text style={styles.listCardIcon}>{opt.icon}</Text>
                  <Text style={[styles.listCardLabel, goal === opt.value && styles.cardLabelActive]}>
                    {opt.label}
                  </Text>
                  {goal === opt.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      /* STEP 7 – Target weight */
      case 7: {
        const currentKg = Math.round(getCurrentWeightKg());
        const targets = generateTargetOptions();
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your{'\n'}target weight?</Text>
            <Text style={styles.stepSub}>Current weight: {currentKg} kg</Text>
            <ScrollView
              style={styles.targetList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {targets.map(w => (
                <TouchableOpacity
                  key={w}
                  style={[styles.targetItem, targetWeightKg === w && styles.targetItemActive]}
                  onPress={() => setTargetWeightKg(w)}
                >
                  <Text style={[styles.targetItemText, targetWeightKg === w && styles.targetItemTextActive]}>
                    {w} kg
                  </Text>
                  {targetWeightKg === w && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
      }

      /* STEP 8 – Weekly rate */
      case 8:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              How fast do you want to{'\n'}{goal === 'gain' ? 'gain' : 'lose'} weight?
            </Text>
            <View style={styles.listGap}>
              {weeklyRateOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.listCard, weeklyRate === opt.value && styles.cardActive]}
                  onPress={() => setWeeklyRate(opt.value)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listCardLabel, weeklyRate === opt.value && styles.cardLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.listCardSub, weeklyRate === opt.value && styles.cardSubActive]}>
                      {opt.sub}
                    </Text>
                  </View>
                  {weeklyRate === opt.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const isLastStep = step === totalSteps || (step === 6 && goal === 'maintain');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header: back + progress */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, step === 1 && styles.backBtnHidden]}
          onPress={handleBack}
          disabled={step === 1}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]} />
        </View>
        <Text style={styles.stepCount}>{step} / {totalSteps}</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, (!canContinue() || loading) && styles.continueBtnDisabled]}
          onPress={handleNext}
          disabled={!canContinue() || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.continueBtnText}>{isLastStep ? "Let's Go! 🚀" : 'Continue'}</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const INDIGO = '#4f46e5';
const INDIGO_LIGHT = '#ede9fe';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnHidden: { opacity: 0 },
  backBtnText: { fontSize: 24, color: '#374151', lineHeight: 28 },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: INDIGO, borderRadius: 3 },
  stepCount: { fontSize: 13, color: '#9ca3af', fontWeight: '500', minWidth: 36, textAlign: 'right' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 8 },

  /* Step generic */
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 36,
    marginBottom: 8,
  },
  stepSub: {
    fontSize: 15,
    color: '#9ca3af',
    marginBottom: 28,
  },

  /* Gender cards */
  genderRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  genderCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: { fontSize: 40 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  cardActive: { borderColor: INDIGO, backgroundColor: INDIGO_LIGHT },
  cardLabelActive: { color: INDIGO },

  /* Big number input */
  bigInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 32,
    justifyContent: 'center',
  },
  bigInput: {
    fontSize: 56,
    fontWeight: '700',
    color: '#111827',
    borderBottomWidth: 3,
    borderBottomColor: INDIGO,
    paddingBottom: 4,
    minWidth: 120,
    textAlign: 'center',
  },
  bigInputUnit: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: '500',
    paddingBottom: 10,
  },

  /* Unit toggle */
  unitRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
    marginTop: 8,
  },
  unitBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  unitBtnActive: { borderColor: INDIGO, backgroundColor: INDIGO_LIGHT },
  unitBtnText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  unitBtnTextActive: { color: INDIGO },

  /* Double input (st&lbs, ft&in) */
  doubleRow: { flexDirection: 'row', gap: 20, marginTop: 8, justifyContent: 'center' },
  doubleInputWrap: { alignItems: 'center', flex: 1 },

  /* List cards (activity, goal, rate) */
  listGap: { gap: 10, marginTop: 16 },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 16,
    gap: 14,
  },
  listCardIcon: { fontSize: 26 },
  listCardText: { flex: 1 },
  listCardLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  listCardSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  cardSubActive: { color: '#a5b4fc' },
  checkmark: { fontSize: 18, color: INDIGO, fontWeight: '700' },

  /* Target weight list */
  targetList: { maxHeight: 320, marginTop: 16 },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  targetItemActive: { borderColor: INDIGO, backgroundColor: INDIGO_LIGHT },
  targetItemText: { fontSize: 18, fontWeight: '600', color: '#374151' },
  targetItemTextActive: { color: INDIGO },

  /* Footer */
  footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  continueBtn: {
    backgroundColor: INDIGO,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: INDIGO,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  continueBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  continueBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
