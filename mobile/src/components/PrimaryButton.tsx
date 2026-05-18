import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'outline';
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const bg = variant === 'primary' ? '#22C55E' : variant === 'danger' ? '#EF4444' : 'transparent';
  const border = variant === 'outline' ? { borderWidth: 1, borderColor: '#22C55E' } : {};
  const textColor = variant === 'outline' ? '#22C55E' : '#0F172A';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.base, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, border, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
