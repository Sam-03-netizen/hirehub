import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

// In production the frontend (Vercel) and backend (Render) are on different sites,
// so the cookie must be SameSite=None and Secure to be sent cross-site.
export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

export const sendToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};
