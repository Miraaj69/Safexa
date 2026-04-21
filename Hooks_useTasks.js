import { useApp } from './Context_AppContext';
import { groupTasksByStatus, groupTasksByPlant } from './Utils_helpers';
import { useMemo } from 'react';

export function useTasks() {
  const { state, completeTask, refreshTasks } = useApp();
  const { tasks, loading } = state;

  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const byPlant = useMemo(() => groupTasksByPlant(tasks), [tasks]);

  const total     = tasks.length;
  const doneCount = grouped.done.length;
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return {
    tasks,
    loading,
    grouped,
    byPlant,
    total,
    doneCount,
    pct,
    completeTask,
    refreshTasks,
  };
}
