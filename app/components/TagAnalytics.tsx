'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Tag, TrendingUp, TrendingDown } from 'lucide-react';
import type { Todo } from '../types/todo';

interface TagAnalyticsProps {
  todos: Todo[];
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
];

export default function TagAnalytics({ todos }: TagAnalyticsProps) {
  const analytics = useMemo(() => {
    // 获取所有标签的统计
    const tagStats = todos.reduce((acc, todo) => {
      if (!todo.deleted && todo.tags) {
        todo.tags.forEach(tag => {
          if (!acc[tag]) {
            acc[tag] = {
              total: 0,
              completed: 0,
              name: tag
            };
          }
          acc[tag].total += 1;
          if (todo.completed) {
            acc[tag].completed += 1;
          }
        });
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number; name: string }>);

    // 转换为图表数据
    const chartData = Object.values(tagStats)
      .map(stat => ({
        name: stat.name,
        value: stat.total,
        completionRate: (stat.completed / stat.total) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // 只显示前8个标签

    // 计算标签使用趋势
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentTags = todos.filter(todo => 
      new Date(todo.createdAt) >= weekAgo && !todo.deleted
    ).reduce((acc, todo) => {
      if (todo.tags) {
        todo.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // 获取增长最快的标签
    const trendingTags = Object.entries(recentTags)
      .map(([tag, count]) => ({
        tag,
        count,
        total: tagStats[tag]?.total || count
      }))
      .sort((a, b) => (b.count / b.total) - (a.count / a.total))
      .slice(0, 3);

    return {
      chartData,
      trendingTags
    };
  }, [todos]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">标签分析</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 饼图 */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {analytics.chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-lg">
                        <p className="text-sm font-medium">{data.name}</p>
                        <p className="text-sm text-gray-500">数量: {data.value}</p>
                        <p className="text-sm text-gray-500">
                          完成率: {data.completionRate.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 标签列表 */}
        <div className="space-y-4">
          <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            热门标签
          </div>
          {analytics.chartData.map((tag, index) => (
            <div
              key={tag.name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" style={{ color: COLORS[index % COLORS.length] }} />
                <span className="font-medium">{tag.name}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tag.value} 个任务
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 趋势标签 */}
      <div className="mt-6">
        <div className="font-medium text-gray-700 dark:text-gray-300 mb-4">
          近期趋势
        </div>
        <div className="grid grid-cols-3 gap-4">
          {analytics.trendingTags.map((tag, index) => (
            <div
              key={tag.tag}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {tag.tag}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {((tag.count / tag.total) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-blue-600/60 dark:text-blue-400/60">
                增长率
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 