
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
};

const StatsContext = React.createContext<StatsContextType | undefined>(
  undefined
);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = React.useState<Stats>(initialStats);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const recordHand = (position: Position, isCorrect: boolean) => {
    setStats((prevStats) => {
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

      // Simple placeholder logic for streak and weekly goal
      const newStreak = isCorrect ? prevStats.streak + 1 : 0;
      const newWeeklyGoal = Math.min(100, Math.round((newCorrectDecisions / (newHandsPlayed + 10)) * 100)); // Example goal logic

      const updatedStats = {
        ...prevStats,
        handsPlayed: newHandsPlayed,
        correctDecisions: newCorrectDecisions,
        commonErrors: newCommonErrors,
        overallAccuracy: newOverallAccuracy,
        accuracyByPosition: newAccuracyByPosition,
        streak: newStreak,
        weeklyGoal: newWeeklyGoal,
      };

      // Every 10 hands, ask the AI for new focus areas
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
              // These are placeholders for now
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
