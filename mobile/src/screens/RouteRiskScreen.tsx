import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRaastaStore } from '../store/useRaastaStore';
import { SafetyScoreRing } from '../components/SafetyScoreRing';
import { RouteCard } from '../components/RouteCard';
import { MapPreview } from '../components/MapPreview';
import { PrimaryButton } from '../components/PrimaryButton';
import { MetricPill } from '../components/MetricPill';

interface Props { onNavigate: (screen: string) => void }

export function RouteRiskScreen({ onNavigate }: Props) {
  const { scanResult } = useRaastaStore();

  if (!scanResult) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No scan result yet</Text>
        <PrimaryButton label="Go to Home" onPress={() => onNavigate('Home')} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const { crisis, route } = scanResult;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Route Risk Analysis</Text>

      {/* Risk comparison rings */}
      <View style={styles.rings}>
        <SafetyScoreRing score={route.originalRisk} size={110} label="Original Risk" />
        <View style={styles.arrow}><Text style={styles.arrowText}>→</Text><Text style={styles.saved}>-{route.originalRisk - route.newRisk} pts</Text></View>
        <SafetyScoreRing score={route.newRisk} size={110} label="Raasta Route" />
      </View>

      {/* Crisis info */}
      <View style={styles.crisisBox}>
        <Text style={styles.crisisLabel}>⚠️ DETECTED CRISIS</Text>
        <Text style={styles.crisisType}>{crisis.type.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.crisisLocation}>📍 {crisis.location}</Text>
        <Text style={styles.crisisSummary}>{crisis.summary}</Text>
        <View style={styles.crisisMetrics}>
          <MetricPill label="Severity" value={`${crisis.severity}/10`} color="#EF4444" />
          <MetricPill label="Confidence" value={`${Math.round(crisis.confidence * 100)}%`} color="#F97316" />
          <MetricPill label="Saved" value={`${route.delayAvoidedMinutes}m`} color="#22C55E" />
        </View>
      </View>

      <MapPreview showCrisis showAlternate />

      <RouteCard route={route} variant="original" />
      <RouteCard route={route} variant="recommended" />

      <PrimaryButton label="View Agent Trace →" onPress={() => onNavigate('AgentTrace')} variant="outline" style={{ marginTop: 4, marginBottom: 8 }} />
      <PrimaryButton label="View Outcome Simulation →" onPress={() => onNavigate('Outcome')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800', color: '#F0F0F0', marginBottom: 20 },
  rings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 12 },
  arrow: { alignItems: 'center' },
  arrowText: { fontSize: 24, color: '#222222' },
  saved: { fontSize: 12, color: '#22C55E', fontWeight: '700' },
  crisisBox: { backgroundColor: '#EF444418', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#EF444455', marginBottom: 14 },
  crisisLabel: { fontSize: 10, color: '#EF4444', fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  crisisType: { fontSize: 16, fontWeight: '800', color: '#FCA5A5', marginBottom: 4 },
  crisisLocation: { fontSize: 12, color: '#888888', marginBottom: 6 },
  crisisSummary: { fontSize: 13, color: '#CCCCCC', lineHeight: 18, marginBottom: 10 },
  crisisMetrics: { flexDirection: 'row', gap: 8 },
  empty: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666666', fontSize: 16 },
});
