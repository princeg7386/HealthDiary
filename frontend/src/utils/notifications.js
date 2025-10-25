// Browser notification utilities

class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  scheduleMedicationReminder(medication) {
    const now = new Date();
    const times = medication.time_of_day;

    times.forEach(time => {
      const reminderTime = this.getNextReminderTime(time);
      const delay = reminderTime - now;

      if (delay > 0) {
        setTimeout(() => {
          this.showNotification(
            `💊 Medication Reminder`,
            {
              body: `Time to take ${medication.name} (${medication.dosage})`,
              tag: `med-${medication.id}-${time}`,
              requireInteraction: true,
              actions: [
                { action: 'taken', title: 'Taken' },
                { action: 'snooze', title: 'Snooze 10min' }
              ]
            }
          );
        }, delay);
      }
    });
  }

  getNextReminderTime(timeOfDay) {
    const now = new Date();
    const reminderTime = new Date();

    const timeMap = {
      'Morning': { hour: 8, minute: 0 },
      'Afternoon': { hour: 14, minute: 0 },
      'Evening': { hour: 18, minute: 0 },
      'Night': { hour: 21, minute: 0 }
    };

    const time = timeMap[timeOfDay] || timeMap['Morning'];
    reminderTime.setHours(time.hour, time.minute, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    return reminderTime;
  }
}

export const notificationManager = new NotificationManager();
