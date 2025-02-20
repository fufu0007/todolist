import { useState, useCallback, useEffect } from 'react';
import type { PomodoroSession } from '../types/pomodoro';
import { usePomodoroState } from './usePomodoroState';

export const usePomodoroSessions = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sessions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [focusMinutes, setFocusMinutes] = useState(0);

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handlePomodoroComplete = useCallback((minutes: number) => {
    // 处理番茄钟完成事件
    console.log('Pomodoro completed:', minutes);
  }, []);

  const handleSessionComplete = useCallback((session: PomodoroSession) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const getSessionsByDate = useCallback((date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return (
        sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate()
      );
    });
  }, [sessions]);

  const getTotalFocusTime = useCallback((sessions: PomodoroSession[]) => {
    return sessions.reduce((total, session) => {
      if (session.completed && session.type === 'focus') {
        return total + session.duration;
      }
      return total;
    }, 0);
  }, []);

  return {
    sessions,
    focusMinutes,
    handlePomodoroComplete,
    handleSessionComplete,
    getSessionsByDate,
    getTotalFocusTime
  };
}; 