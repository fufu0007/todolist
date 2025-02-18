'use client';

import { useState, useCallback } from 'react';
import { useTodo } from '../contexts/TodoContext';
import { Plus } from 'lucide-react';
import type { TodoInput } from '../types/todo';

interface StatsCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  color: 'red' | 'green' | 'blue' | 'purple';
  selectedTag?: string;
}

const colorClasses = {
  red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
} as const;

export default function StatsCard({ 
  title, 
  value, 
  unit = '', 
  icon, 
  color,
  selectedTag 
}: StatsCardProps) {
  const { addTodo } = useTodo();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const handleQuickAdd = useCallback(() => {
    if (!quickAddTitle.trim()) return;

    const newTodo: TodoInput = {
      title: quickAddTitle,
      priority: 'medium',
      tags: selectedTag ? [selectedTag] : [],
      completed: false,
      subTasks: [],
      description: '',
      category: undefined,
      dueDate: undefined,
      time: undefined,
      location: undefined,
      parentId: undefined,
      isGroup: false,
      reminderSettings: undefined
    };

    addTodo(newTodo);
    setQuickAddTitle('');
    setShowQuickAdd(false);
  }, [quickAddTitle, selectedTag, addTodo]);

  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {selectedTag && (
          <button
            onClick={() => setShowQuickAdd(true)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="text-2xl font-bold">
        {value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </div>

      {showQuickAdd && (
        <div className="mt-2">
          <input
            type="text"
            value={quickAddTitle}
            onChange={e => setQuickAddTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuickAdd();
              } else if (e.key === 'Escape') {
                setShowQuickAdd(false);
              }
            }}
            placeholder={`添加 ${selectedTag} 任务...`}
            className="w-full px-2 py-1 text-sm bg-white/10 rounded-lg 
              placeholder-current placeholder-opacity-50 outline-none 
              focus:bg-white/20 transition-colors"
            autoFocus
          />
        </div>
      )}
    </div>
  );
} 