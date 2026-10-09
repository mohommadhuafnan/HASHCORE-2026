import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireOrganizerAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password, organizerKey } = req.body;

    const configuredKey = process.env.ORGANIZER_KEY || 'hashcore2026-citadel-organizer-secret';
    const jwtSecret = process.env.JWT_SECRET || 'hashcore2026-secure-jwt-signing-key';

    // 1. Organizer Secret Key direct login
    if (organizerKey && organizerKey.trim() === configuredKey) {
      const token = jwt.sign(
        { id: 'master-organizer', username: 'organizer', name: 'Master Organizer', role: 'organizer' },
        jwtSecret,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        token,
        user: { username: 'organizer', name: 'Master Organizer', role: 'organizer' },
      });
    }

    // 2. Username / Password login
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const cleanUser = username.trim().toLowerCase();
    const user = await User.findOne({ username: cleanUser, isActive: true });

    if (!user) {
      // Default initial admin login fallback if user not yet seeded
      if (cleanUser === 'organizer' && password === (process.env.DEFAULT_ORGANIZER_PASS || 'hashcore2026')) {
        const token = jwt.sign(
          { id: 'default-organizer', username: 'organizer', name: 'SEUSL Organizer', role: 'organizer' },
          jwtSecret,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          token,
          user: { username: 'organizer', name: 'SEUSL Organizer', role: 'organizer' },
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('[AuthRoutes] Login error:', err.message);
    res.status(500).json({ success: false, error: 'Server authentication error' });
  }
});

router.get('/me', requireOrganizerAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
