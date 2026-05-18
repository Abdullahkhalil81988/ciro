import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AgentTraceStep } from '../types';

const AGENT_COLORS = ['#06B6D4','#8B5CF6','#F59E0B','#22C55E','#EF4444','#3B82F6','#10B981'];

interface Props { step: AgentTraceStep; index: number; isLast?: boolean }

export function AgentStep({ step, index, isLast }: Props) {
  const color = AGENT_COLORS[index % AGENT_COLORS.length];
  const isDone = step.status === 'complete';

  return (
    <View style={styles.wrapper}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: isDone ? color : '#1E293B', borderColor: color, borderWidth: 2 }]}>
          {step.status === 'running' ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <Text style={[styles.num, { color: isDone ? '#0F172A' : color }]}>{index + 1}</Text>
          )}
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: isDone ? color + '55' : '#1E293B' }]} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.agentName, { color }]}>{step.agent}</Text>
        <Text style={styles.detail}>{step.detail}</Text>
        {step.durationMs && <Text style={styles.duration}>{step.durationMs}ms</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', marginBottom: 4 },
  left: { alignItems: 'center', marginRight: 12, width: 32 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginVertical: 2 },
  num: { fontSize: 12, fontWeight: '800' },
  content: { flex: 1, paddingTop: 4, paddingBottom: 14 },
  agentName: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  detail: { fontSize: 12, color: '#94A3B8', lineHeight: 17 },
  duration: { fontSize: 10, color: '#475569', marginTop: 3 },
});
