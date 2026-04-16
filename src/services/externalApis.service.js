import axios from 'axios';
import { classifyAge, pickTopCountry } from '../utils/classify.js';

const TIMEOUT = 8000;

const http = axios.create({ timeout: TIMEOUT });

// ── Individual Fetchers ────────────────────────────────────

async function fetchGenderize(name) {
  try {
    const { data } = await http.get('https://api.genderize.io', {
      params: { name },
    });

    if (!data.gender || data.count === 0) {
      return { ok: false, source: 'Genderize' };
    }

    return {
      ok: true,
      gender: data.gender,
      gender_probability: data.probability,
      sample_size: data.count,
    };
  } catch {
    return { ok: false, source: 'Genderize' };
  }
}

async function fetchAgify(name) {
  try {
    const { data } = await http.get('https://api.agify.io', {
      params: { name },
    });

    if (data.age === null || data.age === undefined) {
      return { ok: false, source: 'Agify' };
    }

    return {
      ok: true,
      age: data.age,
      age_group: classifyAge(data.age),
    };
  } catch {
    return { ok: false, source: 'Agify' };
  }
}

async function fetchNationalize(name) {
  try {
    const { data } = await http.get('https://api.nationalize.io', {
      params: { name },
    });

    if (!data.country || data.country.length === 0) {
      return { ok: false, source: 'Nationalize' };
    }

    const top = pickTopCountry(data.country);

    return {
      ok: true,
      country_id: top.country_id,
      country_probability: top.probability,
    };
  } catch {
    return { ok: false, source: 'Nationalize' };
  }
}

// ── Main Aggregator ────────────────────────────────────────

/**
 * Call all three external APIs in parallel
 * and return merged profile data or an error
 *
 * @param {string} name
 * @returns {Promise<{ ok: boolean, source?: string, [key: string]: any }>}
 */
export async function fetchProfileData(name) {
  const [genderData, ageData, nationalityData] = await Promise.all([
    fetchGenderize(name),
    fetchAgify(name),
    fetchNationalize(name),
  ]);

  // Return the first failure found
  for (const result of [genderData, ageData, nationalityData]) {
    if (!result.ok) return result;
  }

  return {
    ok: true,
    gender: genderData.gender,
    gender_probability: genderData.gender_probability,
    sample_size: genderData.sample_size,
    age: ageData.age,
    age_group: ageData.age_group,
    country_id: nationalityData.country_id,
    country_probability: nationalityData.country_probability,
  };
}