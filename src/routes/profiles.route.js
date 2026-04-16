import { Router } from 'express';
import { validateCreateProfile } from '../middleware/validate.js';
import {
  createProfileHandler,
  getAllProfilesHandler,
  getProfileByIdHandler,
  deleteProfileHandler,
} from '../controllers/profiles.controller.js';

const router = Router();

router.post('/', validateCreateProfile, createProfileHandler);
router.get('/', getAllProfilesHandler);
router.get('/:id', getProfileByIdHandler);
router.delete('/:id', deleteProfileHandler);

export default router;