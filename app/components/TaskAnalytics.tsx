'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Todo } from '../types/todo';
import type { PomodoroSession } from '../types/pomodoro';

interface TaskAnalyticsProps {
  todos: Todo[];
  sessions?: PomodoroSession[];
}

export default function TaskAnalytics({ todos, sessions = [] }: TaskAnalyticsProps) {
  const analytics = useMemo(() => {
    // 获取最近7天的数据
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // 生成图表数据
    const chartData = days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayTodos = todos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        return todoDate >= dayStart && todoDate <= dayEnd;
      });

      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= dayStart && sessionDate <= dayEnd &&
               session.type === 'focus' && session.completed;
      });

      return {
        date: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        tasks: dayTodos.length,
        completed: dayTodos.filter(todo => todo.completed).length,
        focusMinutes: daySessions.reduce((sum, session) => sum + session.duration, 0)
      };
    });

    // 计算任务优先级分布
    const priorityDistribution = todos.reduce((acc, todo) => {
      if (!todo.deleted) {
        acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      chartData,
      priorityDistribution
    };
  }, [todos, sessions]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">任务分析</h3>

      {/* 图表区域 */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.chartData}>
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar yAxisId="left" dataKey="tasks" name="总任务" fill="#60A5FA" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="completed" name="已完成" fill="#34D399" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="focusMinutes" name="专注分钟" fill="#F97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 优先级分布 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">高优先级</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {analytics.priorityDistribution.high || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">中优先级</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {analytics.priorityDistribution.medium || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">低优先级</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {analytics.priorityDistribution.low || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 效率提示 */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">效率建议</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {analytics.priorityDistribution.high > analytics.priorityDistribution.low ? 
                '当前高优先级任务较多，建议优先处理紧急任务。' :
                '任务分配较为合理，继续保持良好的工作节奏。'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 