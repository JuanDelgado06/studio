'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

const positions: { id: Position; name: string; fullName: string; gridArea: string, description: string }[] = [
  { id: 'UTG', name: 'UTG', fullName: 'Under the Gun', gridArea: 'utg', description: 'Primeras posiciones en hablar.' },
  { id: 'MP', name: 'MP', fullName: 'Middle Position', gridArea: 'mp', description: 'Posiciones intermedias.' },
  { id: 'CO', name: 'CO', fullName: 'Cutoff', gridArea: 'co', description: 'Justo antes del botón.' },
  { id: 'BTN', name: 'BTN', fullName: 'Button', gridArea: 'btn', description: 'La mejor posición, actúa último.' },
  { id: 'SB', name: 'SB', fullName: 'Small Blind', gridArea: 'sb', description: 'Ciega pequeña, apuesta obligatoria.' },
  { id: 'BB', name: 'BB', fullName: 'Big Blind', gridArea: 'bb', description: 'Ciega grande, apuesta obligatoria.' },
];

const PositionSeat: React.FC<{ position: typeof positions[0] }> = ({ position }) => (
    <TooltipProvider delayDuration={100}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div 
                    style={{ gridArea: position.gridArea }}
                    className="group relative flex flex-col items-center justify-center transition-transform duration-300 hover:scale-110 z-10"
                >
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-card bg-secondary shadow-md group-hover:border-primary">
                        <span className="text-sm font-bold text-secondary-foreground group-hover:text-primary">{position.name}</span>
                        {position.id === 'BTN' && (
                            <div className="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow-sm">
                            D
                            </div>
                        )}
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className="font-bold">{position.fullName}</p>
                <p className="text-sm text-muted-foreground">{position.description}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export const PokerTable: React.FC = () => {
  return (
    <div className="relative flex h-[280px] w-full max-w-lg items-center justify-center">
        {/* Table Felt */}
        <div className="absolute inset-x-0 top-1/2 h-1/2 -translate-y-1/2 rounded-[50%] bg-background " />
        <div className="absolute inset-0 rounded-[50%] border-4 border-card shadow-inner" />
        <div className="absolute inset-2 rounded-[50%] border-2 border-primary/50" />
      
        {/* Grid for positioning seats */}
        <div 
            className="grid h-full w-full"
            style={{
                gridTemplateAreas: `
                    ". . utg utg . ."
                    "mp . . . . co"
                    "mp . . . . co"
                    "sb btn btn bb"
                `,
                gridTemplateRows: '1fr 1fr 1fr 1fr',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
            }}
        >
            {positions.map(pos => <PositionSeat key={pos.id} position={pos} />)}
        </div>
    </div>
  );
};
