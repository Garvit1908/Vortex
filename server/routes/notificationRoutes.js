const express = require('express');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/mark-read', protect, markAsRead);

module.exports = router;
