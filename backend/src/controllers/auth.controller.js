import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((e) => e.msg).join(', ');
    throw new ApiError(400, errorMsg, errors.array());
  }

  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const assignedRole = role && ['qa_manager', 'viewer'].includes(role) ? role : 'viewer';

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: assignedRole,
  });

  const createdUser = await User.findById(user._id).select('-passwordHash');

  return res
    .status(201)
    .json(new ApiResponse(201, { user: createdUser }, 'User registered successfully'));
});

export const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((e) => e.msg).join(', ');
    throw new ApiError(400, errorMsg, errors.array());
  }

  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // If MongoDB is connected, query and auto-seed demo accounts if missing
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    let user = await User.findOne({ email: normalizedEmail });

    // Auto-seed default QA demo accounts on-the-fly if they don't exist yet
    if (!user && (normalizedEmail === 'qa_manager@omnisight.dev' || normalizedEmail === 'viewer@omnisight.dev')) {
      const isManager = normalizedEmail === 'qa_manager@omnisight.dev';
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('password123', saltRounds);

      user = await User.create({
        name: isManager ? 'QA Manager' : 'QA Viewer',
        email: normalizedEmail,
        passwordHash,
        role: isManager ? 'qa_manager' : 'viewer',
      });
      console.log(`[Auth] Auto-seeded demo account: ${normalizedEmail}`);
    }

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default_jwt_secret',
      {
        expiresIn: '7d',
      }
    );

    const loggedInUser = await User.findById(user._id).select('-passwordHash');

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          token,
          accessToken: token,
        },
        'User logged in successfully'
      )
    );
  } else {
    // Graceful offline fallback for local demo mode without MongoDB
    if (
      (normalizedEmail === 'qa_manager@omnisight.dev' || normalizedEmail === 'viewer@omnisight.dev') &&
      password === 'password123'
    ) {
      const isManager = normalizedEmail === 'qa_manager@omnisight.dev';
      const demoId = isManager ? '507f1f77bcf86cd799439011' : '507f1f77bcf86cd799439012';
      const demoUser = {
        _id: demoId,
        name: isManager ? 'QA Manager (Demo)' : 'Viewer (Demo)',
        email: normalizedEmail,
        role: isManager ? 'qa_manager' : 'viewer',
      };

      const token = jwt.sign(
        {
          userId: demoUser._id,
          role: demoUser.role,
        },
        process.env.JWT_SECRET || 'default_jwt_secret',
        {
          expiresIn: '7d',
        }
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            user: demoUser,
            token,
            accessToken: token,
          },
          'Logged in using demo credentials'
        )
      );
    }

    throw new ApiError(503, 'Database is offline and provided credentials do not match demo presets');
  }
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    throw new ApiError(400, 'Google credential token is missing');
  }

  // Verify token
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    throw new ApiError(401, 'Invalid Google token');
  }

  const payload = ticket.getPayload();
  const email = payload.email.toLowerCase().trim();
  const name = payload.name;

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Register new user
      const saltRounds = 10;
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, saltRounds);

      user = await User.create({
        name,
        email,
        passwordHash,
        role: 'viewer', // default role
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '7d' }
    );

    const loggedInUser = await User.findById(user._id).select('-passwordHash');

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          token,
          accessToken: token,
        },
        'User logged in with Google successfully'
      )
    );
  } else {
    // Graceful offline fallback
    const demoUser = {
      _id: '507f1f77bcf86cd799439013',
      name: name || 'Google Demo User',
      email: email,
      role: 'viewer',
    };

    const token = jwt.sign(
      {
        userId: demoUser._id,
        role: demoUser.role,
      },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: demoUser,
          token,
          accessToken: token,
        },
        'Logged in with Google using demo mode (DB offline)'
      )
    );
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, 'Current user retrieved successfully'));
});
