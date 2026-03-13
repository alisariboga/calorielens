import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar
} from 'react-native';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🥗</Text>
        </View>
        <Text style={styles.appName}>CalorieLens</Text>
        <Text style={styles.tagline}>Your smart nutrition companion</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>I'm new, sign me up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>I have an account, sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '400',
  },
  buttonSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 17,
    fontWeight: '600',
  },
});
