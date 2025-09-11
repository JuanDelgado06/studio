
import type { GetHandRangeOutput } from '@/ai/flows/get-hand-range';
import type { Action, HandRange } from './types';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const RANK_MAP = RANKS.reduce((acc, rank, index) => {
    acc[rank] = index;
    return acc;
}, {} as Record<string, number>);


function parseRange(rangeStr: string): string[] {
    const hands: string[] = [];

    // Case 1: Handle pairs (e.g., "77", "TT+", "JJ-88")
    if (rangeStr.length >= 2 && rangeStr[0] === rangeStr[1]) {
        const startRank = rangeStr.substring(0, 2);
        if (rangeStr.endsWith('+')) {
            const startIndex = RANK_MAP[startRank[0]];
            for (let i = 0; i <= startIndex; i++) {
                hands.push(RANKS[i] + RANKS[i]);
            }
        } else if (rangeStr.includes('-')) {
            const [start, end] = rangeStr.split('-');
            const startIndex = RANK_MAP[start[0]];
            const endIndex = RANK_MAP[end[0]];
            for (let i = startIndex; i <= endIndex; i++) {
                hands.push(RANKS[i] + RANKS[i]);
            }
        }
        else {
            hands.push(rangeStr);
        }
        return hands;
    }

    // Case 2: Suited/Offsuit hands (e.g., "AKs", "QJo", "ATs+", "KJo+", "T8s-T6s")
    if (rangeStr.length >= 3) {
        const type = rangeStr[2]; // 's' or 'o'
        const r1 = rangeStr[0];
        const r2 = rangeStr[1];
        
        if (rangeStr.endsWith('+')) {
            const highRank = r1;
            const lowRank = r2;
            const highRankIndex = RANK_MAP[highRank];
            const lowRankIndex = RANK_MAP[lowRank];

            for (let i = lowRankIndex; i > highRankIndex; i--) {
                hands.push(`${highRank}${RANKS[i]}${type}`);
            }
        } else if (rangeStr.includes('-')) {
            // e.g. T9s-T6s or A9s-A2s
             const [start, end] = rangeStr.split('-');
             const r1_start = start[0];
             const r2_start_index = RANK_MAP[start[1]];
             const r2_end_index = RANK_MAP[end[1]];

             for (let i = r2_start_index; i <= r2_end_index; i++) {
                 hands.push(`${r1_start}${RANKS[i]}${type}`);
             }

        } else {
            hands.push(rangeStr);
        }
        return hands;
    }
    
    // Fallback for single combos if not matched
    if(rangeStr.length >= 2) {
        hands.push(rangeStr);
    }
    
    return hands;
}


export function expandRange(summary: GetHandRangeOutput): HandRange {
  const handRange: HandRange = {};

  const allHands: {hand: string, type: 'pair' | 'suited' | 'offsuit'}[] = [];
  for (let i = 0; i < RANKS.length; i++) {
      for (let j = 0; j < RANKS.length; j++) {
          if (i === j) {
              allHands.push({hand: `${RANKS[i]}${RANKS[j]}`, type: 'pair'});
          } else if (i < j) {
              allHands.push({hand: `${RANKS[i]}${RANKS[j]}s`, type: 'suited'});
          } else {
              allHands.push({hand: `${RANKS[j]}${RANKS[i]}o`, type: 'offsuit'});
          }
      }
  }
  
  allHands.forEach(({hand}) => {
    handRange[hand] = 'fold';
  });

  function processAction(hands: string[], action: Action) {
    if (!hands) return;
    hands.forEach(rangeStr => {
      const parsed = parseRange(rangeStr);
      parsed.forEach(h => {
        handRange[h] = action;
      });
    });
  }

  processAction(summary.raise, 'raise');
  processAction(summary.call, 'call');
  
  return handRange;
}
