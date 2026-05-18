import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from "react-native";
import { useCiroStore } from "../store/useCiroStore";
import { useWebSocket } from "../hooks/useWebSocket";

const API_URL = "http://10.0.2.2:8000"; // Android emulator

const TYPE_EMOJI: Record<string, string> = {
  flood: "🌊", fire: "🔥", cyber: "💻", civil: "👥",
  medical: "🏥", industrial: "🏭", heatwave: "☀️",
  road_blockage: "🚧", unknown: "⚠️",
};

function severityColor(s: number) {
  if (s >= 8) return "#ef4444";
  if (s >= 6) return "#f97316";
  if (s >= 4) return "#eab308";
  return "#22c55e";
}

export default function HomeScreen() {
  useWebSocket();
  const { events, connected } = useCiroStore();

  const maxSev = Math.max(...events.map((e) => e.severity), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚨 CIRO</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: connected ? "#22c55e" : "#ef4444" }]} />
          <Text style={styles.statusText}>{connected ? "Live" : "Connecting..."}</Text>
          {maxSev > 0 && (
            <Text style={[styles.maxSev, { color: severityColor(maxSev) }]}>
              MAX {maxSev}/10
            </Text>
          )}
        </View>
      </View>

      {/* Crisis feed */}
      {events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active crisis events.</Text>
          <Text style={styles.emptySubtext}>Pipeline runs every 30s.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftColor: severityColor(item.severity) }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {TYPE_EMOJI[item.type] ?? "⚠️"} {item.type.replace("_", " ").toUpperCase()}
                </Text>
                <View style={[styles.badge, { backgroundColor: severityColor(item.severity) }]}>
                  <Text style={styles.badgeText}>{item.severity}/10</Text>
                </View>
              </View>
              <Text style={styles.location}>📍 {item.location}</Text>
              <Text style={styles.trajectory}>
                {item.trajectory === "worsening" ? "↗ Worsening" : item.trajectory === "critical" ? "🔺 Critical" : "→ Stable"}
              </Text>
              <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { backgroundColor: "#1e293b", padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: "#334155" },
  title: { color: "#ef4444", fontSize: 22, fontWeight: "bold" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: "#94a3b8", fontSize: 12 },
  maxSev: { marginLeft: "auto", fontSize: 12, fontWeight: "bold" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#475569", fontSize: 16 },
  emptySubtext: { color: "#334155", fontSize: 12, marginTop: 4 },
  card: { backgroundColor: "#1e293b", borderRadius: 8, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "#f1f5f9", fontWeight: "bold", fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: "white", fontSize: 11, fontWeight: "bold" },
  location: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  trajectory: { color: "#f97316", fontSize: 11, marginTop: 2 },
  summary: { color: "#64748b", fontSize: 11, marginTop: 6 },
});
