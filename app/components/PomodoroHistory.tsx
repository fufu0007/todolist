import { Clock } from 'lucide-react';

interface PomodoroSession {
  startTime: Date;
  duration: number;
}

interface PomodoroHistoryProps {
  sessions: PomodoroSession[];
}

export default function PomodoroHistory({ sessions }: PomodoroHistoryProps) {
  const recentSessions = sessions.slice(-3);

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-600">近期专注</h4>
      {recentSessions.map((session, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            {session.startTime.toLocaleTimeString()} - {session.duration}分钟
          </span>
        </div>
      ))}
    </div>
  );
} 