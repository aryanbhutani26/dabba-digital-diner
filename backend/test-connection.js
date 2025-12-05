import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection String:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password

const options = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
};

const client = new MongoClient(uri, options);

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    
    const db = client.db();
    console.log('📊 Database:', db.databaseName);
    
    // Test ping
    const result = await db.command({ ping: 1 });
    console.log('✅ Ping successful:', result);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'None');
    
    await client.close();
    console.log('\n✅ Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    
    console.error('\n📋 Common Issues:');
    console.error('1. MongoDB Atlas cluster is paused (free tier pauses after inactivity)');
    console.error('2. IP address not whitelisted in Network Access');
    console.error('3. Incorrect credentials in connection string');
    console.error('4. Firewall blocking MongoDB port (27017)');
    
    console.error('\n💡 Solutions:');
    console.error('1. Go to MongoDB Atlas and resume your cluster');
    console.error('2. Add your IP to Network Access (or use 0.0.0.0/0 for all IPs)');
    console.error('3. Verify username and password in .env file');
    console.error('4. Try connecting from a different network');
    
    process.exit(1);
  }
}

testConnection();
