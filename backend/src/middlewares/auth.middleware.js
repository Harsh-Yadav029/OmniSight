import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticateJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized request: Missing or malformed token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
    let user = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decodedToken.userId)) {
      user = await User.findById(decodedToken.userId).select('-passwordHash');
    }

    if (!user) {
      // Demo / fallback token support
      const isManager = decodedToken.role === 'qa_manager';
      user = {
        _id: decodedToken.userId || (isManager ? '507f1f77bcf86cd799439011' : '507f1f77bcf86cd799439012'),
        name: isManager ? 'QA Manager' : 'Viewer',
        email: isManager ? 'qa_manager@omnisight.dev' : 'viewer@omnisight.dev',
        role: decodedToken.role || 'qa_manager',
      };
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, error?.message || 'Invalid or expired token');
  }
});

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied: Requires one of [${allowedRoles.join(', ')}] role`)
      );
    }

    next();
  };
};
