import { useState, useEffect } from 'react';
import type { PomodoroState, PomodoroSettings } from '../types/pomodoro';

const DEFAULT_STATE: PomodoroState = {
  currentMode: 'focus',
  timeLeft: 25 * 60,
  isRunning: false,
  currentRound: 1,
  sessionStartTime: null,
  selectedTaskId: null
};

export function usePomodoroState(settings: PomodoroSettings) {
  const [state, setState] = useState<PomodoroState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    
    try {
      const saved = localStorage.getItem('pomodoroState');
      if (!saved) return DEFAULT_STATE;

      const parsedState = JSON.parse(saved);
      
      // 恢复会话开始时间
      if (parsedState.sessionStartTime) {
        const startTime = new Date(parsedState.sessionStartTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        // 如果计时器在运行，更新剩余时间
        if (parsedState.isRunning) {
          parsedState.timeLeft = Math.max(0, parsedState.timeLeft - elapsedSeconds);
        }
      }
      
      return parsedState;
    } catch (error) {
      console.error('Error loading pomodoro state:', error);
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stateToSave = {
      ...state,
      sessionStartTime: state.sessionStartTime ? new Date(state.sessionStartTime).toISOString() : null
    };
    
    localStorage.setItem('pomodoroState', JSON.stringify(stateToSave));
  }, [state]);

  const updateState = (updates: Partial<PomodoroState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(DEFAULT_STATE);
    localStorage.removeItem('pomodoroState');
  };

  return {
    state,
    updateState,
    resetState
  };
} 