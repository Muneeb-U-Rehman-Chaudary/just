import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Auto-increment helper
async function getNextSequence(name: string) {
  const counter = await Counter.findByIdAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// Counter Schema
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

// User Schema
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  image: String,
  emailVerified: { type: Boolean, default: false },
  bio: String,
  storeName: String,
  storeDescription: String,
  rating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  bankDetails: String,
  sponsored: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Session Schema
const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  productId: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String],
  downloadUrl: { type: String, required: true },
  fileSize: String,
  version: String,
  compatibility: String,
  vendorId: { type: String, required: true },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  tags: [String],
  featured: { type: Boolean, default: false },
  sponsored: { type: Boolean, default: false },
  demoUrl: String,
  changelog: String,
  licenseType: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', async function(next) {
  if (this.isNew && !this.productId) {
    this.productId = await getNextSequence('productId');
  }
  next();
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: Number, unique: true },
  customerId: { type: String, required: true },
  items: [{
    productId: Number,
    price: Number,
    licenseKey: String,
    title: String,
    downloadUrl: String
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'pending' },
  transactionId: String,
  orderDate: { type: Date, default: Date.now },
  downloadStatus: String
});

orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderId) {
    this.orderId = await getNextSequence('orderId');
  }
  next();
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  reviewId: { type: Number, unique: true },
  productId: { type: Number, required: true },
  customerId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  helpfulCount: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

reviewSchema.pre('save', async function(next) {
  if (this.isNew && !this.reviewId) {
    this.reviewId = await getNextSequence('reviewId');
  }
  next();
});

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  transactionId: { type: Number, unique: true },
  vendorId: { type: String, required: true },
  orderId: Number,
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'pending' },
  paymentMethod: String,
  transactionDate: { type: Date, default: Date.now },
  withdrawalDetails: String
});

transactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = await getNextSequence('transactionId');
  }
  next();
});

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [{
    productId: Number,
    addedAt: Date
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  notificationId: { type: Number, unique: true },
  userId: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.pre('save', async function(next) {
  if (this.isNew && !this.notificationId) {
    this.notificationId = await getNextSequence('notificationId');
  }
  next();
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Withdrawal Schema
const withdrawalSchema = new mongoose.Schema({
  withdrawalId: { type: Number, unique: true },
  vendorId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  requestDate: { type: Date, default: Date.now },
  processedDate: Date,
    bankDetails: { type: String, required: true },
    notes: String,
    proofImage: String
  });

withdrawalSchema.pre('save', async function(next) {
  if (this.isNew && !this.withdrawalId) {
    this.withdrawalId = await getNextSequence('withdrawalId');
  }
  next();
});

export const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);

// Sponsorship Request Schema
const sponsorshipRequestSchema = new mongoose.Schema({
  requestId: { type: Number, unique: true },
  vendorId: { type: String, required: true },
  productId: Number,
  type: { type: String, enum: ['vendor', 'product'], required: true },
  tier: { type: String, enum: ['standard', 'premium'], required: true },
  monthlyFee: { type: Number, required: true },
  commission: Number,
  duration: { type: Number, default: 30 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: String,
  requestDate: { type: Date, default: Date.now },
  processedDate: Date,
  processedBy: String,
  adminNotes: String
});

sponsorshipRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.requestId) {
    this.requestId = await getNextSequence('requestId');
  }
  next();
});

export const SponsorshipRequest = mongoose.models.SponsorshipRequest || mongoose.model('SponsorshipRequest', sponsorshipRequestSchema);

// Active Sponsor Schema
const activeSponsorSchema = new mongoose.Schema({
  sponsorId: { type: Number, unique: true },
  vendorId: { type: String, required: true },
  productId: Number,
  type: { type: String, enum: ['vendor', 'product'], required: true },
  tier: { type: String, required: true },
  monthlyFee: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  autoRenew: { type: Boolean, default: false },
  requestId: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

activeSponsorSchema.pre('save', async function(next) {
  if (this.isNew && !this.sponsorId) {
    this.sponsorId = await getNextSequence('sponsorId');
  }
  next();
});

export const ActiveSponsor = mongoose.models.ActiveSponsor || mongoose.model('ActiveSponsor', activeSponsorSchema);

// Platform Settings Schema
const platformSettingsSchema = new mongoose.Schema({
  settingId: { type: Number, unique: true },
  category: { type: String, required: true, unique: true },
  settings: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
  updatedBy: String
});

platformSettingsSchema.pre('save', async function(next) {
  if (this.isNew && !this.settingId) {
    this.settingId = await getNextSequence('settingId');
  }
  next();
});

export const PlatformSettings = mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', platformSettingsSchema);

// Contact Message Schema
const contactMessageSchema = new mongoose.Schema({
  messageId: { type: Number, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  type: String,
  status: { type: String, default: 'pending' },
  userId: String,
  reply: String,
  repliedAt: Date,
  repliedBy: String,
  createdAt: { type: Date, default: Date.now }
});

contactMessageSchema.pre('save', async function(next) {
  if (this.isNew && !this.messageId) {
    this.messageId = await getNextSequence('messageId');
  }
  next();
});

export const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);