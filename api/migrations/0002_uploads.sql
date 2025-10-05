CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  name TEXT,
  mime TEXT,
  data BLOB,
  created_at INTEGER
);
