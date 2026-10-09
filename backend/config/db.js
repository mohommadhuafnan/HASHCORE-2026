import mongoose from 'mongoose';
import dns from 'dns';

// Ensure reliable SRV DNS resolution on Windows and cloud environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom servers cannot be set
}

const resolver = new dns.Resolver();
try {
  resolver.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom servers cannot be set
}

function customLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  resolver.resolve4(hostname, (err, addresses) => {
    if (err) return dns.lookup(hostname, options, callback);
    if (options && options.all) {
      return callback(null, addresses.map(a => ({ address: a, family: 4 })));
    }
    return callback(null, addresses[0], 4);
  });
}

/**
 * Shared MongoDB connection module with auto-reconnect and safe logging
 */
let isConnected = false;

export async function connectDB(uri) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const directAtlasUri = 'mongodb://mohommadhuafnan756_db_user:Eya8Pq00OvkY4Voq@ac-ehwovdb-shard-00-00.kvtj40f.mongodb.net:27017,ac-ehwovdb-shard-00-01.kvtj40f.mongodb.net:27017,ac-ehwovdb-shard-00-02.kvtj40f.mongodb.net:27017/hashcore2026?ssl=true&authSource=admin&retryWrites=true&w=majority';
  const mongoUri = uri || process.env.MONGODB_URI || directAtlasUri;

  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true,
    lookup: customLookup,
  };

  try {
    let conn;
    try {
      conn = await mongoose.connect(mongoUri, connectOptions);
    } catch (primaryErr) {
      // If SRV lookup fails due to local router DNS, try direct Atlas shard replica set
      if (mongoUri.includes('mongodb+srv') && directAtlasUri !== mongoUri) {
        console.warn('[MongoDB] SRV connect warning:', primaryErr.message, '-> Retrying direct Atlas shards...');
        conn = await mongoose.connect(directAtlasUri, connectOptions);
      } else {
        throw primaryErr;
      }
    }

    isConnected = true;
    const safeHost = conn.connection.host || 'Atlas Cloud';
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
