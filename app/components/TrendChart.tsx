import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { PomodoroSession } from '../types/pomodoro';

interface TrendChartProps {
  sessions: PomodoroSession[];
  days?: number;
}

export default function TrendChart({ sessions, days = 7 }: TrendChartProps) {
  const getDailyStats = () => {
    const stats = new Map<string, { date: string, minutes: number, count: number }>();
    const now = new Date();
    
    // 初始化最近n天的数据
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      stats.set(dateStr, { date: dateStr, minutes: 0, count: 0 });
    }

    // 统计数据
    sessions.forEach(session => {
      if (session.completed && session.type === 'focus') {
        const dateStr = new Date(session.startTime).toISOString().split('T')[0];
        if (stats.has(dateStr)) {
          const current = stats.get(dateStr)!;
          stats.set(dateStr, {
            ...current,
            minutes: current.minutes + session.duration,
            count: current.count + 1
          });
        }
      }
    });

    return Array.from(stats.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const data = getDailyStats();

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { 
              month: 'numeric', 
              day: 'numeric' 
            })}
          />
          <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
          <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'minutes' ? `${value}分钟` : `${value}个`,
              name === 'minutes' ? '专注时间' : '完成番茄数'
            ]}
            labelFormatter={(label) => new Date(label).toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric'
            })}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="minutes"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="minutes"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="count"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="count"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 