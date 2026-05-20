import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { label: string; value: string; color?: string }

export function MetricPill({ label, value, color = '#3B82F6' }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '18' }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 70 },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 10, color: '#888888', marginTop: 2, textAlign: 'center' },
});
