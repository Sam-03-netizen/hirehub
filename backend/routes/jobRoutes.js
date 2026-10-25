import { Router } from 'express';
import { getJobs, getJob, getMyJobs, createJob, updateJob, deleteJob } from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();
router.get('/', getJobs);
router.get('/mine', protect, authorize('recruiter'), getMyJobs); // must be above '/:id'
router.get('/:id', getJob);
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);
export default router;
