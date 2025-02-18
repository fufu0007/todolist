'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, X, SkipForward } from 'lucide-react';
import type { PomodoroSession } from '../types/pomodoro';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

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
}

interface SoundSettings {
  notificationSound: string;
  notificationDuration: number;
  muted: boolean;
}

const FOCUS_TIME = 25 * 60; // 25分钟
const BREAK_TIME = 5 * 60; // 5分钟
const NOTIFICATION_SOUND = '/notification.mp3'; // 确保添加提示音文件

const NOTIFICATION_SOUNDS = [
  { id: 'bell', name: '清脆铃声', path: '/sounds/bell.mp3' },
  { id: 'chime', name: '欢快风铃', path: '/sounds/chime.mp3' },
  { id: 'marimba', name: '木琴音效', path: '/sounds/marimba.mp3' },
  { id: 'xylophone', name: '悦耳木琴', path: '/sounds/xylophone.mp3' },
];

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

export default function PomodoroTimer({ onComplete, onSessionComplete, sessions }: PomodoroTimerProps) {
  const [settings, setSettings] = useState<TimerSettings & SoundSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroSettings');
      return saved ? JSON.parse(saved) : {
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        roundsBeforeLongBreak: 4,
        notificationSound: 'simple',
        notificationDuration: 1.5,
        muted: false
      };
    }
    return {
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      roundsBeforeLongBreak: 4,
      notificationSound: 'simple',
      notificationDuration: 1.5,
      muted: false
    };
  });

  // 临时设置状态，用于编辑但未保存的设置
  const [tempSettings, setTempSettings] = useState<TimerSettings & SoundSettings>(settings);

  const [currentMode, setCurrentMode] = useState<TimerMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimerState');
      if (saved) {
        const state = JSON.parse(saved);
        const savedTime = new Date(state.savedAt).getTime();
        const now = new Date().getTime();
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          return state.currentMode;
        }
      }
    }
    return 'focus';
  });

  const [currentRound, setCurrentRound] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimerState');
      if (saved) {
        const state = JSON.parse(saved);
        const savedTime = new Date(state.savedAt).getTime();
        const now = new Date().getTime();
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          return state.currentRound;
        }
      }
    }
    return 1;
  });

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

  // 处理模式切换
  const handleModeSwitch = useCallback(() => {
    if (currentMode === 'focus') {
      if (currentRound % settings.roundsBeforeLongBreak === 0) {
        setCurrentMode('longBreak');
        setTimeLeft(settings.longBreakTime * 60);
      } else {
        setCurrentMode('shortBreak');
        setTimeLeft(settings.shortBreakTime * 60);
      }
    } else {
      setCurrentMode('focus');
      setTimeLeft(settings.focusTime * 60);
      if (currentMode === 'longBreak') {
        setCurrentRound(1);
      } else {
        setCurrentRound((prev: number) => prev + 1);
      }
    }
    setIsRunning(false);
    setSessionStartTime(null);
  }, [currentMode, currentRound, settings]);

  // 从 localStorage 恢复计时器状态
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimerState');
      if (saved) {
        const state = JSON.parse(saved);
        const savedTime = new Date(state.savedAt).getTime();
        const now = new Date().getTime();
        // 如果保存时间在24小时内，恢复状态
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          return state.timeLeft;
        }
      }
    }
    return settings.focusTime * 60;
  });

  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimerState');
      if (saved) {
        const state = JSON.parse(saved);
        const savedTime = new Date(state.savedAt).getTime();
        const now = new Date().getTime();
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          return state.isRunning;
        }
      }
    }
    return false;
  });

  const [sessionStartTime, setSessionStartTime] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimerState');
      if (saved) {
        const state = JSON.parse(saved);
        const savedTime = new Date(state.savedAt).getTime();
        const now = new Date().getTime();
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          return state.sessionStartTime;
        }
      }
    }
    return null;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // 恢复运行状态
  useEffect(() => {
    let mounted = true;
    
    const restoreState = () => {
      if (isRunning && sessionStartTime && mounted) {
        const now = new Date().getTime();
        const start = new Date(sessionStartTime).getTime();
        const elapsed = Math.floor((now - start) / 1000);
        const newTimeLeft = totalDuration - elapsed;
        
        if (newTimeLeft > 0) {
          setTimeLeft(newTimeLeft);
        } else {
          // 如果时间已经结束，触发完成事件
          const currentSession: PomodoroSession = {
            id: new Date().toISOString(),
            type: currentMode,
            startTime: sessionStartTime,
            endTime: new Date().toISOString(),
            duration: Math.ceil(totalDuration / 60),
            completed: true
          };
          
          onSessionComplete(currentSession);
          onComplete(currentSession.duration);
          handleModeSwitch();
        }
      }
    };

    restoreState();
    return () => {
      mounted = false;
    };
  }, [isRunning, sessionStartTime, totalDuration, currentMode, onSessionComplete, onComplete, handleModeSwitch]);

  // 保存计时器状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = {
        timeLeft,
        isRunning,
        currentMode,
        currentRound,
        sessionStartTime,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('pomodoroTimerState', JSON.stringify(state));
    }
  }, [timeLeft, isRunning, currentMode, currentRound, sessionStartTime]);

  // 检查零点重置
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        if (isRunning) {
          const currentSession: PomodoroSession = {
            id: new Date().toISOString(),
            type: currentMode,
            startTime: sessionStartTime!,
            endTime: new Date().toISOString(),
            duration: Math.ceil((totalDuration - timeLeft) / 60),
            completed: false
          };
          onSessionComplete(currentSession);
        }
        setTimeLeft(settings.focusTime * 60);
        setCurrentRound(1);
        setIsRunning(false);
        setCurrentMode('focus');
        setSessionStartTime(null);
      }
    };

    const midnightCheck = setInterval(checkMidnight, 1000);
    return () => clearInterval(midnightCheck);
  }, [isRunning, currentMode, sessionStartTime, totalDuration, timeLeft, settings, onSessionComplete]);

  // 保存状态到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // 格式化时间显示
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 修改音效预览函数，移除渐变效果
  const previewSound = useCallback(() => {
    try {
      // 如果静音则不播放
      if (settings.muted) return;

      // 确保 AudioContext 存在
      if (!window.audioContext || window.audioContext.state === 'closed') {
        window.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // 如果 AudioContext 被挂起，则恢复
      if (window.audioContext.state === 'suspended') {
        window.audioContext.resume();
      }

      const sound = ALARM_SOUNDS.find(s => s.id === settings.notificationSound);
      if (sound) {
        const { osc, gain } = sound.createSound(window.audioContext);
        
        // 连接节点
        osc.connect(gain);
        gain.connect(window.audioContext.destination);

        // 开始播放
        const startTime = window.audioContext.currentTime;
        osc.start(startTime);
        
        // 设置固定音量，不使用渐变
        gain.gain.setValueAtTime(0.3, startTime);
        
        // 停止播放
        osc.stop(startTime + 1.0);

        // 清理资源
        osc.onended = () => {
          try {
            gain.disconnect();
            osc.disconnect();
          } catch (error) {
            console.error('清理音频资源时出错:', error);
          }
        };
      }
    } catch (error) {
      console.error('预览音效错误:', error);
    }
  }, [settings.muted]);

  // 修改播放提示音函数，确保使用正确的持续时间
  const playNotification = useCallback(() => {
    if (soundEnabled && !settings.muted) {
      previewSound();

      // 系统通知部分保持不变
      if (Notification.permission === 'granted') {
        const notificationTitle = currentMode === 'focus' ? '专注时间结束！' : '休息时间结束！';
        const notificationBody = currentMode === 'focus' ? '该休息一下了！' : '该开始新的专注了！';
        
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/favicon.ico',
          silent: true
        });
      }
    }
  }, [soundEnabled, currentMode, settings.notificationSound, settings.notificationDuration, settings.muted]);

  // 计时器逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      playNotification();
      const currentSession: PomodoroSession = {
        id: new Date().toISOString(),
        type: currentMode,
        startTime: sessionStartTime!,
        endTime: new Date().toISOString(),
        duration: Math.ceil(totalDuration / 60),
        completed: true
      };
      
      if (onComplete) {
        onComplete(currentSession.duration);
      }
      if (onSessionComplete) {
        onSessionComplete(currentSession);
      }
      handleModeSwitch();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, totalDuration, handleModeSwitch, onComplete, onSessionComplete, playNotification, currentMode, sessionStartTime]);

  // 开始/暂停计时
  const toggleTimer = useCallback(() => {
    if (!isRunning && timeLeft === totalDuration) {
      // 新的番茄钟开始
      setSessionStartTime(new Date().toISOString());
    }
    setIsRunning((prev: boolean) => !prev);
  }, [isRunning, timeLeft, totalDuration]);

  // 重置计时器
  const resetTimer = useCallback(() => {
    if (isRunning) {
      // 如果正在运行，记录未完成的会话
      const currentSession: PomodoroSession = {
        id: new Date().toISOString(),
        type: currentMode,
        startTime: sessionStartTime!,
        endTime: new Date().toISOString(),
        duration: Math.ceil((totalDuration - timeLeft) / 60),
        completed: false
      };
      onSessionComplete(currentSession);
    }
    setTimeLeft(totalDuration);
    setIsRunning(false);
    setSessionStartTime(null);
  }, [isRunning, currentMode, sessionStartTime, totalDuration, timeLeft, onSessionComplete]);

  // 计算圆环进度
  const calculateProgress = useCallback(() => {
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [timeLeft, totalDuration]);

  // 计算圆环颜色
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

  // 计算圆环背景色
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

  // 计算模式标题
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

  // 计算今日完成的番茄数
  const todayCompletedSessions = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return sessions.filter(session => 
      session.completed && 
      session.type === 'focus' &&
      new Date(session.startTime).setHours(0, 0, 0, 0) === today
    );
  }, [sessions]);

  // 计算总专注时间
  const totalFocusMinutes = useMemo(() => {
    return sessions.reduce((total, session) => {
      if (session.completed && session.type === 'focus') {
        return total + session.duration;
      }
      return total;
    }, 0);
  }, [sessions]);

  // 计算今日专注数据
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

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果在输入框中，不处理快捷键
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case ' ': // 空格键：开始/暂停
          e.preventDefault();
          toggleTimer();
          break;
        case 'r': // R键：重置
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            resetTimer();
          }
          break;
        case 'm': // M键：静音切换
          e.preventDefault();
          setSoundEnabled((prev: boolean) => !prev);
          break;
        case 'escape': // ESC键：关闭设置
          if (showSettings) {
            setShowSettings(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTimer, resetTimer, showSettings]);

  // 通知权限检查和请求
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // 跳过当前阶段
  const skipSession = useCallback(() => {
    if (currentMode === 'focus') {
      if (currentRound % settings.roundsBeforeLongBreak === 0) {
        setTimeLeft(settings.longBreakTime * 60);
        setCurrentMode('longBreak');
      } else {
        setTimeLeft(settings.shortBreakTime * 60);
        setCurrentMode('shortBreak');
      }
      if (sessionStartTime && onSessionComplete) {
        onSessionComplete({
          id: new Date().toISOString(),
          type: currentMode,
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: Math.ceil((totalDuration - timeLeft) / 60),
          completed: false
        });
      }
    } else {
      setTimeLeft(settings.focusTime * 60);
      setCurrentMode('focus');
      if (currentMode === 'longBreak') {
        setCurrentRound(1);
      } else {
        setCurrentRound((prev: number) => prev + 1);
      }
    }
    setIsRunning(false);
    setSessionStartTime(null);
  }, [currentMode, currentRound, settings, sessionStartTime, onSessionComplete, totalDuration, timeLeft]);

  // 保存设置
  const saveSettings = useCallback((newSettings: TimerSettings & SoundSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    
    // 根据当前模式更新时间
    if (!isRunning) {
      switch (currentMode) {
        case 'focus':
          setTimeLeft(newSettings.focusTime * 60);
          break;
        case 'shortBreak':
          setTimeLeft(newSettings.shortBreakTime * 60);
          break;
        case 'longBreak':
          setTimeLeft(newSettings.longBreakTime * 60);
          break;
      }
    }
    
    setShowSettings(false);
  }, [isRunning, currentMode]);

  // 重置设置为默认值
  const resetSettings = useCallback(() => {
    const defaultSettings = {
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      roundsBeforeLongBreak: 4,
      notificationSound: 'simple',
      notificationDuration: 1.5,
      muted: false
    };
    setTempSettings(defaultSettings);
  }, []);

  // 验证是否为当天的会话
  const isValidSession = useCallback((startTime: string) => {
    const sessionDate = new Date(startTime);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }, []);

  // 修改会话完成逻辑
  const handleSessionComplete = useCallback((session: PomodoroSession) => {
    // 只记录当天的会话
    if (isValidSession(session.startTime)) {
      onSessionComplete(session);
      onComplete(session.duration);
    }
  }, [onComplete, onSessionComplete, isValidSession]);

  // 修改设置面板组件
  const SettingsPanel = () => {
    // 添加临时设置状态
    const [tempDuration, setTempDuration] = useState(settings.notificationDuration);

    // 计算百分比
    const durationPercentage = (tempDuration / 3.0) * 100;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              时间设置
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 时间设置部分 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                专注时间 (分钟)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.focusTime}
                onChange={(e) => saveSettings({ ...settings, focusTime: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 
                  dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
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
                onChange={(e) => saveSettings({ ...settings, shortBreakTime: Number(e.target.value) })}
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
                onChange={(e) => saveSettings({ ...settings, longBreakTime: Number(e.target.value) })}
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
                onChange={(e) => saveSettings({ ...settings, roundsBeforeLongBreak: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 
                  dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* 音效设置部分 */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  提示音效
                </label>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, muted: !prev.muted }))}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                    ${settings.muted ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {settings.muted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {ALARM_SOUNDS.map(sound => (
                  <div
                    key={sound.id}
                    onClick={() => {
                      setSettings(prev => ({ ...prev, notificationSound: sound.id }));
                      previewSound();
                    }}
                    className={`p-3 rounded-lg border text-sm cursor-pointer transition-colors
                      ${settings.notificationSound === sound.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{sound.name}</span>
                      <Play className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 提示音持续时间设置 */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  提示音持续时间
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {durationPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={durationPercentage}
                  onChange={(e) => {
                    const percentage = parseInt(e.target.value);
                    const newDuration = (percentage / 100) * 3.0;
                    setTempDuration(newDuration);
                  }}
                  onMouseUp={() => {
                    // 在滑块释放时更新实际设置
                    setSettings(prev => ({
                      ...prev,
                      notificationDuration: tempDuration
                    }));
                    // 预览新的持续时间
                    previewSound();
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* 音效预览按钮 */}
            <div className="mt-4">
              <button
                onClick={previewSound}
                className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg
                  hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 
                  dark:hover:bg-blue-900/50 transition-colors"
              >
                预览当前音效和持续时间
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    <div className="space-y-4">
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
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 番茄进度指示器 */}
        <div className="flex justify-center gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, index) => {
            const isCompleted = index < (currentRound - 1) % 4;
            const isCurrent = index === (currentRound - 1) % 4;
            return (
              <div
                key={index}
                className={`relative w-6 h-6 flex items-center justify-center`}
              >
                {/* 番茄主体 */}
                <div
                  className={`w-5 h-5 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-red-500 dark:bg-red-400'
                      : isCurrent
                      ? 'bg-red-200 dark:bg-red-800'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
                {/* 番茄叶子 */}
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

        {/* 圆形计时器 */}
        <div className="relative w-64 h-64 mx-auto">
          {/* 背景圆环 */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className={`${timerBgColor} stroke-current`}
              strokeWidth="4"
              fill="none"
              r="45"
              cx="50"
              cy="50"
            />
            {/* 进度圆环 */}
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

          {/* 中间的时间显示 */}
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

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`p-3 rounded-full ${
              isRunning
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                : `${timerColor.replace('text', 'bg')} text-white hover:opacity-90`
            } transition-colors`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 
              dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          <button
            onClick={skipSession}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 
              dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* 今日统计 */}
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

        {/* 设置面板 */}
        {showSettings && (
          <SettingsPanel />
        )}
      </div>
      <WhiteNoiseSection />
    </div>
  );
} 