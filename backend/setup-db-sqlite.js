const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const setupDatabase = async () => {
  const dbPath = path.join(__dirname, 'radio_station.db');

  // Delete existing database
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️  Deleted existing database');
  }

  const db = new Database(dbPath);

  try {
    console.log('🔄 Starting database setup...');

    // Create users table
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_number TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('requester', 'level1', 'level2', 'level3')),
        department TEXT,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create folder_requests table
    db.exec(`
      CREATE TABLE folder_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_number TEXT UNIQUE NOT NULL,
        requester_id INTEGER REFERENCES users(id),
        station_name TEXT NOT NULL,
        program_name TEXT NOT NULL,
        broadcast_date DATE NOT NULL,
        episode_number TEXT,
        presenter_name TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending_level1'
          CHECK (status IN ('pending_level1', 'pending_level2', 'pending_level3', 'approved', 'declined')),
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        level1_responded_at DATETIME,
        level2_responded_at DATETIME,
        level3_responded_at DATETIME,
        completed_at DATETIME,
        level1_approver_id INTEGER REFERENCES users(id),
        level1_comment TEXT,
        level1_decision TEXT CHECK (level1_decision IN ('approved', 'declined')),
        level2_approver_id INTEGER REFERENCES users(id),
        level2_comment TEXT,
        level2_decision TEXT CHECK (level2_decision IN ('approved', 'declined')),
        level3_approver_id INTEGER REFERENCES users(id),
        level3_comment TEXT,
        level3_decision TEXT CHECK (level3_decision IN ('approved', 'declined'))
      )
    `);
    console.log('✅ Folder requests table created');

    // Create history table
    db.exec(`
      CREATE TABLE request_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER REFERENCES folder_requests(id) ON DELETE CASCADE,
        actor_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        comment TEXT,
        previous_status TEXT,
        new_status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ History table created');

    // Create indexes
    db.exec('CREATE INDEX idx_requests_status ON folder_requests(status)');
    db.exec('CREATE INDEX idx_requests_requester ON folder_requests(requester_id)');
    db.exec('CREATE INDEX idx_history_request ON request_history(request_id)');
    console.log('✅ Indexes created');

    // Hash password and insert users
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
      { employee_number: '10001', full_name: 'Quran Station', role: 'requester', department: 'Radio Broadcasting' },
      { employee_number: '20001', full_name: 'عيسى العنزي', role: 'level1', department: 'Management' },
      { employee_number: '30001', full_name: 'مشعل سعود الزمنان', role: 'level2', department: 'Supervision' },
      { employee_number: '40001', full_name: 'Eng. صادق', role: 'level3', department: 'Archiving' }
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (employee_number, full_name, role, department, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const user of users) {
      insertUser.run(user.employee_number, user.full_name, user.role, user.department, hashedPassword);
      console.log(`✅ Created user: ${user.full_name} (${user.employee_number})`);
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log(`📁 Database location: ${dbPath}`);
    console.log('\n📝 Mock users created:');
    console.log('   Requester: 10001 / password123');
    console.log('   Level 1 (عيسى العنزي): 20001 / password123');
    console.log('   Level 2 (مشعل سعود الزمنان): 30001 / password123');
    console.log('   Level 3 (Eng. صادق): 40001 / password123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    db.close();
  }
};

setupDatabase();
