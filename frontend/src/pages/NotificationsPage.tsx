import { useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';
import type { Notification } from '../types';
import { formatDateTime } from '../utils/format';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list()
      .then(res => setNotifications(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: number) => {
    await notificationsApi.markRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Уведомления</h1>
          <p className="text-slate-500 mt-1">{unreadCount} непрочитанных</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            Прочитать все
          </button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет уведомлений</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`flex items-start gap-3 py-3 px-4 rounded-lg cursor-pointer transition-colors ${
                  n.is_read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-blue-600'}`} />
                <div className="flex-1">
                  <p className={`text-sm ${n.is_read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                    {n.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
