export interface PomodoroSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  cyclesBeforeLongBreak: number;
}

export interface PomodoroSession {
  id: string;
  type: 'focus' | 'shortBreak' | 'longBreak';
  duration: number;
  startTime: string;
  endTime: string;
  completed: boolean;
}

export interface PomodoroStats {
  dailySessions: {
    date: string;
    completed: number;
    totalMinutes: number;
  }[];
  currentStreak: number;
  longestStreak: number;
  achievements: {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    progress: number;
    target: number;
  }[];
} 