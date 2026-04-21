export const initialState = {
  tasks: [],
  completedTasks: [],
  selectedPlant: 'ALL',
  selectedDate: new Date().toISOString().split('T')[0],
  loading: false,
  error: null,
  notifications: [],
  offlineQueue: [],
};
