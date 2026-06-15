import db from "./db";

export function initializeDatabase() {
  console.log("🗄️ Initializing database...");

  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS profile (
      id          INTEGER PRIMARY KEY,
      name        TEXT NOT NULL,
      reg_number  TEXT,
      gpa         REAL DEFAULT 0.0,
      credits     INTEGER DEFAULT 0,
      avatar_uri  TEXT
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT NOT NULL,
      code  TEXT,
      color TEXT DEFAULT '#6366f1'
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id  INTEGER REFERENCES subjects(id),
      lecturer    TEXT NOT NULL,
      type        TEXT NOT NULL CHECK(type IN ('Online', 'Physical')),
      day         TEXT NOT NULL,
      start_time  TEXT NOT NULL,
      end_time    TEXT NOT NULL,
      location    TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id  INTEGER REFERENCES subjects(id),
      title       TEXT NOT NULL,
      description TEXT,
      due_date    TEXT NOT NULL,
      priority    TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      status      TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'done')),
      created_at  TEXT DEFAULT (datetime('now'))
    );

    DROP TABLE IF EXISTS notifications;
    CREATE TABLE IF NOT EXISTS notifications (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT NOT NULL,
      body         TEXT NOT NULL,
      type         TEXT NOT NULL CHECK(type IN ('task', 'class')),
      reference_id INTEGER,
      triggered_at TEXT NOT NULL,
      is_read      INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gpa_entries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      subject     TEXT NOT NULL,
      grade       TEXT NOT NULL,
      grade_point REAL NOT NULL,
      credits     INTEGER NOT NULL,
      semester    TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log("✅ Database ready!");
}
