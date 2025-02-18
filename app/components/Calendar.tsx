'use client';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
<<<<<<< HEAD
import ActivityRings from './ActivityRings';
import type { Todo } from '../types/todo';
import type { PomodoroSession } from '../types/pomodoro';
=======
import { zhCN } from 'date-fns/locale';
import ActivityRings from './ActivityRings';

// 添加类型定义
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
}

interface PomodoroSession {
  id: string;
  startTime: Date;
  duration: number;
  taskId?: string;
}
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08

interface CalendarProps {
  currentDate: Date;
  todos: Todo[];
  sessions: PomodoroSession[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

export default function Calendar({ currentDate, todos, sessions, onDateSelect, selectedDate }: CalendarProps) {
  // 确保 currentDate 是有效的 Date 对象
  const safeCurrentDate = currentDate instanceof Date ? currentDate : new Date();
  
  // 获取当月的所有日期
  const monthStart = startOfMonth(safeCurrentDate);
  const monthEnd = endOfMonth(safeCurrentDate);
  
  // 添加错误处理
  let daysInMonth: Date[] = [];
  try {
    daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  } catch (error) {
    console.error('Error generating calendar days:', error);
    // 如果出错，使用空数组
    daysInMonth = [];
  }

  // 获取指定日期的数据
  const getDateData = (date: Date) => {
    try {
      // 获取当天的待办事项
      const dayTodos = todos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        return format(todoDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      
      // 获取当天的专注记录
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return format(sessionDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      // 计算统计数据
      const completedTodos = dayTodos.filter(todo => todo.completed);
      const totalFocusTime = daySessions.reduce((acc, session) => acc + session.duration, 0);

      return {
        todos: dayTodos,
        sessions: daySessions,
        stats: {
          pending: dayTodos.length - completedTodos.length,  // 待完成
          completed: completedTodos.length,                  // 已完成
          focusTime: totalFocusTime,                        // 专注时间（分钟）
          focusCount: daySessions.length                    // 专注次数
        },
        isEmpty: dayTodos.length === 0 && daySessions.length === 0
      };
    } catch (error) {
      console.error('Error processing date data:', error);
      return {
        todos: [],
        sessions: [],
        stats: {
          pending: 0,
          completed: 0,
          focusTime: 0,
          focusCount: 0
        },
        isEmpty: true
      };
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        {/* 日历头部 */}
        <div className="flex justify-between items-center mb-4">
          <button className="p-2">
            <span className="sr-only">上个月</span>
          </button>
          <h2 className="text-xl font-semibold">
            {format(safeCurrentDate, 'yyyy年M月')}
          </h2>
          <button className="p-2">
            <span className="sr-only">下个月</span>
          </button>
        </div>

        {/* 星期表头 */}
        <div className="grid grid-cols-7 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="text-center text-sm text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map(date => {
            const dateData = getDateData(date);
            const isCurrentMonth = isSameMonth(date, safeCurrentDate);
            const isSelected = selectedDate && 
              format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

            return (
              <div
                key={date.toISOString()}
                className={`
                  p-2 rounded-lg cursor-pointer
                  ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}
                  ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  hover:bg-gray-100 dark:hover:bg-gray-700
                `}
                onClick={() => onDateSelect(date)}
              >
                <div className="text-center">
                  {format(date, 'd')}
                </div>
                {!dateData.isEmpty && (
                  <div className="mt-1">
                    <ActivityRings
                      size={24}
                      data={{
<<<<<<< HEAD
                        todos: dateData.stats.completed / Math.max(dateData.stats.completed + dateData.stats.pending, 1),
=======
                        todos: dateData.stats.completed / (dateData.stats.completed + dateData.stats.pending || 1),
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08
                        focus: Math.min(dateData.stats.focusTime / 240, 1), // 4小时为满值
                        sessions: Math.min(dateData.stats.focusCount / 8, 1) // 8次为满值
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 添加选中日期的详情卡片 */}
      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {format(selectedDate, 'yyyy年M月d日')}
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {/* 待办事项统计 */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-red-600 dark:text-red-400 text-sm mb-1">待办完成</div>
              <div className="text-2xl font-bold">
                {getDateData(selectedDate).stats.completed}/{getDateData(selectedDate).stats.completed + getDateData(selectedDate).stats.pending}
              </div>
            </div>

            {/* 专注时间统计 */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-green-600 dark:text-green-400 text-sm mb-1">专注时间</div>
              <div className="text-2xl font-bold">
                {Math.round(getDateData(selectedDate).stats.focusTime)}分钟
              </div>
            </div>

            {/* 专注次数统计 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-blue-600 dark:text-blue-400 text-sm mb-1">专注次数</div>
              <div className="text-2xl font-bold">
                {getDateData(selectedDate).stats.focusCount}次
              </div>
            </div>
          </div>

          {/* 当天的待办事项列表 */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              待办事项
            </h4>
            <div className="space-y-2">
              {getDateData(selectedDate).todos.length > 0 ? (
                getDateData(selectedDate).todos.map(todo => (
                  <div 
                    key={todo.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      readOnly
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                      {todo.title}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  没有待办事项
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}