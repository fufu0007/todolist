import { useState } from 'react';
import type { Todo, SubTask } from '../types/todo';
import { 
  X, CheckSquare, Tag, Bell,
} from 'lucide-react';

interface TodoDetailProps {
  todo: Todo;
  onClose: () => void;
  onUpdate: (updatedTodo: Todo) => void;
}

export default function TodoDetail({ todo, onClose, onUpdate }: TodoDetailProps) {
  const [editedTodo, setEditedTodo] = useState<Todo>({
    ...todo,
    subTasks: todo.subTasks || [],
    tags: todo.tags || []
  });
  const [newSubTask, setNewSubTask] = useState('');
  const [newTag, setNewTag] = useState('');

  const addSubTask = () => {
    if (newSubTask.trim()) {
      const subTask: SubTask = {
        id: Date.now().toString(),
        title: newSubTask,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setEditedTodo({
        ...editedTodo,
        subTasks: [...editedTodo.subTasks, subTask]
      });
      setNewSubTask('');
    }
  };

  const toggleSubTask = (subTaskId: string) => {
    setEditedTodo({
      ...editedTodo,
      subTasks: editedTodo.subTasks.map(st =>
        st.id === subTaskId ? { ...st, completed: !st.completed } : st
      )
    });
  };

  const addTag = () => {
    if (newTag.trim() && !editedTodo.tags.includes(newTag.trim())) {
      setEditedTodo({
        ...editedTodo,
        tags: [...editedTodo.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditedTodo({
      ...editedTodo,
      tags: editedTodo.tags.filter(t => t !== tag)
    });
  };

  const updateReminder = (minutes: number) => {
    setEditedTodo({
      ...editedTodo,
      reminderSettings: {
        ...editedTodo.reminderSettings,
        before: minutes
      }
    });
  };

  const saveChanges = () => {
    onUpdate(editedTodo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">任务详情</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 标题和描述 */}
          <div className="space-y-4">
            <input
              type="text"
              value={editedTodo.title}
              onChange={e => setEditedTodo({ ...editedTodo, title: e.target.value })}
              className="w-full p-3 border rounded-lg"
              placeholder="任务标题"
            />
            <textarea
              value={editedTodo.description || ''}
              onChange={e => setEditedTodo({ ...editedTodo, description: e.target.value })}
              className="w-full p-3 border rounded-lg h-32"
              placeholder="任务描述"
            />
          </div>

          {/* 子任务 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold">子任务</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubTask}
                onChange={e => setNewSubTask(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                placeholder="添加子任务"
                onKeyPress={e => e.key === 'Enter' && addSubTask()}
              />
              <button
                onClick={addSubTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                添加
              </button>
            </div>
            <div className="space-y-2">
              {editedTodo.subTasks.map(subTask => (
                <div key={subTask.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subTask.completed}
                    onChange={() => toggleSubTask(subTask.id)}
                    className="w-4 h-4"
                  />
                  <span className={subTask.completed ? 'line-through text-gray-500' : ''}>
                    {subTask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold">标签</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                placeholder="添加标签"
                onKeyPress={e => e.key === 'Enter' && addTag()}
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedTodo.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 提醒设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold">提醒设置</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateReminder(10)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                提前10分钟
              </button>
              <button
                onClick={() => updateReminder(30)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                提前30分钟
              </button>
              <button
                onClick={() => updateReminder(60)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                提前1小时
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              取消
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 