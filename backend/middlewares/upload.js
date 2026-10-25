import multer from 'multer';

const storage = multer.memoryStorage();
const limits = { fileSize: 5 * 1024 * 1024 }; // 5 MB

export const uploadImage = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

const docTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const uploadDoc = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) =>
    docTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Resume must be a PDF or Word file')),
});
