
'use client';

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
import { ArrowLeft, BrainCircuit, Search, Shield, ShieldAlert, Sword, Target, TrendingDown, TrendingUp, CheckCircle, XCircle, Calculator, Scale, AlertOctagon } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const gVsEData = [
  {
    enfoque: 'GTO',
    uso: 'Limitado o nulo',
    filosofia: 'No asume errores del rival',
  },
  {
    enfoque: 'Explotativo',
    uso: 'Fundamental',
    filosofia: 'Maximiza errores del rival',
  },
];

export default function ImpliedOddsPage() {
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
            💰 Implied Odds: ¿Cuánto puedes ganar si conectas?
          </h1>
          <p className="text-muted-foreground">
            Las *Implied Odds* (odds implícitas) estiman cuánto dinero adicional podrías ganar si completas tu proyecto y el rival paga. Son esenciales cuando las *Pot Odds* no justifican el call, pero el potencial de ganancia futura sí lo hace.
          </p>
        </div>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">🧮 ¿Cómo se calculan?</CardTitle>
          <CardDescription>No hay una fórmula exacta, pero se estima de la siguiente manera:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="font-mono text-lg">Implied Odds = (Bote actual + apuestas futuras esperadas) / Cantidad a pagar</p>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <h4 className="font-semibold mb-2">Ejemplo práctico:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                <li>Bote actual: <span className="font-bold">$100</span></li>
                <li>Rival apuesta: <span className="font-bold">$20</span></li>
                <li>Tú pagas: <span className="font-bold">$20</span></li>
                <li>Estimas ganar <span className="font-bold text-primary">$60 más</span> si conectas tu proyecto</li>
            </ul>
            <Separator className="my-3"/>
            <p className="font-mono text-center">Implied Odds = (100 + 60) / 20 = 160 / 20 = 8:1</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Target className="text-primary"/>¿Cuándo usar Implied Odds?</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Proyectos marginales:</span> Gutshot (escalera interna)
                    , Overcards (cartas por encima del board)
                    , Backdoor flush (color por detrás)
                    .</li>
                    <li><span className="font-semibold text-foreground">Rivales pasivos o recreativos:</span> Pagan cuando conectas.</li>
                    <li><span className="font-semibold text-foreground">Stacks profundos:</span> Hay espacio para apuestas grandes en turn y river.</li>
                    <li><span className="font-semibold text-foreground">Posición favorable:</span> Puedes controlar el tamaño del bote.</li>
                    <li><span className="font-semibold text-foreground">Manos disfrazadas:</span> Escaleras internas, dobles pares ocultos.</li>
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><ShieldAlert className="text-destructive"/>Riesgos y trampas comunes</CardTitle>
            </CardHeader>
            <CardContent>
                 <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Implied Odds falsas:</span> Si el rival foldea cuando conectas, no ganas nada extra.</li>
                    <li><span className="font-semibold text-foreground">Proyectos obvios:</span> Si el board muestra color o escalera clara, el rival puede no pagar.</li>
                    <li><span className="font-semibold text-foreground">Outs sucios:</span> Algunas cartas pueden darte la mejor mano pero también mejorar al rival.</li>
                    <li><span className="font-semibold text-foreground">Stack efectivo limitado:</span> Si el rival tiene poco stack, no hay mucho que ganar.</li>
                </ul>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">🧠 Comparación Detallada de Odds</CardTitle>
           <CardDescription>Entender las diferencias entre los tipos de "odds" es clave para tomar decisiones precisas en la mesa.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="flex flex-col p-4 rounded-lg border bg-secondary/30">
                <div className="flex items-center gap-3 mb-2">
                    <Calculator className="h-7 w-7 text-primary" />
                    <h4 className="font-headline text-lg font-semibold">Pot Odds</h4>
                </div>
                <p className="text-sm text-muted-foreground flex-grow">Miden la rentabilidad inmediata de un call. Comparan el tamaño del bote con el costo de la apuesta. Son puramente matemáticas y objetivas.</p>
                <div className="mt-4 p-2 bg-background/50 rounded text-center text-xs"><strong className="block text-primary">Pregunta Clave:</strong> "¿El bote me paga lo suficiente AHORA MISMO para justificar este call?"</div>
            </div>
             <div className="flex flex-col p-4 rounded-lg border-2 border-primary bg-primary/10">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    <h4 className="font-headline text-lg font-semibold text-primary-foreground">Implied Odds</h4>
                </div>
                <p className="text-sm text-foreground/80 flex-grow">Estiman las ganancias futuras potenciales si completas tu proyecto. Son subjetivas y dependen de tu lectura del rival y la situación.</p>
                 <div className="mt-4 p-2 bg-background/50 rounded text-center text-xs"><strong className="block text-primary">Pregunta Clave:</strong> "Si conecto mi mano, ¿cuánto MÁS podré extraer de mi rival en las siguientes calles?"</div>
            </div>
             <div className="flex flex-col p-4 rounded-lg border bg-destructive/30">
                <div className="flex items-center gap-3 mb-2">
                    <AlertOctagon className="h-7 w-7 text-destructive" />
                    <h4 className="font-headline text-lg font-semibold">Reverse Implied Odds</h4>
                </div>
                <p className="text-sm text-muted-foreground flex-grow">Calculan el riesgo de pérdida futura. Ocurren cuando conectas una mano buena, pero no la mejor, y terminas pagando apuestas grandes a un rival que te domina.</p>
                <div className="mt-4 p-2 bg-background/50 rounded text-center text-xs"><strong className="block text-destructive">Pregunta Clave:</strong> "Si conecto mi mano, ¿cuánto podría perder si mi rival tiene una mano todavía mejor?"</div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">🎯 El Duelo: GTO vs. Juego Explotativo</CardTitle>
           <CardDescription>
                Las Implied Odds son el corazón del juego explotativo. Se basan en la suposición fundamental de que tu rival cometerá errores que tú puedes capitalizar.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-sky-500/30 bg-sky-900/10 space-y-4">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-sky-400" />
                    <h3 className="font-headline text-2xl text-sky-400">Juego GTO (Teórico)</h3>
                </div>
                <p className="text-sky-200/80">
                    GTO (Game Theory Optimal) es una estrategia de equilibrio. Su objetivo es jugar de una manera tan perfecta que seas **inexplotable**, sin importar cómo juegue tu oponente.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-sky-200/90">
                    <li><strong className="text-sky-300">Filosofía:</strong> "Jugaré mis rangos de forma tan balanceada que mis rivales no podrán aprovecharse de mí."</li>
                    <li><strong className="text-sky-300">Uso de Implied Odds:</strong> Mínimo o nulo. GTO no "espera" que el rival pague de más; modela respuestas óptimas de ambos lados.</li>
                    <li><strong className="text-sky-300">Enfoque:</strong> Defensivo. Protege tu EV contra oponentes de clase mundial.</li>
                </ul>
            </div>
             <div className="p-6 rounded-lg border border-red-500/30 bg-red-900/10 space-y-4">
                <div className="flex items-center gap-3">
                    <Sword className="h-8 w-8 text-red-400" />
                    <h3 className="font-headline text-2xl text-red-400">Juego Explotativo</h3>
                </div>
                <p className="text-red-200/80">
                    El juego explotativo se desvía del GTO intencionadamente para **atacar los errores específicos** y predecibles de tus rivales. Aquí es donde se maximizan las ganancias.
                </p>
                 <ul className="list-disc list-inside space-y-2 text-sm text-red-200/90">
                    <li><strong className="text-red-300">Filosofía:</strong> "He identificado un error en el juego de mi rival, y voy a ajustar mi estrategia para castigarlo y ganar más dinero."</li>
                    <li><strong className="text-red-300">Uso de Implied Odds:</strong> Fundamental. El cálculo se basa en la expectativa de que el rival **pagará de más** cuando conectes tu mano (un error).</li>
                    <li><strong className="text-red-300">Enfoque:</strong> Ofensivo. Busca activamente las debilidades para maximizar tu EV.</li>
                </ul>
            </div>
             <div className="md:col-span-2 text-center p-4 bg-background/50 rounded-md">
                <p className="text-lg font-semibold font-headline">Conclusión: Un profesional usa el GTO como su escudo y el juego explotador (con herramientas como las Implied Odds) como su espada.</p>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">🔍 Ejemplos estratégicos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">1. Proyecto disfrazado vs rival agresivo</h4>
                <p className="text-sm"><span className="font-bold">Mano:</span> 5♦6♦ en MP</p>
                <p className="text-sm"><span className="font-bold">Flop:</span> 7♣8♠K♥ → gutshot</p>
                <p className="text-sm"><span className="font-bold">Escenario:</span> Bote: $120 | Apuesta rival: $40 | Equity: ~16%</p>
                <Separator/>
                <p className="text-sm"><span className="font-bold text-destructive">Pot Odds:</span> 20% → <span className="italic">No rentable</span></p>
                <p className="text-sm"><span className="font-bold text-primary">Implied Odds estimadas:</span> 5.5:1 → <span className="italic">Call EV+</span></p>
            </div>
             <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">2. Proyecto de color vs stack corto</h4>
                <p className="text-sm"><span className="font-bold">Mano:</span> A♠J♠ en BTN</p>
                <p className="text-sm"><span className="font-bold">Flop:</span> 2♠7♠K♦ → proyecto de color</p>
                <p className="text-sm"><span className="font-bold">Escenario:</span> Bote: $80 | Apuesta rival: $40 | Stack rival: $60</p>
                <Separator/>
                <p className="text-sm"><span className="font-bold text-primary">Implied Odds:</span> 3.5:1 → <span className="italic">Rentable pero upside limitado</span></p>
            </div>
             <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">3. Escalera oculta vs rival recreativo</h4>
                <p className="text-sm"><span className="font-bold">Mano:</span> 4♣5♣ en BB</p>
                <p className="text-sm"><span className="font-bold">Flop:</span> 6♠7♦K♣ → gutshot + backdoor</p>
                <p className="text-sm"><span className="font-bold">Escenario:</span> Bote: $60 | Apuesta rival: $20</p>
                <Separator/>
                <p className="text-sm"><span className="font-bold text-primary">Implied Odds:</span> 7:1 → <span className="italic">Call EV+</span></p>
            </div>
             <div className="p-4 border rounded-lg space-y-2 bg-destructive/10 border-destructive/50">
                <h4 className="font-semibold">4. Reverse Implied Odds (riesgo oculto)</h4>
                <p className="text-sm"><span className="font-bold">Mano:</span> A♣J♣ en UTG</p>
                <p className="text-sm"><span className="font-bold">Flop:</span> A♠7♦2♥ → top pair</p>
                <p className="text-sm"><span className="font-bold">River:</span> J♦ → conectas dobles</p>
                <p className="text-sm"><span className="font-bold">Escenario:</span> Rival shovea: $300 → tiene A7, A2, sets</p>
                <Separator/>
                <p className="text-sm"><span className="font-bold text-destructive">Decisión:</span> <span className="italic">Fold correcto</span></p>
            </div>
             <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">5. Freeroll con estructura agresiva</h4>
                <p className="text-sm"><span className="font-bold">Mano:</span> 9♠T♠ en BTN</p>
                <p className="text-sm"><span className="font-bold">Flop:</span> J♠Q♦2♣ → escalera abierta + backdoor</p>
                <p className="text-sm"><span className="font-bold">Escenario:</span> Bote: $150 | Apuesta rival: $50 | Stack rival: $500</p>
                <Separator/>
                <p className="text-sm"><span className="font-bold text-primary">Implied Odds:</span> 7:1 → <span className="italic">Call EV+</span></p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
