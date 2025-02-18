import { BarChart3, Clock, Play, RotateCcw } from 'lucide-react';
import type { Todo } from '../types/todo';
import { useState } from 'react';

interface StatsCardProps {
  stats: {
    today: {
      tasks: {
        total: number;
        completed: number;
        rate: number;
      };
      focusTime: number;
      trend: number;
    };
  };
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
}

export default function StatsCard({ 
  stats, 
  todos,
  onAddTodo,
  onUpdateTodo
}: StatsCardProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedTag, setSelectedTag] = useState<string>('工作');

  if (!stats) return null;

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    onAddTodo({
      title: newTodo,
      priority: selectedPriority,
      tags: [selectedTag],
      completed: false,
      deleted: false,
      order: Date.now(),
      subTasks: []
    });
    setNewTodo('');
  };

  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-teal-50 dark:bg-teal-900/30 rounded-xl p-6">
          <h3 className="text-sm font-medium text-teal-800 dark:text-teal-200 mb-4">
            事件工作量
          </h3>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold text-teal-700 dark:text-teal-300">
                {stats.today.tasks.total}
              </div>
              <div className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                相比前天 {stats.today.trend > 0 ? '+' : ''}{stats.today.trend.toFixed(1)}%
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/30 rounded-xl p-6">
          <h3 className="text-sm font-medium text-rose-800 dark:text-rose-200 mb-4">
            番茄专注时长
          </h3>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold text-rose-700 dark:text-rose-300">
                {(stats.today.focusTime / 60).toFixed(1)}h
              </div>
              <div className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                完成率 {stats.today.tasks.rate.toFixed(1)}%
              </div>
            </div>
            <Clock className="w-8 h-8 text-rose-500" />
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：创建任务和任务列表 */}
        <div className="space-y-4">
          {/* 创建任务 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              创建新任务
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="输入任务内容..."
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              />
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority as 'low' | 'medium' | 'high')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                      selectedPriority === priority
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {priority === 'low' ? '低优先级' : priority === 'medium' ? '中优先级' : '高优先级'}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['工作', '学习', '生活', '购物', '重要', '紧急'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      selectedTag === tag
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddTodo}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                添加任务
              </button>
            </div>
          </div>

          {/* 任务列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                任务列表
              </h3>
            </div>
            <div className="space-y-2">
              {todos.map(todo => (
                <div 
                  key={todo.id} 
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onUpdateTodo(todo.id, { completed: !todo.completed })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className={`text-sm flex-1 ${
                    todo.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {todo.title}
                  </span>
                  {todo.tags && todo.tags[0] && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600">
                      {todo.tags[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：番茄钟 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            番茄工作法
          </h3>
          <div className="text-center space-y-6">
            <div className="text-6xl font-bold text-gray-800 dark:text-gray-200">
              {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">工作时间</div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              >
                <Play className="w-6 h-6" />
              </button>
              <button
                onClick={() => setTimeLeft(25 * 60)}
                className="p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 