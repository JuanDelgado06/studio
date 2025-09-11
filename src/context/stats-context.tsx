
'use client';

import type { Position } from '@/lib/types';
import * as React from 'react';

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

      return {
        ...prevStats,
        handsPlayed: newHandsPlayed,
        correctDecisions: newCorrectDecisions,
        commonErrors: newCommonErrors,
        overallAccuracy: newOverallAccuracy,
        accuracyByPosition: newAccuracyByPosition,
      };
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
