require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const setupDatabase = async () => {
  // Connect to PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();

  try {
    console.log('🔄 Starting PostgreSQL database setup...');
    console.log('🔗 Connected to database');

    // Drop existing tables (cascade to handle foreign keys)
    await client.query('DROP TABLE IF EXISTS request_history CASCADE');
    await client.query('DROP TABLE IF EXISTS folder_requests CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('🗑️  Dropped existing tables (if any)');

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        employee_number VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('requester', 'level1', 'level2', 'level3')),
        department VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create folder_requests table
    await client.query(`
      CREATE TABLE folder_requests (
        id SERIAL PRIMARY KEY,
        request_number VARCHAR(50) UNIQUE NOT NULL,
        requester_id INTEGER REFERENCES users(id),
        station_name VARCHAR(255) NOT NULL,
        program_name VARCHAR(255) NOT NULL,
        broadcast_date DATE NOT NULL,
        episode_number VARCHAR(50),
        presenter_name VARCHAR(255),
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending_level1'
          CHECK (status IN ('pending_level1', 'pending_level2', 'pending_level3', 'approved', 'declined')),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        level1_responded_at TIMESTAMP,
        level2_responded_at TIMESTAMP,
        level3_responded_at TIMESTAMP,
        completed_at TIMESTAMP,
        level1_approver_id INTEGER REFERENCES users(id),
        level1_comment TEXT,
        level1_decision VARCHAR(20) CHECK (level1_decision IN ('approved', 'declined')),
        level2_approver_id INTEGER REFERENCES users(id),
        level2_comment TEXT,
        level2_decision VARCHAR(20) CHECK (level2_decision IN ('approved', 'declined')),
        level3_approver_id INTEGER REFERENCES users(id),
        level3_comment TEXT,
        level3_decision VARCHAR(20) CHECK (level3_decision IN ('approved', 'declined'))
      )
    `);
    console.log('✅ Folder requests table created');

    // Create history table
    await client.query(`
      CREATE TABLE request_history (
        id SERIAL PRIMARY KEY,
        request_id INTEGER REFERENCES folder_requests(id) ON DELETE CASCADE,
        actor_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        comment TEXT,
        previous_status VARCHAR(20),
        new_status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ History table created');

    // Create indexes for performance
    await client.query('CREATE INDEX idx_requests_status ON folder_requests(status)');
    await client.query('CREATE INDEX idx_requests_requester ON folder_requests(requester_id)');
    await client.query('CREATE INDEX idx_history_request ON request_history(request_id)');
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

    for (const user of users) {
      await client.query(
        `INSERT INTO users (employee_number, full_name, role, department, password_hash)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.employee_number, user.full_name, user.role, user.department, hashedPassword]
      );
      console.log(`✅ Created user: ${user.full_name} (${user.employee_number})`);
    }

    console.log('\n✅ PostgreSQL database setup completed successfully!');
    console.log('\n📝 Mock users created:');
    console.log('   Requester: 10001 / password123');
    console.log('   Level 1 (عيسى العنزي): 20001 / password123');
    console.log('   Level 2 (مشعل سعود الزمنان): 30001 / password123');
    console.log('   Level 3 (Eng. صادق): 40001 / password123');
    console.log('\n🚀 Backend is ready for deployment on Render!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

setupDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
