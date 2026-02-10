import type {MeritFormulaData} from '../data';

export interface CalculationResult {
  aggregate: number;
  formula: MeritFormulaData;
  breakdown: {
    matricContribution: number;
    interContribution: number;
    testContribution: number;
    hafizBonus: number;
  };
}

export interface CalculatorInputs {
  matricMarks: string;
  matricTotal: string;
  interMarks: string;
  interTotal: string;
  entryTestMarks: string;
  entryTestTotal: string;
  isHafiz: boolean;
  selectedEducation: string;
}
