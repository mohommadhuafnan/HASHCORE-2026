import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables from backend/.env or root .env
dotenv.config();

import { connectDB } from './config/db.js';
import { getOrCreateDefaultEvent } from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';
import { processPendingAttendanceNotifications } from './services/attendanceNotificationWorker.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://hashcoreseu2026.vercel.app',
  'https://hashcode-flax.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: "SEUSL HASHCORE '26 API Citadel",
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error: ' + (err.message || 'Unknown error'),
  });
});

// Startup sequence
async function startServer() {
  try {
    await connectDB();
    await getOrCreateDefaultEvent();

    // Ensure default organizer user exists
    const defaultOrg = await User.findOne({ username: 'organizer' });
    if (!defaultOrg) {
      const hash = await bcrypt.hash(process.env.DEFAULT_ORGANIZER_PASS || 'hashcore2026', 10);
      await User.create({
        username: 'organizer',
        name: 'SEUSL Event Organizer',
        email: process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk',
        passwordHash: hash,
        role: 'organizer',
      });
      console.log('[Auth] Default organizer account initialized (username: "organizer")');
    }

    const server = app.listen(PORT, () => {
      console.log(`\n============================================================`);
      console.log(`🛡️  SEUSL HASHCORE '26 CITADEL BACKEND RUNNING ON PORT ${PORT}`);
      console.log(`📡 API Endpoints: http://localhost:${PORT}/api`);
      console.log(`============================================================\n`);
    });

    // Start background notification retry worker every 60 seconds
    setInterval(() => {
      processPendingAttendanceNotifications().catch(() => {});
    }, 60000);

    return server;
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

// Start if executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  startServer();
}

export { app, startServer };
