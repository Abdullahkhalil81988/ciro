import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRaastaStore } from '../store/useRaastaStore';
import { AgentStep } from '../components/AgentStep';
import { PrimaryButton } from '../components/PrimaryButton';
import { MetricPill } from '../components/MetricPill';
import { simulateCrisis } from '../services/mockApi';

interface Props { onNavigate: (screen: string) => void }

export function AgentTraceScreen({ onNavigate }: Props) {
  const { scanResult, setScanning, setScanResult, isScanning } = useRaastaStore();

  const handleRerun = async () => {
    setScanning(true);
    const r = await simulateCrisis();
    setScanResult(r);
    setScanning(false);
  };

  if (!scanResult) return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🤖</Text>
      <Text style={styles.emptyTitle}>No trace yet</Text>
      <Text style={styles.emptyText}>Run a crisis scan to see the 7-agent LangGraph pipeline execute in real time.</Text>
      <PrimaryButton label="Run Demo Scan" onPress={handleRerun} loading={isScanning} style={{ marginTop: 20 }} />
    </View>
  );

  const totalMs = scanResult.agentTrace.reduce((s, t) => s + (t.durationMs || 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Agent Pipeline Trace</Text>
      <Text style={styles.runId}>Run ID: {scanResult.runId}</Text>

      <View style={styles.summary}>
        <MetricPill label="Agents" value={`${scanResult.agentTrace.length}`} color="#22C55E" />
        <MetricPill label="Total Time" value={`${totalMs}ms`} color="#3B82F6" />
        <MetricPill label="LLM Engine" value="Gemini" color="#8B5CF6" />
        <MetricPill label="Confidence" value="91%" color="#F59E0B" />
      </View>

      <View style={styles.pipeline}>
        {scanResult.agentTrace.map((step, i) => (
          <AgentStep key={i} step={step} index={i} isLast={i === scanResult.agentTrace.length - 1} />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="View Outcome →" onPress={() => onNavigate('Outcome')} />
        <PrimaryButton label="Re-run Pipeline" onPress={handleRerun} loading={isScanning} variant="outline" style={{ marginTop: 8 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800', color: '#F0F0F0', marginBottom: 2 },
  runId: { fontSize: 11, color: '#475569', fontFamily: 'monospace', marginBottom: 16 },
  summary: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  pipeline: { backgroundColor: '#141414', borderRadius: 12, padding: 16, marginBottom: 16 },
  footer: {},
  empty: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#F0F0F0', marginBottom: 8 },
  emptyText: { fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: 19 },
});
