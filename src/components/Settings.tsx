import React from 'react';
import { Form, Select, InputNumber, Space, Button, Divider } from 'antd';
import { alarmSounds } from '../config/sounds';

interface SettingsProps {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  onPomodoroTimeChange: (time: number) => void;
  onShortBreakTimeChange: (time: number) => void;
  onLongBreakTimeChange: (time: number) => void;
  alarmSound: string;
  alarmDuration: number;
  onAlarmSoundChange: (sound: string) => void;
  onAlarmDurationChange: (duration: number) => void;
}

const Settings: React.FC<SettingsProps> = ({
  pomodoroTime,
  shortBreakTime,
  longBreakTime,
  onPomodoroTimeChange,
  onShortBreakTimeChange,
  onLongBreakTimeChange,
  alarmSound,
  alarmDuration,
  onAlarmSoundChange,
  onAlarmDurationChange,
}) => {
  const playSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.play();
  };

  return (
    <Form layout="vertical">
      <Form.Item label="专注时长 (分钟)">
        <InputNumber
          min={1}
          value={pomodoroTime}
          onChange={onPomodoroTimeChange}
        />
      </Form.Item>
      <Form.Item label="短休息时长 (分钟)">
        <InputNumber
          min={1}
          value={shortBreakTime}
          onChange={onShortBreakTimeChange}
        />
      </Form.Item>
      <Form.Item label="长休息时长 (分钟)">
        <InputNumber
          min={1}
          value={longBreakTime}
          onChange={onLongBreakTimeChange}
        />
      </Form.Item>

      <Divider />

      <Form.Item label="提示音效">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            value={alarmSound}
            onChange={onAlarmSoundChange}
            style={{ width: '100%' }}
          >
            {alarmSounds.map(sound => (
              <Select.Option key={sound.id} value={sound.id}>
                <Space>
                  <span>{sound.name}</span>
                  <Button
                    type="link"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound(sound.url);
                    }}
                  >
                    试听
                  </Button>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Form.Item>

      <Form.Item label="音效播放时长 (秒)">
        <InputNumber
          min={1}
          max={10}
          value={alarmDuration}
          onChange={onAlarmDurationChange}
          style={{ width: 200 }}
        />
      </Form.Item>
    </Form>
  );
};

export default Settings; 