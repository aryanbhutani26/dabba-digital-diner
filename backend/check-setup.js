import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const checkSetup = async () => {
  console.log('🔍 Checking MongoDB setup...\\n');

  console.log('1️⃣ Checking environment variables...');
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    console.log('   Please check your .env file\\n');
    process.exit(1);
  }
  console.log('✅ All environment variables are set\\n');

  console.log('2️⃣ Testing MongoDB connection...');
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB\\n');

    const db = client.db();
    
    console.log('3️⃣ Checking collections...');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const expectedCollections = ['users', 'navbar_items', 'coupons', 'menu_items', 'site_settings'];
    const existingCollections = expectedCollections.filter(c => collectionNames.includes(c));
    
    if (existingCollections.length === 0) {
      console.log('⚠️  No collections found. Run "npm run seed" to create initial data\\n');
    } else {
      console.log('✅ Found collections:', existingCollections.join(', '));
      
      console.log('\\n4️⃣ Checking data...');
      for (const collectionName of existingCollections) {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`   ${collectionName}: ${count} documents`);
      }
      console.log();
    }

    await client.close();
    
    console.log('🎉 Setup check complete!\\n');
    console.log('Next steps:');
    if (existingCollections.length === 0) {
      console.log('1. Run: npm run seed');
      console.log('2. Run: npm run dev');
    } else {
      console.log('1. Run: npm run dev');
      console.log('2. Open: http://localhost:5000/health');
    }
    
    process.exit(0);
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('\\nTroubleshooting:');
    console.log('- Check your MONGODB_URI in .env');
    console.log('- Verify your IP is whitelisted in MongoDB Atlas');
    console.log('- Ensure your database user has correct permissions');
    process.exit(1);
  }
};

checkSetup();
