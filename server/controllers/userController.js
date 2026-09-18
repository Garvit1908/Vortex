const User = require('../models/User');
const Gig = require('../models/Gig');
const Review = require('../models/Review');

// @desc    Get user profile by ID (Public)
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // If user is a provider, fetch active gigs and reviews
    let gigs = [];
    let reviews = [];

    if (user.role === 'provider') {
      gigs = await Gig.find({ provider: user._id, isActive: true }).sort({ createdAt: -1 });
      reviews = await Review.find({ provider: user._id })
        .populate('reviewer', 'name profilePhoto')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    res.status(200).json({
      success: true,
      user,
      gigs,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update authenticated user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      title,
      skills,
      portfolioLinks,
      pricing,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (title !== undefined) user.title = title;
    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (portfolioLinks && Array.isArray(portfolioLinks)) {
      user.portfolioLinks = portfolioLinks;
    }
    if (pricing) {
      user.pricing = {
        hourlyRate: Number(pricing.hourlyRate) || 0,
        startingAt: Number(pricing.startingAt) || 0,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: photoUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: photoUrl,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of providers / freelancers (with optional search and skill filters)
// @route   GET /api/users/providers
// @access  Public
const getProviders = async (req, res, next) => {
  try {
    const { skill, search, verified, sort, page = 1, limit = 12 } = req.query;

    const query = { role: 'provider' };

    if (verified === 'true') {
      query.isVerified = true;
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOptions = { ratingAverage: -1, createdAt: -1 };
    if (sort === 'rating') sortOptions = { ratingAverage: -1 };
    if (sort === 'rate_asc') sortOptions = { 'pricing.hourlyRate': 1 };
    if (sort === 'rate_desc') sortOptions = { 'pricing.hourlyRate': -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const providers = await User.find(query)
      .select('-refreshToken')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      providers,
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

module.exports = {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  getProviders,
};
