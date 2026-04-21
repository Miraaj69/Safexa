import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';

// 🔥 Replace with your Firebase project config
const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export const auth    = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch(err => {
  console.warn('Firestore offline persistence error:', err.code);
});

// Auth
export async function signIn() {
  try {
    await signInAnonymously(auth);
  } catch (err) {
    console.error('signIn error:', err);
  }
}

// Upload photo to Firebase Storage
export async function uploadTaskPhoto(taskId, localUri) {
  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `task_photos/${taskId}.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error('uploadTaskPhoto error:', err);
    return null;
  }
}

// Save completed task to Firestore
export async function saveTaskToFirestore(task) {
  try {
    await setDoc(doc(db, 'tasks', task.id), task);
    return true;
  } catch (err) {
    console.error('saveTaskToFirestore error:', err);
    return false;
  }
}

// Get tasks by plant and date range
export async function getTasksFromFirestore(plantId, startDate, endDate) {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('plantId', '==', plantId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('getTasksFromFirestore error:', err);
    return [];
  }
}
