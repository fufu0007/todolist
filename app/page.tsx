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
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 
                dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="WeChat"
            >
              <svg 
                viewBox="64 64 896 896" 
                focusable="false" 
                data-icon="wechat" 
                width="1em" 
                height="1em" 
                fill="currentColor" 
                aria-hidden="true" 
                className="w-5 h-5"
              >
                <path d="M690.1 377.4c5.9 0 11.8.2 17.6.5-24.4-128.7-158.3-227.1-319.9-227.1C209 150.8 64 271.4 64 420.2c0 81.1 43.6 154.2 111.9 203.6a21.5 21.5 0 019.1 17.6c0 2.4-.5 4.6-1.1 6.9-5.5 20.3-14.2 52.8-14.6 54.3-.7 2.6-1.7 5.2-1.7 7.9 0 5.9 4.8 10.8 10.8 10.8 2.3 0 4.2-.9 6.2-2l70.9-40.9c5.3-3.1 11-5 17.2-5 3.2 0 6.4.5 9.5 1.4 33.1 9.5 68.8 14.8 105.7 14.8 6 0 11.9-.1 17.8-.4-7.1-21-10.9-43.1-10.9-66 0-135.8 132.2-245.8 295.3-245.8zm-194.3-86.5c23.8 0 43.2 19.3 43.2 43.1s-19.3 43.1-43.2 43.1c-23.8 0-43.2-19.3-43.2-43.1s19.4-43.1 43.2-43.1zm-215.9 86.2c-23.8 0-43.2-19.3-43.2-43.1s19.3-43.1 43.2-43.1 43.2 19.3 43.2 43.1-19.4 43.1-43.2 43.1zm586.8 415.6c56.9-41.2 93.2-102 93.2-169.7 0-124-120.8-224.5-269.9-224.5-149 0-269.9 100.5-269.9 224.5S540.9 847.5 690 847.5c30.8 0 60.6-4.4 88.1-12.3 2.6-.8 5.2-1.2 7.9-1.2 5.2 0 9.9 1.6 14.3 4.1l59.1 34c1.7 1 3.3 1.7 5.2 1.7a9 9 0 006.4-2.6 9 9 0 002.6-6.4c0-2.2-.9-4.4-1.4-6.6-.3-1.2-7.6-28.3-12.2-45.3-.5-1.9-.9-3.8-.9-5.7.1-5.9 3.1-11.2 7.6-14.5zM600.2 587.2c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9c0 19.8-16.2 35.9-36 35.9zm179.9 0c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9a36.08 36.08 0 01-36 35.9z" />
              </svg>
              <span>联系</span>
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