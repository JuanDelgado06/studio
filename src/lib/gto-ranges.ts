
import type { GenerateGtoRangeOutput } from './types';
import jsonData from './gto-ranges.json';

interface GtoRangeData {
    key: string;
    range: GenerateGtoRangeOutput;
}

export const GTO_RANGES_DATA: GtoRangeData[] = jsonData.ranges;
