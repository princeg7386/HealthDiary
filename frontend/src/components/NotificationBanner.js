import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, X } from 'lucide-react';
import { notificationManager } from '@/utils/notifications';

function NotificationBanner({ onEnable }) {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShow(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    const granted = await notificationManager.requestPermission();
    if (granted) {
      setPermission('granted');
      setShow(false);
      onEnable?.();
    } else {
      setPermission('denied');
      setShow(false);
    }
  };

  if (!show || permission !== 'default') return null;

  return (
    <Card className="glass border-emerald-200 bg-gradient-to-r from-teal-50 to-cyan-50" data-testid="notification-banner">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-teal-600 animate-pulse" />
            <div>
              <p className="font-semibold text-emerald-900">Enable Medication Reminders</p>
              <p className="text-sm text-emerald-700">Get notified when it's time to take your medications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleEnable}
              data-testid="enable-notifications-btn"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Enable
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShow(false)}
              data-testid="dismiss-banner-btn"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationBanner;
