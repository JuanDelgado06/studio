import type { Position, TableType, PreviousAction } from "./types";

export const POSITIONS: Position[] = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];
export const TABLE_TYPES: TableType[] = ['cash', 'tournament'];
export const STACK_SIZES = [10, 20, 30, 40, 50, 60, 80, 100];
export const PREVIOUS_ACTIONS: PreviousAction[] = ['none', 'raise', '3-bet', '4-bet'];

export const POSITION_NAMES: Record<Position, string> = {
    'UTG': 'primera posición',
    'MP': 'posición media',
    'CO': 'Cutoff',
    'BTN': 'Botón',
    'SB': 'Ciega Pequeña',
    'BB': 'Ciega Grande',
};
