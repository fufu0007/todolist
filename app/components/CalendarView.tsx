import { useState } from 'react';
import type { Todo } from '../types/todo';

interface CalendarViewProps {
  todos: Todo[];
  viewMode: 'month' | 'week';
  onTodoClick: (todo: Todo) => void;
}

export default function CalendarView({ todos, viewMode, onTodoClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDayTodos = (day: number) => {
    const targetDate = new Date(currentDate);
    targetDate.setDate(day);
    const today = new Date();

    // 如果目标日期不是今天，则不显示任务
    if (targetDate.toDateString() !== today.toDateString()) {
      return [];
    }

    return todos.filter(todo => {
      const todoDate = todo.time?.date ? new Date(todo.time.date) : null;
      return todoDate?.getDate() === day &&
             todoDate.getMonth() === currentDate.getMonth() &&
             todoDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const days = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const weeks = Math.ceil((days + firstDay) / 7);

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const renderTodoItem = (todo: Todo, isCompact: boolean = true) => {
    const priorityIndicators = {
      high: '●',
      medium: '●',
      low: '●'
    };

    return (
      <div
        key={todo.id}
        onClick={() => onTodoClick(todo)}
        className={`group flex items-center gap-1.5 ${
          isCompact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'
        } rounded cursor-pointer transition-all hover:translate-x-0.5 ${
          todo.completed
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : todo.priority === 'high'
              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : todo.priority === 'medium'
                ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-50 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400'
        }`}
      >
        <span className={`text-[0.6em] ${
          todo.completed
            ? 'text-green-500 dark:text-green-400'
            : todo.priority === 'high'
              ? 'text-red-500 dark:text-red-400'
              : todo.priority === 'medium'
                ? 'text-yellow-500 dark:text-yellow-400'
                : 'text-gray-400 dark:text-gray-500'
        }`}>
          {priorityIndicators[todo.priority]}
        </span>
        <span className="truncate flex-1">{todo.title}</span>
        {todo.completed && (
          <svg className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    );
  };

  const renderMonthView = () => {
    const today = new Date();
    const isToday = (day: number) => {
      return today.getDate() === day &&
             today.getMonth() === currentDate.getMonth() &&
             today.getFullYear() === currentDate.getFullYear();
    };

    return (
      <div className="grid grid-cols-7 gap-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-sm text-gray-500 dark:text-gray-400 py-2 font-medium">
            {day}
          </div>
        ))}

        {Array.from({ length: weeks * 7 }).map((_, index) => {
          const day = index - firstDay + 1;
          const isCurrentMonth = day > 0 && day <= days;
          const dayTodos = isCurrentMonth ? getDayTodos(day) : [];
          const isTodayDate = isCurrentMonth && isToday(day);
          const isWeekend = index % 7 === 0 || index % 7 === 6;

          return (
            <div
              key={index}
              className={`min-h-[100px] border dark:border-gray-700 rounded-lg p-2 transition-all hover:shadow-sm ${
                isCurrentMonth 
                  ? isTodayDate
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 ring-2 ring-blue-200 dark:ring-blue-800 ring-opacity-50'
                    : isWeekend
                      ? 'bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-transparent opacity-50'
              }`}
            >
              {isCurrentMonth && (
                <>
                  <div className={`text-right text-sm ${
                    isTodayDate
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : isWeekend
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {day}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayTodos.slice(0, 3).map(todo => renderTodoItem(todo))}
                    {dayTodos.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-0.5 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        +{dayTodos.length - 3} 更多
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const today = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return (
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + index);
          const dayTodos = getDayTodos(date.getDate());
          const isToday = date.toDateString() === today.toDateString();
          const isWeekend = index === 0 || index === 6;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg transition-all hover:shadow-sm ${
                isToday 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 ring-2 ring-blue-200 dark:ring-blue-800 ring-opacity-50' 
                  : isWeekend
                    ? 'bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`font-medium ${
                  isToday 
                    ? 'text-blue-600 dark:text-blue-400'
                    : isWeekend
                      ? 'text-gray-400 dark:text-gray-500'
                      : ''
                }`}>
                  {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                </span>
                <span className={`text-sm ${
                  isToday 
                    ? 'text-blue-600 dark:text-blue-400'
                    : isWeekend
                      ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {date.getDate()}日
                </span>
              </div>
              <div className="space-y-2">
                {dayTodos.map(todo => renderTodoItem(todo, false))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h3 className="text-lg font-semibold text-center">
            {currentDate.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              ...(viewMode === 'week' && { week: 'long' })
            })}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            {currentDate.toLocaleString('default', { year: 'numeric' })}年
          </div>
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  );
} 