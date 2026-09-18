const express = require('express');
const { body } = require('express-validator');
const {
  register,
  sendSignupOtp,
  verifyOtpAndRegister,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validator');

const router = express.Router();

// 1. Send OTP for Signup Verification
router.post(
  '/send-otp',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  ],
  validate,
  sendSignupOtp
);

// 2. Verify OTP & Finalize Registration
router.post(
  '/verify-otp',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
    body('role').optional().isIn(['client', 'provider']).withMessage('Role must be either client or provider'),
  ],
  validate,
  verifyOtpAndRegister
);

// Direct registration endpoint (backward compatible)
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['client', 'provider']).withMessage('Role must be either client or provider'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
