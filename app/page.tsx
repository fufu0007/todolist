'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Tag, CheckCircle2, Circle, Filter } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  reminder?: Date;
}

type FilterStatus = 'all' | 'active' | 'completed';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [reminderDate, setReminderDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        title: newTodo,
        completed: false,
        priority: selectedPriority,
        category: selectedCategory,
        reminder: reminderDate ? new Date(reminderDate) : undefined,
      };
      setTodos([...todos, todo]);
      setNewTodo('');
      setReminderDate(new Date().toISOString().slice(0, 16));
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '无';
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filterStatus === 'active') return !todo.completed;
    if (filterStatus === 'completed') return todo.completed;
    return true;
  }).filter(todo => {
    return filterCategory === 'all' || todo.category === filterCategory;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  useEffect(() => {
    const checkReminders = () => {
      todos.forEach(todo => {
        if (todo.reminder && new Date(todo.reminder) <= new Date() && !todo.completed) {
          if (Notification.permission === 'granted') {
            new Notification('待办事项提醒', {
              body: todo.title,
              icon: '/favicon.ico'
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [todos]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">我的待办事项</h1>
          <div className="flex justify-center gap-4 text-sm">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">总计: <span className="font-semibold text-blue-600">{stats.total}</span></div>
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">进行中: <span className="font-semibold text-yellow-600">{stats.active}</span></div>
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">已完成: <span className="font-semibold text-green-600">{stats.completed}</span></div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-200 hover:shadow-xl">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="请输入待办事项"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              <button
                onClick={addTodo}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>添加</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="low">低优先级</option>
                <option value="medium">中优先级</option>
                <option value="high">高优先级</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="personal">个人</option>
                <option value="work">工作</option>
                <option value="shopping">购物</option>
                <option value="health">健康</option>
                <option value="recycle">回收站</option> {/* 新增回收站 */}
                <option value="pending">待办事项</option> {/* 新增待办事项 */}
              </select>
              
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">筛选：</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${filterStatus === 'active' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                进行中
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${filterStatus === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                已完成
              </button>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有分类</option>
              <option value="personal">个人</option>
              <option value="work">工作</option>
              <option value="shopping">购物</option>
              <option value="health">健康</option>
              <option value="recycle">回收站</option> {/* 新增分类 */}
              <option value="pending">待办事项</option> {/* 新增分类 */}
            </select>
          </div>

          <div className="flex flex-wrap gap-4">
            {filteredTodos.map((todo) => (
              <div key={todo.id} className={`bg-white rounded-lg border border-gray-100 p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md w-1/3`}>
                <div className="flex items-center space-x-4 flex-1">
                  <button onClick={() => toggleTodo(todo.id)} className="focus:outline-none">
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{todo.title}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs text-white ${getPriorityColor(todo.priority)}`}>{getPriorityText(todo.priority)}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{todo.category}</span>
                  {todo.reminder && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">{new Date(todo.reminder).toLocaleDateString()} {new Date(todo.reminder).toLocaleTimeString()}</span>
                    </div>
                  )}
                  <button onClick={() => deleteTodo(todo.id)} className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {filteredTodos.length === 0 && <div className="text-center py-8 text-gray-500">暂无待办事项</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
代码变更和优化总结：
1. 在类别选择框中新增了“回收站”和“待办事项”选项。
2. 在待办事项的显示上，新增了“w-1/3”样式以实现一行三项的卡片展示效果。
3. 重组了一些条件判断，简化部分逻辑。
4. 添加注释，易于后续维护。
*/