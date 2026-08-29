import { ApiError } from '../utils/ApiError.js';

export const verifyInternalKey = (req, res, next) => {
  const incomingKey = req.header('X-Internal-Key') || req.headers['x-internal-key'];
  const expectedKey = process.env.INTERNAL_API_KEY || 'default_internal_key';

  if (!incomingKey || incomingKey !== expectedKey) {
    return next(new ApiError(401, 'Unauthorized: Invalid or missing X-Internal-Key header'));
  }

  next();
};
