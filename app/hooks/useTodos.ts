import { useState, useCallback, useEffect } from 'react';
import type { Todo } from '../types/todo';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'order' | 'createdAt' | 'deleted'>) => {
    // 添加调试日志
    console.log('Received todo in useTodos:', todo);
    
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      deleted: false,
      order: todos.length,
      subTasks: todo.subTasks?.map(task => ({
        id: task.id || crypto.randomUUID(),
        title: task.title,
        completed: task.completed ?? false,
        createdAt: task.createdAt || new Date().toISOString()
      })) || []
    };

    // 添加日志以便调试
    console.log('Creating new todo in useTodos:', newTodo);
    
    setTodos(prev => [newTodo, ...prev]);
  }, [todos.length]);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, deleted: true } : todo
    ));
  }, []);

  const restoreTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, deleted: false } : todo
    ));
  }, []);

  const permanentDelete = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const batchUpdate = useCallback((updates: { id: string; data: Partial<Todo> }[]) => {
    setTodos(prev => prev.map(todo => {
      const update = updates.find(u => u.id === todo.id);
      if (update) {
        return { ...todo, ...update.data };
      }
      return todo;
    }));
  }, []);

  const reorderTodos = useCallback((startIndex: number, endIndex: number) => {
    setTodos(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    restoreTodo,
    permanentDelete,
    batchUpdate,
    reorderTodos
  };
}; 