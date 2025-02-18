'use client';

import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { Todo } from '../types/todo';
import type { PomodoroSession } from '../types/pomodoro';

interface TaskStatsProps {
  todos: Todo[];
  sessions: PomodoroSession[];
}

interface DailyStats {
  active: number;
  completed: number;
  total: number;
  completionRate: number;
}

interface StatsChanges {
  active: number;
  completed: number;
  completionRate: number;
}

type TimeRange = '今日' | '本周' | '本月';

export default function TaskStats({ todos, sessions }: TaskStatsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('本周');

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let compareDate: Date;

    // 根据选择的时间范围设置起始时间
    switch (timeRange) {
      case '今日':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        compareDate = new Date(startDate);
        compareDate.setDate(compareDate.getDate() - 1);
        break;
      case '本周':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // 设置到本周日
        compareDate = new Date(startDate);
        compareDate.setDate(compareDate.getDate() - 7);
        break;
      case '本月':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        compareDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
    }

    // 过滤出时间范围内的任务和会话
    const periodTodos = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return todoDate >= startDate && todoDate <= now && !todo.deleted;
    });

    const periodSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= now;
    });

    // 计算比较时间段的数据
    const comparePeriodTodos = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return todoDate >= compareDate && todoDate < startDate && !todo.deleted;
    });

    // 当前时间段的统计
    const currentStats = {
      active: periodTodos.filter(todo => !todo.completed).length,
      completed: periodTodos.filter(todo => todo.completed).length,
      total: periodTodos.length,
      focusMinutes: periodSessions.reduce((acc, session) => acc + session.duration, 0)
    };
    currentStats.completionRate = currentStats.total > 0 
      ? (currentStats.completed / currentStats.total) * 100 
      : 0;

    // 比较时间段的统计
    const compareStats = {
      active: comparePeriodTodos.filter(todo => !todo.completed).length,
      completed: comparePeriodTodos.filter(todo => todo.completed).length,
      total: comparePeriodTodos.length,
      focusMinutes: sessions
        .filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= compareDate && sessionDate < startDate;
        })
        .reduce((acc, session) => acc + session.duration, 0)
    };

    // 计算变化率
    const changes = {
      active: compareStats.active > 0 
        ? ((currentStats.active - compareStats.active) / compareStats.active) * 100 
        : 0,
      completed: compareStats.completed > 0 
        ? ((currentStats.completed - compareStats.completed) / compareStats.completed) * 100 
        : 0,
      completionRate: compareStats.total > 0 
        ? currentStats.completionRate - (compareStats.completed / compareStats.total * 100)
        : 0,
      focusMinutes: compareStats.focusMinutes > 0
        ? ((currentStats.focusMinutes - compareStats.focusMinutes) / compareStats.focusMinutes) * 100
        : 0
    };

    return { current: currentStats, changes };
  }, [todos, sessions, timeRange]);

  return (
    <div className="space-y-4">
      {/* 时间范围选择 */}
      <div className="flex justify-end gap-2">
        {(['今日', '本周', '本月'] as TimeRange[]).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 text-sm rounded-full transition-colors
              ${timeRange === range 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {/* 待完成任务 */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4">
          <div className="text-4xl font-bold text-blue-500 mb-1">
            {stats.current.active}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            待完成任务
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            {stats.changes.active === 0 ? (
              <span>较上个{timeRange.slice(1)}持平</span>
            ) : (
              <>
                {stats.changes.active > 0 ? (
                  <TrendingUp className="w-3 h-3 text-red-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-green-500" />
                )}
                <span className={stats.changes.active > 0 ? 'text-red-500' : 'text-green-500'}>
                  较上个{timeRange.slice(1)} {Math.abs(stats.changes.active).toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* 已完成任务 */}
        <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
          <div className="text-4xl font-bold text-green-500 mb-1">
            {stats.current.completed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            已完成任务
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            {stats.changes.completed === 0 ? (
              <span>较上个{timeRange.slice(1)}持平</span>
            ) : (
              <>
                {stats.changes.completed > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={stats.changes.completed > 0 ? 'text-green-500' : 'text-red-500'}>
                  较上个{timeRange.slice(1)} {Math.abs(stats.changes.completed).toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* 完成率 */}
        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4">
          <div className="text-4xl font-bold text-purple-500 mb-1">
            {stats.current.completionRate.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            完成率
          </div>
          <div className="text-xs text-purple-500">
            继续保持！
          </div>
        </div>

        {/* 专注时间 */}
        <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-4">
          <div className="text-4xl font-bold text-orange-500 mb-1">
            {stats.current.focusMinutes}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            专注分钟
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            {stats.changes.focusMinutes === 0 ? (
              <span>较上个{timeRange.slice(1)}持平</span>
            ) : (
              <>
                {stats.changes.focusMinutes > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={stats.changes.focusMinutes > 0 ? 'text-green-500' : 'text-red-500'}>
                  较上个{timeRange.slice(1)} {Math.abs(stats.changes.focusMinutes).toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 