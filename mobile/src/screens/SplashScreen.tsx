import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { onDone: () => void }

export function SplashScreen({ onDone }: Props) {
  useEffect(() => { setTimeout(onDone, 2200); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Text style={styles.logo}>راستہ</Text>
        <Text style={styles.name}>RAASTA</Text>
        <Text style={styles.tagline}>Navigate. Detect. Reroute.</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Powered by Gemini 2.0 Flash</Text>
        <Text style={styles.badgeSub}>Google Antigravity Hackathon 2025</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  logoArea: { alignItems: 'center' },
  logo: { fontSize: 52, color: '#22C55E', fontWeight: '900', marginBottom: 4 },
  name: { fontSize: 32, color: '#F1F5F9', fontWeight: '800', letterSpacing: 8 },
  tagline: { fontSize: 13, color: '#64748B', marginTop: 6, letterSpacing: 2 },
  badge: { position: 'absolute', bottom: 48, alignItems: 'center' },
  badgeText: { fontSize: 11, color: '#3B82F6', fontWeight: '600' },
  badgeSub: { fontSize: 10, color: '#475569', marginTop: 2 },
});
