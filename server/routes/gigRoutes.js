const express = require('express');
const { body } = require('express-validator');
const {
  createGig,
  updateGig,
  deleteGig,
  getGigById,
  getGigs,
  getMyGigs,
} = require('../controllers/gigController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator');

const router = express.Router();

router.get('/', getGigs);
router.get('/my/listings', protect, authorize('provider'), getMyGigs);
router.get('/:id', getGigById);

router.post(
  '/',
  protect,
  authorize('provider'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 50 }).withMessage('Price must be at least ₹50'),
    body('deliveryTime').isInt({ min: 1 }).withMessage('Delivery time must be at least 1 day'),
  ],
  validate,
  createGig
);

router.put(
  '/:id',
  protect,
  authorize('provider', 'admin'),
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('price').optional().isFloat({ min: 50 }).withMessage('Price must be at least ₹50'),
    body('deliveryTime').optional().isInt({ min: 1 }).withMessage('Delivery time must be at least 1 day'),
  ],
  validate,
  updateGig
);

router.delete('/:id', protect, authorize('provider', 'admin'), deleteGig);

// Helper route to upload gig media/cover
router.post('/upload-cover', protect, authorize('provider'), upload.single('cover'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }
  res.status(200).json({
    success: true,
    url: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
