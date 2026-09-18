const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/token');

// Cookie options for secure refresh token storage
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// @desc    Register a new user (Freelancer / Provider or Client)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Default to 'client' if role not provided or invalid
    const assignedRole = ['client', 'provider'].includes(role) ? role : 'client';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        title: user.title,
        ratingAverage: user.ratingAverage,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        title: user.title,
        bio: user.bio,
        skills: user.skills,
        pricing: user.pricing,
        ratingAverage: user.ratingAverage,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found. Please log in again.',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or expired. Please log in again.',
      });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh session. Please log in again.',
      });
    }

    // Issue fresh access token and rotate refresh token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        title: user.title,
        ratingAverage: user.ratingAverage,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user & clear refresh session
// @route   POST /api/auth/logout
// @access  Public / Private
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    } else if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        title: user.title,
        skills: user.skills,
        portfolioLinks: user.portfolioLinks,
        pricing: user.pricing,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
        ratingAverage: user.ratingAverage,
        ratingCount: user.ratingCount,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate and send 6-digit OTP for signup verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendSignupOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Generate 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Invalidate any previous OTP for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store new OTP (automatically expires in 10 mins via MongoDB TTL index)
    await Otp.create({
      email: cleanEmail,
      otp,
    });

    // Send email / log to console
    await sendOtpEmail({ email: cleanEmail, otp });

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code was sent to ${cleanEmail}`,
      ...(process.env.NODE_ENV !== 'production' ? { previewOtp: otp } : {}),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and register new user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtpAndRegister = async (req, res, next) => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and the 6-digit verification code',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Verify OTP
    const validOtpRecord = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (!validOtpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please check your code or request a new one.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Delete used OTP
    await Otp.deleteMany({ email: cleanEmail });

    // Assign role
    const assignedRole = ['client', 'provider'].includes(role) ? role : 'client';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account verified and registered successfully!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        title: user.title,
        ratingAverage: user.ratingAverage,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  sendSignupOtp,
  verifyOtpAndRegister,
  login,
  refreshToken,
  logout,
  getMe,
};
