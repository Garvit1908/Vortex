const express = require('express');
const { body } = require('express-validator');
const { createReview, getGigReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

router.get('/gig/:gigId', getGigReviews);

router.post(
  '/',
  protect,
  authorize('client'),
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Review comment is required'),
  ],
  validate,
  createReview
);

module.exports = router;
