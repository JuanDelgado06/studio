
'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import * as React from 'react';

type AccuracyData = {
  position: string;
  accuracy: number;
};

interface AccuracyChartProps {
  data: AccuracyData[];
}

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

export function AccuracyChart({ data }: AccuracyChartProps) {
    const chartData = data.map(item => ({
        ...item,
        fill: `var(--color-${item.position.toLowerCase()})`
    }));

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="position" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis hide={true} domain={[0, 100]} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="accuracy" radius={8}>
                        <LabelList position="top" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => value > 0 ? `${value}%` : ''} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
