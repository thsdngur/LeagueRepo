import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { HolographicFrame } from './HolographicFrame';
import { colors, rankColor } from '../theme/colors';
import type { Quest } from '../utils/questGenerator';

interface Props {
  quest: Quest;
  onComplete: (id: string) => void;
}

export function QuestCard({ quest, onComplete }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rankTint = rankColor[quest.rank] ?? colors.cyan;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleComplete = () => {
    if (quest.completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    scale.value = withSequence(withTiming(0.96, { duration: 80 }), withTiming(1, { duration: 120 }));
    opacity.value = withTiming(0.55, { duration: 260 }, () => {
      runOnJS(onComplete)(quest.id);
    });
  };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <HolographicFrame tone="cyan">
        <View style={styles.header}>
          <View style={[styles.rankBadge, { borderColor: rankTint }]}>
            <Text style={[styles.rankText, { color: rankTint }]}>{quest.rank}급</Text>
          </View>
          <Text style={styles.category}>{quest.category}</Text>
          <Text style={styles.reward}>+{quest.goldReward} G</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {quest.title}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.subtext}>경험치 +{quest.expReward} EXP</Text>
          <Pressable
            onPress={handleComplete}
            disabled={quest.completed}
            style={({ pressed }) => [
              styles.btn,
              quest.completed && styles.btnDone,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={[styles.btnText, quest.completed && styles.btnTextDone]}>
              {quest.completed ? '완료됨' : '완 료'}
            </Text>
          </Pressable>
        </View>
      </HolographicFrame>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  category: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 2,
    flex: 1,
  },
  reward: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 14,
  },
  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtext: {
    color: colors.cyanDim,
    fontSize: 12,
    letterSpacing: 1,
  },
  btn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(79,208,255,0.08)',
  },
  btnDone: {
    borderColor: colors.muted,
    backgroundColor: 'transparent',
  },
  btnText: {
    color: colors.cyanGlow,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
  },
  btnTextDone: {
    color: colors.muted,
  },
});
