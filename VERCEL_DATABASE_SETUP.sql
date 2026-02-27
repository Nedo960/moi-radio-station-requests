-- Vercel Postgres Database Setup Script
-- Run this in the Vercel Postgres Query Editor

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('requester', 'level1', 'level2', 'level3')),
  department VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create folder_requests table
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
);

-- Create history table
CREATE TABLE request_history (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES folder_requests(id) ON DELETE CASCADE,
  actor_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  comment TEXT,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_requests_status ON folder_requests(status);
CREATE INDEX idx_requests_requester ON folder_requests(requester_id);
CREATE INDEX idx_history_request ON request_history(request_id);

-- Insert test users
-- Password for all users: password123
-- Hash: $2b$10$K7LqHWz5qY3f8ZjY3Y3Y3e9Y3Y3Y3Y3Y3Y3Y3Y3Y3Y3Y3Y3Y3Y3Y3

INSERT INTO users (employee_number, full_name, role, department, password_hash) VALUES
('10001', 'Quran Station', 'requester', 'Radio Broadcasting', '$2a$10$YourHashHere'),
('20001', 'عيسى العنزي', 'level1', 'Management', '$2a$10$YourHashHere'),
('30001', 'مشعل سعود الزمنان', 'level2', 'Supervision', '$2a$10$YourHashHere'),
('40001', 'Eng. صادق', 'level3', 'Archiving', '$2a$10$YourHashHere');

-- Note: You need to generate the password hash first!
-- I'll create a helper script for this...
