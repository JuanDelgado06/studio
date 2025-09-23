
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ConceptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Conceptos Fundamentales del Póker
        </h1>
        <p className="text-muted-foreground">
          Un glosario detallado para entender la terminología y los principios del Texas Hold'em.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Página en Construcción</CardTitle>
          <CardDescription>
            Este glosario de conceptos de póker está siendo preparado. Vuelve pronto para encontrar explicaciones detalladas sobre:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Pot Odds y Equity</li>
            <li>Rangos Preflop y Postflop</li>
            <li>Tipos de Apuestas (Value Bet, Bluff)</li>
            <li>La importancia de la Posición</li>
            <li>¡Y mucho más!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

    