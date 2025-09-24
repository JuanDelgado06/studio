
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

const positions = [
  {
    name: 'Posiciones Tempranas (Early Position - EP)',
    positions: ['UTG (Under the Gun)', 'UTG+1'],
    description: 'Son las primeras posiciones en actuar después de las ciegas. Es difícil jugar desde aquí porque no tienes información sobre las intenciones de los demás jugadores. Debes jugar un rango de manos muy reducido y fuerte.',
    emoji: '😰',
  },
  {
    name: 'Posiciones Medias (Middle Position - MP)',
    positions: ['MP1', 'MP2 (Hijack)'],
    description: 'Tienes más información que las posiciones tempranas. Puedes empezar a abrir tu rango de manos, incluyendo algunas manos especulativas como suited connectors o parejas medias.',
    emoji: '🤔',
  },
  {
    name: 'Posiciones Tardías (Late Position - LP)',
    positions: ['CO (Cutoff)', 'BTN (Button/Dealer)'],
    description: 'Son las mejores posiciones. El Button es la mejor de todas, ya que actúas en último lugar en todas las rondas post-flop. Desde aquí puedes jugar el rango más amplio de manos, robar las ciegas y ejercer máxima presión.',
    emoji: '😎',
  },
  {
    name: 'Las Ciegas (Blinds)',
    positions: ['SB (Small Blind)', 'BB (Big Blind)'],
    description: 'Son las peores posiciones porque, aunque son los últimos en actuar pre-flop, serás el primero en hablar en todas las rondas siguientes. Tienes que defender tu ciega con un rango bien definido para no ser explotado, pero con cuidado.',
    emoji: '🧐',
  },
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
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold font-headline text-primary">
            Posición en la Mesa: El Factor Decisivo
          </h1>
          <p className="text-lg text-muted-foreground">
            En el póker, no se trata solo de qué cartas tienes, sino de CUÁNDO las juegas.
          </p>
        </div>
      </div>
      <Separator />

      <Card className="bg-card/50">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">¿Por qué es tan importante la Posición?</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-lg">
            <p>La posición se refiere a tu asiento en la mesa en relación con el Dealer (botón). Cuanto más tarde actúes en una ronda de apuestas, más información tendrás. La información es la moneda más valiosa en el póker.</p>
            <ul>
                <li><strong>Con posición (In Position - IP):</strong> Actúas después de tus rivales. Puedes ver sus acciones (pasar, apostar, subir) antes de tomar tu decisión. Esto te da un control inmenso.</li>
                <li><strong>Sin posición (Out of Position - OOP):</strong> Actúas antes que tus rivales. Estás a ciegas, apostando sin saber qué harán los jugadores que quedan por hablar. Es una gran desventaja.</li>
            </ul>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold font-headline text-center">Un Vistazo a las Posiciones (Mesa 6-max)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positions.map((posGroup) => (
                <Card key={posGroup.name} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-3">
                           <span className="text-3xl">{posGroup.emoji}</span> 
                           {posGroup.name}
                        </CardTitle>
                        <CardDescription>{posGroup.positions.join(' / ')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{posGroup.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
      
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
        <h3 className="font-headline text-2xl text-primary mb-2">Regla de Oro</h3>
        <p className="text-lg text-foreground/90">"Cuanto mejor sea tu posición, más amplio y especulativo puede ser el rango de manos que juegas. Cuanto peor sea tu posición, más fuerte y sólido debe ser tu rango."</p>
      </div>
    </div>
  );
}
