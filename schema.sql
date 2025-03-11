-- Role table
CREATE TABLE role (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Project status table
CREATE TABLE project_status (
  status_id SERIAL PRIMARY KEY,
  status_name VARCHAR(50) UNIQUE
);

-- Check list table
CREATE TABLE check_list (
  check_id SERIAL PRIMARY KEY,
  check_name VARCHAR(100) UNIQUE,
  created_at TIMESTAMP
);

-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  personnel_id VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  password VARCHAR(255),
  email VARCHAR(100) UNIQUE,
  email_verified_at TIMESTAMP,
  photo_url VARCHAR(255),
  role_id INTEGER REFERENCES role(role_id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Project table
CREATE TABLE project (
  project_id SERIAL PRIMARY KEY,
  project_code VARCHAR(50) UNIQUE,
  project_name VARCHAR(100),
  project_owner VARCHAR(100),
  status_id INTEGER REFERENCES project_status(status_id),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Template table
CREATE TABLE template (
  template_id SERIAL PRIMARY KEY,
  template_name VARCHAR(100) UNIQUE,
  role_id INTEGER REFERENCES role(role_id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES project(project_id),
  task_name VARCHAR(255),
  progress INTEGER DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Project users junction table
CREATE TABLE project_users (
  project_id INTEGER REFERENCES project(project_id),
  user_id INTEGER REFERENCES users(user_id),
  position VARCHAR(100),
  PRIMARY KEY (project_id, user_id)
);

-- Template checks junction table
CREATE TABLE template_checks (
  template_id INTEGER REFERENCES template(template_id),
  check_id INTEGER REFERENCES check_list(check_id),
  PRIMARY KEY (template_id, check_id)
);

-- Task users junction table
CREATE TABLE task_users (
  task_id INTEGER REFERENCES tasks(task_id),
  user_id INTEGER REFERENCES users(user_id),
  PRIMARY KEY (task_id, user_id)
);

-- NextAuth sessions table
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE,
  user_id INTEGER REFERENCES users(user_id),
  expires TIMESTAMP
);

-- NextAuth verification tokens table
CREATE TABLE verification_tokens (
  token VARCHAR(255) PRIMARY KEY,
  identifier VARCHAR(255),
  expires TIMESTAMP,
  CONSTRAINT identifier_token_unique UNIQUE(identifier, token)
);