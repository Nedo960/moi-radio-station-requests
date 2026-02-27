# Radio Station Folder Request System - Technical Summary

## Project Overview
A complete 3-level approval workflow system for the Ministry of Information of Kuwait, specifically for radio station folder requests. Built with React frontend and Node.js/Express backend using SQLite database.

**Location**: `C:\Users\asus\OneDrive\Desktop\personal anti G\raido station request folder`

## Technology Stack
- **Frontend**: React 19, CSS3
- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3) for local development
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with MOI blue theme (#0052A5, #003d7a)

---

## User Roles & Credentials

### Test Accounts (All passwords: `password123`)

| Role | Employee # | Name | Arabic Title |
|------|-----------|------|--------------|
| Requester | 10001 | Quran Station | مقدم الطلب |
| Level 1 Approver | 20001 | عيسى العنزي | المدير العام |
| Level 2 Approver | 30001 | مشعل سعود الزمنان | المراقب |
| Level 3 Approver | 40001 | صادق خاجه | رئيس قسم الأرشيف |

---

## Database Schema

### Tables

**users**
```sql
- id (INTEGER PRIMARY KEY)
- employee_number (TEXT UNIQUE)
- full_name (TEXT)
- role (TEXT: requester/level1/level2/level3)
- department (TEXT)
- password_hash (TEXT)
- created_at (DATETIME)
```

**folder_requests**
```sql
- id (INTEGER PRIMARY KEY)
- request_number (TEXT UNIQUE)
- requester_id (INTEGER FK)
- station_name (TEXT)
- folder_description (TEXT)
- folder_location (TEXT)
- status (TEXT: pending_level1/pending_level2/pending_level3/approved/declined)
- submitted_at (DATETIME)
- level1_responded_at (DATETIME)
- level2_responded_at (DATETIME)
- level3_responded_at (DATETIME)
- completed_at (DATETIME)
```

**request_history**
```sql
- id (INTEGER PRIMARY KEY)
- request_id (INTEGER FK)
- actor_id (INTEGER FK)
- action (TEXT: submit/approve/decline)
- comments (TEXT)
- created_at (DATETIME)
```

---

## State Machine Workflow

### Request States
1. **pending_level1** → awaiting المدير العام (عيسى العنزي)
2. **pending_level2** → awaiting المراقب (مشعل سعود الزمنان)
3. **pending_level3** → awaiting رئيس قسم الأرشيف (صادق خاجه)
4. **approved** → final approval
5. **declined** → rejected (can happen at any level)

### State Transitions
- Submit → pending_level1
- Level 1 Approve → pending_level2
- Level 2 Approve → pending_level3
- Level 3 Approve → approved
- Any Level Decline → declined

---

## File Structure

```
raido station request folder/
├── backend/
│   ├── server-sqlite.js          # Express server with JWT auth
│   ├── setup-db-sqlite.js        # Database initialization script
│   ├── radio_station.db          # SQLite database file
│   ├── schema.sql                # Database schema
│   ├── .env                      # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js              # Main dashboard with stats
│   │   │   ├── Login.js                  # Login page with emblems
│   │   │   ├── RequestsTable.js          # Requests list table
│   │   │   ├── RequestModal.js           # View/respond to requests
│   │   │   ├── NewRequestModal.js        # Create new request
│   │   │   ├── Notifications.js          # Real-time notifications
│   │   │   └── AllNotificationsModal.js  # View all notifications
│   │   ├── App.js                # Main app component
│   │   ├── index.js              # React 19 entry point
│   │   ├── index.css             # Global styles (MOI theme)
│   │   ├── kuwait-city.jpg       # Background image
│   │   ├── kuwait-emblem.png     # Kuwait State emblem
│   │   └── moi-emblem.jpg        # MOI emblem
│   ├── public/
│   │   └── kuwait-city.jpg
│   └── package.json
│
└── PROJECT_SUMMARY.md            # This file
```

---

## Key Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Token stored in localStorage
- Automatic role detection for dashboard views

### 2. Dashboard
- **Requester View**: Shows pending, in-progress, approved, declined counts
- **Approver View**: Shows pending (awaiting their approval), approved, declined counts
- Real-time stats from database
- Professional stat cards with icons

### 3. Request Management
- **Create Request**: Auto-fills station name from logged-in user
- **View Requests**: Different views for requesters vs approvers
- **Approve/Decline**: Comments required, state machine enforced
- **Timeline**: Shows full approval history with timestamps
- **Time Tracking**: Calculates duration between approval levels

### 4. Notifications System
- **Real-time Updates**: Polls every 10 seconds
- **Persistent Storage**: Uses localStorage with user-specific keys
- **Read/Unread Tracking**: Mark individual notifications as read
- **Delete Functionality**: Delete individual or all notifications
- **Deleted Tracking**: Prevents deleted notifications from reappearing
- **Smart Notifications**:
  - Requesters: Status changes, pending alerts
  - Approvers: New pending requests
- **Dropdown View**: Shows 5 most recent
- **Full Modal**: View all notifications with bulk actions

### 5. UI/UX Design
- **MOI Blue Theme**: #0052A5 (primary), #003d7a (dark)
- **RTL (Right-to-Left)**: Full Arabic interface support
- **Kuwait City Background**: High-resolution image on login
- **Official Emblems**:
  - Kuwait State emblem (top right corner)
  - MOI emblem (top left corner)
- **Professional Symbols**: No emojis, only professional icons
  - ◷ (pending), ⟳ (in-progress), ✓ (approved), ✕ (declined)
- **Responsive Design**: Mobile-friendly layouts
- **Glass-morphism**: Login card with backdrop blur

---

## API Endpoints

### Authentication
- `POST /api/login` - Login with employee_number and password

### Requests
- `GET /api/requests` - Get all requests (filtered by user role)
- `GET /api/requests/:id` - Get single request details
- `POST /api/requests` - Create new request (requester only)
- `POST /api/requests/:id/respond` - Approve/decline request (approvers only)

### Stats
- `GET /api/stats` - Get dashboard statistics (role-specific)

---

## Running the Application

### Backend Setup
```bash
cd backend
npm install
node setup-db-sqlite.js    # Initialize database
npm run dev                # Start server on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start                  # Start on http://localhost:3000
```

### Both servers must be running simultaneously.

---

## Design Decisions & Solutions

### 1. Database Choice
- **Initially**: PostgreSQL (Render cloud database)
- **Problem**: SSL connection issues
- **Solution**: Switched to SQLite for local development
- **Benefit**: Simplified setup, no external dependencies

### 2. React 19 Compatibility
- **Problem**: `ReactDOM.render is not a function`
- **Solution**: Updated to `createRoot()` API
```javascript
// Old: ReactDOM.render(<App />, root)
// New: createRoot(root).render(<App />)
```

### 3. Background Image in CSS
- **Problem**: Can't use `%PUBLIC_URL%` in CSS files
- **Solution**: Moved image to `src/` folder, use relative path `./kuwait-city.jpg`

### 4. Notification Persistence
- **Problem**: Deleted notifications reappeared on refresh
- **Solution**: Track deleted notification IDs in separate localStorage key
```javascript
localStorage.setItem(`deleted_notifications_${user.id}`, JSON.stringify(deletedIds))
```

### 5. Professional Appearance
- **Removed**: All emojis (🔔, ✅, ❌, ⏳, 🔄)
- **Replaced**: With professional Unicode symbols (◉, ✓, ✕, ◷, ⟳)
- **Reason**: More appropriate for Ministry/government system

---

## Color Palette

```css
--moi-blue: #0052A5;           /* Primary MOI blue */
--moi-dark-blue: #003d7a;      /* Dark blue for gradients */
--moi-light-blue: #3498db;     /* Light blue accents */
--kuwait-white: #FFFFFF;       /* White */
--text-primary: #2c3e50;       /* Dark gray text */
--text-secondary: #7f8c8d;     /* Light gray text */
--border-color: #dfe6e9;       /* Borders */
--success: #27ae60;            /* Green for approved */
--warning: #f39c12;            /* Orange for warnings */
--danger: #e74c3c;             /* Red for declined */
```

---

## Arabic Translations

| English | Arabic |
|---------|--------|
| Radio Station Folder Request System | نظام طلبات الملفات الإذاعية |
| Login | تسجيل الدخول |
| Employee Number | رقم الموظف |
| Password | كلمة المرور |
| Pending | قيد الانتظار |
| In Progress | قيد المعالجة |
| Approved | تمت الموافقة |
| Declined | مرفوض |
| Station Name | اسم المحطة |
| Folder Description | وصف الملف |
| Folder Location | موقع الملف |
| Comments | الملاحظات |
| Approve | موافقة |
| Decline | رفض |
| New Request | طلب جديد |
| Notifications | الإشعارات |
| General Manager | المدير العام |
| Controller | المراقب |
| Head of Archiving | رئيس قسم الأرشيف |

---

## Important Notes

### Security
- Passwords are hashed with bcrypt (10 rounds)
- JWT secret: `radio-station-workflow-secret-key-2026`
- CORS enabled for localhost:3000
- SQL injection prevented by parameterized queries

### Performance
- SQLite synchronous API (no async overhead)
- Real-time notification polling (10 second intervals)
- LocalStorage for client-side caching
- Debounced API calls

### Browser Compatibility
- Tested on modern browsers (Chrome, Firefox, Edge)
- Requires ES6+ support
- RTL layout support required

---

## Future Enhancements (Optional)

1. **Email Notifications**: Send emails on status changes
2. **File Attachments**: Upload supporting documents
3. **Export Reports**: PDF/Excel export functionality
4. **Search & Filter**: Advanced filtering by date, status, station
5. **User Management**: Admin panel for creating users
6. **Audit Logs**: Complete activity tracking
7. **PostgreSQL Production**: Deploy with production database
8. **Netlify Deployment**: Host frontend on Netlify

---

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Run `node setup-db-sqlite.js` first
- Verify `.env` file exists with correct values

### Frontend can't connect
- Ensure backend is running on port 5000
- Check CORS settings in server-sqlite.js
- Verify fetch URLs use `http://localhost:5000`

### Login fails
- Verify database has users (run setup-db-sqlite.js)
- Check password is exactly `password123`
- Check JWT_SECRET in .env matches server

### Notifications not updating
- Check browser console for errors
- Verify localStorage is enabled
- Clear localStorage and refresh if corrupted

---

## Credits

**Built for**: Ministry of Information, State of Kuwait
**Project Type**: Radio Station Folder Request Approval System
**Architecture**: 3-layer approval workflow
**Development Date**: February 2026
**Technology**: React 19 + Express + SQLite

---

## Quick Reference Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Reset database
cd backend && node setup-db-sqlite.js

# View database
cd backend && sqlite3 radio_station.db
sqlite> .tables
sqlite> SELECT * FROM users;
sqlite> .quit

# Access application
http://localhost:3000
```

---

**END OF SUMMARY**
