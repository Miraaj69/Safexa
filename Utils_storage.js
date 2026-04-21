import AsyncStorage from '@react-native-async-storage/async-storage';

// Generic get
export async function getItem(key) {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

// Generic set
export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Remove
export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// Offline queue: store actions when no internet
export async function addToOfflineQueue(action) {
  const queue = (await getItem('offline_queue')) || [];
  queue.push({ ...action, queuedAt: new Date().toISOString() });
  await setItem('offline_queue', queue);
}

export async function getOfflineQueue() {
  return (await getItem('offline_queue')) || [];
}

export async function clearOfflineQueue() {
  await removeItem('offline_queue');
}

// Report storage
export async function saveReport(reportData) {
  const reports = (await getItem('reports')) || [];
  reports.unshift({ ...reportData, savedAt: new Date().toISOString() });
  if (reports.length > 50) reports.pop(); // keep last 50
  await setItem('reports', reports);
}

export async function getReports() {
  return (await getItem('reports')) || [];
}
