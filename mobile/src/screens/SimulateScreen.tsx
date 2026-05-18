import { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, Alert
} from "react-native";

const API_URL = "http://10.0.2.2:8000";
const CRISIS_TYPES = ["flood", "fire", "cyber", "civil", "medical", "industrial", "heatwave"];
const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta", "Multan"];

export default function SimulateScreen() {
  const [type, setType] = useState("flood");
  const [city, setCity] = useState("Karachi");
  const [severity, setSeverity] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function trigger() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crisis_type: type,
          location: city,
          severity_override: severity,
          description: `Simulated ${type} crisis in ${city} — severity ${severity}/10`,
        }),
      });
      const data = await res.json();
      setResult(`✓ Crisis injected!\nType: ${type}\nLocation: ${city}\nSeverity: ${severity}/10\nID: ${data.simulated_event?.analysis_id?.slice(0, 8)}...`);
    } catch (e) {
      setResult("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>🎯 Inject Simulation</Text>
      <Text style={styles.subtitle}>Trigger a synthetic crisis for demo purposes</Text>

      <Text style={styles.label}>Crisis Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {CRISIS_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            style={[styles.chip, type === t && styles.chipActive]}
          >
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Location</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {CITIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCity(c)}
            style={[styles.chip, city === c && styles.chipActive]}
          >
            <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Severity: {severity}/10</Text>
      <View style={styles.severityRow}>
        {[...Array(10)].map((_, i) => (
          <TouchableOpacity
            key={i + 1}
            onPress={() => setSeverity(i + 1)}
            style={[styles.sevBox, severity === i + 1 && styles.sevBoxActive,
              { backgroundColor: i + 1 >= 8 ? "#7f1d1d" : i + 1 >= 5 ? "#7c2d12" : "#1c1917" }]}
          >
            <Text style={styles.sevText}>{i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={trigger}
        disabled={loading}
        style={[styles.btn, loading && styles.btnDisabled]}
      >
        <Text style={styles.btnText}>{loading ? "Dispatching..." : "🚨 Trigger Crisis"}</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  title: { color: "#ef4444", fontSize: 20, fontWeight: "bold", marginTop: 40 },
  subtitle: { color: "#64748b", fontSize: 12, marginTop: 4, marginBottom: 20 },
  label: { color: "#94a3b8", fontSize: 12, marginBottom: 8, marginTop: 16 },
  chipRow: { flexDirection: "row", marginBottom: 4 },
  chip: { backgroundColor: "#1e293b", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: "#334155" },
  chipActive: { borderColor: "#ef4444", backgroundColor: "#450a0a" },
  chipText: { color: "#64748b", fontSize: 12 },
  chipTextActive: { color: "#fca5a5" },
  severityRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  sevBox: { flex: 1, paddingVertical: 10, borderRadius: 4, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  sevBoxActive: { borderColor: "#ef4444" },
  sevText: { color: "#94a3b8", fontSize: 12 },
  btn: { backgroundColor: "#dc2626", borderRadius: 8, padding: 16, alignItems: "center", marginTop: 24 },
  btnDisabled: { backgroundColor: "#374151" },
  btnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  result: { backgroundColor: "#0d2818", borderRadius: 8, padding: 12, marginTop: 16 },
  resultText: { color: "#4ade80", fontSize: 12, fontFamily: "monospace" },
});
