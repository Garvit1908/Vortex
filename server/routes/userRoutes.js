const express = require('express');
const { body } = require('express-validator');
const {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  getProviders,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator');

const router = express.Router();

router.get('/providers', getProviders);
router.get('/:id', getUserProfile);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
    body('title').optional().isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  ],
  validate,
  updateProfile
);

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
