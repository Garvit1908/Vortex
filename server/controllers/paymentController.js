const Order = require('../models/Order');
const User = require('../models/User');
const razorpayInstance = require('../config/razorpay');
const { verifyRazorpaySignature } = require('../utils/razorpayHelper');
const { sendNotification } = require('./orderController');

// @desc    Create Razorpay Order for escrow payment
// @route   POST /api/payments/create-order
// @access  Private (Client only)
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the client can fund this order' });
    }

    if (order.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Order must be in 'accepted' status before payment (current: ${order.status})`,
      });
    }

    const amountInPaise = Math.round(order.price * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${order._id.toString().slice(-8)}`,
      notes: {
        orderId: order._id.toString(),
        gigTitle: order.title,
      },
    };

    let razorpayOrder;

    // If Razorpay instance is initialized with valid credentials
    if (
      razorpayInstance &&
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key_id'
    ) {
      try {
        razorpayOrder = await razorpayInstance.orders.create(options);
      } catch (rzpErr) {
        console.warn('Razorpay SDK error, falling back to simulated test order:', rzpErr.message);
      }
    }

    // Fallback/Simulated test order if test API key is placeholder
    if (!razorpayOrder) {
      razorpayOrder = {
        id: `order_test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        entity: 'order',
        amount: amountInPaise,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
        isSimulation: true,
      };
    }

    order.paymentDetails.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
      order: {
        id: order._id,
        price: order.price,
        title: order.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & lock funds in Escrow
// @route   POST /api/payments/verify
// @access  Private (Client only)
const verifyPaymentAndLockEscrow = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check signature validity
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Escrow funding failed.',
      });
    }

    // Transition order to in-progress and lock escrow
    order.status = 'in-progress';
    order.escrowStatus = 'held_in_escrow';
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountPaid: order.price,
      paidAt: new Date(),
    };

    await order.save();

    // Notify provider that order has been funded in escrow and work can begin
    await sendNotification(req, {
      userId: order.provider,
      senderId: req.user.id,
      type: 'payment_escrow',
      title: 'Escrow Funded! Start Work',
      message: `Client deposited ₹${order.price} into Escrow for "${order.title}". You can now start work!`,
      link: `/orders/${order._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        escrowStatus: order.escrowStatus,
        paymentDetails: order.paymentDetails,
      });
    }

    await order.populate('client', 'name email profilePhoto');
    await order.populate('provider', 'name email profilePhoto isVerified');

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Funds are secured in Escrow.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentAndLockEscrow,
};
