import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { HolographicFrame } from './HolographicFrame';
import { colors } from '../theme/colors';
import { expForNext, type Stats } from '../store/gameStore';

interface Props {
  level: number;
  exp: number;
  stats: Stats;
  availablePoints: number;
  onAllocate: (key: keyof Stats) => void;
}

const STAT_LABEL: Record<keyof Stats, string> = {
  str: '근력',
  agi: '민첩',
  vit: '체력',
  int: '지능',
  sen: '감각',
};

export function StatusWindow({ level, exp, stats, availablePoints, onAllocate }: Props) {
  const expMax = expForNext(level);
  const expPct = Math.min(100, Math.round((exp / expMax) * 100));

  return (
    <HolographicFrame>
      <Text style={styles.title}>[ S T A T U S ]</Text>
      <View style={styles.divider} />
      <Row label="이름" value="플레이어" />
      <Row label="칭호" value="각성자" />
      <Row label="레벨" value={`Lv. ${level}`} highlight />
      <View style={styles.divider} />

      <Text style={styles.subLabel}>경험치</Text>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${expPct}%` }]} />
      </View>
      <Text style={styles.barMeta}>
        {exp} / {expMax} EXP
      </Text>

      <View style={styles.divider} />
      <View style={styles.statHeader}>
        <Text style={styles.subLabel}>스탯</Text>
        {availablePoints > 0 ? (
          <Text style={styles.points}>가용 포인트 {availablePoints}</Text>
        ) : null}
      </View>

      {(Object.keys(STAT_LABEL) as (keyof Stats)[]).map((key) => (
        <View key={key} style={styles.statRow}>
          <Text style={styles.statLabel}>{STAT_LABEL[key]}</Text>
          <Text style={styles.statValue}>{stats[key]}</Text>
          <Pressable
            onPress={() => onAllocate(key)}
            disabled={availablePoints <= 0}
            style={({ pressed }) => [
              styles.plus,
              availablePoints <= 0 && styles.plusDisabled,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.plusText}>+</Text>
          </Pressable>
        </View>
      ))}
    </HolographicFrame>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { color: colors.cyanGlow }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.cyanGlow,
    fontSize: 14,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: { color: colors.muted, fontSize: 13, letterSpacing: 2 },
  rowValue: { color: colors.white, fontSize: 14, fontWeight: '700' },
  subLabel: { color: colors.muted, fontSize: 12, letterSpacing: 3, marginBottom: 6 },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(79,208,255,0.15)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.cyan,
    shadowColor: colors.cyanGlow,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  barMeta: { color: colors.cyan, fontSize: 11, marginTop: 4, textAlign: 'right' },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: { color: colors.gold, fontSize: 11, letterSpacing: 1 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statLabel: { color: colors.white, fontSize: 14, flex: 1 },
  statValue: {
    color: colors.cyanGlow,
    fontSize: 15,
    fontWeight: '800',
    width: 40,
    textAlign: 'center',
  },
  plus: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,208,255,0.12)',
  },
  plusDisabled: {
    borderColor: colors.muted,
    backgroundColor: 'transparent',
  },
  plusText: {
    color: colors.cyanGlow,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
});
