
'use client';

import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, PlusCircle, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Define types for our state
type DecisionRow = { id: number; hand: string; position: string; action: string; ev: boolean; result: string; };
type FoldEquityRow = { id: number; hand: string; position: string; stack: string; action: string; rivalFolded: boolean; };
type MindsetRow = { id: number; hand: string; emotion: string; logic: string; };
type GeneralData = { date: string; tournamentName: string; buyIn: string; playerCount: string; stage: string; stacks: string; };
type NotesData = { errors: string; improvements: string; plan: string; finalFeeling: string; };

const LOG_STORAGE_KEY = 'strategic-log-data';

export default function StrategicLogPage() {
  const { toast } = useToast();
  // State for all form data
  const [generalData, setGeneralData] = useState<GeneralData>({ date: '', tournamentName: '', buyIn: '', playerCount: '', stage: '', stacks: '' });
  const [decisions, setDecisions] = useState<DecisionRow[]>([]);
  const [foldEquitySpots, setFoldEquitySpots] = useState<FoldEquityRow[]>([]);
  const [mindset, setMindset] = useState<MindsetRow[]>([]);
  const [notes, setNotes] = useState<NotesData>({ errors: '', improvements: '', plan: '', finalFeeling: '' });

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem(LOG_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setGeneralData(parsedData.generalData || { date: '', tournamentName: '', buyIn: '', playerCount: '', stage: '', stacks: '' });
        setDecisions(parsedData.decisions || []);
        setFoldEquitySpots(parsedData.foldEquitySpots || []);
        setMindset(parsedData.mindset || []);
        setNotes(parsedData.notes || { errors: '', improvements: '', plan: '', finalFeeling: '' });
      }
    } catch (error) {
      console.error("Failed to load strategic log from localStorage", error);
    }
  }, []);

  const handleSave = () => {
    const dataToSave = { generalData, decisions, foldEquitySpots, mindset, notes };
    try {
      window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(dataToSave));
      toast({
        title: "Registro Guardado",
        description: "Tu sesión de análisis ha sido guardada en tu navegador.",
      });
    } catch (error) {
      console.error("Failed to save strategic log to localStorage", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo guardar el registro en el almacenamiento local.",
      });
    }
  };


  // Generic handler for top-level inputs
  const handleGeneralDataChange = (field: keyof GeneralData, value: string) => {
    setGeneralData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNotesChange = (field: keyof NotesData, value: string) => {
      setNotes(prev => ({ ...prev, [field]: value}));
  }

  // Generic handler to update a row in any table
  const handleRowChange = <T extends { id: number }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: number,
    field: keyof T,
    value: any
  ) => {
    setter(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };


  // Handlers for Decisions Table
  const addDecision = () => setDecisions(prev => [...prev, { id: Date.now(), hand: '', position: '', action: '', ev: true, result: '' }]);
  const removeDecision = (id: number) => setDecisions(prev => prev.filter(d => d.id !== id));

  // Handlers for Fold Equity Table
  const addFoldEquitySpot = () => setFoldEquitySpots(prev => [...prev, { id: Date.now(), hand: '', position: '', stack: '', action: '', rivalFolded: true }]);
  const removeFoldEquitySpot = (id: number) => setFoldEquitySpots(prev => prev.filter(spot => spot.id !== id));
  
  // Handlers for Mindset Table
  const addMindsetRow = () => setMindset(prev => [...prev, { id: Date.now(), hand: '', emotion: '', logic: '' }]);
  const removeMindsetRow = (id: number) => setMindset(prev => prev.filter(m => m.id !== id));

  const clearAll = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar todos los datos del registro? Esta acción no se puede deshacer.")) {
        setGeneralData({ date: '', tournamentName: '', buyIn: '', playerCount: '', stage: '', stacks: '' });
        setDecisions([]);
        setFoldEquitySpots([]);
        setMindset([]);
        setNotes({ errors: '', improvements: '', plan: '', finalFeeling: '' });
        try {
            window.localStorage.removeItem(LOG_STORAGE_KEY);
            toast({
                title: "Registro Borrado",
                description: "Se han limpiado todos los datos del formulario.",
            });
        } catch (error) {
            console.error("Failed to clear localStorage", error);
        }
    }
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
                    Tus datos se guardan en tu navegador cuando presionas &quot;Guardar&quot;.
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
                        <Input type="date" value={generalData.date} onChange={e => handleGeneralDataChange('date', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre/ID del Torneo</label>
                        <Input placeholder="Ej: Daily Freeroll" value={generalData.tournamentName} onChange={e => handleGeneralDataChange('tournamentName', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Buy-in</label>
                        <Input placeholder="Ej: 10 USDT" value={generalData.buyIn} onChange={e => handleGeneralDataChange('buyIn', e.target.value)} />
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nº de Jugadores</label>
                        <Input type="number" placeholder="Ej: 500" value={generalData.playerCount} onChange={e => handleGeneralDataChange('playerCount', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Etapa Alcanzada</label>
                        <Select value={generalData.stage} onValueChange={value => handleGeneralDataChange('stage', value)}>
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
                        <Input placeholder="Ej: 1000 / 0" value={generalData.stacks} onChange={e => handleGeneralDataChange('stacks', e.target.value)} />
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
                                <TableCell><Input placeholder="A♠Q♠" value={decision.hand} onChange={e => handleRowChange(setDecisions, decision.id, 'hand', e.target.value)} /></TableCell>
                                <TableCell><Input placeholder="CO" value={decision.position} onChange={e => handleRowChange(setDecisions, decision.id, 'position', e.target.value)} /></TableCell>
                                <TableCell><Input placeholder="Push" value={decision.action} onChange={e => handleRowChange(setDecisions, decision.id, 'action', e.target.value)} /></TableCell>
                                <TableCell>
                                    <Badge onClick={() => handleRowChange(setDecisions, decision.id, 'ev', !decision.ev)} variant={decision.ev ? "default" : "destructive"} className="cursor-pointer">
                                        {decision.ev ? '✅ Sí' : '❌ No'}
                                    </Badge>
                                </TableCell>
                                <TableCell><Input placeholder="Perdí vs KK" value={decision.result} onChange={e => handleRowChange(setDecisions, decision.id, 'result', e.target.value)} /></TableCell>
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
                                <TableCell><Input placeholder="K♠J♠" value={spot.hand} onChange={e => handleRowChange(setFoldEquitySpots, spot.id, 'hand', e.target.value)} /></TableCell>
                                <TableCell><Input placeholder="BTN" value={spot.position} onChange={e => handleRowChange(setFoldEquitySpots, spot.id, 'position', e.target.value)} /></TableCell>
                                <TableCell><Input type="number" placeholder="12" value={spot.stack} onChange={e => handleRowChange(setFoldEquitySpots, spot.id, 'stack', e.target.value)} /></TableCell>
                                <TableCell><Input placeholder="Push" value={spot.action} onChange={e => handleRowChange(setFoldEquitySpots, spot.id, 'action', e.target.value)} /></TableCell>
                                <TableCell>
                                    <Badge onClick={() => handleRowChange(setFoldEquitySpots, spot.id, 'rivalFolded', !spot.rivalFolded)} variant={spot.rivalFolded ? "default" : "destructive"} className="cursor-pointer">
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
                 <Textarea 
                    placeholder="Ejemplo: Aposté fuerte con AJ en un board con Q, creyendo que tenía fold equity. El rival ya me ganaba desde el turn y pagó. Error de lectura de la fuerza del rival." 
                    value={notes.errors}
                    onChange={e => handleNotesChange('errors', e.target.value)}
                 />
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
                                <TableCell><Input placeholder="A♠J♠" value={m.hand} onChange={e => handleRowChange(setMindset, m.id, 'hand', e.target.value)} /></TableCell>
                                <TableCell><Input placeholder="Frustración" value={m.emotion} onChange={e => handleRowChange(setMindset, m.id, 'emotion', e.target.value)} /></TableCell>
                                <TableCell><Input placeholder="Emocional (quería que foldeara)" value={m.logic} onChange={e => handleRowChange(setMindset, m.id, 'logic', e.target.value)} /></TableCell>
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
                    <Textarea 
                        placeholder="Ej: Fui más disciplinado en early position, robé más desde el botón..." 
                        value={notes.improvements}
                        onChange={e => handleNotesChange('improvements', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="font-semibold text-sm">¿Qué patrón de error se repitió?</label>
                    <Textarea 
                        placeholder="Ej: Volví a pagar de más con proyectos débiles fuera de posición..." 
                        value={notes.errors}
                        onChange={e => handleNotesChange('errors', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="font-semibold text-sm">¿Qué ajustaré específicamente en el próximo torneo? (Plan de acción)</label>
                    <Textarea 
                        placeholder="Ej: Seré más consciente de los tamaños de stack para 3-betear, foldearé AJo a raises de UTG..." 
                        value={notes.plan}
                        onChange={e => handleNotesChange('plan', e.target.value)}
                    />
                </div>
                 <div className="space-y-2">
                    <label className="font-semibold text-sm">¿Cómo me sentí al terminar?</label>
                    <Textarea 
                        placeholder="Ej: Satisfecho con mis decisiones a pesar del resultado, frustrado por un mal beat, etc." 
                        value={notes.finalFeeling}
                        onChange={e => handleNotesChange('finalFeeling', e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Registro
                    </Button>
                    <Button onClick={clearAll} variant="destructive" className="flex-1">
                         <Trash2 className="mr-2 h-4 w-4" />
                        Borrar Todo
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
