import React, { useState } from 'react';
import kuwaitEmblem from '../kuwait-emblem.png';
import moiEmblem from '../moi-emblem.jpg';
import config from '../config';

const Login = ({ onLogin }) => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_number: employeeNumber,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-emblems">
        <img src={kuwaitEmblem} alt="شعار دولة الكويت" className="emblem kuwait-emblem" />
        <img src={moiEmblem} alt="شعار وزارة الإعلام" className="emblem moi-emblem" />
      </div>
      <div className="login-card">
        <div className="login-header">
          <h2>نظام طلبات الملفات الإذاعية</h2>
          <p>تسجيل الدخول</p>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>رقم الموظف</label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="أدخل رقم الموظف"
              required
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
          <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>
            <strong>حسابات تجريبية:</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>
            مقدم الطلب: 10001 / password123
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>
            المستوى الأول (عيسى العنزي): 20001 / password123
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>
            المستوى الثاني (مشعل سعود الزمنان): 30001 / password123
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d' }}>
            المستوى الثالث (صادق خاجه): 40001 / password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
