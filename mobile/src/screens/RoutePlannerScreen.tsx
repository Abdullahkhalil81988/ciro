import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRaastaStore } from '../store/useRaastaStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { RouteCard } from '../components/RouteCard';
import { MapPreview } from '../components/MapPreview';
import { planRoute } from '../services/mockApi';

interface Props { onNavigate: (screen: string) => void }

const PRESETS = [
  { from: 'G-11 Islamabad', to: 'Blue Area Islamabad' },
  { from: 'Saddar Rawalpindi', to: 'Faizabad Islamabad' },
  { from: 'DHA Lahore', to: 'Gulberg Lahore' },
  { from: 'Clifton Karachi', to: 'Saddar Karachi' },
];

export function RoutePlannerScreen({ onNavigate }: Props) {
  const { origin, destination, setOrigin, setDestination, isScanning, setScanning, setScanResult } = useRaastaStore();
  const [hasResult, setHasResult] = useState(false);
  const localResult = useRaastaStore(s => s.scanResult);

  const handlePlan = async () => {
    setScanning(true);
    const result = await planRoute(origin, destination);
    setScanResult(result);
    setScanning(false);
    setHasResult(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Route Planner</Text>
      <Text style={styles.sub}>AI-powered crisis-aware routing</Text>

      <Text style={styles.label}>FROM</Text>
      <TextInput style={styles.input} value={origin} onChangeText={setOrigin} placeholderTextColor="#475569" accessibilityLabel="Origin" />

      <Text style={styles.label}>TO</Text>
      <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholderTextColor="#475569" accessibilityLabel="Destination" />

      <Text style={styles.label}>QUICK PRESETS</Text>
      <View style={styles.presets}>
        {PRESETS.map((p, i) => (
          <PrimaryButton
            key={i} label={`${p.from.split(' ')[0]} → ${p.to.split(' ')[0]}`}
            onPress={() => { setOrigin(p.from); setDestination(p.to); }}
            variant="outline" style={styles.preset}
          />
        ))}
      </View>

      <PrimaryButton label={isScanning ? 'Planning route...' : '🗺  Plan Safe Route'} onPress={handlePlan} loading={isScanning} style={styles.btn} />

      {hasResult && localResult && (
        <>
          <MapPreview showCrisis showAlternate />
          <Text style={styles.sectionTitle}>Route Options</Text>
          <RouteCard route={localResult.route} variant="original" />
          <RouteCard route={localResult.route} variant="recommended" />
          <PrimaryButton label="View Full Analysis →" onPress={() => onNavigate('RouteRisk')} style={{ marginTop: 8 }} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: '#F0F0F0', marginBottom: 4 },
  sub: { fontSize: 13, color: '#666666', marginBottom: 20 },
  label: { fontSize: 10, color: '#666666', fontWeight: '700', letterSpacing: 1.5, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#141414', borderRadius: 10, padding: 14, color: '#F0F0F0', fontSize: 15, borderWidth: 1, borderColor: '#222222' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  preset: { flex: 1, minWidth: '45%', paddingVertical: 10 },
  btn: { marginTop: 4, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888888', marginVertical: 10, letterSpacing: 1 },
});
