import React, { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Bell, Check, MailOpen } from 'lucide-react';
import { Button, Card, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const { notifications, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, isLoading } = useTaskStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Stay updated with comments, status updates, and tasks.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <Button size="sm" onClick={handleMarkAllRead}>
            <Check size={16} /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse h-16">
              <div />
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} />}
          title="All caught up!"
          description="You have no notifications at the moment."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-200 gap-4 ${
                notification.is_read ? 'opacity-70' : 'border-primary-500/30'
              }`}
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: notification.is_read ? 'var(--border-color)' : undefined
              }}
            >
              <div className="flex gap-3">
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notification.is_read ? 'bg-transparent' : 'bg-red-500 animate-pulse'}`} />
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{notification.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </p>
                  <span className="text-[10px] block mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notification.is_read && (
                <button
                  onClick={() => handleMarkRead(notification.id)}
                  className="p-1 hover:text-primary-500 rounded-md transition-colors shrink-0"
                  title="Mark as Read"
                >
                  <MailOpen size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
