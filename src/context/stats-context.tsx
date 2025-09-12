
'use client';

import type { Position, Action } from '@/lib/types';
import * as React from 'react';
import { getAdaptedDifficulty } from '@/lib/actions';
import type { AnalyzePreflopDecisionInput } from '@/ai/flows/analyze-preflop-decision';

type AccuracyData = {
  position: string;
  accuracy: number;
  total: number;
  correct: number;
};

type DecisionRecord = AnalyzePreflopDecisionInput & {
    isCorrect: boolean;
    timestamp: number;
}

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
  decisionHistory: DecisionRecord[];
};

type StatsContextType = {
  stats: Stats;
  recordHand: (handData: AnalyzePreflopDecisionInput, isCorrect: boolean) => void;
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
  decisionHistory: [],
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
        const parsedStats = JSON.parse(savedStats);
        // Ensure accuracyByPosition is initialized correctly if it's missing from storage
        if (!parsedStats.accuracyByPosition || parsedStats.accuracyByPosition.length === 0) {
          parsedStats.accuracyByPosition = initialAccuracyByPosition;
        }
        if (!parsedStats.decisionHistory) {
            parsedStats.decisionHistory = [];
        }
        setStats(parsedStats);
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
    if (isClient && stats.handsPlayed > 0 && stats.handsPlayed % 10 === 0) {
      const fetchFocusAreas = async () => {
        if (stats.overallAccuracy === 'N/A' || typeof stats.overallAccuracy !== 'number') return;

        const positionalAccuracy: Record<string, number> = {};
        stats.accuracyByPosition.forEach(p => {
          positionalAccuracy[p.position] = p.accuracy / 100;
        });

        try {
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
            setStats(s => ({...s, focusAreas: result.data!.suggestedFocusAreas}));
          }
        } catch(e) {
          console.error("Error fetching adapted difficulty:", e);
        }
      }
      fetchFocusAreas();
    }
  }, [stats.handsPlayed, isClient, stats.accuracyByPosition, stats.overallAccuracy, stats.weeklyGoal]);


  const recordHand = React.useCallback((handData: AnalyzePreflopDecisionInput, isCorrect: boolean) => {
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
      
      const newAccuracyByPosition = prevStats.accuracyByPosition.map((posData) => {
          if (posData.position === handData.position) {
              const newTotal = posData.total + 1;
              const newCorrect = isCorrect ? posData.correct + 1 : posData.correct;
              return {
                  ...posData,
                  total: newTotal,
                  correct: newCorrect,
                  accuracy: newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0,
              }
          }
          return posData;
      });

      const isNewDay = prevStats.lastPracticeDate !== today;
      let handsPlayedToday = isNewDay ? 1 : (prevStats.handsPlayedToday || 0) + 1;
      let newStreak = prevStats.streak || 0;
      
      if (isNewDay) {
        if (prevStats.lastPracticeDate) {
          const lastDate = new Date(prevStats.lastPracticeDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
      
          if (lastDate.toDateString() !== yesterday.toDateString()) {
            newStreak = 0;
          }
        } else {
            newStreak = 0;
        }
      }

      if (handsPlayedToday === 10) {
        newStreak = newStreak + 1;
      }

      const newWeeklyGoal = Math.min(100, Math.round((newCorrectDecisions / (newHandsPlayed + 10)) * 100));

      const newDecisionRecord: DecisionRecord = {
        ...handData,
        isCorrect,
        timestamp: Date.now(),
      };
      const newDecisionHistory = [...(prevStats.decisionHistory || []), newDecisionRecord].slice(-50); // Keep last 50 decisions

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
        decisionHistory: newDecisionHistory,
      };
    });
  }, []);

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

    