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
    setFocusMinutes(prev => prev + minutes);
  }, []);

  const handleSessionComplete = useCallback((session: PomodoroSession) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const getSessionsByDate = useCallback((date: string) => {
    return sessions.filter(session => 
      new Date(session.startTime).toDateString() === new Date(date).toDateString()
    );
  }, [sessions]);

  const getTotalFocusTime = useCallback((date?: string) => {
    if (date) {
      return getSessionsByDate(date).reduce((total, session) => 
        total + session.duration, 0
      );
    }
    return sessions.reduce((total, session) => total + session.duration, 0);
  }, [sessions, getSessionsByDate]);

  return {
    sessions,
    focusMinutes,
    handlePomodoroComplete,
    handleSessionComplete,
    getSessionsByDate,
    getTotalFocusTime
  };
}; 