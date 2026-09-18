const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to send real-time notification
const sendNotification = async (req, { userId, senderId, type, title, message, link }) => {
  try {
    const notif = await Notification.create({
      user: userId,
      sender: senderId,
      type,
      title,
      message,
      link,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('notification', notif);
    }
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// @desc    Create a new booking/order
// @route   POST /api/orders
// @access  Private (Client only)
const createOrder = async (req, res, next) => {
  try {
    const { gigId, requirements } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Disallow ordering own gig
    if (gig.provider.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own gig',
      });
    }

    const order = await Order.create({
      gig: gig._id,
      client: req.user.id,
      provider: gig.provider,
      title: gig.title,
      requirements: requirements || '',
      price: gig.price,
      deliveryDays: gig.deliveryTime,
      status: 'pending',
      escrowStatus: 'unpaid',
    });

    // Notify provider
    await sendNotification(req, {
      userId: gig.provider,
      senderId: req.user.id,
      type: 'order_status',
      title: 'New Booking Request!',
      message: `${req.user.name} submitted a new booking request for "${gig.title}".`,
      link: `/orders/${order._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Provider accepts a pending booking
// @route   PUT /api/orders/:id/accept
// @access  Private (Provider only)
const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.provider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned provider can accept this booking' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot accept order with status '${order.status}'` });
    }

    order.status = 'accepted';
    await order.save();

    // Notify client to pay into escrow
    await sendNotification(req, {
      userId: order.client,
      senderId: req.user.id,
      type: 'order_status',
      title: 'Booking Accepted!',
      message: `Your booking for "${order.title}" was accepted. Please fund escrow to start work.`,
      link: `/orders/${order._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        escrowStatus: order.escrowStatus,
      });
    }

    await order.populate('client', 'name email profilePhoto');
    await order.populate('provider', 'name email profilePhoto isVerified');

    res.status(200).json({
      success: true,
      message: 'Order accepted. Waiting for client to fund escrow.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Provider submits project delivery
// @route   PUT /api/orders/:id/deliver
// @access  Private (Provider only)
const deliverOrder = async (req, res, next) => {
  try {
    const { message, fileUrl } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.provider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the provider can submit delivery' });
    }

    if (order.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Order must be 'in-progress' to deliver work (Current: '${order.status}')`,
      });
    }

    order.status = 'delivered';
    order.deliverySubmission = {
      message: message || 'Work delivered successfully.',
      fileUrl: fileUrl || (req.file ? `/uploads/${req.file.filename}` : ''),
      submittedAt: new Date(),
    };

    await order.save();

    // Notify client
    await sendNotification(req, {
      userId: order.client,
      senderId: req.user.id,
      type: 'order_status',
      title: 'Order Delivered!',
      message: `The provider delivered work for "${order.title}". Please review and complete.`,
      link: `/orders/${order._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        deliverySubmission: order.deliverySubmission,
      });
    }

    await order.populate('client', 'name email profilePhoto');
    await order.populate('provider', 'name email profilePhoto isVerified');

    res.status(200).json({
      success: true,
      message: 'Work delivered successfully. Waiting for client approval.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Client completes order & releases escrow funds to provider
// @route   PUT /api/orders/:id/complete
// @access  Private (Client only)
const completeOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the client can complete this order' });
    }

    if (order.status !== 'delivered' && order.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be completed from status '${order.status}'`,
      });
    }

    order.status = 'completed';
    order.escrowStatus = 'released_to_provider';
    order.paymentDetails.releasedAt = new Date();

    await order.save();

    // Credit provider's wallet balance
    await User.findByIdAndUpdate(order.provider, {
      $inc: { walletBalance: order.price },
    });

    // Notify provider that funds were released
    await sendNotification(req, {
      userId: order.provider,
      senderId: req.user.id,
      type: 'payment_released',
      title: 'Payment Released!',
      message: `Client approved "${order.title}". ₹${order.price} was released to your balance!`,
      link: `/orders/${order._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        escrowStatus: order.escrowStatus,
      });
    }

    await order.populate('client', 'name email profilePhoto');
    await order.populate('provider', 'name email profilePhoto isVerified');

    res.status(200).json({
      success: true,
      message: 'Order completed and funds released to provider.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Raise a dispute on an order
// @route   PUT /api/orders/:id/dispute
// @access  Private (Client or Provider)
const raiseDispute = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isClient = order.client.toString() === req.user.id;
    const isProvider = order.provider.toString() === req.user.id;

    if (!isClient && !isProvider) {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot dispute an order that is already ${order.status}`,
      });
    }

    order.status = 'disputed';
    order.disputeDetails = {
      raisedBy: req.user.id,
      reason: reason || 'Dispute raised regarding project delivery/terms.',
      raisedAt: new Date(),
    };

    await order.save();

    const otherPartyId = isClient ? order.provider : order.client;
    await sendNotification(req, {
      userId: otherPartyId,
      senderId: req.user.id,
      type: 'dispute',
      title: 'Dispute Raised on Order',
      message: `A dispute was raised for "${order.title}". Admin support will mediate.`,
      link: `/orders/${order._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        disputeDetails: order.disputeDetails,
      });
    }

    await order.populate('client', 'name email profilePhoto');
    await order.populate('provider', 'name email profilePhoto isVerified');

    res.status(200).json({
      success: true,
      message: 'Dispute logged. Platform admins have been alerted for mediation.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Client or Provider)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isClient = order.client.toString() === req.user.id;
    const isProvider = order.provider.toString() === req.user.id;

    if (!isClient && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be directly cancelled. For funded orders, raise a dispute.',
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Client, Provider, or Admin)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('gig')
      .populate('client', 'name email profilePhoto')
      .populate('provider', 'name email profilePhoto isVerified');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isClient = order.client._id.toString() === req.user.id;
    const isProvider = order.provider._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { status, role } = req.query;

    let query = {};
    if (role === 'provider') {
      query.provider = req.user.id;
    } else if (role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'provider') {
      query.provider = req.user.id;
    } else if (req.user.role === 'client') {
      query.client = req.user.id;
    } else {
      query.$or = [{ client: req.user.id }, { provider: req.user.id }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('gig', 'title category coverImage')
      .populate('client', 'name profilePhoto')
      .populate('provider', 'name profilePhoto isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  acceptOrder,
  deliverOrder,
  completeOrder,
  raiseDispute,
  cancelOrder,
  getOrderById,
  getMyOrders,
  sendNotification,
};
