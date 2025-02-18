'use client';

import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Calendar from './components/Calendar';
import PomodoroTimer from './components/PomodoroTimer';
import TaskStats from './components/TaskStats';
import TaskAnalytics from './components/TaskAnalytics';
import DayTimeline from './components/DayTimeline';
import { useTodos } from './hooks/useTodos';
import { usePomodoroSessions } from './hooks/usePomodoroSessions';
import { useState } from 'react';

export default function Home() {
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    restoreTodo,
    permanentDelete,
    batchUpdate,
    reorderTodos
  } = useTodos();

  const {
    sessions,
    handlePomodoroComplete,
    handleSessionComplete
  } = usePomodoroSessions();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-200 mb-8 text-center">
        专注清单
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-3">
          保持专注，提升效率
        </span>
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TaskStats 
            todos={todos}
            sessions={sessions}
          />
          <TaskInput onAddTodo={addTodo} />
          <TaskList
            todos={todos}
            onUpdateTodo={updateTodo}
            onDeleteTodo={deleteTodo}
            onRestoreTodo={restoreTodo}
            onPermanentDelete={permanentDelete}
            onBatchUpdate={batchUpdate}
            onReorderTodos={reorderTodos}
          />
          <div className="grid grid-cols-1 gap-6">
            <TaskAnalytics 
              todos={todos}
              sessions={sessions}
            />
            <DayTimeline 
              todos={todos}
              sessions={sessions}
            />
          </div>
        </div>
        <div className="space-y-6">
          <PomodoroTimer
            onComplete={handlePomodoroComplete}
            onSessionComplete={handleSessionComplete}
            sessions={sessions}
          />
          <Calendar
            currentDate={new Date()}
            todos={todos}
            sessions={sessions}
            selectedDate={selectedDate}
            onDateSelect={(date) => setSelectedDate(date)}
          />
        </div>
      </div>
    </main>
  );
}