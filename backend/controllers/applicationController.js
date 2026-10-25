import Application, { STATUSES } from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../utils/asyncHandler.js';
import { notify } from '../utils/notify.js';

// POST /api/applications/:jobId  (candidate)
export const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (!req.user.resume?.url) return res.status(400).json({ message: 'Upload your resume in your profile before applying' });
  if (await Application.findOne({ job: job._id, candidate: req.user._id })) {
    return res.status(400).json({ message: 'You have already applied to this job' });
  }

  const application = await Application.create({
    job: job._id,
    candidate: req.user._id,
    recruiter: job.recruiter,
    coverLetter: req.body.coverLetter || '',
    resume: req.user.resume.url,
  });

  await notify({
    user: job.recruiter,
    type: 'new_application',
    message: `${req.user.name} applied for ${job.title}`,
    link: `/recruiter/jobs/${job._id}/applicants`,
  });

  res.status(201).json(application);
});

// GET /api/applications/mine  (candidate)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate('job', 'title company location type')
    .sort('-createdAt');
  res.json(applications.filter((a) => a.job)); // skip applications whose job was deleted
});

// GET /api/applications/job/:jobId  (recruiter who owns the job)
export const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (String(job.recruiter) !== String(req.user._id)) return res.status(403).json({ message: 'Not your job posting' });

  const applications = await Application.find({ job: job._id })
    .populate('candidate', 'name email headline location skills avatar bio')
    .sort('-createdAt');
  res.json({ job, applications });
});

// PATCH /api/applications/:id/status  (recruiter who owns the job)
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const application = await Application.findById(req.params.id).populate('job', 'title company');
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (String(application.recruiter) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });

  application.status = status;
  await application.save();

  await notify({
    user: application.candidate,
    type: 'status_update',
    message: `Your application for ${application.job.title} at ${application.job.company} is now ${status}`,
    link: '/my-applications',
  });

  await application.populate('candidate', 'name email headline location skills avatar bio');
  res.json(application);
});
