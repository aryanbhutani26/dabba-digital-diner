import { connectDB } from './config/db.js';

const seedOrders = async () => {
  try {
    const db = await connectDB();

    console.log('🌱 Seeding sample orders...');

    // Get a user to assign orders to
    const users = await db.collection('users').find().limit(1).toArray();
    const deliveryBoyId = users[0]?._id.toString();

    const sampleOrders = [
      {
        orderNumber: 'ORD001',
        customerName: 'John Doe',
        customerPhone: '+91 98765 43210',
        deliveryAddress: '123 MG Road, Bangalore, Karnataka 560001',
        items: [
          { name: 'Grilled Chicken', quantity: 2, price: 299 },
          { name: 'Caesar Salad', quantity: 1, price: 199 }
        ],
        totalAmount: 797,
        deliveryFee: 50,
        status: 'assigned',
        deliveryBoyId: deliveryBoyId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderNumber: 'ORD002',
        customerName: 'Jane Smith',
        customerPhone: '+91 87654 32109',
        deliveryAddress: '456 Brigade Road, Bangalore, Karnataka 560025',
        items: [
          { name: 'Margherita Pizza', quantity: 1, price: 399 },
          { name: 'Garlic Bread', quantity: 1, price: 149 }
        ],
        totalAmount: 548,
        deliveryFee: 40,
        status: 'picked_up',
        deliveryBoyId: deliveryBoyId,
        createdAt: new Date(Date.now() - 15 * 60000), // 15 mins ago
        pickedUpAt: new Date(Date.now() - 5 * 60000), // 5 mins ago
        updatedAt: new Date()
      },
      {
        orderNumber: 'ORD003',
        customerName: 'Mike Johnson',
        customerPhone: '+91 76543 21098',
        deliveryAddress: '789 Indiranagar, Bangalore, Karnataka 560038',
        items: [
          { name: 'Butter Chicken', quantity: 1, price: 349 },
          { name: 'Naan', quantity: 2, price: 40 },
          { name: 'Biryani', quantity: 1, price: 299 }
        ],
        totalAmount: 728,
        deliveryFee: 60,
        status: 'out_for_delivery',
        deliveryBoyId: deliveryBoyId,
        createdAt: new Date(Date.now() - 30 * 60000), // 30 mins ago
        pickedUpAt: new Date(Date.now() - 20 * 60000),
        outForDeliveryAt: new Date(Date.now() - 10 * 60000),
        updatedAt: new Date()
      }
    ];

    await db.collection('orders').insertMany(sampleOrders);
    console.log('✅ Sample orders created');

    // Create some delivered orders for stats
    const deliveredOrders = [
      {
        orderNumber: 'ORD004',
        customerName: 'Sarah Williams',
        customerPhone: '+91 65432 10987',
        deliveryAddress: '321 Koramangala, Bangalore, Karnataka 560034',
        items: [
          { name: 'Pasta Alfredo', quantity: 1, price: 299 }
        ],
        totalAmount: 299,
        deliveryFee: 40,
        status: 'delivered',
        deliveryBoyId: deliveryBoyId,
        createdAt: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
        deliveredAt: new Date(Date.now() - 1 * 60 * 60000), // 1 hour ago
        updatedAt: new Date()
      },
      {
        orderNumber: 'ORD005',
        customerName: 'David Brown',
        customerPhone: '+91 54321 09876',
        deliveryAddress: '654 Whitefield, Bangalore, Karnataka 560066',
        items: [
          { name: 'Burger Combo', quantity: 2, price: 399 }
        ],
        totalAmount: 798,
        deliveryFee: 70,
        status: 'delivered',
        deliveryBoyId: deliveryBoyId,
        createdAt: new Date(Date.now() - 3 * 60 * 60000),
        deliveredAt: new Date(Date.now() - 2 * 60 * 60000),
        updatedAt: new Date()
      }
    ];

    await db.collection('orders').insertMany(deliveredOrders);
    console.log('✅ Delivered orders created for stats');

    console.log('🎉 Order seeding complete!');
    console.log('\nSample orders created:');
    console.log('- 3 active orders (assigned, picked_up, out_for_delivery)');
    console.log('- 2 delivered orders (for stats)');
    console.log(`\nAll orders assigned to user: ${deliveryBoyId}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedOrders();
