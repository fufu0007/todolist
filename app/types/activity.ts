export interface ActivityRingsData {
  todos: number;      // 完成率 (0-1)
  sessions: number;   // 专注次数比例 (0-1)
  focus: number;      // 专注时长比例 (0-1)
}

export interface ActivityRingsProps {
  size: number;
  data: ActivityRingsData;
} 