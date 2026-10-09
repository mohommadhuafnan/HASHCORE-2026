import mongoose from 'mongoose';

/**
 * Shared MongoDB connection module with auto-reconnect and safe logging
 */
let isConnected = false;

export async function connectDB(uri) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hashcore2026';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    isConnected = true;
    const safeHost = conn.connection.host || 'local';
    const safeDb = conn.connection.name || 'hashcore2026';
    console.log(`[MongoDB] Connected successfully to [${safeHost}/${safeDb}]`);

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected. Waiting for reconnection...');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error('[MongoDB] Initial connection failed:', error.message);
    throw error;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
