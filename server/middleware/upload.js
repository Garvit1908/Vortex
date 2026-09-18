const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow common images and documents for deliverable submissions
  const allowedExtensions = /jpeg|jpg|png|webp|gif|svg|pdf|zip|txt|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|webp|gif|svg\+xml)|application\/(pdf|zip|x-zip-compressed|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)|text\/plain/.test(file.mimetype);

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload an image, PDF, or ZIP file.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter,
});

module.exports = upload;
