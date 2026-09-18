const Gig = require('../models/Gig');
const Review = require('../models/Review');

// @desc    Create a new Service/Gig
// @route   POST /api/gigs
// @access  Private (Provider only)
const createGig = async (req, res, next) => {
  try {
    const { title, description, category, price, deliveryTime, tags, coverImage } = req.body;

    if (!title || !description || !category || !price || !deliveryTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, price, and deliveryTime',
      });
    }

    const gig = await Gig.create({
      provider: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      deliveryTime: Number(deliveryTime),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
      coverImage: coverImage || '',
    });

    res.status(201).json({
      success: true,
      message: 'Gig created successfully',
      gig,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a Gig
// @route   PUT /api/gigs/:id
// @access  Private (Owner provider or admin)
const updateGig = async (req, res, next) => {
  try {
    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Verify ownership
    if (gig.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this gig',
      });
    }

    const { title, description, category, price, deliveryTime, tags, coverImage, isActive } = req.body;

    if (title) gig.title = title.trim();
    if (description) gig.description = description.trim();
    if (category) gig.category = category;
    if (price) gig.price = Number(price);
    if (deliveryTime) gig.deliveryTime = Number(deliveryTime);
    if (tags !== undefined) {
      gig.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }
    if (coverImage !== undefined) gig.coverImage = coverImage;
    if (isActive !== undefined) gig.isActive = isActive;

    await gig.save();

    res.status(200).json({
      success: true,
      message: 'Gig updated successfully',
      gig,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Gig
// @route   DELETE /api/gigs/:id
// @access  Private (Owner provider or admin)
const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    if (gig.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this gig',
      });
    }

    await Gig.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Gig deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Gig by ID with provider details and reviews
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      'provider',
      'name email profilePhoto bio title isVerified ratingAverage ratingCount'
    );

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    const reviews = await Review.find({ gig: gig._id })
      .populate('reviewer', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      gig,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search + filter gigs with pagination
// @route   GET /api/gigs
// @access  Public
const getGigs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = { isActive: true };

    // Search query across title, description, tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.ratingAverage = { $gte: Number(minRating) };
    }

    // Sort order
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { ratingAverage: -1 };
    if (sort === 'delivery') sortOptions = { deliveryTime: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const gigs = await Gig.find(query)
      .populate('provider', 'name profilePhoto isVerified ratingAverage')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Gig.countDocuments(query);

    res.status(200).json({
      success: true,
      gigs,
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

// @desc    Get gigs owned by current logged-in provider
// @route   GET /api/gigs/my/listings
// @access  Private (Provider only)
const getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ provider: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      gigs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGig,
  updateGig,
  deleteGig,
  getGigById,
  getGigs,
  getMyGigs,
};
