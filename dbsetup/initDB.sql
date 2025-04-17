-- 1. Users table
CREATE TABLE users (
  userid UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  auth_provider TEXT  -- e.g. 'Google', 'SharePoint'
);

-- 2. chats table
CREATE TABLE chats (
  chatid UUID PRIMARY KEY,
  userid UUID REFERENCES users(userid) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_starred BOOLEAN DEFAULT FALSE
);

-- 3. Messages table
CREATE TABLE messages (
  messsageid UUID PRIMARY KEY,
  chatid UUID REFERENCES chats(chatid) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES messages(messsageid) ON DELETE SET NULL,  -- allow null
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  tokens INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);