require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');

const setupDatabase = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Starting database setup...');

    // Create schema
    await pool.query('CREATE SCHEMA IF NOT EXISTS radio_station');
    await pool.query('SET search_path TO radio_station');
    console.log('✅ Schema created');

    // Drop existing tables
    await pool.query('DROP TABLE IF EXISTS radio_station.request_history CASCADE');
    await pool.query('DROP TABLE IF EXISTS radio_station.folder_requests CASCADE');
    await pool.query('DROP TABLE IF EXISTS radio_station.users CASCADE');
    console.log('✅ Old tables dropped');

    // Create users table
    await pool.query(`
      CREATE TABLE radio_station.users (
        id SERIAL PRIMARY KEY,
        employee_number VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('requester', 'level1', 'level2', 'level3')),
        department VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create folder_requests table
    await pool.query(`
      CREATE TABLE radio_station.folder_requests (
        id SERIAL PRIMARY KEY,
        request_number VARCHAR(50) UNIQUE NOT NULL,
        requester_id INTEGER REFERENCES radio_station.users(id),
        station_name VARCHAR(255) NOT NULL,
        program_name VARCHAR(255) NOT NULL,
        broadcast_date DATE NOT NULL,
        episode_number VARCHAR(50),
        presenter_name VARCHAR(255),
        notes TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending_level1'
          CHECK (status IN ('pending_level1', 'pending_level2', 'pending_level3', 'approved', 'declined')),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        level1_responded_at TIMESTAMP,
        level2_responded_at TIMESTAMP,
        level3_responded_at TIMESTAMP,
        completed_at TIMESTAMP,
        level1_approver_id INTEGER REFERENCES radio_station.users(id),
        level1_comment TEXT,
        level1_decision VARCHAR(20) CHECK (level1_decision IN ('approved', 'declined')),
        level2_approver_id INTEGER REFERENCES radio_station.users(id),
        level2_comment TEXT,
        level2_decision VARCHAR(20) CHECK (level2_decision IN ('approved', 'declined')),
        level3_approver_id INTEGER REFERENCES radio_station.users(id),
        level3_comment TEXT,
        level3_decision VARCHAR(20) CHECK (level3_decision IN ('approved', 'declined'))
      )
    `);
    console.log('✅ Folder requests table created');

    // Create history table
    await pool.query(`
      CREATE TABLE radio_station.request_history (
        id SERIAL PRIMARY KEY,
        request_id INTEGER REFERENCES radio_station.folder_requests(id) ON DELETE CASCADE,
        actor_id INTEGER REFERENCES radio_station.users(id),
        action VARCHAR(50) NOT NULL,
        comment TEXT,
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ History table created');

    // Create indexes
    await pool.query('CREATE INDEX idx_requests_status ON radio_station.folder_requests(status)');
    await pool.query('CREATE INDEX idx_requests_requester ON radio_station.folder_requests(requester_id)');
    await pool.query('CREATE INDEX idx_history_request ON radio_station.request_history(request_id)');
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

    // Set search path for schema
    await pool.query('SET search_path TO radio_station');

    for (const user of users) {
      await pool.query(
        `INSERT INTO radio_station.users (employee_number, full_name, role, department, password_hash)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.employee_number, user.full_name, user.role, user.department, hashedPassword]
      );
      console.log(`✅ Created user: ${user.full_name} (${user.employee_number})`);
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📝 Mock users created:');
    console.log('   Requester: 10001 / password123');
    console.log('   Level 1 (عيسى العنزي): 20001 / password123');
    console.log('   Level 2 (مشعل سعود الزمنان): 30001 / password123');
    console.log('   Level 3 (Eng. صادق): 40001 / password123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

setupDatabase();
