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

  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdAt' | 'deleted'>) => {
    const newTodo: Todo = {
      ...todo,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      deleted: false
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

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

  const batchUpdate = useCallback((updates: { id: string; updates: Partial<Todo> }[]) => {
    setTodos(prev => prev.map(todo => {
      const update = updates.find(u => u.id === todo.id);
      return update ? { ...todo, ...update.updates } : todo;
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