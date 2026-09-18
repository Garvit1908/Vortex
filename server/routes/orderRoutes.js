const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  acceptOrder,
  deliverOrder,
  completeOrder,
  raiseDispute,
  cancelOrder,
  getOrderById,
  getMyOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator');

const router = express.Router();

router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

router.post(
  '/',
  protect,
  authorize('client', 'provider'),
  [body('gigId').notEmpty().withMessage('Gig ID is required')],
  validate,
  createOrder
);

router.put('/:id/accept', protect, authorize('provider'), acceptOrder);

router.put(
  '/:id/deliver',
  protect,
  authorize('provider'),
  upload.single('deliveryFile'),
  deliverOrder
);

router.put('/:id/complete', protect, authorize('client'), completeOrder);

router.put(
  '/:id/dispute',
  protect,
  [body('reason').trim().notEmpty().withMessage('Dispute reason is required')],
  validate,
  raiseDispute
);

router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
