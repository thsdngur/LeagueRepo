import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  tone?: 'cyan' | 'gold' | 'danger';
}

export function HolographicFrame({ children, style, glow = true, tone = 'cyan' }: Props) {
  const accent = tone === 'gold' ? colors.gold : tone === 'danger' ? colors.danger : colors.cyan;
  return (
    <View style={[styles.outer, glow && { shadowColor: accent }, style]}>
      <LinearGradient
        colors={['rgba(10,18,36,0.95)', 'rgba(13,23,48,0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.inner, { borderColor: `${accent}66` }]}
      >
        <Corner position="tl" color={accent} />
        <Corner position="tr" color={accent} />
        <Corner position="bl" color={accent} />
        <Corner position="br" color={accent} />
        {children}
      </LinearGradient>
    </View>
  );
}

function Corner({ position, color }: { position: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const size = 14;
  const thickness = 2;
  const base: ViewStyle = { position: 'absolute', width: size, height: size };
  const pos: ViewStyle =
    position === 'tl'
      ? { top: -1, left: -1, borderTopWidth: thickness, borderLeftWidth: thickness }
      : position === 'tr'
      ? { top: -1, right: -1, borderTopWidth: thickness, borderRightWidth: thickness }
      : position === 'bl'
      ? { bottom: -1, left: -1, borderBottomWidth: thickness, borderLeftWidth: thickness }
      : { bottom: -1, right: -1, borderBottomWidth: thickness, borderRightWidth: thickness };
  return <View style={[base, pos, { borderColor: color }]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 6,
  },
  inner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});
