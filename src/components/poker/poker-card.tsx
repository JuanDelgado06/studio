import { cn } from '@/lib/utils';
import React from 'react';

type Suit = 's' | 'h' | 'd' | 'c';
type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

interface PokerCardProps {
  rank: Rank;
  suit: Suit;
  className?: string;
}

const suitSymbols: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: Record<Suit, string> = {
  s: 'text-foreground',
  h: 'text-destructive',
  d: 'text-destructive',
  c: 'text-foreground',
};


export const PokerCard: React.FC<PokerCardProps> = ({ rank, suit, className }) => {
  return (
    <div
      className={cn(
        'relative flex h-28 w-20 flex-col justify-between rounded-lg border-2 bg-card p-2 shadow-md',
        'sm:h-36 sm:w-24',
        suitColors[suit],
        className
      )}
    >
      <div className="text-left">
        <div className="text-xl font-bold leading-none sm:text-2xl">{rank}</div>
        <div className="text-sm leading-none sm:text-base">{suitSymbols[suit]}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold sm:text-5xl">
        {suitSymbols[suit]}
      </div>
      <div className="rotate-180 text-left">
        <div className="text-xl font-bold leading-none sm:text-2xl">{rank}</div>
        <div className="text-sm leading-none sm:text-base">{suitSymbols[suit]}</div>
      </div>
    </div>
  );
};
