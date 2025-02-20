'use client';

import { useMemo } from 'react';
import type { Todo } from '../types/todo';
import type { PomodoroSession } from '../types/pomodoro';

interface ActivityRingsProps {
  size: number;
  data: {
    todos: number;
    sessions: number;
    focus: number;
  };
}

export default function ActivityRings({ size, data }: ActivityRingsProps) {
  const rings = useMemo(() => {
    // 检查是否有任何数据
    const hasData = data.todos > 0 || data.sessions > 0 || data.focus > 0;
    
    // 如果没有数据，所有环都返回0
    if (!hasData) {
      return [
        { rate: 0, color: 'red', empty: true },
        { rate: 0, color: 'green', empty: true },
        { rate: 0, color: 'blue', empty: true }
      ];
    }

    return [
      { rate: data.todos * 100, color: 'red', empty: false },
      { rate: data.focus * 100, color: 'green', empty: false },
      { rate: data.sessions * 100, color: 'blue', empty: false }
    ];
  }, [data]);

  const center = size / 2;
  const strokeWidth = size * 0.1;
  const radius = size * 0.35;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((ring, index) => {
        const r = radius - (strokeWidth * 1.2 * index);
        const circumference = 2 * Math.PI * r;
        const dashArray = `${(ring.rate * circumference) / 100} ${circumference}`;
        
        return (
          <g key={ring.color} className="transition-all duration-500">
            {/* 背景圆环 */}
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={`var(--${ring.color}-100)`}
              strokeWidth={strokeWidth}
              className="dark:opacity-20"
            />
            {/* 数据圆环 */}
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={`var(--${ring.color}-500)`}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
              className={ring.empty ? 'opacity-30' : ''}
              style={{
                '--red-100': '#fee2e2',
                '--red-500': '#ef4444',
                '--green-100': '#dcfce7',
                '--green-500': '#22c55e',
                '--blue-100': '#dbeafe',
                '--blue-500': '#3b82f6',
              } as React.CSSProperties}
            />
          </g>
        );
      })}
    </svg>
  );
} 