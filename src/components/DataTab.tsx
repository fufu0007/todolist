import React, { useState } from 'react';
import { DatePicker, Button, Space } from 'antd'; // 假设您使用的是 antd 的 DatePicker
import dayjs, { Dayjs } from 'dayjs';

const DataTab: React.FC = () => {
  // 将初始日期设置为今天
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const handleNoiseClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      <DatePicker 
        value={selectedDate}
        onChange={(date) => setSelectedDate(date)}
      />
      {/* ... 其他数据展示相关的组件 ... */}
      
      <Space direction="vertical" style={{ marginTop: '20px' }}>
        <h3>白噪音快捷链接</h3>
        <Space wrap>
          <Button onClick={() => handleNoiseClick('https://rainymood.com')}>
            下雨声
          </Button>
          <Button onClick={() => handleNoiseClick('https://asoftmurmur.com')}>
            环境音
          </Button>
          <Button onClick={() => handleNoiseClick('https://mynoise.net')}>
            自然音效
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default DataTab; 