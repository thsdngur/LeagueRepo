import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { StatusWindow } from '../components/StatusWindow';
import { GoldCounter } from '../components/GoldCounter';
import { HolographicFrame } from '../components/HolographicFrame';
import { colors } from '../theme/colors';

export function StatusScreen() {
  const level = useGameStore((s) => s.level);
  const exp = useGameStore((s) => s.exp);
  const stats = useGameStore((s) => s.stats);
  const gold = useGameStore((s) => s.gold);
  const availablePoints = useGameStore((s) => s.availablePoints);
  const allocateStat = useGameStore((s) => s.allocateStat);
  const history = useGameStore((s) => s.history);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>상 태 창</Text>
          <Text style={styles.subtitle}>Lv. {level}</Text>
        </View>
        <GoldCounter gold={gold} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <StatusWindow
          level={level}
          exp={exp}
          stats={stats}
          availablePoints={availablePoints}
          onAllocate={allocateStat}
        />

        <View style={{ height: 16 }} />
        <HolographicFrame>
          <Text style={styles.sectionTitle}>[ 활 동 기 록 ]</Text>
          <View style={styles.divider} />
          {history.length === 0 ? (
            <Text style={styles.empty}>아직 기록이 없습니다.</Text>
          ) : (
            history.slice(0, 20).map((h) => (
              <View key={h.id} style={styles.historyRow}>
                <Text style={[styles.historyKind, kindColor(h.kind)]}>{kindLabel(h.kind)}</Text>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {h.title}
                </Text>
                <Text style={[styles.historyGold, h.gold < 0 && { color: colors.danger }]}>
                  {h.gold > 0 ? `+${h.gold} G` : h.gold < 0 ? `${h.gold} G` : '—'}
                </Text>
              </View>
            ))
          )}
        </HolographicFrame>
      </ScrollView>
    </SafeAreaView>
  );
}

function kindLabel(kind: string) {
  if (kind === 'quest') return '[완료]';
  if (kind === 'exchange') return '[환전]';
  if (kind === 'expire') return '[만료]';
  return '[기타]';
}

function kindColor(kind: string) {
  if (kind === 'quest') return { color: colors.success };
  if (kind === 'exchange') return { color: colors.gold };
  if (kind === 'expire') return { color: colors.muted };
  return { color: colors.white };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    color: colors.cyanGlow,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 4,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: {
    color: colors.cyanGlow,
    fontSize: 13,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 16,
    letterSpacing: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  historyKind: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    width: 50,
  },
  historyTitle: {
    color: colors.white,
    fontSize: 13,
    flex: 1,
  },
  historyGold: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
});
