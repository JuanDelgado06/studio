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

export default function LearnPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Conceptos Clave del Poker Preflop</CardTitle>
                <CardDescription>
                    Domina los fundamentos para construir una estrategia sólida desde el inicio.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {educationalContent.map((item) => (
                        <AccordionItem value={item.value} key={item.value}>
                            <AccordionTrigger className="font-headline text-lg">{item.title}</AccordionTrigger>
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
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Ejercicio Práctico: Pot Odds</CardTitle>
            <CardDescription>Calcula si tienes las odds para pagar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            <p><strong>Escenario:</strong> El pozo es de $100. Tu oponente apuesta $50. Tienes un proyecto de color en el turn.</p>
            <p><strong>Cálculo:</strong></p>
            <ol className="list-decimal list-inside space-y-2 pl-4">
                <li><strong>Pozo total:</strong> $100 (pozo inicial) + $50 (apuesta) = $150.</li>
                <li><strong>Costo para pagar:</strong> $50.</li>
                <li><strong>Pot Odds:</strong> $150:$50, que se simplifica a 3:1.</li>
                <li><strong>Equity necesaria:</strong> Debes ganar más de 1 de cada 4 veces. $50 / ($150 + $50) = 25%.</li>
                <li><strong>Tu equity:</strong> Con 9 outs para color, tienes ~19.6% de equity.</li>
            </ol>
            <p><strong>Conclusión:</strong> No tienes las pot odds directas para pagar. Necesitarías "odds implícitas" (la posibilidad de ganar más dinero en calles futuras) para justificar el call.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Módulo de IA: Ejercicios Personalizados</CardTitle>
            <CardDescription>El agente de IA puede analizar tu historial y sugerir ejercicios para mejorar tus puntos débiles. (Función en desarrollo)</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-muted-foreground">Próximamente: Presiona un botón para que la IA genere ejercicios basados en tus errores más frecuentes.</p>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
