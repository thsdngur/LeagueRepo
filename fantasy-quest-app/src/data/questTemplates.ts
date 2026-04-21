import type { Rank } from '../theme/colors';

export type QuestCategory = '운동' | '학습' | '생활' | '정신';

export interface QuestTemplate {
  category: QuestCategory;
  title: (n: number) => string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export const questTemplates: QuestTemplate[] = [
  { category: '운동', title: (n) => `팔굽혀펴기 ${n}회`, min: 10, max: 60, step: 5 },
  { category: '운동', title: (n) => `스쿼트 ${n}회`, min: 15, max: 80, step: 5 },
  { category: '운동', title: (n) => `플랭크 ${n}초 버티기`, min: 30, max: 180, step: 15 },
  { category: '운동', title: (n) => `윗몸일으키기 ${n}회`, min: 10, max: 60, step: 5 },
  { category: '운동', title: (n) => `${n}분간 달리기`, min: 10, max: 40, step: 5 },
  { category: '운동', title: (n) => `계단 ${n}층 오르기`, min: 5, max: 30, step: 1 },
  { category: '운동', title: (n) => `스트레칭 ${n}분`, min: 5, max: 20, step: 5 },

  { category: '학습', title: (n) => `독서 ${n}분`, min: 15, max: 90, step: 15 },
  { category: '학습', title: (n) => `영어 단어 ${n}개 암기`, min: 10, max: 50, step: 5 },
  { category: '학습', title: (n) => `강의 ${n}분 수강`, min: 20, max: 120, step: 10 },
  { category: '학습', title: (n) => `문제 ${n}개 풀기`, min: 5, max: 30, step: 5 },
  { category: '학습', title: (n) => `필기 노트 ${n}페이지 정리`, min: 1, max: 10, step: 1 },
  { category: '학습', title: (n) => `코딩 ${n}분 집중`, min: 30, max: 180, step: 15 },

  { category: '생활', title: (n) => `물 ${n}ml 마시기`, min: 500, max: 3000, step: 250 },
  { category: '생활', title: (n) => `${n}분 내에 방 청소`, min: 10, max: 30, step: 5 },
  { category: '생활', title: (n) => `설거지 ${n}분 안에 끝내기`, min: 5, max: 20, step: 5 },
  { category: '생활', title: (n) => `일찍 일어나기 (오전 ${n}시 전)`, min: 6, max: 9, step: 1 },
  { category: '생활', title: (n) => `${n}시간 스마트폰 사용 금지`, min: 1, max: 4, step: 1 },
  { category: '생활', title: (n) => `걷기 ${n}보`, min: 3000, max: 15000, step: 1000 },
  { category: '생활', title: (n) => `건강한 식사 ${n}끼`, min: 1, max: 3, step: 1 },

  { category: '정신', title: (n) => `명상 ${n}분`, min: 5, max: 30, step: 5 },
  { category: '정신', title: (n) => `감사 일기 ${n}줄 작성`, min: 3, max: 10, step: 1 },
  { category: '정신', title: (n) => `${n}분간 심호흡`, min: 3, max: 15, step: 2 },
  { category: '정신', title: (n) => `오늘의 목표 ${n}개 정리`, min: 3, max: 7, step: 1 },
  { category: '정신', title: (n) => `일기 ${n}분 작성`, min: 5, max: 20, step: 5 },
];

export const rankRewards: Record<Rank, { gold: number; exp: number }> = {
  E: { gold: 10, exp: 5 },
  D: { gold: 30, exp: 15 },
  C: { gold: 60, exp: 30 },
  B: { gold: 120, exp: 60 },
  A: { gold: 250, exp: 125 },
  S: { gold: 600, exp: 300 },
};

export const dailyRankDistribution: Rank[] = ['E', 'E', 'D', 'C', 'B', 'A'];
