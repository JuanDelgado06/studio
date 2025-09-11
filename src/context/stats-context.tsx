
'use client';

import type { Position } from '@/lib/types';
import * as React from 'react';
import { adaptDifficultyBasedOnProgress } from '@/ai/flows/adapt-difficulty-based-on-progress';
import { getAdaptedDifficulty } from '@/lib/actions';

type AccuracyData = {
  position: string;
  accuracy: number;
  total: number;
  correct: number;
};

type Stats = {
  handsPlayed: number;
  overallAccuracy: number | 'N/A';
  correctDecisions: number;
  commonErrors: number;
  streak: number;
  weeklyGoal: number;
  focusAreas: string[];
  accuracyByPosition: AccuracyData[];
  lastPracticeDate: string | null;
  handsPlayedToday: number;
};

type StatsContextType = {
  stats: Stats;
  recordHand: (position: Position, isCorrect: boolean) => void;
  resetStats: () => void;
  isClient: boolean;
};

const initialAccuracyByPosition: AccuracyData[] = [
  { position: 'SB', accuracy: 0, total: 0, correct: 0 },
  { position: 'BB', accuracy: 0, total: 0, correct: 0 },
  { position: 'UTG', accuracy: 0, total: 0, correct: 0 },
  { position: 'MP', accuracy: 0, total: 0, correct: 0 },
  { position: 'CO', accuracy: 0, total: 0, correct: 0 },
  { position: 'BTN', accuracy: 0, total: 0, correct: 0 },
];

const initialStats: Stats = {
  handsPlayed: 0,
  overallAccuracy: 'N/A',
  correctDecisions: 0,
  commonErrors: 0,
  streak: 0,
  weeklyGoal: 0,
  focusAreas: [],
  accuracyByPosition: initialAccuracyByPosition,
  lastPracticeDate: null,
  handsPlayedToday: 0,
};

const StatsContext = React.createContext<StatsContextType | undefined>(
  undefined
);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = React.useState<Stats>(initialStats);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    // You can also load stats from localStorage here if needed
  }, []);

  const recordHand = (position: Position, isCorrect: boolean) => {
    setStats((prevStats) => {
      const today = new Date().toDateString();
      const newHandsPlayed = prevStats.handsPlayed + 1;
      const newCorrectDecisions = isCorrect
        ? prevStats.correctDecisions + 1
        : prevStats.correctDecisions;
      const newCommonErrors = !isCorrect
        ? prevStats.commonErrors + 1
        : prevStats.commonErrors;

      const newOverallAccuracy =
        newHandsPlayed > 0
          ? Math.round((newCorrectDecisions / newHandsPlayed) * 100)
          : 'N/A';
      
      const newAccuracyByPosition = prevStats.accuracyByPosition.map((pos) => {
          if (pos.position === position) {
              const newTotal = pos.total + 1;
              const newCorrect = isCorrect ? pos.correct + 1 : pos.correct;
              return {
                  ...pos,
                  total: newTotal,
                  correct: newCorrect,
                  accuracy: Math.round((newCorrect / newTotal) * 100),
              }
          }
          return pos;
      });

      const isNewDay = prevStats.lastPracticeDate !== today;
      const handsPlayedToday = isNewDay ? 1 : prevStats.handsPlayedToday + 1;
      let newStreak = prevStats.streak;

      if (isNewDay && prevStats.lastPracticeDate !== null) {
          const lastDate = new Date(prevStats.lastPracticeDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDate.toDateString() !== yesterday.toDateString()) {
            newStreak = 0; // Reset streak if a day was missed
          }
      }

      if (handsPlayedToday === 10) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (prevStats.lastPracticeDate === yesterday.toDateString()) {
            newStreak += 1; // Continue streak
        } else {
            newStreak = 1; // Start a new streak
        }
      }


      const newWeeklyGoal = Math.min(100, Math.round((newCorrectDecisions / (newHandsPlayed + 10)) * 100));

      const updatedStats = {
        ...prevStats,
        handsPlayed: newHandsPlayed,
        correctDecisions: newCorrectDecisions,
        commonErrors: newCommonErrors,
        overallAccuracy: newOverallAccuracy,
        accuracyByPosition: newAccuracyByPosition,
        streak: newStreak,
        weeklyGoal: newWeeklyGoal,
        lastPracticeDate: today,
        handsPlayedToday: handsPlayedToday,
      };

      if (newHandsPlayed > 0 && newHandsPlayed % 10 === 0) {
        const fetchFocusAreas = async () => {
          const positionalAccuracy: Record<string, number> = {};
          updatedStats.accuracyByPosition.forEach(p => {
            positionalAccuracy[p.position] = p.accuracy / 100;
          });

          const result = await getAdaptedDifficulty({
            userStats: {
              overallAccuracy: (updatedStats.overallAccuracy as number) / 100,
              positionalAccuracy,
              handTypeAccuracy: {}, 
              commonMistakes: [],
              weeklyGoalSuccessRate: updatedStats.weeklyGoal / 100,
            },
            currentDifficulty: 'beginner',
          });
          if (result.success && result.data) {
            setStats(s => ({...s, focusAreas: result.data.suggestedFocusAreas}));
          }
        }
        fetchFocusAreas();
      }


      return updatedStats;
    });
  };

  const resetStats = () => {
    setStats(initialStats);
  };

  return (
    <StatsContext.Provider value={{ stats, recordHand, resetStats, isClient }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = React.useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}
