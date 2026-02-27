import React, { useState, useEffect } from 'react';
import RequestsTable from './RequestsTable';
import RequestModal from './RequestModal';
import NewRequestModal from './NewRequestModal';
import Notifications from './Notifications';
import AllNotificationsModal from './AllNotificationsModal';
import config from '../config';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, []);

  const handleRefresh = () => {
    fetchStats();
    fetchRequests();
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
  };

  const handleViewAllNotifications = (notifications, actions) => {
    setNotificationData({ notifications, actions });
    setShowAllNotifications(true);
  };

  const getRoleName = (role) => {
    const roles = {
      'requester': 'مقدم الطلب',
      'level1': 'عيسى العنزي (المدير العام)',
      'level2': 'مشعل سعود الزمنان (المراقب)',
      'level3': 'صادق خاجه (رئيس قسم الارشيف)',
    };
    return roles[role] || role;
  };

  return (
    <>
      <div className="app-header">
        <div className="header-title">
          <h1>نظام طلبات الملفات الإذاعية</h1>
        </div>
        <div className="user-info">
          <Notifications user={user} onViewAll={handleViewAllNotifications} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{user.full_name}</div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>{getRoleName(user.role)}</div>
          </div>
          <button onClick={onLogout} className="logout-btn">
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div className="dashboard">
        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            {user.role === 'requester' ? (
              <>
                <div className="stat-card">
                  <div className="stat-icon pending">◷</div>
                  <div className="stat-content">
                    <h3>{stats.pending || 0}</h3>
                    <p>قيد الانتظار</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon in-progress">⟳</div>
                  <div className="stat-content">
                    <h3>{stats.in_progress || 0}</h3>
                    <p>قيد المعالجة</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon approved">✓</div>
                  <div className="stat-content">
                    <h3>{stats.approved || 0}</h3>
                    <p>تمت الموافقة</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon declined">✕</div>
                  <div className="stat-content">
                    <h3>{stats.declined || 0}</h3>
                    <p>مرفوض</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card">
                  <div className="stat-icon pending">◷</div>
                  <div className="stat-content">
                    <h3>{stats.pending || 0}</h3>
                    <p>بانتظار موافقتك</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon approved">✓</div>
                  <div className="stat-content">
                    <h3>{stats.approved || 0}</h3>
                    <p>تمت الموافقة</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon declined">✕</div>
                  <div className="stat-content">
                    <h3>{stats.declined || 0}</h3>
                    <p>مرفوض</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Requests Table */}
        <RequestsTable
          requests={requests}
          user={user}
          onViewRequest={handleViewRequest}
          onNewRequest={() => setShowNewRequestModal(true)}
          loading={loading}
        />
      </div>

      {/* Modals */}
      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          user={user}
          onClose={() => setSelectedRequest(null)}
          onUpdate={handleRefresh}
        />
      )}

      {showNewRequestModal && (
        <NewRequestModal
          onClose={() => setShowNewRequestModal(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showAllNotifications && notificationData && (
        <AllNotificationsModal
          notifications={notificationData.notifications}
          actions={notificationData.actions}
          onClose={() => setShowAllNotifications(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
