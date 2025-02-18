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
<<<<<<< HEAD
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
=======
  const { state, dispatch } = useTodo();
  
  // 使用 state.todos 替代直接的 todos
  const todos = state.todos;
  
  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdAt' | 'deleted'>) => {
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      deleted: false,
      order: todos.length
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
  }, [dispatch, todos.length]);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    dispatch({ 
      type: 'UPDATE_TODO', 
      payload: { 
        id, 
        data: updates 
      }
    });
  }, [dispatch]);

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  }, [dispatch]);

  const restoreTodo = useCallback((id: string) => {
    dispatch({ type: 'RESTORE_TODO', payload: id });
  }, [dispatch]);

  const permanentDeleteTodo = useCallback((id: string) => {
    dispatch({ type: 'PERMANENT_DELETE_TODO', payload: id });
  }, [dispatch]);

  const sessions = state.sessions;
  const isLoading = state.isLoading;
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08

  // 添加批量更新函数
  const onBatchUpdate = useCallback((updates: { id: string; data: Partial<Todo> }[]) => {
    updates.forEach(update => {
<<<<<<< HEAD
      updateTodo(update.id, update.data);
    });
  }, [updateTodo]);
=======
      dispatch({
        type: 'UPDATE_TODO',
        payload: {
          id: update.id,
          data: update.data
        }
      });
    });
  }, [dispatch]);
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08

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
<<<<<<< HEAD
        <TaskInput onAddTodo={handleAddTodo} />
=======
        <TaskInput onAddTodo={addTodo} />
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08
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