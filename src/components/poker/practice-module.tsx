
'use client';

import { useReducer, useTransition, useEffect, useMemo } from 'react';
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
import { getPreflopExplanationAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, Info, Loader2, Shuffle, XCircle } from 'lucide-react';
import { useStats } from '@/context/stats-context';
import type { GetPreflopExplanationOutput } from '@/ai/flows/get-preflop-explanation';
import { HandRangeGrid } from './hand-range-grid';
import type { HandRange } from '@/lib/types';
import { expandRange } from '@/lib/range-expander';
import allRanges from '@/lib/gto-ranges.json';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c'];

type Scenario = {
  position: Position;
  stackSize: number;
  tableType: TableType;
  previousAction: 'none' | 'raise';
};

type State = {
  scenario: Scenario;
  currentHand: { handNotation: string; cards: [string, string] } | null;
  currentHandRange: HandRange | null;
  feedback: {
    isOptimal: boolean;
    action: Action;
    explanation?: GetPreflopExplanationOutput;
  } | null;
  showExplanation: boolean;
  isLoading: boolean;
};

type ActionPayload =
  | { type: 'SET_SCENARIO'; payload: Partial<Scenario> }
  | { type: 'HANDLE_ACTION'; payload: { action: Action, recordHand: Function } }
  | { type: 'NEXT_HAND' }
  | { type: 'TOGGLE_EXPLANATION'; payload?: GetPreflopExplanationOutput }
  | { type: 'SET_LOADING'; payload: boolean };

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

function generateCacheKey(scenario: Scenario): string {
    return `${scenario.position}-${scenario.stackSize}-${scenario.tableType}-${scenario.previousAction}`;
}

function loadRangeAndHand(scenario: Scenario): { range: HandRange | null, hand: { handNotation: string; cards: [string, string] }} {
    const key = generateCacheKey(scenario);
    const rangeData = (allRanges as Record<string, any>)[key];
    const newHandRange = rangeData ? expandRange(rangeData) : null;
    return { range: newHandRange, hand: getNewHand() };
}

const reducer = (state: State, action: ActionPayload): State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SCENARIO': {
        const newScenario = { ...state.scenario, ...action.payload };
        const { range, hand } = loadRangeAndHand(newScenario);
        return {
            ...state,
            scenario: newScenario,
            currentHandRange: range,
            currentHand: hand,
            feedback: null,
            showExplanation: false,
            isLoading: false,
        }
    }
    
    case 'HANDLE_ACTION': {
      if (!state.currentHand || !state.currentHandRange) {
        return state;
      }
      const { action: actionTaken, recordHand } = action.payload;
      const correctAction = state.currentHandRange[state.currentHand.handNotation] || 'fold';
      const isOptimal = actionTaken === correctAction;
      
      recordHand({
          ...state.scenario,
          hand: state.currentHand.handNotation,
          action: actionTaken,
      }, isOptimal);

      return {
        ...state,
        feedback: { isOptimal, action: actionTaken },
      };
    }

    case 'NEXT_HAND': {
      const { range, hand } = loadRangeAndHand(state.scenario);
      return {
        ...state,
        currentHand: hand,
        currentHandRange: range,
        feedback: null,
        showExplanation: false,
      };
    }

    case 'TOGGLE_EXPLANATION': {
      if (!state.feedback) return state;
      return {
        ...state,
        showExplanation: !state.showExplanation,
        feedback: action.payload ? { ...state.feedback, explanation: action.payload } : state.feedback,
      };
    }

    default:
      return state;
  }
};


export function PracticeModule() {
  const { toast } = useToast();
  const { recordHand } = useStats();
  const [isExplanationLoading, startExplanationTransition] = useTransition();

  const [state, dispatch] = useReducer(reducer, {
    scenario: {
      position: 'BTN',
      stackSize: 100,
      tableType: 'cash',
      previousAction: 'none',
    },
    currentHand: null,
    currentHandRange: null,
    feedback: null,
    showExplanation: false,
    isLoading: true,
  });

  useEffect(() => {
      dispatch({ type: 'SET_SCENARIO', payload: {
        position: 'BTN',
        stackSize: 100,
        tableType: 'cash',
        previousAction: 'none',
      }});
  }, []);

  const lastInputAction = useMemo(() => {
    if (!state.feedback || !state.currentHand) return null;
    return {
        ...state.scenario,
        hand: state.currentHand.handNotation,
        action: state.feedback.action,
    }
  }, [state.scenario, state.currentHand, state.feedback]);

  useEffect(() => {
    if (!state.currentHandRange && !state.isLoading) {
      toast({
        variant: 'destructive',
        title: 'Error de Rango',
        description: `No se pudo cargar el rango para este escenario. (${generateCacheKey(state.scenario)})`,
      });
    }
  }, [state.currentHandRange, state.isLoading, state.scenario, toast]);

  const handleShowExplanation = () => {
    if (state.showExplanation && state.feedback?.explanation) {
        dispatch({ type: 'TOGGLE_EXPLANATION' });
        return;
    }
    
    if (!state.showExplanation && lastInputAction && state.feedback) {
        startExplanationTransition(async () => {
            const result = await getPreflopExplanationAction({
                ...lastInputAction!,
                isOptimal: state.feedback!.isOptimal,
            });
            if (result.success && result.data) {
                dispatch({ type: 'TOGGLE_EXPLANATION', payload: result.data });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error de Explicación',
                    description: result.error || 'No se pudo obtener la explicación de la IA.',
                });
            }
        });
        dispatch({ type: 'TOGGLE_EXPLANATION' });
    }
  }

  const renderCard = (cardStr: string) => {
      const rank = cardStr[0] as any;
      const suit = cardStr[1] as any;
      return <PokerCard rank={rank} suit={suit} />;
  }

  const handleAction = (action: Action) => {
    dispatch({type: 'HANDLE_ACTION', payload: { action, recordHand }})
  }

  const handleNextHand = () => {
    dispatch({type: 'NEXT_HAND'});
  }

  const handleRandomizeScenario = () => {
    let randomPosition = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const randomStackSize = STACK_SIZES[Math.floor(Math.random() * STACK_SIZES.length)];
    const randomTableType = TABLE_TYPES[Math.floor(Math.random() * TABLE_TYPES.length)];
    
    let randomPreviousAction: 'none' | 'raise' = 'none';

    // Prevent impossible BB vs limp scenario in our data
    if (randomPosition === 'BB') {
        randomPreviousAction = 'raise';
    } else {
        const keyForRaise = `${randomPosition}-${randomStackSize}-${randomTableType}-raise`;
        if ((allRanges as Record<string, any>)[keyForRaise] && Math.random() > 0.5) {
            randomPreviousAction = 'raise';
        }
    }

    dispatch({ type: 'SET_SCENARIO', payload: {
        position: randomPosition,
        stackSize: randomStackSize,
        tableType: randomTableType,
        previousAction: randomPreviousAction,
    }});
  }

  const handleSetScenario = (payload: Partial<Scenario>) => {
    dispatch({ type: 'SET_SCENARIO', payload });
  }

  if (state.isLoading || !state.currentHand) {
    return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center min-h-[600px]">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
            Cargando módulo de práctica...
            </p>
        </div>
      </div>
    )
  }

  const isBBvsLimp = state.scenario.position === 'BB' && state.scenario.previousAction === 'none';

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
           <Button variant="secondary" onClick={handleRandomizeScenario} className="w-full">
              <Shuffle className="mr-2 h-4 w-4" />
              Escenario Aleatorio
            </Button>
          <div className="space-y-2">
            <Label htmlFor="position">Posición</Label>
            <Select value={state.scenario.position} onValueChange={(v) => handleSetScenario({ position: v as Position })}>
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
            <Select value={String(state.scenario.stackSize)} onValueChange={(v) => handleSetScenario({ stackSize: Number(v) })}>
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
            <Select value={state.scenario.tableType} onValueChange={(v) => handleSetScenario({ tableType: v as TableType })}>
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
            <Select value={state.scenario.previousAction} onValueChange={(v) => handleSetScenario({ previousAction: v as 'none' | 'raise' })}>
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
            Estás en <span className="font-bold">{state.scenario.position}</span> con <span className="font-bold">{state.scenario.stackSize} BB</span>. ¿Qué haces?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-8 min-h-[350px]">
          {state.currentHand ? (
            <div className="flex gap-4">
              {renderCard(state.currentHand.cards[0])}
              {renderCard(state.currentHand.cards[1])}
            </div>
          ) : <Loader2 className="animate-spin h-12 w-12" />}

          {state.feedback && (
             <div className="w-full max-w-md space-y-2">
                <Alert variant={state.feedback.isOptimal ? 'default' : 'destructive'}>
                     <div className='flex items-center justify-between'>
                        <div className="flex items-center">
                            {state.feedback.isOptimal ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <AlertTitle className="font-headline ml-2">
                                {state.feedback.isOptimal ? "Respuesta Correcta" : "Respuesta Incorrecta"}
                            </AlertTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleShowExplanation} disabled={isExplanationLoading}>
                            {isExplanationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Info className="mr-2 h-4 w-4" />}
                            {state.showExplanation ? 'Ocultar' : 'Explicación'}
                        </Button>
                    </div>
                    {state.showExplanation && (
                        <AlertDescription className="space-y-2 pt-2">
                           {isExplanationLoading && !state.feedback.explanation ? <p>Cargando explicación...</p> : (
                               <>
                                <p>{state.feedback.explanation?.feedback}</p>
                                <p className="text-xs text-muted-foreground">{state.feedback.explanation?.evExplanation}</p>
                               </>
                           )}
                        </AlertDescription>
                    )}
                </Alert>
             </div>
          )}

          {!state.feedback && state.currentHandRange && (
            <div className="flex gap-4">
              {isBBvsLimp ? (
                 <Button variant="secondary" size="lg" onClick={() => handleAction('call' as Action)}>
                    Check ✅
                 </Button>
              ) : (
                <Button variant="destructive" size="lg" onClick={() => handleAction('fold' as Action)}>
                    Fold 🤚
                </Button>
              )}
              <Button variant="secondary" size="lg" onClick={() => handleAction('call' as Action)}>
                {isBBvsLimp ? 'Bet' : 'Call'} 💰
              </Button>
              <Button variant="default" size="lg" onClick={() => handleAction('raise' as Action)}>
                Raise 🚀
              </Button>
            </div>
          )}

          {state.feedback && (
            <Button size="lg" onClick={handleNextHand}>
              Siguiente Mano
            </Button>
          )}
        </CardContent>
      </Card>
      <div className="lg:col-span-3">
        {state.feedback && state.currentHandRange ? (
            <HandRangeGrid currentHand={state.currentHand?.handNotation} range={state.currentHandRange} />
        ) : !state.currentHandRange ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center min-h-[300px]">
                <p className="text-muted-foreground">
                    El rango para este escenario no está disponible. Por favor, selecciona otro.
                </p>
            </div>
        ) : (
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
