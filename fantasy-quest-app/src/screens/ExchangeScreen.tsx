import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGameStore, EXCHANGE_RATE_KRW_PER_GOLD } from '../store/gameStore';
import { HolographicFrame } from '../components/HolographicFrame';
import { GoldCounter } from '../components/GoldCounter';
import { BankTransferModal, type TransferResult } from '../components/BankTransferModal';
import { SystemPopup } from '../components/SystemPopup';
import { colors } from '../theme/colors';

const PRESETS = [10, 50, 100, 500, 1000];

export function ExchangeScreen() {
  const gold = useGameStore((s) => s.gold);
  const exchange = useGameStore((s) => s.exchange);

  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<TransferResult | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState<string | null>(null);

  const parsed = Math.max(0, Math.floor(Number(amount) || 0));
  const krw = useMemo(() => parsed * EXCHANGE_RATE_KRW_PER_GOLD, [parsed]);
  const canSend = parsed > 0 && parsed <= gold;

  const handleSend = () => {
    Keyboard.dismiss();
    if (parsed <= 0) {
      setErrorOpen('골드 수량을 입력해주세요.');
      return;
    }
    if (parsed > gold) {
      setErrorOpen('보유 골드가 부족합니다.');
      return;
    }
    const res = exchange(parsed);
    if (!res) {
      setErrorOpen('환전에 실패했습니다.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setResult({
      id: res.id,
      goldAmount: parsed,
      krw: res.krw,
      timestamp: res.timestamp,
    });
    setTransferOpen(true);
    setAmount('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>환 전 소</Text>
          <Text style={styles.subtitle}>1 G = {EXCHANGE_RATE_KRW_PER_GOLD} 원</Text>
        </View>
        <GoldCounter gold={gold} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HolographicFrame>
          <Text style={styles.sectionTitle}>[ 골 드 환 전 ]</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>보낼 골드</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor={colors.cyanDim}
              keyboardType="number-pad"
              style={styles.input}
              maxLength={7}
            />
            <Text style={styles.inputUnit}>G</Text>
          </View>

          <View style={styles.presetRow}>
            {PRESETS.map((v) => (
              <Pressable
                key={v}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setAmount(String(Math.min(v, gold)));
                }}
                style={({ pressed }) => [styles.preset, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.presetText}>{v}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setAmount(String(gold))}
              style={({ pressed }) => [
                styles.preset,
                styles.presetMax,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.presetText, { color: colors.gold }]}>MAX</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />
          <Text style={styles.label}>받을 금액</Text>
          <Text style={styles.krw}>{krw.toLocaleString()} 원</Text>

          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={[styles.sendText, !canSend && { color: colors.muted }]}>송 금</Text>
          </Pressable>

          <Text style={styles.fine}>
            ※ 본 환전은 시각적 시뮬레이션이며 실제 금융 거래가 아닙니다.
          </Text>
        </HolographicFrame>
      </ScrollView>

      <BankTransferModal
        visible={transferOpen}
        result={result}
        onClose={() => {
          setTransferOpen(false);
          setResult(null);
        }}
      />

      <SystemPopup
        visible={!!errorOpen}
        title="경고"
        tone="danger"
        onClose={() => setErrorOpen(null)}
      >
        <Text style={{ color: colors.white, textAlign: 'center' }}>{errorOpen}</Text>
      </SystemPopup>
    </SafeAreaView>
  );
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
    marginVertical: 12,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.borderStrong,
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    color: colors.cyanGlow,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    padding: 0,
  },
  inputUnit: {
    color: colors.cyan,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  preset: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(79,208,255,0.06)',
  },
  presetMax: { borderColor: colors.gold },
  presetText: {
    color: colors.cyanGlow,
    fontSize: 12,
    fontWeight: '700',
  },
  krw: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'right',
    letterSpacing: 1,
  },
  sendBtn: {
    marginTop: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(79,208,255,0.12)',
  },
  sendBtnDisabled: {
    borderColor: colors.muted,
    backgroundColor: 'transparent',
  },
  sendText: {
    color: colors.cyanGlow,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 8,
  },
  fine: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 1,
  },
});
