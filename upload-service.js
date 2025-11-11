/**
 * Image Upload Service
 * Handles file uploads with validation, resizing, and storage
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', req.body.type || 'campaigns');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * Process and resize uploaded image
 * @param {string} filepath - Path to original image
 * @param {object} options - Resize options
 */
async function processImage(filepath, options = {}) {
  const {
    width = 1200,
    height = 800,
    quality = 85,
    createThumbnail = true
  } = options;

  try {
    const filename = path.basename(filepath);
    const dirname = path.dirname(filepath);

    // Resize main image
    await sharp(filepath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toFile(path.join(dirname, `resized-${filename}`));

    // Create thumbnail if requested
    if (createThumbnail) {
      await sharp(filepath)
        .resize(300, 200, {
          fit: 'cover'
        })
        .jpeg({ quality: 80 })
        .toFile(path.join(dirname, `thumb-${filename}`));
    }

    // Delete original file
    await fs.unlink(filepath);

    // Rename resized file to original name
    await fs.rename(
      path.join(dirname, `resized-${filename}`),
      filepath
    );

    return {
      success: true,
      path: filepath,
      thumbnail: createThumbnail ? path.join(dirname, `thumb-${filename}`) : null
    };
  } catch (err) {
    console.error('Image processing error:', err);
    throw err;
  }
}

/**
 * Delete image file
 * @param {string} filepath - Path to image
 */
async function deleteImage(filepath) {
  try {
    await fs.unlink(filepath);

    // Also delete thumbnail if exists
    const dirname = path.dirname(filepath);
    const filename = path.basename(filepath);
    const thumbPath = path.join(dirname, `thumb-${filename}`);

    try {
      await fs.unlink(thumbPath);
    } catch (err) {
      // Thumbnail might not exist, ignore error
    }

    return { success: true };
  } catch (err) {
    console.error('Delete image error:', err);
    throw err;
  }
}

/**
 * Get multiple image URLs
 * @param {string[]} filenames - Array of filenames
 * @param {string} type - Type of images (campaigns, profiles)
 */
function getImageUrls(filenames, type = 'campaigns') {
  return filenames.map(filename => `/uploads/${type}/${filename}`);
}

module.exports = {
  upload,
  processImage,
  deleteImage,
  getImageUrls,
  // Middleware exports
  uploadSingle: upload.single('image'),
  uploadMultiple: upload.array('images', 10),
};
