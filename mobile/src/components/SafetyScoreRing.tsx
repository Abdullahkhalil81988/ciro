import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props { score: number; size?: number; label?: string }

export function SafetyScoreRing({ score, size = 100, label }: Props) {
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F97316' : '#22C55E';
  const radius = (size - 12) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * (score / 100);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#141414" strokeWidth={10} fill="none" />
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={10} fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text style={[styles.score, { color, fontSize: size * 0.22 }]}>{score}</Text>
        <Text style={styles.sub}>/ 100</Text>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  score: { fontWeight: '800' },
  sub: { fontSize: 10, color: '#888888', marginTop: -2 },
  label: { fontSize: 11, color: '#888888', marginTop: 4 },
});
