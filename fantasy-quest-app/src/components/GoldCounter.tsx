import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface Props {
  gold: number;
  label?: string;
}

export function GoldCounter({ gold, label = 'GOLD' }: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withSequence(
      withTiming(1.08, { duration: 160 }),
      withTiming(1, { duration: 220 }),
    );
  }, [gold, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.pill, style]}>
        <View style={styles.dot} />
        <Text style={styles.value}>{gold.toLocaleString()}</Text>
        <Text style={styles.unit}>G</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-end' },
  label: {
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,214,102,0.5)',
    backgroundColor: 'rgba(255,214,102,0.08)',
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  value: {
    color: colors.goldGlow,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  unit: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
