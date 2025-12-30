import connectDB from '@/db/mongodb';
import { PlatformSettings } from '@/db/models';

async function main() {
  await connectDB();

  const defaultSettings = [
    {
      category: 'general',
      settings: {
        siteName: 'DigiVerse',
        siteDescription: 'Your trusted marketplace for premium digital products',
        contactEmail: 'support@digiverse.com',
        timezone: 'UTC',
        currency: 'USD',
        maintenanceMode: false
      }
    },
    {
      category: 'commission',
      settings: {
        defaultRate: 15,
        premiumVendorRate: 10,
        sponsoredVendorRate: 5,
        minimumPayout: 50,
        payoutSchedule: 'weekly'
      }
    },
    {
      category: 'notifications',
      settings: {
        emailNotifications: true,
        orderConfirmation: true,
        productApproval: true,
        withdrawalUpdates: true,
        marketingEmails: false
      }
    },
    {
      category: 'security',
      settings: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8
      }
    },
    {
      category: 'whatsapp',
      settings: {
        enabled: false,
        phoneNumber: '',
        defaultMessage: 'Hello! How can we help you today?',
        autoReply: true,
        businessHours: '9 AM - 6 PM'
      }
    }
  ];

  // Clear existing settings
  await PlatformSettings.deleteMany({});
  
  // Insert default settings
  await PlatformSettings.insertMany(defaultSettings);

  console.log('✅ Platform settings seeded successfully');
  console.log(`   - Categories: ${defaultSettings.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });