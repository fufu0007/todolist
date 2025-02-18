export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags: string[];
  deleted: boolean;
  order: number;
  subTasks: SubTask[];
  category?: string;
  
  // 新增字段
  time?: {
    date?: string;
    time?: string;
    isAllDay?: boolean;
  };
  location?: {
    name: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  parentId?: string;
  isGroup?: boolean;
  reminderSettings?: {
    before: number;
    repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  };
}

export interface Stats {
  today: {
    tasks: {
      total: number;
      completed: number;
      rate: number;
    };
    focusTime: number;
    trend: number;
  };
  weekly: {
    date: string;
    completedTasks: number;
    totalTasks: number;
    focusTime: number;
  }[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

interface TaskInputProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'deleted'>) => void;
} 