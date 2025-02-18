'use client';

import React, { useState } from 'react';
import { Github } from 'lucide-react';
import Image from 'next/image';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Calendar from './components/Calendar';
import PomodoroTimer from './components/PomodoroTimer';
import StatsCard from './components/StatsCard';
import TaskStats from './components/TaskStats';
import TagAnalytics from './components/TagAnalytics';
import DayTimeline from './components/DayTimeline';
import { useTodos } from './hooks/useTodos';
import { usePomodoroSessions } from './hooks/usePomodoroSessions';
import Script from 'next/script';

export default function Home() {
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    restoreTodo,
    permanentDelete: permanentDeleteTodo,
    batchUpdate,
    reorderTodos
  } = useTodos();

  const {
    sessions,
    handlePomodoroComplete,
    handleSessionComplete,
    getSessionsByDate,
    getTotalFocusTime
  } = usePomodoroSessions();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showWechat, setShowWechat] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "专注清单",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "description": "一个简单高效的番茄工作法工具，帮助你提高工作效率，保持专注。支持任务管理、番茄计时、数据统计等功能。"
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-200 mb-4">
            专注清单
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            保持专注，提升效率
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/fufu0007/todolist"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 
                dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <button
              onClick={() => setShowWechat(true)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 
                dark:hover:text-gray-200 transition-colors"
            >
              联系
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskStats todos={todos} sessions={sessions} />
            <TaskInput onAddTodo={addTodo} />
            <TaskList
              todos={todos}
              onUpdateTodo={updateTodo}
              onDeleteTodo={deleteTodo}
              onRestoreTodo={restoreTodo}
              onPermanentDelete={permanentDeleteTodo}
              onBatchUpdate={batchUpdate}
              onReorderTodos={reorderTodos}
            />
            <TagAnalytics todos={todos} />
            <DayTimeline todos={todos} sessions={sessions} />
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
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        {showWechat && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
              justify-center z-50"
            onClick={() => setShowWechat(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 p-4 rounded-xl max-w-sm w-full 
                mx-4 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowWechat(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">微信联系</h3>
                <Image
                  src="/wechat.jpg"
                  alt="微信二维码"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  扫描二维码添加微信
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}