import type { Rank } from '../theme/colors';
import {
  dailyRankDistribution,
  questTemplates,
  rankRewards,
  type QuestCategory,
} from '../data/questTemplates';

export interface Quest {
  id: string;
  rank: Rank;
  category: QuestCategory;
  title: string;
  goldReward: number;
  expReward: number;
  completed: boolean;
  createdAt: number;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function quantize(min: number, max: number, step: number): number {
  const steps = Math.floor((max - min) / step) + 1;
  return min + Math.floor(Math.random() * steps) * step;
}

export function generateQuest(rank: Rank, createdAt: number): Quest {
  const template = pick(questTemplates);
  const n = quantize(template.min, template.max, template.step);
  const reward = rankRewards[rank];
  return {
    id: randomId(),
    rank,
    category: template.category,
    title: template.title(n),
    goldReward: reward.gold,
    expReward: reward.exp,
    completed: false,
    createdAt,
  };
}

export function generateDailyQuests(now: number = Date.now()): Quest[] {
  return dailyRankDistribution.map((rank) => generateQuest(rank, now));
}
