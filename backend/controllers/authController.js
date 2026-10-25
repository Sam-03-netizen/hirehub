import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendToken, cookieOptions } from '../utils/generateToken.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, company } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (!['candidate', 'recruiter'].includes(role)) return res.status(400).json({ message: 'Choose a valid role' });
  if (role === 'recruiter' && !company) return res.status(400).json({ message: 'Company name is required for recruiters' });

  if (await User.findOne({ email })) return res.status(400).json({ message: 'An account with this email already exists' });

  const user = await User.create({ name, email, password, role, company: role === 'recruiter' ? company : '' });
  sendToken(res, user._id);
  res.status(201).json(await User.findById(user._id));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Incorrect email or password' });

  sendToken(res, user._id);
  res.json(await User.findById(user._id));
});

export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out' });
};

export const getMe = (req, res) => res.json(req.user);
