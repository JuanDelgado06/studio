
'use client';

import type { Position } from '@/lib/types';
import * as React from 'react';
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

const STATS_STORAGE_KEY = 'poker-pro-stats';

const StatsContext = React.createContext<StatsContextType | undefined>(
  undefined
);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = React.useState<Stats>(initialStats);
  const [isClient, setIsClient] = React.useState(false);

  // Load stats from localStorage on initial client-side render
  React.useEffect(() => {
    setIsClient(true);
    try {
      const savedStats = window.localStorage.getItem(STATS_STORAGE_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error("Failed to load stats from localStorage", error);
      // If parsing fails, start with initial stats
      setStats(initialStats);
    }
  }, []);

  // Save stats to localStorage whenever they change
  React.useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
      } catch (error) {
        console.error("Failed to save stats to localStorage", error);
      }
    }
  }, [stats, isClient]);


  // Effect to fetch focus areas when hands played is a multiple of 10
  React.useEffect(() => {
    if (stats.handsPlayed > 0 && stats.handsPlayed % 10 === 0) {
      const fetchFocusAreas = async () => {
        if (stats.overallAccuracy === 'N/A') return;

        const positionalAccuracy: Record<string, number> = {};
        stats.accuracyByPosition.forEach(p => {
          positionalAccuracy[p.position] = p.accuracy / 100;
        });

        const result = await getAdaptedDifficulty({
          userStats: {
            overallAccuracy: stats.overallAccuracy / 100,
            positionalAccuracy,
            handTypeAccuracy: {},
            commonMistakes: [],
            weeklyGoalSuccessRate: stats.weeklyGoal / 100,
          },
          currentDifficulty: 'beginner',
        });
        if (result.success && result.data) {
          setStats(s => ({...s, focusAreas: result.data.suggestedFocusAreas}));
        }
      }
      fetchFocusAreas();
    }
  }, [stats.handsPlayed, stats.overallAccuracy, stats.accuracyByPosition, stats.weeklyGoal]);


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
      let handsPlayedToday = isNewDay ? 1 : (prevStats.handsPlayedToday || 0) + 1;
      let newStreak = prevStats.streak || 0;

      if (handsPlayedToday === 10) {
          if (prevStats.lastPracticeDate) {
              const lastDate = new Date(prevStats.lastPracticeDate);
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              if (lastDate.toDateString() === yesterday.toDateString()) {
                  newStreak += 1; // Continue streak
              } else if (lastDate.toDateString() !== today) {
                  newStreak = 1; // Start new streak after a gap
              }
          } else {
              newStreak = 1; // First streak ever
          }
      } else if (isNewDay) {
         // Check if a day was missed
         if (prevStats.lastPracticeDate) {
            const lastDate = new Date(prevStats.lastPracticeDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // If the last practice wasn't today or yesterday, reset streak.
            if (lastDate.toDateString() !== yesterday.toDateString() && lastDate.toDateString() !== today) {
                newStreak = 0;
            }
         }
      }


      const newWeeklyGoal = Math.min(100, Math.round((newCorrectDecisions / (newHandsPlayed + 10)) * 100));

      return {
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
    });
  };

  const resetStats = () => {
    setStats(initialStats);
     try {
        window.localStorage.removeItem(STATS_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to remove stats from localStorage", error);
      }
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
