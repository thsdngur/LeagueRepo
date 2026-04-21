import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { HolographicFrame } from './HolographicFrame';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  tone?: 'cyan' | 'gold' | 'danger';
  closeLabel?: string;
}

export function SystemPopup({
  visible,
  title = '알림',
  onClose,
  children,
  tone = 'cyan',
  closeLabel = '확인',
}: Props) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      scale.value = withSpring(1, { damping: 12, stiffness: 140 });
      opacity.value = withTiming(1, { duration: 220 });
      glow.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = 0.85;
      opacity.value = 0;
    }
  }, [visible, scale, opacity, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.backdrop}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
            <HolographicFrame tone={tone}>
              <Text style={[styles.tag, { color: toneColor(tone) }]}>[ {title} ]</Text>
              <View style={styles.divider} />
              <View style={styles.body}>{children}</View>
              <View style={styles.divider} />
              <Pressable
                style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onClose();
                }}
              >
                <Text style={[styles.btnText, { color: toneColor(tone) }]}>{closeLabel}</Text>
              </Pressable>
            </HolographicFrame>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
}

function toneColor(tone: 'cyan' | 'gold' | 'danger') {
  if (tone === 'gold') return colors.gold;
  if (tone === 'danger') return colors.danger;
  return colors.cyan;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  container: { width: '100%', maxWidth: 360 },
  glow: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    borderRadius: 40,
    backgroundColor: 'transparent',
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  tag: {
    fontSize: 13,
    letterSpacing: 2,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  body: { paddingVertical: 8 },
  btn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 4,
  },
});
