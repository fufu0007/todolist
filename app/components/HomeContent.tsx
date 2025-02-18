'use client';

import { useTodo } from '../contexts/TodoContext';
import TaskList from './TaskList';
import TaskInput from './TaskInput';
import TaskStats from './TaskStats';
import { useCallback } from 'react';
import { Todo } from '../types/todo';

// 加载状态组件
function LoadingState() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
}

export default function HomeContent() {
  const { 
    todos, 
    sessions, 
    isLoading, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    restoreTodo, 
    permanentDeleteTodo 
  } = useTodo();
  
  const handleAddTodo = useCallback((todo: Omit<Todo, 'id' | 'order' | 'createdAt' | 'deleted'>) => {
    addTodo(todo);
  }, [addTodo]);

  // 添加批量更新函数
  const onBatchUpdate = useCallback((updates: { id: string; data: Partial<Todo> }[]) => {
    updates.forEach(update => {
      updateTodo(update.id, update.data);
    });
  }, [updateTodo]);

  // 添加重新排序函数
  const onReorderTodos = useCallback((startIndex: number, endIndex: number) => {
    const newTodos = [...todos];
    const [removed] = newTodos.splice(startIndex, 1);
    newTodos.splice(endIndex, 0, removed);
    
    // 更新所有受影响的 todo 的 order
    const updates = newTodos.map((todo, index) => ({
      id: todo.id,
      data: { order: index }
    }));
    
    onBatchUpdate(updates);
  }, [todos, onBatchUpdate]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <LoadingState />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <TaskStats todos={todos} sessions={sessions} />
        <TaskInput onAddTodo={handleAddTodo} />
        <TaskList
          todos={todos}
          onUpdateTodo={updateTodo}
          onDeleteTodo={deleteTodo}
          onRestoreTodo={restoreTodo}
          onPermanentDelete={permanentDeleteTodo}
          onBatchUpdate={onBatchUpdate}
          onReorderTodos={onReorderTodos}
        />
      </div>
    </main>
  );
} 