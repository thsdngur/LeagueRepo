import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateDailyQuests, type Quest } from '../utils/questGenerator';
import { needsReset, todayKey } from '../utils/dateReset';

export interface Stats {
  str: number;
  agi: number;
  vit: number;
  int: number;
  sen: number;
}

export interface HistoryEntry {
  id: string;
  kind: 'quest' | 'exchange' | 'expire';
  title: string;
  gold: number;
  timestamp: number;
}

export const EXCHANGE_RATE_KRW_PER_GOLD = 10;
const EXP_PER_LEVEL = (lv: number) => 80 + lv * 40;

interface GameState {
  hydrated: boolean;
  gold: number;
  level: number;
  exp: number;
  stats: Stats;
  availablePoints: number;
  quests: Quest[];
  history: HistoryEntry[];
  lastGeneratedDate: string | null;
  lastNoticeShownDate: string | null;

  markHydrated: () => void;
  regenerateIfNeeded: () => { generated: boolean; newQuestCount: number };
  forceRegenerate: () => void;
  completeQuest: (id: string) => { leveledUp: boolean; goldGained: number };
  exchange: (goldAmount: number) => { krw: number; id: string; timestamp: number } | null;
  allocateStat: (key: keyof Stats) => void;
  markNoticeShown: () => void;
  resetAll: () => void;
  debugSetYesterday: () => void;
}

const initialStats: Stats = { str: 10, agi: 10, vit: 10, int: 10, sen: 10 };

function rollInitialQuests(now = Date.now()) {
  return { quests: generateDailyQuests(now), lastGeneratedDate: todayKey() };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      gold: 0,
      level: 1,
      exp: 0,
      stats: initialStats,
      availablePoints: 0,
      quests: [],
      history: [],
      lastGeneratedDate: null,
      lastNoticeShownDate: null,

      markHydrated: () => set({ hydrated: true }),

      regenerateIfNeeded: () => {
        const state = get();
        if (!needsReset(state.lastGeneratedDate)) {
          return { generated: false, newQuestCount: 0 };
        }
        const now = Date.now();
        const expired = state.quests.filter((q) => !q.completed);
        const expiredHistory: HistoryEntry[] = expired.map((q) => ({
          id: `${q.id}-expired`,
          kind: 'expire',
          title: q.title,
          gold: 0,
          timestamp: now,
        }));
        const fresh = generateDailyQuests(now);
        set({
          quests: fresh,
          lastGeneratedDate: todayKey(),
          history: [...expiredHistory, ...state.history].slice(0, 100),
        });
        return { generated: true, newQuestCount: fresh.length };
      },

      forceRegenerate: () => {
        const now = Date.now();
        const fresh = generateDailyQuests(now);
        set({ quests: fresh, lastGeneratedDate: todayKey() });
      },

      completeQuest: (id) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === id);
        if (!quest || quest.completed) return { leveledUp: false, goldGained: 0 };

        let gold = state.gold + quest.goldReward;
        let exp = state.exp + quest.expReward;
        let level = state.level;
        let availablePoints = state.availablePoints;
        let leveledUp = false;

        while (exp >= EXP_PER_LEVEL(level)) {
          exp -= EXP_PER_LEVEL(level);
          level += 1;
          availablePoints += 5;
          leveledUp = true;
        }

        const updatedQuests = state.quests.map((q) =>
          q.id === id ? { ...q, completed: true } : q,
        );
        const entry: HistoryEntry = {
          id: `${quest.id}-done`,
          kind: 'quest',
          title: quest.title,
          gold: quest.goldReward,
          timestamp: Date.now(),
        };

        set({
          gold,
          exp,
          level,
          availablePoints,
          quests: updatedQuests,
          history: [entry, ...state.history].slice(0, 100),
        });

        return { leveledUp, goldGained: quest.goldReward };
      },

      exchange: (goldAmount) => {
        const state = get();
        if (goldAmount <= 0 || goldAmount > state.gold) return null;
        const krw = goldAmount * EXCHANGE_RATE_KRW_PER_GOLD;
        const id = Math.random().toString(36).slice(2, 10).toUpperCase();
        const timestamp = Date.now();
        const entry: HistoryEntry = {
          id: `${id}-ex`,
          kind: 'exchange',
          title: `환전 ${goldAmount} G → ${krw.toLocaleString()} 원`,
          gold: -goldAmount,
          timestamp,
        };
        set({
          gold: state.gold - goldAmount,
          history: [entry, ...state.history].slice(0, 100),
        });
        return { krw, id, timestamp };
      },

      allocateStat: (key) => {
        const state = get();
        if (state.availablePoints <= 0) return;
        set({
          stats: { ...state.stats, [key]: state.stats[key] + 1 },
          availablePoints: state.availablePoints - 1,
        });
      },

      markNoticeShown: () => set({ lastNoticeShownDate: todayKey() }),

      resetAll: () => {
        const seeded = rollInitialQuests();
        set({
          gold: 0,
          level: 1,
          exp: 0,
          stats: initialStats,
          availablePoints: 0,
          quests: seeded.quests,
          history: [],
          lastGeneratedDate: seeded.lastGeneratedDate,
          lastNoticeShownDate: null,
        });
      },

      debugSetYesterday: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        set({ lastGeneratedDate: `${y}-${m}-${day}`, lastNoticeShownDate: null });
      },
    }),
    {
      name: 'awakened-quest-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
      partialize: (state) => ({
        gold: state.gold,
        level: state.level,
        exp: state.exp,
        stats: state.stats,
        availablePoints: state.availablePoints,
        quests: state.quests,
        history: state.history,
        lastGeneratedDate: state.lastGeneratedDate,
        lastNoticeShownDate: state.lastNoticeShownDate,
      }),
    },
  ),
);

export function expForNext(level: number): number {
  return EXP_PER_LEVEL(level);
}
