const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // One review per completed order
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write a review comment'],
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Static method to calculate average rating for Gig and Provider
reviewSchema.statics.calculateAverageRating = async function (gigId, providerId) {
  const gigStats = await this.aggregate([
    { $match: { gig: gigId } },
    {
      $group: {
        _id: '$gig',
        ratingAverage: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (gigStats.length > 0) {
    await mongoose.model('Gig').findByIdAndUpdate(gigId, {
      ratingAverage: Math.round(gigStats[0].ratingAverage * 10) / 10,
      ratingCount: gigStats[0].ratingCount,
    });
  }

  const providerStats = await this.aggregate([
    { $match: { provider: providerId } },
    {
      $group: {
        _id: '$provider',
        ratingAverage: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (providerStats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(providerId, {
      ratingAverage: Math.round(providerStats[0].ratingAverage * 10) / 10,
      ratingCount: providerStats[0].ratingCount,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.gig, this.provider);
});

module.exports = mongoose.model('Review', reviewSchema);
