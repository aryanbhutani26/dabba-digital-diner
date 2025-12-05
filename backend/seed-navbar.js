import { connectDB } from './config/db.js';

const seedNavbar = async () => {
  try {
    const db = await connectDB();

    console.log('🌱 Seeding navbar items...');

    // Check if navbar items already exist
    const existingItems = await db.collection('navbar_items').countDocuments();
    
    if (existingItems > 0) {
      console.log(`ℹ️  Found ${existingItems} existing navbar items. Skipping seed.`);
      console.log('💡 To reset navbar items, delete them from the database first.');
      process.exit(0);
    }

    // Seed navbar items
    const navbarItems = [
      { name: 'Home', path: '/', sortOrder: 1, isActive: true, createdAt: new Date() },
      { name: 'Menu', path: '/menu', sortOrder: 2, isActive: true, createdAt: new Date() },
      { name: 'About', path: '/about', sortOrder: 3, isActive: true, createdAt: new Date() },
      { name: 'Services', path: '/services', sortOrder: 4, isActive: true, createdAt: new Date() },
      { name: 'Gallery', path: '/gallery', sortOrder: 5, isActive: true, createdAt: new Date() },
      { name: 'Contact', path: '/contact', sortOrder: 6, isActive: true, createdAt: new Date() },
    ];
    
    await db.collection('navbar_items').insertMany(navbarItems);
    console.log('✅ Navbar items created successfully');
    console.log('📋 Items:', navbarItems.map(item => item.name).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedNavbar();
