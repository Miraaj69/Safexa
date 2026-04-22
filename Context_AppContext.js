import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialState } from './Constants_initialState';
import { CHECKLISTS, PLANTS, TASK_STATUS } from './Constants_data';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as Crypto from 'expo-crypto';

dayjs.extend(isBetween);

const uuid = () => Crypto.randomUUID();
const STORAGE_KEY = 'safexa_state_v3';

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t),
      };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    case 'BULK_ADD_TASKS':
      return { ...state, tasks: [...state.tasks, ...action.payload] };

    case 'UPDATE_SCHEDULE_CONFIG':
      return {
        ...state,
        scheduleConfigs: state.scheduleConfigs.map(sc =>
          sc.id === action.payload.id ? { ...sc, ...action.payload } : sc
        ),
      };

    case 'ADD_PLANT':
      return { ...state, plants: [...state.plants, action.payload] };

    case 'ADD_CHECKLIST':
      return { ...state, checklists: [...state.checklists, action.payload] };

    case 'UPDATE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c),
      };

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: 'LOAD_STATE', payload: JSON.parse(raw) });
      } catch (e) { console.warn('State load error:', e); }
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(console.warn);
  }, [state]);

  // ─── Task generation ──────────────────────────────────────────────────────
  const generateTasksForToday = useCallback(() => {
    const today    = dayjs().format('YYYY-MM-DD');
    const existing = new Set(
      state.tasks.filter(t => t.date === today).map(t => `${t.plantId}_${t.checklistId}`)
    );
    const newTasks = [];

    state.plants.forEach(plant => {
      state.checklists.forEach(cl => {
        const key = `${plant.id}_${cl.id}`;
        if (existing.has(key)) return;
        const sc = state.scheduleConfigs.find(s => s.plantId === plant.id && s.checklistId === cl.id);
        if (!sc?.isAuto) return;
        const freq = sc.frequencyOverride || cl.defaultFreq;
        if (shouldGenerateToday(freq, today, sc)) {
          newTasks.push({
            id: uuid(), plantId: plant.id, checklistId: cl.id,
            date: today, status: TASK_STATUS.PENDING,
            remark: '', photoUrl: null,
            createdAt: new Date().toISOString(),
          });
        }
      });
    });

    if (newTasks.length > 0) dispatch({ type: 'BULK_ADD_TASKS', payload: newTasks });
    return newTasks.length;
  }, [state]);

  const syncOverdueTasks = useCallback(() => {
    const today = dayjs().format('YYYY-MM-DD');
    state.tasks.forEach(task => {
      if (task.status === TASK_STATUS.PENDING && task.date < today) {
        dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, status: TASK_STATUS.OVERDUE } });
      }
    });
  }, [state.tasks]);

  const addTask = useCallback((data) => {
    const task = {
      id: uuid(), status: TASK_STATUS.PENDING, remark: '', photoUrl: null,
      createdAt: new Date().toISOString(), date: dayjs().format('YYYY-MM-DD'), ...data,
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    return task;
  }, []);

  // NOTE: status = 'completed' (kept consistent with TASK_STATUS)
  const completeTask = useCallback((id, remark = '', photoUrl = null) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id, status: TASK_STATUS.COMPLETED, remark, photoUrl, completedAt: new Date().toISOString() },
    });
  }, []);

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const updateScheduleConfig = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_SCHEDULE_CONFIG', payload: { id, ...updates } });
  }, []);

  const addPlant = useCallback((plant) => {
    dispatch({ type: 'ADD_PLANT', payload: { id: uuid(), ...plant } });
  }, []);

  const addChecklist = useCallback((cl) => {
    dispatch({ type: 'ADD_CHECKLIST', payload: { id: uuid(), no: `CL-${Date.now()}`, ...cl } });
  }, []);

  const updateChecklist = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_CHECKLIST', payload: { id, ...updates } });
  }, []);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const getTodayStats = useCallback(() => {
    const today      = dayjs().format('YYYY-MM-DD');
    const todayTasks = state.tasks.filter(t => t.date === today);
    const completed  = todayTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const pending    = todayTasks.filter(t => t.status === TASK_STATUS.PENDING).length;
    const overdue    = state.tasks.filter(t => t.status === TASK_STATUS.OVERDUE).length;
    const total      = todayTasks.length;
    return { total, completed, pending, overdue, compliance: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [state.tasks]);

  const getPlantStats = useCallback((plantId) => {
    const today  = dayjs().format('YYYY-MM-DD');
    const tasks  = state.tasks.filter(t => t.plantId === plantId && t.date === today);
    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    return { total: tasks.length, completed, compliance: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0 };
  }, [state.tasks]);

  const getMonthlyStats = useCallback((month, year) => {
    const start = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).format('YYYY-MM-DD');
    const end   = dayjs(start).endOf('month').format('YYYY-MM-DD');
    const tasks = state.tasks.filter(t => t.date >= start && t.date <= end);
    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    return {
      total: tasks.length, completed,
      compliance: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [state.tasks]);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      addTask, completeTask, deleteTask,
      updateScheduleConfig, addPlant, addChecklist, updateChecklist,
      generateTasksForToday, syncOverdueTasks,
      getTodayStats, getPlantStats, getMonthlyStats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

function shouldGenerateToday(freq, today) {
  const d = dayjs(today);
  switch (freq) {
    case 'daily':     return true;
    case 'weekly':    return d.day() === 1;
    case 'monthly':   return d.date() === 1;
    case 'quarterly': return d.date() === 1 && [0,3,6,9].includes(d.month());
    case 'yearly':    return d.date() === 1 && d.month() === 0;
    default:          return false;
  }
}
