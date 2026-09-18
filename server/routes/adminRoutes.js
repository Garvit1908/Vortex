const express = require('express');
const { body } = require('express-validator');
const {
  getAdminAnalytics,
  getAllUsers,
  toggleProviderVerification,
  getAllOrders,
  resolveDispute,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// Restrict all admin routes to users with role 'admin'
router.use(protect, authorize('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/verify', toggleProviderVerification);
router.get('/orders', getAllOrders);
router.put(
  '/orders/:id/resolve-dispute',
  [
    body('resolutionOutcome')
      .isIn(['released_to_provider', 'refunded_to_client'])
      .withMessage("Outcome must be either 'released_to_provider' or 'refunded_to_client'"),
  ],
  validate,
  resolveDispute
);

module.exports = router;
