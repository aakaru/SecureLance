import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  upload
} from '../controllers/profileController.js';
import { protect } from '../controllers/authController.js';
const router = express.Router();
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/me/photo', protect, upload.single('photo'), uploadProfilePhoto);
router.get('/:id', getUserProfile);
router.put('/:id', updateUserProfile);
export default router;
