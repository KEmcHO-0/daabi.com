const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('অসমর্থিত ফাইল ফরম্যাট। শুধুমাত্র JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT ফাইল আপলোড করা যাবে।'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

module.exports = upload;
