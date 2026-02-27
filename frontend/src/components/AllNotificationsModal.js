import React from 'react';

const AllNotificationsModal = ({ notifications, actions, onClose }) => {
  const { markAsRead, markAllAsRead, deleteNotification, clearAll } = actions;

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
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content all-notifications-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>جميع الإشعارات ({notifications.length})</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="all-notifications-actions">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="action-btn mark-all">
              ✓✓ تحديد الكل كمقروء ({unreadCount})
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={() => { if(window.confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) { clearAll(); onClose(); } }} className="action-btn clear-all">
              ✕ حذف الكل
            </button>
          )}
        </div>

        <div className="all-notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item-full ${notification.type} ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-icon-large">{getIcon(notification.type)}</div>
                <div className="notification-content-full">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time-full">{formatTime(notification.time)}</span>
                  {!notification.read && <span className="unread-indicator">جديد</span>}
                </div>
                <div className="notification-actions-full">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mark-read-btn-full"
                      title="تحديد كمقروء"
                    >
                      ✓ قراءة
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="delete-notif-btn-full"
                    title="حذف"
                  >
                    ✕ حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllNotificationsModal;
