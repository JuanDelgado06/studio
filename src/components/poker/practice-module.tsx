
'use client';

import { useReducer, useEffect, useCallback, useState } from 'react';
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
import { POSITIONS, STACK_SIZES, TABLE_TYPES, PREVIOUS_ACTIONS, POSITION_NAMES } from '@/lib/data';
import type { Position, TableType, Action, PreviousAction, GtoRangeScenario } from '@/lib/types';
import { getPreflopExplanationAction, getOrGenerateRangeAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, Info, Loader2, Database, Sparkles, Settings, Shuffle, XCircle, Hand, Lightbulb } from 'lucide-react';
import { useStats } from '@/context/stats-context';
import type { GetPreflopExplanationOutput } from '@/ai/flows/get-preflop-explanation';
import { HandRangeGrid } from './hand-range-grid';
import { expandRange } from '@/lib/range-expander';
import type { HandRange } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c'];

const pokerTips = [
    "La posición es poder. Las mejores manos se juegan desde las últimas posiciones.",
    "No te enamores de una mano. A veces, la mejor jugada es foldear tus Ases.",
    "Observa a tus oponentes. Sus patrones de apuestas revelan más que sus cartas.",
    "Un 3-bet no es solo por valor. También es una poderosa herramienta para hacer un farol (bluff).",
    "Controlar el tamaño del pozo es clave para maximizar ganancias y minimizar pérdidas.",
    "La agresividad selectiva suele ser la estrategia más rentable en No-Limit Hold'em.",
    "Entender las 'pot odds' es fundamental para decidir si un call es rentable a largo plazo.",
    "Presta atención a los stacks. El tamaño de tu stack y el de tus rivales define la estrategia a seguir."
];


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
  rangeSource: 'db' | 'ai' | null;
  feedback: {
    isOptimal: boolean;
    action: Action;
    correctAction: Action;
    explanation?: GetPreflopExplanationOutput;
  } | null;
  showExplanation: boolean;
  isLoading: boolean;
  explanationIsLoading: boolean;
  error: string | null;
};

type ActionPayload =
  | { type: 'START_LOADING'; payload?: { main?: boolean; explanation?: boolean } }
  | { type: 'SET_SCENARIO'; payload: { scenario: Scenario, hand: State['currentHand'] } }
  | { type: 'SET_RANGE'; payload: { range: HandRange | null; source: State['rangeSource'], error?: string | null } }
  | { type: 'HANDLE_ACTION'; payload: Action }
  | { type: 'NEXT_HAND' }
  | { type: 'SET_EXPLANATION'; payload: GetPreflopExplanationOutput | null }
  | { type: 'TOGGLE_EXPLANATION' }
  | { type: 'STOP_LOADING'; payload?: { main?: boolean; explanation?: boolean } };

function getRandomCard(deck: string[]): {
  card: string;
  remainingDeck: string[];
} {
  const index = Math.floor(Math.random() * deck.length);
  const card = deck[index];
  const remainingDeck = [...deck.slice(0, index), ...deck.slice(index + 1)];
  return { card, remainingDeck };
}

function getNewHand(handNotationStr?: string): { handNotation: string; cards: [string, string] } | null {
  if (handNotationStr) {
      // User provided a hand, let's parse and create it
      const hand = handNotationStr.trim().replace(/ /g, '');
      if (hand.length < 2 || hand.length > 3) return null;

      const r1 = hand[0].toUpperCase();
      const r2 = hand[1].toUpperCase();
      if (!RANKS.includes(r1) || !RANKS.includes(r2)) return null;

      const isPair = r1 === r2;
      let isSuited = false;

      if (hand.length === 3) {
          const suffix = hand[2].toLowerCase();
          if (suffix !== 's' && suffix !== 'o') return null;
          isSuited = suffix === 's';
      }

      if (isPair && hand.length === 3) return null; // e.g. AAo is invalid

      const rank1Index = RANKS.indexOf(r1);
      const rank2Index = RANKS.indexOf(r2);
      
      const highRank = RANKS[Math.min(rank1Index, rank2Index)];
      const lowRank = RANKS[Math.max(rank1Index, rank2Index)];

      const finalNotation = isPair ? `${r1}${r1}` : `${highRank}${lowRank}${isSuited ? 's' : 'o'}`;
      
      // Generate random suits for the visual cards
      const availableSuits = [...SUITS];
      const suit1Index = Math.floor(Math.random() * availableSuits.length);
      const suit1 = availableSuits.splice(suit1Index, 1)[0];

      let suit2;
      if (isSuited) {
          suit2 = suit1;
      } else {
          const suit2Index = Math.floor(Math.random() * availableSuits.length);
          suit2 = availableSuits[suit2Index];
      }

      const card1Str = `${r1}${suit1}`;
      const card2Str = `${r2}${suit2}`;
      
      return { handNotation: finalNotation, cards: [card1Str, card2Str] };

  } else {
      // Generate a completely random hand
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
}

function getRandomScenario(): Scenario {
    const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const stackSize = STACK_SIZES[Math.floor(Math.random() * STACK_SIZES.length)];
    const tableType = TABLE_TYPES[Math.floor(Math.random() * TABLE_TYPES.length)];
    const previousAction = PREVIOUS_ACTIONS[Math.floor(Math.random() * PREVIOUS_ACTIONS.length)];
    return { position, stackSize, tableType, previousAction };
}

const reducer = (state: State, action: ActionPayload): State => {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...state,
        isLoading:
          action.payload?.main !== undefined
            ? action.payload.main
            : state.isLoading,
        explanationIsLoading:
          action.payload?.explanation !== undefined
            ? action.payload.explanation
            : state.explanationIsLoading,
      };

    case 'STOP_LOADING':
      return {
        ...state,
        isLoading:
          action.payload?.main !== undefined
            ? !action.payload.main
            : state.isLoading,
        explanationIsLoading:
          action.payload?.explanation !== undefined
            ? !action.payload.explanation
            : state.explanationIsLoading,
      };

    case 'SET_SCENARIO': {
        return {
            ...state,
            scenario: action.payload.scenario,
            currentHand: action.payload.hand,
            feedback: null,
            showExplanation: false,
            currentHandRange: null,
            rangeSource: null,
            error: null,
        }
    }

    case 'SET_RANGE': {
        return {
            ...state,
            currentHandRange: action.payload.range,
            rangeSource: action.payload.source,
            isLoading: false,
            error: action.payload.error || null,
        }
    }

    case 'HANDLE_ACTION': {
      if (!state.currentHand || !state.currentHandRange) {
        return state;
      }
      const actionTaken = action.payload;
      const correctAction =
        state.currentHandRange[state.currentHand.handNotation] || 'fold';

      const isAggressiveActionCorrect = ['3-bet', 'all-in'].includes(correctAction) && actionTaken === 'raise';
      const isRaiseSynonymCorrect = correctAction === 'raise' && actionTaken === '3-bet' && state.scenario.previousAction !== 'none';
      const is4BetCorrect = correctAction === '4-bet' && (actionTaken === 'raise' || actionTaken === '4-bet');

      const isOptimal = actionTaken === correctAction || isAggressiveActionCorrect || isRaiseSynonymCorrect || is4BetCorrect;

      return {
        ...state,
        feedback: { isOptimal, action: actionTaken, correctAction },
      };
    }

    case 'NEXT_HAND': {
      return {
        ...state,
        currentHand: getNewHand(),
        feedback: null,
        showExplanation: false,
        error: null,
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
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [customHand, setCustomHand] = useState('');
  const [currentTip, setCurrentTip] = useState('');

  const [state, dispatch] = useReducer(reducer, {
    scenario: {
      position: 'BTN',
      stackSize: 100,
      tableType: 'cash',
      previousAction: 'none',
    },
    currentHand: null,
    currentHandRange: null,
    rangeSource: null,
    feedback: null,
    showExplanation: false,
    isLoading: true,
    explanationIsLoading: false,
    error: null,
  });

  const findRangeForScenario = useCallback(async (scenario: Scenario) => {
    dispatch({ type: 'START_LOADING', payload: { main: true } });
    setCurrentTip(pokerTips[Math.floor(Math.random() * pokerTips.length)]);
    const result = await getOrGenerateRangeAction(scenario);
    if (result.success && result.data) {
        const expandedRange = expandRange(result.data);
        dispatch({ type: 'SET_RANGE', payload: { range: expandedRange, source: result.source || null } });
    } else {
        dispatch({ type: 'SET_RANGE', payload: { range: null, source: null, error: result.error } });
    }
  }, []);
  
  const setAndFetchScenario = useCallback((scenario: Scenario, handNotation?: string) => {
      const hand = getNewHand(handNotation);
      if (!hand) {
          toast({ variant: 'destructive', title: 'Mano Inválida', description: 'El formato de la mano no es correcto. Usa AAs, AKs, AQo, etc.'});
          return;
      }
      dispatch({ type: 'SET_SCENARIO', payload: { scenario, hand } });
      findRangeForScenario(scenario);
  }, [findRangeForScenario, toast]);


  // Initial load
  useEffect(() => {
    const initialScenario: Scenario = {
        position: 'BTN',
        stackSize: 100,
        tableType: 'cash',
        previousAction: 'none',
    };
    setAndFetchScenario(initialScenario);
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
          betSize: state.scenario.stackSize, 
        },
        state.feedback.isOptimal
      );
    }
  }, [state.feedback, state.currentHand, state.scenario, recordHand]);


  const handleShowExplanation = async () => {
    if (state.showExplanation) {
      dispatch({ type: 'TOGGLE_EXPLANATION' });
      return;
    }

    if (state.feedback?.explanation) {
      dispatch({ type: 'TOGGLE_EXPLANATION' });
      return;
    }

    if (state.feedback && state.currentHand) {
      dispatch({ type: 'START_LOADING', payload: { explanation: true } });
      dispatch({ type: 'TOGGLE_EXPLANATION' }); 

      let betSize = 0;
      switch (state.scenario.previousAction) {
        case 'raise':
          betSize = 2.5;
          break;
        case '3-bet':
          betSize = 9;
          break;
        case '4-bet':
          betSize = 22;
          break;
      }

      const result = await getPreflopExplanationAction({
        ...state.scenario,
        hand: state.currentHand.handNotation,
        action: state.feedback.action,
        isOptimal: state.feedback.isOptimal,
        betSize,
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
        dispatch({ type: 'TOGGLE_EXPLANATION' }); 
      }
      dispatch({ type: 'STOP_LOADING', payload: { explanation: true } });
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
  
  const handleRandomizeScenario = useCallback(() => {
    const newScenario = getRandomScenario();
    setAndFetchScenario(newScenario);
    setCustomHand('');
    setSheetOpen(false);
  }, [setAndFetchScenario]);

  const handleNextHand = () => {
    handleRandomizeScenario();
  };

  const handleSetScenario = (payload: Partial<Scenario>) => {
    const newScenario = { ...state.scenario, ...payload };
    setAndFetchScenario(newScenario, customHand);
    setSheetOpen(false);
  };
  
  const handleSetCustomHandAndScenario = () => {
      handleSetScenario({});
  }

  const generateDescription = () => {
    const { position, tableType, stackSize, previousAction } = state.scenario;
    const positionName = POSITION_NAMES[position];
    const tableTypeName = tableType === 'cash' ? 'un Cash Game' : 'un Torneo';
    const firstLine = `Estás en ${positionName} (${position}) en ${tableTypeName} con ${stackSize} BB.`;

    let secondLine = '';
    switch (previousAction) {
        case 'none':
            secondLine = 'La mano te llega limpia (fold).';
            if (position === 'BB') secondLine = 'La acción llega limpia hasta la SB, que completa. Estás en la ciega grande.';
            if (position === 'SB') secondLine = 'Todos foldean hasta ti. Estás en la ciega pequeña contra la ciega grande.';
            break;
        case 'raise':
            secondLine = 'Un rival ha abierto la mano con una subida (open-raise) a 2.5 BB.';
            break;
        case '3-bet':
            secondLine = 'Te enfrentas a una resubida (3-bet) a 9 BB.';
            break;
        case '4-bet':
            secondLine = 'Un rival te ha hecho una resubida muy grande (4-bet) a 22 BB.';
            break;
    }
    
    return (
        <>
            {firstLine}
            <br />
            {secondLine}
            <br />
            ¿Qué haces?
        </>
    );
  };

  const descriptionText = generateDescription();

  if (state.isLoading || !state.currentHand) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-6 text-lg font-semibold text-muted-foreground">
          Cargando escenario y buscando rango...
        </p>
        <p className="mt-2 text-sm text-muted-foreground/80 max-w-sm">
            ({state.scenario.position}, {state.scenario.stackSize}BB, {state.scenario.tableType}, vs {state.scenario.previousAction})
        </p>
        <div className="mt-8 border-t border-dashed w-full max-w-md"></div>
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <Lightbulb className="h-8 w-8 text-yellow-400" />
            <p className="font-headline text-xl text-foreground">Consejo del Pro:</p>
            <p className="text-muted-foreground max-w-xs">{currentTip}</p>
        </div>
      </div>
    );
  }

  const isBBvsLimp =
    state.scenario.position === 'BB' && state.scenario.previousAction === 'none';
  
  const isSBOpen = state.scenario.position === 'SB' && state.scenario.previousAction === 'none';
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
            onClick={handleNextHand}
            aria-label="Escenario Aleatorio"
          >
            <Shuffle className="h-7 w-7" />
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
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
                      
                      <Separator />

                      <div className="space-y-2">
                        <Label>Mano Específica (Opcional)</Label>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Ej: AKs, 77, T9o"
                                value={customHand}
                                onChange={(e) => setCustomHand(e.target.value)}
                            />
                            <Button onClick={handleSetCustomHandAndScenario}><Hand className="h-4 w-4"/></Button>
                        </div>
                      </div>

                      <Separator />

                      <h3 className="font-semibold">Escenario de Práctica</h3>

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
                              {PREVIOUS_ACTIONS.map((pa) => (
                                <SelectItem key={pa} value={pa}>
                                  {
                                    {
                                      'none': 'Nadie ha apostado',
                                      'raise': 'Enfrentando un Open-Raise',
                                      '3-bet': 'Enfrentando un 3-Bet',
                                      '4-bet': 'Enfrentando un 4-Bet',
                                    }[pa]
                                  }
                                </SelectItem>
                              ))}
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
            <CardTitle className="font-headline mb-2 text-2xl sm:text-3xl">Tu Mano</CardTitle>
            <CardDescription className="leading-relaxed px-2">
                {descriptionText}
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6 sm:gap-8 min-h-[350px]">
            {state.currentHand ? (
                <div className="flex gap-2 sm:gap-4">
                {renderCard(state.currentHand.cards[0])}
                {renderCard(state.currentHand.cards[1])}
                </div>
            ) : (
                <Loader2 className="animate-spin h-12 w-12" />
            )}

            {state.feedback && (
                <div className="w-full max-w-md space-y-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
                <Alert
                    variant={state.feedback.isOptimal ? 'default' : 'destructive'}
                >
                    <div className="flex items-center justify-between gap-2">
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
                        className="shrink-0"
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
                 state.error ? (
                    <div className="flex flex-col items-center justify-center text-center">
                        <XCircle className="h-10 w-10 text-destructive mb-2" />
                        <p className="font-semibold text-destructive">Error al Cargar Rango</p>
                        <p className="text-destructive/80 text-sm max-w-xs">
                            {state.error}
                        </p>
                    </div>
                ) : state.currentHandRange ? (
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 w-full px-4">
                    {isBBvsLimp ? (
                        <>
                            <Button className="w-full sm:w-auto"
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Check ✅
                            </Button>
                             <Button className="w-full sm:w-auto"
                                variant="default"
                                size="lg"
                                onClick={() => handleAction('raise')}
                            >
                                Bet 🚀
                            </Button>
                        </>
                    ) : isSBOpen ? (
                        <>
                            <Button className="w-full sm:w-auto"
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                             <Button className="w-full sm:w-auto"
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Call 💰
                            </Button>
                            <Button className="w-full sm:w-auto"
                                variant="default"
                                size="lg"
                                onClick={() => handleAction('raise')}
                            >
                                Raise 🚀
                            </Button>
                        </>
                    ) : showOpenRaiseActions ? (
                        <>
                            <Button className="w-full sm:w-auto"
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                            <Button className="w-full sm:w-auto"
                                variant="default"
                                size="lg"
                                onClick={() => handleAction('raise')}
                            >
                                Raise 🚀
                            </Button>
                        </>
                    ) : showVsRaiseActions ? (
                        <>
                            <Button className="w-full sm:w-auto"
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                             <Button className="w-full sm:w-auto"
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Call 💰
                            </Button>
                            <Button
                                className="w-full sm:w-auto text-accent-foreground hover:bg-accent/90"
                                style={{backgroundColor: 'hsl(var(--accent))'}}
                                size="lg"
                                onClick={() => handleAction('3-bet')}
                            >
                                3-Bet 💣
                            </Button>
                        </>
                    ) : showVs3BetActions ? (
                         <>
                            <Button className="w-full sm:w-auto"
                                variant="destructive"
                                size="lg"
                                onClick={() => handleAction('fold')}
                            >
                                Fold 🤚
                            </Button>
                             <Button className="w-full sm:w-auto"
                                variant="secondary"
                                size="lg"
                                onClick={() => handleAction('call')}
                            >
                                Call 💰
                            </Button>
                            <Button
                                className="w-full sm:w-auto text-accent-foreground hover:bg-accent/90"
                                style={{backgroundColor: 'hsl(var(--accent))'}}
                                size="lg"
                                onClick={() => handleAction('4-bet')}
                            >
                                4-Bet 💣
                            </Button>
                        </>
                    ) : showVs4BetActions ? (
                        <>
                           <Button className="w-full sm:w-auto"
                               variant="destructive"
                               size="lg"
                               onClick={() => handleAction('fold')}
                           >
                               Fold 🤚
                           </Button>
                            <Button className="w-full sm:w-auto"
                               variant="destructive"
                               
                               style={{backgroundColor: 'hsl(var(--destructive))'}}
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
                        <p className="font-semibold text-destructive">Sin Rango Definido</p>
                        <p className="text-destructive/80 text-sm max-w-xs">
                            No hay un rango GTO en la base de datos para este escenario. La IA puede estar generando uno ahora...
                        </p>
                    </div>
                )
            ) : (
                <Button size="lg" onClick={handleNextHand}>
                    Siguiente Mano Aleatoria
                </Button>
            )}
            </CardContent>
        </Card>
        {state.feedback && state.currentHandRange && (
            <div className="p-1 animate-in fade-in-0 duration-500">
                <HandRangeGrid
                    currentHand={state.currentHand?.handNotation}
                    range={state.currentHandRange}
                />
            </div>
        )}
    </div>
  );
}
