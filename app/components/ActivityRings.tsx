'use client';

import { useMemo } from 'react';
import type { Todo } from '../types/todo';
import type { PomodoroSession } from '../types/pomodoro';

interface ActivityRingsProps {
  size: number;
  data: {
    todos: number;
    focus: number;
    sessions: number;
  };
}

export default function ActivityRings({ size, data }: ActivityRingsProps) {
  const rings = useMemo(() => {
    // 检查是否有任何数据
    const hasData = data.todos > 0 || data.sessions > 0;
    
    // 如果没有数据，所有环都返回0
    if (!hasData) {
      return [
        { rate: 0, color: 'red', empty: true },
        { rate: 0, color: 'green', empty: true },
        { rate: 0, color: 'blue', empty: true }
      ];
    }

    // 有数据时的正常计算
    const completedRate = data.todos > 0 
      ? (data.todos / data.todos) * 100 
      : 0;

    const focusMinutes = data.sessions > 0 ? data.sessions : 0;
    const focusRate = Math.min((focusMinutes / 120) * 100, 100);

    const sessionCount = data.sessions > 0 ? 1 : 0;
    const sessionRate = Math.min((sessionCount / 8) * 100, 100);

    return [
      { rate: completedRate, color: 'red', empty: false },
      { rate: focusRate, color: 'green', empty: false },
      { rate: sessionRate, color: 'blue', empty: false }
    ];
  }, [data.todos, data.sessions]);

  const center = size / 2;
  const strokeWidth = size * 0.15;
  const radius = (size / 2) - (strokeWidth / 2);

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
        style={{ opacity: 0.8 }}
      >
        {/* 背景圆环 */}
        {rings.map((_, index) => {
          const r = radius - (index * (strokeWidth + 1));
          return (
            <circle
              key={`bg-${index}`}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-gray-100 dark:text-gray-800"
              opacity={0.3}
            />
          );
        })}

        {/* 进度圆环 */}
        {rings.map((ring, index) => {
          const r = radius - (index * (strokeWidth + 1));
          const circumference = 2 * Math.PI * r;
          const strokeDashoffset = circumference - (circumference * ring.rate) / 100;
          
          // 如果是空的，不显示颜色渐变
          const strokeColor = ring.empty 
            ? "currentColor" 
            : `url(#ring-gradient-${index})`;
          
          return (
            <circle
              key={`ring-${index}`}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={ring.empty ? "text-gray-200 dark:text-gray-700" : ""}
              style={{
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
          );
        })}

        {/* 只在非空时添加渐变定义 */}
        <defs>
          {!rings[0].empty && rings.map((_, index) => (
            <linearGradient
              key={`gradient-${index}`}
              id={`ring-gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={getRingStartColor(index)} stopOpacity="0.9" />
              <stop offset="100%" stopColor={getRingEndColor(index)} stopOpacity="0.9" />
            </linearGradient>
          ))}
        </defs>
      </svg>

      {/* 悬浮提示 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs whitespace-nowrap">
          <div className="text-red-500">完成率: {rings[0].rate.toFixed(0)}%</div>
          <div className="text-green-500">专注: {(rings[1].rate * 1.2).toFixed(0)}分钟</div>
          <div className="text-blue-500">次数: {(rings[2].rate * 0.08).toFixed(0)}/8</div>
        </div>
      </div>
    </div>
  );
}

// 辅助函数
function getRingStartColor(index: number): string {
  const colors = [
    '#FF453A', // 红色起始
    '#30D158', // 绿色起始
    '#0A84FF', // 蓝色起始
  ];
  return colors[index] || colors[0];
}

function getRingEndColor(index: number): string {
  const colors = [
    '#FF9F0A', // 红色结束
    '#32D74B', // 绿色结束
    '#5E5CE6', // 蓝色结束
  ];
  return colors[index] || colors[0];
} 