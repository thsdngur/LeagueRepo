import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { HolographicFrame } from './HolographicFrame';
import { colors } from '../theme/colors';

type Phase = 'idle' | 'sending' | 'progress' | 'receipt';

interface TransferResult {
  id: string;
  goldAmount: number;
  krw: number;
  timestamp: number;
}

interface Props {
  visible: boolean;
  result: TransferResult | null;
  onClose: () => void;
}

export function BankTransferModal({ visible, result, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const progress = useSharedValue(0);
  const spinner = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timerRef.current;
    if (!visible || !result) {
      setPhase('idle');
      progress.value = 0;
      timers.forEach((t) => clearTimeout(t));
      timers.length = 0;
      return;
    }

    setPhase('sending');
    progress.value = 0;
    spinner.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    timers.push(
      setTimeout(() => {
        setPhase('progress');
        progress.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }, 800),
    );
    timers.push(
      setTimeout(() => {
        setPhase('receipt');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }, 2400),
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.length = 0;
    };
  }, [visible, result, progress, spinner]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinner.value * 360}deg` }],
  }));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.backdrop}>
          <View style={styles.container}>
            <HolographicFrame tone={phase === 'receipt' ? 'gold' : 'cyan'}>
              {phase !== 'receipt' ? (
                <View style={styles.padded}>
                  <Text style={styles.tag}>[ 시스템 환전소 ]</Text>
                  <View style={styles.divider} />
                  <View style={styles.centerRow}>
                    <Animated.View style={[styles.spinner, spinnerStyle]}>
                      <View style={styles.spinnerDot} />
                    </Animated.View>
                    <Text style={styles.bigLabel}>
                      {phase === 'sending' ? '전송 준비 중...' : '전송 중...'}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, progressStyle]} />
                  </View>
                  <Text style={styles.amountLabel}>
                    {result ? result.goldAmount.toLocaleString() : 0} G
                  </Text>
                  <Text style={styles.amountArrow}>▼</Text>
                  <Text style={styles.krw}>
                    {result ? result.krw.toLocaleString() : 0} 원
                  </Text>
                </View>
              ) : (
                <View style={styles.padded}>
                  <Text style={[styles.tag, { color: colors.gold }]}>[ 송금 완료 ]</Text>
                  <View style={styles.divider} />
                  <ReceiptRow label="보낸 곳" value="시스템 은행" />
                  <ReceiptRow label="받는 분" value="플레이어 본인" />
                  <ReceiptRow label="금액" value={`${(result?.krw ?? 0).toLocaleString()} 원`} highlight />
                  <ReceiptRow label="차감" value={`${(result?.goldAmount ?? 0).toLocaleString()} G`} />
                  <ReceiptRow label="거래번호" value={result?.id ?? '-'} />
                  <ReceiptRow label="시각" value={formatTimestamp(result?.timestamp)} />
                  <View style={styles.divider} />
                  <Text style={styles.watermark}>※ 시뮬레이션 전용 — 실제 송금은 이루어지지 않았습니다</Text>
                  <View style={styles.divider} />
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      onClose();
                    }}
                    style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={styles.closeText}>확 인</Text>
                  </Pressable>
                </View>
              )}
            </HolographicFrame>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

function ReceiptRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={[styles.receiptValue, highlight && { color: colors.gold, fontSize: 16 }]}>
        {value}
      </Text>
    </View>
  );
}

function formatTimestamp(ts?: number) {
  if (!ts) return '-';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  container: { width: '100%', maxWidth: 380 },
  padded: { paddingVertical: 4 },
  tag: {
    color: colors.cyanGlow,
    fontSize: 13,
    letterSpacing: 3,
    textAlign: 'center',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  centerRow: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  bigLabel: {
    color: colors.cyanGlow,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.cyanDim,
    borderTopColor: colors.cyanGlow,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  spinnerDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.cyanGlow,
    marginTop: -4,
    shadowColor: colors.cyan,
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(79,208,255,0.15)',
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.cyan,
  },
  amountLabel: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 16,
  },
  amountArrow: {
    color: colors.muted,
    textAlign: 'center',
    marginVertical: 4,
  },
  krw: {
    color: colors.cyanGlow,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: colors.cyan,
    textShadowRadius: Platform.OS === 'ios' ? 8 : 0,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  receiptLabel: { color: colors.muted, fontSize: 12, letterSpacing: 2 },
  receiptValue: { color: colors.white, fontSize: 13, fontWeight: '700' },
  watermark: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  closeBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  closeText: {
    color: colors.gold,
    fontWeight: '800',
    letterSpacing: 6,
  },
});

export type { TransferResult };
