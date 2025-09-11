
import type { GetHandRangeOutput } from '@/ai/flows/get-hand-range';
import type { Action, HandRange } from './types';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function parseRange(rangeStr: string): string[] {
  const hands: string[] = [];
  const rank1 = rangeStr[0];
  const rank2 = rangeStr[1];
  const type = rangeStr.length > 2 ? rangeStr[2] : '';

  if (rangeStr.endsWith('+')) {
    const baseRank = rangeStr.slice(0, 2);
    if (baseRank[0] === baseRank[1]) { // Pocket pair like 88+
      const startIndex = RANKS.indexOf(baseRank[0]);
      for (let i = 0; i <= startIndex; i++) {
        hands.push(`${RANKS[i]}${RANKS[i]}`);
      }
    } else { // Suited/offsuit like AQs+ or KJo+
      const highRank = baseRank[0];
      const lowRank = baseRank[1];
      const suit = baseRank.length > 2 ? baseRank[2] : 's';
      const highRankIndex = RANKS.indexOf(highRank);
      const lowRankIndex = RANKS.indexOf(lowRank);
      for (let i = highRankIndex + 1; i <= lowRankIndex; i++) {
        hands.push(`${highRank}${RANKS[i]}${suit}`);
      }
    }
  } else if (rangeStr.includes('-')) {
    const [start, end] = rangeStr.split('-');
    const startIndex = RANKS.indexOf(start[start.length-1]);
    const endIndex = RANKS.indexOf(end[end.length -1]);
    const prefix = start.slice(0, -1);
    const suffix = start.length > 2 ? start.slice(2) : '';

    for(let i = startIndex; i <= endIndex; i++){
        hands.push(`${prefix}${RANKS[i]}${suffix}`);
    }
  }
   else {
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
