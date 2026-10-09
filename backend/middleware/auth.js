import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function requireOrganizerAuth(req, res, next) {
  try {
    // 1. Direct Organizer Master Key access (e.g. for rapid setup or trusted devices)
    const organizerKey = req.headers['x-organizer-key'];
    const configuredKey = process.env.ORGANIZER_KEY || 'hashcore2026-citadel-organizer-secret';
    if (organizerKey && organizerKey === configuredKey) {
      req.user = {
        _id: 'master-organizer',
        username: 'organizer',
        name: 'Authorized Organizer',
        role: 'organizer',
      };
      return next();
    }

    // 2. JWT Bearer Token validation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in as an authorized organizer.',
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'hashcore2026-secure-jwt-signing-key';
    const decoded = jwt.verify(token, jwtSecret);

    req.user = {
      _id: decoded.id || decoded._id,
      username: decoded.username,
      name: decoded.name || 'Organizer',
      role: decoded.role || 'organizer',
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
  }
}
