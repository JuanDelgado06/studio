export type Position = 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | 'BTN';
export type TableType = 'cash' | 'tournament';
export type Action = 'fold' | 'call' | 'raise' | '3-bet' | 'all-in';
export type PreviousAction = 'none' | 'raise' | '3-bet' | '4-bet';
export type Hand = {
    card1: string;
    card2: string;
}
export type HandRange = Record<string, Action>;

    