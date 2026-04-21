import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { QuestCard } from '../components/QuestCard';
import { GoldCounter } from '../components/GoldCounter';
import { SystemPopup } from '../components/SystemPopup';
import { colors } from '../theme/colors';
import { todayKey } from '../utils/dateReset';

export function QuestsScreen() {
  const hydrated = useGameStore((s) => s.hydrated);
  const quests = useGameStore((s) => s.quests);
  const gold = useGameStore((s) => s.gold);
  const level = useGameStore((s) => s.level);
  const lastNoticeShownDate = useGameStore((s) => s.lastNoticeShownDate);
  const regenerateIfNeeded = useGameStore((s) => s.regenerateIfNeeded);
  const completeQuest = useGameStore((s) => s.completeQuest);
  const markNoticeShown = useGameStore((s) => s.markNoticeShown);

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const result = regenerateIfNeeded();
    if (result.generated || lastNoticeShownDate !== todayKey() || quests.length === 0) {
      setNoticeOpen(true);
    }
  }, [hydrated]);

  const onComplete = (id: string) => {
    const res = completeQuest(id);
    if (res.leveledUp) setLevelUpOpen(true);
  };

  const pending = quests.filter((q) => !q.completed);
  const finished = quests.filter((q) => q.completed);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>일 일  퀘 스 트</Text>
          <Text style={styles.subtitle}>Lv. {level} · 각성자</Text>
        </View>
        <GoldCounter gold={gold} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {pending.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>[ 모든 퀘스트를 완료했습니다 ]</Text>
            <Text style={styles.emptySub}>내일 새 퀘스트가 도착합니다.</Text>
          </View>
        ) : null}

        {pending.map((q) => (
          <QuestCard key={q.id} quest={q} onComplete={onComplete} />
        ))}

        {finished.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>완료된 퀘스트</Text>
            {finished.map((q) => (
              <QuestCard key={q.id} quest={q} onComplete={onComplete} />
            ))}
          </>
        ) : null}
      </ScrollView>

      <SystemPopup
        visible={noticeOpen}
        title="알림"
        onClose={() => {
          setNoticeOpen(false);
          markNoticeShown();
        }}
      >
        <Text style={popupStyles.line}>시스템이 플레이어를 호출했습니다.</Text>
        <Text style={popupStyles.line}>오늘의 일일 퀘스트가 도착했습니다.</Text>
        <Text style={popupStyles.hint}>완료하면 골드와 경험치를 획득합니다.</Text>
      </SystemPopup>

      <SystemPopup
        visible={levelUpOpen}
        title="LEVEL UP"
        tone="gold"
        onClose={() => setLevelUpOpen(false)}
      >
        <Text style={popupStyles.line}>각성도가 상승했습니다.</Text>
        <Text style={popupStyles.hint}>스탯 포인트 +5 가 지급되었습니다.</Text>
      </SystemPopup>
    </SafeAreaView>
  );
}

const popupStyles = StyleSheet.create({
  line: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 1,
    marginVertical: 2,
  },
  hint: {
    color: colors.cyan,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 1,
  },
});

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
    letterSpacing: 4,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 4,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: colors.cyan,
    fontSize: 14,
    letterSpacing: 2,
  },
  emptySub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 18,
    marginBottom: 10,
  },
});
