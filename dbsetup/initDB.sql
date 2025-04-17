-- 1. Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  auth_provider TEXT  -- e.g. 'Google', 'SharePoint'
);

-- 2. Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE
);

-- 3. Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,  -- allow null
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  tokens INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);