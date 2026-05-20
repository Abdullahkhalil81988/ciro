import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { actions: string[]; ticketId?: string; usersAlerted?: number }

export function ActionLogCard({ actions, ticketId, usersAlerted }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>⚡ Actions Executed</Text>
      {actions.map((action, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.check}>✓</Text>
          <Text style={styles.action}>{action}</Text>
        </View>
      ))}
      {ticketId && (
        <View style={styles.ticket}>
          <Text style={styles.ticketLabel}>Authority Ticket</Text>
          <Text style={styles.ticketId}>{ticketId}</Text>
        </View>
      )}
      {usersAlerted && (
        <View style={styles.users}>
          <Text style={styles.usersNum}>{usersAlerted}</Text>
          <Text style={styles.usersLabel}> simulated users notified</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#141414', borderRadius: 12, padding: 14 },
  title: { fontSize: 13, fontWeight: '700', color: '#F0F0F0', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  check: { color: '#22C55E', fontSize: 14, fontWeight: '700', marginRight: 8, width: 16 },
  action: { color: '#CCCCCC', fontSize: 13, flex: 1, lineHeight: 18 },
  ticket: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#222222' },
  ticketLabel: { color: '#666666', fontSize: 11, marginRight: 8 },
  ticketId: { color: '#F97316', fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  users: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  usersNum: { color: '#3B82F6', fontSize: 18, fontWeight: '800' },
  usersLabel: { color: '#888888', fontSize: 12 },
});
