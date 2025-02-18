import React, { useState, useCallback } from 'react';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [pomodoroTime, setPomodoroTime] = useState<number>(25);
  const [shortBreakTime, setShortBreakTime] = useState<number>(5);
  const [longBreakTime, setLongBreakTime] = useState<number>(15);
  const [alarmSound, setAlarmSound] = useState<string>('bell');
  const [alarmDuration, setAlarmDuration] = useState<number>(3);

  const handlePomodoroTimeChange = useCallback((time: number | null) => {
    if (time !== null) {
      setPomodoroTime(time);
    }
  }, []);

  const handleShortBreakTimeChange = useCallback((time: number | null) => {
    if (time !== null) {
      setShortBreakTime(time);
    }
  }, []);

  const handleLongBreakTimeChange = useCallback((time: number | null) => {
    if (time !== null) {
      setLongBreakTime(time);
    }
  }, []);

  const handleAlarmDurationChange = useCallback((duration: number | null) => {
    if (duration !== null) {
      setAlarmDuration(duration);
    }
  }, []);

  return (
    <Settings
      pomodoroTime={pomodoroTime}
      shortBreakTime={shortBreakTime}
      longBreakTime={longBreakTime}
      onPomodoroTimeChange={handlePomodoroTimeChange}
      onShortBreakTimeChange={handleShortBreakTimeChange}
      onLongBreakTimeChange={handleLongBreakTimeChange}
      alarmSound={alarmSound}
      alarmDuration={alarmDuration}
      onAlarmSoundChange={setAlarmSound}
      onAlarmDurationChange={handleAlarmDurationChange}
    />
  );
};

export default App; 