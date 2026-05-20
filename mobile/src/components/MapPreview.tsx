import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText } from 'react-native-svg';

interface Props {
  showCrisis?: boolean;
  showAlternate?: boolean;
  width?: number;
  height?: number;
}

export function MapPreview({ showCrisis = false, showAlternate = false, width = 340, height = 200 }: Props) {
  // Simplified Islamabad map visualization
  // G-11 (bottom-left) → D-Chowk (top-right) → Blue Area
  const G11 = { x: 60, y: 160 };
  const F8 = { x: 100, y: 120 };
  const DCowk = { x: 260, y: 80 };
  const BlueArea = { x: 290, y: 110 };
  const Kashmir = { x: 180, y: 60 };
  const F6 = { x: 240, y: 55 };

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[40, 80, 120, 160].map(y => (
          <Line key={y} x1={0} y1={y} x2={width} y2={y} stroke="#141414" strokeWidth={1} />
        ))}
        {[60, 120, 180, 240, 300].map(x => (
          <Line key={x} x1={x} y1={0} x2={x} y2={height} stroke="#141414" strokeWidth={1} />
        ))}

        {/* Original route — red/orange if crisis shown */}
        <Path
          d={`M ${G11.x} ${G11.y} Q ${F8.x} ${F8.y} ${DCowk.x} ${DCowk.y} L ${BlueArea.x} ${BlueArea.y}`}
          stroke={showCrisis ? '#EF4444' : '#888888'}
          strokeWidth={showCrisis ? 3 : 2}
          fill="none"
          strokeDasharray={showCrisis ? '6 3' : undefined}
        />

        {/* Alternate route — green */}
        {showAlternate && (
          <Path
            d={`M ${G11.x} ${G11.y} Q 120 100 ${Kashmir.x} ${Kashmir.y} L ${F6.x} ${F6.y} L ${BlueArea.x} ${BlueArea.y}`}
            stroke="#22C55E"
            strokeWidth={3.5}
            fill="none"
          />
        )}

        {/* Crisis zone */}
        {showCrisis && (
          <Circle cx={DCowk.x} cy={DCowk.y} r={22} fill="#EF4444" fillOpacity={0.2} stroke="#EF4444" strokeWidth={1.5} />
        )}

        {/* Waypoints */}
        <Circle cx={G11.x} cy={G11.y} r={6} fill="#22C55E" />
        <Circle cx={BlueArea.x} cy={BlueArea.y} r={6} fill="#3B82F6" />
        {showCrisis && <Circle cx={DCowk.x} cy={DCowk.y} r={5} fill="#EF4444" />}

        {/* Labels */}
        <SvgText x={G11.x - 5} y={G11.y + 16} fontSize={9} fill="#888888">G-11</SvgText>
        <SvgText x={BlueArea.x - 20} y={BlueArea.y + 16} fontSize={9} fill="#888888">Blue Area</SvgText>
        {showCrisis && <SvgText x={DCowk.x - 22} y={DCowk.y - 10} fontSize={9} fill="#EF4444">D-Chowk ⚠</SvgText>}
        {showAlternate && <SvgText x={Kashmir.x - 28} y={Kashmir.y - 8} fontSize={9} fill="#22C55E">Kashmir Hwy</SvgText>}
      </Svg>
      <View style={styles.legend}>
        {showCrisis && <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor:'#EF4444'}]}/><Text style={styles.legendText}>Blocked route</Text></View>}
        {showAlternate && <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor:'#22C55E'}]}/><Text style={styles.legendText}>Safe route</Text></View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0A0A0A', borderRadius: 12, overflow: 'hidden' },
  legend: { position: 'absolute', bottom: 6, right: 8, flexDirection: 'row', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 9, color: '#888888' },
});
