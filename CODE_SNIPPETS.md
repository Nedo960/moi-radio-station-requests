# Critical Code Snippets - Radio Station Request System

## Backend Configuration

### Environment Variables (.env)
```
PORT=5000
DATABASE_URL=postgresql://moi_fingerprint_user:...
JWT_SECRET=radio-station-workflow-secret-key-2026
```

### Server CORS Configuration (server-sqlite.js)
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## Frontend Configuration

### API Base URL
All fetch calls use: `http://localhost:5000/api/`

For production, replace with: `https://your-backend.onrender.com/api/`

---

## Key CSS Variables (index.css)

```css
:root {
  --moi-blue: #0052A5;
  --moi-dark-blue: #003d7a;
  --moi-light-blue: #3498db;
  --kuwait-white: #FFFFFF;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-color: #dfe6e9;
  --success: #27ae60;
  --warning: #f39c12;
  --danger: #e74c3c;
}
```

---

## Professional Symbols (No Emojis!)

```javascript
// Stat Cards & Notifications
'◷' // Pending/Clock
'⟳' // In Progress/Rotation
'✓' // Approved/Checkmark
'✕' // Declined/Cross
'●' // Info/Bullet
'■' // Default/Square
'◉' // Notification bell
'⚠' // Warning
```

---

## Arabic Status Text Mapping

```javascript
const getStatusText = (status) => {
  const statuses = {
    'pending_level1': 'بانتظار المدير العام',
    'pending_level2': 'بانتظار المراقب',
    'pending_level3': 'بانتظار رئيس قسم الأرشيف',
    'approved': 'تمت الموافقة',
    'declined': 'مرفوض',
  };
  return statuses[status] || status;
};
```

---

## Role Name Mapping

```javascript
const getRoleName = (role) => {
  const roles = {
    'requester': 'مقدم الطلب',
    'level1': 'عيسى العنزي (المدير العام)',
    'level2': 'مشعل سعود الزمنان (المراقب)',
    'level3': 'صادق خاجه (رئيس قسم الأرشيف)',
  };
  return roles[role] || role;
};
```

---

## Date Formatting (English Numbers)

```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

---

## Notification Persistence (Critical!)

```javascript
// Save notifications with user-specific key
const saveNotifications = (notifs) => {
  localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifs));
};

// Track deleted notifications to prevent them from reappearing
const saveDeletedIds = (ids) => {
  localStorage.setItem(`deleted_notifications_${user.id}`, JSON.stringify(ids));
};

// Filter out deleted notifications when fetching new ones
const deletedIds = getDeletedIds();
const filteredNew = newNotifications.filter(n => !deletedIds.includes(n.id));
```

---

## State Machine Transitions (Backend)

```javascript
const stateTransitions = {
  'pending_level1': {
    'level1': { approve: 'pending_level2', decline: 'declined' }
  },
  'pending_level2': {
    'level2': { approve: 'pending_level3', decline: 'declined' }
  },
  'pending_level3': {
    'level3': { approve: 'approved', decline: 'declined' }
  }
};
```

---

## Login Emblems Positioning

```css
.login-emblems {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 10;
  pointer-events: none;
}

.kuwait-emblem {
  height: 90px;
  position: fixed;
  top: 30px;
  right: 40px;
  z-index: 10;
}

.moi-emblem {
  height: 85px;
  position: fixed;
  top: 30px;
  left: 40px;
  z-index: 10;
}
```

---

## Background Image (Kuwait City)

```css
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('./kuwait-city.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;
}
```

---

## React 19 Entry Point (index.js)

```javascript
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**NOT**: `ReactDOM.render(<App />, document.getElementById('root'))`

---

## Database Reset Command

```bash
cd backend
node setup-db-sqlite.js
```

This recreates:
- 4 users with hashed passwords
- Empty folder_requests table
- Empty request_history table

---

## Import Statements for Emblems

```javascript
import kuwaitEmblem from '../kuwait-emblem.png';
import moiEmblem from '../moi-emblem.jpg';
```

---

## Auto-fill Station Name (NewRequestModal)

```javascript
useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    setFormData(prev => ({
      ...prev,
      station_name: user.full_name
    }));
  }
}, []);
```

---

## Notification Dropdown Centering

```css
.notifications-dropdown {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 450px;
  max-width: 90vw;
  max-height: 600px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}
```

---

## Password Hashing (Backend Setup)

```javascript
const bcrypt = require('bcrypt');
const password = 'password123';
const hashedPassword = await bcrypt.hash(password, 10);
```

---

## JWT Token Generation

```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

---

## Critical File Paths

```
frontend/src/kuwait-city.jpg
frontend/src/kuwait-emblem.png
frontend/src/moi-emblem.jpg
backend/radio_station.db
backend/.env
```

---

## Production URL Replacements

**Find and Replace in Frontend:**
```
Find:    http://localhost:5000
Replace: https://your-backend.onrender.com
```

**Files to Update:**
- Login.js
- Dashboard.js
- RequestModal.js
- NewRequestModal.js
- Notifications.js

---

## Common Errors & Fixes

### "render is not a function"
✅ Use `createRoot()` instead of `ReactDOM.render()`

### "Can't resolve '/kuwait-city.jpg'"
✅ Move image to `src/` folder, use `./kuwait-city.jpg`

### "Deleted notifications reappear"
✅ Track deleted IDs in separate localStorage key

### "Background image not showing"
✅ Use relative path in CSS: `url('./kuwait-city.jpg')`

---

**That's it! All critical code saved.**

Refer to:
1. **PROJECT_SUMMARY.md** - Full documentation
2. **DEPLOYMENT_GUIDE.md** - Deployment steps
3. **CODE_SNIPPETS.md** - This file (copy-paste ready)
4. **QUICK_START.md** - Quick reference
