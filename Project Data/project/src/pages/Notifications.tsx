import React from 'react';
import { useBatteryStore } from '../store/batteryStore';
import NotificationList from '../components/notifications/NotificationList';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useBatteryStore();
  
  return (
    <div className="max-w-4xl mx-auto">
      <NotificationList 
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
      />
    </div>
  );
};

export default Notifications;