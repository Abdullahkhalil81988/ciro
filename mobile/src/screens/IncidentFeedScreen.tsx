import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRaastaStore } from '../store/useRaastaStore';
import { IncidentCard } from '../components/IncidentCard';
import { getIncidents } from '../services/mockApi';

export function IncidentFeedScreen() {
  const { incidents, isLoadingIncidents, setIncidents, setLoadingIncidents } = useRaastaStore();

  const load = async () => {
    setLoadingIncidents(true);
    const data = await getIncidents();
    setIncidents(data);
    setLoadingIncidents(false);
  };

  useEffect(() => { if (incidents.length === 0) load(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Incidents</Text>
      <Text style={styles.sub}>{incidents.length} active across Pakistan</Text>
      {isLoadingIncidents ? (
        <ActivityIndicator color="#22C55E" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={incidents.sort((a, b) => b.severity - a.severity)}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <IncidentCard incident={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoadingIncidents} onRefresh={load} tintColor="#22C55E" />}
          ListEmptyComponent={<Text style={styles.empty}>No incidents. All clear ✓</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 16, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 2 },
  sub: { fontSize: 12, color: '#64748B', marginBottom: 14 },
  list: { paddingBottom: 20 },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
