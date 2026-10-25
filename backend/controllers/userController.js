import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer } from '../utils/cloudinary.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, headline, bio, location, company, skills } = req.body;
  const user = req.user;
  if (name !== undefined) user.name = name;
  if (headline !== undefined) user.headline = headline;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (company !== undefined && user.role === 'recruiter') user.company = company;
  if (skills !== undefined) {
    user.skills = (Array.isArray(skills) ? skills : String(skills).split(',')).map((s) => s.trim()).filter(Boolean);
  }
  await user.save();
  res.json(user);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please choose an image' });
  const result = await uploadBuffer(req.file.buffer, 'avatars', 'image');
  req.user.avatar = result.secure_url;
  await req.user.save();
  res.json(req.user);
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please choose a PDF or Word file' });
  const result = await uploadBuffer(req.file.buffer, 'resumes', 'auto');
  req.user.resume = { url: result.secure_url, name: req.file.originalname };
  await req.user.save();
  res.json(req.user);
});
