-- Create schema for radio station system
CREATE SCHEMA IF NOT EXISTS radio_station;

-- Set search path
SET search_path TO radio_station;

-- Drop existing tables
DROP TABLE IF EXISTS radio_station.request_history CASCADE;
DROP TABLE IF EXISTS radio_station.folder_requests CASCADE;
DROP TABLE IF EXISTS radio_station.users CASCADE;

-- Users table with roles
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('requester', 'level1', 'level2', 'level3')),
    department VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Folder requests table with state machine
CREATE TABLE folder_requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,

    -- Requester info
    requester_id INTEGER REFERENCES users(id),
    station_name VARCHAR(255) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    broadcast_date DATE NOT NULL,
    episode_number VARCHAR(50),
    presenter_name VARCHAR(255),
    notes TEXT,

    -- State machine
    status VARCHAR(50) NOT NULL DEFAULT 'pending_level1'
        CHECK (status IN ('pending_level1', 'pending_level2', 'pending_level3', 'approved', 'declined')),

    -- Timestamps for tracking
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level1_responded_at TIMESTAMP,
    level2_responded_at TIMESTAMP,
    level3_responded_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Approver responses
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

-- History table for audit trail
CREATE TABLE request_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES folder_requests(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    comment TEXT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_requests_status ON folder_requests(status);
CREATE INDEX idx_requests_requester ON folder_requests(requester_id);
CREATE INDEX idx_history_request ON request_history(request_id);
