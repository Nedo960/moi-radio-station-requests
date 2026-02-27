import React, { useState, useEffect } from 'react';
import config from '../config';

const RequestModal = ({ request, user, onClose, onUpdate }) => {
  const [requestDetails, setRequestDetails] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequestDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  const fetchRequestDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/requests/${request.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequestDetails(data);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      setError('فشل تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (decision) => {
    if (!comment.trim()) {
      setError('الرجاء إدخال تعليق');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/requests/${request.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          comment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'فشل في معالجة الطلب');
      }

      onUpdate();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} يوم${diffDays > 1 ? '' : ''} و ${diffHours % 24} ساعة`;
    }
    return `${diffHours} ساعة`;
  };

  const canRespond = () => {
    const statusMap = {
      'level1': 'pending_level1',
      'level2': 'pending_level2',
      'level3': 'pending_level3',
    };
    return statusMap[user.role] === request.status;
  };

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

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  const { request: req } = requestDetails;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>تفاصيل الطلب - {req.request_number}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {/* Request Details */}
        <div className="request-details">
          <div className="detail-item">
            <label>اسم المحطة</label>
            <p>{req.station_name}</p>
          </div>
          <div className="detail-item">
            <label>اسم البرنامج</label>
            <p>{req.program_name}</p>
          </div>
          <div className="detail-item">
            <label>تاريخ البث</label>
            <p>{formatDate(req.broadcast_date)}</p>
          </div>
          <div className="detail-item">
            <label>رقم الحلقة</label>
            <p>{req.episode_number || '-'}</p>
          </div>
          <div className="detail-item">
            <label>اسم المقدم</label>
            <p>{req.presenter_name || '-'}</p>
          </div>
          <div className="detail-item">
            <label>الحالة</label>
            <p>
              <span className={`status-badge ${req.status}`}>
                {getStatusText(req.status)}
              </span>
            </p>
          </div>
          {req.notes && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>ملاحظات</label>
              <p>{req.notes}</p>
            </div>
          )}
        </div>

        {/* Approval Timeline */}
        <div className="timeline">
          <h3>مسار الموافقة</h3>

          {/* Level 1 */}
          <div className="timeline-item">
            <div className="timeline-icon">1</div>
            <div className="timeline-content">
              <h4>عيسى العنزي (المدير العام)</h4>
              {req.level1_decision ? (
                <>
                  <p>
                    <strong>القرار:</strong> {req.level1_decision === 'approved' ? '✅ موافق' : '❌ مرفوض'}
                  </p>
                  <p><strong>التعليق:</strong> {req.level1_comment}</p>
                  <p><strong>التاريخ:</strong> {formatDate(req.level1_responded_at)}</p>
                  {req.level2_responded_at && (
                    <span className="time-badge">
                      ⏱ المدة حتى المراقب: {calculateDuration(req.level1_responded_at, req.level2_responded_at)}
                    </span>
                  )}
                </>
              ) : (
                <p style={{ color: '#f39c12' }}>⏳ بانتظار الموافقة</p>
              )}
            </div>
          </div>

          {/* Level 2 */}
          {(req.status === 'pending_level2' || req.status === 'pending_level3' || req.status === 'approved' || (req.status === 'declined' && req.level2_decision)) && (
            <div className="timeline-item">
              <div className="timeline-icon">2</div>
              <div className="timeline-content">
                <h4>مشعل سعود الزمنان (المراقب)</h4>
                {req.level2_decision ? (
                  <>
                    <p>
                      <strong>القرار:</strong> {req.level2_decision === 'approved' ? '✅ موافق' : '❌ مرفوض'}
                    </p>
                    <p><strong>التعليق:</strong> {req.level2_comment}</p>
                    <p><strong>التاريخ:</strong> {formatDate(req.level2_responded_at)}</p>
                    {req.level3_responded_at && (
                      <span className="time-badge">
                        ⏱ المدة حتى رئيس قسم الارشيف: {calculateDuration(req.level2_responded_at, req.level3_responded_at)}
                      </span>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#f39c12' }}>⏳ بانتظار الموافقة</p>
                )}
              </div>
            </div>
          )}

          {/* Level 3 */}
          {(req.status === 'pending_level3' || req.status === 'approved' || (req.status === 'declined' && req.level3_decision)) && (
            <div className="timeline-item">
              <div className="timeline-icon">3</div>
              <div className="timeline-content">
                <h4>صادق خاجه (رئيس قسم الارشيف)</h4>
                {req.level3_decision ? (
                  <>
                    <p>
                      <strong>القرار:</strong> {req.level3_decision === 'approved' ? '✅ موافق' : '❌ مرفوض'}
                    </p>
                    <p><strong>التعليق:</strong> {req.level3_comment}</p>
                    <p><strong>التاريخ:</strong> {formatDate(req.level3_responded_at)}</p>
                  </>
                ) : (
                  <p style={{ color: '#f39c12' }}>⏳ بانتظار الموافقة</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons for Approvers */}
        {canRespond() && (
          <div>
            <div className="form-group">
              <label>التعليق</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="أدخل تعليقك..."
                required
              />
            </div>
            <div className="action-buttons">
              <button
                className="approve-btn"
                onClick={() => handleRespond('approved')}
                disabled={submitting}
              >
                {submitting ? 'جاري المعالجة...' : '✅ موافقة'}
              </button>
              <button
                className="decline-btn"
                onClick={() => handleRespond('declined')}
                disabled={submitting}
              >
                {submitting ? 'جاري المعالجة...' : '❌ رفض'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestModal;
