const express = require('express');
const { body } = require('express-validator');
const {
  createPaymentOrder,
  verifyPaymentAndLockEscrow,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

router.post(
  '/create-order',
  protect,
  authorize('client'),
  [body('orderId').notEmpty().withMessage('Order ID is required')],
  validate,
  createPaymentOrder
);

router.post(
  '/verify',
  protect,
  authorize('client'),
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required'),
    body('razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required'),
    body('razorpaySignature').notEmpty().withMessage('Razorpay Signature is required'),
  ],
  validate,
  verifyPaymentAndLockEscrow
);

module.exports = router;
