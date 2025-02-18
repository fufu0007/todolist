<<<<<<< HEAD
import type { Todo } from './todo';

=======
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08
export type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: string; data: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'RESTORE_TODO'; payload: string }
  | { type: 'PERMANENT_DELETE_TODO'; payload: string }; 