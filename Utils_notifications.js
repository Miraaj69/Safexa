import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function setupNotifications() {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  // Schedule daily morning reminder at 8:00 AM
  await scheduleDailyReminder();
}

export async function scheduleDailyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Safety Checklist Reminder',
      body: 'Aaj ki safety checklists pending hain. Abhi check karein!',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });

  // Evening follow-up at 4:00 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Pending Tasks Alert',
      body: 'Kuch tasks abhi bhi pending hain. End of day se pehle complete karein!',
      sound: true,
    },
    trigger: {
      hour: 16,
      minute: 0,
      repeats: true,
    },
  });
}

export async function sendOverdueAlert(count) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 Overdue Tasks!',
      body: `${count} tasks overdue hain. Turant dhyan dein!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // immediate
  });
}
