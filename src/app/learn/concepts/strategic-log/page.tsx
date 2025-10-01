
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
import { ArrowLeft, PlusCircle, Trash2, Save, FilePlus, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const POSITIONS = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];
const ACTIONS = ['Fold', 'Call', 'Raise', '3-Bet', '4-Bet', 'All-in', 'Check', 'Bet', 'Push'];
const STAGES = ['Early', 'Mid', 'Late', 'ITM', 'Final Table (FT)'];
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

type DecisionRow = { id: number; hand: string; position: string; action: string; ev: boolean; result: string; };
type FoldEquityRow = { id: number; hand: string; position: string; stack: string; action: string; rivalFolded: boolean; };
type MindsetRow = { id: number; hand: string; emotion: string; logic: string; };

type LogEntry = {
    id: number;
    generalData: { date: string; tournamentName: string; buyIn: string; playerCount: string; stage: string; stacks: string; };
    decisions: DecisionRow[];
    foldEquitySpots: FoldEquityRow[];
    mindset: MindsetRow[];
    notes: { errors: string; improvements: string; plan: string; finalFeeling: string; };
};

const LOGS_STORAGE_KEY = 'strategic-log-entries';

const createNewLogEntry = (): LogEntry => ({
    id: Date.now(),
    generalData: { date: '', tournamentName: '', buyIn: '', playerCount: '', stage: '', stacks: '' },
    decisions: [],
    foldEquitySpots: [],
    mindset: [],
    notes: { errors: '', improvements: '', plan: '', finalFeeling: '' },
});

const HandSelector: React.FC<{ selectedHand: string; onSelect: (hand: string) => void }> = ({ selectedHand, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[100px] justify-start font-mono">
                    {selectedHand || <span className="text-muted-foreground">Mano...</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-13 gap-0.5 sm:gap-1 font-mono text-xs">
                    {RANKS.map((rowRank, i) =>
                        RANKS.map((colRank, j) => {
                            let hand: string;
                            let handType: 'pair' | 'suited' | 'offsuit';

                            if (i < j) {
                                hand = `${rowRank}${colRank}s`; // Suited
                                handType = 'suited';
                            } else if (i > j) {
                                hand = `${colRank}${rowRank}o`; // Offsuit
                                handType = 'offsuit';
                            } else {
                                hand = `${rowRank}${colRank}`; // Pair
                                handType = 'pair';
                            }
                            
                            const isSelected = hand === selectedHand;

                            return (
                                <button
                                    key={hand}
                                    onClick={() => {
                                        onSelect(hand);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-sm border text-center font-bold transition-colors',
                                        handType === 'pair' && 'bg-primary/10 border-primary/30',
                                        handType === 'suited' && 'bg-sky-500/10 border-sky-500/30',
                                        handType === 'offsuit' && 'bg-zinc-500/10 border-zinc-500/30',
                                        isSelected && 'ring-2 ring-accent bg-accent text-accent-foreground',
                                        'hover:bg-accent hover:text-accent-foreground'
                                    )}
                                    title={hand}
                                >
                                    {hand.slice(0, 2)}
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};


export default function StrategicLogPage() {
  const { toast } = useToast();
  
  const [savedLogs, setSavedLogs] = useState<LogEntry[]>([]);
  const [currentLog, setCurrentLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const savedData = window.localStorage.getItem(LOGS_STORAGE_KEY);
      if (savedData) {
        setSavedLogs(JSON.parse(savedData));
      }
      const newEntry = createNewLogEntry();
       // Set date on client side to avoid hydration mismatch
      newEntry.generalData.date = new Date().toISOString().split('T')[0];
      setCurrentLog(newEntry);
    } catch (error) {
      console.error("Failed to load strategic logs from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const handleUpdateCurrentLog = (updateFn: (draft: LogEntry) => void) => {
      setCurrentLog(prev => {
          if (!prev) return null;
          const newLog = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid state mutation issues
          updateFn(newLog);
          return newLog;
      });
  };
  
  const handleSave = () => {
    if (!currentLog || !currentLog.generalData.tournamentName.trim()) {
        toast({
            variant: "destructive",
            title: "Faltan Datos",
            description: "Por favor, añade al menos un nombre al torneo para guardarlo.",
        });
        return;
    };
    
    setSavedLogs(prevLogs => {
        const existingLogIndex = prevLogs.findIndex(log => log.id === currentLog.id);
        let updatedLogs;
        if (existingLogIndex > -1) {
            // Update existing log
            updatedLogs = [...prevLogs];
            updatedLogs[existingLogIndex] = currentLog;
        } else {
            // Add new log
            updatedLogs = [...prevLogs, currentLog];
        }
        
        try {
            window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
            toast({
                title: "Registro Guardado",
                description: "Tu sesión de análisis ha sido guardada.",
            });
        } catch (error) {
            console.error("Failed to save logs to localStorage", error);
            toast({
                variant: "destructive",
                title: "Error al Guardar",
                description: "No se pudo guardar el registro.",
            });
        }
        return updatedLogs;
    });
  };

  const handleNewLog = () => {
      const newEntry = createNewLogEntry();
      newEntry.generalData.date = new Date().toISOString().split('T')[0];
      setCurrentLog(newEntry);
      toast({
          title: "Nuevo Registro",
          description: "Formulario limpiado para una nueva entrada."
      })
  }

  const handleLoadLog = (logId: number) => {
      const logToLoad = savedLogs.find(log => log.id === logId);
      if (logToLoad) {
          setCurrentLog(logToLoad);
          toast({
              title: "Registro Cargado",
              description: `Has cargado el registro del torneo "${logToLoad.generalData.tournamentName || 'Sin Nombre'}".`
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  }

  const handleDeleteLog = (logId: number) => {
      if (window.confirm("¿Estás seguro de que quieres borrar este registro permanentemente?")) {
        setSavedLogs(prevLogs => {
            const updatedLogs = prevLogs.filter(log => log.id !== logId);
            try {
                window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
                toast({
                    title: "Registro Eliminado",
                });
                if (currentLog?.id === logId) {
                    handleNewLog();
                }
            } catch (error) {
                 console.error("Failed to update logs in localStorage after deletion", error);
            }
            return updatedLogs;
        });
      }
  }

  if (isLoading || !currentLog) {
      return <div className="flex justify-center items-center h-96"><Loader2 className="h-16 w-16 animate-spin"/></div>
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
                    Crea y guarda tus análisis de sesión. Tus datos se guardan en tu navegador.
                </p>
            </div>
        </div>

        <Card className="border-primary/50 border-2">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-2xl">📝 Editor de Registro</CardTitle>
                        <CardDescription>Usa este formulario para crear un nuevo registro o editar uno cargado.</CardDescription>
                    </div>
                     <Button onClick={handleNewLog}>
                        <FilePlus className="mr-2 h-4 w-4"/>
                        Nuevo Registro
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* General Data Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">🧩 1. Datos Generales del Torneo</CardTitle>
                        <CardDescription>Registra los datos básicos para contextualizar y encontrar tus sesiones de juego fácilmente.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Fecha</label>
                            <Input type="date" value={currentLog.generalData.date} onChange={e => handleUpdateCurrentLog(draft => { draft.generalData.date = e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Nombre/ID del Torneo</label>
                            <Input placeholder="Ej: Daily Freeroll" value={currentLog.generalData.tournamentName} onChange={e => handleUpdateCurrentLog(draft => { draft.generalData.tournamentName = e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Buy-in</label>
                            <Input placeholder="Ej: 10 USDT" value={currentLog.generalData.buyIn} onChange={e => handleUpdateCurrentLog(draft => { draft.generalData.buyIn = e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Nº de Jugadores</label>
                            <Input type="number" placeholder="Ej: 500" value={currentLog.generalData.playerCount} onChange={e => handleUpdateCurrentLog(draft => { draft.generalData.playerCount = e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Etapa Alcanzada</label>
                            <Select value={currentLog.generalData.stage} onValueChange={value => handleUpdateCurrentLog(draft => { draft.generalData.stage = value })}>
                                <SelectTrigger><SelectValue placeholder="Selecciona etapa..." /></SelectTrigger>
                                <SelectContent>
                                    {STAGES.map(stage => <SelectItem key={stage} value={stage.toLowerCase().split(' ')[0]}>{stage}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Stack Inicial / Final</label>
                            <Input placeholder="Ej: 1000 / 0" value={currentLog.generalData.stacks} onChange={e => handleUpdateCurrentLog(draft => { draft.generalData.stacks = e.target.value })} />
                        </div>
                    </CardContent>
                </Card>
                
                 {/* Decisions Table */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">🧠 2. Decisiones Clave Tomadas</CardTitle>
                        <CardDescription>Anota las manos más importantes o dudosas, sin importar el resultado. El objetivo es analizar la calidad de la decisión.</CardDescription>
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
                                {currentLog.decisions.map((decision, index) => (
                                    <TableRow key={decision.id}>
                                        <TableCell>
                                            <HandSelector selectedHand={decision.hand} onSelect={hand => handleUpdateCurrentLog(draft => { draft.decisions[index].hand = hand })} />
                                        </TableCell>
                                        <TableCell>
                                            <Select value={decision.position} onValueChange={value => handleUpdateCurrentLog(draft => { draft.decisions[index].position = value })}>
                                                <SelectTrigger><SelectValue placeholder="Pos..." /></SelectTrigger>
                                                <SelectContent>
                                                    {POSITIONS.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={decision.action} onValueChange={value => handleUpdateCurrentLog(draft => { draft.decisions[index].action = value })}>
                                                <SelectTrigger><SelectValue placeholder="Acción..." /></SelectTrigger>
                                                <SelectContent>
                                                    {ACTIONS.map(act => <SelectItem key={act} value={act}>{act}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge onClick={() => handleUpdateCurrentLog(draft => { draft.decisions[index].ev = !draft.decisions[index].ev })} variant={decision.ev ? "default" : "destructive"} className="cursor-pointer">
                                                {decision.ev ? '✅ Sí' : '❌ No'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell><Input placeholder="Perdí vs KK" value={decision.result} onChange={e => handleUpdateCurrentLog(draft => { draft.decisions[index].result = e.target.value })} /></TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => handleUpdateCurrentLog(draft => { draft.decisions = draft.decisions.filter(d => d.id !== decision.id) })} variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button onClick={() => handleUpdateCurrentLog(draft => { draft.decisions.push({ id: Date.now(), hand: '', position: '', action: '', ev: true, result: '' }) })} variant="outline" className="mt-4 w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Decisión
                        </Button>
                    </CardContent>
                </Card>

                 {/* Other Cards similarly */}
                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">🎯 3. Spots de Fold Equity</CardTitle>
                        <CardDescription>Analiza los momentos en que intentaste robar el bote con un 'push' o 'bluff'. ¿Funcionó? ¿Tu lectura del rival fue correcta?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Fold Equity Table */}
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
                                {currentLog.foldEquitySpots.map((spot, index) => (
                                    <TableRow key={spot.id}>
                                        <TableCell>
                                            <HandSelector selectedHand={spot.hand} onSelect={hand => handleUpdateCurrentLog(draft => { draft.foldEquitySpots[index].hand = hand })} />
                                        </TableCell>
                                        <TableCell>
                                            <Select value={spot.position} onValueChange={value => handleUpdateCurrentLog(draft => { draft.foldEquitySpots[index].position = value })}>
                                                <SelectTrigger><SelectValue placeholder="Pos..." /></SelectTrigger>
                                                <SelectContent>
                                                    {POSITIONS.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell><Input type="number" placeholder="12" value={spot.stack} onChange={e => handleUpdateCurrentLog(draft => { draft.foldEquitySpots[index].stack = e.target.value })} /></TableCell>
                                        <TableCell>
                                            <Select value={spot.action} onValueChange={value => handleUpdateCurrentLog(draft => { draft.foldEquitySpots[index].action = value })}>
                                                <SelectTrigger><SelectValue placeholder="Acción..." /></SelectTrigger>
                                                <SelectContent>
                                                    {ACTIONS.map(act => <SelectItem key={act} value={act}>{act}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge onClick={() => handleUpdateCurrentLog(draft => { draft.foldEquitySpots[index].rivalFolded = !draft.foldEquitySpots[index].rivalFolded })} variant={spot.rivalFolded ? "default" : "destructive"} className="cursor-pointer">
                                                {spot.rivalFolded ? '✅ Sí' : '❌ No'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => handleUpdateCurrentLog(draft => { draft.foldEquitySpots = draft.foldEquitySpots.filter(s => s.id !== spot.id)})} variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Button onClick={() => handleUpdateCurrentLog(draft => { draft.foldEquitySpots.push({ id: Date.now(), hand: '', position: '', stack: '', action: '', rivalFolded: true }) })} variant="outline" className="mt-4 w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Spot
                        </Button>
                    </CardContent>
                 </Card>

                 <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">💭 4. Estado Emocional (Mindset)</CardTitle>
                        <CardDescription>Sé honesto. Identificar si una decisión fue impulsada por la lógica o por la emoción (tilt, frustración, miedo) es clave para mejorar tu juego mental.</CardDescription>
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
                                {currentLog.mindset.map((m, index) => (
                                    <TableRow key={m.id}>
                                        <TableCell>
                                            <HandSelector selectedHand={m.hand} onSelect={hand => handleUpdateCurrentLog(draft => { draft.mindset[index].hand = hand })} />
                                        </TableCell>
                                        <TableCell><Input placeholder="Frustración" value={m.emotion} onChange={e => handleUpdateCurrentLog(draft => { draft.mindset[index].emotion = e.target.value })} /></TableCell>
                                        <TableCell><Input placeholder="Emocional (quería que foldeara)" value={m.logic} onChange={e => handleUpdateCurrentLog(draft => { draft.mindset[index].logic = e.target.value })} /></TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => handleUpdateCurrentLog(draft => { draft.mindset = draft.mindset.filter(mind => mind.id !== m.id) })} variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button onClick={() => handleUpdateCurrentLog(draft => { draft.mindset.push({ id: Date.now(), hand: '', emotion: '', logic: '' }) })} variant="outline" className="mt-4 w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Registro Emocional
                        </Button>
                    </CardContent>
                 </Card>

                {/* Notes and Final Reflection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">📈 5. Reflexión Final y Plan de Acción</CardTitle>
                        <CardDescription>Este es el paso más importante. Consolida tu aprendizaje, detecta patrones y crea un plan concreto para tu próxima sesión.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-semibold text-sm">¿Qué patrón de error se repitió o qué leak principal detectaste?</label>
                            <Textarea placeholder="Ej: Volví a pagar de más con proyectos débiles fuera de posición..." value={currentLog.notes.errors} onChange={e => handleUpdateCurrentLog(draft => { draft.notes.errors = e.target.value })}/>
                        </div>
                        <div className="space-y-2">
                            <label className="font-semibold text-sm">¿Qué hiciste mejor que en torneos anteriores?</label>
                            <Textarea placeholder="Ej: Fui más disciplinado en early position, robé más desde el botón..." value={currentLog.notes.improvements} onChange={e => handleUpdateCurrentLog(draft => { draft.notes.improvements = e.target.value })}/>
                        </div>
                        <div className="space-y-2">
                            <label className="font-semibold text-sm">¿Qué ajustarás específicamente en el próximo torneo? (Plan de acción)</label>
                            <Textarea placeholder="Ej: Seré más consciente de los tamaños de stack para 3-betear, foldearé AJo a raises de UTG..." value={currentLog.notes.plan} onChange={e => handleUpdateCurrentLog(draft => { draft.notes.plan = e.target.value })}/>
                        </div>
                        <div className="space-y-2">
                            <label className="font-semibold text-sm">¿Cómo me sentí al terminar?</label>
                            <Textarea placeholder="Ej: Satisfecho con mis decisiones a pesar del resultado, frustrado por un mal beat, etc." value={currentLog.notes.finalFeeling} onChange={e => handleUpdateCurrentLog(draft => { draft.notes.finalFeeling = e.target.value })}/>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button onClick={handleSave} className="flex-1">
                                <Save className="mr-2 h-4 w-4" />
                                {savedLogs.some(log => log.id === currentLog.id) ? 'Actualizar Registro' : 'Guardar Nuevo Registro'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>

        <Separator />

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">📚 Registros Guardados</CardTitle>
                <CardDescription>Aquí puedes ver, cargar o eliminar tus sesiones de análisis anteriores.</CardDescription>
            </CardHeader>
            <CardContent>
                {savedLogs.length > 0 ? (
                     <Accordion type="single" collapsible className="w-full">
                         {savedLogs.map(log => (
                            <AccordionItem value={`log-${log.id}`} key={log.id}>
                                <AccordionTrigger>
                                    <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center pr-4">
                                        <span className="font-semibold text-left">{log.generalData.tournamentName || "Registro Sin Título"}</span>
                                        <Badge variant="secondary" className="mt-1 sm:mt-0">{log.generalData.date}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-secondary/20 rounded-md">
                                    <div className="flex gap-2 mb-4">
                                         <Button onClick={() => handleLoadLog(log.id)}><BookOpen className="mr-2 h-4 w-4" /> Cargar para Editar</Button>
                                         <Button onClick={() => handleDeleteLog(log.id)} variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
                                    </div>
                                    <h4 className="font-bold mb-2">Detalles del Registro:</h4>
                                    <p className="text-sm text-muted-foreground"><strong>Etapa alcanzada:</strong> {log.generalData.stage}</p>
                                    <p className="text-sm text-muted-foreground"><strong>Plan de acción:</strong> {log.notes.plan || "N/A"}</p>
                                </AccordionContent>
                            </AccordionItem>
                         ))}
                    </Accordion>
                ) : (
                    <p className="text-muted-foreground text-center">No tienes ningún registro guardado. ¡Completa el formulario de arriba y guarda tu primera sesión!</p>
                )}
            </CardContent>
        </Card>

    </div>
  );
}

    

    