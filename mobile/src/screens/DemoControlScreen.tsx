import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { simulateCrisis } from '../services/mockApi';
import { useRaastaStore } from '../store/useRaastaStore';
import { MetricPill } from '../components/MetricPill';

const SCENARIOS = [
  { name: 'D-Chowk Protest', desc: 'Civil disruption blocking Constitution Ave, Islamabad', severity: 8 },
  { name: 'GT Road Accident', desc: 'Multi-vehicle accident, Rawalpindi-Islamabad', severity: 6 },
  { name: 'Karachi Flooding', desc: 'Urban flooding in Korangi after heavy rains', severity: 7 },
  { name: 'Mall Road Protest', desc: 'Protest march on Mall Road, Lahore', severity: 5 },
];

interface Props { onNavigate: (screen: string) => void }

export function DemoControlScreen({ onNavigate }: Props) {
  const { isScanning, setScanning, setScanResult, scanResult } = useRaastaStore();
  const [activeScenario, setActiveScenario] = useState<number | null>(null);

  const runScenario = async (i: number) => {
    setActiveScenario(i);
    setScanning(true);
    const result = await simulateCrisis();
    setScanResult(result);
    setScanning(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Demo Control</Text>
      <Text style={styles.sub}>Judge-facing demo panel — one-tap scenario triggers</Text>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>BACKEND</Text>
        <Text style={styles.statusVal}>● Gemini 2.0 Flash (LangGraph)</Text>
      </View>

      <Text style={styles.sectionLabel}>DEMO SCENARIOS</Text>
      {SCENARIOS.map((s, i) => (
        <View key={i} style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <Text style={styles.scenarioName}>{s.name}</Text>
            <View style={[styles.sevBadge, { backgroundColor: s.severity >= 7 ? '#EF444425' : '#F9731625' }]}>
              <Text style={[styles.sevText, { color: s.severity >= 7 ? '#EF4444' : '#F97316' }]}>SEV {s.severity}</Text>
            </View>
          </View>
          <Text style={styles.scenarioDesc}>{s.desc}</Text>
          <PrimaryButton
            label={isScanning && activeScenario === i ? 'Running...' : '▶  Run Scenario'}
            onPress={() => runScenario(i)}
            loading={isScanning && activeScenario === i}
            disabled={isScanning}
            style={styles.runBtn}
          />
        </View>
      ))}

      {scanResult && (
        <>
          <Text style={styles.sectionLabel}>LAST RUN RESULT</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <MetricPill label="Run ID" value={scanResult.runId.slice(-6)} color="#3B82F6" />
              <MetricPill label="Risk →" value={`${scanResult.route.originalRisk}→${scanResult.route.newRisk}`} color="#22C55E" />
              <MetricPill label="Saved" value={`${scanResult.route.delayAvoidedMinutes}m`} color="#22C55E" />
            </View>
            <Text style={styles.ticketId}>{scanResult.ticketId || 'ICT-TRF-2026-044'}</Text>
            <View style={styles.navBtns}>
              <PrimaryButton label="Route Risk" onPress={() => onNavigate('RouteRisk')} style={styles.smallBtn} />
              <PrimaryButton label="Agent Trace" onPress={() => onNavigate('AgentTrace')} variant="outline" style={styles.smallBtn} />
              <PrimaryButton label="Outcome" onPress={() => onNavigate('Outcome')} variant="outline" style={styles.smallBtn} />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: '#F0F0F0', marginBottom: 4 },
  sub: { fontSize: 12, color: '#666666', marginBottom: 16 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#22C55E18', borderRadius: 8, padding: 10, marginBottom: 16 },
  statusLabel: { fontSize: 10, color: '#666666', fontWeight: '700' },
  statusVal: { fontSize: 12, color: '#22C55E', fontWeight: '600' },
  sectionLabel: { fontSize: 10, color: '#666666', fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, marginTop: 4 },
  scenarioCard: { backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 10 },
  scenarioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  scenarioName: { fontSize: 15, fontWeight: '700', color: '#F0F0F0' },
  sevBadge: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  sevText: { fontSize: 10, fontWeight: '700' },
  scenarioDesc: { fontSize: 12, color: '#666666', marginBottom: 10, lineHeight: 17 },
  runBtn: { paddingVertical: 10 },
  resultCard: { backgroundColor: '#141414', borderRadius: 12, padding: 14 },
  resultRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  ticketId: { color: '#F97316', fontSize: 14, fontWeight: '800', fontFamily: 'monospace', marginBottom: 10 },
  navBtns: { flexDirection: 'row', gap: 6 },
  smallBtn: { flex: 1, paddingVertical: 10 },
});
