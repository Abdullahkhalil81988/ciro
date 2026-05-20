import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRaastaStore } from '../store/useRaastaStore';
import { getIncidents } from '../services/mockApi';
import { Incident } from '../types';

function BackHeader({ onNavigate }: { onNavigate?: (s: string) => void }) {
  if (!onNavigate) return null;
  return (
    <TouchableOpacity style={bh.btn} onPress={() => onNavigate('Home')} activeOpacity={0.7}>
      <Text style={bh.arrow}>←</Text>
      <Text style={bh.label}>Home</Text>
    </TouchableOpacity>
  );
}

const bh = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 8 },
  arrow: { fontSize: 18, color: '#E83A2C', lineHeight: 22 },
  label: { fontSize: 14, color: '#E83A2C', fontWeight: '700' },
});

const TYPE_ICON: Record<string, string> = {
  civil_disruption: '👥', civil: '👥', flood: '🌊', fire: '🔥',
  road_blockage: '🚧', medical: '🏥', cyber: '💻', industrial: '🏭',
  heatwave: '☀️', unknown: '⚠️',
};

const SEV_COLOR = (s: number) => s >= 8 ? '#E83A2C' : s >= 5 ? '#F2C744' : '#4ade80';

function IncidentModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={md.overlay}>
        <View style={md.sheet}>
          <View style={md.header}>
            <Text style={md.icon}>{TYPE_ICON[incident.type] ?? '⚠️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={md.type}>{incident.type.replace(/_/g, ' ').toUpperCase()}</Text>
              <Text style={md.loc}>📍 {incident.location}</Text>
            </View>
            <View style={[md.sevBadge, { borderColor: SEV_COLOR(incident.severity) }]}>
              <Text style={[md.sevText, { color: SEV_COLOR(incident.severity) }]}>SEV {incident.severity}</Text>
            </View>
          </View>

          <View style={md.divider} />

          <Text style={md.label}>SUMMARY</Text>
          <Text style={md.summary}>{incident.summary}</Text>

          <View style={md.pills}>
            <View style={md.pill}>
              <Text style={md.pillLabel}>Confidence</Text>
              <Text style={md.pillVal}>{Math.round((incident.confidence ?? 0.8) * 100)}%</Text>
            </View>
            <View style={md.pill}>
              <Text style={md.pillLabel}>Status</Text>
              <Text style={[md.pillVal, { color: incident.status === 'active' ? '#E83A2C' : '#4ade80' }]}>
                {incident.status?.toUpperCase() ?? 'ACTIVE'}
              </Text>
            </View>
            <View style={md.pill}>
              <Text style={md.pillLabel}>Detected</Text>
              <Text style={md.pillVal}>{new Date(incident.timestamp).toLocaleTimeString()}</Text>
            </View>
          </View>

          <TouchableOpacity style={md.closeBtn} onPress={onClose}>
            <Text style={md.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function IncidentRow({ incident, onPress }: { incident: Incident; onPress: () => void }) {
  const color = SEV_COLOR(incident.severity);
  return (
    <TouchableOpacity style={row.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[row.sevBar, { backgroundColor: color }]} />
      <View style={row.body}>
        <View style={row.top}>
          <Text style={row.icon}>{TYPE_ICON[incident.type] ?? '⚠️'}</Text>
          <Text style={row.type}>{incident.type.replace(/_/g, ' ').toUpperCase()}</Text>
          <View style={[row.badge, { borderColor: color }]}>
            <Text style={[row.badgeTxt, { color }]}>S{incident.severity}</Text>
          </View>
        </View>
        <Text style={row.loc}>📍 {incident.location}</Text>
        <Text style={row.summary} numberOfLines={2}>{incident.summary}</Text>
        <Text style={row.time}>{new Date(incident.timestamp).toLocaleTimeString()} · Tap for details →</Text>
      </View>
    </TouchableOpacity>
  );
}

export function IncidentFeedScreen({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { incidents, isLoadingIncidents, setIncidents, setLoadingIncidents } = useRaastaStore();
  const [selected, setSelected] = useState<Incident | null>(null);

  const load = async () => {
    setLoadingIncidents(true);
    const data = await getIncidents();
    setIncidents(Array.isArray(data) ? data : []);
    setLoadingIncidents(false);
  };

  useEffect(() => { load(); }, []);

  const sorted = [...(Array.isArray(incidents) ? incidents : [])].sort((a, b) => b.severity - a.severity);

  return (
    <View style={styles.container}>
      {selected && <IncidentModal incident={selected} onClose={() => setSelected(null)} />}

      <BackHeader onNavigate={onNavigate} />
      <Text style={styles.title}>Live Incidents</Text>
      <Text style={styles.sub}>{sorted.length} active across Pakistan</Text>

      {isLoadingIncidents ? (
        <ActivityIndicator color="#E83A2C" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <IncidentRow incident={item} onPress={() => setSelected(item)} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isLoadingIncidents} onRefresh={load} tintColor="#E83A2C" />}
          ListEmptyComponent={<Text style={styles.empty}>No incidents. All clear ✓</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 16, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: '#F0F0F0', marginBottom: 2 },
  sub: { fontSize: 12, color: '#666', marginBottom: 14 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 15 },
});

const row = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#141414', borderRadius: 10, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  sevBar: { width: 4 },
  body: { flex: 1, padding: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  icon: { fontSize: 16 },
  type: { flex: 1, fontSize: 11, fontWeight: '700', color: '#CCCCCC', letterSpacing: 1 },
  badge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: '700' },
  loc: { fontSize: 12, color: '#888', marginBottom: 4 },
  summary: { fontSize: 13, color: '#CCCCCC', lineHeight: 18, marginBottom: 4 },
  time: { fontSize: 10, color: '#555' },
});

const md = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#141414', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  icon: { fontSize: 32 },
  type: { fontSize: 14, fontWeight: '800', color: '#F0F0F0', letterSpacing: 1 },
  loc: { fontSize: 12, color: '#888', marginTop: 2 },
  sevBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  sevText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#222', marginBottom: 16 },
  label: { fontSize: 10, color: '#555', fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  summary: { fontSize: 14, color: '#CCCCCC', lineHeight: 20, marginBottom: 20 },
  pills: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  pill: { flex: 1, backgroundColor: '#0A0A0A', borderRadius: 8, padding: 10, alignItems: 'center' },
  pillLabel: { fontSize: 9, color: '#555', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  pillVal: { fontSize: 13, fontWeight: '700', color: '#F0F0F0' },
  closeBtn: { backgroundColor: '#E83A2C', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  closeTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
