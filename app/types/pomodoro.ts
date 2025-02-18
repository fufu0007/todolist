export interface PomodoroState {
  currentMode: 'focus' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  isRunning: boolean;
  currentRound: number;
  sessionStartTime: string | null;
  selectedTaskId: string | null;
}

export interface PomodoroSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  cyclesBeforeLongBreak: number;
  notificationSound: NotificationSound;
  notificationDuration: number;
  muted: boolean;
}

export type PomodoroType = 'focus' | 'shortBreak' | 'longBreak';
export type NotificationSound = 'simple' | 'bell' | 'digital' | 'chime';

export interface PomodoroSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: PomodoroType;
  completed: boolean;
  taskId?: string;
  status?: 'running' | 'paused' | 'completed';
}

export interface PomodoroSessionDTO {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: PomodoroType;
  completed: boolean;
  taskId?: string;
  status?: 'running' | 'paused' | 'completed';
}

export function convertSessionFromDTO(dto: PomodoroSessionDTO): PomodoroSession {
  return {
    ...dto,
    startTime: new Date(dto.startTime),
    endTime: new Date(dto.endTime)
  };
}

export function convertSessionToDTO(session: PomodoroSession): PomodoroSessionDTO {
  return {
    ...session,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime.toISOString()
  };
}

export function getSessionStats(sessions: PomodoroSession[]) {
  return {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.completed).length,
    workSessions: sessions.filter(s => s.type === 'focus' && s.completed).length,
    shortBreakSessions: sessions.filter(s => s.type === 'shortBreak' && s.completed).length,
    longBreakSessions: sessions.filter(s => s.type === 'longBreak' && s.completed).length,
    totalDuration: sessions.reduce((acc, s) => acc + (s.completed ? s.duration : 0), 0),
  };
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

export function getSessionDate(session: PomodoroSession): Date {
  return new Date(session.startTime);
} 