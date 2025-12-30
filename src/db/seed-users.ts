import connectDB from './mongodb';
import { User } from './models';

async function seedUsers() {
  try {
    await connectDB();
    console.log('🌱 Starting user seeding...');

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@digiverse.com' });
    const existingVendor = await User.findOne({ email: 'vendor@digiverse.com' });
    const existingCustomer = await User.findOne({ email: 'customer@digiverse.com' });

    if (existingAdmin && existingVendor && existingCustomer) {
      console.log('✅ Demo users already exist');
      return;
    }

    // Delete existing demo users if any
    await User.deleteMany({
      email: { $in: ['admin@digiverse.com', 'vendor@digiverse.com', 'customer@digiverse.com'] }
    });

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@digiverse.com',
      password: 'Admin@123',
      role: 'admin',
      emailVerified: true
    });
    console.log('✅ Admin user created:', admin.email);

    // Create vendor user
    const vendor = await User.create({
      name: 'Vendor User',
      email: 'vendor@digiverse.com',
      password: 'Vendor@123',
      role: 'vendor',
      emailVerified: true,
      storeName: 'Premium Digital Store',
      storeDescription: 'High-quality digital products and templates',
      rating: 4.8,
      totalSales: 150,
      totalEarnings: 15000
    });
    console.log('✅ Vendor user created:', vendor.email);

    // Create customer user
    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@digiverse.com',
      password: 'Customer@123',
      role: 'customer',
      emailVerified: true
    });
    console.log('✅ Customer user created:', customer.email);

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:    admin@digiverse.com / Admin@123');
    console.log('Vendor:   vendor@digiverse.com / Vendor@123');
    console.log('Customer: customer@digiverse.com / Customer@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
