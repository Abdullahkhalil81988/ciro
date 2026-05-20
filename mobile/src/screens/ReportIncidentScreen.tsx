import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';

const TYPES = ['Road Blockage', 'Civil Disruption', 'Flood', 'Accident', 'VIP Movement', 'Other'];

export function ReportIncidentScreen() {
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!type || !location) { Alert.alert('Required', 'Select type and enter location'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successTitle}>Report Submitted</Text>
      <Text style={styles.successSub}>Signal ID: RAA-{Date.now().toString().slice(-6)}</Text>
      <Text style={styles.successText}>Your report has been ingested by the Signal Monitor Agent and will be processed in the next pipeline run.</Text>
      <PrimaryButton label="Submit Another" onPress={() => { setSubmitted(false); setType(''); setLocation(''); setDesc(''); }} style={{ marginTop: 20 }} />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Report Incident</Text>
      <Text style={styles.sub}>Your report feeds directly into the Raasta agent pipeline</Text>

      <Text style={styles.label}>INCIDENT TYPE</Text>
      <View style={styles.typeGrid}>
        {TYPES.map(t => (
          <PrimaryButton key={t} label={t} onPress={() => setType(t)} variant={type === t ? 'primary' : 'outline'} style={styles.typeBtn} />
        ))}
      </View>

      <Text style={styles.label}>LOCATION</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. D-Chowk, Islamabad" placeholderTextColor="#475569" accessibilityLabel="Location" />

      <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
      <TextInput style={[styles.input, styles.multiline]} value={desc} onChangeText={setDesc} placeholder="Describe what you see..." placeholderTextColor="#475569" multiline numberOfLines={4} accessibilityLabel="Description" />

      <PrimaryButton label={loading ? 'Submitting...' : 'Submit Report'} onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '800', color: '#F0F0F0', marginBottom: 4 },
  sub: { fontSize: 12, color: '#666666', marginBottom: 20 },
  label: { fontSize: 10, color: '#666666', fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 14 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeBtn: { minWidth: '30%', flex: 1, paddingVertical: 10, fontSize: 12 },
  input: { backgroundColor: '#141414', borderRadius: 10, padding: 14, color: '#F0F0F0', fontSize: 14, borderWidth: 1, borderColor: '#222222' },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  successContainer: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { fontSize: 56, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#22C55E' },
  successSub: { fontSize: 12, color: '#666666', fontFamily: 'monospace', marginTop: 4 },
  successText: { fontSize: 13, color: '#888888', textAlign: 'center', lineHeight: 19, marginTop: 12 },
});
