import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText, Rect, G } from 'react-native-svg';
import { useRaastaStore } from '../store/useRaastaStore';

interface Props {
  showCrisis?: boolean;
  showAlternate?: boolean;
  width?: number;
  height?: number;
}

const TYPE_ICON: Record<string, string> = {
  civil_disruption: '👥', civil: '👥', flood: '🌊', fire: '🔥',
  road_blockage: '🚧', medical: '🏥', cyber: '💻', industrial: '🏭',
  heatwave: '☀️', unknown: '⚠️',
};

const SEV_COLOR = (s: number) => s >= 8 ? '#E83A2C' : s >= 5 ? '#F2C744' : '#4ade80';

// Simplified Pakistan city coords within a 340x220 SVG space
const CITY_PINS: Record<string, { x: number; y: number; label: string }> = {
  islamabad:  { x: 220, y: 55,  label: 'Islamabad' },
  rawalpindi: { x: 215, y: 65,  label: 'Rawalpindi' },
  lahore:     { x: 250, y: 95,  label: 'Lahore' },
  karachi:    { x: 130, y: 185, label: 'Karachi' },
  peshawar:   { x: 165, y: 40,  label: 'Peshawar' },
  quetta:     { x: 100, y: 140, label: 'Quetta' },
  multan:     { x: 195, y: 120, label: 'Multan' },
  faisalabad: { x: 215, y: 100, label: 'Faisalabad' },
  'd-chowk':  { x: 222, y: 58,  label: 'D-Chowk' },
  hub:        { x: 118, y: 178, label: 'Hub' },
};

function cityPin(location: string): { x: number; y: number; label: string } | null {
  const loc = location.toLowerCase();
  for (const [key, pin] of Object.entries(CITY_PINS)) {
    if (loc.includes(key)) return pin;
  }
  return null;
}

export function MapPreview({ showCrisis = false, showAlternate = false, width = 340, height = 220 }: Props) {
  const { incidents } = useRaastaStore();
  const [tooltip, setTooltip] = useState<{ label: string; type: string; sev: number; x: number; y: number } | null>(null);

  const G11      = { x: 60,  y: 160 };
  const DCowk    = { x: 222, y: 58  };
  const BlueArea = { x: 250, y: 75  };
  const Kashmir  = { x: 175, y: 42  };

  return (
    <View style={{ width, height: height + (tooltip ? 44 : 0) }}>
      <View style={[styles.container, { width, height }]}>
        <Svg width={width} height={height}>
          {/* Grid */}
          {[40, 80, 120, 160, 200].map(y => (
            <Line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#1a1a1a" strokeWidth={1} />
          ))}
          {[60, 120, 180, 240, 300].map(x => (
            <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke="#1a1a1a" strokeWidth={1} />
          ))}

          {/* Pakistan outline */}
          <Path
            d="M 80 20 L 130 10 L 190 12 L 255 28 L 310 55 L 320 100 L 310 145 L 280 175 L 230 195 L 175 198 L 135 180 L 100 148 L 78 105 Z"
            stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="4 4" fill="rgba(255,255,255,0.01)"
          />

          {/* Demo: original route (blocked) */}
          {showCrisis && (
            <Path
              d={`M ${G11.x} ${G11.y} Q 140 120 ${DCowk.x} ${DCowk.y} L ${BlueArea.x} ${BlueArea.y}`}
              stroke="#E83A2C" strokeWidth={2.5} fill="none" strokeDasharray="5 3"
            />
          )}

          {/* Demo: safe alternate */}
          {showAlternate && (
            <Path
              d={`M ${G11.x} ${G11.y} Q 120 110 ${Kashmir.x} ${Kashmir.y} L ${BlueArea.x} ${BlueArea.y}`}
              stroke="#4ade80" strokeWidth={3} fill="none"
            />
          )}

          {/* Demo: D-Chowk crisis zone */}
          {showCrisis && (
            <>
              <Circle cx={DCowk.x} cy={DCowk.y} r={18} fill="#E83A2C" fillOpacity={0.15} stroke="#E83A2C" strokeWidth={1} />
              <SvgText x={DCowk.x - 24} y={DCowk.y - 20} fontSize={8} fill="#E83A2C">D-Chowk ⚠</SvgText>
            </>
          )}

          {/* Demo waypoints */}
          {showCrisis && (
            <>
              <Circle cx={G11.x} cy={G11.y} r={5} fill="#4ade80" />
              <SvgText x={G11.x - 4} y={G11.y + 14} fontSize={8} fill="#4ade80">G-11</SvgText>
              <Circle cx={BlueArea.x} cy={BlueArea.y} r={5} fill="#3B82F6" />
              <SvgText x={BlueArea.x - 16} y={BlueArea.y + 14} fontSize={8} fill="#3B82F6">Blue Area</SvgText>
            </>
          )}
          {showAlternate && (
            <SvgText x={Kashmir.x - 28} y={Kashmir.y - 6} fontSize={8} fill="#4ade80">Kashmir Hwy</SvgText>
          )}

          {/* Live incident pins from store */}
          {Array.isArray(incidents) && incidents.slice(0, 8).map((inc) => {
            const pin = cityPin(inc.location);
            if (!pin) return null;
            const color = SEV_COLOR(inc.severity);
            return (
              <G key={inc.id} onPress={() => setTooltip(tooltip?.label === pin.label ? null : { label: pin.label, type: inc.type, sev: inc.severity, x: pin.x, y: pin.y })}>
                <Circle cx={pin.x} cy={pin.y} r={10} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1} />
                <Circle cx={pin.x} cy={pin.y} r={4} fill={color} />
                <SvgText x={pin.x + 8} y={pin.y + 4} fontSize={7} fill={color} fontWeight="bold">S{inc.severity}</SvgText>
              </G>
            );
          })}
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          {showCrisis && <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#E83A2C' }]} /><Text style={styles.legendText}>Blocked</Text></View>}
          {showAlternate && <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#4ade80' }]} /><Text style={styles.legendText}>Safe route</Text></View>}
          {Array.isArray(incidents) && incidents.length > 0 && (
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#F2C744' }]} /><Text style={styles.legendText}>{incidents.length} live</Text></View>
          )}
        </View>
      </View>

      {/* Tooltip */}
      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.ttIcon}>{TYPE_ICON[tooltip.type] ?? '⚠️'}</Text>
          <Text style={styles.ttText}>{tooltip.label} · {tooltip.type.replace(/_/g, ' ')}</Text>
          <Text style={[styles.ttSev, { color: SEV_COLOR(tooltip.sev) }]}>SEV {tooltip.sev}</Text>
          <TouchableOpacity onPress={() => setTooltip(null)}><Text style={styles.ttClose}>✕</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0A0A0A', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  legend: { position: 'absolute', bottom: 6, right: 8, flexDirection: 'row', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 9, color: '#888' },
  tooltip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#141414', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4, borderWidth: 1, borderColor: '#333' },
  ttIcon: { fontSize: 14 },
  ttText: { flex: 1, fontSize: 11, color: '#CCC', textTransform: 'capitalize' },
  ttSev: { fontSize: 11, fontWeight: '700' },
  ttClose: { fontSize: 12, color: '#666', paddingLeft: 4 },
});
