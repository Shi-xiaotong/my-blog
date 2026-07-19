-- D1 Database Schema for auth system (anime blog)
-- Synced with workers/src/index.js ensureTables + migrateDatabase

CREATE TABLE IF NOT EXISTS anime_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS anime_user_auth_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  auth_type TEXT NOT NULL,
  auth_id TEXT NOT NULL,
  linked_at TEXT DEFAULT (datetime('now')),
  UNIQUE(auth_type, auth_id),
  FOREIGN KEY (email) REFERENCES anime_users(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_aum_email ON anime_user_auth_methods(email);
CREATE INDEX IF NOT EXISTS idx_aum_provider ON anime_user_auth_methods(auth_type, auth_id);

CREATE TABLE IF NOT EXISTS anime_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES anime_users(id) ON DELETE CASCADE,
  FOREIGN KEY (email) REFERENCES anime_users(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_as_token ON anime_sessions(token);
CREATE INDEX IF NOT EXISTS idx_as_user ON anime_sessions(user_id);

CREATE TABLE IF NOT EXISTS anime_password_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'register',
  used INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_apc_email ON anime_password_codes(email, code);

CREATE TABLE IF NOT EXISTS anime_verify_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_avc_email ON anime_verify_codes(email);

CREATE TABLE IF NOT EXISTS anime_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  anime_id TEXT NOT NULL,
  watched_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (email) REFERENCES anime_users(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ah_email ON anime_history(email);

CREATE TABLE IF NOT EXISTS anime_danmaku (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  anime_id TEXT NOT NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#ffffff',
  size TEXT DEFAULT 'normal',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (email) REFERENCES anime_users(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ad_anime ON anime_danmaku(anime_id);
CREATE INDEX IF NOT EXISTS idx_ad_email ON anime_danmaku(email);
