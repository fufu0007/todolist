'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Settings, Volume2, VolumeX, X, SkipForward } from 'lucide-react';
import type { PomodoroSession } from '../types/pomodoro';
import { Switch } from '@headlessui/react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type NotificationSound = 'simple' | 'bell' | 'digital' | 'chime';

interface PomodoroTimerProps {
  onComplete: (minutes: number) => void;
  onSessionComplete: (session: PomodoroSession) => void;
  sessions: PomodoroSession[];
}

interface TimerSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  roundsBeforeLongBreak: number;
  notificationSound: NotificationSound;
  notificationDuration: number;
  muted: boolean;
}

interface SoundSettings {
  notificationSound: string;
  notificationDuration: number;
  muted: boolean;
}

const FOCUS_TIME = 25 * 60; // 25分钟
const BREAK_TIME = 5 * 60; // 5分钟
const NOTIFICATION_SOUND = '/notification.mp3'; // 确保添加提示音文件

const WHITE_NOISE_SOURCES = [
  { 
    id: 'rain',
    name: '城市雨声',
    url: 'https://pixabay.com/zh/sound-effects/rainy-day-in-town-with-birds-singing-194011/',
    icon: '🌧️'
  },
  { 
    id: 'wind',
    name: '林间风声',
    url: 'https://pixabay.com/zh/sound-effects/ambience-wind-blowing-through-trees-01-186986/',
    icon: '🌲'
  },
  { 
    id: 'cicada',
    name: '深夜蝉鸣',
    url: 'https://pixabay.com/zh/sound-effects/night-ambience-17064/',
    icon: '🌙'
  },
  { 
    id: 'waterfall',
    name: '瀑布声',
    url: 'https://pixabay.com/zh/sound-effects/waterfalls2-19656/',
    icon: '💦'
  },
  { 
    id: 'morning',
    name: '森林早晨',
    url: 'https://pixabay.com/zh/sound-effects/birds-19624/',
    icon: '🌅'
  }
];

const ALARM_SOUNDS = [
  {
    id: 'simple',
    name: '清脆提示',
    createSound: (ctx: AudioContext) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      return { osc, gain };
    }
  },
  {
    id: 'double',
    name: '双音提示',
    createSound: (ctx: AudioContext) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      setTimeout(() => osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1), 100);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      return { osc, gain };
    }
  },
  {
    id: 'soft',
    name: '柔和提示',
    createSound: (ctx: AudioContext) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      return { osc, gain };
    }
  },
  {
    id: 'alert',
    name: '提醒音',
    createSound: (ctx: AudioContext) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      return { osc, gain };
    }
  }
];

declare global {
  interface Window {
    audioContext?: AudioContext;
  }
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  roundsBeforeLongBreak: 4,
  notificationSound: 'simple',
  notificationDuration: 1,
  muted: false
};

export default function PomodoroTimer({ onComplete, onSessionComplete, sessions }: PomodoroTimerProps) {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem('pomodoroSettings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  // 从 localStorage 恢复状态
  const [currentMode, setCurrentMode] = useState<TimerMode>(() => {
    if (typeof window === 'undefined') return 'focus';
    return (localStorage.getItem('pomodoroMode') as TimerMode) || 'focus';
  });

  const [currentRound, setCurrentRound] = useState(() => {
    if (typeof window === 'undefined') return 1;
    return parseInt(localStorage.getItem('pomodoroRound') || '1');
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window === 'undefined') return settings.focusTime * 60;
    const saved = localStorage.getItem('pomodoroTimeLeft');
    if (!saved) return settings.focusTime * 60;

    const savedTime = parseInt(saved);
    const savedStartTime = localStorage.getItem('pomodoroStartTime');
    
    if (savedStartTime) {
      const elapsed = Math.floor((Date.now() - new Date(savedStartTime).getTime()) / 1000);
      return Math.max(0, savedTime - elapsed);
    }
    return savedTime;
  });

  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pomodoroIsRunning') === 'true';
  });

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('pomodoroStartTime');
    return saved ? new Date(saved) : null;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 保存状态到 localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('pomodoroMode', currentMode);
    localStorage.setItem('pomodoroRound', currentRound.toString());
    localStorage.setItem('pomodoroTimeLeft', timeLeft.toString());
    localStorage.setItem('pomodoroIsRunning', isRunning.toString());
    if (sessionStartTime) {
      localStorage.setItem('pomodoroStartTime', sessionStartTime.toISOString());
    } else {
      localStorage.removeItem('pomodoroStartTime');
    }
  }, [currentMode, currentRound, timeLeft, isRunning, sessionStartTime]);

  const totalDuration = useMemo(() => {
    switch (currentMode) {
      case 'focus':
        return settings.focusTime * 60;
      case 'shortBreak':
        return settings.shortBreakTime * 60;
      case 'longBreak':
        return settings.longBreakTime * 60;
    }
  }, [currentMode, settings]);

  const createSession = useCallback((completed: boolean) => {
    const now = new Date();
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      startTime: sessionStartTime ? new Date(sessionStartTime) : now,
      endTime: now,
      duration: sessionStartTime 
        ? Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
        : 0,
      completed,
      type: currentMode
    };
    return session;
  }, [sessionStartTime, currentMode]);

  const handleModeSwitch = useCallback(() => {
    const isLongBreak = currentRound % settings.roundsBeforeLongBreak === 0;
    
    if (currentMode === 'focus') {
      // 从专注模式切换到休息模式
      setCurrentMode(isLongBreak ? 'longBreak' : 'shortBreak');
      setTimeLeft(isLongBreak ? settings.longBreakTime * 60 : settings.shortBreakTime * 60);
      setIsRunning(false);
      setSessionStartTime(null);
    } else {
      // 从休息模式切换到专注模式
      setCurrentMode('focus');
      setTimeLeft(settings.focusTime * 60);
      setCurrentRound(prev => prev + 1);
      setIsRunning(false);
      setSessionStartTime(null);
    }

    // 保存新状态到 localStorage
    localStorage.setItem('pomodoroMode', currentMode);
    localStorage.setItem('pomodoroTimeLeft', timeLeft.toString());
    localStorage.setItem('pomodoroRound', currentRound.toString());
    localStorage.setItem('pomodoroIsRunning', 'false');
    localStorage.removeItem('pomodoroStartTime');
  }, [currentMode, currentRound, timeLeft, settings.focusTime, settings.shortBreakTime, 
      settings.longBreakTime, settings.roundsBeforeLongBreak]);

  const createNotificationSound = useCallback((type: NotificationSound, duration: number = 0.5): OscillatorNode | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      switch (type) {
        case 'simple':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
          break;
        case 'bell':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
          break;
        case 'digital':
          osc.type = 'square';
          osc.frequency.setValueAtTime(740, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
          break;
        case 'chime':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
          break;
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      return osc;
    } catch (error) {
      console.error('Error creating notification sound:', error);
      return null;
    }
  }, []);

  const playSound = useCallback((sound: NotificationSound, duration: number = 0.5) => {
    if (!soundEnabled || settings.muted) return;
    
    const osc = createNotificationSound(sound, duration);
    if (osc) {
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
        } catch (error) {
          console.error('Error stopping sound:', error);
        }
      }, duration * 1000);
    }
  }, [soundEnabled, settings.muted, createNotificationSound]);

  const playNotification = useCallback(() => {
    if (!soundEnabled || settings.muted) return;
    
    let count = 0;
    const playInterval = setInterval(() => {
      if (count >= 3) {
        clearInterval(playInterval);
        if (Notification.permission === 'granted') {
          new Notification('番茄钟提醒', {
            body: currentMode === 'focus' ? '专注时间结束！' : '休息时间结束！',
            icon: '/favicon.ico'
          });
        }
        return;
      }

      const osc = createNotificationSound(settings.notificationSound, 0.3); // 缩短每次播放时长
      if (osc) {
        osc.start();
        setTimeout(() => {
          try {
            osc.stop();
          } catch (error) {
            console.error('Error stopping notification:', error);
          }
        }, 300); // 300ms 后停止当前音效
      }
      count++;
    }, 1000); // 每秒播放一次

    return () => clearInterval(playInterval);
  }, [soundEnabled, settings.muted, settings.notificationSound, currentMode, createNotificationSound]);

  const toggleTimer = useCallback(() => {
    if (!isRunning) {
      setSessionStartTime(prev => prev || new Date());
      setIsRunning(true);
      if (soundEnabled && !settings.muted) {
        playSound('simple', 0.3);
      }
    } else {
      setIsRunning(false);
      if (sessionStartTime) {
        const session = createSession(false);
        onSessionComplete(session);
      }
    }
  }, [isRunning, sessionStartTime, soundEnabled, settings.muted, createSession, onSessionComplete, playSound]);

  const resetTimer = useCallback(() => {
    if (isRunning && sessionStartTime) {
      const session = createSession(false);
      onSessionComplete(session);
    }
    
    setCurrentMode('focus');
    setCurrentRound(1);
    setTimeLeft(settings.focusTime * 60);
    setIsRunning(false);
    setSessionStartTime(null);
    setSelectedTaskId(null);

    // 清除所有存储的状态
    localStorage.removeItem('pomodoroMode');
    localStorage.removeItem('pomodoroTimeLeft');
    localStorage.removeItem('pomodoroIsRunning');
    localStorage.removeItem('pomodoroStartTime');
    localStorage.removeItem('pomodoroRound');

    if (soundEnabled && !settings.muted) {
      playSound('simple', 0.2);
    }
  }, [isRunning, sessionStartTime, settings.focusTime, soundEnabled, settings.muted, createSession, onSessionComplete, playSound]);

  const skipCurrentPhase = useCallback(() => {
    if (isRunning && sessionStartTime) {
      const session = createSession(false);
      onSessionComplete(session);
    }
    
    handleModeSwitch();
    
    if (soundEnabled && !settings.muted) {
      playSound('simple', 0.2);
    }
  }, [isRunning, sessionStartTime, soundEnabled, settings.muted, createSession, onSessionComplete, handleModeSwitch, playSound]);

  // 计时器逻辑
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // 在倒计时最后3秒开始播放提示音
        if (prev <= 3 && prev > 0 && soundEnabled && !settings.muted) {
          playSound(settings.notificationSound, 0.3);
        }
        
        if (prev <= 1) {
          clearInterval(timer);
          if (currentMode === 'focus' && sessionStartTime) {
            const session = createSession(true);
            onSessionComplete(session);
            onComplete(session.duration);
          }
          handleModeSwitch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentMode, sessionStartTime, soundEnabled, settings.muted, 
      handleModeSwitch, createSession, onComplete, onSessionComplete, playSound, settings.notificationSound]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const calculateProgress = useCallback(() => {
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [timeLeft, totalDuration]);

  const timerColor = useMemo(() => {
    switch (currentMode) {
      case 'focus':
        return 'text-red-500 dark:text-red-400';
      case 'shortBreak':
        return 'text-green-500 dark:text-green-400';
      case 'longBreak':
        return 'text-blue-500 dark:text-blue-400';
    }
  }, [currentMode]);

  const timerBgColor = useMemo(() => {
    switch (currentMode) {
      case 'focus':
        return 'text-red-100 dark:text-red-900/20';
      case 'shortBreak':
        return 'text-green-100 dark:text-green-900/20';
      case 'longBreak':
        return 'text-blue-100 dark:text-blue-900/20';
    }
  }, [currentMode]);

  const modeTitle = useCallback(() => {
    switch (currentMode) {
      case 'focus':
        return '专注时间';
      case 'shortBreak':
        return '短休息';
      case 'longBreak':
        return '长休息';
    }
  }, [currentMode]);

  const todayCompletedSessions = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return sessions.filter(session => 
      session.completed && 
      session.type === 'focus' &&
      new Date(session.startTime).setHours(0, 0, 0, 0) === today
    );
  }, [sessions]);

  const calculateTotalFocusTime = useCallback((sessions: PomodoroSession[]) => {
    return sessions.reduce((total, session) => {
      if (session.completed && session.type === 'focus') {
        return total + session.duration;
      }
      return total;
    }, 0);
  }, []);

  const todayStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(session => 
      new Date(session.startTime).setHours(0, 0, 0, 0) === today &&
      session.type === 'focus' &&
      session.completed
    );

    return {
      totalMinutes: todaySessions.reduce((sum, session) => sum + session.duration, 0),
      completedCount: todaySessions.length,
      targetMinutes: 6 * 60 // 6小时目标
    };
  }, [sessions]);

  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">设置</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                dark:hover:text-gray-200"
              title="重置设置"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 设置面板内容 */}
        <div className="space-y-6">
          {/* 时间设置 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">专注时长 (分钟)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.focusTime}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  focusTime: Math.min(60, Math.max(1, parseInt(e.target.value) || 1))
                }))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                短休息时间 (分钟)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakTime}
                onChange={(e) => setSettings(prev => ({ ...prev, shortBreakTime: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 
                  dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                长休息时间 (分钟)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakTime}
                onChange={(e) => setSettings(prev => ({ ...prev, longBreakTime: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 
                  dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                长休息间隔 (轮数)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.roundsBeforeLongBreak}
                onChange={(e) => setSettings(prev => ({ ...prev, roundsBeforeLongBreak: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 
                  dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* 音效设置 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">提示音效</h4>
            <div className="grid grid-cols-2 gap-2">
              {['simple', 'bell', 'digital', 'chime'].map((sound) => (
                <div
                  key={sound}
                  onClick={() => {
                    setSettings(prev => ({ ...prev, notificationSound: sound as NotificationSound }));
                    playSound(sound as NotificationSound, settings.notificationDuration);
                  }}
                  className={`p-3 rounded-lg border text-sm cursor-pointer ${
                    settings.notificationSound === sound
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {sound}
                </div>
              ))}
            </div>
          </div>

          {/* 底部添加重置按钮 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              恢复默认设置
            </button>
            <button
              onClick={() => {
                localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
                setShowSettings(false);
                if (soundEnabled && !settings.muted) {
                  playSound('simple', 0.2);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const WhiteNoiseSection = () => (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
        白噪音
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
          点击跳转到音源
        </span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {WHITE_NOISE_SOURCES.map(source => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 
              dark:hover:bg-gray-700 transition-colors text-center"
          >
            {source.name}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">番茄时钟</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={skipCurrentPhase}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="跳过当前阶段"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              onClick={resetTimer}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="重新开始"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, index) => {
            const isCompleted = index < (currentRound - 1) % 4;
            const isCurrent = index === (currentRound - 1) % 4;
            return (
              <div
                key={index}
                className={`relative w-6 h-6 flex items-center justify-center`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-red-500 dark:bg-red-400'
                      : isCurrent
                      ? 'bg-red-200 dark:bg-red-800'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
                <div
                  className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-3 rounded-t-full rotate-45 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 dark:bg-green-400'
                      : isCurrent
                      ? 'bg-green-200 dark:bg-green-800'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="relative w-64 h-64 mx-auto">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className={`${timerBgColor} stroke-current`}
              strokeWidth="4"
              fill="none"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className={`${timerColor} stroke-current transition-all duration-1000`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              r="45"
              cx="50"
              cy="50"
              strokeDasharray="282.7433388230814"
              strokeDashoffset={282.7433388230814 * (1 - calculateProgress() / 100)}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold mb-2 ${timerColor}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {modeTitle()}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              第 {currentRound} 轮
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isRunning ? '暂停' : '开始'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            重置
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            设置
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>今日专注</span>
            <span>{todayStats.completedCount} / 8 个番茄钟</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 dark:bg-red-400 transition-all duration-500"
              style={{ width: `${Math.min((todayStats.completedCount / 8) * 100, 100)}%` }}
            />
          </div>
        </div>

        {showSettings && (
          <SettingsPanel />
        )}
      </div>
      <WhiteNoiseSection />
    </div>
  );
} 