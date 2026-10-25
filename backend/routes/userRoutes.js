import { Router } from 'express';
import { updateProfile, uploadAvatar, uploadResume } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadImage, uploadDoc } from '../middlewares/upload.js';

const router = Router();
router.use(protect);
router.put('/profile', updateProfile);
router.post('/avatar', uploadImage.single('avatar'), uploadAvatar);
router.post('/resume', authorize('candidate'), uploadDoc.single('resume'), uploadResume);
export default router;
