CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    jira_reference VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    ticket_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    description TEXT,
    readiness_score INTEGER DEFAULT 0,
    readiness_status VARCHAR(30) DEFAULT 'NOT ASSESSED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readiness_assessments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,

    has_description BOOLEAN DEFAULT FALSE,
    has_steps_to_reproduce BOOLEAN DEFAULT FALSE,
    has_expected_behaviour BOOLEAN DEFAULT FALSE,
    has_actual_behaviour BOOLEAN DEFAULT FALSE,
    has_environment BOOLEAN DEFAULT FALSE,
    has_acceptance_criteria BOOLEAN DEFAULT FALSE,
    has_priority BOOLEAN DEFAULT FALSE,

    score INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL,
    missing_requirements TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS impact_assessments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,

    ui_impact BOOLEAN DEFAULT FALSE,
    api_impact BOOLEAN DEFAULT FALSE,
    database_impact BOOLEAN DEFAULT FALSE,
    authentication_impact BOOLEAN DEFAULT FALSE,
    security_impact BOOLEAN DEFAULT FALSE,
    integration_impact BOOLEAN DEFAULT FALSE,
    infrastructure_impact BOOLEAN DEFAULT FALSE,
    deployment_impact BOOLEAN DEFAULT FALSE,

    rollback_complexity VARCHAR(20) DEFAULT 'LOW',

    impact_score INTEGER NOT NULL,
    impact_level VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);