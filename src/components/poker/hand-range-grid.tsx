import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

interface HandRangeGridProps {
  currentHand?: string | null;
}

export const HandRangeGrid: React.FC<HandRangeGridProps> = ({
  currentHand,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Rango de Manos</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="grid grid-cols-13 gap-1 font-mono text-xs">
          {RANKS.map((rowRank, i) =>
            RANKS.map((colRank, j) => {
              let hand: string;
              if (i < j) {
                hand = `${rowRank}${colRank}s`; // Suited
              } else if (i > j) {
                hand = `${colRank}${rowRank}o`; // Offsuit
              } else {
                hand = `${rowRank}${colRank}`; // Pair
              }

              const isCurrentHand = hand === currentHand;

              return (
                <div
                  key={hand}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md border text-center text-xs font-semibold',
                    i < j && 'bg-primary/10', // Suited
                    i > j && 'bg-secondary/20', // Offsuit
                    i === j && 'bg-destructive/20 text-destructive-foreground', // Pair
                    isCurrentHand &&
                      'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                >
                  {hand.slice(0, 2)}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
