import React, { useState, useEffect } from 'react';
import config from '../config';

const NewRequestModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    station_name: '',
    program_name: '',
    broadcast_date: '',
    episode_number: '',
    presenter_name: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-fill station name based on logged-in user
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        station_name: user.full_name
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'فشل في إنشاء الطلب');
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>طلب ملف جديد</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="request-details">
            <div className="detail-item">
              <label>اسم المحطة *</label>
              <input
                type="text"
                name="station_name"
                value={formData.station_name}
                onChange={handleChange}
                required
                placeholder="مثال: محطة القرآن الكريم"
                readOnly
                style={{ background: '#f8f9fa', cursor: 'not-allowed' }}
              />
            </div>

            <div className="detail-item">
              <label>اسم البرنامج *</label>
              <input
                type="text"
                name="program_name"
                value={formData.program_name}
                onChange={handleChange}
                required
                placeholder="مثال: برنامج التلاوة المسائية"
              />
            </div>

            <div className="detail-item">
              <label>تاريخ البث *</label>
              <input
                type="date"
                name="broadcast_date"
                value={formData.broadcast_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="detail-item">
              <label>رقم الحلقة</label>
              <input
                type="text"
                name="episode_number"
                value={formData.episode_number}
                onChange={handleChange}
                placeholder="مثال: الحلقة 15"
              />
            </div>

            <div className="detail-item">
              <label>اسم المقدم</label>
              <input
                type="text"
                name="presenter_name"
                value={formData.presenter_name}
                onChange={handleChange}
                placeholder="مثال: أحمد محمد"
              />
            </div>

            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>ملاحظات</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </div>

          <div className="action-buttons">
            <button
              type="submit"
              className="approve-btn"
              disabled={submitting}
            >
              {submitting ? 'جاري الإنشاء...' : '✅ إنشاء الطلب'}
            </button>
            <button
              type="button"
              className="decline-btn"
              onClick={onClose}
              disabled={submitting}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequestModal;
