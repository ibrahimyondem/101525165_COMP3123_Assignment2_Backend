const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/v1/users/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        status: false,
        message: 'User already exists with this email or username',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        message: 'User created successfully',
        user_id: user._id,
      });
    } else {
      res.status(400).json({
        status: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/users/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    // Check if user exists and password is correct
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);

      res.status(200).json({
        message: 'Login successful',
        token: token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  signup,
  login,
};
