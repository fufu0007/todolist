import React, { useState } from 'react';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [alarmSound, setAlarmSound] = useState<string>('bell');
  const [alarmDuration, setAlarmDuration] = useState<number>(3);

  return (
    <Settings
      alarmSound={alarmSound}
      alarmDuration={alarmDuration}
      onAlarmSoundChange={setAlarmSound}
      onAlarmDurationChange={setAlarmDuration}
    />
  );
};

export default App; 