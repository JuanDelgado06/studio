
'use client';

import * as React from 'react';
import { BarChart3, CheckCircle, Lightbulb, Loader2, Target, Trash2, TrendingUp, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AccuracyChart } from '@/components/poker/accuracy-chart';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useStats } from '@/context/stats-context';

export default function DashboardPage() {
  const { toast } = useToast();
  const { stats, resetStats, isClient, getAIFocusAreas } = useStats();
  const [isLoadingFocus, setIsLoadingFocus] = React.useState(false);

  const handleReset = () => {
    resetStats();
    toast({
      title: 'Estadísticas Reiniciadas',
      description: 'Tus estadísticas de práctica han sido borradas.',
    });
  };

  const handleGenerateFocusAreas = async () => {
    setIsLoadingFocus(true);
    const success = await getAIFocusAreas();
    if (!success) {
        toast({
            variant: 'destructive',
            title: 'Error de la IA',
            description: 'No se pudieron generar las áreas de enfoque. Inténtalo de nuevo.'
        });
    }
    setIsLoadingFocus(false);
  }

  const handleClearFocusAreas = () => {
    // This function will need to be added to the context to clear focus areas
    // For now, let's assume it's there. We'll add it in the context file.
    // clearFocusAreas(); 
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Manos Jugadas</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.handsPlayed}</div>
          <p className="text-xs text-muted-foreground">Sesión actual</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Precisión General</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.overallAccuracy === 'N/A' ? 'N/A' : `${stats.overallAccuracy}%`}</div>
          <p className="text-xs text-muted-foreground">{stats.overallAccuracy === 'N/A' ? 'Aún no hay datos' : 'Desde el reinicio'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Decisiones Correctas</CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.correctDecisions}</div>
          <p className="text-xs text-muted-foreground">Total de aciertos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Errores Comunes</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.commonErrors}</div>
          <p className="text-xs text-muted-foreground">{stats.commonErrors > 0 ? 'Desde el reinicio' : 'Aún no hay datos'}</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Precisión por Posición</CardTitle>
          <CardDescription>
            Cómo rindes en cada posición de la mesa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isClient ? <AccuracyChart data={stats.accuracyByPosition} /> : <div className="h-[250px] w-full flex items-center justify-center"><p>Cargando gráfico...</p></div>}
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Target className="h-6 w-6"/>
                Objetivos y Rachas
            </CardTitle>
            <CardDescription>¡Sigue así para alcanzar tus metas!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-center">
                <span className="text-5xl">{stats.streak > 0 ? '🎉' : '🤔'}</span>
                <p className="text-2xl font-bold font-headline">Racha de {stats.streak} días</p>
                <p className="text-sm text-muted-foreground">{stats.streak > 0 ? `¡Sigue así!` : '¡Completa tu primera práctica!'}</p>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold">Meta Semanal</p>
                    <p className="text-sm font-bold text-primary">{stats.weeklyGoal}%</p>
                </div>
                <Progress value={stats.weeklyGoal} />
                <p className="text-xs text-muted-foreground">Completa prácticas para progresar.</p>
            </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-400"/>
                Análisis del Coach de IA
            </CardTitle>
            <CardDescription>Obtén consejos personalizados basados en tu rendimiento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {isLoadingFocus ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center min-h-[150px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                        Analizando tu historial y generando sugerencias...
                    </p>
                </div>
            ) : stats.focusAreas.length > 0 ? (
                <div className="space-y-2">
                    <p className="font-semibold">Áreas de Enfoque Sugeridas</p>
                    <div className="flex flex-wrap gap-2">
                        {stats.focusAreas.map((area, i) => <Badge key={i} variant="secondary">{area}</Badge>)}
                    </div>
                </div>
            ) : (
                 <div className="text-center text-muted-foreground p-4">
                    <p>Juega algunas manos y luego pide un análisis a la IA para ver tus áreas de mejora.</p>
                </div>
            )}
            
            <Button onClick={handleGenerateFocusAreas} disabled={isLoadingFocus || stats.handsPlayed < 5}>
                {isLoadingFocus ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lightbulb className="mr-2 h-4 w-4"/>}
                {stats.focusAreas.length > 0 ? 'Volver a generar' : 'Generar Sugerencias'}
            </Button>
            {stats.handsPlayed < 5 && (
                <p className="text-xs text-center text-muted-foreground">
                Juega al menos 5 manos para poder generar sugerencias.
                </p>
            )}
        </CardContent>
      </Card>


      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="font-headline text-destructive">
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones que no se pueden deshacer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reiniciar Estadísticas</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estás absolutamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se borrarán
                  permanentemente todas tus estadísticas de práctica y tu
                  progreso.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Sí, reiniciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
