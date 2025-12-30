import connectDB from './mongodb';
import { User, Product, Order, Review, Transaction, Notification } from './models';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    await connectDB();
    console.log('🔄 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create users with login credentials
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedVendorPassword = await bcrypt.hash('Vendor@123', 10);
    const hashedCustomerPassword = await bcrypt.hash('Customer@123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@digiverse.com',
      emailVerified: true,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const vendor1 = await User.create({
      name: 'John Vendor',
      email: 'vendor@digiverse.com',
      emailVerified: true,
      role: 'vendor',
      storeName: 'Premium Digital Store',
      storeDescription: 'High-quality WordPress themes and plugins for modern websites',
      rating: 4.8,
      totalSales: 342,
      totalEarnings: 25680.50,
      bio: 'Professional developer with 8+ years of experience creating premium digital products',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const vendor2 = await User.create({
      name: 'Sarah Designer',
      email: 'sarah@designhub.com',
      emailVerified: true,
      role: 'vendor',
      storeName: 'Design Hub',
      storeDescription: 'Beautiful UI kits and templates for web and mobile',
      rating: 4.9,
      totalSales: 512,
      totalEarnings: 42150.00,
      bio: 'UI/UX designer passionate about creating beautiful digital experiences',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const vendor3 = await User.create({
      name: 'Mike Developer',
      email: 'mike@codecrafters.com',
      emailVerified: true,
      role: 'vendor',
      storeName: 'CodeCrafters',
      storeDescription: 'Powerful plugins and extensions for WordPress',
      rating: 4.7,
      totalSales: 289,
      totalEarnings: 18950.00,
      bio: 'Full-stack developer specializing in WordPress development',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const customer = await User.create({
      name: 'Jane Customer',
      email: 'customer@digiverse.com',
      emailVerified: true,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create Account records for password authentication
    const { Account } = await import('./models');
    
    await Account.create({
      accountId: admin._id.toString(),
      providerId: 'credential',
      userId: admin._id.toString(),
      password: hashedAdminPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await Account.create({
      accountId: vendor1._id.toString(),
      providerId: 'credential',
      userId: vendor1._id.toString(),
      password: hashedVendorPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await Account.create({
      accountId: customer._id.toString(),
      providerId: 'credential',
      userId: customer._id.toString(),
      password: hashedCustomerPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Created users with login credentials:');
    console.log('   Admin: admin@digiverse.com / Admin@123');
    console.log('   Vendor: vendor@digiverse.com / Vendor@123');
    console.log('   Customer: customer@digiverse.com / Customer@123');

    // Create products
    const products = [
      // WordPress Themes
      {
        title: 'E-Commerce Pro Theme',
        description: 'Modern and fully responsive e-commerce theme built with WooCommerce. Features include advanced product filtering, quick view, wishlist, mega menu, and multiple homepage layouts. Perfect for online stores of any size.',
        category: 'wordpress-theme',
        price: 89.99,
        images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'],
        downloadUrl: 'https://download.digiverse.com/ecommerce-pro-theme.zip',
        fileSize: '12.5 MB',
        version: '2.4.0',
        compatibility: 'WordPress 6.0+, WooCommerce 8.0+',
        vendorId: vendor1._id.toString(),
        rating: 4.9,
        totalReviews: 156,
        totalSales: 423,
        status: 'approved',
        tags: ['ecommerce', 'woocommerce', 'shop', 'responsive'],
        featured: true,
        demoUrl: 'https://demo.digiverse.com/ecommerce-pro',
        licenseType: 'Regular License'
      },
      {
        title: 'Portfolio Master Theme',
        description: 'Stunning portfolio theme for creatives, photographers, and agencies. Showcase your work with beautiful galleries, smooth animations, and a clean, modern design. Fully customizable with drag-and-drop builder.',
        category: 'wordpress-theme',
        price: 69.99,
        images: ['https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800'],
        downloadUrl: 'https://download.digiverse.com/portfolio-master.zip',
        fileSize: '8.3 MB',
        version: '1.8.2',
        compatibility: 'WordPress 5.9+',
        vendorId: vendor2._id.toString(),
        rating: 4.8,
        totalReviews: 89,
        totalSales: 267,
        status: 'approved',
        tags: ['portfolio', 'creative', 'photography', 'agency'],
        featured: true,
        licenseType: 'Regular License'
      },
      {
        title: 'Corporate Business Theme',
        description: 'Professional business theme perfect for corporate websites, consulting firms, and B2B companies. Features include team showcase, services pages, testimonials, and integrated contact forms.',
        category: 'wordpress-theme',
        price: 79.99,
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
        downloadUrl: 'https://download.digiverse.com/corporate-business.zip',
        fileSize: '10.2 MB',
        version: '3.1.5',
        compatibility: 'WordPress 6.1+',
        vendorId: vendor1._id.toString(),
        rating: 4.7,
        totalReviews: 124,
        totalSales: 312,
        status: 'approved',
        tags: ['business', 'corporate', 'consulting', 'professional'],
        licenseType: 'Regular License'
      },
      {
        title: 'Magazine & Blog Theme',
        description: 'Feature-rich magazine and blog theme with multiple post layouts, sidebar options, and advertising spaces. Perfect for news sites, blogs, and content publishers. SEO optimized and fast loading.',
        category: 'wordpress-theme',
        price: 59.99,
        images: ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'],
        downloadUrl: 'https://download.digiverse.com/magazine-blog.zip',
        fileSize: '7.8 MB',
        version: '2.2.0',
        compatibility: 'WordPress 5.8+',
        vendorId: vendor1._id.toString(),
        rating: 4.6,
        totalReviews: 98,
        totalSales: 189,
        status: 'approved',
        tags: ['magazine', 'blog', 'news', 'content'],
        licenseType: 'Regular License'
      },
      // Plugins
      {
        title: 'Advanced SEO Suite',
        description: 'Complete SEO solution for WordPress with advanced features including XML sitemaps, schema markup, social media integration, redirect manager, and real-time content analysis. Boost your search rankings.',
        category: 'plugin',
        price: 49.99,
        images: ['https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800'],
        downloadUrl: 'https://download.digiverse.com/advanced-seo-suite.zip',
        fileSize: '3.2 MB',
        version: '4.5.1',
        compatibility: 'WordPress 5.5+',
        vendorId: vendor3._id.toString(),
        rating: 4.9,
        totalReviews: 234,
        totalSales: 567,
        status: 'approved',
        tags: ['seo', 'optimization', 'search', 'marketing'],
        featured: true,
        licenseType: 'Extended License'
      },
      {
        title: 'Smart Contact Forms Pro',
        description: 'Powerful drag-and-drop form builder with conditional logic, file uploads, payment integration, email notifications, and spam protection. Create any type of form in minutes.',
        category: 'plugin',
        price: 39.99,
        images: ['https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800'],
        downloadUrl: 'https://download.digiverse.com/smart-contact-forms.zip',
        fileSize: '2.8 MB',
        version: '3.7.2',
        compatibility: 'WordPress 5.6+',
        vendorId: vendor3._id.toString(),
        rating: 4.8,
        totalReviews: 178,
        totalSales: 445,
        status: 'approved',
        tags: ['forms', 'contact', 'builder', 'submissions'],
        licenseType: 'Regular License'
      },
      {
        title: 'Security Guard Pro',
        description: 'Comprehensive WordPress security plugin with firewall, malware scanner, brute force protection, two-factor authentication, and activity logging. Keep your site safe from threats.',
        category: 'plugin',
        price: 54.99,
        images: ['https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800'],
        downloadUrl: 'https://download.digiverse.com/security-guard-pro.zip',
        fileSize: '4.1 MB',
        version: '5.2.0',
        compatibility: 'WordPress 5.9+',
        vendorId: vendor3._id.toString(),
        rating: 4.9,
        totalReviews: 312,
        totalSales: 678,
        status: 'approved',
        tags: ['security', 'firewall', 'protection', 'malware'],
        featured: true,
        licenseType: 'Extended License'
      },
      {
        title: 'Backup & Restore Manager',
        description: 'Automated backup solution for WordPress with scheduled backups, one-click restore, cloud storage integration (Dropbox, Google Drive, Amazon S3), and database optimization.',
        category: 'plugin',
        price: 44.99,
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'],
        downloadUrl: 'https://download.digiverse.com/backup-restore.zip',
        fileSize: '3.5 MB',
        version: '2.9.3',
        compatibility: 'WordPress 5.7+',
        vendorId: vendor3._id.toString(),
        rating: 4.7,
        totalReviews: 145,
        totalSales: 356,
        status: 'approved',
        tags: ['backup', 'restore', 'cloud', 'migration'],
        licenseType: 'Regular License'
      },
      // Templates
      {
        title: 'SaaS Landing Page Pack',
        description: 'Modern landing page templates for SaaS products. Includes 12 unique layouts optimized for conversions with pricing tables, feature sections, testimonials, and CTAs. HTML, CSS, and React versions included.',
        category: 'template',
        price: 34.99,
        images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800'],
        downloadUrl: 'https://download.digiverse.com/saas-landing-pack.zip',
        fileSize: '15.6 MB',
        version: '1.5.0',
        compatibility: 'HTML5, CSS3, React 18+',
        vendorId: vendor2._id.toString(),
        rating: 4.8,
        totalReviews: 167,
        totalSales: 389,
        status: 'approved',
        tags: ['landing-page', 'saas', 'conversion', 'marketing'],
        featured: true,
        licenseType: 'Regular License'
      },
      {
        title: 'Admin Dashboard Template',
        description: 'Full-featured admin dashboard template with 50+ pages, charts, tables, forms, and UI components. Built with React and Tailwind CSS. Perfect for web applications and SaaS products.',
        category: 'template',
        price: 89.99,
        images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'],
        downloadUrl: 'https://download.digiverse.com/admin-dashboard.zip',
        fileSize: '28.4 MB',
        version: '2.3.0',
        compatibility: 'React 18+, Next.js 14+',
        vendorId: vendor2._id.toString(),
        rating: 4.9,
        totalReviews: 245,
        totalSales: 512,
        status: 'approved',
        tags: ['dashboard', 'admin', 'react', 'tailwind'],
        featured: true,
        licenseType: 'Extended License'
      },
      {
        title: 'Email Newsletter Templates',
        description: 'Professional email newsletter templates for marketing campaigns. 20 responsive designs compatible with all major email clients. Includes templates for promotions, announcements, and updates.',
        category: 'template',
        price: 24.99,
        images: ['https://images.unsplash.com/photo-1557838923-2985c318be48?w=800'],
        downloadUrl: 'https://download.digiverse.com/email-templates.zip',
        fileSize: '5.2 MB',
        version: '1.2.0',
        compatibility: 'All Email Clients',
        vendorId: vendor2._id.toString(),
        rating: 4.6,
        totalReviews: 89,
        totalSales: 234,
        status: 'approved',
        tags: ['email', 'newsletter', 'marketing', 'responsive'],
        licenseType: 'Regular License'
      },
      // UI Kits
      {
        title: 'Mobile UI Kit Pro',
        description: 'Comprehensive mobile UI kit with 200+ screens for iOS and Android. Includes onboarding, authentication, e-commerce, social media, and more. Available in Figma and Sketch formats.',
        category: 'ui-kit',
        price: 79.99,
        images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800'],
        downloadUrl: 'https://download.digiverse.com/mobile-ui-kit.zip',
        fileSize: '124.8 MB',
        version: '3.0.0',
        compatibility: 'Figma, Sketch, Adobe XD',
        vendorId: vendor2._id.toString(),
        rating: 4.9,
        totalReviews: 198,
        totalSales: 423,
        status: 'approved',
        tags: ['mobile', 'ui-kit', 'ios', 'android'],
        featured: true,
        licenseType: 'Extended License'
      },
      {
        title: 'Web Design System',
        description: 'Complete design system for web applications with components, patterns, colors, typography, and guidelines. Speeds up your design and development workflow. Figma and Adobe XD versions included.',
        category: 'ui-kit',
        price: 99.99,
        images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'],
        downloadUrl: 'https://download.digiverse.com/web-design-system.zip',
        fileSize: '156.3 MB',
        version: '2.5.0',
        compatibility: 'Figma, Adobe XD',
        vendorId: vendor2._id.toString(),
        rating: 5.0,
        totalReviews: 287,
        totalSales: 589,
        status: 'approved',
        tags: ['design-system', 'components', 'ui-kit', 'web'],
        featured: true,
        licenseType: 'Extended License'
      },
      {
        title: 'E-commerce UI Components',
        description: 'Modern e-commerce UI components including product cards, filters, checkout flows, and shopping carts. Built with React and Tailwind CSS. Fully customizable and production-ready.',
        category: 'ui-kit',
        price: 49.99,
        images: ['https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800'],
        downloadUrl: 'https://download.digiverse.com/ecommerce-ui-components.zip',
        fileSize: '34.7 MB',
        version: '1.8.0',
        compatibility: 'React 18+, Tailwind CSS 3+',
        vendorId: vendor2._id.toString(),
        rating: 4.8,
        totalReviews: 134,
        totalSales: 298,
        status: 'approved',
        tags: ['ecommerce', 'components', 'react', 'tailwind'],
        licenseType: 'Regular License'
      },
      // Designs
      {
        title: 'Icon Pack - 500+ Icons',
        description: 'Premium icon pack with 500+ vector icons in multiple styles. Perfect for web and mobile applications. Includes SVG, PNG, and icon font formats. Regular updates with new icons.',
        category: 'design',
        price: 19.99,
        images: ['https://images.unsplash.com/photo-1558655146-d09347e92766?w=800'],
        downloadUrl: 'https://download.digiverse.com/icon-pack-500.zip',
        fileSize: '45.2 MB',
        version: '4.1.0',
        compatibility: 'SVG, PNG, Icon Font',
        vendorId: vendor2._id.toString(),
        rating: 4.7,
        totalReviews: 456,
        totalSales: 892,
        status: 'approved',
        tags: ['icons', 'svg', 'vector', 'design'],
        licenseType: 'Regular License'
      },
      {
        title: 'Illustration Bundle',
        description: 'Beautiful hand-drawn illustration bundle with 100+ unique illustrations. Perfect for websites, presentations, and marketing materials. Available in AI, EPS, SVG, and PNG formats.',
        category: 'design',
        price: 64.99,
        images: ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800'],
        downloadUrl: 'https://download.digiverse.com/illustration-bundle.zip',
        fileSize: '89.3 MB',
        version: '2.0.0',
        compatibility: 'AI, EPS, SVG, PNG',
        vendorId: vendor2._id.toString(),
        rating: 4.9,
        totalReviews: 167,
        totalSales: 378,
        status: 'approved',
        tags: ['illustrations', 'graphics', 'vector', 'design'],
        featured: true,
        licenseType: 'Extended License'
      },
      {
        title: 'Mockup Collection Pro',
        description: 'Professional mockup collection with 50+ high-quality mockups for devices, packaging, and branding. Photoshop PSD files with smart objects for easy customization.',
        category: 'design',
        price: 54.99,
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
        downloadUrl: 'https://download.digiverse.com/mockup-collection.zip',
        fileSize: '678.4 MB',
        version: '1.6.0',
        compatibility: 'Photoshop CS6+',
        vendorId: vendor2._id.toString(),
        rating: 4.8,
        totalReviews: 123,
        totalSales: 267,
        status: 'approved',
        tags: ['mockups', 'psd', 'branding', 'presentation'],
        licenseType: 'Extended License'
      },
      {
        title: 'Gradient Pack - 200 Gradients',
        description: 'Stunning gradient pack with 200 modern gradients. Perfect for backgrounds, UI elements, and design projects. Includes Sketch, Figma, and Adobe files plus CSS code.',
        category: 'design',
        price: 14.99,
        images: ['https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800'],
        downloadUrl: 'https://download.digiverse.com/gradient-pack.zip',
        fileSize: '12.1 MB',
        version: '1.3.0',
        compatibility: 'Sketch, Figma, Adobe CC',
        vendorId: vendor2._id.toString(),
        rating: 4.6,
        totalReviews: 234,
        totalSales: 567,
        status: 'approved',
        tags: ['gradients', 'colors', 'design', 'backgrounds'],
        licenseType: 'Regular License'
      },
      {
        title: 'Typography Font Bundle',
        description: 'Premium font bundle with 15 font families. Includes script, serif, and sans-serif fonts perfect for branding, web design, and print. Full commercial license included.',
        category: 'design',
        price: 129.99,
        images: ['https://images.unsplash.com/photo-1461958508236-9a742665a0d5?w=800'],
        downloadUrl: 'https://download.digiverse.com/typography-bundle.zip',
        fileSize: '45.7 MB',
        version: '1.0.0',
        compatibility: 'OTF, TTF, WOFF',
        vendorId: vendor2._id.toString(),
        rating: 5.0,
        totalReviews: 89,
        totalSales: 156,
        status: 'approved',
        tags: ['fonts', 'typography', 'typeface', 'design'],
        licenseType: 'Extended License'
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create reviews (one by one to trigger auto-increment)
    const reviewsData = [
      {
        productId: 1,
        customerId: customer._id.toString(),
        rating: 5,
        comment: 'Excellent theme! Easy to customize and works perfectly with WooCommerce. Great support from the developer.',
        status: 'approved'
      },
      {
        productId: 1,
        customerId: admin._id.toString(),
        rating: 5,
        comment: 'Best e-commerce theme I have used. Clean code and great performance.',
        status: 'approved'
      },
      {
        productId: 2,
        customerId: customer._id.toString(),
        rating: 5,
        comment: 'Beautiful portfolio theme with stunning animations. My clients love it!',
        status: 'approved'
      },
      {
        productId: 5,
        customerId: customer._id.toString(),
        rating: 5,
        comment: 'This SEO plugin is a game changer. My site rankings improved significantly!',
        status: 'approved'
      },
      {
        productId: 7,
        customerId: customer._id.toString(),
        rating: 5,
        comment: 'Best security plugin for WordPress. Easy to set up and provides excellent protection.',
        status: 'approved'
      },
      {
        productId: 10,
        customerId: customer._id.toString(),
        rating: 5,
        comment: 'Amazing admin dashboard template. Saved me weeks of development time!',
        status: 'approved'
      },
      {
        productId: 12,
        customerId: customer._id.toString(),
        rating: 5,
        comment: 'Comprehensive mobile UI kit with beautiful designs. Highly recommended!',
        status: 'approved'
      },
      {
        productId: 13,
        customerId: customer._id.toString(),
        rating: 5,
        comment: 'Perfect design system for our web projects. Great documentation too.',
        status: 'approved'
      }
    ];

    for (const reviewData of reviewsData) {
      await Review.create(reviewData);
    }
    console.log(`✅ Created ${reviewsData.length} reviews`);

    // Create sample order for customer
    const order = await Order.create({
      customerId: customer._id.toString(),
      items: [
        {
          productId: 1,
          price: 89.99,
          licenseKey: 'DV-ECOM-PRO-' + Math.random().toString(36).substring(2, 15).toUpperCase(),
          title: 'E-Commerce Pro Theme',
          downloadUrl: 'https://download.digiverse.com/ecommerce-pro-theme.zip'
        }
      ],
      totalAmount: 89.99,
      paymentMethod: 'jazzcash',
      paymentStatus: 'completed',
      transactionId: 'JC' + Date.now(),
      orderDate: new Date(),
      downloadStatus: 'available'
    });

    console.log('✅ Created sample order');

    // Create notifications (one by one to trigger auto-increment)
    const notifications = [
      {
        userId: customer._id.toString(),
        type: 'order',
        message: 'Your order has been completed successfully!',
        read: false,
        link: '/orders/' + order.orderId
      },
      {
        userId: vendor1._id.toString(),
        type: 'sale',
        message: 'You have a new sale! E-Commerce Pro Theme',
        read: false,
        link: '/vendor'
      },
      {
        userId: admin._id.toString(),
        type: 'admin',
        message: 'Welcome to DigiVerse Admin Dashboard',
        read: false,
        link: '/admin'
      }
    ];

    for (const notificationData of notifications) {
      await Notification.create(notificationData);
    }
    console.log('✅ Created notifications');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Account:');
    console.log('  Email: admin@digiverse.com');
    console.log('  Password: Admin@123');
    console.log('\nVendor Account:');
    console.log('  Email: vendor@digiverse.com');
    console.log('  Password: Vendor@123');
    console.log('\nCustomer Account:');
    console.log('  Email: customer@digiverse.com');
    console.log('  Password: Customer@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();