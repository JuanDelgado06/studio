import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BarChartHorizontal } from 'lucide-react';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

type Action = 'raise' | 'call' | 'fold' | '3-bet' | '4-bet' | 'all-in';
type HandRange = Record<string, Action>;

interface HandRangeGridProps {
  currentHand?: string | null;
  range?: HandRange | null;
}

const actionStyles: Record<Action, { className: string; label: string }> = {
  raise: { className: 'bg-green-500/30 border-green-500/60', label: 'Raise' },
  '3-bet': { className: 'bg-amber-500/30 border-amber-500/60', label: '3-Bet' },
  '4-bet': { className: 'bg-purple-500/30 border-purple-500/60', label: '4-Bet' },
  'all-in': { className: 'bg-destructive/30 border-destructive/60', label: 'All-in' },
  call: { className: 'bg-sky-500/30 border-sky-500/60', label: 'Call' },
  fold: { className: 'bg-neutral-500/20 border-neutral-500/40', label: 'Fold' },
};

const pairActionStyles: Record<Action, string> = {
  raise: 'bg-green-600 border-green-500 text-white font-bold',
  '3-bet': 'bg-amber-600 border-amber-500 text-white font-bold',
  '4-bet': 'bg-purple-600 border-purple-500 text-white font-bold',
  'all-in': 'bg-destructive border-red-700 text-white font-bold',
  call: 'bg-sky-600 border-sky-500 text-white font-bold',
  fold: 'bg-neutral-600/50 border-neutral-500 text-neutral-200',
};

const actionOrder: Action[] = ['all-in', '4-bet', '3-bet', 'raise', 'call', 'fold'];


export const HandRangeGrid: React.FC<HandRangeGridProps> = ({
  currentHand,
  range,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChartHorizontal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline">Rango de Manos GTO</CardTitle>
            <CardDescription>Visualización de la estrategia óptima.</CardDescription>
          </div>
        </div>
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
              const action = range ? range[hand] || 'fold' : 'fold';

              let cellClass = '';
              if (range) {
                 if (handType === 'pair') {
                    cellClass = pairActionStyles[action] || pairActionStyles.fold;
                 } else {
                    cellClass = actionStyles[action].className || actionStyles.fold.className;
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
                    'lg:h-9 lg:w-9',
                    cellClass,
                    isCurrentHand &&
                      'ring-4 ring-offset-2 ring-primary ring-offset-background scale-110'
                  )}
                  title={`${hand}: ${action}`}
                >
                  {hand.slice(0, 2)}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
       <div className="border-t bg-card-foreground/5 p-4">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs">
              {actionOrder.map((action) => {
                  const style = actionStyles[action];
                  if (!style) return null;
                  return (
                      <div key={action} className="flex items-center gap-2">
                          <div className={cn("h-3 w-3 rounded-full border", style.className)} />
                          <span className="font-semibold capitalize">{style.label}</span>
                      </div>
                  );
              })}
          </div>
      </div>
    </Card>
  );
};
