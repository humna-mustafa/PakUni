/**
 * Guide types and interfaces
 */

export interface GuideCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  guideCount: number;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  tips?: string[];
  documents?: string[];
  important?: boolean;
}

export interface Guide {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  steps?: GuideStep[];
  content?: string;
  tips?: string[];
  resources?: {title: string; url?: string}[];
}
