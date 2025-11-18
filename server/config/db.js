import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

// MongoDB client options with SSL/TLS configuration
const options = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
};

const client = new MongoClient(uri, options);

let db;

export const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await client.connect();
    db = client.db();
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log('✅ MongoDB Connected Successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n📋 Troubleshooting Steps:');
    console.error('1. Check if your MongoDB Atlas cluster is active (not paused)');
    console.error('2. Verify your IP address is whitelisted in MongoDB Atlas');
    console.error('3. Check your internet connection');
    console.error('4. Verify the connection string in .env file');
    console.error('\n💡 To whitelist your IP:');
    console.error('   - Go to MongoDB Atlas → Network Access');
    console.error('   - Click "Add IP Address"');
    console.error('   - Select "Allow Access from Anywhere" (0.0.0.0/0)');
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export default client;
