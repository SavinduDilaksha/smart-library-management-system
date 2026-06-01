'use client';

import { useEffect, useState } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface NotificationRecord {
  id: string;
  message: string;
  type: string;
  sentAt: string;
  read: boolean;
}

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
        
        // Mark all as read after fetching them
        const unreadCount = json.data.filter((n: NotificationRecord) => !n.read).length;
        if (unreadCount > 0) {
          await fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ all: true }),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotifStyle = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return {
          title: 'Activity Successful',
          icon: CheckCircle,
          color: '#10B981',
          bg: '#D1FAE5',
        };
      case 'DANGER':
        return {
          title: 'Alert / Overdue Notification',
          icon: AlertTriangle,
          color: '#EF4444',
          bg: '#FEE2E2',
        };
      case 'WARNING':
        return {
          title: 'System Warning',
          icon: AlertTriangle,
          color: '#F59E0B',
          bg: '#FEF3C7',
        };
      default:
        return {
          title: 'System Announcement',
          icon: Info,
          color: '#3B82F6',
          bg: '#DBEAFE',
        };
    }
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Your alerts, reminders, and announcements{unread > 0 ? ` · ${unread} unread` : ''}</p>
      </div>

      <div style={{ maxWidth: 680 }}>
        {loading ? (
          <div className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={24} color="var(--accent)" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <div className="empty-state-icon"><Bell size={22} /></div>
                <h3>No notifications</h3>
                <p>You&apos;ll be notified here about due dates, overdue books, fines, and library announcements.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((notif, i) => {
              const style = getNotifStyle(notif.type);
              const Icon = style.icon;
              return (
                <div
                  key={notif.id}
                  className="card animate-fade-in"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    borderLeft: notif.read ? '3px solid var(--border)' : `3px solid ${style.color}`,
                    opacity: notif.read ? 0.85 : 1,
                  }}
                >
                  <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={style.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{style.title}</span>
                        {!notif.read && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{notif.message}</p>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>{formatDate(notif.sentAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
