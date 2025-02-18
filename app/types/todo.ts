export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
<<<<<<< HEAD
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags: string[];
  deleted: boolean;
  order: number;
  subTasks: SubTask[];
  category?: string;
=======
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  tags?: string[];
  deleted: boolean;
  order: number;
  subTasks?: SubTask[];
  category?: string;
  deleted?: boolean;
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08
  
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
<<<<<<< HEAD
  parentId?: string;
  isGroup?: boolean;
  reminderSettings?: {
    before: number;
=======
  parentId?: string; // 用于支持任务分组
  isGroup?: boolean; // 标记是否为任务组
  reminderSettings?: {
    before: number; // 提前提醒的分钟数
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08
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
<<<<<<< HEAD
}

interface TaskInputProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'deleted'>) => void;
=======
>>>>>>> d4e05389d0aa99b6da108c95fc57c4791620fe08
} 