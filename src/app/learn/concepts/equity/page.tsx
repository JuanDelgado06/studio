
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Calculator, PieChart, CheckCircle, XCircle, Percent, Shield, Sword, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const outsData = [
    { situation: 'Proyecto de color (Flush Draw)', outs: 9, probability: '~36%' },
    { situation: 'Escalera abierta (Open-Ended)', outs: 8, probability: '~32%' },
    { situation: 'Dos overcards', outs: 6, probability: '~24%' },
    { situation: 'Escalera interna (Gutshot)', outs: 4, probability: '~16%' },
    { situation: 'Un par buscando un trío (Set)', outs: 2, probability: '~8%' },
    { situation: 'Proyecto de color + Escalera abierta', outs: 15, probability: '~54%' },
];


const EquityCalculator = () => {
    const [potSize, setPotSize] = useState(100);
    const [betToCall, setBetToCall] = useState(50);
    const [outs, setOuts] = useState(9);
    const [street, setStreet] = useState<'flop' | 'turn'>('flop');

    const { potOddsPercentage, equityPercentage, isProfitable } = useMemo(() => {
        const totalPot = potSize + betToCall + betToCall;
        const potOddsDecimal = totalPot > 0 ? betToCall / totalPot : 0;
        const potOddsPercentage = (potOddsDecimal * 100);
        
        const equityMultiplier = street === 'flop' ? 4 : 2;
        const equityPercentage = outs * equityMultiplier;

        const isProfitable = equityPercentage > potOddsPercentage;
        return { potOddsPercentage, equityPercentage, isProfitable };
    }, [potSize, betToCall, outs, street]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Calculator className="text-primary"/>
                    Calculadora de Equity vs. Pot Odds
                </CardTitle>
                <CardDescription>Esta herramienta te ayuda a aplicar la "Regla del 4 y 2" en tiempo real para visualizar si un call es rentable (+EV) basándote en tus outs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex justify-center gap-2">
                    <Button onClick={() => setStreet('flop')} variant={street === 'flop' ? 'default' : 'outline'}>
                        En el Flop (Regla del 4)
                    </Button>
                    <Button onClick={() => setStreet('turn')} variant={street === 'turn' ? 'default' : 'outline'}>
                        En el Turn (Regla del 2)
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <Label htmlFor="pot-size">Tamaño del Bote</Label>
                        <Input id="pot-size" type="number" value={potSize} onChange={(e) => setPotSize(Number(e.target.value))} />
                        <Slider value={[potSize]} onValueChange={(v) => setPotSize(v[0])} max={1000} step={10} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="bet-to-call">Apuesta a Pagar</Label>
                        <Input id="bet-to-call" type="number" value={betToCall} onChange={(e) => setBetToCall(Number(e.target.value))} />
                        <Slider value={[betToCall]} onValueChange={(v) => setBetToCall(v[0])} max={500} step={5} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="outs">Outs (Cartas que te sirven)</Label>
                        <Input id="outs" type="number" value={outs} onChange={(e) => setOuts(Number(e.target.value))} />
                        <Slider value={[outs]} onValueChange={(v) => setOuts(v[0])} max={20} step={1} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Equity Requerida (Pot Odds)</p>
                        <p className="text-3xl font-bold text-destructive">{potOddsPercentage.toFixed(1)}%</p>
                    </div>
                     <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Tu Equity Estimada (x{street === 'flop' ? 4 : 2})</p>
                        <p className="text-3xl font-bold text-primary">{equityPercentage.toFixed(1)}%</p>
                    </div>
                </div>

                <div className={cn(
                    'p-4 rounded-lg text-center border transition-all',
                    isProfitable ? 'bg-primary/10 border-primary' : 'bg-destructive/10 border-destructive'
                )}>
                    <h3 className={cn(
                        'font-headline text-2xl font-bold flex items-center justify-center gap-2',
                        isProfitable ? 'text-primary' : 'text-destructive'
                    )}>
                        {isProfitable ? <CheckCircle/> : <XCircle/>}
                        El Call es {isProfitable ? 'Rentable (+EV)' : 'No Rentable (-EV)'}
                    </h3>
                     <p className="text-sm text-muted-foreground mt-2">
                        {isProfitable 
                        ? `Tu probabilidad de ganar (${equityPercentage.toFixed(1)}%) es mayor que la equity que necesitas para que el call sea rentable (${potOddsPercentage.toFixed(1)}%).`
                        : `Necesitas un ${potOddsPercentage.toFixed(1)}% de equity para justificar el call, pero solo tienes un ${equityPercentage.toFixed(1)}%.`}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default function EquityConceptPage() {
  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-4">
            <Link href="/learn/concepts" className="self-start">
                <Button variant="default" className="shadow-md hover:shadow-lg transition-shadow">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Conceptos
                </Button>
            </Link>
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                    <PieChart className="h-8 w-8" />
                    Equity: Tu Porción del Bote
                </h1>
                <p className="text-muted-foreground">
                    La equity es tu probabilidad de ganar la mano. Es el concepto matemático más importante para tomar decisiones rentables en el póker.
                </p>
            </div>
        </div>
        <Separator />
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">¿Qué es la Equity?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-foreground/90">
                <p>
                    Imagina que el bote es un pastel. Tu equity es la porción del pastel que "te pertenece" en base a tus probabilidades de tener la mejor mano al final (en el showdown). Si tienes un 60% de equity, te corresponde el 60% del bote a largo plazo.
                </p>
                 <p>
                    Aunque a menudo se simplifica calculando tu equity contra una mano específica (mano vs. mano), en la práctica debes pensar en tu <strong>equity contra el rango completo de manos</strong> que podría tener tu oponente. Por ejemplo, si sospechas que tu rival solo apuesta fuerte con manos como tríos (sets) o dobles pares, tu equity con un proyecto de color será menor que si crees que su rango también incluye proyectos fallidos o pares medios.
                </p>
                 <p>
                    Contar "outs" y usar la "Regla del 4 y 2" es una <strong>heurística</strong> (un atajo mental) que usamos en la mesa para obtener una estimación rápida de nuestra equity. No es un cálculo exacto contra un rango, pero es una herramienta práctica y poderosa para tomar decisiones rápidas.
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">⚡ La Regla del 4 y del 2: Cálculo Rápido de Equity</CardTitle>
                <CardDescription>No necesitas ser un genio matemático en la mesa. Usa esta regla simple para estimar tu equity en segundos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>El primer paso es contar tus <strong>"outs"</strong>: las cartas que quedan en la baraja que mejorarán tu mano a una que probablemente ganará.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <h4 className="font-semibold text-lg text-primary-foreground">En el Flop (con 2 cartas por venir)</h4>
                        <p className="font-mono text-2xl mt-2">Outs × 4 ≈ Tu Equity %</p>
                    </div>
                     <div className="p-4 bg-secondary/20 rounded-lg border">
                        <h4 className="font-semibold text-lg">En el Turn (con 1 carta por venir)</h4>
                        <p className="font-mono text-2xl mt-2">Outs × 2 ≈ Tu Equity %</p>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-lg mb-2">📊 Tabla de Outs Comunes</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Situación de Proyecto</TableHead>
                                <TableHead className="text-center">Outs</TableHead>
                                <TableHead className="text-right">Equity Estimada (en el Flop)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {outsData.map((d) => (
                                <TableRow key={d.situation}>
                                    <TableCell>{d.situation}</TableCell>
                                    <TableCell className="text-center font-bold">{d.outs}</TableCell>
                                    <TableCell className="text-right text-primary font-semibold">{d.probability}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <EquityCalculator />

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BrainCircuit className="text-primary"/> La Decisión Final: Rango, Equity y Pot Odds
                </CardTitle>
                <CardDescription>Aquí es donde todo se une. Compara lo que puedes ganar (tu equity) con lo que te cuesta (las pot odds), siempre pensando en el rango del rival.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="text-center p-6 rounded-lg bg-background border-2 border-dashed">
                    <p className="text-xl font-semibold text-primary">Si tu Equity Estimada (%) > Equity Requerida por las Pot Odds (%) → El call es rentable (+EV).</p>
                    <p className="text-xl font-semibold text-destructive mt-3">Si tu Equity Estimada (%) &lt; Equity Requerida por las Pot Odds (%) → El call NO es rentable (-EV).</p>
                 </div>
                 <Separator/>
                 <h4 className="font-semibold text-lg">🃏 Ejemplo Práctico 1: Proyecto Fuerte en Posición</h4>
                 <div className="rounded-lg border bg-secondary/50 p-4 space-y-3">
                    <p><strong>Tu Mano:</strong> <code className="bg-muted px-2 py-1 rounded-md">8♠ 7♠</code></p>
                    <p><strong>Flop:</strong> <code className="bg-muted px-2 py-1 rounded-md">6♠ 5♦ K♥</code></p>
                    <p>Tienes un proyecto de escalera abierta (Open-Ended Straight Draw).</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">1. Analiza la situación y el rango del rival:</p>
                            <p className="text-sm">Un rival "tight" subió desde posición media. Su rango probable contiene pares altos (AA-TT), broadways (AK, AQ, KQ) y quizás algunos pares medios (99, 88). Es poco probable que tenga manos débiles.</p>
                        </div>
                        <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">2. Estima tu Equity con la regla rápida:</p>
                            <p>Necesitas un 4 o un 9 para la escalera. Hay cuatro 4s y cuatro 9s, así que tienes <strong>8 outs</strong>.</p>
                            <p className="font-mono mt-2">8 outs × 4 (Regla del 4) = <strong className="text-primary text-xl">~32%</strong></p>
                        </div>
                         <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">3. Calcula tus Pot Odds:</p>
                            <p>El bote es de $90. El rival apuesta $30. Debes pagar $30 para ganar $150 ($90 bote + $30 rival + $30 tuyos).</p>
                            <p className="font-mono mt-2">30 / 150 = <strong className="text-destructive text-xl">20%</strong></p>
                        </div>
                         <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">4. Compara y decide:</p>
                             <p>Tu equity estimada (~32%) es mayor que la equity que necesitas para que el call sea rentable (20%). Aunque algunas de sus manos (como un set de Reyes) te tienen casi sin outs, contra la mayoría de su rango (pares altos como AA/KK, o broadways como AK/AQ) tienes una excelente equity.</p>
                        </div>
                    </div>
                     <div className="text-center pt-3">
                        <Badge variant="default" className="text-lg py-2 px-4">32% (Tu Equity) > 20% (Equity Requerida)</Badge>
                        <p className="mt-2 font-semibold text-lg">✅ ¡El call es matemáticamente correcto y rentable a largo plazo!</p>
                     </div>
                 </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🃏 Ejemplos Estratégicos Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-3">
                    <h4 className="font-semibold text-lg text-destructive flex items-center gap-2"><AlertTriangle/>Ejemplo 2: Proyecto de Color Débil y Reverse Implied Odds</h4>
                    <p><strong>Tu Mano:</strong> <code className="bg-background/50 px-2 py-1 rounded-md">4♦ 5♦</code></p>
                    <p><strong>Flop:</strong> <code className="bg-background/50 px-2 py-1 rounded-md">A♦ K♦ 9♣</code></p>
                    <p>Tienes un proyecto de color bajo. Un rival muy agresivo apuesta fuerte.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-background/30 rounded-md">
                            <p className="font-semibold mb-2">Análisis del Problema:</p>
                            <p className="text-sm">En teoría, tienes 9 outs para tu color (~36% equity). Si las pot odds son del 25%, parecería un call claro. <strong>Pero aquí está la trampa.</strong></p>
                        </div>
                        <div className="p-3 bg-background/30 rounded-md">
                            <p className="font-semibold mb-2">El Peligro de los Outs "Sucios":</p>
                            <p className="text-sm">El rango del rival agresivo contiene muchos diamantes mejores que los tuyos (ej. Q♦J♦, J♦T♦, A♣X♦). Si completas tu color con un diamante bajo (como 2♦), y el rival sigue apostando fuerte en el turn/river, es muy probable que tenga un color más alto.</p>
                             <p className="text-sm mt-2">Si pagas y pierdes un bote enorme, sufres de <strong>"Reverse Implied Odds"</strong>. Tus "outs" están sucios porque, al conectar, te llevan a perder más dinero.</p>
                        </div>
                    </div>
                     <div className="text-center pt-3">
                        <Badge variant="destructive" className="text-lg py-2 px-4">Foldear es a menudo la jugada correcta</Badge>
                        <p className="mt-2 font-semibold text-lg">❌ Contra mucha agresión y con proyectos dominados, pagar es una receta para el desastre (-EV).</p>
                     </div>
                 </div>
                 
                 <div className="rounded-lg border border-secondary p-4 space-y-3">
                    <h4 className="font-semibold text-lg">Ejemplo 3: "Set Mining" con un Par Pequeño</h4>
                    <p><strong>Tu Mano:</strong> <code className="bg-muted px-2 py-1 rounded-md">2♥ 2♠</code></p>
                    <p><strong>Situación:</strong> Un rival sube pre-flop. Tú estás en posición y tienes que decidir si pagar.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">Análisis de Pot Odds Directas:</p>
                            <p className="text-sm">Tienes solo <strong>2 outs</strong> para ligar tu trío (set) en el flop. La probabilidad es de solo ~12%. Es casi imposible que las pot odds pre-flop justifiquen el call.</p>
                        </div>
                        <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">El Poder de las Implied Odds:</p>
                            <p className="text-sm">Aquí no juegas por la equity inmediata, sino por las <strong>ganancias futuras potenciales</strong>. Si conectas tu trío en el flop, tu mano está muy oculta. El rival, que probablemente tiene cartas altas (AA, AK, KQ), a menudo pagará grandes apuestas en flop, turn y river.</p>
                             <p className="text-sm mt-2">La regla general es la "Regla del 5/10": solo es rentable pagar si tanto tú como tu rival tenéis stacks efectivos de al menos 10-15 veces la cantidad que tienes que pagar. Esto asegura que, si conectas, ganarás lo suficiente para compensar todas las veces que no lo hagas.</p>
                        </div>
                    </div>
                     <div className="text-center pt-3">
                        <Badge variant="secondary" className="text-lg py-2 px-4">Decisión basada en Implied Odds, no en Pot Odds</Badge>
                        <p className="mt-2 font-semibold text-lg">✅ Pagar es correcto si los stacks son profundos; es un fold claro si son cortos.</p>
                     </div>
                 </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🎯 Conceptos Avanzados: La Equity en el Mundo Real</CardTitle>
                <CardDescription>La equity no es solo tu probabilidad de ganar si todas las cartas se ven. Hay dos conceptos clave que modifican su valor: la Fold Equity (tu espada) y la Realización de Equity (tu escudo).</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-1 gap-6">
                 <div className="p-6 rounded-lg border-2 border-dashed border-red-500/30 bg-red-900/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Sword className="h-8 w-8 text-red-400" />
                        <h3 className="font-headline text-2xl text-red-400">Fold Equity: Ganar sin Enseñar las Cartas</h3>
                    </div>
                    <p className="text-red-200/80">
                        Tu instinto es correcto: la mayoría de las manos de póker (más del 70-80%) no llegan al showdown. La Fold Equity es el arte y la ciencia de ganar el bote ahora mismo, sin necesidad de tener la mejor mano al final. Cuando tienes Fold Equity, dejas de ser un jugador pasivo que depende de "ligar" buenas cartas y te conviertes en un jugador agresivo que fuerza al oponente a tomar decisiones difíciles.
                    </p>
                    
                    <h4 className="font-semibold text-lg text-red-300 pt-2">El Poder del Semi-Farol: Tu "Plan B"</h4>
                    <p className="text-sm text-red-200/90">
                        Un farol puro (apostar con 0% de equity, como con 7♦ 2♣ en un flop K♠ J♥ 5♣) solo tiene una forma de ganar: que el rival se retire. Si te pagan, estás "muerto". Un semi-farol te da dos formas de ganar.
                    </p>
                    <div className="p-4 bg-background/30 rounded-md text-sm mt-2 border border-red-400/20">
                        <p className="font-bold text-base text-red-300 mb-2">🃏 Ejemplo Práctico de Semi-Farol:</p>
                        <p><strong>Tu Mano:</strong> <code className="bg-background/50 px-1.5 py-0.5 rounded">A♥ 5♥</code> (Proyecto de color Nut)</p>
                        <p><strong>Flop:</strong> <code className="bg-background/50 px-1.5 py-0.5 rounded">K♥ 9♣ 2♥</code></p>
                        <p><strong>Acción:</strong> Tu rival apuesta (una c-bet). Tú decides subir la apuesta (raise).</p>
                        <p className="mt-3 font-semibold">¿Por qué este raise es tan poderoso?</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li><strong className="text-red-300">Ganas con Fold Equity (Plan A):</strong> Tu rival puede tener una mano media (como A♣ 9♦ o T♦ T♠) o un farol fallido. Ante tu agresión, es muy probable que foldee. Ganas el bote inmediatamente.</li>
                            <li className="mt-1"><strong className="text-red-300">Ganas con Equity Real (Plan B):</strong> El rival te paga (quizás con K♦ Q♦ - un Top Pair). ¡No hay problema! Todavía tienes 9 outs (cualquier ♥) para completar tu color y ganar un bote mucho más grande en el turn o river.</li>
                        </ul>
                    </div>

                    <h4 className="font-semibold text-lg text-red-300 pt-2">¿Cuándo Tengo Alta Fold Equity?</h4>
                     <p className="text-sm text-red-200/90">
                        Tu trabajo como jugador es ser un "cazador de Fold Equity". Búscala en estas situaciones:
                    </p>
                    <ul className="list-none space-y-3 text-sm">
                        <li><strong>A. La Textura del Board:</strong> En "Dry Boards" (Mesas Secas) como K-7-2, tu Fold Equity es ALTA. En "Wet Boards" (Mesas Húmedas) como J♥ T♥ 9♠, es BAJA.</li>
                        <li><strong>B. Tu Posición:</strong> Tienes ALTA Fold Equity cuando estás "En Posición" (IP) y BAJA Fold Equity "Fuera de Posición" (OOP).</li>
                        <li><strong>C. El Rival y Tu Imagen:</strong> Tienes ALTA Fold Equity contra jugadores "Tight-Weak" (miedosos) y BAJA Fold Equity contra "Calling Stations" (que pagan todo).</li>
                    </ul>

                     <h4 className="font-semibold text-lg text-red-300 pt-2">Fold Equity y el Tamaño de la Apuesta</h4>
                     <p className="text-sm text-red-200/90">
                        Tu objetivo es usar tu apuesta para arruinarle las Pot Odds al rival.
                    </p>
                     <div className="p-4 bg-background/30 rounded-md text-sm mt-2 border border-red-400/20">
                        <p className="font-bold text-base text-red-300 mb-2">Ejemplo de Bet Sizing:</p>
                        <p>Bote de $100. Crees que el rival tiene un proyecto de color (~36% equity).</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li><strong className="text-red-200/80">Mala Apuesta ($25):</strong> El rival paga $25 para ganar $150. Le das odds de 5 a 1 (necesita ~17% equity). Su call es súper rentable. <strong className="text-red-300">Tu Fold Equity es baja.</strong></li>
                            <li className="mt-1"><strong className="text-red-300">Buena Apuesta ($100):</strong> El rival paga $100 para ganar $300. Le das odds de 2 a 1 (necesita ~33% equity). Su call es, en el mejor caso, neutral. <strong className="text-red-300">Tu Fold Equity es mucho más alta.</strong></li>
                        </ul>
                    </div>
                </div>

                 <div className="p-6 rounded-lg border-2 border-dashed border-sky-500/30 bg-sky-900/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-sky-400" />
                        <h3 className="font-headline text-2xl text-sky-400">Equity Realization: No Todo lo que Brilla es Oro</h3>
                    </div>
                    <p className="text-sky-200/80">
                       La "Equity Realization" (Realización de Equity) mide qué porcentaje de tu equity "en papel" puedes esperar convertir en ganancias reales. No siempre podrás "cobrar" el 100% de tu equity.
                    </p>
                    <h4 className="font-semibold text-lg text-sky-300 pt-2">El Concepto Clave: Jugabilidad</h4>
                    <p className="text-sm text-sky-200/90">
                        Ciertas manos "realizan" su equity mejor que otras.
                    </p>
                    <div className="p-4 bg-background/30 rounded-md text-sm mt-2 border border-sky-400/20">
                        <p className="font-bold text-base text-sky-300 mb-2">🃏 Ejemplo Práctico: 7♥6♥ vs. A♠2♦</p>
                        <p>Pre-flop, <code className="bg-background/50 px-1.5 py-0.5 rounded">A♠2♦</code> tiene más equity (~53%) contra una mano aleatoria que <code className="bg-background/50 px-1.5 py-0.5 rounded">7♥6♥</code> (~47%).</p>
                        <p className="mt-3 font-semibold">Entonces, ¿por qué los profesionales prefieren jugar 7♥6♥ en muchas situaciones?</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li><strong className="text-sky-300">Forma Manos Ocultas:</strong> Si el flop es 9-8-5, tienes una escalera "nuts" (la mejor posible). El rival con A-K nunca sabrá qué le ha golpeado. Esto te permite ganar botes enormes.</li>
                            <li className="mt-1"><strong className="text-sky-300">Evita la Dominación:</strong> Con A♠2♦, si en el flop aparece un As, a menudo te enfrentarás a un As con un "kicker" (carta de acompañamiento) mejor (AK, AQ, AJ). Estarás "dominado" y perderás muchas fichas. 7♥6♥ rara vez está dominada de la misma manera.</li>
                        </ul>
                    </div>
                    <h4 className="font-semibold text-lg text-sky-300 pt-2">Factores que Afectan tu Realización de Equity</h4>
                    <p className="text-sm text-sky-200/90">
                        Tu capacidad de llegar al showdown y ganar depende de:
                    </p>
                    <ul className="list-none space-y-3 text-sm">
                        <li><strong>1. Posición (El Factor #1):</strong> Estar **en posición** (IP) es el factor más importante. Te permite controlar el bote, tomar la última decisión y ver si tu rival muestra debilidad. Realizas mucha más equity IP. Estar **fuera de posición** (OOP) es un desastre para la realización de equity, ya que te enfrentas a apuestas sin saber qué hará el rival.</li>
                        <li><strong>2. Iniciativa:</strong> Si fuiste el agresor pre-flop, es más fácil seguir apostando y realizar tu equity.</li>
                        <li><strong>3. Habilidad del Rival:</strong> Contra un mal jugador, realizarás más equity. Contra un profesional muy agresivo, te será más difícil.</li>
                        <li><strong>4. Profundidad del Stack:</strong> Con stacks muy profundos, las manos especulativas (como suited connectors) realizan mejor su equity porque el premio potencial es enorme.</li>
                    </ul>
                </div>

                 <div className="md:col-span-2 text-center p-4 bg-background/50 rounded-md">
                    <p className="text-lg font-semibold font-headline">Un profesional del póker utiliza el GTO (Game Theory Optimal) para balancear estos dos conceptos. Sabe cuándo presionar con faroles (usando la Fold Equity) y cuándo protegerse y pagar (confiando en su Equity Realization).</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
