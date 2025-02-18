'use client';

import React, { useState, useRef } from 'react';
import { Plus, AlertTriangle, Clock, ArrowDown, Tags } from 'lucide-react';
import type { Todo } from '../types/todo';

interface TaskInputProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'order' | 'createdAt' | 'deleted'>) => void;
}

const TaskInput = ({ onAddTodo }: TaskInputProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const priorityConfig = {
    high: {
      icon: AlertTriangle,
      label: '高优先级',
      className: 'bg-red-50 text-red-600 hover:bg-red-100'
    },
    medium: {
      icon: Clock,
      label: '中优先级',
      className: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
    },
    low: {
      icon: ArrowDown,
      label: '低优先级',
      className: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    }
  } as const;

  const defaultTags = ['工作', '学习', '生活'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      priority,
      completed: false,
      tags: selectedTags,
      subTasks: [],
      description: '',
      category: undefined,
      dueDate: undefined,
      time: undefined,
      location: undefined,
      parentId: undefined,
      isGroup: false,
      reminderSettings: undefined
    });

    setTitle('');
    setPriority('medium');
    setSelectedTags([]);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">新建任务</h2>
      <div className="space-y-4">
        <div className="flex gap-3">
          {Object.entries(priorityConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPriority(key as 'low' | 'medium' | 'high')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                  rounded-xl text-sm font-medium transition-colors ${
                    priority === key 
                      ? config.className
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入任务内容，按回车快速创建..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 
              rounded-xl text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2
              w-8 h-8 flex items-center justify-center
              bg-blue-500 text-white rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-opacity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Tags className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {defaultTags.map(tagName => (
              <button
                key={tagName}
                type="button"
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tagName) 
                    ? prev.filter(t => t !== tagName)
                    : [...prev, tagName]
                )}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedTags.includes(tagName)
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                {tagName}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          当前选择：<span className="text-yellow-500">中优先级</span>
          {selectedTags.length > 0 && (
            <> · <span className="text-blue-500">{selectedTags.join(', ')}</span></>
          )}
        </div>
        
        <div className="text-sm text-gray-400">
          提示：选择优先级并输入任务内容，按回车键快速创建任务
        </div>
      </div>
    </div>
  );
};

export default TaskInput; 