// 任务类型
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: Date;
}

// 番茄钟会话类型
interface PomodoroSession {
  id: string;
  startTime: Date;
  duration: number;
  taskId?: string;
}

// 活动环类型
interface ActivityRing {
  rate: number;
  color: string;
}

// 活动环属性类型
interface ActivityRingsProps {
  todos: Task[];
  sessions?: PomodoroSession[];
  size?: number;
  date?: Date;
} 