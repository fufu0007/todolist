'use client';

import { TodoProvider } from '../contexts/TodoContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TodoProvider>
      {children}
    </TodoProvider>
  );
} 