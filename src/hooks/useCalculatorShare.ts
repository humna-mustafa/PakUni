import {useState, useCallback} from 'react';
import {Share} from 'react-native';
import {Haptics} from '../utils/haptics';
import {shareMeritSuccessCard, getChanceLevel} from '../services/share';
import type {CalculationResult} from '../types/calculator';

export {getChanceLevel};

export const useCalculatorShare = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareResult, setShareResult] = useState<CalculationResult | null>(null);

  const handleShareResult = useCallback(async (result: CalculationResult) => {
    Haptics.light();
    setShareResult(result);
    setShowShareModal(true);
  }, []);

  const handleShareAllResults = useCallback(async (results: CalculationResult[]) => {
    if (results.length === 0) return;
    Haptics.light();

    const resultLines = results.map((r) => {
      const rawChance = getChanceLevel(r.aggregate);
      const emoji = rawChance === 'high' ? '🟢' : rawChance === 'medium' ? '🟡' : '🔴';
      let chanceLabel: string;
      switch (rawChance) {
        case 'high': chanceLabel = 'Strong Chances'; break;
        case 'medium': chanceLabel = 'Building Momentum'; break;
        case 'low': chanceLabel = 'Room to Grow'; break;
        case 'unlikely': chanceLabel = 'Focus Area'; break;
        default: chanceLabel = 'Calculated';
      }
      return `${emoji} ${r.formula.name}: ${r.aggregate.toFixed(2)}% (${chanceLabel})`;
    }).join('\n');

    const topAggregate = results[0].aggregate;
    let honestPrefix: string;
    if (topAggregate >= 85) {
      honestPrefix = '🎉 Great achievement on my merit results!';
    } else if (topAggregate >= 70) {
      honestPrefix = '📊 My merit results - strong foundation, working towards my goals!';
    } else if (topAggregate >= 50) {
      honestPrefix = '📈 My current merit scores - room for growth, time to work harder!';
    } else {
      honestPrefix = '🎯 Starting my journey - every expert was once a beginner!';
    }

    const message = `${honestPrefix}\n\n${resultLines}\n\nCalculated with PakUni App`;

    try {
      await Share.share({
        title: 'My Merit Journey - PakUni',
        message,
      });
      Haptics.success();
    } catch (error) {
      // User cancelled
    }
  }, []);

  const performShare = useCallback(async () => {
    if (!shareResult) return;

    const rawChance = getChanceLevel(shareResult.aggregate);
    const chance: 'high' | 'medium' | 'low' = rawChance === 'unlikely' ? 'low' : rawChance;

    const success = await shareMeritSuccessCard({
      aggregate: shareResult.aggregate,
      universityName: shareResult.formula.university,
      universityShortName: shareResult.formula.name.replace(' Formula', ''),
      chance,
      breakdown: {
        matricContribution: shareResult.breakdown.matricContribution,
        interContribution: shareResult.breakdown.interContribution,
        testContribution: shareResult.breakdown.testContribution,
      },
    });

    if (success) {
      Haptics.success();
      setShowShareModal(false);
    }
  }, [shareResult]);

  return {
    showShareModal,
    setShowShareModal,
    shareResult,
    handleShareResult,
    handleShareAllResults,
    performShare,
  };
};
