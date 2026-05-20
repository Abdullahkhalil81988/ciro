import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Incident } from '../types';

interface Props { incident: Incident }

const TYPE_LABELS: Record<string, string> = {
  civil_disruption: '🚧 Civil Disruption',
  road_blockage: '🛑 Road Blockage',
  flood: '🌊 Flood',
  accident: '💥 Accident',
  vip_movement: '🚨 VIP Movement',
  infrastructure_failure: '⚠️ Infrastructure',
  normal_traffic: '✅ Normal',
};

const STATUS_COLOR: Record<string, string> = {
  active: '#EF4444', monitoring: '#F97316', resolved: '#22C55E',
};

export function IncidentCard({ incident }: Props) {
  const severityColor = incident.severity >= 7 ? '#EF4444' : incident.severity >= 5 ? '#F97316' : '#22C55E';
  const statusColor = STATUS_COLOR[incident.status] || '#888888';

  return (
    <View style={styles.card} accessibilityRole="button" accessibilityLabel={`${incident.type} incident at ${incident.location}`}>
      <View style={styles.header}>
        <Text style={styles.type}>{TYPE_LABELS[incident.type] || incident.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor, borderWidth: 1 }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{incident.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.location}>📍 {incident.location}</Text>
      <Text style={styles.summary}>{incident.summary}</Text>
      <View style={styles.footer}>
        <View style={[styles.sevBadge, { backgroundColor: severityColor + '22' }]}>
          <Text style={[styles.sevText, { color: severityColor }]}>SEV {incident.severity}/10</Text>
        </View>
        <Text style={styles.conf}>{Math.round(incident.confidence * 100)}% confidence</Text>
        <Text style={styles.time}>{formatAge(incident.timestamp)}</Text>
      </View>
    </View>
  );
}

function formatAge(ts: string): string {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  type: { fontSize: 14, fontWeight: '700', color: '#F0F0F0' },
  statusBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  location: { fontSize: 12, color: '#888888', marginBottom: 4 },
  summary: { fontSize: 13, color: '#CCCCCC', lineHeight: 18, marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sevBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  sevText: { fontSize: 10, fontWeight: '700' },
  conf: { fontSize: 10, color: '#666666' },
  time: { fontSize: 10, color: '#666666', marginLeft: 'auto' },
});
