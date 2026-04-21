import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGameStore, EXCHANGE_RATE_KRW_PER_GOLD } from '../store/gameStore';
import { HolographicFrame } from '../components/HolographicFrame';
import { SystemPopup } from '../components/SystemPopup';
import { colors } from '../theme/colors';

export function SettingsScreen() {
  const forceRegenerate = useGameStore((s) => s.forceRegenerate);
  const resetAll = useGameStore((s) => s.resetAll);
  const debugSetYesterday = useGameStore((s) => s.debugSetYesterday);
  const lastGeneratedDate = useGameStore((s) => s.lastGeneratedDate);

  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const act = (fn: () => void, msg: string) => {
    Haptics.selectionAsync().catch(() => {});
    fn();
    setToast(msg);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>설 정</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <HolographicFrame>
          <Text style={styles.sectionTitle}>[ 앱 정 보 ]</Text>
          <View style={styles.divider} />
          <Row label="이름" value="Awakened Quest" />
          <Row label="테마" value="나 혼자만 레벨업" />
          <Row label="환율" value={`1 G = ${EXCHANGE_RATE_KRW_PER_GOLD} 원`} />
          <Row label="마지막 생성일" value={lastGeneratedDate ?? '없음'} />
        </HolographicFrame>

        <View style={{ height: 16 }} />

        <HolographicFrame tone="cyan">
          <Text style={styles.sectionTitle}>[ 퀘 스 트 관 리 ]</Text>
          <View style={styles.divider} />
          <Button
            label="오늘의 퀘스트 재생성"
            onPress={() => act(forceRegenerate, '새 퀘스트가 생성되었습니다.')}
          />
          <Button
            label="디버그: 마지막 생성일을 어제로"
            onPress={() => act(debugSetYesterday, '다음 진입 시 새 퀘스트가 생성됩니다.')}
            tone="dim"
          />
        </HolographicFrame>

        <View style={{ height: 16 }} />

        <HolographicFrame tone="danger">
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>[ 위 험 영 역 ]</Text>
          <View style={styles.divider} />
          <Button
            label="전체 초기화"
            tone="danger"
            onPress={() => {
              Alert.alert(
                '전체 초기화',
                '레벨, 골드, 퀘스트, 기록을 모두 초기화합니다. 계속하시겠습니까?',
                [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '초기화',
                    style: 'destructive',
                    onPress: () => {
                      resetAll();
                      setConfirmReset(true);
                    },
                  },
                ],
              );
            }}
          />
        </HolographicFrame>
      </ScrollView>

      <SystemPopup
        visible={!!toast}
        title="알림"
        onClose={() => setToast(null)}
      >
        <Text style={{ color: colors.white, textAlign: 'center' }}>{toast}</Text>
      </SystemPopup>

      <SystemPopup
        visible={confirmReset}
        title="초기화 완료"
        tone="danger"
        onClose={() => setConfirmReset(false)}
      >
        <Text style={{ color: colors.white, textAlign: 'center' }}>
          모든 데이터가 초기화되었습니다.
        </Text>
      </SystemPopup>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Button({
  label,
  onPress,
  tone = 'cyan',
}: {
  label: string;
  onPress: () => void;
  tone?: 'cyan' | 'danger' | 'dim';
}) {
  const color =
    tone === 'danger' ? colors.danger : tone === 'dim' ? colors.muted : colors.cyanGlow;
  const border =
    tone === 'danger' ? 'rgba(255,84,112,0.7)' : tone === 'dim' ? colors.muted : colors.borderStrong;
  const bg =
    tone === 'danger'
      ? 'rgba(255,84,112,0.08)'
      : tone === 'dim'
      ? 'transparent'
      : 'rgba(79,208,255,0.08)';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { borderColor: border, backgroundColor: bg, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.btnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDeep },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { color: colors.cyanGlow, fontSize: 20, fontWeight: '800', letterSpacing: 8 },
  body: { paddingHorizontal: 20, paddingBottom: 40 },
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { color: colors.muted, fontSize: 13, letterSpacing: 2 },
  rowValue: { color: colors.white, fontSize: 13, fontWeight: '700' },
  btn: {
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: { fontSize: 13, fontWeight: '800', letterSpacing: 3 },
});
