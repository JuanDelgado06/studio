import { BarChart3, CheckCircle, Target, TrendingUp, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const accuracyByPositionData = [
  { position: 'SB', accuracy: 85, fill: 'var(--color-sb)' },
  { position: 'BB', accuracy: 78, fill: 'var(--color-bb)' },
  { position: 'UTG', accuracy: 95, fill: 'var(--color-utg)' },
  { position: 'MP', accuracy: 91, fill: 'var(--color-mp)' },
  { position: 'CO', accuracy: 88, fill: 'var(--color-co)' },
  { position: 'BTN', accuracy: 92, fill: 'var(--color-btn)' },
];

const chartConfig = {
  accuracy: {
    label: 'Precisión',
  },
  sb: { label: 'Small Blind', color: 'hsl(var(--chart-1))' },
  bb: { label: 'Big Blind', color: 'hsl(var(--chart-2))' },
  utg: { label: 'UTG', color: 'hsl(var(--chart-3))' },
  mp: { label: 'MP', color: 'hsl(var(--chart-4))' },
  co: { label: 'CO', color: 'hsl(var(--chart-5))' },
  btn: { label: 'Button', color: 'hsl(var(--chart-1))' }, // Reusing color
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Manos Jugadas</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,254</div>
          <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Precisión General</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">88.5%</div>
          <p className="text-xs text-muted-foreground">+2.5% desde la semana pasada</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Decisiones Correctas</CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,109</div>
          <p className="text-xs text-muted-foreground">Total de aciertos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Errores Comunes</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">145</div>
          <p className="text-xs text-muted-foreground">Fold incorrecto en SB</p>
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
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={accuracyByPositionData} margin={{ top: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="position" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis hide={true} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="accuracy" radius={8}>
                        <LabelList position="top" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `${value}%`} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
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
                <span className="text-5xl">🔥</span>
                <p className="text-2xl font-bold font-headline">Racha de 5 días</p>
                <p className="text-sm text-muted-foreground">Completaste tu práctica diaria.</p>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold">Meta Semanal: Mejorar en SB</p>
                    <p className="text-sm font-bold text-primary">75%</p>
                </div>
                <Progress value={75} />
                <p className="text-xs text-muted-foreground">Objetivo: 90% de precisión en Small Blind.</p>
            </div>
             <div className="space-y-2">
                <p className="font-semibold">Áreas de Enfoque Sugeridas por IA</p>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">3-bet vs CO</Badge>
                    <Badge variant="secondary">Defensa de BB vs BTN</Badge>
                    <Badge variant="secondary">Folds con Pares Bajos</Badge>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
