export type Priority = 'high' | 'medium' | 'low';

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  deleted: number;
  completionRate: number;
  averageCompletionTime: number;
  byPriority: Record<Priority, number>;
  byTag: Record<string, number>;
}

export interface DailyStats {
  date: string;
  focusMinutes: number;
  completedTasks: number;
  totalTasks: number;
  sessions: number;
  goalAchieved: boolean;
}

export interface WeeklyStats {
  weekStart: string;
  focusMinutes: number;
  completedTasks: number;
  totalTasks: number;
  sessions: number;
  goalAchieved: boolean;
  dailyStats: DailyStats[];
}

export interface MonthlyStats {
  month: string;
  focusMinutes: number;
  completedTasks: number;
  totalTasks: number;
  sessions: number;
  goalAchieved: boolean;
  weeklyStats: WeeklyStats[];
}

export interface Stats {
  today: {
    tasks: {
      total: number;
      completed: number;
      rate: number;
    };
    focusTime: number;
    trend: number; // 相比昨天的增长率
  };
  weekly: DailyStats[];
} 