import express from 'express';
import {
  listApps, getAppBySlug, getCategories, trackDownload,
  createApp, updateApp, deleteApp
} from '../controllers/appController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', listApps);
router.get('/categories', getCategories);
router.get('/slug/:slug', getAppBySlug);
router.post('/:slug/download', trackDownload);

// Admin
router.post('/', requireAuth, requireAdmin, createApp);
router.put('/:id', requireAuth, requireAdmin, updateApp);
router.delete('/:id', requireAuth, requireAdmin, deleteApp);

export default router;
