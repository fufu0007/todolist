import { memo } from 'react';
import { 
  Trash2, CheckCircle2, Circle, AlertTriangle, 
  Pencil, X, Save, Calendar, MapPin, Bell, 
  ChevronRight, ChevronDown, MoreVertical
} from 'lucide-react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  isEditing: boolean;
  editingTitle: string;
  isExpanded: boolean;
  onStartEdit: (todo: Todo) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditTitleChange: (value: string) => void;
  onEditKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, priority: Todo['priority']) => void;
}

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
} as const;

const TodoItem = ({
  todo,
  isEditing,
  editingTitle,
  isExpanded,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
  onEditKeyDown,
  onToggleExpand,
  onToggleComplete,
  onDelete,
  onUpdatePriority
}: TodoItemProps) => {
  const renderPriorityIcon = () => {
    switch (todo.priority) {
      case 'high':
        return <AlertTriangle className={priorityColors.high} size={16} />;
      case 'medium':
        return <AlertTriangle className={priorityColors.medium} size={16} />;
      case 'low':
        return <AlertTriangle className={priorityColors.low} size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="group flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
      <button
        onClick={() => onToggleComplete(todo.id, !todo.completed)}
        className="flex-shrink-0"
      >
        {todo.completed ? (
          <CheckCircle2 className="text-green-500" size={20} />
        ) : (
          <Circle className="text-gray-400" size={20} />
        )}
      </button>

      <div className="flex-grow min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => onEditKeyDown(e, todo.id)}
            className="w-full px-2 py-1 border rounded"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : ''}`}>
              {todo.title}
            </span>
            {renderPriorityIcon()}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {todo.dueDate && (
          <Calendar size={16} className="text-gray-400" />
        )}
        {todo.location && (
          <MapPin size={16} className="text-gray-400" />
        )}
        {todo.reminder && (
          <Bell size={16} className="text-gray-400" />
        )}
        
        {isEditing ? (
          <>
            <button
              onClick={() => onSaveEdit(todo.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Save size={16} />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onStartEdit(todo)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        
        <button
          onClick={() => onToggleExpand(todo.id)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {isExpanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default memo(TodoItem); 