// Goal-related type definitions

export interface GoalMilestone {
  text: string;
  completed: boolean;
  completedDate?: string;
}

export interface UserGoal {
  id: string;
  title: string;
  iconName: string;
  color: string;
  progress: number;
  deadline?: string; // DD/MM/YYYY format
  completed: boolean;
  createdAt: string;
  category?: string;
  difficulty?: string;
  streak?: number;
  lastCheckIn?: string;
  milestones: GoalMilestone[];
}

export interface GoalTemplate {
  id: string;
  title: string;
  iconName: string;
  color: string;
  category: string;
  difficulty: string;
  estimatedDays: number;
  milestones: string[];
}
