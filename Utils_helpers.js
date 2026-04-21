import dayjs from 'dayjs';

export function formatDate(date) {
  return dayjs(date).format('DD MMM YYYY');
}

export function formatTime(isoStr) {
  return dayjs(isoStr).format('hh:mm A');
}

export function getTodayString() {
  return dayjs().format('YYYY-MM-DD');
}

export function getCompliancePct(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

export function getStatusColor(status) {
  const map = { pending: '#f59e0b', done: '#22c55e', overdue: '#ef4444' };
  return map[status] || '#9095a8';
}

export function getStatusLabel(status) {
  const map = { pending: 'Pending', done: 'Completed', overdue: 'Overdue' };
  return map[status] || status;
}

export function getFreqLabel(freq) {
  const map = { W: 'Weekly', M: 'Monthly', Q: 'Quarterly', Y: 'Yearly' };
  return map[freq] || freq;
}

export function groupTasksByPlant(tasks) {
  return tasks.reduce((acc, task) => {
    if (!acc[task.plantId]) acc[task.plantId] = [];
    acc[task.plantId].push(task);
    return acc;
  }, {});
}

export function groupTasksByStatus(tasks) {
  return {
    overdue:  tasks.filter(t => t.status === 'overdue'),
    pending:  tasks.filter(t => t.status === 'pending'),
    done:     tasks.filter(t => t.status === 'done'),
  };
}
