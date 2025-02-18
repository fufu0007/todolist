'use client';

import { useMemo } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { Todo } from '../types/todo';
import type { PomodoroSession } from '../types/pomodoro';

interface DayTimelineProps {
  todos: Todo[];
  sessions: PomodoroSession[];
  date?: Date;
}

export default function DayTimeline({ todos, sessions = [], date = new Date() }: DayTimelineProps) {
  const timelineData = useMemo(() => {
    const targetDate = new Date(date).setHours(0, 0, 0, 0);

    // 获取当日的所有事件
    const events = [
      // 任务事件
      ...todos
        .filter(todo => 
          new Date(todo.createdAt).setHours(0, 0, 0, 0) === targetDate
        )
        .map(todo => ({
          type: 'todo' as const,
          time: new Date(todo.createdAt),
          data: todo,
        })),
      
      // 专注事件
      ...sessions
        .filter(session => 
          session.type === 'focus' &&
          new Date(session.startTime).setHours(0, 0, 0, 0) === targetDate
        )
        .map(session => ({
          type: 'focus' as const,
          time: new Date(session.startTime),
          data: session,
        }))
    ].sort((a, b) => a.time.getTime() - b.time.getTime());

    return events;
  }, [todos, sessions, date]);

  if (timelineData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">今日时间线</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          暂无活动记录
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">今日时间线</h3>
      
      <div className="relative pl-8">
        {/* 时间线 */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
        
        {timelineData.map((event, index) => (
          <div key={index} className="mb-6 relative">
            {/* 时间点 */}
            <div className="absolute left-[-20px] w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              {event.type === 'todo' ? (
                event.data.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : event.data.deleted ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                )
              ) : (
                <Clock className="w-5 h-5 text-orange-500" />
              )}
            </div>

            {/* 事件内容 */}
            <div className={`
              pl-4 py-3 rounded-lg
              ${event.type === 'todo' 
                ? event.data.completed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : event.data.deleted
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-orange-50 dark:bg-orange-900/20'
              }
            `}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">
                    {event.type === 'todo' 
                      ? event.data.title
                      : '专注时间'
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {event.type === 'todo' 
                      ? event.data.completed
                        ? '已完成'
                        : event.data.deleted
                          ? '已删除'
                          : '进行中'
                      : `持续 ${event.data.duration} 分钟`
                    }
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {event.time.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 