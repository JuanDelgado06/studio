
'use client';

import React, { useState } from 'react';
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
import { ArrowLeft, BrainCircuit, Calculator } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const outsData = [
    { situation: 'Proyecto de color', outs: 9, probability: '~ 36%' },
    { situation: 'Escalera abierta', outs: 8, probability: '~ 32%' },
    { situation: 'Escalera interna (gutshot)', outs: 4, probability: '~ 16%' },
    { situation: 'Par buscando trío', outs: 2, probability: '~ 8%' },
    { situation: 'Dos pares → full house', outs: 4, probability: '~ 16%' },
    { situation: 'Trío → full house o póker', outs: 10, probability: '~ 40%' },
    { situation: 'Proyecto de escalera + color', outs: 15, probability: '~ 60%' },
];


const PotOddsCalculator = () => {
    const [potSize, setPotSize] = useState(100);
    const [betToCall, setBetToCall] = useState(20);

    const totalPot = potSize + betToCall + betToCall;
    const potOddsDecimal = totalPot > 0 ? betToCall / totalPot : 0;
    const potOddsPercentage = (potOddsDecimal * 100).toFixed(1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Calculator className="text-primary"/>
                    Calculadora Interactiva de Pot Odds
                </CardTitle>
                <CardDescription>Ajusta los valores para ver cómo cambian las pot odds en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pot-size">Tamaño del Bote (Antes de la apuesta)</Label>
                            <Input 
                                id="pot-size" 
                                type="number" 
                                value={potSize}
                                onChange={(e) => setPotSize(Number(e.target.value))}
                                className="text-lg"
                            />
                            <Slider
                                value={[potSize]}
                                onValueChange={(value) => setPotSize(value[0])}
                                max={1000}
                                step={10}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="bet-to-call">Apuesta a Igualar (Bet a pagar)</Label>
                            <Input 
                                id="bet-to-call" 
                                type="number" 
                                value={betToCall}
                                onChange={(e) => setBetToCall(Number(e.target.value))}
                                className="text-lg"
                            />
                             <Slider
                                value={[betToCall]}
                                onValueChange={(value) => setBetToCall(value[0])}
                                max={500}
                                step={5}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-6 h-full text-center">
                        <p className="text-sm text-muted-foreground">Necesitas una Equity de:</p>
                        <p className="text-4xl font-bold text-primary my-2">{potOddsPercentage}%</p>
                        <Separator className="my-3"/>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Esto significa que necesitas tener una probabilidad de ganar la mano de al menos un <strong>{potOddsPercentage}%</strong> para que igualar la apuesta de ${betToCall} sea una decisión rentable a largo plazo.
                        </p>
                    </div>
                </div>
                 <div className="text-center text-xs text-muted-foreground pt-2">
                    Fórmula aplicada: {betToCall} / ({potSize} + {betToCall} + {betToCall})
                </div>
            </CardContent>
        </Card>
    )
}

export default function PotOddsConceptPage() {
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
            <h1 className="text-3xl font-bold font-headline text-primary">
                Pot Odds y Outs: Las Matemáticas del Draw
            </h1>
            <p className="text-muted-foreground">
                Aprende a calcular si es rentable perseguir tus proyectos.
            </p>
            </div>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Definiciones Clave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 rounded-lg border bg-secondary/20">
                    <h3 className="font-semibold text-lg text-foreground">Pot Odds (Probabilidades del Bote)</h3>
                    <p className="text-muted-foreground mt-1">Las Pot Odds te ayudan a decidir si igualar una apuesta es rentable comparando lo que puedes ganar con lo que debes pagar.</p>
                </div>
                 <div className="p-4 rounded-lg border bg-secondary/20">
                    <h3 className="font-semibold text-lg text-foreground">Outs (Cartas de Mejora)</h3>
                    <p className="text-muted-foreground mt-1">Los outs son las cartas que aún no han sido reveladas y que pueden mejorar tu mano hasta convertirla en una probable ganadora.</p>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧮 ¿Cómo se calculan las Pot Odds?</CardTitle>
                <CardDescription>Compara el costo de tu call con el tamaño total del bote.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground"><span className="font-bold text-foreground">Fórmula básica:</span> <code className="bg-muted px-2 py-1 rounded-md">Pot Odds % = (Cantidad a pagar) / (Bote actual + Apuesta del rival + Cantidad a pagar)</code></p>
                <div className="rounded-lg border bg-secondary/50 p-4">
                    <h4 className="font-semibold mb-2">Ejemplo práctico:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                        <li>Bote actual: <span className="font-bold">$100</span></li>
                        <li>Apuesta del rival: <span className="font-bold">$20</span></li>
                        <li>Tú debes pagar <span className="font-bold">$20</span> para seguir en la mano. El bote total será <span className="font-bold">$140</span>.</li>
                    </ul>
                    <Separator className="my-3"/>
                    <p className="font-mono text-center">Pot Odds = 20 / (100 + 20 + 20) = 20 / 140 ≈ 0.142</p>
                    <p className="text-center font-bold text-lg text-primary mt-2">→ Necesitas un 14.2% de equity para que el call sea rentable.</p>
                </div>
            </CardContent>
        </Card>

        <PotOddsCalculator />

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧠 Identificación y Cálculo de Outs</CardTitle>
                <CardDescription>Tu probabilidad de ganar se basa en cuántas "cartas buenas" quedan en la baraja.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-lg mb-2">🔍 ¿Cómo se identifican los outs?</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>
                            <strong>Analiza tu mano y el board:</strong> ¿Qué necesitas para formar una mano ganadora (color, escalera, etc.)?
                        </li>
                         <li>
                            <strong>Cuenta las cartas que te sirven:</strong> Un proyecto de color tiene 9 outs (hay 13 cartas de un palo, 2 en tu mano y 2 en el flop, quedan 9). Una escalera abierta (ej: tienes 8-7 y el flop es 9-6-2) tiene 8 outs (los cuatro 5s y los cuatro 10s).
                        </li>
                         <li>
                            <strong>Evita duplicados y outs "sucios":</strong> No cuentes dos veces la misma carta. Ten cuidado con outs que, si bien mejoran tu mano, podrían darle una mano aún mejor a tu rival (por ejemplo, el out que te da color también completa un full house para el oponente).
                        </li>
                    </ol>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-2">📊 Tabla de Outs Comunes</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Situación</TableHead>
                                <TableHead className="text-center">Outs</TableHead>
                                <TableHead className="text-right">Probabilidad (Flop → River)</TableHead>
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
                <div>
                    <h4 className="font-semibold text-lg mb-2">La Regla Rápida del 4 y del 2</h4>
                     <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><strong>En el Flop:</strong> Multiplica tus outs por <strong>4</strong> para estimar tu probabilidad de ligar en el turn O en el river. <br/> <span className="text-xs italic">(Ej: 9 outs para color ≈ 36% de probabilidad)</span></li>
                        <li><strong>En el Turn:</strong> Multiplica tus outs por <strong>2</strong> para estimar tu probabilidad de ligar en el river. <br/> <span className="text-xs italic">(Ej: 8 outs para escalera ≈ 16% de probabilidad)</span></li>
                     </ul>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BrainCircuit className="text-primary"/> La Decisión Final: Outs vs. Pot Odds
                </CardTitle>
                <CardDescription>Aquí es donde unes los dos conceptos para tomar una decisión rentable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="text-center p-4 rounded-lg bg-background">
                    <p className="text-lg font-semibold text-primary">Si tu Probabilidad de Mejorar (Equity %) > tus Pot Odds % → El call es rentable a largo plazo (+EV).</p>
                    <p className="text-lg font-semibold text-destructive mt-2">Si tu Probabilidad de Mejorar (Equity %) &lt; tus Pot Odds % → El call NO es rentable (a menos que tengas grandes Implied Odds).</p>
                 </div>
                 <Separator/>
                 <h4 className="font-semibold text-lg">🃏 Ejemplo Práctico Completo:</h4>
                 <div className="rounded-lg border bg-secondary/50 p-4 space-y-3">
                    <p><strong>Tu Mano:</strong> <code className="bg-muted px-2 py-1 rounded-md">8♠ 9♠</code></p>
                    <p><strong>Flop:</strong> <code className="bg-muted px-2 py-1 rounded-md">6♠ J♦ 2♠</code></p>
                    <p>Tienes un proyecto de color (flush draw).</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">1. Calcula tu Equity (Probabilidad de mejorar):</p>
                            <p>Tienes <strong>9 outs</strong> (las 9 picas restantes).</p>
                            <p className="font-mono mt-2">9 outs x 4 (Regla del 4) = <span className="font-bold text-primary text-xl">36%</span></p>
                        </div>
                        <div className="p-3 bg-background/50 rounded-md">
                            <p className="font-semibold mb-2">2. Calcula tus Pot Odds:</p>
                            <p>El bote es de $100. El rival apuesta $50.</p>
                            <p className="font-mono mt-2">50 / (100 + 50 + 50) = 50 / 200 = <span className="font-bold text-primary text-xl">25%</span></p>
                        </div>
                    </div>
                     <div className="text-center pt-3">
                        <Badge variant="default" className="text-lg py-2 px-4">36% (Equity) > 25% (Pot Odds)</Badge>
                        <p className="mt-2 font-semibold text-lg">✅ ¡El call es matemáticamente correcto y rentable!</p>
                     </div>
                 </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🎯 Ejercicios Interactivos</CardTitle>
                <CardDescription>Pon a prueba tu conocimiento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Ejercicio 1 */}
                <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Ejercicio 1: Proyecto de escalera abierta</h4>
                    <p>Tienes un proyecto de escalera abierta (8 outs) en el flop. El bote es de $80 y el rival apuesta $20. ¿Igualas?</p>
                    <Separator className="my-3"/>
                    <p><strong>Solución paso a paso:</strong></p>
                    <ul className="list-disc list-inside">
                        <li>Probabilidad de mejorar: 8 outs × 4 = <span className="font-bold">32%</span></li>
                        <li>Pot Odds: 20 / (80 + 20 + 20) = 20 / 120 ≈ <span className="font-bold">16.7%</span></li>
                    </ul>
                    <p className="mt-2">Como 32% > 16.7% → <span className="font-bold text-primary">El call es rentable.</span></p>
                </div>
                 {/* Ejercicio 2 */}
                <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Ejercicio 2: Proyecto de color + par</h4>
                     <p><strong>Tu mano:</strong> K♠ Q♠ | <strong>Flop:</strong> Q♣ 5♠ 2♠</p>
                     <p>Bote: $120, Apuesta rival: $60. ¿Cuántos outs tienes y es rentable el call?</p>
                    <Separator className="my-3"/>
                    <p><strong>Solución:</strong></p>
                    <ul className="list-disc list-inside">
                        <li>Outs: 9 outs para color + 2 outs para trío (las otras dos Q). Total: <strong>11 outs</strong>.</li>
                        <li>Probabilidad: 11 × 4 = <span className="font-bold">44%</span></li>
                        <li>Pot Odds: 60 / (120 + 60 + 60) = 60 / 240 = <span className="font-bold">25%</span></li>
                    </ul>
                    <p className="mt-2">Como 44% > 25% → <span className="font-bold text-primary">El call es muy rentable.</span></p>
                </div>
                 {/* Ejercicio 3 */}
                <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Ejercicio 3: Escalera interna en el turn</h4>
                    <p><strong>Tu mano:</strong> J♣ Q♦ | <strong>Board:</strong> 10♠ 2♣ 4♥ K♠</p>
                     <p>Bote: $150, Apuesta rival: $75. ¿Es rentable el call?</p>
                    <Separator className="my-3"/>
                    <p><strong>Solución:</strong></p>
                    <ul className="list-disc list-inside">
                        <li>Outs: 4 outs (los cuatro 9s para la escalera).</li>
                        <li>Probabilidad (Regla del 2 por estar en el turn): 4 × 2 = <span className="font-bold">8%</span></li>
                        <li>Pot Odds: 75 / (150 + 75 + 75) = 75 / 300 = <span className="font-bold">25%</span></li>
                    </ul>
                    <p className="mt-2">Como 8% &lt; 25% → <span className="font-bold text-destructive">El call no es rentable. Debes foldear.</span></p>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-destructive">⚠️ Errores Comunes y Consejos Finales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <h4 className="font-semibold text-lg">Errores a Evitar:</h4>
                 <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>No contar correctamente los outs (ej. contar outs "sucios").</li>
                    <li>No considerar el stack efectivo: si el rival tiene pocas fichas detrás, tus ganancias potenciales son menores.</li>
                    <li>Ignorar el contexto: si el board tiene 3 cartas del mismo palo y tú no tienes proyecto, es probable que tu "top pair" ya no sea la mejor mano.</li>
                    <li>Olvidar las <span className="font-semibold text-foreground">implied odds</span>: a veces puedes pagar sin tener las pot odds correctas si crees que puedes ganar mucho más dinero de tu rival en calles futuras si completas tu proyecto.</li>
                 </ul>
                <Separator/>
                 <h4 className="font-semibold text-lg">Tips Estratégicos:</h4>
                 <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Usa Pot Odds junto con equity estimada para tomar decisiones precisas.</li>
                    <li>Si tus Pot Odds son favorables, iguala la apuesta (call).</li>
                    <li>Si tus Pot Odds no son favorables, la decisión por defecto es foldear, a menos que consideres un semi-bluff (raise) o tengas excelentes implied odds.</li>
                    <li>En torneos, las decisiones también se ven afectadas por el ICM y la supervivencia, no solo por las pot odds directas.</li>
                 </ul>
            </CardContent>
        </Card>

    </div>
  );
}
