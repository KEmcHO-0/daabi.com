const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, department, batch, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে আগে থেকেই একাউন্ট আছে'
      });
    }

    // Check student ID uniqueness
    if (studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'এই স্টুডেন্ট আইডি দিয়ে আগে থেকেই একাউন্ট আছে'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      studentId,
      department,
      batch,
      role: role === 'committee' ? 'student' : role // Only admin can create committee
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'দাবি.com - ইমেইল ভেরিফিকেশন',
        html: emailTemplates.verifyEmail(user.name, verificationUrl)
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue registration even if email fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'রেজিস্ট্রেশন সফল! ইমেইল ভেরিফিকেশন লিংক পাঠানো হয়েছে।',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        batch: user.batch,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'রেজিস্ট্রেশনে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'ইমেইল এবং পাসওয়ার্ড দিন'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'লগইন সফল!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        batch: user.batch,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'লগইনে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে'
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'ভেরিফিকেশন টোকেন অবৈধ বা মেয়াদোত্তীর্ণ'
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ইমেইল ভেরিফিকেশনে সমস্যা হয়েছে'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'এই ইমেইলে কোনো একাউন্ট নেই'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'দাবি.com - পাসওয়ার্ড রিসেট',
        html: emailTemplates.resetPassword(user.name, resetUrl)
      });

      res.json({
        success: true,
        message: 'পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে'
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'ইমেইল পাঠাতে সমস্যা হয়েছে'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পাসওয়ার্ড রিসেটে সমস্যা হয়েছে'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'রিসেট টোকেন অবৈধ বা মেয়াদোত্তীর্ণ'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে!',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পাসওয়ার্ড রিসেটে সমস্যা হয়েছে'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'বর্তমান পাসওয়ার্ড ভুল'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      department: req.body.department,
      batch: req.body.batch
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'প্রোফাইল আপডেট হয়েছে!',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'প্রোফাইল আপডেটে সমস্যা হয়েছে'
    });
  }
};
