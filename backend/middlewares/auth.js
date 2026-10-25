import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Please log in to continue' });

  let user;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    user = await User.findById(id);
  } catch {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
  if (!user) return res.status(401).json({ message: 'User no longer exists' });
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You are not allowed to do this' });
