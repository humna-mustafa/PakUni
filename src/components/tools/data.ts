/**
 * Tools Screen - Types and static data.
 */

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  component: 'meritCalculator' | 'gradeConverter' | 'targetCalculator' | 'whatIf' | 'customFormula';
}

export const TOOLS: Tool[] = [
  {id: 'merit-calc', title: 'Merit Calculator', description: 'Calculate your merit percentage for any university', icon: 'calculator-outline', color: '#4573DF', component: 'meritCalculator'},
  {id: 'grade-converter', title: 'Grade Converter', description: 'Convert grades between Pakistani, American, and international systems', icon: 'swap-horizontal-outline', color: '#10B981', component: 'gradeConverter'},
  {id: 'target-calc', title: 'Target Calculator', description: 'Find out what marks you need to achieve your target merit', icon: 'flag-outline', color: '#F59E0B', component: 'targetCalculator'},
  {id: 'what-if', title: 'What-If Simulator', description: 'Explore different scenarios and see how changes affect your merit', icon: 'git-branch-outline', color: '#8B5CF6', component: 'whatIf'},
  {id: 'custom-formula', title: 'Custom Formula Builder', description: 'Create custom merit formulas for specific universities', icon: 'code-slash-outline', color: '#EC4899', component: 'customFormula'},
];
