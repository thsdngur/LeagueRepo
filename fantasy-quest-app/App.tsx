import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QuestsScreen } from './src/screens/QuestsScreen';
import { StatusScreen } from './src/screens/StatusScreen';
import { ExchangeScreen } from './src/screens/ExchangeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme/colors';
import { useGameStore } from './src/store/gameStore';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bgDeep,
    card: colors.bgPanel,
    text: colors.white,
    border: colors.border,
    primary: colors.cyan,
    notification: colors.gold,
  },
};

export default function App() {
  const hydrated = useGameStore((s) => s.hydrated);
  const regenerateIfNeeded = useGameStore((s) => s.regenerateIfNeeded);

  useEffect(() => {
    if (hydrated) regenerateIfNeeded();
  }, [hydrated, regenerateIfNeeded]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          {!hydrated ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>[ 시스템 초기화 중 ]</Text>
            </View>
          ) : (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.cyanGlow,
                tabBarInactiveTintColor: colors.muted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ focused, color }) => (
                  <TabGlyph label={tabLabel(route.name)} focused={focused} color={color} />
                ),
              })}
            >
              <Tab.Screen name="Quests" component={QuestsScreen} options={{ title: '퀘스트' }} />
              <Tab.Screen name="Status" component={StatusScreen} options={{ title: '상태창' }} />
              <Tab.Screen name="Exchange" component={ExchangeScreen} options={{ title: '환전소' }} />
              <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
            </Tab.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function tabLabel(name: string) {
  if (name === 'Quests') return '퀘';
  if (name === 'Status') return '상';
  if (name === 'Exchange') return '환';
  return '설';
}

function TabGlyph({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <View
      style={[
        styles.glyph,
        {
          borderColor: focused ? colors.cyanGlow : 'rgba(106,122,153,0.5)',
          backgroundColor: focused ? 'rgba(79,208,255,0.12)' : 'transparent',
          shadowOpacity: focused ? 0.9 : 0,
        },
      ]}
    >
      <Text style={[styles.glyphText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDeep,
  },
  loadingText: {
    color: colors.cyan,
    letterSpacing: 3,
    fontSize: 14,
  },
  tabBar: {
    backgroundColor: colors.bgPanel,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  glyph: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cyan,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  glyphText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
