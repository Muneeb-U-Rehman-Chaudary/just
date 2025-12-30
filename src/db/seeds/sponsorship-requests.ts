import connectDB from '@/db/mongodb';
import { SponsorshipRequest, User } from '@/db/models';

async function main() {
  await connectDB();

  // Get some vendors for realistic requests
  const vendors = await User.find({ role: 'vendor' }).limit(10).lean();
  
  if (vendors.length === 0) {
    console.log('⚠️ No vendors found. Please seed users first.');
    return;
  }

  const sponsorshipRequests = [
    {
      vendorId: vendors[0]._id.toString(),
      type: 'vendor',
      tier: 'standard',
      monthlyFee: 49,
      commission: 12,
      duration: 30,
      status: 'pending',
      message: 'I have been selling successfully for 6 months and want to boost visibility for my entire store. My products have maintained a 4.7 average rating.',
      requestDate: new Date('2024-11-05')
    },
    {
      vendorId: vendors[1]?._id.toString() || vendors[0]._id.toString(),
      type: 'product',
      tier: 'standard',
      monthlyFee: 49,
      commission: 12,
      duration: 30,
      productId: 23,
      status: 'pending',
      message: 'This is my best-selling product with 4.8 stars and over 200 sales. I would like to feature it on the homepage to reach more customers.',
      requestDate: new Date('2024-11-12')
    },
    {
      vendorId: vendors[2]?._id.toString() || vendors[0]._id.toString(),
      type: 'vendor',
      tier: 'premium',
      monthlyFee: 99,
      commission: 8,
      duration: 30,
      status: 'approved',
      message: 'I have 15 high-quality WordPress themes with excellent reviews. Premium sponsorship would help establish my brand as a top seller on the platform.',
      requestDate: new Date('2024-10-20'),
      processedDate: new Date('2024-10-25'),
      processedBy: 'admin',
      adminNotes: 'Strong sales record with 500+ total sales and 4.9 rating. Approved for 30 days.'
    },
    {
      vendorId: vendors[3]?._id.toString() || vendors[0]._id.toString(),
      type: 'product',
      tier: 'standard',
      monthlyFee: 49,
      commission: 12,
      duration: 30,
      productId: 45,
      status: 'pending',
      message: 'My UI kit has been consistently in the top 10 for 3 months. Sponsorship would help maintain momentum and reach design teams.',
      requestDate: new Date('2024-11-18')
    },
    {
      vendorId: vendors[4]?._id.toString() || vendors[0]._id.toString(),
      type: 'vendor',
      tier: 'standard',
      monthlyFee: 49,
      commission: 12,
      duration: 30,
      status: 'rejected',
      message: 'I just launched my store 3 weeks ago and have 2 products. Looking to get initial traction through sponsorship.',
      requestDate: new Date('2024-11-01'),
      processedDate: new Date('2024-11-03'),
      processedBy: 'admin',
      adminNotes: 'Account too new - requires 60 days active sales history and minimum 5 products.'
    },
    {
      vendorId: vendors[5]?._id.toString() || vendors[0]._id.toString(),
      type: 'product',
      tier: 'premium',
      monthlyFee: 99,
      commission: 8,
      duration: 30,
      productId: 12,
      status: 'approved',
      message: 'Premium WordPress theme with 350+ sales and 4.9 rating. Ready to invest in premium placement for maximum visibility.',
      requestDate: new Date('2024-10-15'),
      processedDate: new Date('2024-10-20'),
      processedBy: 'admin',
      adminNotes: 'Exceptional product with proven track record. Premium tier approved.'
    },
    {
      vendorId: vendors[6]?._id.toString() || vendors[0]._id.toString(),
      type: 'vendor',
      tier: 'standard',
      monthlyFee: 49,
      commission: 12,
      duration: 30,
      status: 'approved',
      message: 'Active seller for 8 months with 12 products. Average 4.6 rating across all items.',
      requestDate: new Date('2024-10-28'),
      processedDate: new Date('2024-11-02'),
      processedBy: 'admin',
      adminNotes: 'Solid performance metrics. Approved for initial 30-day trial.'
    },
    {
      vendorId: vendors[7]?._id.toString() || vendors[0]._id.toString(),
      type: 'product',
      tier: 'standard',
      monthlyFee: 49,
      commission: 12,
      duration: 30,
      productId: 34,
      status: 'rejected',
      message: 'New plugin launch with innovative features. Want to sponsor to get initial reviews.',
      requestDate: new Date('2024-11-08'),
      processedDate: new Date('2024-11-13'),
      processedBy: 'admin',
      adminNotes: 'Product has only 2 sales. Needs to establish quality track record first.'
    },
    {
      vendorId: vendors[8]?._id.toString() || vendors[0]._id.toString(),
      type: 'vendor',
      tier: 'premium',
      monthlyFee: 99,
      commission: 8,
      duration: 30,
      status: 'rejected',
      message: 'I sell premium design templates. Want maximum exposure for my store.',
      requestDate: new Date('2024-10-25'),
      processedDate: new Date('2024-10-30'),
      processedBy: 'admin',
      adminNotes: 'Recent customer service issues flagged. Need to resolve outstanding support tickets.'
    },
    {
      vendorId: vendors[9]?._id.toString() || vendors[0]._id.toString(),
      type: 'product',
      tier: 'standard',
      monthlyFee: 49,
      commission: 12,
      duration: 30,
      productId: 18,
      status: 'pending',
      message: 'E-commerce WordPress theme with 180 sales and 4.7 rating. Holiday season approaching - perfect time to sponsor.',
      requestDate: new Date('2024-11-22')
    },
    {
      vendorId: vendors[0]._id.toString(),
      type: 'vendor',
      tier: 'premium',
      monthlyFee: 99,
      commission: 8,
      duration: 60,
      status: 'pending',
      message: 'Looking for long-term premium sponsorship to establish brand presence. Have consistent sales history.',
      requestDate: new Date('2024-11-20')
    },
    {
      vendorId: vendors[1]?._id.toString() || vendors[0]._id.toString(),
      type: 'product',
      tier: 'premium',
      monthlyFee: 99,
      commission: 8,
      duration: 30,
      productId: 7,
      status: 'pending',
      message: 'Top-selling UI kit with 5-star reviews. Want premium placement during Black Friday season.',
      requestDate: new Date('2024-11-19')
    }
  ];

  // Clear existing requests
  await SponsorshipRequest.deleteMany({});
  
  // Insert new requests
  await SponsorshipRequest.insertMany(sponsorshipRequests);

  console.log('✅ Sponsorship requests seeded successfully');
  console.log(`   - Total: ${sponsorshipRequests.length}`);
  console.log(`   - Pending: ${sponsorshipRequests.filter(r => r.status === 'pending').length}`);
  console.log(`   - Approved: ${sponsorshipRequests.filter(r => r.status === 'approved').length}`);
  console.log(`   - Rejected: ${sponsorshipRequests.filter(r => r.status === 'rejected').length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });