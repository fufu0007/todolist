'use client';

import { useState, useEffect } from 'react';
import { Check, Plus } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  streak: number;
  lastChecked?: Date;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, {
      id: Date.now().toString(),
      name: newHabit,
      streak: 0
    }]);
    setNewHabit('');
  };

  const checkHabit = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const today = new Date();
        const lastChecked = habit.lastChecked ? new Date(habit.lastChecked) : null;
        const isConsecutive = lastChecked && 
          today.getDate() - lastChecked.getDate() === 1;

        return {
          ...habit,
          streak: isConsecutive ? habit.streak + 1 : 1,
          lastChecked: today
        };
      }
      return habit;
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">习惯打卡</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="添加新习惯"
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={addHabit}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-2">
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <div className="dark:text-white">{habit.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                连续打卡: {habit.streak} 天
              </div>
            </div>
            <button
              onClick={() => checkHabit(habit.id)}
              className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-gray-600 rounded-full"
            >
              <Check />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 