
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
          <CardTitle className="font-headline text-2xl">🧮 ¿Cómo se calculan? (Método de Porcentajes)</CardTitle>
          <CardDescription>No hay una fórmula exacta, ya que se basan en la estimación. La idea es comparar tu equity con el "precio" que te ofrecen las pot odds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-secondary/50 p-4">
            <h4 className="font-semibold mb-2">Lógica Principal (Recomendado):</h4>
             <p className="text-sm text-muted-foreground mb-3">
              La fórmula para calcular la equity que realmente necesitas, considerando las ganancias futuras, es:
            </p>
            <code className="font-mono block text-center my-2 text-foreground bg-background p-2 rounded-md">
              Equity Necesaria Real % = Costo del Call / (Bote Total post-call + Ganancias Implícitas Estimadas)
            </code>
            <ul className="list-decimal list-inside space-y-2 text-sm text-foreground/90 mt-3">
                <li>Calculas tus **Pot Odds** en porcentaje (lo que necesitas para que el call sea rentable solo con el bote actual). Ej: <span className="font-bold text-destructive">25%</span>.</li>
                <li>Calculas tu **Equity** real (tus probabilidades de ganar). Ej: <span className="font-bold text-primary">20%</span>.</li>
                <li>Ves que te falta un <span className="font-bold text-destructive">5%</span>. Ahora estimas si las **ganancias futuras** que podrías obtener si conectas tu mano hacen que el call sea rentable.</li>
                <li>Aplicas la fórmula completa para ver si tu equity real (20%) es mayor que la equity necesaria real.</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-secondary/20 p-4">
            <h4 className="font-semibold mb-2">Cálculo Alternativo (basado en Ratios):</h4>
             <p className="text-sm text-muted-foreground mb-3">
              También puedes pensar en ratios. La fórmula clásica es:
            </p>
            <code className="font-mono block text-center my-2 text-foreground bg-background p-2 rounded-md">
              Implied Odds = (Bote actual + Ganancias futuras estimadas) / Cantidad a pagar
            </code>
             <ul className="list-disc list-inside space-y-2 text-sm text-foreground/90 mt-3">
                <li>**Ejemplo:** Bote de $100, rival apuesta $20 (tú pagas $20). Estimas ganar $60 adicionales.</li>
                <li>**Cálculo:** (100 + 20 + 60) / 20 = 180 / 20 = 9. Obtienes un ratio de **9:1**.</li>
                <li>**Decisión:** Comparas este ratio con el de tus probabilidades de ligar (ej: un gutshot tiene un ratio de ~11:1 en el flop). Si tus implied odds (9:1) son mejores que tus odds de ligar, el call puede ser rentable.</li>
            </ul>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-md text-sm">
            <p className="font-semibold">Independientemente del método, el objetivo es el mismo: ¿las ganancias futuras justifican el costo actual?</p>
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
          <CardDescription>
            Analicemos cómo se aplican las Implied Odds en situaciones reales de juego.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="font-headline text-lg">1. Proyecto de Gutshot vs. rival que paga de más</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p><span className="font-semibold">Escenario:</span> Estás en MP con <code className="font-mono">T♦9♦</code>. El flop es <code className="font-mono">A♣Q♠2♥</code>. No has conectado nada, pero si cae una J tendrías la mejor escalera posible (nuts). Tienes un proyecto de escalera interna (gutshot). Para ligar necesitas una J. El bote es de $120 y tu rival apuesta $40.</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-destructive">Análisis de Pot Odds</h4>
                <p className="text-sm text-muted-foreground">
                  Debes pagar $40 para ganar un bote total de $200 ($120 + $40 (apuesta) + $40 (tu call)). Tus pot odds son $40 / $200 = <strong className="text-foreground">20%</strong>.
                  <br/>
                  Tu equity real con un gutshot de 4 outs (las cuatro Jotas) es de solo <strong className="text-foreground">~16%</strong> (4 outs x 4 en el flop).
                  <br />
                  <span className="font-bold text-destructive">Conclusión: Como 16% &lt; 20%, basado en Pot Odds, es un FOLD claro.</span>
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Análisis de Implied Odds</h4>
                <p className="text-sm text-muted-foreground">
                  Aquí es donde brilla el concepto. Tu proyecto de escalera es muy oculto. Si conectas una J en el turn o river, es muy probable que tu rival (que puede tener un As) no te crea y pague una apuesta grande. Estimas que podrías extraer <strong className="text-foreground">$100 adicionales</strong> de su stack si conectas.
                  <br />
                  Ahora el cálculo es diferente: pagas $40 para ganar el bote actual ($160) MÁS los $100 que esperas ganar. Bote total potencial = $260.
                  <br />
                   <code className="font-mono block text-center my-2 text-foreground">Equity Necesaria Real = $40 (tu call) / ($160 (bote post-call) + $100 (ganancias implícitas)) = $40 / $260 ≈ 15.4%</code>
                   <br/>
                   Como tu equity real (16%) es MAYOR que la equity que necesitas considerando las ganancias implícitas (15.4%), el call se vuelve rentable.
                  <br />
                   <span className="font-bold text-primary">Decisión Final: CALL.</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="font-headline text-lg">2. Proyecto de color vs. stack corto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p><span className="font-semibold">Escenario:</span> Estás en BTN con <code className="font-mono">A♠J♠</code>. Flop <code className="font-mono">2♠7♠K♦</code>. Tienes proyecto de color nut. Bote de $80, rival apuesta $40. El stack efectivo del rival es de solo $60 más.
                </p>
              </div>
               <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Análisis de Implied Odds y Pot Odds</h4>
                <p className="text-sm text-muted-foreground">
                  Aquí las Implied Odds son limitadas por el stack del rival. Lo máximo que puedes ganar es lo que le queda detrás ($60).
                  <br />
                  Equity con proyecto de color (9 outs) ≈ <strong className="text-foreground">36%</strong>.
                  <br />
                  Pot Odds: $40 / ($80 + $40 + $40) = $40 / $160 = <strong className="text-foreground">25%</strong>.
                  <br />
                  Como tu equity (36%) es mucho mayor que tus pot odds (25%), el call ya es rentable por sí mismo. No necesitas depender de las implied odds, aunque también suman.
                  <br />
                   <span className="font-bold text-primary">Decisión Final: CALL (o incluso un Shove podría ser mejor para maximizar fold equity).</span>
                </p>
              </div>
            </CardContent>
          </Card>
          
           <Card className="bg-destructive/10 border border-destructive/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-destructive">3. Reverse Implied Odds (riesgo oculto)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p><span className="font-semibold">Escenario:</span> Estás en UTG con <code className="font-mono">A♣J♣</code>. En el river, el board es <code className="font-mono">A♠ K♦ 7♦ 2♥ J♦</code> y has conectado dobles parejas. Tu rival, que ha estado pagando pasivamente, de repente hace un 'shove' de $300 en un bote de $100.
                </p>
              </div>
               <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-destructive">Análisis de Reverse Implied Odds</h4>
                <p className="text-sm text-muted-foreground">
                  Aunque tienes una mano fuerte (dobles parejas), el board completó un proyecto de color. La acción del rival (check-call todo el camino y shove masivo en el river) grita una mano monstruo. Su rango probable incluye colores (que te ganan) y quizás algunos sets (que también te ganan).
                  <br />
                  Este es un caso clásico de Reverse Implied Odds: el mismo board que "mejora" tu mano a una buena, mejora la de tu rival a una **excelente**. Pagar aquí te costaría todo tu stack contra una mano superior.
                  <br />
                   <span className="font-bold text-destructive">Decisión Final: FOLD. Ahorrarte el dinero en este spot es más rentable a largo plazo que pagar y descubrir que estás dominado.</span>
                </p>
              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
