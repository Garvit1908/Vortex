const User = require('../models/User');
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const { sendNotification } = require('./orderController');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const verifiedProviders = await User.countDocuments({ role: 'provider', isVerified: true });
    
    const totalGigs = await Gig.countDocuments();
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const activeDisputes = await Order.countDocuments({ status: 'disputed' });

    // Aggregate total revenue / escrow volume from completed & in-progress orders
    const revenueStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['in-progress', 'delivered', 'completed'] },
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$price' },
        },
      },
    ]);

    const totalVolume = revenueStats.length > 0 ? revenueStats[0].totalVolume : 0;
    // Platform fee (e.g. 10%)
    const platformRevenue = Math.round(totalVolume * 0.1);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalClients,
        totalProviders,
        verifiedProviders,
        totalGigs,
        totalOrders,
        completedOrders,
        activeDisputes,
        totalVolume,
        platformRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, role filter and pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query)
      .select('-refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle provider verification badge
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
const toggleProviderVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    // Send in-app notification to the provider
    await sendNotification(req, {
      userId: user._id,
      senderId: req.user.id,
      type: 'verification',
      title: user.isVerified ? 'Badge Granted: Verified Provider!' : 'Verification Status Updated',
      message: user.isVerified
        ? 'Congratulations! Your Vortex Verified Provider badge has been approved.'
        : 'Your provider verification badge has been removed.',
      link: `/profile/${user._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Provider verification ${user.isVerified ? 'granted' : 'revoked'}`,
      isVerified: user.isVerified,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders with filter
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const orders = await Order.find(query)
      .populate('gig', 'title category')
      .populate('client', 'name email')
      .populate('provider', 'name email isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve order dispute (manual status override)
// @route   PUT /api/admin/orders/:id/resolve-dispute
// @access  Private (Admin only)
const resolveDispute = async (req, res, next) => {
  try {
    const { resolutionOutcome, resolutionNote } = req.body;

    if (!['released_to_provider', 'refunded_to_client'].includes(resolutionOutcome)) {
      return res.status(400).json({
        success: false,
        message: "resolutionOutcome must be either 'released_to_provider' or 'refunded_to_client'",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: `Order is not in 'disputed' status (current: ${order.status})`,
      });
    }

    order.disputeDetails.resolvedAt = new Date();
    order.disputeDetails.resolvedBy = req.user.id;
    order.disputeDetails.resolutionOutcome = resolutionOutcome;
    order.disputeDetails.resolutionNote = resolutionNote || 'Resolved by Vortex Admin mediation.';

    if (resolutionOutcome === 'released_to_provider') {
      order.status = 'completed';
      order.escrowStatus = 'released_to_provider';
      order.paymentDetails.releasedAt = new Date();

      // Release escrow funds to provider
      await User.findByIdAndUpdate(order.provider, {
        $inc: { walletBalance: order.price },
      });
    } else {
      order.status = 'cancelled';
      order.escrowStatus = 'refunded_to_client';
    }

    await order.save();

    // Notify both parties
    await sendNotification(req, {
      userId: order.client,
      senderId: req.user.id,
      type: 'dispute',
      title: 'Dispute Resolved',
      message: `Admin resolved dispute on "${order.title}": ${resolutionOutcome.replace(/_/g, ' ')}.`,
      link: `/orders/${order._id}`,
    });

    await sendNotification(req, {
      userId: order.provider,
      senderId: req.user.id,
      type: 'dispute',
      title: 'Dispute Resolved',
      message: `Admin resolved dispute on "${order.title}": ${resolutionOutcome.replace(/_/g, ' ')}.`,
      link: `/orders/${order._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        escrowStatus: order.escrowStatus,
        disputeDetails: order.disputeDetails,
      });
    }

    res.status(200).json({
      success: true,
      message: `Dispute resolved with outcome: ${resolutionOutcome}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminAnalytics,
  getAllUsers,
  toggleProviderVerification,
  getAllOrders,
  resolveDispute,
};
