import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

type Action = 'raise' | 'call' | 'fold';
type HandRange = Record<string, Action>;

interface HandRangeGridProps {
  currentHand?: string | null;
  range?: HandRange | null;
}

const actionColors: Record<Action, string> = {
    raise: 'bg-green-500/30 border-green-500/50',
    call: 'bg-blue-500/30 border-blue-500/50',
    fold: 'bg-secondary/20 border-border',
}

const pairColors: Record<Action, string> = {
    raise: 'bg-green-700/50 border-green-700/80 text-white',
    call: 'bg-blue-700/50 border-blue-700/80 text-white',
    fold: 'bg-destructive/20 text-destructive-foreground',
}

export const HandRangeGrid: React.FC<HandRangeGridProps> = ({
  currentHand,
  range,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Rango de Manos GTO</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-13 gap-1 font-mono text-xs">
          {RANKS.map((rowRank, i) =>
            RANKS.map((colRank, j) => {
              let hand: string;
              let handType: 'pair' | 'suited' | 'offsuit';

              if (i < j) {
                hand = `${rowRank}${colRank}s`; // Suited
                handType = 'suited';
              } else if (i > j) {
                hand = `${colRank}${rowRank}o`; // Offsuit
                handType = 'offsuit';
              } else {
                hand = `${rowRank}${colRank}`; // Pair
                handType = 'pair';
              }

              const isCurrentHand = hand === currentHand;
              const action = range ? range[hand] : 'fold';

              let cellClass = '';
              if (range) {
                 if (handType === 'pair') {
                    cellClass = pairColors[action] || pairColors.fold;
                 } else {
                    cellClass = actionColors[action] || actionColors.fold;
                 }
              } else {
                // Default styling if no range is provided
                if (handType === 'suited') cellClass = 'bg-primary/10';
                else if (handType === 'offsuit') cellClass = 'bg-secondary/20';
                else if (handType === 'pair') cellClass = 'bg-destructive/20 text-destructive-foreground';
              }
              

              return (
                <div
                  key={hand}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md border text-center text-xs font-semibold transition-colors duration-300',
                    cellClass,
                    isCurrentHand &&
                      'ring-4 ring-primary ring-offset-2 ring-offset-background'
                  )}
                  title={`${hand}: ${action}`}
                >
                  {hand.slice(0, 2)}
                </div>
              );
            })
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm border border-green-500/50 bg-green-500/30" />
                <span>Raise</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm border border-blue-500/50 bg-blue-500/30" />
                <span>Call</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm border border-border bg-secondary/20" />
                <span>Fold</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
