## SpecStory

## Fixing Parent Task Completion Issue (2025/2/20 11:08:11)

_**User**_

目前的问题，任务列表中，一个主任务有子任务，我勾选子任务完成后，整个任务的状态都变成了已完成

---

_**Assistant**_

I understand the issue - when marking a subtask as complete, the parent task is incorrectly being marked as complete as well. Let's fix this by modifying the `handleToggleComplete` function in the TaskList component.

The issue appears to be in this section:


```693:706:app/components/TaskList.tsx
                  <button
                    onClick={() => handleToggleComplete(todo.id, !subTask.completed)}
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
```


The problem is that `handleToggleComplete` is being used for both main tasks and subtasks, but they should be handled differently. Let's create a separate handler for subtasks:

```typescript
// Add this function to handle subtask toggle
const handleToggleSubTask = useCallback((taskId: string, subTaskId: string, completed: boolean) => {
  const todo = todos.find(t => t.id === taskId);
  if (!todo || !todo.subTasks) return;

  const updatedSubTasks = todo.subTasks.map(subTask => 
    subTask.id === subTaskId ? { ...subTask, completed } : subTask
  );

  // Only update the parent task's completed status if ALL subtasks are completed
  const allSubTasksCompleted = updatedSubTasks.every(subTask => subTask.completed);
  
  onUpdateTodo(taskId, {
    subTasks: updatedSubTasks,
    // Don't update parent task's completed status based on subtasks
    // Let it be controlled independently
    // completed: allSubTasksCompleted
  });
}, [todos, onUpdateTodo]);
```app/components/PomodoroTimer.tsx

Then modify the subtask button's onClick handler:

```typescript
<button
  onClick={() => handleToggleSubTask(todo.id, subTask.id, !subTask.completed)}
  className={`flex-shrink-0 transition-colors ${
    subTask.completed 
      ? 'text-green-500 hover:text-green-600' 
      : 'text-gray-400 hover:text-gray-500'
  }`}
>
```

This change will:
1. Keep subtask completion state independent from the parent task
2. Allow parent tasks to be completed/uncompleted regardless of subtask status
3. Maintain the existing UI and visual feedback

Would you like me to explain any part of this solution in more detail?

---



---

