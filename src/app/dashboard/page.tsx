
'use client';

import { useState } from 'react';
import { BarChart3, CheckCircle, Target, TrendingUp, XCircle } from 'lucide-react';
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

const initialStats = {
  handsPlayed: 0,
  overallAccuracy: 'N/A' as number | 'N/A',
  correctDecisions: 0,
  commonErrors: 0,
  streak: 0,
  weeklyGoal: 0,
  focusAreas: [],
  accuracyByPosition: [
    { position: 'SB', accuracy: 0 },
    { position: 'BB', accuracy: 0 },
    { position: 'UTG', accuracy: 0 },
    { position: 'MP', accuracy: 0 },
    { position: 'CO', accuracy: 0 },
    { position: 'BTN', accuracy: 0 },
  ],
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState(initialStats);
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleReset = () => {
    setStats(initialStats);
    toast({
      title: 'Estadísticas Reiniciadas',
      description: 'Tus estadísticas de práctica han sido borradas.',
    });
  };

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
             <div className="space-y-2">
                <p className="font-semibold">Áreas de Enfoque Sugeridas por IA</p>
                <div className="flex flex-wrap gap-2">
                    {stats.focusAreas.length > 0 ? (
                        stats.focusAreas.map((area, i) => <Badge key={i} variant="secondary">{area}</Badge>)
                    ) : (
                        <Badge variant="secondary">Juega para recibir sugerencias</Badge>
                    )}
                </div>
            </div>
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
