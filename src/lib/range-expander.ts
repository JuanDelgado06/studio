
import type { GetHandRangeOutput } from '@/ai/flows/get-hand-range';
import type { Action, HandRange } from './types';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function parseRange(rangeStr: string): string[] {
  const hands: string[] = [];
  const noPlus = rangeStr.replace('+', '');
  
  // Handle pairs like 88+ or 99
  if (noPlus.length === 2 && noPlus[0] === noPlus[1]) {
    const rankIndex = RANKS.indexOf(noPlus[0]);
    if (rangeStr.endsWith('+')) {
      for (let i = 0; i <= rankIndex; i++) {
        hands.push(`${RANKS[i]}${RANKS[i]}`);
      }
    } else {
        hands.push(noPlus);
    }
    return hands;
  }
  
  // Handle suited/offsuit like AQs+, KJo+, or a range like T9s-T6s
  if (noPlus.length >= 3) {
    if (rangeStr.includes('-')) {
        const [start, end] = rangeStr.split('-');
        const highRank = start[0];
        const suitOrOff = start[2];
        const startLowRankIndex = RANKS.indexOf(start[1]);
        const endLowRankIndex = RANKS.indexOf(end[1]);

        for(let i = startLowRankIndex; i <= endLowRankIndex; i++) {
            hands.push(`${highRank}${RANKS[i]}${suitOrOff}`);
        }

    } else if (rangeStr.endsWith('+')) {
      const highRank = noPlus[0];
      const lowRank = noPlus[1];
      const suitOrOff = noPlus[2];
      const highRankIndex = RANKS.indexOf(highRank);
      const lowRankIndex = RANKS.indexOf(lowRank);

      for (let i = lowRankIndex; i > highRankIndex; i--) {
        hands.push(`${highRank}${RANKS[i]}${suitOrOff}`);
      }
    } else {
         hands.push(rangeStr);
    }
     return hands;
  }

  // Handle single combos like AKs, QJo
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
  
  // Note: We don't need to process fold explicitly if we default to fold.
  // However, if the AI provides fold hands, it's good for ensuring nothing was missed.
  // processAction(summary.fold, 'fold');


  return handRange;
}
