import AsyncStorage from '@react-native-async-storage/async-storage';
import { EQUIPMENTS, TASK_STATUS } from './Constants_equipments';
import { PLANTS, PLANT_SCHEDULE } from './Constants_plants';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

dayjs.extend(weekOfYear);

// Returns week of month (1-4) for a given date
export function getWeekOfMonth(date) {
  const d = dayjs(date);
  const dayOfMonth = d.date();
  return Math.ceil(dayOfMonth / 7);
}

// Core logic: should this task run on given date?
export function shouldTaskRun(schedule, date) {
  if (!schedule || schedule.months === 'NONE') return false;
  const d = dayjs(date);
  const currentMonth = d.month() + 1; // 1-12
  const currentWeek  = getWeekOfMonth(d);

  const monthMatch = schedule.months === 'ALL' || schedule.months.includes(currentMonth);
  if (!monthMatch) return false;

  if (!schedule.weeks || schedule.weeks.length === 0) return false;
  return schedule.weeks.includes(currentWeek);
}

// Generate tasks for today (or given date) for all plants
export async function generateDailyTasks(dateStr = null) {
  const today = dateStr || dayjs().format('YYYY-MM-DD');
  const storageKey = `tasks_${today}`;

  try {
    const existing = await AsyncStorage.getItem(storageKey);
    if (existing) {
      // Tasks already generated today — check for overdue from yesterday
      await markOverdueTasks(today);
      return JSON.parse(existing);
    }

    const tasks = [];

    PLANTS.forEach(plant => {
      const schedule = PLANT_SCHEDULE[plant.id];
      if (!schedule) return;

      EQUIPMENTS.forEach(equip => {
        const plantEquipSchedule = schedule[equip.id];
        if (!plantEquipSchedule) return;

        if (shouldTaskRun(plantEquipSchedule, today)) {
          tasks.push({
            id: uuidv4(),
            date: today,
            plantId: plant.id,
            plantName: plant.name,
            equipmentId: equip.id,
            equipmentName: equip.name,
            checklistNo: equip.checklistNo,
            freq: equip.freq,
            icon: equip.icon,
            category: equip.category,
            status: TASK_STATUS.PENDING,
            completedAt: null,
            completedBy: null,
            remarks: '',
            photoUri: null,
            createdAt: new Date().toISOString(),
          });
        }
      });
    });

    await AsyncStorage.setItem(storageKey, JSON.stringify(tasks));

    // Also update global tasks index
    const indexRaw = await AsyncStorage.getItem('tasks_index');
    const index = indexRaw ? JSON.parse(indexRaw) : [];
    if (!index.includes(today)) {
      index.push(today);
      await AsyncStorage.setItem('tasks_index', JSON.stringify(index));
    }

    return tasks;
  } catch (err) {
    console.error('generateDailyTasks error:', err);
    return [];
  }
}

// Mark tasks from previous days that are still pending as overdue
export async function markOverdueTasks(today) {
  try {
    const indexRaw = await AsyncStorage.getItem('tasks_index');
    if (!indexRaw) return;
    const index = JSON.parse(indexRaw);

    for (const date of index) {
      if (date >= today) continue;
      const key = `tasks_${date}`;
      const raw = await AsyncStorage.getItem(key);
      if (!raw) continue;
      const tasks = JSON.parse(raw);
      let changed = false;
      const updated = tasks.map(t => {
        if (t.status === TASK_STATUS.PENDING) {
          changed = true;
          return { ...t, status: TASK_STATUS.OVERDUE };
        }
        return t;
      });
      if (changed) await AsyncStorage.setItem(key, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('markOverdueTasks error:', err);
  }
}

// Load tasks for a specific date
export async function loadTasksForDate(date) {
  try {
    const raw = await AsyncStorage.getItem(`tasks_${date}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Update a single task
export async function updateTask(date, taskId, updates) {
  try {
    const key = `tasks_${date}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return false;
    const tasks = JSON.parse(raw);
    const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('updateTask error:', err);
    return false;
  }
}

// Get monthly stats for reports
export async function getMonthlyStats(year, month) {
  try {
    const indexRaw = await AsyncStorage.getItem('tasks_index');
    if (!indexRaw) return null;
    const index = JSON.parse(indexRaw);

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const monthDates = index.filter(d => d.startsWith(monthStr));

    let total = 0, done = 0, overdue = 0;
    const plantStats = {};

    for (const date of monthDates) {
      const tasks = await loadTasksForDate(date);
      tasks.forEach(t => {
        total++;
        if (t.status === TASK_STATUS.DONE) done++;
        if (t.status === TASK_STATUS.OVERDUE) overdue++;
        if (!plantStats[t.plantId]) plantStats[t.plantId] = { total: 0, done: 0 };
        plantStats[t.plantId].total++;
        if (t.status === TASK_STATUS.DONE) plantStats[t.plantId].done++;
      });
    }

    return {
      total, done, overdue,
      missed: overdue,
      compliance: total > 0 ? Math.round((done / total) * 100) : 0,
      plantStats,
    };
  } catch {
    return null;
  }
}
