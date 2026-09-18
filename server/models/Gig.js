const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A gig must belong to a provider'],
    },
    title: {
      type: String,
      required: [true, 'Please enter a title for your service/gig'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please enter a description for your service'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX & Design',
        'AI & Machine Learning',
        'DevOps & Cloud',
        'Writing & Translation',
        'Digital Marketing',
        'Video & Audio',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Please specify the starting price (INR)'],
      min: [50, 'Minimum price is 50'],
    },
    deliveryTime: {
      type: Number,
      required: [true, 'Please specify delivery time in days'],
      min: [1, 'Delivery time must be at least 1 day'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (v) => Math.round(v * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for high-performance text and category search
gigSchema.index({ title: 'text', description: 'text', tags: 'text' });
gigSchema.index({ category: 1, price: 1, ratingAverage: -1 });

module.exports = mongoose.model('Gig', gigSchema);
