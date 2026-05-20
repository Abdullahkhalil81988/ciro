import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRaastaStore } from '../store/useRaastaStore';
import { SafetyScoreRing } from '../components/SafetyScoreRing';
import { ActionLogCard } from '../components/ActionLogCard';
import { MetricPill } from '../components/MetricPill';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props { onNavigate: (screen: string) => void }

export function OutcomeScreen({ onNavigate }: Props) {
  const { scanResult } = useRaastaStore();

  if (!scanResult) return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Run a scan first to see outcome simulation</Text>
      <PrimaryButton label="← Back to Home" onPress={() => onNavigate('Home')} style={{ marginTop: 16 }} />
    </View>
  );

  const { route, crisis, actions, ticketId, usersAlerted } = scanResult;
  const reduction = route.originalRisk - route.newRisk;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Outcome Simulation</Text>
      <Text style={styles.sub}>AI-generated before/after analysis</Text>

      {/* Score comparison */}
      <View style={styles.comparison}>
        <View style={styles.compItem}>
          <SafetyScoreRing score={route.originalRisk} size={100} label="Before" />
          <Text style={styles.compLabel}>WITHOUT RAASTA</Text>
        </View>
        <View style={styles.compArrow}>
          <Text style={styles.arrowBig}>→</Text>
          <Text style={styles.reduction}>-{reduction}</Text>
          <Text style={styles.reductionLabel}>pts safer</Text>
        </View>
        <View style={styles.compItem}>
          <SafetyScoreRing score={route.newRisk} size={100} label="After" />
          <Text style={styles.compLabel}>WITH RAASTA</Text>
        </View>
      </View>

      {/* Key metrics */}
      <View style={styles.metricsRow}>
        <MetricPill label="Time Saved" value={`${route.delayAvoidedMinutes}m`} color="#22C55E" />
        <MetricPill label="Risk Reduced" value={`${reduction} pts`} color="#22C55E" />
        <MetricPill label="Users Alerted" value={`${usersAlerted || 124}`} color="#3B82F6" />
      </View>

      {/* Crisis avoided */}
      <View style={styles.avoided}>
        <Text style={styles.avoidedLabel}>CRISIS AVOIDED</Text>
        <Text style={styles.avoidedType}>{crisis.type.replace('_', ' ').toUpperCase()} · {crisis.location}</Text>
        <Text style={styles.avoidedDetail}>{crisis.summary}</Text>
      </View>

      <ActionLogCard actions={actions} ticketId={ticketId} usersAlerted={usersAlerted} />

      {/* Ticket */}
      {ticketId && (
        <View style={styles.ticketCard}>
          <Text style={styles.ticketLabel}>🎫 AUTHORITY TICKET GENERATED</Text>
          <Text style={styles.ticketId}>{ticketId}</Text>
          <Text style={styles.ticketSub}>Islamabad Capital Territory Traffic Operations</Text>
        </View>
      )}

      <PrimaryButton label="View Agent Trace →" onPress={() => onNavigate('AgentTrace')} variant="outline" style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingTop: 56, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: '#F0F0F0', marginBottom: 2 },
  sub: { fontSize: 12, color: '#666666', marginBottom: 20 },
  comparison: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 8 },
  compItem: { alignItems: 'center' },
  compLabel: { fontSize: 9, color: '#666666', fontWeight: '700', letterSpacing: 1, marginTop: 6 },
  compArrow: { alignItems: 'center', paddingHorizontal: 4 },
  arrowBig: { fontSize: 28, color: '#22C55E' },
  reduction: { fontSize: 20, fontWeight: '900', color: '#22C55E', marginTop: -4 },
  reductionLabel: { fontSize: 9, color: '#666666' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  avoided: { backgroundColor: '#EF444418', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EF444440', marginBottom: 12 },
  avoidedLabel: { fontSize: 9, color: '#EF4444', fontWeight: '700', letterSpacing: 1.5, marginBottom: 3 },
  avoidedType: { fontSize: 14, fontWeight: '700', color: '#FCA5A5', marginBottom: 4 },
  avoidedDetail: { fontSize: 12, color: '#888888', lineHeight: 17 },
  ticketCard: { backgroundColor: '#F9731618', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F9731640', marginTop: 10 },
  ticketLabel: { fontSize: 10, color: '#F97316', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  ticketId: { fontSize: 18, fontWeight: '900', color: '#FDBA74', fontFamily: 'monospace' },
  ticketSub: { fontSize: 11, color: '#888888', marginTop: 2 },
  empty: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#666666', fontSize: 14, textAlign: 'center' },
});
