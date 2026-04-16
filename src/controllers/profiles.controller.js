import { fetchProfileData } from '../services/externalApis.service.js';
import {
  getProfileByName,
  getProfileById,
  createProfile,
  removeProfile,
  getAllProfiles,
  formatFull,
  formatList,
} from '../services/profiles.service.js';

// ── POST /api/profiles ─────────────────────────────────────
export async function createProfileHandler(req, res, next) {
  try {
    const { name } = req.body;

    // Idempotency check
    const existing = getProfileByName(name);
    if (existing) {
      return res.status(200).json({
        status: 'success',
        message: 'Profile already exists',
        data: formatFull(existing),
      });
    }

    // Call external APIs in parallel
    const apiData = await fetchProfileData(name);

    if (!apiData.ok) {
      return res.status(502).json({
        status: 'error',
        message: `${apiData.source} returned an invalid response`,
      });
    }

    // Persist to database
    const profile = createProfile(name, apiData);

    return res.status(201).json({
      status: 'success',
      data: formatFull(profile),
    });

  } catch (err) {
    next(err);
  }
}

// ── GET /api/profiles ──────────────────────────────────────
export function getAllProfilesHandler(req, res, next) {
  try {
    const { gender, country_id, age_group } = req.query;

    const profiles = getAllProfiles({ gender, country_id, age_group });

    return res.status(200).json({
      status: 'success',
      count: profiles.length,
      data: profiles.map(formatList),
    });

  } catch (err) {
    next(err);
  }
}

// ── GET /api/profiles/:id ──────────────────────────────────
export function getProfileByIdHandler(req, res, next) {
  try {
    const profile = getProfileById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: formatFull(profile),
    });

  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/profiles/:id ───────────────────────────────
export function deleteProfileHandler(req, res, next) {
  try {
    const profile = getProfileById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    removeProfile(req.params.id);

    return res.status(204).send();

  } catch (err) {
    next(err);
  }
}