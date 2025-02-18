export interface Sound {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const alarmSounds: Sound[] = [
  {
    id: 'bell',
    name: '清脆铃声',
    url: '/sounds/bell.mp3',
    description: '清脆悦耳的铃声'
  },
  {
    id: 'marimba',
    name: '马林巴',
    url: '/sounds/marimba.mp3',
    description: '欢快的马林巴木琴声'
  },
  {
    id: 'piano',
    name: '钢琴旋律',
    url: '/sounds/piano.mp3',
    description: '轻快的钢琴提示音'
  },
  {
    id: 'xylophone',
    name: '木琴',
    url: '/sounds/xylophone.mp3',
    description: '节奏明快的木琴声'
  }
]; 