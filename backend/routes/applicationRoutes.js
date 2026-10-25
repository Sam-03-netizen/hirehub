import { Router } from 'express';
import { applyToJob, getMyApplications, getJobApplicants, updateStatus } from '../controllers/applicationController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();
router.use(protect);
router.get('/mine', authorize('candidate'), getMyApplications);
router.get('/job/:jobId', authorize('recruiter'), getJobApplicants);
router.post('/:jobId', authorize('candidate'), applyToJob);
router.patch('/:id/status', authorize('recruiter'), updateStatus);
export default router;
