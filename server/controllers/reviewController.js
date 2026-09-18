const Review = require('../models/Review');
const Order = require('../models/Order');
const { sendNotification } = require('./orderController');

// @desc    Submit a review for a completed order
// @route   POST /api/reviews
// @access  Private (Client only)
const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId, rating (1-5), and a review comment',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the ordering client can review this work' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Reviews can only be submitted after the order is marked completed (Current status: ${order.status})`,
      });
    }

    if (order.hasReview) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this order',
      });
    }

    const review = await Review.create({
      order: order._id,
      gig: order.gig,
      reviewer: req.user.id,
      provider: order.provider,
      rating: numRating,
      comment: comment.trim(),
    });

    order.hasReview = true;
    await order.save();

    const populatedReview = await Review.findById(review._id).populate(
      'reviewer',
      'name profilePhoto'
    );

    // Notify provider of new review
    await sendNotification(req, {
      userId: order.provider,
      senderId: req.user.id,
      type: 'new_review',
      title: 'New Review Received!',
      message: `${req.user.name} rated your service ${numRating} stars: "${comment.substring(0, 50)}..."`,
      link: `/gigs/${order.gig}`,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific gig
// @route   GET /api/reviews/gig/:gigId
// @access  Public
const getGigReviews = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    const reviews = await Review.find({ gig: gigId })
      .populate('reviewer', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getGigReviews,
};
