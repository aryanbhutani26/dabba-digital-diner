import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';

const resetAdmin = async () => {
  try {
    const db = await connectDB();

    console.log('🔄 Resetting admin user...');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@indiya.com' });
    
    if (existingAdmin) {
      // Update existing admin
      await db.collection('users').updateOne(
        { email: 'admin@indiya.com' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            updatedAt: new Date()
          } 
        }
      );
      console.log('✅ Admin user password reset successfully');
    } else {
      // Create new admin
      await db.collection('users').insertOne({
        email: 'admin@indiya.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('📧 Email: admin@indiya.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
};

resetAdmin();
