import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';

const seedData = async () => {
  try {
    const db = await connectDB();

    console.log('🌱 Starting database seed...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await db.collection('users').deleteMany({});
    // await db.collection('navbar_items').deleteMany({});
    // await db.collection('coupons').deleteMany({});
    // await db.collection('menu_items').deleteMany({});
    // await db.collection('site_settings').deleteMany({});

    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      email: 'admin@indiya.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
    });
    console.log('✅ Admin user created (email: admin@indiya.com, password: admin123)');

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
    console.log('✅ Navbar items created');

    // Seed coupons
    const coupons = [
      {
        title: '20% OFF',
        subtitle: 'Weekend Dinner',
        description: 'Valid on Fri-Sun from 6 PM onwards',
        code: 'WEEKEND20',
        icon: 'Percent',
        color: 'from-amber-500 to-amber-600',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Free Dessert',
        subtitle: 'On Your Birthday',
        description: 'Show your ID and enjoy a complimentary dessert',
        code: 'BIRTHDAY',
        icon: 'Gift',
        color: 'from-amber-500 to-amber-600',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '30% OFF',
        subtitle: 'First Time Visit',
        description: 'New customers get special discount on first order',
        code: 'FIRST30',
        icon: 'Tag',
        color: 'from-amber-500 to-amber-600',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection('coupons').insertMany(coupons);
    console.log('✅ Coupons created');

    // Seed menu items
    const menuItems = [
      {
        name: 'Grilled Ribeye',
        description: '16oz prime ribeye with roasted vegetables',
        price: '45.99',
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
        allergens: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pan-Seared Salmon',
        description: 'Atlantic salmon with herb butter',
        price: '38.99',
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
        allergens: ['fish'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Lobster Linguine',
        description: 'Fresh lobster in white wine sauce',
        price: '52.99',
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
        allergens: ['shellfish', 'gluten'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection('menu_items').insertMany(menuItems);
    console.log('✅ Menu items created');

    // Seed site settings
    const settings = [
      {
        key: 'services_visible',
        value: true,
        updatedAt: new Date(),
      },
    ];
    await db.collection('site_settings').insertMany(settings);
    console.log('✅ Site settings created');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();
