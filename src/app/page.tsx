
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStats } from '@/context/stats-context';
import * as React from 'react';
import { suggestImprovementExercises } from '@/lib/actions';
import { BookCopy, Loader2, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const handRankings = [
  { rank: 1, name: 'Carta alta', example: 'A♠ sin combinación', value: '📉 Bajo' },
  { rank: 2, name: 'Pareja', example: '7♣ 7♦', value: '📈 Medio' },
  { rank: 3, name: 'Doble pareja', example: '9♠ 9♥ + 4♣ 4♦', value: '📈 Medio' },
  { rank: 4, name: 'Trío', example: 'Q♠ Q♥ Q♦', value: '📊 Alto' },
  { rank: 5, name: 'Escalera', example: '5♣ 6♦ 7♠ 8♥ 9♠', value: '📊 Alto' },
  { rank: 6, name: 'Color', example: '2♠ 5♠ 9♠ J♠ K♠', value: '🚀 Muy alto' },
  { rank: 7, name: 'Full House', example: '3♣ 3♦ 3♠ + 6♥ 6♠', value: '🚀 Muy alto' },
  { rank: 8, name: 'Póker', example: '10♠ 10♦ 10♣ 10♥', value: '🔥 Altísimo' },
  { rank: 9, name: 'Escalera de color', example: '7♠ 8♠ 9♠ 10♠ J♠', value: '🏆 Máximo' },
  { rank: 10, name: 'Escalera real', example: '10♠ J♠ Q♠ K♠ A♠', value: '👑 ¡La mejor!' },
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
              Guia de principiante a experto en Poker
            </CardTitle>
            <CardDescription>
              Una guía paso a paso para mejorar tu juego desde los cimientos hasta la maestría.
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground/90">
             <div className="space-y-6 not-prose">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold font-headline text-primary">🎯 Objetivo del Juego</h2>
                    <p>Ganar fichas formando la <strong>mejor mano de cinco cartas</strong> o haciendo que los demás jugadores se retiren (farol o bluff).</p>
                </div>

                <Separator />

                <div className="space-y-2">
                    <h2 className="text-xl font-bold font-headline text-primary">🧩 Tipos de Manos (de menor a mayor valor)</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Mano</TableHead>
                                <TableHead>Ejemplo</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {handRankings.map((hand) => (
                                <TableRow key={hand.rank}>
                                    <TableCell className="font-medium">{hand.rank}</TableCell>
                                    <TableCell>{hand.name}</TableCell>
                                    <TableCell><code>{hand.example}</code></TableCell>
                                    <TableCell className="text-right">{hand.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold font-headline text-primary">🔄 Rondas de Apuestas</h2>
                        <ul className="list-decimal list-inside space-y-1">
                            <li><strong>Preflop:</strong> después de recibir tus 2 cartas privadas</li>
                            <li><strong>Flop:</strong> se revelan 3 cartas comunitarias</li>
                            <li><strong>Turn:</strong> se revela una cuarta carta</li>
                            <li><strong>River:</strong> se revela la quinta y última carta</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold font-headline text-primary">🛠️ Acciones Comunes</h2>
                        <ul className="list-disc list-inside space-y-1">
                           <li><code className="font-semibold">Fold</code>: retirarse</li>
                           <li><code className="font-semibold">Call</code>: igualar la apuesta</li>
                           <li><code className="font-semibold">Raise</code>: subir la apuesta</li>
                           <li><code className="font-semibold">Check</code>: pasar sin apostar (si nadie ha apostado antes)</li>
                        </ul>
                    </div>
                </div>

                <Separator />

                 <div className="space-y-2">
                    <h2 className="text-xl font-bold font-headline text-primary">🪑 Posiciones en la Mesa</h2>
                     <p><strong>Dealer (Botón):</strong> última persona en actuar, posición ventajosa.</p>
                     <p><strong>Small Blind / Big Blind:</strong> apuestas obligatorias antes de repartir cartas.</p>
                     <p className="text-sm text-primary italic">💡 Cuanto más tarde actúes en la ronda, más información tienes para tomar decisiones estratégicas.</p>
                </div>
                 
                 <Separator />

                 <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <h2 className="text-xl font-bold font-headline text-primary">📌 Recomendación para Empezar</h2>
                     <ul className="list-disc list-inside space-y-1">
                        <li>🧠 Aprender el valor de las manos</li>
                        <li>🪑 Jugar en posición tardía</li>
                        <li>⚠️ No arriesgar demasiadas fichas con manos débiles</li>
                        <li>👀 Observar cómo juegan los demás</li>
                     </ul>
                </div>
             </div>
             
             <Separator className="my-8" />
             
             <Link href="/learn/concepts" className="block group">
                <Card className="transition-all duration-200 group-hover:scale-[1.01] group-hover:shadow-lg group-hover:border-primary/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-primary">
                            Conceptos Fundamentales
                            </CardTitle>
                            <CardDescription>
                            Aprendamos los conceptos fundamentales del poker.
                            </CardDescription>
                        </div>
                        <div className="p-2 rounded-full bg-secondary/50 transition-transform group-hover:translate-x-1">
                            <ArrowRight className="h-5 w-5 text-secondary-foreground"/>
                        </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
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
    </div>
  );
}

    
