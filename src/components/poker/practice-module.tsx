'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PokerCard } from './poker-card';
import { POSITIONS, STACK_SIZES, TABLE_TYPES } from '@/lib/data';
import type { Position, TableType, Action } from '@/lib/types';
import { getPreflopAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import type { AnalyzePreflopDecisionOutput } from '@/ai/flows/analyze-preflop-decision';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs

function getRandomCard(deck: string[]): { card: string; remainingDeck: string[] } {
  const index = Math.floor(Math.random() * deck.length);
  const card = deck[index];
  const remainingDeck = [...deck.slice(0, index), ...deck.slice(index + 1)];
  return { card, remainingDeck };
}

function getNewHand() {
  let deck: string[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(`${rank}${suit}`);
    }
  }

  const { card: card1, remainingDeck: deckAfterCard1 } = getRandomCard(deck);
  const { card: card2 } = getRandomCard(deckAfterCard1);

  // GTO hand notation: AKs, AKo, 77
  const rank1Index = RANKS.indexOf(card1[0]);
  const rank2Index = RANKS.indexOf(card2[0]);

  let handNotation;
  if (rank1Index === rank2Index) {
    handNotation = `${card1[0]}${card2[0]}`;
  } else {
    const highRank = RANKS[Math.min(rank1Index, rank2Index)];
    const lowRank = RANKS[Math.max(rank1Index, rank2Index)];
    const suited = card1[1] === card2[1] ? 's' : 'o';
    handNotation = `${highRank}${lowRank}${suited}`;
  }

  return { handNotation, cards: [card1, card2] as [string, string] };
}

export function PracticeModule() {
  const [position, setPosition] = useState<Position>('BTN');
  const [stackSize, setStackSize] = useState<number>(100);
  const [tableType, setTableType] = useState<TableType>('cash');
  const [currentHand, setCurrentHand] = useState<{ handNotation: string; cards: [string, string] } | null>(null);
  const [feedback, setFeedback] = useState<AnalyzePreflopDecisionOutput & {action: Action} | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentHand(getNewHand());
  }, []);

  const handleAction = (action: Action) => {
    if (!currentHand) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await getPreflopAnalysis({
        position,
        stackSize,
        tableType,
        hand: currentHand.handNotation,
        action,
      });

      if (result.success && result.data) {
        setFeedback({...result.data, action});
      } else {
        toast({
          variant: 'destructive',
          title: 'Error de Análisis',
          description: result.error || 'No se pudo obtener el análisis de la IA.',
        });
      }
    });
  };
  
  const handleNextHand = () => {
    setCurrentHand(getNewHand());
    setFeedback(null);
  };
  
  const renderCard = (cardStr: string) => {
      const rank = cardStr[0] as any;
      const suit = cardStr[1] as any;
      return <PokerCard rank={rank} suit={suit} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">Configurar Escenario</CardTitle>
          <CardDescription>
            Elige las condiciones para tu sesión de práctica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Posición</Label>
            <Select value={position} onValueChange={(v) => setPosition(v as Position)} disabled={isPending}>
              <SelectTrigger id="position">
                <SelectValue placeholder="Selecciona posición" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stack-size">Stack (BBs)</Label>
            <Select value={String(stackSize)} onValueChange={(v) => setStackSize(Number(v))} disabled={isPending}>
              <SelectTrigger id="stack-size">
                <SelectValue placeholder="Selecciona stack" />
              </SelectTrigger>
              <SelectContent>
                {STACK_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} BB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="table-type">Tipo de Mesa</Label>
            <Select value={tableType} onValueChange={(v) => setTableType(v as TableType)} disabled={isPending}>
              <SelectTrigger id="table-type">
                <SelectValue placeholder="Selecciona tipo de mesa" />
              </SelectTrigger>
              <SelectContent>
                {TABLE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'cash' ? 'Cash Game' : 'Torneo'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Tu Mano</CardTitle>
          <CardDescription>
            Estás en <span className="font-bold">{position}</span> con <span className="font-bold">{stackSize} BB</span>. ¿Qué haces?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-8 min-h-[350px]">
          {currentHand ? (
            <div className="flex gap-4">
              {renderCard(currentHand.cards[0])}
              {renderCard(currentHand.cards[1])}
            </div>
          ) : <Loader2 className="animate-spin h-12 w-12" />}

          {feedback && (
             <Alert variant={feedback.isOptimal ? 'default' : 'destructive'} className="w-full max-w-md">
                {feedback.isOptimal ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle className="font-headline flex items-center gap-2">
                  {feedback.isOptimal ? "¡Decisión Óptima!" : "Decisión Subóptima"}
                </AlertTitle>
                <AlertDescription className="space-y-2 pt-2">
                  <p>{feedback.feedback}</p>
                  <p className="text-xs text-muted-foreground">{feedback.evExplanation}</p>
                </AlertDescription>
            </Alert>
          )}

          {isPending && <Loader2 className="animate-spin h-8 w-8 text-primary" />}

          {!feedback && !isPending && (
            <div className="flex gap-4">
              <Button variant="destructive" size="lg" onClick={() => handleAction('fold')}>
                Fold 🤚
              </Button>
              <Button variant="secondary" size="lg" onClick={() => handleAction('call')}>
                Call 💰
              </Button>
              <Button variant="default" size="lg" onClick={() => handleAction('raise')}>
                Raise 🚀
              </Button>
            </div>
          )}

          {(feedback || isPending) && (
            <Button size="lg" onClick={handleNextHand} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 animate-spin"/> : null}
              Siguiente Mano
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
