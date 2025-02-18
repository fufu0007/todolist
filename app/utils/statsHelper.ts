import { Todo } from '../types/todo';
import { Stats, DailyStats } from '../types/stats';

// 获取指定日期的开始时间
const getDateStart = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// 获取指定日期的结束时间
const getDateEnd = (date: Date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// 计算日期统计数据
export const calculateDailyStats = (
  todos: Todo[],
  focusMinutes: number,
  date: Date
): DailyStats => {
  const start = getDateStart(date);
  const end = getDateEnd(date);

  const dayTodos = todos.filter(todo => {
    const todoDate = todo.reminder ? new Date(todo.reminder) : null;
    return todoDate && todoDate >= start && todoDate <= end;
  });

  return {
    date: date.toISOString().split('T')[0],
    completedTasks: dayTodos.filter(t => t.completed).length,
    totalTasks: dayTodos.length,
    focusTime: focusMinutes
  };
};

// 计算完整统计数据
export const calculateStats = (
  todos: Todo[],
  focusMinutes: number
): Stats => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 计算今日数据
  const todayStats = calculateDailyStats(todos, focusMinutes, today);
  const yesterdayStats = calculateDailyStats(todos, 0, yesterday);

  // 计算周数据
  const weeklyStats: DailyStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    weeklyStats.push(calculateDailyStats(todos, i === 0 ? focusMinutes : 0, date));
  }

  // 计算趋势
  const trend = yesterdayStats.totalTasks === 0 ? 0 :
    ((todayStats.totalTasks - yesterdayStats.totalTasks) / yesterdayStats.totalTasks) * 100;

  return {
    today: {
      tasks: {
        total: todayStats.totalTasks,
        completed: todayStats.completedTasks,
        rate: todayStats.totalTasks === 0 ? 0 :
          (todayStats.completedTasks / todayStats.totalTasks) * 100
      },
      focusTime: todayStats.focusTime,
      trend
    },
    weekly: weeklyStats
  };
}; 