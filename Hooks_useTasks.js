import { useApp } from './Context_AppContext';
import { useMemo } from 'react';

export function useTasks() {
  const { state, completeTask, deleteTask, getTodayStats } = useApp();
  const { tasks } = state;

  const grouped = useMemo(() => ({
    overdue:   tasks.filter(t => t.status === 'overdue'),
    pending:   tasks.filter(t => t.status === 'pending'),
    completed: tasks.filter(t => t.status === 'completed'),
  }), [tasks]);

  const byPlant = useMemo(() =>
    tasks.reduce((acc, t) => {
      if (!acc[t.plantId]) acc[t.plantId] = [];
      acc[t.plantId].push(t);
      return acc;
    }, {}),
    [tasks]
  );

  const stats = getTodayStats();

  return {
    tasks,
    grouped,
    byPlant,
    total:     stats.total,
    doneCount: stats.completed,
    pct:       stats.compliance,
    completeTask,
    deleteTask,
  };
}
