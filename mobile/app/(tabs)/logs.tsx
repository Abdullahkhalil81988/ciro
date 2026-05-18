import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

const API_URL = "http://10.0.2.2:8000";

export default function LogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/logs`);
      const data = await res.json();
      setLogs(data.alert_log || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchLogs(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alert Logs</Text>
        <TouchableOpacity onPress={fetchLogs} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>No alerts dispatched yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.time}>{new Date(item.time).toLocaleTimeString()}</Text>
            <Text style={[styles.channel, { color: item.channel === "slack" ? "#60a5fa" : "#a78bfa" }]}>
              [{item.channel}]
            </Text>
            <Text style={styles.team}>{item.team}</Text>
            <Text style={styles.location}>@ {item.location || "—"}</Text>
            <View style={[styles.sev, { backgroundColor: item.severity >= 8 ? "#7f1d1d" : "#431407" }]}>
              <Text style={styles.sevText}>{item.severity}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingTop: 50, backgroundColor: "#1e293b", borderBottomWidth: 1, borderBottomColor: "#334155" },
  title: { color: "#f1f5f9", fontSize: 18, fontWeight: "bold" },
  refreshBtn: { backgroundColor: "#334155", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  refreshText: { color: "#94a3b8", fontSize: 13 },
  empty: { color: "#475569", textAlign: "center", marginTop: 40 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  time: { color: "#64748b", fontSize: 11, width: 65 },
  channel: { fontSize: 11, width: 50 },
  team: { color: "#e2e8f0", fontSize: 11, flex: 1 },
  location: { color: "#64748b", fontSize: 11 },
  sev: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sevText: { color: "#fca5a5", fontSize: 11, fontWeight: "bold" },
});
