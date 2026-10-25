export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 400;
    message = 'That value is already in use';
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  } else if (err.name === 'MulterError' || /allowed|must be a PDF/.test(message)) {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large (max 5 MB)';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
