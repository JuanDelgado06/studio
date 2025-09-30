
'use client';

import React from 'react';
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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function StrategicLogPage() {
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
                    📓 Formato de Registro Estratégico – Torneos
                </h1>
                <p className="text-muted-foreground">
                    La herramienta definitiva para analizar tu juego, detectar patrones y acelerar tu mejora.
                </p>
            </div>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧩 1. Datos Generales del Torneo</CardTitle>
                <CardDescription>Información clave para contextualizar tu sesión de juego.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-semibold">Fecha:</span> [Fecha del torneo]</div>
                    <div><span className="font-semibold">Nombre/ID del Torneo:</span> [ID o Nombre]</div>
                    <div><span className="font-semibold">Buy-in:</span> <Badge variant="secondary">Freeroll / USDT / Otro</Badge></div>
                    <div><span className="font-semibold">Nº de Jugadores:</span> [Total de participantes]</div>
                    <div><span className="font-semibold">Etapa Alcanzada:</span> <Badge>Early / Mid / Late / ITM / FT</Badge></div>
                    <div><span className="font-semibold">Stack Inicial / Final:</span> [Fichas al inicio y final]</div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧠 2. Decisiones EV+ Tomadas</CardTitle>
                <CardDescription>Analiza jugadas donde la decisión fue correcta, independientemente del resultado. Esto refuerza tu disciplina.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mano</TableHead>
                            <TableHead>Posición</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>¿Fue EV+?</TableHead>
                            <TableHead>Resultado</TableHead>
                            <TableHead>¿Repetirías?</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><code>A♠ Q♠</code></TableCell>
                            <TableCell>CO</TableCell>
                            <TableCell>Push</TableCell>
                            <TableCell><Badge variant="default">✅ Sí</Badge></TableCell>
                            <TableCell>Perdí</TableCell>
                            <TableCell><Badge variant="default">✅ Sí</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><code>9♣ 9♦</code></TableCell>
                            <TableCell>SB</TableCell>
                            <TableCell>Call</TableCell>
                            <TableCell><Badge variant="destructive">❌ No</Badge></TableCell>
                            <TableCell>Perdí</TableCell>
                            <TableCell><Badge variant="destructive">❌ No</Badge></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🎯 3. Spots de Fold Equity</CardTitle>
                <CardDescription>Evalúa la efectividad de tus faroles y semi-faroles. ¿Estás leyendo bien la disposición de tus rivales a foldear?</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mano</TableHead>
                            <TableHead>Posición</TableHead>
                            <TableHead>Stack</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>¿Rival foldeó?</TableHead>
                            <TableHead>Lectura correcta</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><code>K♠ J♠</code></TableCell>
                            <TableCell>BTN</TableCell>
                            <TableCell>12bb</TableCell>
                            <TableCell>Push</TableCell>
                            <TableCell><Badge variant="default">✅ Sí</Badge></TableCell>
                            <TableCell><Badge variant="default">✅ Sí</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><code>A♣ T♦</code></TableCell>
                            <TableCell>CO</TableCell>
                            <TableCell>10bb</TableCell>
                            <TableCell>Push</TableCell>
                            <TableCell><Badge variant="destructive">❌ No</Badge></TableCell>
                            <TableCell><Badge variant="destructive">❌ No</Badge></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🔍 4. Errores Detectados (Leaks)</CardTitle>
                <CardDescription>Sé brutalmente honesto. Identifica tus fugas de dinero (leaks) para poder corregirlas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="p-4 bg-secondary/30 rounded-lg border">
                    <p className="font-semibold">Ejemplo 1:</p>
                    <p className="text-muted-foreground">Aposté fuerte con AJ en un board con Q, creyendo que tenía fold equity. El rival ya me ganaba desde el turn y pagó. Error de lectura de la fuerza del rival.</p>
                </div>
                 <div className="p-4 bg-secondary/30 rounded-lg border">
                    <p className="font-semibold">Ejemplo 2:</p>
                    <p className="text-muted-foreground">No leí el proyecto de escalera en un flop 2-4-5. Seguí apostando con mi overpair y el rival completó su escalera en el river. Error de evaluación de la textura del board.</p>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">💭 5. Estado Emocional (Mindset)</CardTitle>
                <CardDescription>El póker es un juego mental. Analiza cómo tus emociones influyeron en tus decisiones.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mano Clave</TableHead>
                            <TableHead>Emoción Sentida</TableHead>
                            <TableHead>¿Decisión Lógica o Emocional?</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><code>A♠ J♠</code></TableCell>
                            <TableCell>Frustración</TableCell>
                            <TableCell>Emocional (quería que foldeara, no analicé su rango de call).</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><code>3♣ 3♦</code></TableCell>
                            <TableCell>Duda / Inseguridad</TableCell>
                            <TableCell>Lógica (pago correcto por odds), pero con falta de confianza post-flop.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">📈 6. Reflexión Final del Torneo</CardTitle>
                <CardDescription>Destila las lecciones más importantes de la sesión para aplicarlas en el futuro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="font-semibold">¿Qué hice mejor que en torneos anteriores?</label>
                    <Textarea placeholder="Ej: Fui más disciplinado en early position, robé más desde el botón..." />
                </div>
                <div className="space-y-2">
                    <label className="font-semibold">¿Qué patrón de error se repitió?</label>
                    <Textarea placeholder="Ej: Volví a pagar de más con proyectos débiles fuera de posición..." />
                </div>
                <div className="space-y-2">
                    <label className="font-semibold">¿Qué ajustaré específicamente en el próximo torneo?</label>
                    <Textarea placeholder="Ej: Seré más consciente de los tamaños de stack para 3-betear, foldearé AJo a raises de UTG..." />
                </div>
                 <div className="space-y-2">
                    <label className="font-semibold">¿Cómo me sentí al terminar?</label>
                    <Textarea placeholder="Ej: Satisfecho con mis decisiones a pesar del resultado, frustrado por un mal beat, etc." />
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
