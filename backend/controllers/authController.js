const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const admin = require('../config/firebaseAdmin');

// @desc    Google Login - Verify Firebase ID token and create/login user
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Firebase ID token',
      });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not found in token',
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        name: name || '',
        profilePhoto: picture || '',
        provider: 'google',
        isOnboarded: false,
      });
    } else {
      // Update existing user profile photo if changed
      if (picture && user.profilePhoto !== picture) {
        user.profilePhoto = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without sensitive fields
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      username: user.username,
      isOnboarded: user.isOnboarded,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      social: user.social,
    };

    res.status(200).json({
      success: true,
      token,
      isOnboarded: user.isOnboarded,
      user: userData,
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired Firebase token',
      error: error.message,
    });
  }
};

module.exports = {
  googleLogin,
};
