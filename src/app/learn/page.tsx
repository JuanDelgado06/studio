
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useStats } from '@/context/stats-context';
import * as React from 'react';
import { suggestImprovementExercises } from '@/lib/actions';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const educationalContent = [
  {
    value: 'item-1',
    title: '¿Qué son los Rangos Preflop? 📈',
    description:
      'Un rango es el conjunto de manos que un jugador podría tener en una situación específica. En lugar de pensar en una mano exacta, los jugadores profesionales piensan en rangos. Esto te permite tomar decisiones más rentables a largo plazo.',
    image: { id: '1', hint: 'poker chart' },
  },
  {
    value: 'item-2',
    title: 'Entendiendo la Equity ⚖️',
    description:
      'La equity de tu mano es tu "porcentaje de derecho" al pozo en un momento dado. Si tienes un 60% de equity, en promedio ganarás el pozo el 60% de las veces si la mano llega al showdown. Es crucial para decidir si pagar una apuesta o no (pot odds).',
    image: { id: '2', hint: 'balance scale' },
  },
  {
    value: 'item-3',
    title: 'El Poder de los Blockers 🚫',
    description:
      'Tener una carta en tu mano (un "blocker") reduce la probabilidad de que tu oponente tenga combinaciones que incluyan esa carta. Por ejemplo, tener el As de picas (A♠) hace imposible que tu oponente tenga el nut flush de picas.',
    image: { id: '3', hint: 'blocking shield' },
  },
  {
    value: 'item-4',
    title: 'Tipos de Errores Comunes ❌',
    description:
      '1. **Fold Incorrecto:** Foldeas una mano que era rentable para pagar o subir. 2. **Call Incorrecto:** Pagas con una mano demasiado débil, quedando "dominado". 3. **Raise Incorrecto:** Haces un 3-bet o 4-bet con una mano que debería haber sido un call o fold, o con un tamaño incorrecto.',
    image: { id: '4', hint: 'wrong sign' },
  },
];

const pokerJourneyContent = [
    {
        value: 'journey-1',
        level: 'Nivel 1: Principiante 🐣',
        title: 'Los Cimientos del Juego',
        description: 'En esta etapa, el objetivo es construir una base sólida. Concéntrate en jugar un poker "ABC", sólido y sin complicaciones. Aprende a ser selectivo con tus manos iniciales y a valorar la posición.',
        concepts: ['Selección de manos preflop (rangos de apertura)', 'El valor de la posición', 'Conceptos básicos: pot odds y outs', 'Agresividad selectiva: cuándo apostar y subir'],
        image: { id: '5', hint: 'building blocks' },
    },
    {
        value: 'journey-2',
        level: 'Nivel 2: Intermedio  intermédiaire',
        title: 'Expandiendo tu Arsenal Estratégico',
        description: 'Aquí dejas de jugar solo tus cartas y empiezas a jugar contra tu oponente. Comienzas a pensar en rangos y a introducir movimientos más avanzados como el 3-bet de farol (bluff) y el semi-farol.',
        concepts: ['Juego post-flop: C-bets y second barrels', '3-bet por valor y de farol', 'Equity y Fold Equity', 'Identificar tipos de oponentes (TAG, LAG, Fish)'],
        image: { id: '6', hint: 'chess strategy' },
    },
    {
        value: 'journey-3',
        level: 'Nivel 3: Avanzado 🚀',
        title: 'Pensamiento en Múltiples Niveles',
        description: 'En el nivel avanzado, tus decisiones se basan en lo que tu oponente *piensa* que tú tienes. Dominas los conceptos matemáticos y empiezas a equilibrar tus rangos para ser impredecible.',
        concepts: ['Balancear rangos', 'Explotación vs. GTO (Teoría de Juego Óptima)', 'Control del tamaño del pozo', 'Lectura de manos avanzada y blockers'],
        image: { id: '7', hint: 'brain maze' },
    },
    {
        value: 'journey-4',
        level: 'Nivel 4: Experto 🏆',
        title: 'La Maestría del Juego',
        description: 'El nivel experto se define por la intuición refinada y una profunda comprensión de la dinámica de la mesa. Tomas decisiones óptimas de forma consistente, explotas las más mínimas debilidades de tus rivales y manejas el aspecto mental del juego como un profesional.',
        concepts: ['Estrategia GTO compleja', 'Ajustes meta-juego', 'Dominio psicológico y control del tilt', 'Maximizar el EV en situaciones marginales'],
        image: { id: '8', hint: 'trophy award' },
    }
];

export default function LearnPage() {
  const { stats } = useStats();
  const { toast } = useToast();
  const [suggestedExercises, setSuggestedExercises] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerateExercises = async () => {
    setIsLoading(true);
    setSuggestedExercises('');
    const decisionHistory = JSON.stringify(stats.decisionHistory || [], null, 2);

    const result = await suggestImprovementExercises({
      decisionRecords: decisionHistory,
    });

    if (result.success && result.data) {
      setSuggestedExercises(result.data.suggestedExercises);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al generar ejercicios',
        description:
          result.error || 'No se pudieron generar los ejercicios.',
      });
    }
    setIsLoading(false);
  };
  
  const handleClearExercises = () => {
    setSuggestedExercises('');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Conceptos Clave del Poker Preflop
            </CardTitle>
            <CardDescription>
              Domina los fundamentos para construir una estrategia sólida desde
              el inicio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {educationalContent.map((item) => (
                <AccordionItem value={item.value} key={item.value}>
                  <AccordionTrigger className="font-headline text-lg">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none text-foreground/90">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <p>{item.description}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <Image
                          src={`https://picsum.photos/seed/${item.image.id}/300/200`}
                          width={300}
                          height={200}
                          alt={item.title}
                          className="rounded-lg object-cover"
                          data-ai-hint={item.image.hint}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

       <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Tu Camino de Principiante a Experto
            </CardTitle>
            <CardDescription>
              Una guía paso a paso para mejorar tu juego desde los cimientos hasta la maestría.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {pokerJourneyContent.map((item) => (
                <AccordionItem value={item.value} key={item.value}>
                  <AccordionTrigger className="font-headline text-lg">
                    {item.level}
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none text-foreground/90">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <h3 className="font-bold text-base text-primary not-prose">{item.title}</h3>
                        <p>{item.description}</p>
                        <ul className="list-disc pl-5 space-y-1">
                            {item.concepts.map(concept => <li key={concept}>{concept}</li>)}
                        </ul>
                      </div>
                      <div className="flex items-center justify-center">
                        <Image
                          src={`https://picsum.photos/seed/${item.image.id}/300/200`}
                          width={300}
                          height={200}
                          alt={item.title}
                          className="rounded-lg object-cover shadow-lg"
                          data-ai-hint={item.image.hint}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Ejercicio Práctico: Pot Odds
          </CardTitle>
          <CardDescription>
            Calcula si tienes las odds para pagar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            <strong>Escenario:</strong> El pozo es de $100. Tu oponente apuesta
            $50. Tienes un proyecto de color en el turn.
          </p>
          <p>
            <strong>Cálculo:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li>
              <strong>Pozo total:</strong> $100 (pozo inicial) + $50 (apuesta)
              = $150.
            </li>
            <li>
              <strong>Costo para pagar:</strong> $50.
            </li>
            <li>
              <strong>Pot Odds:</strong> $150:$50, que se simplifica a 3:1.
            </li>
            <li>
              <strong>Equity necesaria:</strong> Debes ganar más de 1 de cada 4
              veces. $50 / ($150 + $50) = 25%.
            </li>
            <li>
              <strong>Tu equity:</strong> Con 9 outs para color, tienes ~19.6%
              de equity.
            </li>
          </ol>
          <p>
            <strong>Conclusión:</strong> No tienes las pot odds directas para
            pagar. Necesitarías "odds implícitas" (la posibilidad de ganar más
            dinero en calles futuras) para justificar el call.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Módulo de IA: Ejercicios Personalizados
          </CardTitle>
          <CardDescription>
            El agente de IA analiza tu historial y sugiere ejercicios para
            mejorar tus puntos débiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateExercises}
              disabled={isLoading || stats.handsPlayed < 5}
              className="flex-grow"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Generar Ejercicios
            </Button>
            {suggestedExercises && !isLoading && (
                 <Button onClick={handleClearExercises} variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                 </Button>
            )}
          </div>
          {stats.handsPlayed < 5 && (
            <p className="text-xs text-center text-muted-foreground">
              Juega al menos 5 manos para generar ejercicios.
            </p>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Analizando tu historial y generando ejercicios...
              </p>
            </div>
          )}

          {suggestedExercises && !isLoading && (
            <div className="prose prose-sm max-w-none rounded-lg border bg-secondary/50 p-4 text-foreground whitespace-pre-wrap">
                {suggestedExercises}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
