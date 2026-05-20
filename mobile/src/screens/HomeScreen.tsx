import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRaastaStore } from '../store/useRaastaStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { MetricPill } from '../components/MetricPill';
import { MapPreview } from '../components/MapPreview';
import { simulateCrisis, getIncidents } from '../services/mockApi';

interface Props { onNavigate: (screen: string) => void }

export function HomeScreen({ onNavigate }: Props) {
  const { isScanning, scanResult, setScanning, setScanResult, setScanError, setIncidents, setLoadingIncidents } = useRaastaStore();

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    setScanError(null);
    try {
      const result = await simulateCrisis();
      setScanResult(result);
      setLoadingIncidents(true);
      const incidents = await getIncidents();
      setIncidents(incidents);
      setLoadingIncidents(false);
      onNavigate('RouteRisk');
    } catch (e: any) {
      setScanError(e.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>Raasta</Text>
        <View style={styles.liveDot}><Text style={styles.liveText}>● LIVE</Text></View>
      </View>

      <Text style={styles.sectionLabel}>CURRENT ROUTE</Text>
      <View style={styles.routeBar}>
        <View style={styles.routePoint}><Text style={styles.routePointLabel}>FROM</Text><Text style={styles.routePointValue}>G-11 Islamabad</Text></View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.routePoint}><Text style={styles.routePointLabel}>TO</Text><Text style={styles.routePointValue}>Blue Area</Text></View>
      </View>

      <MapPreview showCrisis={!!scanResult} showAlternate={!!scanResult} width={340} height={180} />

      <View style={styles.metrics}>
        <MetricPill label="Distance" value="8.2 km" color="#3B82F6" />
        <MetricPill label="ETA" value="22 min" color="#4ade80" />
        <MetricPill label="Risk" value={scanResult ? `${scanResult.route.newRisk}` : '--'} color={scanResult ? '#E83A2C' : '#666666'} />
      </View>

      {scanResult && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>⚠️ Crisis detected: {scanResult.crisis.location}</Text>
          <Text style={styles.alertSub}>Raasta has found a safer route</Text>
        </View>
      )}

      <PrimaryButton
        label={isScanning ? 'Scanning...' : '🔍  Run Crisis Scan'}
        onPress={handleScan}
        loading={isScanning}
        style={styles.scanBtn}
      />

      <View style={styles.quickNav}>
        {[
          { label: '🗺  Route Planner', screen: 'RoutePlanner' },
          { label: '📡  Incidents', screen: 'IncidentFeed' },
          { label: '🤖  Agent Trace', screen: 'AgentTrace' },
          { label: '📊  Outcome', screen: 'Outcome' },
        ].map(item => (
          <TouchableOpacity key={item.screen} style={styles.navBtn} onPress={() => onNavigate(item.screen)}>
            <Text style={styles.navBtnText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  appName: { fontSize: 28, fontWeight: '900', color: '#E83A2C', letterSpacing: 1 },
  liveDot: { backgroundColor: '#E83A2C22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#E83A2C' },
  liveText: { color: '#E83A2C', fontSize: 11, fontWeight: '700' },
  sectionLabel: { fontSize: 10, color: '#666666', fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  routeBar: { flexDirection: 'row', backgroundColor: '#141414', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 },
  routePoint: { flex: 1 },
  routePointLabel: { fontSize: 9, color: '#666666', fontWeight: '700', letterSpacing: 1 },
  routePointValue: { fontSize: 15, color: '#F0F0F0', fontWeight: '700', marginTop: 2 },
  arrow: { fontSize: 20, color: '#222222', marginHorizontal: 8 },
  metrics: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  alertBanner: { backgroundColor: '#EF444422', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#EF4444', marginBottom: 12 },
  alertText: { color: '#FCA5A5', fontSize: 13, fontWeight: '700' },
  alertSub: { color: '#888888', fontSize: 11, marginTop: 2 },
  scanBtn: { marginBottom: 16 },
  quickNav: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  navBtn: { backgroundColor: '#141414', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, flex: 1, minWidth: '45%' },
  navBtnText: { color: '#CCCCCC', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
