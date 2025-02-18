import { useState, useMemo } from 'react';
import { /* BarChart, */ Calendar, Trophy, Clock } from 'lucide-react';
import type { PomodoroSession, PomodoroStats } from '../types/pomodoro';

interface PomodoroStatsProps {
  sessions: PomodoroSession[];
  stats: PomodoroStats;
}

export default function PomodoroStats({ sessions, stats }: PomodoroStatsProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  // 计算今日数据
  const todayStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(session => 
      new Date(session.startTime).setHours(0, 0, 0, 0) === today &&
      session.completed
    );

    return {
      focusCount: todaySessions.filter(s => s.type === 'focus').length,
      totalMinutes: todaySessions.reduce((acc, s) => acc + s.duration, 0),
      completedCount: todaySessions.length
    };
  }, [sessions]);

  // 计算过去7天的数据
  const weeklyStats = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }).reverse();

    return days.map(day => {
      const daySessions = sessions.filter(session => 
        new Date(session.startTime).setHours(0, 0, 0, 0) === day &&
        session.completed &&
        session.type === 'focus'
      );

      return {
        date: new Date(day),
        count: daySessions.length,
        minutes: daySessions.reduce((acc, s) => acc + s.duration, 0)
      };
    });
  }, [sessions]);

  // 计算最长专注链
  const longestStreak = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate: number | null = null;

    const focusSessions = sessions
      .filter(s => s.type === 'focus' && s.completed)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    focusSessions.forEach(session => {
      const sessionDate = new Date(session.startTime).setHours(0, 0, 0, 0);
      
      if (lastDate === null || sessionDate === lastDate) {
        currentStreak++;
      } else if (sessionDate - lastDate === 86400000) { // 1天的毫秒数
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = sessionDate;
    });

    return maxStreak;
  }, [sessions]);

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.filter(session => 
      new Date(session.startTime).toDateString() === today
    );
  };

  const todaySessions = getTodaySessions();
  const totalFocusMinutes = todaySessions
    .filter(s => s.type === 'focus' && s.completed)
    .reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-6">
      {/* 今日概览 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">今日专注</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">专注时间</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalFocusMinutes}分钟
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">完成番茄数</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {todaySessions.filter(s => s.type === 'focus' && s.completed).length}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">最长专注链</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {longestStreak}天
            </div>
          </div>
        </div>
      </div>

      {/* 成就系统 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">成就</h3>
        <div className="space-y-4">
          {stats.achievements.map(achievement => (
            <div 
              key={achievement.id}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className={`p-2 rounded-full ${
                achievement.completed 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{achievement.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {achievement.description}
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {achievement.progress}/{achievement.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 近期记录 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">专注记录</h3>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {mode === 'day' ? '日' : mode === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {todaySessions
            .filter(session => session.completed)
            .map(session => (
              <div
                key={session.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className={`p-2 rounded-full ${
                  session.type === 'focus'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {session.type === 'focus' ? '专注' : session.type === 'shortBreak' ? '短休息' : '长休息'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(session.startTime).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {session.duration}分钟
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* 周数据图表 */}
      <div className="mt-6">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          近7天专注情况
        </div>
        <div className="h-32 flex items-end justify-between gap-1">
          {weeklyStats.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full relative">
                <div
                  className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t"
                  style={{
                    height: `${(day.count / Math.max(...weeklyStats.map(d => d.count))) * 100}%`,
                    minHeight: day.count ? '4px' : '0'
                  }}
                />
                {day.count > 0 && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
                    {day.count}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {day.date.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 激励文案 */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        {todayStats.focusCount === 0 ? (
          '今天还没有完成番茄钟，开始专注吧！'
        ) : todayStats.focusCount >= 8 ? (
          '太棒了！今天的专注非常充实！'
        ) : (
          `已经完成 ${todayStats.focusCount} 个番茄钟，继续加油！`
        )}
      </div>
    </div>
  );
} 