import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initialState } from './initialState';
import { generateDailyTasks, loadTasksForDate, updateTask } from './Utils_taskGenerator';
import { getTodayString } from './Utils_helpers';
import { TASK_STATUS } from './Constants_equipments';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_SELECTED_PLANT':
      return { ...state, selectedPlant: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id
            ? { ...t, status: TASK_STATUS.DONE, completedAt: new Date().toISOString(), ...action.payload }
            : t
        ),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadTodayTasks();
  }, []);

  const loadTodayTasks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const today = getTodayString();
      const tasks = await generateDailyTasks(today);
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshTasks = async (date) => {
    const d = date || state.selectedDate;
    const tasks = await loadTasksForDate(d);
    dispatch({ type: 'SET_TASKS', payload: tasks });
  };

  const completeTask = async (taskId, updates) => {
    await updateTask(state.selectedDate, taskId, {
      ...updates,
      status: TASK_STATUS.DONE,
      completedAt: new Date().toISOString(),
    });
    dispatch({ type: 'COMPLETE_TASK', payload: { id: taskId, ...updates } });
  };

  const selectPlant = (plantId) => dispatch({ type: 'SET_SELECTED_PLANT', payload: plantId });

  return (
    <AppContext.Provider value={{ state, dispatch, refreshTasks, completeTask, selectPlant, loadTodayTasks }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
