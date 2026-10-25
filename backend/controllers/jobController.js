import Job from '../models/Job.js';
import Application from '../models/Application.js';
import asyncHandler from '../utils/asyncHandler.js';

const parseSkills = (skills) =>
  (Array.isArray(skills) ? skills : String(skills || '').split(',')).map((s) => s.trim()).filter(Boolean);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/jobs?search=&type=&location=&page=
export const getJobs = asyncHandler(async (req, res) => {
  const { search, type, location } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = 9;
  const filter = {};

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { company: rx }, { skills: rx }];
  }
  if (type) filter.type = type;
  if (location) filter.location = new RegExp(escapeRegex(location), 'i');

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Job.countDocuments(filter),
  ]);
  res.json({ jobs, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('recruiter', 'name company avatar');
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
});

// Recruiter's own jobs, each with an applicant count
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort('-createdAt').lean();
  const counts = await Application.aggregate([
    { $match: { recruiter: req.user._id } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json(jobs.map((j) => ({ ...j, applicants: map[String(j._id)] || 0 })));
});

export const createJob = asyncHandler(async (req, res) => {
  const { title, description, company, location, type, salary, skills } = req.body;
  const job = await Job.create({
    title, description, location, type, salary,
    company: company || req.user.company,
    skills: parseSkills(skills),
    recruiter: req.user._id,
  });
  res.status(201).json(job);
});

const findOwnedJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return null;
  }
  if (String(job.recruiter) !== String(req.user._id)) {
    res.status(403).json({ message: 'You can only manage your own jobs' });
    return null;
  }
  return job;
};

export const updateJob = asyncHandler(async (req, res) => {
  const job = await findOwnedJob(req, res);
  if (!job) return;
  const { title, description, company, location, type, salary, skills } = req.body;
  Object.assign(job, { title, description, company, location, type, salary, skills: parseSkills(skills) });
  await job.save();
  res.json(job);
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await findOwnedJob(req, res);
  if (!job) return;
  await Application.deleteMany({ job: job._id });
  await job.deleteOne();
  res.json({ message: 'Job deleted', id: job._id });
});
