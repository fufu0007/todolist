'use client';

import { useState, useCallback, useRef } from 'react';
import { Plus, AlertTriangle, Clock, Tag, Flag, Circle, X, Briefcase, BookOpen, Coffee } from 'lucide-react';
import type { Todo, SubTask } from '../types/todo';

interface TaskInputProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'deleted'>) => void;
}

const PRESET_TAGS = [
  { 
    name: '工作', 
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Briefcase className="w-3 h-3" />
  },
  { 
    name: '学习', 
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    icon: <BookOpen className="w-3 h-3" />
  },
  { 
    name: '生活', 
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    icon: <Coffee className="w-3 h-3" />
  }
] as const;

export default function TaskInput({ onAddTodo }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      priority,
      completed: false,
      subTasks: subTasks.length > 0 ? subTasks.map(task => ({
        id: crypto.randomUUID(),
        title: task.title,
        completed: false,
        createdAt: new Date().toISOString()
      })) : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      order: 0
    });

    setTitle('');
    setPriority('medium');
    setSubTasks([]);
    setNewSubTask('');
    setSelectedTags([]);
    inputRef.current?.focus();
  }, [title, priority, subTasks, selectedTags, onAddTodo]);

  const toggleTag = useCallback((tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    );
  }, []);

  const handleAddSubTask = useCallback(() => {
    if (!newSubTask.trim()) return;
    setSubTasks(prev => [...prev, {
      id: crypto.randomUUID(),
      title: newSubTask.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }]);
    setNewSubTask('');
  }, [newSubTask]);

  const handleRemoveSubTask = useCallback((index: number) => {
    setSubTasks(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">新建任务</h2>
      
      {/* 任务输入框 - 移到最上方并增加视觉重要性 */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative group">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="输入任务内容，按回车键快速创建..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 
              rounded-xl border-2 border-gray-200 dark:border-gray-600
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
              dark:focus:ring-blue-400/20 dark:focus:border-blue-400
              outline-none transition-all group-hover:border-gray-300
              dark:group-hover:border-gray-500 text-base"
          />
          {title.trim() && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 
              opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setTitle('')}
                className="p-1.5 text-gray-400 hover:text-gray-600 
                  dark:hover:text-gray-300 rounded-full hover:bg-gray-100
                  dark:hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => handleSubmit()}
          disabled={!title.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl
            hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all shadow-sm hover:shadow-md disabled:shadow-none
            flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          创建
        </button>
      </div>

      {/* 优先级和标签选择区域 */}
      <div className="space-y-4">
        {/* 优先级选择 */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPriority('high')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              font-medium transition-all ${
                priority === 'high' 
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 ring-2 ring-red-200 dark:ring-red-800' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <AlertTriangle className="w-4 h-4" />
            高优先级
          </button>
          <button
            type="button"
            onClick={() => setPriority('medium')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              font-medium transition-all ${
                priority === 'medium' 
                  ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 ring-2 ring-yellow-200 dark:ring-yellow-800' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <Clock className="w-4 h-4" />
            中优先级
          </button>
          <button
            type="button"
            onClick={() => setPriority('low')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              font-medium transition-all ${
                priority === 'low' 
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/20 ring-2 ring-green-200 dark:ring-green-800' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <Flag className="w-4 h-4" />
            低优先级
          </button>
        </div>

        {/* 标签选择 */}
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map(tag => (
            <button
              key={tag.name}
              onClick={() => toggleTag(tag.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                font-medium transition-all ${
                  selectedTags.includes(tag.name)
                    ? `${tag.color} ring-2 ring-current ring-opacity-20`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {tag.icon}
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* 子任务区域 */}
      <div className="mt-6 space-y-3">
        {/* 已添加的子任务列表 */}
        {subTasks.map((subTask, index) => (
          <div key={index} 
            className="flex items-center gap-3 px-4 py-2 bg-gray-50 
              dark:bg-gray-700/30 rounded-xl group hover:bg-gray-100
              dark:hover:bg-gray-700/50 transition-colors"
          >
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
              {subTask.title}
            </span>
            <button
              onClick={() => handleRemoveSubTask(index)}
              className="p-1.5 text-gray-400 hover:text-red-500 
                transition-colors rounded-lg opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* 子任务输入框 */}
        <div className="flex items-center gap-3">
          <Circle className="w-4 h-4 text-gray-400" />
          <div className="flex-1 relative group">
            <input
              type="text"
              value={newSubTask}
              onChange={e => setNewSubTask(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddSubTask();
                }
              }}
              placeholder="添加子任务..."
              className="w-full px-4 py-2 text-sm bg-gray-50 
                dark:bg-gray-700/50 rounded-xl border-2 border-gray-200 
                dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 
                focus:border-blue-500 dark:focus:ring-blue-400/20 
                dark:focus:border-blue-400 outline-none transition-all
                group-hover:border-gray-300 dark:group-hover:border-gray-500"
            />
            {newSubTask.trim() && (
              <button
                onClick={handleAddSubTask}
                className="absolute right-2 top-1/2 -translate-y-1/2 
                  p-1.5 text-blue-500 hover:text-blue-600 
                  rounded-lg opacity-0 group-hover:opacity-100
                  transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 已选标签显示 */}
      {selectedTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedTags.map(tagName => {
            const tag = PRESET_TAGS.find(t => t.name === tagName);
            return (
              <span
                key={tagName}
                className={`flex items-center gap-2 px-3 py-1.5 
                  rounded-xl text-sm ${tag?.color}`}
              >
                {tag?.icon}
                {tagName}
                <button
                  onClick={() => toggleTag(tagName)}
                  className="p-0.5 hover:text-red-500 transition-colors
                    rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* 提示文本 */}
      <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">Enter</kbd>
          <span>快速创建任务</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">Tab</kbd>
          <span>切换选项</span>
        </div>
      </div>
    </div>
  );
} 