/**
 * Guide utility functions
 */

import type {Guide} from '../types/guides';

/**
 * Calculate accurate read time based on actual content word count
 */
export const calculateReadTime = (guide: Guide): string => {
  let wordCount = 0;

  // Count words in description
  wordCount += guide.description.split(/\s+/).length;

  // Count words in content
  if (guide.content) {
    wordCount += guide.content.split(/\s+/).length;
  }

  // Count words in steps
  if (guide.steps) {
    guide.steps.forEach(step => {
      wordCount += step.title.split(/\s+/).length;
      wordCount += step.description.split(/\s+/).length;
      if (step.tips) {
        step.tips.forEach(tip => {
          wordCount += tip.split(/\s+/).length;
        });
      }
    });
  }

  // Count words in tips
  if (guide.tips) {
    guide.tips.forEach(tip => {
      wordCount += tip.split(/\s+/).length;
    });
  }

  // Count words in resources
  if (guide.resources) {
    guide.resources.forEach(resource => {
      wordCount += resource.title.split(/\s+/).length;
    });
  }

  // Average reading speed: 200 wpm for educational content
  const readingSpeedWPM = 200;
  const minutes = Math.ceil(wordCount / readingSpeedWPM);

  if (minutes < 1) return '1 min';
  if (minutes > 30) return '30+ min';
  return `${minutes} min`;
};
