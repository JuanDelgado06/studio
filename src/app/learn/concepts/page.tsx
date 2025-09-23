
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const concepts = [
    {
        title: "1. Posición en la mesa",
        emoji: "🔹",
        content: "La posición determina cuándo actúas en cada ronda de apuestas. Cuanto más tarde actúes, más información tienes, lo que te da una mayor ventaja estratégica.",
        details: [
            "Te permite controlar el tamaño del bote.",
            "Puedes ver cómo actúan tus rivales antes de decidir.",
            "Mejora tus probabilidades de bluffear con éxito.",
            "Te ayuda a maximizar ganancias con manos fuertes y minimizar pérdidas con manos marginales."
        ],
        subTitle: "¿Por qué importa la posición?"
    },
    {
        title: "2. Pot Odds (Probabilidades del bote)",
        emoji: "🔹",
        content: "Compara el tamaño del bote con la cantidad que debes pagar. Si tus probabilidades de mejorar la mano son mayores que el costo relativo, ¡vale la pena pagar!",
        example: {
            title: "Ejemplo:",
            lines: [
                "Bote: $100",
                "Apuesta rival: $20",
                "→ Debes pagar $20 para ganar $120",
                "→ Pot odds = 1:6 ≈ 16.7%"
            ]
        }
    },
    {
        title: "2.1. Implied Odds (Probabilidades implícitas)",
        emoji: "💰",
        content: "Las Implied Odds estiman cuánto podrías ganar en total si conectas tu mano, no solo lo que hay en el bote actual. Te ayudan a decidir si vale la pena pagar una apuesta aunque tus Pot Odds sean desfavorables, porque podrías ganar más en calles futuras.",
    },
    {
        title: "3. Equity",
        emoji: "🔹",
        content: "Es el porcentaje de probabilidad de ganar la mano en función de las cartas conocidas. Se usa para tomar decisiones matemáticamente correctas."
    },
    {
        title: "4. Rango de manos",
        emoji: "🔹",
        content: "Conjunto de manos que un jugador podría tener en una situación dada. Aprender a leer rangos te ayuda a anticipar jugadas y ajustar tu estrategia."
    },
    {
        title: "5. Tells (Comportamientos reveladores)",
        emoji: "🔹",
        content: "En juegos en vivo, los gestos, tiempos de reacción y patrones pueden revelar información. En línea, observa patrones de apuestas, tiempos de respuesta y tamaños de apuesta."
    },
    {
        title: "6. Tipos de apuestas",
        emoji: "🔹",
        details: [
            "Check: No apostar, pero mantener la acción.",
            "Bet: Apostar por valor o farol.",
            "Call: Igualar una apuesta.",
            "Raise: Subir la apuesta.",
            "Fold: Retirarse de la mano."
        ]
    },
    {
        title: "7. Tipos de jugadores",
        emoji: "🔹",
        details: [
            "Tight: Juega pocas manos, pero fuertes.",
            "Loose: Juega muchas manos, incluso débiles.",
            "Aggressive: Apuesta y sube con frecuencia.",
            "Passive: Prefiere igualar en lugar de subir."
        ]
    },
    {
        title: "8. Estrategia Preflop",
        emoji: "🔹",
        content: "Decide si entrar en la mano según tu posición, fuerza de cartas y estilo de juego. Usa tablas de rango para mejorar tus decisiones."
    },
    {
        title: "9. Juego postflop",
        emoji: "🔹",
        content: "Evalúa cómo el flop afecta tu mano y la de tus rivales. Ajusta tu estrategia según la textura del tablero (conectado, con color, seco, etc.)."
    },
    {
        title: "10. Bankroll Management",
        emoji: "🔹",
        content: "Administra tu dinero para evitar quiebras. Nunca juegues con más del 5% de tu bankroll en una sola sesión."
    }
];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept, index) => (
            <Card key={index} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-start gap-2">
                        <span className="text-primary">{concept.emoji}</span>
                        <span>{concept.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    {concept.content && <p className="text-muted-foreground">{concept.content}</p>}
                    {concept.subTitle && <h4 className="font-semibold text-foreground">🧠 {concept.subTitle}</h4>}
                    {concept.details && (
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {concept.details.map((detail, i) => <li key={i}>{detail}</li>)}
                        </ul>
                    )}
                    {concept.example && (
                        <div className="rounded-lg border bg-secondary/50 p-3 text-sm">
                            <p className="font-semibold mb-2">{concept.example.title}</p>
                            <div className="space-y-1">
                                {concept.example.lines.map((line, i) => (
                                    <p key={i} className="text-foreground/80">
                                        <code>{line}</code>
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}