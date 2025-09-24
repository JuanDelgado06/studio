
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PokerTable } from '@/components/poker/poker-table';

const positionTips = [
    { position: 'Early Position (UTG)', advice: 'Juega solo manos premium (pares altos, AK, AQ). Evita proyectos débiles.' },
    { position: 'Middle Position (MP)', advice: 'Puedes ampliar tu rango ligeramente. Considera suited connectors y pares medios.' },
    { position: 'Late Position (CO, BTN)', advice: 'Ideal para faroles, robos de ciegas y jugar manos especulativas.' },
    { position: 'Blinds (SB, BB)', advice: 'Aunque ya has invertido fichas, no te sientas obligado a jugar manos débiles. Defiende con criterio.' },
];

const practicalExamples = [
    { position: 'UTG', hand: 'A♠ K♦', decision: 'Raise o fold', justification: 'Mano premium, pero cuidado con múltiples rivales detrás' },
    { position: 'MP', hand: '9♠ 10♠', decision: 'Raise si mesa es pasiva', justification: 'Suited connectors con potencial, pero no para igualar raises fuertes' },
    { position: 'CO', hand: 'Q♣ J♣', decision: 'Raise o call', justification: 'Buena mano especulativa, ideal para robar ciegas o jugar en posición' },
    { position: 'BTN', hand: '6♠ 7♠', decision: 'Raise incluso sin cartas fuertes', justification: 'Puedes controlar la mano postflop y aplicar presión' },
    { position: 'SB', hand: 'K♠ 9♦', decision: 'Fold o raise fuerte', justification: 'Difícil jugar fuera de posición, mejor evitar manos medias' },
    { position: 'BB', hand: 'A♦ 4♠', decision: 'Call si no hay raise', justification: 'Puedes ver el flop gratis o barato, pero cuidado con manos dominadas' },
];

const commonErrors = [
    { position: '🔴 Early Position (UTG, UTG+1)', errors: ['Jugar manos especulativas como 76s o QJo.', 'Hacer limp en lugar de raise.', 'No considerar que hay muchos jugadores por actuar detrás.'], solution: 'Juega tight: manos premium. Si entras, hazlo con fuerza (raise o fold).' },
    { position: '🟡 Middle Position (MP, MP+1)', errors: ['No ajustar el rango a la dinámica de la mesa.', 'Igualar raises sin posición ni mano fuerte.', 'Subestimar el poder de los suited connectors.'], solution: 'Amplía tu rango con criterio. Observa quién queda por hablar. No te comprometas con manos dominadas.' },
    { position: '🟢 Late Position (CO, BTN)', errors: ['No aprovechar la posición para robar ciegas.', 'Jugar demasiado loose sin lectura de los rivales.', 'No aplicar presión postflop.'], solution: 'Sé agresivo con manos especulativas. Roba ciegas con frecuencia. Usa tu posición para controlar el bote.' },
    { position: '⚠️ Blinds (SB, BB)', errors: ['Defender demasiado por "ya haber invertido".', 'Jugar fuera de posición sin plan.', 'Igualar con manos dominadas como A4o.'], solution: 'Defiende con criterio. Considera hacer 3-bet en lugar de solo call. Posición > inversión previa.' },
];


export default function PositionConceptPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link href="/learn/concepts" className="self-start">
          <Button variant="default" className="shadow-md hover:shadow-lg transition-shadow">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a todos los Conceptos
          </Button>
        </Link>
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline text-primary">
            Posición en la Mesa: El Factor Decisivo
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            La posición determina cuándo actúas. Actuar más tarde te da más información, y la información es poder.
          </p>
        </div>
      </div>
      
      <div className="w-full flex justify-center py-8">
        <PokerTable />
      </div>

      <Separator />

      <Card className="bg-card/50">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">🧠 ¿Por qué importa la posición?</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-lg">
            <ul>
                <li>Te permite <strong>controlar el tamaño del bote</strong>.</li>
                <li>Puedes <strong>ver cómo actúan tus rivales</strong> antes de decidir.</li>
                <li>Mejora tus probabilidades de <strong>bluffear con éxito</strong>.</li>
                <li>Te ayuda a <strong>maximizar ganancias</strong> con manos fuertes y <strong>minimizar pérdidas</strong> con manos marginales.</li>
            </ul>
        </CardContent>
      </Card>

       <div className="space-y-4">
        <h2 className="text-3xl font-bold font-headline text-center">📌 Consejos Estratégicos por Posición</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positionTips.map(tip => (
            <Card key={tip.position}>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{tip.position}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tip.advice}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

       <div className="space-y-4">
        <h2 className="text-3xl font-bold font-headline text-center">🃏 Ejemplos prácticos por posición</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Posición</TableHead>
                        <TableHead>Mano</TableHead>
                        <TableHead>Decisión</TableHead>
                        <TableHead>Justificación</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {practicalExamples.map(ex => (
                        <TableRow key={ex.hand}>
                            <TableCell className="font-semibold">{ex.position}</TableCell>
                            <TableCell><code>{ex.hand}</code></TableCell>
                            <TableCell>{ex.decision}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{ex.justification}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
       </div>
       
        <div className="space-y-4">
            <h2 className="text-3xl font-bold font-headline text-center">❌ Errores Comunes por Posición</h2>
             {commonErrors.map(group => (
                <Card key={group.position}>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">{group.position}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold mb-2">Errores comunes:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                            {group.errors.map((error, i) => <li key={i}>{error}</li>)}
                        </ul>
                        <p className="font-semibold mb-2 text-primary">Cómo evitarlo:</p>
                        <p className="text-foreground/90">{group.solution}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
            <h3 className="font-headline text-2xl text-primary mb-2">🧠 Tip extra</h3>
            <p className="text-lg text-foreground/90">El error más común en todas las posiciones: no tener un plan para la mano. Antes de actuar, pregúntate: ¿Qué quiero lograr? ¿Cómo reaccionaré si me suben? ¿Qué haré en el flop?</p>
        </div>

    </div>
  );
}

    