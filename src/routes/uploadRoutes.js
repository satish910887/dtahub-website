import express from 'express';
import multer from 'multer';
import { uploadApk, uploadImage } from '../controllers/uploadController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/apk',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  uploadApk
);

router.post('/image',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  uploadImage
);

export default router;
