'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Trash2, CheckCircle2, Circle, AlertTriangle, Clock, 
  Pencil, X, ChevronDown, RotateCcw, Plus, 
  User, ShoppingCart, Heart, BookOpen, Tag,
  Search, ArrowUpNarrowWide, ArrowDownNarrowWide, ArrowDown,
  Calendar, MapPin, Bell, ChevronRight, MoreVertical,
  Archive, RefreshCcw, Filter, SortAsc, SortDesc, AlertCircle, Flag, ListTodo, Phone
} from 'lucide-react';
import type { Todo } from '../types/todo';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { WeChat } from './icons/WeChat';

interface TaskListProps {
  todos: Todo[];
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onRestoreTodo: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onBatchUpdate: (updates: { id: string; data: Partial<Todo> }[]) => void;
  onReorderTodos: (startIndex: number, endIndex: number) => void;
}

type FilterType = 'all' | 'active' | 'completed' | 'deleted' | 'today';
type SortType = 'createdAt' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
} as const;

const tagColors = {
  work: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  personal: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  shopping: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  health: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400'
} as const;

const tagIcons = {
  work: Clock,
  personal: User,
  shopping: ShoppingCart,
  health: Heart,
  study: BookOpen,
  default: Tag
} as const;

const MAX_TIMELINE_ITEMS = 10;

export default function TaskList({ 
  todos = [],
  onUpdateTodo = () => {},
  onDeleteTodo = () => {},
  onRestoreTodo = () => {},
  onPermanentDelete = () => {},
  onBatchUpdate = () => {},
  onReorderTodos = () => {}
}: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('active');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sort, setSort] = useState<SortType>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'all'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingSubTask, setEditingSubTask] = useState<{taskId: string, subTaskId?: string}>();
  const [subTaskInput, setSubTaskInput] = useState('');

  // 开始编辑
  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // 保存编辑
  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      onUpdateTodo(id, { title: editingTitle.trim() });
    }
    setEditingId(null);
    setEditingTitle('');
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // 处理编辑时的回车和ESC
  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // 切换任务完成状态
  const handleToggleComplete = useCallback((id: string, completed: boolean) => {
    const task = todos.find(t => t.id === id);
    if (!task) {
      console.log('Task not found:', id);
      return;
    }

    // 查找是否为子任务
    const parentTask = todos.find(t => t.subTasks?.some(st => st.id === id));
    
    if (parentTask) {
      // 如果是子任务，只更新子任务状态
      const updatedSubTasks = parentTask.subTasks!.map(st =>
        st.id === id ? { ...st, completed } : st
      );
      
      // 更新父任务的子任务状态，但不改变父任务状态
      onUpdateTodo(parentTask.id, {
        subTasks: updatedSubTasks
      });
    } else {
      // 如果是主任务
      const updates: Partial<Todo> = {
        completed,
        completedAt: completed ? new Date().toISOString() : undefined
      };

      // 如果有子任务，同时更新子任务状态
      if (task.subTasks?.length) {
        updates.subTasks = task.subTasks.map(subTask => ({
          ...subTask,
          completed // 子任务状态跟随主任务
        }));
      }
      
      onUpdateTodo(id, updates);
    }
  }, [todos, onUpdateTodo]);

  // 开始编辑子任务
  const handleStartEditSubTask = (taskId: string, subTask?: Todo) => {
    setEditingSubTask({ taskId, subTaskId: subTask?.id });
    setSubTaskInput(subTask?.title || '');
  };

  // 保存子任务编辑
  const handleSaveSubTask = useCallback((taskId: string) => {
    if (!subTaskInput.trim()) return;

    const todo = todos.find(t => t.id === taskId);
    if (!todo) return;

    const newSubTasks = [...(todo.subTasks || [])];
    
    if (editingSubTask?.subTaskId) {
      // 编辑现有子任务
      const index = newSubTasks.findIndex(st => st.id === editingSubTask.subTaskId);
      if (index !== -1) {
        newSubTasks[index] = {
          ...newSubTasks[index],
          title: subTaskInput.trim()
        };
      }
    } else {
      // 添加新子任务
      newSubTasks.push({
        id: crypto.randomUUID(),
        title: subTaskInput.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      });
    }

    onUpdateTodo(taskId, { subTasks: newSubTasks });
    
    // 如果是新添加的子任务，自动展开父任务
    if (!editingSubTask?.subTaskId) {
      setExpandedTasks(prev => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });
    }
    
    setEditingSubTask(undefined);
    setSubTaskInput('');
  }, [editingSubTask, subTaskInput, todos, onUpdateTodo]);

  // 删除子任务
  const handleDeleteSubTask = useCallback((taskId: string, subTaskId: string) => {
    const task = todos.find(t => t.id === taskId) as Todo;
    const updatedSubTasks = task.subTasks?.filter(st => st.id !== subTaskId);
    
    onUpdateTodo(taskId, { subTasks: updatedSubTasks });
  }, [todos, onUpdateTodo]);

  // 排序函数
  const sortTodos = useCallback((a: Todo, b: Todo) => {
    const direction = sortDirection === 'desc' ? -1 : 1;
    
    switch (sort) {
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] - priorityOrder[a.priority]) * direction;
        if (priorityDiff !== 0) return priorityDiff;
        // 优先级相同时，按照 order 和创建时间排序
        const orderDiff = ((b.order ?? 0) - (a.order ?? 0)) * direction;
        if (orderDiff !== 0) return orderDiff;
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * direction;
      }
      case 'dueDate':
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aDate - bDate;
      case 'createdAt':
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * direction;
      default:
        return 0;
    }
  }, [sort, sortDirection]);

  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        // 首先按状态过滤
        if (filter === 'all') return !todo.deleted;
        if (filter === 'today') {
          const today = new Date().setHours(0, 0, 0, 0);
          const todoDate = new Date(todo.createdAt).setHours(0, 0, 0, 0);
          return todoDate === today && !todo.deleted;
        }
        if (filter === 'active') return !todo.completed && !todo.deleted;
        if (filter === 'completed') return todo.completed && !todo.deleted;
        if (filter === 'deleted') return todo.deleted;

        // 然后按搜索词过滤
        const searchMatch = !searchQuery || 
          todo.title.toLowerCase().includes(searchQuery.toLowerCase());

        return searchMatch;
      })
      .sort(sortTodos);
  }, [todos, filter, searchQuery, sortTodos]);

  // 安全地计算任务统计
  const stats = useMemo(() => {
    try {
      // 只统计主任务（非子任务）
      const mainTodos = todos.filter(t => !t.parentId);
      const today = new Date().setHours(0, 0, 0, 0);
      
      return {
        all: mainTodos.filter(t => !t.deleted).length,
        active: mainTodos.filter(t => !t.deleted && !t.completed).length,
        completed: mainTodos.filter(t => !t.deleted && t.completed).length,
        deleted: mainTodos.filter(t => t.deleted).length,
        today: mainTodos.filter(t => {
          const todoDate = new Date(t.createdAt).setHours(0, 0, 0, 0);
          return todoDate === today && !t.deleted;
        }).length
      } as const;
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        all: 0,
        active: 0,
        completed: 0,
        deleted: 0,
        today: 0
      } as const;
    }
  }, [todos]);

  // 获取所有可用的标签
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    todos.forEach(todo => {
      if (todo.tags) {
        todo.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [todos]);

  // 安全地过滤和排序任务
  const filteredAndSortedTodos = useMemo(() => {
    try {
      // 基础过滤
      let filtered = todos.filter(todo => {
        if (!todo) return false;

        // 搜索过滤
        const matchesSearch = !searchQuery || 
          todo.title.toLowerCase().includes(searchQuery.toLowerCase());

        // 状态过滤
        const statusMatch = filter === 'all' ? !todo.deleted :
          filter === 'active' ? !todo.deleted && !todo.completed :
          filter === 'completed' ? !todo.deleted && todo.completed :
          todo.deleted;

        // 标签过滤
        const tagMatch = selectedTags.length === 0 || 
          (todo.tags && todo.tags.length > 0 && selectedTags.every(tag => todo.tags!.includes(tag)));

        // 优先级过滤
        const priorityMatch = selectedPriority === 'all' || todo.priority === selectedPriority;

        return statusMatch && matchesSearch && tagMatch && priorityMatch;
      });

      // 只保留主任务（非子任务）
      filtered = filtered.filter(todo => !todo.parentId);

      // 排序
      return filtered.sort((a, b) => {
        if (!a || !b) return 0;

        let comparison = 0;
        switch (sort) {
          case 'priority': {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (comparison === 0) {
              comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            break;
          }
          case 'dueDate': {
            const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            comparison = aDate - bDate;
            if (comparison === 0) {
              comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            break;
          }
          default:
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortDirection === 'asc' ? -comparison : comparison;
      });
    } catch (error) {
      console.error('Error filtering and sorting todos:', error);
      return [];
    }
  }, [todos, filter, sort, sortDirection, searchQuery, selectedTags, selectedPriority]);

  // 初始化展开状态
  useEffect(() => {
    setExpandedTasks(new Set(
      todos.filter(todo => todo.subTasks && todo.subTasks.length > 0).map(todo => todo.id)
    ));
  }, [todos]);

  // 切换任务展开状态
  const toggleTaskExpand = useCallback((id: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // 自动展开有子任务的任务
  useEffect(() => {
    const tasksWithSubTasks = todos.filter(todo => todo.subTasks && todo.subTasks.length > 0);
    setExpandedTasks(new Set(tasksWithSubTasks.map(todo => todo.id)));
  }, [todos]);

  // 添加新的处理函数
  const handleToggleSubTask = useCallback((parentId: string, subTaskId: string, completed: boolean) => {
    const parentTask = todos.find(t => t.id === parentId);
    if (!parentTask?.subTasks) return;

    const updatedSubTasks = parentTask.subTasks.map(st =>
      st.id === subTaskId ? { ...st, completed } : st
    );

    onUpdateTodo(parentId, {
      subTasks: updatedSubTasks
    });
  }, [todos, onUpdateTodo]);

  // 渲染批量操作按钮
  const renderBatchActions = () => {
    if (filteredAndSortedTodos.length === 0) return null;

    // 根据当前过滤状态计算可操作的任务数量
    const counts = {
      // 未完成的任务数量（用于"全部完成"按钮）
      uncompletedCount: filteredAndSortedTodos.filter(todo => !todo.completed && !todo.deleted).length,
      // 未删除的任务数量（用于"全部删除"按钮）
      undeletedCount: filteredAndSortedTodos.filter(todo => !todo.deleted).length,
      // 已删除的任务数量（用于"全部恢复"和"全部永久删除"按钮）
      deletedCount: filteredAndSortedTodos.filter(todo => todo.deleted).length,
      // 已完成的任务数量
      completedCount: filteredAndSortedTodos.filter(todo => todo.completed && !todo.deleted).length
    };

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {/* 全部完成按钮 - 在非删除状态下显示 */}
        {filter !== 'deleted' && counts.uncompletedCount > 0 && (
              <button
                onClick={() => handleBatchAction('complete')}
            className="px-3 py-1 text-sm bg-green-100 text-green-600 hover:bg-green-200 
              rounded-lg flex items-center gap-1"
              >
            <CheckCircle2 className="w-4 h-4" />
            全部完成 ({counts.uncompletedCount})
              </button>
            )}

        {/* 全部删除按钮 - 在非删除状态下显示 */}
        {filter !== 'deleted' && counts.undeletedCount > 0 && (
              <button
                onClick={() => handleBatchAction('delete')}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 
              rounded-lg flex items-center gap-1"
              >
            <Trash2 className="w-4 h-4" />
            全部删除 ({counts.undeletedCount})
              </button>
        )}

        {/* 全部恢复按钮 - 在删除状态下显示 */}
        {filter === 'deleted' && counts.deletedCount > 0 && (
          <button
            onClick={() => handleBatchAction('restore')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 
              rounded-lg flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            全部恢复 ({counts.deletedCount})
          </button>
        )}

        {/* 全部永久删除按钮 - 在删除状态下显示 */}
        {filter === 'deleted' && counts.deletedCount > 0 && (
          <button
            onClick={() => handleBatchAction('permanent-delete')}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 
              rounded-lg flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            全部永久删除 ({counts.deletedCount})
          </button>
        )}
      </div>
    );
  };

  // 批量操作函数
  const handleBatchAction = useCallback((action: 'complete' | 'delete' | 'restore' | 'permanent-delete') => {
    const targetTodos = filteredAndSortedTodos;
    if (targetTodos.length === 0) return;
    
    switch (action) {
      case 'complete': {
        // 只处理未完成的任务
        const uncompletedTodos = targetTodos.filter(todo => !todo.completed);
        if (uncompletedTodos.length > 0) {
          onBatchUpdate(
            uncompletedTodos.map(todo => ({
              id: todo.id,
              data: { 
                completed: true,
                completedAt: new Date().toISOString()
              }
            }))
          );
        }
        break;
      }
      
      case 'delete': {
        // 只处理未删除的任务
        const undeletedTodos = targetTodos.filter(todo => !todo.deleted);
        if (undeletedTodos.length > 0) {
          onBatchUpdate(
            undeletedTodos.map(todo => ({
              id: todo.id,
              data: { deleted: true }
            }))
          );
        }
        break;
      }
      
      case 'restore': {
        // 只处理已删除的任务
        const deletedTodos = targetTodos.filter(todo => todo.deleted);
        if (deletedTodos.length > 0) {
          onBatchUpdate(
            deletedTodos.map(todo => ({
              id: todo.id,
              data: { deleted: false }
            }))
          );
        }
        break;
      }

      case 'permanent-delete': {
        // 永久删除已删除的任务
        const deletedTodos = targetTodos.filter(todo => todo.deleted);
        if (deletedTodos.length > 0) {
          deletedTodos.forEach(todo => onPermanentDelete(todo.id));
        }
        break;
      }
    }
  }, [filteredAndSortedTodos, onBatchUpdate, onPermanentDelete]);

  // 优先级配置
  const priorityConfig = {
    high: {
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      icon: AlertTriangle,
      label: '高优先级'
    },
    medium: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      icon: Clock,
      label: '中优先级'
    },
    low: {
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      icon: ArrowDown,
      label: '低优先级'
    }
  };

  // 格式化时间显示
  const formatDateTime = useCallback((date: string, time?: string | undefined, isAllDay?: boolean) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateStr = '';
    if (dateObj.toDateString() === today.toDateString()) {
      dateStr = '今天';
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      dateStr = '明天';
    } else {
      dateStr = dateObj.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    }

    if (isAllDay) {
      return `${dateStr} 全天`;
    }
    
    return time ? `${dateStr} ${time}` : dateStr;
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // 只对主任务进行排序
    const mainTodos = filteredAndSortedTodos.filter(todo => !todo.parentId);
    
    console.log('Drag end:', {
      sourceIndex,
      destinationIndex,
      todoId: result.draggableId,
      todos: mainTodos.map(t => ({ id: t.id, order: t.order }))
    });

    onReorderTodos(sourceIndex, destinationIndex);
  };

  const togglePriority = (todo: Todo) => {
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(todo.priority);
    const nextPriority = priorities[(currentIndex + 1) % 3];
    onUpdateTodo(todo.id, { priority: nextPriority });
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <ArrowDown className="w-4 h-4 text-blue-500" />;
    }
  };

  // 渲染任务项
  const renderTodoItem = (todo: Todo, index: number) => (
    <Draggable key={todo.id} draggableId={todo.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-white dark:bg-gray-800 rounded-lg p-4 
            ${snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'} 
            transition-all duration-200`}
        >
          {/* 主任务部分 */}
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => handleToggleComplete(todo.id, !todo.completed)}
                className={`flex-shrink-0 transition-colors ${
                  todo.completed 
                    ? 'text-green-500 hover:text-green-600' 
                    : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                {todo.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              {editingId === todo.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                    onBlur={() => handleSaveEdit(todo.id)}
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 
                      dark:border-gray-600 rounded px-2 py-1 text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div 
                    onClick={() => handleStartEdit(todo)}
                    className={`cursor-pointer text-base ${
                      todo.completed 
                        ? 'text-gray-400 line-through' 
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {todo.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(todo.createdAt).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                      })}
                    </div>
                    <div 
                      onClick={() => togglePriority(todo)}
                      className={`flex items-center gap-1 cursor-pointer hover:opacity-80 
                        transition-opacity ${priorityColors[todo.priority]}`}
                    >
                      {getPriorityIcon(todo.priority)}
                      {{
                        high: '高优先级',
                        medium: '中优先级',
                        low: '低优先级'
                      }[todo.priority]}
                    </div>
                    {/* 添加标签显示 */}
                    {todo.tags && todo.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {todo.tags.map(tag => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 rounded-full text-xs ${tagColors[tag as keyof typeof tagColors] || tagColors.default}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 任务操作按钮组 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleStartEditSubTask(todo.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 
                  bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 
                  dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg 
                  transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加子任务</span>
              </button>

              {/* 其他操作按钮 */}
              <button
                onClick={() => handleStartEdit(todo)}
                className="p-1.5 text-gray-400 hover:text-gray-600 
                  dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 
                  dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 
                  rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 
                  transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 子任务区域 */}
          {(expandedTasks.has(todo.id) || editingSubTask?.taskId === todo.id) && (
            <>
          {/* 子任务列表 */}
          {todo.subTasks && todo.subTasks.length > 0 && (
            <div className="mt-3 ml-8 space-y-2 border-l-2 border-gray-100 
              dark:border-gray-700 pl-4"
            >
              {todo.subTasks.map(subTask => (
                <div
                  key={subTask.id}
                      className="flex items-center gap-3 group/subtask 
                        hover:bg-gray-50 dark:hover:bg-gray-700/50 
                        rounded-md py-1 px-2 -ml-2 transition-colors"
                >
                  <button
                    onClick={() => handleToggleSubTask(todo.id, subTask.id, !subTask.completed)}
                    className={`flex-shrink-0 transition-colors ${
                      subTask.completed 
                        ? 'text-green-500 hover:text-green-600' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    {subTask.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <span className={`flex-1 text-sm ${
                    subTask.completed 
                      ? 'text-gray-400 line-through' 
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {subTask.title}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 
                    group-hover/subtask:opacity-100 transition-opacity"
                  >
                    <button
                      onClick={() => {
                        setEditingSubTask({ 
                          taskId: todo.id, 
                          subTaskId: subTask.id 
                        });
                        setSubTaskInput(subTask.title);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 
                            dark:hover:text-gray-300 rounded-full 
                            hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubTask(todo.id, subTask.id)}
                          className="p-1 text-gray-400 hover:text-red-500 
                            rounded-full hover:bg-red-50 
                            dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
              )}

              {/* 子任务添加/编辑区域 */}
              {editingSubTask?.taskId === todo.id ? (
                <div className="mt-2 ml-8 flex items-center gap-2">
                  <input
                    type="text"
                    value={subTaskInput}
                    onChange={(e) => setSubTaskInput(e.target.value)}
                    placeholder="添加子任务..."
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 
                      dark:border-gray-600 rounded-lg bg-gray-50 
                      dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 
                      focus:border-blue-500 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveSubTask(todo.id);
                      } else if (e.key === 'Escape') {
                        setEditingSubTask(undefined);
                        setSubTaskInput('');
                      }
                    }}
                    onBlur={() => {
                      if (subTaskInput.trim()) {
                        handleSaveSubTask(todo.id);
                      } else {
                        setEditingSubTask(undefined);
                        setSubTaskInput('');
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                expandedTasks.has(todo.id) && (
                  <button
                    onClick={() => handleStartEditSubTask(todo.id)}
                    className="mt-2 ml-8 flex items-center gap-2 text-sm 
                      text-gray-500 hover:text-gray-700 dark:text-gray-400 
                      dark:hover:text-gray-200 hover:bg-gray-50 
                      dark:hover:bg-gray-700/50 rounded-md py-1 px-2 
                      transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加子任务
                  </button>
                )
              )}
            </>
          )}
        </div>
      )}
    </Draggable>
  );

  // 渲染任务列表内容
  const renderTaskList = () => {
    const tasksToRender = filter === 'today' 
      ? todos
          .filter(todo => {
            const today = new Date().setHours(0, 0, 0, 0);
            const todoDate = new Date(todo.createdAt).setHours(0, 0, 0, 0);
            return todoDate === today && !todo.deleted;
          })
          .slice(0, MAX_TIMELINE_ITEMS)
      : filteredAndSortedTodos;

    return (
      <div className="space-y-3">
        {tasksToRender.map((todo, index) => renderTodoItem(todo, index))}
        
        {filter === 'today' && todos.length > MAX_TIMELINE_ITEMS && (
          <div className="mt-6 pt-4 text-center border-t border-gray-100 dark:border-gray-800">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-full">
              <Clock className="w-4 h-4" />
              <span>已显示最近{MAX_TIMELINE_ITEMS}条任务 · 共{todos.length}条</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          任务列表
        </h2>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {[
                { type: 'all', label: '全部' },
                { type: 'active', label: '进行中' },
                { type: 'completed', label: '已完成' },
                { type: 'deleted', label: '已删除' },
                { type: 'today', label: '今日任务' }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as FilterType)}
                  className={`
                    px-4 py-2 text-sm
                    ${filter === type 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                    border-r border-gray-200 dark:border-gray-700 last:border-r-0
                  `}
                >
                  {label}
                  <span className="ml-2 text-xs text-gray-500">
                    {stats[type as keyof typeof stats] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 标签和优先级过滤器 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 flex items-start sm:items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">标签:</span>
              <div className="flex flex-wrap gap-1">
                {availableTags.map(tag => {
                  const TagIcon = tagIcons[tag as keyof typeof tagIcons] || tagIcons.default;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                        selectedTags.includes(tag)
                          ? tagColors[tag as keyof typeof tagColors] || tagColors.default
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <TagIcon className="w-4 h-4" />
                      {tag}
                    </button>
                  );
                })}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-2 py-1 rounded-lg text-sm bg-gray-100 text-gray-500 
                      hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 
                      dark:hover:bg-gray-600 transition-colors"
                    title="清除标签筛选"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">优先级:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedPriority(prev => prev === 'high' ? 'all' : 'high')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    selectedPriority === 'high'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  高
                </button>
                <button
                  onClick={() => setSelectedPriority(prev => prev === 'medium' ? 'all' : 'medium')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    selectedPriority === 'medium'
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  中
                </button>
                <button
                  onClick={() => setSelectedPriority(prev => prev === 'low' ? 'all' : 'low')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    selectedPriority === 'low'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  低
                </button>
                {selectedPriority !== 'all' && (
                  <button
                    onClick={() => setSelectedPriority('all')}
                    className="px-2 py-1 rounded-lg text-sm bg-gray-100 text-gray-500 
                      hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 
                      dark:hover:bg-gray-600 transition-colors"
                    title="清除优先级筛选"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 批量操作按钮 */}
          {renderBatchActions()}

          {/* 搜索和排序部分 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索任务..."
                className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 
                  border border-gray-200 dark:border-gray-600 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                text-gray-400 w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 
                  border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <option value="createdAt">创建时间</option>
                <option value="priority">优先级</option>
                <option value="dueDate">截止日期</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-400 hover:text-gray-600 
                  dark:hover:text-gray-300 rounded-lg"
              >
                {sortDirection === 'asc' ? (
                  <ArrowUpNarrowWide className="w-5 h-5" />
                ) : (
                  <ArrowDownNarrowWide className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 任务列表内容 */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {renderTaskList()}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
} 