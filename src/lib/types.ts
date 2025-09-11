export type Position = 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | 'BTN';
export type TableType = 'cash' | 'tournament';
export type Action = 'fold' | 'call' | 'raise';
export type Hand = {
    card1: string;
    card2: string;
}
