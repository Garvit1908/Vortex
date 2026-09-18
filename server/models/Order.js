const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      default: '',
      maxlength: [2000, 'Requirements cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: true,
      min: [50, 'Order price must be at least 50'],
    },
    deliveryDays: {
      type: Number,
      required: true,
      default: 3,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'delivered', 'completed', 'disputed', 'cancelled'],
      default: 'pending',
    },
    escrowStatus: {
      type: String,
      enum: ['unpaid', 'held_in_escrow', 'released_to_provider', 'refunded_to_client'],
      default: 'unpaid',
    },
    paymentDetails: {
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' },
      amountPaid: { type: Number, default: 0 },
      paidAt: { type: Date },
      releasedAt: { type: Date },
    },
    deliverySubmission: {
      message: { type: String, default: '' },
      fileUrl: { type: String, default: '' },
      submittedAt: { type: Date },
    },
    disputeDetails: {
      raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String, default: '' },
      raisedAt: { type: Date },
      resolvedAt: { type: Date },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolutionNote: { type: String, default: '' },
      resolutionOutcome: { type: String, enum: ['released_to_provider', 'refunded_to_client', 'none'], default: 'none' },
    },
    hasReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ client: 1, createdAt: -1 });
orderSchema.index({ provider: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
