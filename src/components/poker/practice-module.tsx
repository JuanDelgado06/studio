
'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
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
import { getPreflopExplanationAction, getHandRangeAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, Info, Loader2, Shuffle, XCircle } from 'lucide-react';
import { useStats } from '@/context/stats-context';
import type { GetPreflopExplanationOutput } from '@/ai/flows/get-preflop-explanation';
import { HandRangeGrid } from './hand-range-grid';
import type { HandRange } from '@/lib/types';
import { expandRange } from '@/lib/range-expander';


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

type LastInput = {
    position: Position,
    stackSize: number,
    tableType: TableType,
    hand: string,
    action: Action
}

type Feedback = {
    isOptimal: boolean;
    action: Action;
    explanation?: GetPreflopExplanationOutput;
}


export function PracticeModule() {
  const [position, setPosition] = useState<Position>('BTN');
  const [stackSize, setStackSize] = useState<number>(100);
  const [tableType, setTableType] = useState<TableType>('cash');
  const [previousAction, setPreviousAction] = useState<'none' | 'raise'>('none');
  const [currentHand, setCurrentHand] = useState<{ handNotation: string; cards: [string, string] } | null>(null);
  const [lastInput, setLastInput] = useState<LastInput | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isExplanationLoading, startExplanationTransition] = useTransition();
  const [isRangeLoading, setIsRangeLoading] = useState(true);
  const [handRange, setHandRange] = useState<HandRange | null>(null);

  const { toast } = useToast();
  const { recordHand } = useStats();

  const fetchHandRange = useCallback(async (pos: Position, stack: number, type: TableType, prevAction: 'none' | 'raise') => {
    setIsRangeLoading(true);
    setHandRange(null);
    setFeedback(null);
    setCurrentHand(getNewHand());
    
    try {
      const result = await getHandRangeAction({ position: pos, stackSize: stack, tableType: type, previousAction: prevAction });
      if (result.success && result.data) {
        const expanded = expandRange(result.data);
        setHandRange(expanded);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error de Rango',
          description: result.error || 'No se pudo obtener el rango de manos.',
        });
      }
    } catch(error) {
       toast({
          variant: 'destructive',
          title: 'Error de Rango',
          description: 'Ocurrió un error inesperado al buscar el rango de manos.',
        });
    } finally {
        setIsRangeLoading(false);
    }
  }, [toast]);

  const handleNextHand = useCallback(() => {
    startTransition(() => {
      setCurrentHand(getNewHand());
      setFeedback(null);
      setShowExplanation(false);
      setLastInput(null);
    });
  }, []);

  useEffect(() => {
    fetchHandRange(position, stackSize, tableType, previousAction);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScenarioChange = (newPosition: Position, newStackSize: number, newTableType: TableType, newPreviousAction: 'none' | 'raise') => {
    startTransition(() => {
      setPosition(newPosition);
      setStackSize(newStackSize);
      setTableType(newTableType);
      setPreviousAction(newPreviousAction);
      fetchHandRange(newPosition, newStackSize, newTableType, newPreviousAction);
    });
  };

  const handleAction = (action: Action) => {
    if (!currentHand || isPending) return;
    
    startTransition(() => {
        if (!handRange) {
             toast({
                variant: 'destructive',
                title: 'Error de Rango',
                description: 'El rango de manos no está disponible. Intenta de nuevo.',
            });
            return;
        }

      const correctAction = handRange[currentHand.handNotation] || 'fold';
      const isOptimal = action === correctAction;
      
      const input = {
        position,
        stackSize,
        tableType,
        hand: currentHand.handNotation,
        action,
      };

      setFeedback({ isOptimal, action });
      setLastInput(input);
      recordHand(input, isOptimal);
    });
  };

  const handleShowExplanation = () => {
    if (!showExplanation && lastInput && feedback && !feedback.explanation) {
        startExplanationTransition(async () => {
            const result = await getPreflopExplanationAction({
                ...lastInput,
                isOptimal: feedback.isOptimal,
            });
            if (result.success && result.data) {
                setFeedback(f => f ? {...f, explanation: result.data} : null);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error de Explicación',
                    description: result.error || 'No se pudo obtener la explicación de la IA.',
                });
            }
        });
    }
    setShowExplanation(!showExplanation);
  }
  
  const handleRandomizeScenario = () => {
    const randomPosition = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const randomStackSize = STACK_SIZES[Math.floor(Math.random() * STACK_SIZES.length)];
    const randomTableType = TABLE_TYPES[Math.floor(Math.random() * TABLE_TYPES.length)];
    const randomPreviousAction = Math.random() > 0.5 ? 'raise' : 'none';

    handleScenarioChange(randomPosition, randomStackSize, randomTableType, randomPreviousAction);
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
           <Button variant="secondary" onClick={handleRandomizeScenario} className="w-full" disabled={isPending || isRangeLoading}>
              <Shuffle className="mr-2 h-4 w-4" />
              Escenario Aleatorio
            </Button>
          <div className="space-y-2">
            <Label htmlFor="position">Posición</Label>
            <Select value={position} onValueChange={(v) => handleScenarioChange(v as Position, stackSize, tableType, previousAction)} disabled={isPending || isRangeLoading}>
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
            <Select value={String(stackSize)} onValueChange={(v) => handleScenarioChange(position, Number(v), tableType, previousAction)} disabled={isPending || isRangeLoading}>
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
            <Select value={tableType} onValueChange={(v) => handleScenarioChange(position, stackSize, v as TableType, previousAction)} disabled={isPending || isRangeLoading}>
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
          <div className="space-y-2">
            <Label htmlFor="previous-action">Acción Previa</Label>
            <Select value={previousAction} onValueChange={(v) => handleScenarioChange(position, stackSize, tableType, v as 'none' | 'raise')} disabled={isPending || isRangeLoading}>
              <SelectTrigger id="previous-action">
                <SelectValue placeholder="Selecciona acción previa" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value='none'>Nadie ha apostado (Open-Raise)</SelectItem>
                  <SelectItem value='raise'>Hubo un Raise antes de mí</SelectItem>
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
          {currentHand && !isRangeLoading && !isPending ? (
            <div className="flex gap-4">
              {renderCard(currentHand.cards[0])}
              {renderCard(currentHand.cards[1])}
            </div>
          ) : <Loader2 className="animate-spin h-12 w-12" />}

          {feedback && !isPending && (
             <div className="w-full max-w-md space-y-2">
                <Alert variant={feedback.isOptimal ? 'default' : 'destructive'}>
                    <div className='flex items-center justify-between'>
                        <div className="flex items-center">
                            {feedback.isOptimal ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <AlertTitle className="font-headline ml-2">
                                {feedback.isOptimal ? "Respuesta Correcta" : "Respuesta Incorrecta"}
                            </AlertTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleShowExplanation} disabled={isExplanationLoading}>
                            {isExplanationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Info className="mr-2 h-4 w-4" />}
                            {showExplanation ? 'Ocultar' : 'Explicación'}
                        </Button>
                    </div>
                    {showExplanation && (
                        <AlertDescription className="space-y-2 pt-2">
                           {isExplanationLoading ? <p>Cargando explicación...</p> : (
                               <>
                                <p>{feedback.explanation?.feedback}</p>
                                <p className="text-xs text-muted-foreground">{feedback.explanation?.evExplanation}</p>
                               </>
                           )}
                        </AlertDescription>
                    )}
                </Alert>
             </div>
          )}

          {isPending && !feedback && <Loader2 className="animate-spin h-8 w-8 text-primary" />}

          {!feedback && !isPending && !isRangeLoading && (
            <div className="flex gap-4">
              <Button variant="destructive" size="lg" onClick={() => handleAction('fold')} disabled={isPending}>
                Fold 🤚
              </Button>
              <Button variant="secondary" size="lg" onClick={() => handleAction('call')} disabled={isPending}>
                Call 💰
              </Button>
              <Button variant="default" size="lg" onClick={() => handleAction('raise')} disabled={isPending}>
                Raise 🚀
              </Button>
            </div>
          )}

          {(feedback || (isPending && feedback)) && (
            <Button size="lg" onClick={handleNextHand} disabled={isPending && !feedback}>
              {isPending && !feedback ? <Loader2 className="mr-2 animate-spin"/> : null}
              Siguiente Mano
            </Button>
          )}
        </CardContent>
      </Card>
      <div className="lg:col-span-3">
        {(isRangeLoading || isPending) && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Cargando rango de manos GTO...
              </p>
            </div>
        )}
        {!isRangeLoading && !isPending && feedback && handRange && (
            <HandRangeGrid currentHand={currentHand?.handNotation} range={handRange} />
        )}
         {!isRangeLoading && !isPending && !feedback && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center min-h-[300px]">
            <p className="text-muted-foreground">
              El rango de manos aparecerá aquí después de que tomes una decisión.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
