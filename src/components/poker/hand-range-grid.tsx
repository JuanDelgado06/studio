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
    'all-in': { className: 'bg-red-500/80 border-red-400 text-white', label: 'All-in' },
    '4-bet': { className: 'bg-purple-500/80 border-purple-400 text-white', label: '4-Bet' },
    '3-bet': { className: 'bg-amber-500/80 border-amber-400 text-amber-950', label: '3-Bet' },
    raise: { className: 'bg-primary/80 border-primary/90', label: 'Raise' },
    call: { className: 'bg-sky-500/80 border-sky-400', label: 'Call' },
    fold: { className: 'bg-zinc-500/20 border-zinc-500/30 text-zinc-400', label: 'Fold' },
};


const actionOrder: Action[] = ['all-in', '4-bet', '3-bet', 'raise', 'call'];


export const HandRangeGrid: React.FC<HandRangeGridProps> = ({
  currentHand,
  range,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
              <BarChartHorizontal className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline text-xl sm:text-2xl">Rango de Manos GTO</CardTitle>
            <CardDescription>Visualización de la estrategia óptima.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-13 gap-0.5 sm:gap-1 font-mono text-xs">
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

              let cellClass = actionStyles[action]?.className || actionStyles.fold.className;
              
              return (
                <div
                  key={hand}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-sm border text-center text-[10px] font-bold transition-transform duration-300',
                    'sm:h-8 sm:w-8 sm:rounded-md sm:text-xs',
                    'lg:h-9 lg:w-9',
                    cellClass,
                    isCurrentHand &&
                      'ring-2 ring-offset-1 ring-accent ring-offset-background scale-125 z-10 sm:ring-4'
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
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {actionOrder.map((action) => {
                  const style = actionStyles[action];
                  if (!style) return null;
                  return (
                      <Badge key={action} className={cn('text-xs', style.className)}>
                        {style.label}
                      </Badge>
                  );
              })}
          </div>
      </div>
    </Card>
  );
};
