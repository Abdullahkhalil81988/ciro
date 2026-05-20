import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteInfo } from '../types';
import { RiskBadge } from './RiskBadge';

interface Props { route: RouteInfo; variant?: 'original' | 'recommended' }

export function RouteCard({ route, variant = 'recommended' }: Props) {
  const isRec = variant === 'recommended';
  const risk = isRec ? route.newRisk : route.originalRisk;
  const accent = isRec ? '#22C55E' : '#EF4444';

  return (
    <View style={[styles.card, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
      <View style={styles.header}>
        <Text style={styles.variantLabel}>{isRec ? '✦ RAASTA ROUTE' : 'ORIGINAL ROUTE'}</Text>
        <RiskBadge score={risk} size="sm" />
      </View>
      <View style={styles.route}>
        <Text style={styles.point}>⬤ {route.from}</Text>
        <Text style={styles.arrow}>  ↓</Text>
        <Text style={styles.point}>⬤ {route.to}</Text>
      </View>
      {isRec && (
        <View style={styles.rec}>
          <Text style={styles.recText}>{route.recommendation}</Text>
        </View>
      )}
      <View style={styles.metrics}>
        <MetricItem value={`${isRec ? route.newRisk : route.originalRisk}`} label="Risk Score" color={accent} />
        {isRec && <MetricItem value={`+${route.delayAvoidedMinutes}m`} label="Saved" color="#22C55E" />}
      </View>
    </View>
  );
}

function MetricItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color, fontSize: 16, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: '#888888', fontSize: 10 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  variantLabel: { fontSize: 10, fontWeight: '700', color: '#888888', letterSpacing: 1 },
  route: { marginBottom: 8 },
  point: { color: '#F0F0F0', fontSize: 14, fontWeight: '600' },
  arrow: { color: '#475569', fontSize: 12, marginVertical: 2 },
  rec: { backgroundColor: '#0A0A0A', borderRadius: 8, padding: 8, marginBottom: 8 },
  recText: { color: '#888888', fontSize: 12, lineHeight: 18 },
  metrics: { flexDirection: 'row', gap: 16 },
});
