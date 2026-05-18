import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { score: number; size?: 'sm' | 'md' | 'lg' }

export function RiskBadge({ score, size = 'md' }: Props) {
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F97316' : '#22C55E';
  const label = score >= 70 ? 'HIGH RISK' : score >= 40 ? 'CAUTION' : 'SAFE';
  const fs = size === 'sm' ? 9 : size === 'lg' ? 14 : 11;
  const pad = size === 'sm' ? { paddingHorizontal: 6, paddingVertical: 2 } : { paddingHorizontal: 10, paddingVertical: 4 };

  return (
    <View style={[styles.badge, pad, { backgroundColor: color + '25', borderColor: color, borderWidth: 1 }]}>
      <Text style={[styles.text, { color, fontSize: fs }]}>{score} · {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 6, alignSelf: 'flex-start' },
  text: { fontWeight: '700', letterSpacing: 0.5 },
});
