
'use client';

import { useReducer, useEffect } from 'react';
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
import type { Position, TableType, Action, PreviousAction } from '@/lib/types';
import { getPreflopExplanationAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, Info, Loader2, Settings, Shuffle, XCircle } from 'lucide-react';
import { useStats } from '@/context/stats-context';
import type { GetPreflopExplanationOutput } from '@/ai/flows/get-preflop-explanation';
import { HandRangeGrid } from './hand-range-grid';
import { expandRange } from '@/lib/range-expander';
import allRanges from '@/lib/gto-ranges.json';
import type { HandRange } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c'];

type Scenario = {
  position: Position;
  stackSize: number;
  tableType: TableType;
  previousAction: PreviousAction;
};

type State = {
  scenario: Scenario;
  currentHand: { handNotation: string; cards: [string, string] } | null;
  currentHandRange: HandRange | null;
  feedback: {
    isOptimal: boolean;
    action: Action;
    correctAction: Action;
    explanation?: GetPreflopExplanationOutput;
  } | null;
  showExplanation: boolean;
  isLoading: boolean;
  explanationIsLoading: boolean;
};

type ActionPayload =
  | { type: 'SET_SCENARIO'; payload: Partial<Scenario> }
  | { type: 'HANDLE_ACTION'; payload: Action }
  | { type: 'NEXT_HAND' }
  | { type: 'SET_EXPLANATION'; payload: GetPreflopExplanationOutput | null }
  | { type: 'TOGGLE_EXPLANATION' }
  | { type: 'SET_LOADING'; payload: { main?: boolean; explanation?: boolean } };

function getRandomCard(deck: string[]): {
  card: string;
  remainingDeck: string[];
} {
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

function generateCacheKey(scenario: Partial<Scenario>): string {
  const internalPreviousAction = scenario.previousAction === 'none' ? 'none' : scenario.previousAction;
  return `${scenario.position}-${scenario.stackSize}-${scenario.tableType}-${internalPreviousAction}`;
}

function loadRangeAndHand(scenario: Scenario): {
  range: HandRange | null;
  hand: { handNotation: string; cards: [string, string] };
} {
  const key = generateCacheKey(scenario);
  const rangeData = (allRanges as Record<string, any>)[key];
  const newHandRange = rangeData ? expandRange(rangeData) : null;
  return { range: newHandRange, hand: getNewHand() };
}

const reducer = (state: State, action: ActionPayload): State => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading:
          action.payload.main !== undefined
            ? action.payload.main
            : state.isLoading,
        explanationIsLoading:
          action.payload.explanation !== undefined
            ? action.payload.explanation
            : state.explanationIsLoading,
      };

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
      };
    }

    case 'HANDLE_ACTION': {
      if (!state.currentHand || !state.currentHandRange) {
        return state;
      }
      const actionTaken = action.payload;
      const correctAction =
        state.currentHandRange[state.currentHand.handNotation] || 'fold';

      // If the correct action is '3-bet' or 'all-in', a 'raise' is also acceptable
      const isAggressiveActionCorrect = ['3-bet', 'all-in'].includes(correctAction) && actionTaken === 'raise';
      // If the correct action is 'raise', a '3-bet' is also acceptable in a vs-raise scenario
      const isRaiseSynonymCorrect = correctAction === 'raise' && actionTaken === '3-bet' && state.scenario.previousAction !== 'none';

      const isOptimal = actionTaken === correctAction || isAggressiveActionCorrect || isRaiseSynonymCorrect;

      return {
        ...state,
        feedback: { isOptimal, action: actionTaken, correctAction },
      };
    }

    case 'NEXT_HAND': {
      const { hand } = loadRangeAndHand(state.scenario);
      return {
        ...state,
        currentHand: hand,
        feedback: null,
        showExplanation: false,
      };
    }

    case 'SET_EXPLANATION': {
      if (!state.feedback) return state;
      return {
        ...state,
        feedback: {
          ...state.feedback,
          explanation: action.payload || undefined,
        },
      };
    }

    case 'TOGGLE_EXPLANATION': {
      return { ...state, showExplanation: !state.showExplanation };
    }

    default:
      return state;
  }
};


export function PracticeModule() {
  const { toast } = useToast();
  const { recordHand } = useStats();

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
    explanationIsLoading: false,
  });

  // Initial load
  useEffect(() => {
    dispatch({
      type: 'SET_SCENARIO',
      payload: {
        position: 'BTN',
        stackSize: 100,
        tableType: 'cash',
        previousAction: 'none',
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Record hand stats when feedback is given
  useEffect(() => {
    if (state.feedback && state.currentHand) {
      recordHand(
        {
          ...state.scenario,
          hand: state.currentHand.handNotation,
          action: state.feedback.action,
          betSize: state.scenario.stackSize, // Pass stack size as a proxy for bet size
        },
        state.feedback.isOptimal
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.feedback]);


  useEffect(() => {
    if (!state.currentHandRange && !state.isLoading) {
      const scenarioKey = generateCacheKey(state.scenario);
      // Only show toast if a range for this scenario is supposed to exist
      if (Object.keys(allRanges).includes(scenarioKey)) {
        toast({
            variant: 'destructive',
            title: 'Error de Rango',
            description: `No se pudo cargar el rango para este escenario. (${scenarioKey})`,
        });
      }
    }
  }, [state.currentHandRange, state.isLoading, state.scenario, toast]);


  const handleShowExplanation = async () => {
    // If explanation is already showing, just hide it.
    if (state.showExplanation) {
      dispatch({ type: 'TOGGLE_EXPLANATION' });
      return;
    }

    // If explanation is loaded but hidden, just show it.
    if (state.feedback?.explanation) {
      dispatch({ type: 'TOGGLE_EXPLANATION' });
      return;
    }

    // If explanation is not loaded, fetch it.
    if (state.feedback && state.currentHand) {
      dispatch({ type: 'SET_LOADING', payload: { explanation: true } });
      dispatch({ type: 'TOGGLE_EXPLANATION' }); // Show loading state

      const result = await getPreflopExplanationAction({
        ...state.scenario,
        hand: state.currentHand.handNotation,
        action: state.feedback.action,
        isOptimal: state.feedback.isOptimal,
        betSize: state.scenario.stackSize, // Pass stack size as a proxy for bet size
      });

      if (result.success && result.data) {
        dispatch({ type: 'SET_EXPLANATION', payload: result.data });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error de Explicación',
          description:
            result.error || 'No se pudo obtener la explicación de la IA.',
        });
        dispatch({ type: 'TOGGLE_EXPLANATION' }); // Hide explanation panel on error
      }
      dispatch({ type: 'SET_LOADING', payload: { explanation: false } });
    }
  };

  const renderCard = (cardStr: string) => {
    const rank = cardStr[0] as any;
    const suit = cardStr[1] as any;
    return <PokerCard rank={rank} suit={suit} />;
  };

  const handleAction = (action: Action) => {
    dispatch({ type: 'HANDLE_ACTION', payload: action });
  };

  const handleNextHand = () => {
    dispatch({ type: 'NEXT_HAND' });
  };

  const handleRandomizeScenario = () => {
    const scenarioKeys = Object.keys(allRanges);
    const randomKey = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
    const [position, stackSize, tableType, previousAction] = randomKey.split('-');

    const payload = {
        position: position as Position,
        stackSize: Number(stackSize),
        tableType: tableType as TableType,
        previousAction: previousAction as PreviousAction,
    };
    
    dispatch({ type: 'SET_SCENARIO', payload });
  }


  const handleSetScenario = (payload: Partial<Scenario>) => {
    dispatch({ type: 'SET_SCENARIO', payload: payload });
  };

  const isBBvsLimp =
    state.scenario.position === 'BB' && state.scenario.previousAction === 'none';
  
  const isSBOpen = state.scenario.position === 'SB' && state.scenario.previousAction === 'none';

  if (state.isLoading || !state.currentHand) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          Cargando módulo de práctica...
        </p>
      </div>
    );
  }

    let descriptionText = '';
    switch (state.scenario.previousAction) {
        case 'none':
        if (isBBvsLimp) {
            descriptionText = `La mano llega limpia hasta ti en la Ciega Grande (BB). Estás con ${state.scenario.stackSize} BB. ¿Qué haces?`;
        } else if (isSBOpen) {
            descriptionText = `Todos los jugadores antes de ti se han retirado. La acción te llega en la Ciega Pequeña (SB) y te enfrentas solo a la Ciega Grande. Estás con ${state.scenario.stackSize} BB. ¿Qué haces?`;
        } else {
            descriptionText = `Nadie ha apostado todavía. Estás en ${state.scenario.position} con ${state.scenario.stackSize} BB. ¿Qué haces?`;
        }
        break;
        case 'raise':
        descriptionText = `Un oponente ha subido a 2.5 BB. Estás en ${state.scenario.position} con ${state.scenario.stackSize} BB. ¿Qué haces?`;
        break;
        case '3-bet':
        descriptionText = `Te enfrentas a un 3-bet de 9 BB. Estás en ${state.scenario.position} con ${state.scenario.stackSize} BB. ¿Qué haces?`;
        break;
        case '4-bet':
        descriptionText = `Te enfrentas a un 4-bet de 22 BB. Estás en ${state.scenario.position} con ${state.scenario.stackSize} BB. ¿Qué haces?`;
        break;
        default:
        descriptionText = `Estás en tu turno de jugar ahora.`;
    }
  
  const showOpenRaiseActions = state.scenario.previousAction === 'none' && !isBBvsLimp && !isSBOpen;
  const showVsRaiseActions = state.scenario.previousAction === 'raise';
  const showVs3BetActions = state.scenario.previousAction === '3-bet';
  const showVs4BetActions = state.scenario.previousAction === '4-bet';


  return (
    <div className="space-y-6">
       <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
          <Button
            variant="secondary"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={handleRandomizeScenario}
            aria-label="Escenario Aleatorio"
          >
            <Shuffle className="h-7 w-7" />
          </Button>
          <Sheet>
              <SheetTrigger asChild>
                  <Button variant="default" className="h-14 w-14 rounded-full shadow-lg">
                      <Settings className="h-7 w-7" />
                  </Button>
              </SheetTrigger>
              <SheetContent>
                  <SheetHeader>
                      <SheetTitle>Configurar Escenario</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 pt-4">
                      <Button
                          variant="secondary"
                          onClick={handleRandomizeScenario}
                          className="w-full"
                      >
                          <Shuffle className="mr-2 h-4 w-4" />
                          Escenario Aleatorio
                      </Button>
                      <div className="space-y-2">
                          <Label htmlFor="previous-action-sheet">Acción Previa</Label>
                          <Select
                          value={state.scenario.previousAction}
                          onValueChange={(v) =>
                              handleSetScenario({ previousAction: v as PreviousAction })
                          }
                          >
                          <SelectTrigger id="previous-action-sheet">
                              <SelectValue placeholder="Selecciona acción previa" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="none">
                                  Nadie ha apostado (Open Raise)
                              </SelectItem>
                              <SelectItem value="raise">
                                  Enfrentando un Open-Raise
                              </SelectItem>
                              <SelectItem value="3-bet" >
                                  Enfrentando un 3-Bet
                              </SelectItem>
                              <SelectItem value="4-bet" >
                                  Enfrentando un 4-Bet
                              </SelectItem>
                          </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="position-sheet">Posición</Label>
                          <Select
                          value={state.scenario.position}
                          onValueChange={(v) =>
                              handleSetScenario({ position: v as Position })
                          }
                          >
                          <SelectTrigger id="position-sheet">
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
                          <Label htmlFor="stack-size-sheet">Stack (BBs)</Label>
                          <Select
                          value={String(state.scenario.stackSize)}
                          onValueChange={(v) =>
                              handleSetScenario({ stackSize: Number(v) })
                          }
                          >
                          <SelectTrigger id="stack-size-sheet">
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
                          <Label htmlFor="table-type-sheet">Tipo de Mesa</Label>
                          <Select
                          value={state.scenario.tableType}
                          onValueChange={(v) =>
                              handleSetScenario({ tableType: v as TableType })
                          }
                          >
                          <SelectTrigger id="table-type-sheet">
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
                    
                  </div>
              </SheetContent>
          </Sheet>
        </div>
        
        <Card>
            <CardHeader className="text-center">
            <CardTitle className="font-headline mb-2">Tu Mano</CardTitle>
            <CardDescription>
                {descriptionText}
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-8 min-h-[350px]">
            {state.currentHand ? (
                <div className="flex gap-4">
                {renderCard(state.currentHand.cards[0])}
                {renderCard(state.currentHand.cards[1])}
                </div>
            ) : (
                <Loader2 className="animate-spin h-12 w-12" />
            )}

            {state.feedback && (
                <div className="w-full max-w-md space-y-2">
                <Alert
                    variant={state.feedback.isOptimal ? 'default' : 'destructive'}
                >
                    <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            {state.feedback.isOptimal ? (
                            <CheckCircle className="h-4 w-4" />
                            ) : (
                            <XCircle className="h-4 w-4" />
                            )}
                            <AlertTitle className="font-headline ml-2">
                            {state.feedback.isOptimal
                                ? 'Respuesta Correcta'
                                : 'Respuesta Incorrecta'}
                            </AlertTitle>
                        </div>
                         {!state.feedback.isOptimal && (
                            <p className="text-sm ml-7 capitalize">
                                La acción correcta era: <strong>{state.feedback.correctAction}</strong>
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShowExplanation}
                        disabled={state.explanationIsLoading}
                    >
                        {state.explanationIsLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Info className="mr-2 h-4 w-4" />
                        )}
                        {state.showExplanation ? 'Ocultar' : 'Explicación'}
                    </Button>
                    </div>
                    {state.showExplanation && (
                    <AlertDescription className="space-y-2 pt-2">
                        {state.explanationIsLoading &&
                        !state.feedback.explanation ? (
                        <p>Cargando explicación...</p>
                        ) : (
                        <>
                            <p>{state.feedback.explanation?.feedback}</p>
                            <p className="text-xs text-muted-foreground">
                            {state.feedback.explanation?.evExplanation}
                            </p>
                        </>
                        )}
                    </AlertDescription>
                    )}
                </Alert>
                </div>
            )}

            {!state.feedback ? (
                state.currentHandRange ? (
                    <div className="flex flex-wrap justify-center gap-4">
                    {isBBvsLimp ? (
                        <>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Check ✅
                            </Button>
                             <Button
                                variant="default"
                                size="lg"
                                onClick={() => handleAction('raise')}
                            >
                                Bet 🚀
                            </Button>
                        </>
                    ) : isSBOpen ? (
                        <>
                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                             <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Call 💰
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                onClick={() => handleAction('raise')}
                            >
                                Raise 🚀
                            </Button>
                        </>
                    ) : showOpenRaiseActions ? (
                        <>
                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                onClick={() => handleAction('raise')}
                            >
                                Raise 🚀
                            </Button>
                        </>
                    ) : showVsRaiseActions ? (
                        <>
                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                             <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Call 💰
                            </Button>
                            <Button
                                style={{backgroundColor: 'hsl(var(--accent))'}}
                                className="text-accent-foreground hover:bg-accent/90"
                                size="lg"
                                onClick={() => handleAction('3-bet')}
                            >
                                3-Bet 💣
                            </Button>
                        </>
                    ) : showVs3BetActions ? (
                         <>
                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                             <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Call 💰
                            </Button>
                            <Button
                                style={{backgroundColor: 'hsl(var(--accent))'}}
                                className="text-accent-foreground hover:bg-accent/90"
                                size="lg"
                                onClick={() => handleAction('raise')} // This becomes a 4-bet
                            >
                                4-Bet 💣
                            </Button>
                        </>
                    ) : showVs4BetActions ? (
                        <>
                           <Button
                               variant="destructive"
                               size="lg"
                               onClick={() => handleAction('fold')}
                           >
                               Fold 🤚
                           </Button>
                            <Button
                               variant="destructive"
                               className="bg-red-700 hover:bg-red-800"
                               size="lg"
                               onClick={() => handleAction('all-in')}
                           >
                               All-in 🔥
                           </Button>
                       </>
                    ) : null }
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <XCircle className="h-10 w-10 text-destructive mb-2" />
                        <p className="font-semibold text-destructive">Sin Rango</p>
                        <p className="text-destructive/80 text-sm max-w-xs">
                            No hay un rango GTO definido para este escenario específico. Prueba a ajustar la configuración.
                        </p>
                    </div>
                )
            ) : (
                <Button size="lg" onClick={handleNextHand}>
                    Siguiente Mano
                </Button>
            )}
            </CardContent>
        </Card>
        {state.currentHandRange && state.feedback && (
            <HandRangeGrid
                currentHand={state.currentHand?.handNotation}
                range={state.currentHandRange}
            />
        )}
    </div>
  );
}

    
    