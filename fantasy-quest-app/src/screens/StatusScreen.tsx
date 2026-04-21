import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore, EXCHANGE_RATE_KRW_PER_GOLD } from '../store/gameStore';
import { StatusWindow } from '../components/StatusWindow';
import { GoldCounter } from '../components/GoldCounter';
import { HolographicFrame } from '../components/HolographicFrame';
import { colors } from '../theme/colors';

type Filter = 'all' | 'quest' | 'exchange' | 'expire';

export function StatusScreen() {
  const level = useGameStore((s) => s.level);
  const exp = useGameStore((s) => s.exp);
  const stats = useGameStore((s) => s.stats);
  const gold = useGameStore((s) => s.gold);
  const availablePoints = useGameStore((s) => s.availablePoints);
  const allocateStat = useGameStore((s) => s.allocateStat);
  const history = useGameStore((s) => s.history);
  const totals = useGameStore((s) => s.totals);

  const [filter, setFilter] = useState<Filter>('all');
  const filtered = filter === 'all' ? history : history.filter((h) => h.kind === filter);

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
        <HolographicFrame tone="gold">
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>[ 누 적 통 계 ]</Text>
          <View style={styles.divider} />
          <TotalsRow label="보유 골드" value={`${gold.toLocaleString()} G`} highlight />
          <TotalsRow
            label="여지껏 받은 골드"
            value={`${totals.goldEarned.toLocaleString()} G`}
          />
          <TotalsRow
            label="환전한 골드"
            value={`${totals.goldSpent.toLocaleString()} G`}
          />
          <TotalsRow
            label="받은 금액 총계"
            value={`${totals.krwReceived.toLocaleString()} 원`}
            highlight
          />
          <View style={styles.divider} />
          <TotalsRow label="완료한 퀘스트" value={`${totals.questsCompleted} 건`} />
          <TotalsRow label="놓친 퀘스트" value={`${totals.questsExpired} 건`} />
          <TotalsRow label="환전 횟수" value={`${totals.exchangeCount} 회`} />
          <TotalsRow
            label="환율"
            value={`1 G = ${EXCHANGE_RATE_KRW_PER_GOLD} 원`}
          />
        </HolographicFrame>

        <View style={{ height: 16 }} />
        <HolographicFrame>
          <Text style={styles.sectionTitle}>[ 활 동 기 록 ]</Text>
          <View style={styles.divider} />

          <View style={styles.filterRow}>
            {(['all', 'quest', 'exchange', 'expire'] as Filter[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={({ pressed }) => [
                  styles.filterChip,
                  filter === f && styles.filterChipActive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && { color: colors.cyanGlow },
                  ]}
                >
                  {filterLabel(f)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          {filtered.length === 0 ? (
            <Text style={styles.empty}>아직 기록이 없습니다.</Text>
          ) : (
            filtered.slice(0, 50).map((h) => (
              <View key={h.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={[styles.historyKind, kindColor(h.kind)]}>
                    {kindLabel(h.kind)}
                  </Text>
                  <Text style={styles.historyTime}>{formatTime(h.timestamp)}</Text>
                </View>
                <Text style={styles.historyTitle} numberOfLines={2}>
                  {h.title}
                </Text>
                <Text
                  style={[
                    styles.historyGold,
                    h.gold < 0 && { color: colors.danger },
                    h.gold === 0 && { color: colors.muted },
                  ]}
                >
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

function TotalsRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.totalsRow}>
      <Text style={styles.totalsLabel}>{label}</Text>
      <Text style={[styles.totalsValue, highlight && { color: colors.gold, fontSize: 15 }]}>
        {value}
      </Text>
    </View>
  );
}

function filterLabel(f: Filter) {
  if (f === 'all') return '전체';
  if (f === 'quest') return '퀘스트';
  if (f === 'exchange') return '환전';
  return '만료';
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

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  if (sameDay) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
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
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalsLabel: { color: colors.muted, fontSize: 12, letterSpacing: 2 },
  totalsValue: { color: colors.white, fontSize: 13, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(79,208,255,0.12)',
  },
  filterText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
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
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(79,208,255,0.12)',
  },
  historyLeft: {
    width: 62,
  },
  historyKind: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  historyTime: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
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
