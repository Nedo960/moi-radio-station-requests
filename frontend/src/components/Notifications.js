import React, { useState, useEffect } from 'react';
import config from '../config';

const Notifications = ({ user, onViewAll }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const stored = localStorage.getItem(`notifications_${user.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
      const unread = parsed.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  };

  const saveNotifications = (notifs) => {
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifs));
  };

  const getDeletedIds = () => {
    const deleted = localStorage.getItem(`deleted_notifications_${user.id}`);
    return deleted ? JSON.parse(deleted) : [];
  };

  const saveDeletedIds = (ids) => {
    localStorage.setItem(`deleted_notifications_${user.id}`, JSON.stringify(ids));
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const requests = await response.json();

        // Create notifications based on role
        const newNotifications = [];
        const now = new Date();

        requests.forEach(request => {
          // For requesters: notify when status changes
          if (user.role === 'requester') {
            if (request.status === 'approved') {
              newNotifications.push({
                id: `${request.id}-approved`,
                type: 'success',
                message: `تمت الموافقة على الطلب ${request.request_number}`,
                request_id: request.id,
                time: request.completed_at,
                read: false,
              });
            } else if (request.status === 'declined') {
              newNotifications.push({
                id: `${request.id}-declined`,
                type: 'error',
                message: `تم رفض الطلب ${request.request_number}`,
                request_id: request.id,
                time: request.level1_responded_at || request.level2_responded_at || request.level3_responded_at,
                read: false,
              });
            } else if (request.status.includes('pending')) {
              const hoursSinceSubmit = (now - new Date(request.submitted_at)) / (1000 * 60 * 60);
              if (hoursSinceSubmit > 24) {
                newNotifications.push({
                  id: `${request.id}-pending`,
                  type: 'warning',
                  message: `الطلب ${request.request_number} قيد الانتظار منذ ${Math.floor(hoursSinceSubmit)} ساعة`,
                  request_id: request.id,
                  time: request.submitted_at,
                  read: false,
                });
              }
            }
          }

          // For approvers: notify of pending requests
          if ((user.role === 'level1' && request.status === 'pending_level1') ||
              (user.role === 'level2' && request.status === 'pending_level2') ||
              (user.role === 'level3' && request.status === 'pending_level3')) {
            newNotifications.push({
              id: `${request.id}-pending`,
              type: 'info',
              message: `طلب جديد بانتظار موافقتك: ${request.request_number}`,
              request_id: request.id,
              time: request.submitted_at,
              read: false,
            });
          }
        });

        // Get deleted notification IDs to filter them out
        const deletedIds = getDeletedIds();

        // Filter out deleted notifications from new notifications
        const filteredNew = newNotifications.filter(n => !deletedIds.includes(n.id));

        // Merge with existing notifications, preserving read status
        const existingNotifs = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
        const merged = [...filteredNew];

        // Add old notifications that are not in new ones and not deleted
        existingNotifs.forEach(oldNotif => {
          if (!deletedIds.includes(oldNotif.id) && !merged.find(n => n.id === oldNotif.id)) {
            merged.push(oldNotif);
          } else if (!deletedIds.includes(oldNotif.id)) {
            // Preserve read status for existing notifications
            const index = merged.findIndex(n => n.id === oldNotif.id);
            if (index !== -1 && oldNotif.read) {
              merged[index].read = true;
            }
          }
        });

        // Sort by time (newest first)
        merged.sort((a, b) => new Date(b.time) - new Date(a.time));

        setNotifications(merged);
        saveNotifications(merged);

        const unread = merged.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    saveNotifications(updated);

    // Track deleted notification ID to prevent it from coming back
    const deletedIds = getDeletedIds();
    if (!deletedIds.includes(notificationId)) {
      deletedIds.push(notificationId);
      saveDeletedIds(deletedIds);
    }

    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const clearAll = () => {
    // Track all current notification IDs as deleted
    const deletedIds = getDeletedIds();
    const allIds = notifications.map(n => n.id);
    const mergedDeleted = [...new Set([...deletedIds, ...allIds])];
    saveDeletedIds(mergedDeleted);

    setNotifications([]);
    saveNotifications([]);
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return '●';
      default: return '■';
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    if (onViewAll) {
      onViewAll(notifications, { markAsRead, markAllAsRead, deleteNotification, clearAll });
    }
  };

  return (
    <div className="notifications-container">
      <button className="notification-btn" onClick={handleNotificationClick}>
        ◉
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>الإشعارات</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read-btn" title="تحديد الكل كمقروء">
                  ✓✓
                </button>
              )}
              <button onClick={() => setShowDropdown(false)} className="close-dropdown">×</button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              <>
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                  >
                    <div className="notification-icon">{getIcon(notification.type)}</div>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <span className="notification-time">{formatTime(notification.time)}</span>
                    </div>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="mark-read-btn"
                          title="تحديد كمقروء"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="delete-notif-btn"
                        title="حذف"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <div className="view-all-container">
                    <button onClick={handleViewAll} className="view-all-btn">
                      عرض جميع الإشعارات ({notifications.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
