import connectDB from './mongodb';
import { User } from './models';
import bcrypt from 'bcryptjs';

async function fixPasswords() {
  try {
    await connectDB();
    console.log('🔧 Fixing user passwords...');

    // Define the demo users with their passwords
    const demoUsers = [
      { email: 'admin@digiverse.com', password: 'Admin@123', name: 'Admin User', role: 'admin' },
      { email: 'vendor@digiverse.com', password: 'Vendor@123', name: 'John Vendor', role: 'vendor' },
      { email: 'customer@digiverse.com', password: 'Customer@123', name: 'Sarah Designer', role: 'customer' }
    ];

    for (const userData of demoUsers) {
      // Find user by email
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        // Update user with hashed password using direct MongoDB update
        await User.updateOne(
          { email: userData.email },
          { 
            $set: { 
              password: hashedPassword,
              emailVerified: true,
              role: userData.role
            } 
          }
        );
        console.log(`✅ Updated password for: ${userData.email}`);
      } else {
        // Create new user with hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role as 'admin' | 'vendor' | 'customer',
          emailVerified: true,
          ...(userData.role === 'vendor' && {
            storeName: 'Premium Digital Store',
            storeDescription: 'High-quality digital products and templates',
            rating: 4.8,
            totalSales: 150,
            totalEarnings: 15000
          })
        });
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    // Verify passwords were stored
    console.log('\n🔍 Verifying passwords in database...');
    for (const userData of demoUsers) {
      const user = await User.findOne({ email: userData.email });
      console.log(`${userData.email}: ${user?.password ? '✅ Password stored' : '❌ No password'}`);
    }

    console.log('\n🎉 Password fix completed successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:    admin@digiverse.com / Admin@123');
    console.log('Vendor:   vendor@digiverse.com / Vendor@123');
    console.log('Customer: customer@digiverse.com / Customer@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    process.exit(1);
  }
}

fixPasswords();
