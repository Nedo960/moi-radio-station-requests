import React, { useState, useEffect } from 'react';
import config from '../config';

const NewRequestModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    station_name: 'محطة القرآن الكريم',
    session_name: '',
    broadcast_type: '',
    program_name: '',
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

  // Initialize with "1- " when user focuses on empty textarea
  const handleProgramNameFocus = () => {
    if (!formData.program_name || formData.program_name.trim() === '') {
      setFormData({
        ...formData,
        program_name: '1- '
      });
    }
  };

  // Auto-numbering logic for program_name textarea
  const handleProgramNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentValue = formData.program_name;

      // Count all numbered lines to determine next number
      const lines = currentValue.split('\n');
      let nextNumber = 1;

      // Find the highest number in existing lines
      for (const line of lines) {
        const match = line.match(/^(\d+)-/);
        if (match) {
          const num = parseInt(match[1]);
          if (num >= nextNumber) {
            nextNumber = num + 1;
          }
        }
      }

      // Add new numbered line
      const newValue = currentValue + '\n' + `${nextNumber}- `;
      setFormData({
        ...formData,
        program_name: newValue
      });
    }
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
            {/* Top-Right: Station Name (Read-Only) */}
            <div className="detail-item">
              <label>اسم المحطة *</label>
              <input
                type="text"
                name="station_name"
                value={formData.station_name}
                onChange={handleChange}
                required
                placeholder="محطة القرآن الكريم"
                readOnly
                disabled
                style={{ background: '#f8f9fa', cursor: 'not-allowed' }}
              />
            </div>

            {/* Top-Left: Session Name (was Program Name) */}
            <div className="detail-item">
              <label>اسم الدورة *</label>
              <input
                type="text"
                name="session_name"
                value={formData.session_name}
                onChange={handleChange}
                required
                placeholder="مثال: برنامج التلاوة المسائية"
              />
            </div>

            {/* Middle-Right: Broadcast Type Dropdown (was Broadcast Date) */}
            <div className="detail-item">
              <label>نوع البث *</label>
              <select
                name="broadcast_type"
                value={formData.broadcast_type}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white'
                }}
              >
                <option value="">اختر نوع البث</option>
                <option value="مباشر">مباشر (Live)</option>
                <option value="مسجل">مسجل (Recorded)</option>
              </select>
            </div>

            {/* Middle-Left: DELETED (was Episode Number) */}

            {/* Bottom: Program Name - Large Textarea with Auto-Numbering */}
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>اسم البرنامج *</label>
              <textarea
                name="program_name"
                value={formData.program_name}
                onChange={handleChange}
                onFocus={handleProgramNameFocus}
                onKeyDown={handleProgramNameKeyDown}
                required
                rows="8"
                style={{
                  minHeight: '180px',
                  resize: 'vertical',
                  direction: 'rtl',
                  textAlign: 'right'
                }}
              />
            </div>

            {/* Bottom: Notes - Smaller Textarea */}
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>ملاحظات</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="أي ملاحظات إضافية..."
                rows="4"
                style={{
                  minHeight: '100px',
                  resize: 'vertical'
                }}
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
