import express from 'express';
import { getActivities } from '../controllers/activityController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:boardId', auth, getActivities);

export default router;
