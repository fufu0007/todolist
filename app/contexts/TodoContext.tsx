'use client';

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Todo } from '../types/todo';
import type { PomodoroSession } from '../types/pomodoro';

interface TodoState {
  todos: Todo[];
  sessions: PomodoroSession[];
  isLoading: boolean;
  error: string | null;
}

type TodoAction =
  | { type: 'INIT_DATA'; payload: { todos: Todo[]; sessions: PomodoroSession[] } }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: string; data: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'RESTORE_TODO'; payload: string }
  | { type: 'PERMANENT_DELETE_TODO'; payload: string }
  | { type: 'ADD_SESSION'; payload: PomodoroSession }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: TodoState = {
  todos: [],
  sessions: [],
  isLoading: true,
  error: null
};

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  try {
    switch (action.type) {
      case 'INIT_DATA':
        return {
          ...state,
          todos: action.payload.todos,
          sessions: action.payload.sessions,
          isLoading: false
        };

      case 'ADD_TODO':
        return {
          ...state,
          todos: [action.payload, ...state.todos]
        };

      case 'UPDATE_TODO':
        return {
          ...state,
          todos: state.todos.map(todo =>
            todo.id === action.payload.id
              ? { ...todo, ...action.payload.data }
              : todo
          )
        };

      case 'DELETE_TODO':
        return {
          ...state,
          todos: state.todos.map(todo =>
            todo.id === action.payload
              ? { ...todo, deleted: true }
              : todo
          )
        };

      case 'RESTORE_TODO':
        return {
          ...state,
          todos: state.todos.map(todo =>
            todo.id === action.payload
              ? { ...todo, deleted: false }
              : todo
          )
        };

      case 'PERMANENT_DELETE_TODO':
        return {
          ...state,
          todos: state.todos.filter(todo => todo.id !== action.payload)
        };

      case 'ADD_SESSION':
        return {
          ...state,
          sessions: [...state.sessions, action.payload]
        };

      case 'SET_LOADING':
        return {
          ...state,
          isLoading: action.payload
        };

      case 'SET_ERROR':
        return {
          ...state,
          error: action.payload
        };

      default:
        return state;
    }
  } catch (error) {
    console.error('Error in reducer:', error);
    return {
      ...state,
      error: 'An error occurred while processing the action'
    };
  }
}

const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
} | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedTodos = localStorage.getItem('todos');
        const savedSessions = localStorage.getItem('sessions');
        
        const todos = savedTodos ? JSON.parse(savedTodos) : [];
        const sessions = savedSessions ? JSON.parse(savedSessions) : [];

        dispatch({
          type: 'INIT_DATA',
          payload: { todos, sessions }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem('todos', JSON.stringify(state.todos));
        localStorage.setItem('sessions', JSON.stringify(state.sessions));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }
  }, [state.todos, state.sessions, state.isLoading]);

  const value = {
    todos: state.todos,
    sessions: state.sessions,
    isLoading: state.isLoading,
    error: state.error,
    addTodo: useCallback((todoData: Omit<Todo, 'id' | 'createdAt' | 'completed' | 'deleted'>) => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        completed: false,
        deleted: false,
        ...todoData
      };
      dispatch({ type: 'ADD_TODO', payload: newTodo });
    }, []),
    updateTodo: useCallback((id: string, data: Partial<Todo>) => {
      dispatch({ type: 'UPDATE_TODO', payload: { id, data } });
    }, []),
    deleteTodo: useCallback((id: string) => {
      dispatch({ type: 'DELETE_TODO', payload: id });
    }, []),
    restoreTodo: useCallback((id: string) => {
      dispatch({ type: 'RESTORE_TODO', payload: id });
    }, []),
    permanentDeleteTodo: useCallback((id: string) => {
      dispatch({ type: 'PERMANENT_DELETE_TODO', payload: id });
    }, []),
    addSession: useCallback((session: Omit<PomodoroSession, 'id'>) => {
      const newSession: PomodoroSession = {
        id: crypto.randomUUID(),
        ...session
      };
      dispatch({ type: 'ADD_SESSION', payload: newSession });
    }, [])
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
} 