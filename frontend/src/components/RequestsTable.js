import React from 'react';

const RequestsTable = ({ requests, user, onViewRequest, onNewRequest, loading }) => {
  const getStatusText = (status) => {
    const statuses = {
      'pending_level1': 'بانتظار المدير العام',
      'pending_level2': 'بانتظار المراقب',
      'pending_level3': 'بانتظار رئيس قسم الارشيف',
      'approved': 'تمت الموافقة',
      'declined': 'مرفوض',
    };
    return statuses[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="requests-section">
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          جاري تحميل الطلبات...
        </div>
      </div>
    );
  }

  return (
    <div className="requests-section">
      <div className="section-header">
        <h2>الطلبات</h2>
        {user.role === 'requester' && (
          <button className="new-request-btn" onClick={onNewRequest}>
            + طلب جديد
          </button>
        )}
      </div>

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          لا توجد طلبات حالياً
        </div>
      ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>اسم المحطة</th>
              <th>اسم البرنامج</th>
              <th>تاريخ البث</th>
              <th>الحالة</th>
              <th>تاريخ التقديم</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.request_number}</td>
                <td>{request.station_name}</td>
                <td>{request.program_name}</td>
                <td>{formatDate(request.broadcast_date)}</td>
                <td>
                  <span className={`status-badge ${request.status}`}>
                    {getStatusText(request.status)}
                  </span>
                </td>
                <td>{formatDate(request.submitted_at)}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => onViewRequest(request)}
                  >
                    عرض
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RequestsTable;
