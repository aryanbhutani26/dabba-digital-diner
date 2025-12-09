import { connectDB, getDB } from './config/db.js';

const sampleMenuItems = [
  // MAINS - Tandoori Items
  {
    name: "Chicken Tikka",
    description: "Tender chicken pieces marinated in yogurt and spices, grilled in tandoor",
    price: 12.99,
    category: "Mains",
    subcategory: "Tandoori Items",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80",
    isActive: true
  },
  {
    name: "Paneer Tikka",
    description: "Cottage cheese cubes marinated with spices and grilled to perfection",
    price: 11.99,
    category: "Mains",
    subcategory: "Tandoori Items",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80",
    isActive: true
  },
  {
    name: "Tandoori Prawns",
    description: "Jumbo prawns marinated in tandoori spices and grilled",
    price: 16.99,
    category: "Mains",
    subcategory: "Tandoori Items",
    allergens: ["Shellfish", "Dairy"],
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    isActive: true
  },

  // MAINS - Rice
  {
    name: "Chicken Biryani",
    description: "Fragrant basmati rice cooked with tender chicken and aromatic spices",
    price: 14.99,
    category: "Mains",
    subcategory: "Rice",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
    isActive: true
  },
  {
    name: "Vegetable Pulao",
    description: "Basmati rice cooked with mixed vegetables and mild spices",
    price: 9.99,
    category: "Mains",
    subcategory: "Rice",
    allergens: [],
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80",
    isActive: true
  },
  {
    name: "Lamb Biryani",
    description: "Aromatic rice layered with succulent lamb pieces and spices",
    price: 16.99,
    category: "Mains",
    subcategory: "Rice",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
    isActive: true
  },

  // MAINS - Curries
  {
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato and butter gravy",
    price: 13.99,
    category: "Mains",
    subcategory: "Curries",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
    isActive: true
  },
  {
    name: "Dal Makhani",
    description: "Black lentils slow-cooked with butter and cream",
    price: 10.99,
    category: "Mains",
    subcategory: "Curries",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    isActive: true
  },
  {
    name: "Lamb Rogan Josh",
    description: "Kashmiri lamb curry with aromatic spices",
    price: 15.99,
    category: "Mains",
    subcategory: "Curries",
    allergens: [],
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    isActive: true
  },

  // MAINS - Breads
  {
    name: "Garlic Naan",
    description: "Soft leavened bread topped with garlic and butter",
    price: 3.99,
    category: "Mains",
    subcategory: "Breads",
    allergens: ["Gluten", "Dairy"],
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    isActive: true
  },
  {
    name: "Butter Naan",
    description: "Classic Indian bread brushed with butter",
    price: 2.99,
    category: "Mains",
    subcategory: "Breads",
    allergens: ["Gluten", "Dairy"],
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
    isActive: true
  },
  {
    name: "Tandoori Roti",
    description: "Whole wheat bread cooked in tandoor",
    price: 2.49,
    category: "Mains",
    subcategory: "Breads",
    allergens: ["Gluten"],
    image: "https://images.unsplash.com/photo-1619365908573-1b0f6e3f5c3e?w=800&q=80",
    isActive: true
  },

  // LUNCH - Appetizers
  {
    name: "Samosa (2 pcs)",
    description: "Crispy pastry filled with spiced potatoes and peas",
    price: 4.99,
    category: "Lunch",
    subcategory: "Appetizers",
    allergens: ["Gluten"],
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    isActive: true
  },
  {
    name: "Onion Bhaji",
    description: "Crispy onion fritters with chickpea flour",
    price: 5.99,
    category: "Lunch",
    subcategory: "Appetizers",
    allergens: ["Gluten"],
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80",
    isActive: true
  },

  // LUNCH - Lunch Specials
  {
    name: "Lunch Thali",
    description: "Complete meal with curry, rice, bread, and dessert",
    price: 12.99,
    category: "Lunch",
    subcategory: "Lunch Specials",
    allergens: ["Gluten", "Dairy"],
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    isActive: true
  },
  {
    name: "Chicken Curry Lunch Box",
    description: "Chicken curry with rice and naan",
    price: 10.99,
    category: "Lunch",
    subcategory: "Lunch Specials",
    allergens: ["Gluten", "Dairy"],
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
    isActive: true
  },

  // DRINKS - Hot Drinks
  {
    name: "Masala Chai",
    description: "Traditional Indian spiced tea",
    price: 3.99,
    category: "Drinks",
    subcategory: "Hot Drinks",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1597318181274-17e0c5e4e8f7?w=800&q=80",
    isActive: true
  },
  {
    name: "Filter Coffee",
    description: "South Indian style filter coffee",
    price: 3.49,
    category: "Drinks",
    subcategory: "Hot Drinks",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
    isActive: true
  },

  // DRINKS - Cold Drinks
  {
    name: "Mango Lassi",
    description: "Sweet yogurt drink with mango",
    price: 4.99,
    category: "Drinks",
    subcategory: "Cold Drinks",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80",
    isActive: true
  },
  {
    name: "Sweet Lassi",
    description: "Traditional yogurt drink",
    price: 3.99,
    category: "Drinks",
    subcategory: "Cold Drinks",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80",
    isActive: true
  },
  {
    name: "Fresh Lime Soda",
    description: "Refreshing lime with soda water",
    price: 3.49,
    category: "Drinks",
    subcategory: "Cold Drinks",
    allergens: [],
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
    isActive: true
  },

  // DESSERTS
  {
    name: "Gulab Jamun",
    description: "Soft milk dumplings in rose-flavored syrup",
    price: 5.99,
    category: "Desserts",
    subcategory: "",
    allergens: ["Dairy", "Gluten"],
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    isActive: true
  },
  {
    name: "Rasmalai",
    description: "Cottage cheese dumplings in sweetened milk",
    price: 6.99,
    category: "Desserts",
    subcategory: "",
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
    isActive: true
  },
  {
    name: "Kulfi",
    description: "Traditional Indian ice cream",
    price: 4.99,
    category: "Desserts",
    subcategory: "",
    allergens: ["Dairy", "Nuts"],
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80",
    isActive: true
  },
  {
    name: "Gajar Halwa",
    description: "Carrot pudding with nuts and cardamom",
    price: 5.99,
    category: "Desserts",
    subcategory: "",
    allergens: ["Dairy", "Nuts"],
    image: "https://images.unsplash.com/photo-1606312619070-d48b4cda8bf6?w=800&q=80",
    isActive: true
  }
];

const seedMenu = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    const db = getDB();

    console.log('🗑️  Clearing existing menu items...');
    await db.collection('menu_items').deleteMany({});

    console.log('📝 Inserting sample menu items...');
    const result = await db.collection('menu_items').insertMany(
      sampleMenuItems.map(item => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    console.log(`✅ Successfully inserted ${result.insertedCount} menu items!`);

    // Initialize lunch menu setting
    console.log('⚙️  Setting up lunch menu configuration...');
    await db.collection('site_settings').updateOne(
      { key: 'lunch_menu_enabled' },
      { 
        $set: { 
          value: true,
          updatedAt: new Date() 
        },
        $setOnInsert: { 
          key: 'lunch_menu_enabled',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ Lunch menu setting initialized!');

    // Display summary
    console.log('\n📊 Menu Summary:');
    const categories = await db.collection('menu_items').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} items`);
    });

    console.log('\n🎉 Menu seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend: cd frontend && npm run dev');
    console.log('   3. Visit the Menu page to see the new structure');
    console.log('   4. Go to Admin → General Settings to control lunch menu');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding menu:', error);
    process.exit(1);
  }
};

seedMenu();
