import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Database URIs
const AUTH_URI = 'mongodb://localhost:27017/restaurant_platform_auth';
const MENU_URI = 'mongodb://localhost:27017/restaurant_platform_menu';
const INVENTORY_URI = 'mongodb://localhost:27017/restaurant_platform_inventory';
const LOYALTY_URI = 'mongodb://localhost:27017/restaurant_platform_loyalty';
const NOTIFICATION_URI = 'mongodb://localhost:27017/restaurant_platform_notifications';

async function seed() {
  console.log('====================================================');
  console.log('🌱 Starting Platform Master Database Seeding Process...');
  console.log('====================================================');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Seed Menu & Branches Database
  console.log('👉 Seeding Branches and Menus (menu-service)...');
  const menuConn = await mongoose.createConnection(MENU_URI).asPromise();
  
  // Define inline schemas for seeder simplicity
  const BranchSchema = new mongoose.Schema({
    name: String, address: String, city: String, phone: String, isActive: Boolean, coords: { lat: Number, lng: Number }
  }, { collection: 'branches' });
  const MenuItemSchema = new mongoose.Schema({
    name: String, description: String, price: Number, category: String, imageUrl: String,
    isVegetarian: Boolean, isAvailable: Boolean, branchIds: [String],
    nutritionalInfo: { calories: Number, protein: Number, carbs: Number, fat: Number },
    ingredients: [{ itemId: String, name: String, quantity: Number, unit: String }]
  }, { collection: 'menuitems' });
  const ReviewSchema = new mongoose.Schema({
    userId: String, userName: String, menuItemId: String, rating: Number, comment: String
  }, { collection: 'reviews' });

  const BranchModel = menuConn.model('Branch', BranchSchema);
  const MenuItemModel = menuConn.model('MenuItem', MenuItemSchema);
  const ReviewModel = menuConn.model('Review', ReviewSchema);

  await BranchModel.deleteMany({});
  await MenuItemModel.deleteMany({});
  await ReviewModel.deleteMany({});

  const branch1 = await BranchModel.create({
    name: 'Downtown Bistro',
    address: '102 Grand Avenue, Suite B',
    city: 'San Francisco',
    phone: '+1 (415) 555-0192',
    isActive: true,
    coords: { lat: 37.7749, lng: -122.4194 }
  });

  const branch2 = await BranchModel.create({
    name: 'Uptown Lounge & Grill',
    address: '888 Broadway St',
    city: 'New York',
    phone: '+1 (212) 555-0453',
    isActive: true,
    coords: { lat: 40.7128, lng: -74.0060 }
  });

  const b1Id = branch1._id.toString();
  const b2Id = branch2._id.toString();

  const burger1 = await MenuItemModel.create({
    name: 'Classic Cheese Burger',
    description: 'Juicy grass-fed beef patty topped with cheddar cheese, crisp lettuce, ripe tomatoes, and organic house sauce on a toasted brioche bun.',
    price: 11.99,
    category: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isVegetarian: false,
    isAvailable: true,
    branchIds: [b1Id, b2Id],
    nutritionalInfo: { calories: 650, protein: 32, carbs: 45, fat: 28 },
    ingredients: [
      { itemId: 'beef_patty', name: 'Beef Patty', quantity: 1, unit: 'pcs' },
      { itemId: 'cheese_slice', name: 'Cheese Slice', quantity: 1, unit: 'pcs' },
      { itemId: 'burger_bun', name: 'Burger Bun', quantity: 1, unit: 'pcs' },
      { itemId: 'lettuce_leaves', name: 'Lettuce Leaves', quantity: 20, unit: 'g' }
    ]
  });

  const burger2 = await MenuItemModel.create({
    name: 'Double Smash Burger',
    description: 'Double custom smash patties, double cheese, caramelized onions, pickles, and smoky burger sauce on a buttered bun.',
    price: 14.99,
    category: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    isVegetarian: false,
    isAvailable: true,
    branchIds: [b1Id],
    nutritionalInfo: { calories: 880, protein: 48, carbs: 46, fat: 44 },
    ingredients: [
      { itemId: 'beef_patty', name: 'Beef Patty', quantity: 2, unit: 'pcs' },
      { itemId: 'cheese_slice', name: 'Cheese Slice', quantity: 2, unit: 'pcs' },
      { itemId: 'burger_bun', name: 'Burger Bun', quantity: 1, unit: 'pcs' },
      { itemId: 'secret_sauce', name: 'Secret Sauce', quantity: 15, unit: 'ml' }
    ]
  });

  const burger3 = await MenuItemModel.create({
    name: 'Crispy Chicken Burger',
    description: 'Crispy buttermilk chicken breast, spicy coleslaw, kosher pickles, and herb mayo on a potato bun.',
    price: 12.99,
    category: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
    isVegetarian: false,
    isAvailable: true,
    branchIds: [b1Id, b2Id],
    nutritionalInfo: { calories: 590, protein: 28, carbs: 49, fat: 21 },
    ingredients: [
      { itemId: 'chicken_patty', name: 'Chicken Patty', quantity: 1, unit: 'pcs' },
      { itemId: 'burger_bun', name: 'Burger Bun', quantity: 1, unit: 'pcs' },
      { itemId: 'lettuce_leaves', name: 'Lettuce Leaves', quantity: 15, unit: 'g' },
      { itemId: 'mayonnaise', name: 'Mayonnaise', quantity: 10, unit: 'g' }
    ]
  });

  const pizza1 = await MenuItemModel.create({
    name: 'Margherita Pizza',
    description: 'Neapolitan style sourdough crust topped with rich San Marzano tomato sauce, fresh buffalo mozzarella, aromatic fresh basil leaves, and extra virgin olive oil drizzle.',
    price: 13.99,
    category: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true,
    isAvailable: true,
    branchIds: [b1Id, b2Id],
    nutritionalInfo: { calories: 720, protein: 24, carbs: 90, fat: 18 },
    ingredients: [
      { itemId: 'pizza_dough', name: 'Pizza Dough', quantity: 1, unit: 'pcs' },
      { itemId: 'tomato_sauce', name: 'Tomato Sauce', quantity: 100, unit: 'ml' },
      { itemId: 'mozzarella_cheese', name: 'Mozzarella Cheese', quantity: 150, unit: 'g' },
      { itemId: 'fresh_basil', name: 'Fresh Basil', quantity: 10, unit: 'g' }
    ]
  });

  const pizza2 = await MenuItemModel.create({
    name: 'Spicy Pepperoni Pizza',
    description: 'Hand-stretched crust, loaded with pepperoni rounds, spicy honey drizzle, mozzarella cheese, and red chili flakes.',
    price: 15.99,
    category: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    isVegetarian: false,
    isAvailable: true,
    branchIds: [b1Id, b2Id],
    nutritionalInfo: { calories: 890, protein: 34, carbs: 92, fat: 26 },
    ingredients: [
      { itemId: 'pizza_dough', name: 'Pizza Dough', quantity: 1, unit: 'pcs' },
      { itemId: 'tomato_sauce', name: 'Tomato Sauce', quantity: 100, unit: 'ml' },
      { itemId: 'mozzarella_cheese', name: 'Mozzarella Cheese', quantity: 120, unit: 'g' },
      { itemId: 'pepperoni_slices', name: 'Pepperoni Slices', quantity: 15, unit: 'pcs' }
    ]
  });

  const dessert1 = await MenuItemModel.create({
    name: 'Chocolate Fudge Brownie',
    description: 'Warm, gooey chocolate fudge brownie topped with single-origin dark chocolate chips, served with organic chocolate drizzle.',
    price: 6.99,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true,
    isAvailable: true,
    branchIds: [b1Id, b2Id],
    nutritionalInfo: { calories: 420, protein: 5, carbs: 54, fat: 19 },
    ingredients: [
      { itemId: 'fudge_mix', name: 'Fudge Mix', quantity: 1, unit: 'pcs' },
      { itemId: 'chocolate_syrup', name: 'Chocolate Syrup', quantity: 30, unit: 'ml' }
    ]
  });

  const beverage1 = await MenuItemModel.create({
    name: 'Craft Stout Beer',
    description: 'Rich local porter with chocolate, espresso roast, and caramel hop finish notes. Strictly 21+ only.',
    price: 7.99,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true,
    isAvailable: true,
    branchIds: [b1Id, b2Id],
    nutritionalInfo: { calories: 190, protein: 2, carbs: 12, fat: 0 },
    ingredients: [
      { itemId: 'beer_bottle', name: 'Beer Bottle', quantity: 1, unit: 'pcs' }
    ]
  });

  const beverage2 = await MenuItemModel.create({
    name: 'Organic Lemonade',
    description: 'Freshly squeezed Sicilian lemons, organic raw sugar, carbonated spring water, and wild mint spring garnishes.',
    price: 4.99,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isVegetarian: true,
    isAvailable: true,
    branchIds: [b1Id, b2Id],
    nutritionalInfo: { calories: 110, protein: 0, carbs: 28, fat: 0 },
    ingredients: [
      { itemId: 'lemons', name: 'Lemons', quantity: 2, unit: 'pcs' },
      { itemId: 'soda_can', name: 'Soda Can', quantity: 1, unit: 'pcs' }
    ]
  });

  // Seed sample reviews
  await ReviewModel.create({
    userId: 'cust_seed_1',
    userName: 'Jane Doe',
    menuItemId: burger1._id.toString(),
    rating: 5,
    comment: 'The juiciest burger in the city! Absolute perfection.'
  });
  await ReviewModel.create({
    userId: 'cust_seed_2',
    userName: 'John Smith',
    menuItemId: pizza1._id.toString(),
    rating: 4,
    comment: 'Awesome crust, super authentic sauce. Needed a pinch of salt but loved it.'
  });

  await menuConn.close();

  // 2. Seed Users Auth Database
  console.log('👉 Seeding Users Credentials (auth-service)...');
  const authConn = await mongoose.createConnection(AUTH_URI).asPromise();
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    branchId: { type: String, default: null }
  }, { collection: 'users' });
  const UserModel = authConn.model('User', UserSchema);

  await UserModel.deleteMany({});

  const superAdminUser = await UserModel.create({
    name: 'CEO Michael Scott',
    email: 'superadmin@restaurant.com',
    password: hashedPassword,
    role: 'superadmin',
    branchId: null
  });

  const branchAdminUser = await UserModel.create({
    name: 'Manager Pam Beesly',
    email: 'admin@restaurant.com',
    password: hashedPassword,
    role: 'admin',
    branchId: b1Id
  });

  const kitchenStaffUser = await UserModel.create({
    name: 'Chef Dwight Schrute',
    email: 'kitchen@restaurant.com',
    password: hashedPassword,
    role: 'kitchen',
    branchId: b1Id
  });

  const customerUser = await UserModel.create({
    name: 'Jim Halpert',
    email: 'customer@restaurant.com',
    password: hashedPassword,
    role: 'customer',
    branchId: null
  });

  await authConn.close();

  // 3. Seed Inventory Database
  console.log('👉 Seeding Ingredients Stocks (inventory-service)...');
  const inventoryConn = await mongoose.createConnection(INVENTORY_URI).asPromise();
  const InventorySchema = new mongoose.Schema({
    branchId: String, name: String, quantity: Number, unit: String, minThreshold: Number, supplier: String
  }, { collection: 'inventoryitems' });
  const InventoryModel = inventoryConn.model('InventoryItem', InventorySchema);

  await InventoryModel.deleteMany({});

  const ingredientsList = [
    { name: 'Beef Patty', quantity: 50, unit: 'pcs', minThreshold: 10 },
    { name: 'Chicken Patty', quantity: 40, unit: 'pcs', minThreshold: 8 },
    { name: 'Cheese Slice', quantity: 150, unit: 'pcs', minThreshold: 20 },
    { name: 'Burger Bun', quantity: 60, unit: 'pcs', minThreshold: 12 },
    { name: 'Lettuce Leaves', quantity: 3000, unit: 'g', minThreshold: 500 },
    { name: 'Pizza Dough', quantity: 45, unit: 'pcs', minThreshold: 10 },
    { name: 'Tomato Sauce', quantity: 8000, unit: 'ml', minThreshold: 1500 },
    { name: 'Mozzarella Cheese', quantity: 6000, unit: 'g', minThreshold: 1000 },
    { name: 'Fresh Basil', quantity: 500, unit: 'g', minThreshold: 100 },
    { name: 'Pepperoni Slices', quantity: 200, unit: 'pcs', minThreshold: 40 },
    { name: 'Fudge Mix', quantity: 30, unit: 'pcs', minThreshold: 5 },
    { name: 'Chocolate Syrup', quantity: 2000, unit: 'ml', minThreshold: 300 },
    { name: 'Beer Bottle', quantity: 120, unit: 'pcs', minThreshold: 24 },
    { name: 'Lemons', quantity: 80, unit: 'pcs', minThreshold: 15 },
    { name: 'Soda Can', quantity: 100, unit: 'pcs', minThreshold: 20 },
  ];

  // Seed for BOTH branches!
  for (const item of ingredientsList) {
    await InventoryModel.create({
      branchId: b1Id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minThreshold: item.minThreshold,
      supplier: 'Sysco Premium Restaurant Foods'
    });

    // Branch B has slightly lower starter inventory to trigger low stock dashboard warnings!
    await InventoryModel.create({
      branchId: b2Id,
      name: item.name,
      quantity: Math.floor(item.quantity * 0.4),
      unit: item.unit,
      minThreshold: item.minThreshold,
      supplier: 'United Food Services Inc'
    });
  }

  await inventoryConn.close();

  // 4. Seed Loyalty & Coupons Database
  console.log('👉 Seeding Reward Cards and Coupons (loyalty-service)...');
  const loyaltyConn = await mongoose.createConnection(LOYALTY_URI).asPromise();
  const LoyaltySchema = new mongoose.Schema({
    userId: String, userName: String, points: Number, tier: String, totalSpent: Number
  }, { collection: 'loyalties' });
  const CouponSchema = new mongoose.Schema({
    code: String, discountType: String, value: Number, minOrderValue: Number, isActive: Boolean, expiresAt: Date
  }, { collection: 'coupons' });

  const LoyaltyModel = loyaltyConn.model('Loyalty', LoyaltySchema);
  const CouponModel = loyaltyConn.model('Coupon', CouponSchema);

  await LoyaltyModel.deleteMany({});
  await CouponModel.deleteMany({});

  // Customer starter card
  await LoyaltyModel.create({
    userId: customerUser._id.toString(),
    userName: customerUser.name,
    points: 150,
    tier: 'Silver',
    totalSpent: 249.99
  });

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await CouponModel.create({
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 20,
    isActive: true,
    expiresAt: nextYear
  });

  await CouponModel.create({
    code: 'SUPERBOWL',
    discountType: 'fixed',
    value: 15,
    minOrderValue: 35,
    isActive: true,
    expiresAt: nextYear
  });

  await CouponModel.create({
    code: 'FREEMEAL',
    discountType: 'fixed',
    value: 50,
    minOrderValue: 50,
    isActive: true,
    expiresAt: nextYear
  });

  await loyaltyConn.close();

  // 5. Seed Notification Database
  console.log('👉 Cleaning Notifications (notification-service)...');
  const notificationConn = await mongoose.createConnection(NOTIFICATION_URI).asPromise();
  const NotificationSchema = new mongoose.Schema({
    userId: String, title: String, message: String, type: String, isRead: Boolean
  }, { collection: 'notifications' });
  const NotificationModel = notificationConn.model('Notification', NotificationSchema);

  await NotificationModel.deleteMany({});
  
  await NotificationModel.create({
    userId: customerUser._id.toString(),
    title: 'Welcome to the platform!',
    message: 'We are thrilled to have you here. Apply the coupon WELCOME10 on your first order to get 10% off your checkout!',
    type: 'general',
    isRead: false
  });

  await notificationConn.close();

  console.log('====================================================');
  console.log('🎉 MASTER DATABASE SEED COMPLETE. ENJOY DEVELOPING!');
  console.log('====================================================');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seeder ERROR]:', err);
  process.exit(1);
});
