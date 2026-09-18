const Message = require('../models/Message');
const Order = require('../models/Order');
const { sendNotification } = require('./orderController');

// @desc    Get all chat messages for a specific order
// @route   GET /api/chat/:orderId
// @access  Private
const getOrderMessages = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isClient = order.client.toString() === req.user.id;
    const isProvider = order.provider.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages for this order' });
    }

    const messages = await Message.find({ order: orderId })
      .populate('sender', 'name profilePhoto role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message in order chat
// @route   POST /api/chat/:orderId
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { text, fileUrl } = req.body;

    if (!text && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isClient = order.client.toString() === req.user.id;
    const isProvider = order.provider.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this order' });
    }

    const recipientId = isClient ? order.provider : order.client;

    const message = await Message.create({
      order: orderId,
      sender: req.user.id,
      recipient: recipientId,
      text: text || 'Sent an attachment',
      fileUrl: fileUrl || (req.file ? `/uploads/${req.file.filename}` : ''),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name profilePhoto role'
    );

    // Emit live message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${orderId}`).emit('receive_message', populatedMessage);
    }

    // In-app notification for recipient
    await sendNotification(req, {
      userId: recipientId,
      senderId: req.user.id,
      type: 'new_message',
      title: `New message from ${req.user.name}`,
      message: text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'Sent an attachment',
      link: `/orders/${orderId}`,
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrderMessages,
  sendMessage,
};
