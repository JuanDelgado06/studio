'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

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

export function AccuracyChart() {
    return (
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
    )
}
