const express = require('express');
const { body } = require('express-validator');
const { getOrderMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator');

const router = express.Router();

router.get('/:orderId', protect, getOrderMessages);

router.post(
  '/:orderId',
  protect,
  upload.single('attachment'),
  sendMessage
);

module.exports = router;
