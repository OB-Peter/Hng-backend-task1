import { v7 as uuidv7 } from 'uuid';
import db from '../config/database.js';

// ── Prepared Statements ────────────────────────────────────
const statements = {
  findByName: db.prepare(
    'SELECT * FROM profiles WHERE LOWER(name) = LOWER(?)'
  ),

  findById: db.prepare(
    'SELECT * FROM profiles WHERE id = ?'
  ),

  insert: db.prepare(`
    INSERT INTO profiles (
      id, name, gender, gender_probability, sample_size,
      age, age_group, country_id, country_probability, created_at
    ) VALUES (
      @id, @name, @gender, @gender_probability, @sample_size,
      @age, @age_group, @country_id, @country_probability, @created_at
    )
  `),

  deleteById: db.prepare(
    'DELETE FROM profiles WHERE id = ?'
  ),
};

// ── Formatters ─────────────────────────────────────────────

/**
 * Full profile shape — used in POST and GET /:id
 */
export function formatFull(profile) {
  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    gender_probability: profile.gender_probability,
    sample_size: profile.sample_size,
    age: profile.age,
    age_group: profile.age_group,
    country_id: profile.country_id,
    country_probability: profile.country_probability,
    created_at: profile.created_at,
  };
}

/**
 * List profile shape — used in GET /
 */
export function formatList(profile) {
  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    age: profile.age,
    age_group: profile.age_group,
    country_id: profile.country_id,
  };
}

// ── Service Methods ────────────────────────────────────────

export function getProfileByName(name) {
  return statements.findByName.get(name);
}

export function getProfileById(id) {
  return statements.findById.get(id);
}

export function createProfile(name, apiData) {
  const profile = {
    id: uuidv7(),
    name,
    gender: apiData.gender,
    gender_probability: apiData.gender_probability,
    sample_size: apiData.sample_size,
    age: apiData.age,
    age_group: apiData.age_group,
    country_id: apiData.country_id,
    country_probability: apiData.country_probability,
    created_at: new Date().toISOString(),
  };

  statements.insert.run(profile);

  // Return what was inserted from DB to ensure accuracy
  return statements.findById.get(profile.id);
}

export function removeProfile(id) {
  return statements.deleteById.run(id);
}

export function getAllProfiles({ gender, country_id, age_group } = {}) {
  let query = 'SELECT * FROM profiles WHERE 1=1';
  const params = [];

  if (gender) {
    query += ' AND LOWER(gender) = LOWER(?)';
    params.push(gender);
  }

  if (country_id) {
    query += ' AND LOWER(country_id) = LOWER(?)';
    params.push(country_id);
  }

  if (age_group) {
    query += ' AND LOWER(age_group) = LOWER(?)';
    params.push(age_group);
  }

  query += ' ORDER BY created_at DESC';

  return db.prepare(query).all(...params);
}