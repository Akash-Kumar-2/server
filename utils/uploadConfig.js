const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Add a timestamp to the filename to ensure uniqueness
  }
});

const upload = multer({ storage });

module.exports = upload;