
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
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define types for our state
type DecisionRow = { id: number; hand: string; position: string; action: string; ev: boolean; result: string; };
type FoldEquityRow = { id: number; hand: string; position: string; stack: string; action: string; rivalFolded: boolean; };
type MindsetRow = { id: number; hand: string; emotion: string; logic: string; };

let decisionId = 0;
let foldEquityId = 0;
let mindsetId = 0;

export default function StrategicLogPage() {
  const [decisions, setDecisions] = useState<DecisionRow[]>([]);
  const [foldEquitySpots, setFoldEquitySpots] = useState<FoldEquityRow[]>([]);
  const [mindset, setMindset] = useState<MindsetRow[]>([]);
  
  // Handlers for Decisions Table
  const addDecision = () => {
    setDecisions([...decisions, { id: decisionId++, hand: '', position: '', action: '', ev: true, result: '' }]);
  };
  const removeDecision = (id: number) => {
    setDecisions(decisions.filter(d => d.id !== id));
  };
  const toggleDecisionEv = (id: number) => {
    setDecisions(decisions.map(d => d.id === id ? { ...d, ev: !d.ev } : d));
  };

  // Handlers for Fold Equity Table
  const addFoldEquitySpot = () => {
    setFoldEquitySpots([...foldEquitySpots, { id: foldEquityId++, hand: '', position: '', stack: '', action: '', rivalFolded: true }]);
  };
  const removeFoldEquitySpot = (id: number) => {
    setFoldEquitySpots(foldEquitySpots.filter(spot => spot.id !== id));
  };
  const toggleFoldEquityRivalFolded = (id: number) => {
    setFoldEquitySpots(foldEquitySpots.map(spot => spot.id === id ? { ...spot, rivalFolded: !spot.rivalFolded } : spot));
  };

  // Handlers for Mindset Table
  const addMindsetRow = () => {
      setMindset([...mindset, {id: mindsetId++, hand: '', emotion: '', logic: ''}]);
  }
  const removeMindsetRow = (id: number) => {
      setMindset(mindset.filter(m => m.id !== id));
  }

  const clearAll = () => {
      setDecisions([]);
      setFoldEquitySpots([]);
      setMindset([]);
      // Consider clearing textareas and inputs too if needed
  }

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
                    📓 Registro Estratégico Interactivo – Torneos
                </h1>
                <p className="text-muted-foreground">
                    Utiliza esta herramienta para analizar tu juego, detectar patrones y acelerar tu mejora.
                </p>
            </div>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧩 1. Datos Generales del Torneo</CardTitle>
                <CardDescription>Información clave para contextualizar tu sesión de juego.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Fecha</label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre/ID del Torneo</label>
                        <Input placeholder="Ej: Daily Freeroll" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Buy-in</label>
                        <Input placeholder="Ej: 10 USDT" />
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nº de Jugadores</label>
                        <Input type="number" placeholder="Ej: 500" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Etapa Alcanzada</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona etapa..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="early">Early</SelectItem>
                                <SelectItem value="mid">Mid</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                                <SelectItem value="itm">ITM</SelectItem>
                                <SelectItem value="ft">Final Table (FT)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-medium">Stack Inicial / Final</label>
                        <Input placeholder="Ej: 1000 / 0" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🧠 2. Decisiones Clave Tomadas</CardTitle>
                <CardDescription>Analiza jugadas importantes, correctas o incorrectas, para reforzar tu disciplina y detectar errores.</CardDescription>
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
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {decisions.map(decision => (
                             <TableRow key={decision.id}>
                                <TableCell><Input placeholder="A♠Q♠" /></TableCell>
                                <TableCell><Input placeholder="CO" /></TableCell>
                                <TableCell><Input placeholder="Push" /></TableCell>
                                <TableCell>
                                    <Badge onClick={() => toggleDecisionEv(decision.id)} variant={decision.ev ? "default" : "destructive"} className="cursor-pointer">
                                        {decision.ev ? '✅ Sí' : '❌ No'}
                                    </Badge>
                                </TableCell>
                                <TableCell><Input placeholder="Perdí vs KK" /></TableCell>
                                <TableCell className="text-right">
                                    <Button onClick={() => removeDecision(decision.id)} variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button onClick={addDecision} variant="outline" className="mt-4 w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Decisión
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🎯 3. Spots de Fold Equity</CardTitle>
                <CardDescription>Evalúa la efectividad de tus faroles y semi-faroles.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mano</TableHead>
                            <TableHead>Posición</TableHead>
                            <TableHead>Stack (BB)</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>¿Rival foldeó?</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {foldEquitySpots.map(spot => (
                            <TableRow key={spot.id}>
                                <TableCell><Input placeholder="K♠J♠" /></TableCell>
                                <TableCell><Input placeholder="BTN" /></TableCell>
                                <TableCell><Input type="number" placeholder="12" /></TableCell>
                                <TableCell><Input placeholder="Push" /></TableCell>
                                <TableCell>
                                    <Badge onClick={() => toggleFoldEquityRivalFolded(spot.id)} variant={spot.rivalFolded ? "default" : "destructive"} className="cursor-pointer">
                                        {spot.rivalFolded ? '✅ Sí' : '❌ No'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button onClick={() => removeFoldEquitySpot(spot.id)} variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <Button onClick={addFoldEquitySpot} variant="outline" className="mt-4 w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Spot
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">🔍 4. Errores Detectados y Leaks</CardTitle>
                <CardDescription>Sé brutalmente honesto. Identifica tus fugas de dinero (leaks) para poder corregirlas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Textarea placeholder="Ejemplo: Aposté fuerte con AJ en un board con Q, creyendo que tenía fold equity. El rival ya me ganaba desde el turn y pagó. Error de lectura de la fuerza del rival." />
                 <Textarea placeholder="Ejemplo: No leí el proyecto de escalera en un flop 2-4-5. Seguí apostando con mi overpair y el rival completó su escalera en el river. Error de evaluación de la textura del board." />
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
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mindset.map(m => (
                            <TableRow key={m.id}>
                                <TableCell><Input placeholder="A♠J♠" /></TableCell>
                                <TableCell><Input placeholder="Frustración" /></TableCell>
                                <TableCell><Input placeholder="Emocional (quería que foldeara)" /></TableCell>
                                <TableCell className="text-right">
                                    <Button onClick={() => removeMindsetRow(m.id)} variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <Button onClick={addMindsetRow} variant="outline" className="mt-4 w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Registro Emocional
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">📈 6. Reflexión Final y Plan de Acción</CardTitle>
                <CardDescription>Destila las lecciones más importantes de la sesión para aplicarlas en el futuro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="font-semibold text-sm">¿Qué hice mejor que en torneos anteriores?</label>
                    <Textarea placeholder="Ej: Fui más disciplinado en early position, robé más desde el botón..." />
                </div>
                <div className="space-y-2">
                    <label className="font-semibold text-sm">¿Qué patrón de error se repitió?</label>
                    <Textarea placeholder="Ej: Volví a pagar de más con proyectos débiles fuera de posición..." />
                </div>
                <div className="space-y-2">
                    <label className="font-semibold text-sm">¿Qué ajustaré específicamente en el próximo torneo? (Plan de acción)</label>
                    <Textarea placeholder="Ej: Seré más consciente de los tamaños de stack para 3-betear, foldearé AJo a raises de UTG..." />
                </div>
                 <div className="space-y-2">
                    <label className="font-semibold text-sm">¿Cómo me sentí al terminar?</label>
                    <Textarea placeholder="Ej: Satisfecho con mis decisiones a pesar del resultado, frustrado por un mal beat, etc." />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button className="flex-1">Guardar Registro</Button>
                    <Button onClick={clearAll} variant="destructive" className="flex-1">Borrar Todo</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
