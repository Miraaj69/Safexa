// Firebase temporarily disabled - using local AsyncStorage only
import AsyncStorage from '@react-native-async-storage/async-storage';

export const db = null;
export const storage = null;
export const auth = null;

export async function signIn() {
  // no-op
}

export async function uploadTaskPhoto(taskId, localUri) {
  try {
    await AsyncStorage.setItem(`photo_${taskId}`, localUri);
    return localUri;
  } catch {
    return null;
  }
}

export async function saveTaskToFirestore(task) {
  try {
    const tasks = JSON.parse(await AsyncStorage.getItem('tasks_backup') || '[]');
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) tasks[idx] = task; else tasks.push(task);
    await AsyncStorage.setItem('tasks_backup', JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export async function getTasksFromFirestore(plantId, startDate, endDate) {
  try {
    const tasks = JSON.parse(await AsyncStorage.getItem('tasks_backup') || '[]');
    return tasks.filter(t =>
      t.plantId === plantId &&
      t.date >= startDate &&
      t.date <= endDate
    );
  } catch {
    return [];
  }
}
