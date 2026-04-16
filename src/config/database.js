import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', '..', 'profiles.db');

const db = new Database(dbPath);

// Performance optimization
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ─────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL UNIQUE COLLATE NOCASE,
    gender              TEXT NOT NULL,
    gender_probability  REAL NOT NULL,
    sample_size         INTEGER NOT NULL,
    age                 INTEGER NOT NULL,
    age_group           TEXT NOT NULL,
    country_id          TEXT NOT NULL,
    country_probability REAL NOT NULL,
    created_at          TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_profiles_name
    ON profiles (LOWER(name));

  CREATE INDEX IF NOT EXISTS idx_profiles_gender
    ON profiles (LOWER(gender));

  CREATE INDEX IF NOT EXISTS idx_profiles_country_id
    ON profiles (LOWER(country_id));

  CREATE INDEX IF NOT EXISTS idx_profiles_age_group
    ON profiles (LOWER(age_group));
`);

export default db;