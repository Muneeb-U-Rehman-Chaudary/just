import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// User Model
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'customer' | 'vendor' | 'admin';
  bio?: string;
  storeName?: string;
  storeDescription?: string;
  rating: number;
  totalSales: number;
  totalEarnings: number;
  commissionRate: number;
  bankDetails?: any;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  emailVerified: { type: Boolean, default: false },
  image: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  bio: String,
  storeName: String,
  storeDescription: String,
  rating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 15 },
  bankDetails: Schema.Types.Mixed
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Session Model
export interface ISession extends Document {
  _id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
}

const SessionSchema = new Schema<ISession>({
  expiresAt: { type: Date, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  userId: { type: String, required: true, ref: 'User' }
});

// Account Model
export interface IAccount extends Document {
  _id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>({
  accountId: { type: String, required: true },
  providerId: { type: String, required: true },
  userId: { type: String, required: true, ref: 'User' },
  accessToken: String,
  refreshToken: String,
  idToken: String,
  accessTokenExpiresAt: Date,
  refreshTokenExpiresAt: Date,
  scope: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Verification Model
export interface IVerification extends Document {
  _id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>({
  identifier: { type: String, required: true },
  value: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Model
export interface IProduct extends Document {
  _id: string;
  productId: number;
  title: string;
  description: string;
  category: 'wordpress-theme' | 'plugin' | 'template' | 'ui-kit' | 'design';
  price: number;
  images: string[];
  downloadUrl: string;
  fileSize?: string;
  version?: string;
  compatibility?: string;
  vendorId: string;
  rating: number;
  totalReviews: number;
  totalSales: number;
  status: 'pending' | 'approved' | 'rejected';
  tags?: string[];
  featured: boolean;
  sponsored: boolean;
  demoUrl?: string;
  changelog?: string;
  licenseType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  productId: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['wordpress-theme', 'plugin', 'template', 'ui-kit', 'design'],
    required: true 
  },
  price: { type: Number, required: true },
  images: [String],
  downloadUrl: { type: String, required: true },
  fileSize: String,
  version: String,
  compatibility: String,
  vendorId: { type: String, required: true, ref: 'User' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  tags: [String],
  featured: { type: Boolean, default: false },
  sponsored: { type: Boolean, default: false },
  demoUrl: String,
  changelog: String,
  licenseType: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.pre('save', async function() {
  if (this.isNew && !this.productId) {
    const lastProduct = await mongoose.model('Product').findOne().sort({ productId: -1 });
    this.productId = lastProduct ? lastProduct.productId + 1 : 1;
  }
});

// Order Model
export interface IOrder extends Document {
  _id: string;
  orderId: number;
  customerId: string;
  items: Array<{
    productId: number;
    price: number;
    licenseKey: string;
    title?: string;
    downloadUrl?: string;
  }>;
  totalAmount: number;
  paymentMethod: 'jazzcash' | 'easypaisa' | 'nayapay' | 'stripe';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  orderDate: Date;
  downloadStatus: 'available' | 'downloaded' | 'expired';
}

const OrderSchema = new Schema<IOrder>({
  orderId: { type: Number, unique: true },
  customerId: { type: String, required: true, ref: 'User' },
  items: [{
    productId: Number,
    price: Number,
    licenseKey: String,
    title: String,
    downloadUrl: String
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['jazzcash', 'easypaisa', 'nayapay', 'stripe'],
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  orderDate: { type: Date, default: Date.now },
  downloadStatus: { 
    type: String, 
    enum: ['available', 'downloaded', 'expired'],
    default: 'available'
  }
});

OrderSchema.pre('save', async function() {
  if (this.isNew && !this.orderId) {
    const lastOrder = await mongoose.model('Order').findOne().sort({ orderId: -1 });
    this.orderId = lastOrder ? lastOrder.orderId + 1 : 1;
  }
});

// Review Model
export interface IReview extends Document {
  _id: string;
  reviewId: number;
  productId: number;
  customerId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  reviewId: { type: Number, unique: true },
  productId: { type: Number, required: true, ref: 'Product' },
  customerId: { type: String, required: true, ref: 'User' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  helpfulCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.pre('save', async function() {
  if (this.isNew && !this.reviewId) {
    const lastReview = await mongoose.model('Review').findOne().sort({ reviewId: -1 });
    this.reviewId = lastReview ? lastReview.reviewId + 1 : 1;
  }
});

// Transaction Model
export interface ITransaction extends Document {
  _id: string;
  transactionId: number;
  vendorId: string;
  orderId?: number;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  type: 'sale' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  transactionDate: Date;
  withdrawalDetails?: any;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionId: { type: Number, unique: true },
  vendorId: { type: String, required: true, ref: 'User' },
  orderId: { type: Number, ref: 'Order' },
  amount: { type: Number, required: true },
  commissionAmount: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  type: { type: String, enum: ['sale', 'withdrawal'], required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: String,
  transactionDate: { type: Date, default: Date.now },
  withdrawalDetails: Schema.Types.Mixed
});

TransactionSchema.pre('save', async function() {
  if (this.isNew && !this.transactionId) {
    const lastTransaction = await mongoose.model('Transaction').findOne().sort({ transactionId: -1 });
    this.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
  }
});

// Cart Model
export interface ICart extends Document {
  _id: string;
  cartId: number;
  userId: string;
  items: Array<{
    productId: number;
    addedAt: string;
  }>;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  cartId: { type: Number, unique: true },
  userId: { type: String, required: true, ref: 'User' },
  items: [{
    productId: Number,
    addedAt: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

CartSchema.pre('save', async function() {
  if (this.isNew && !this.cartId) {
    const lastCart = await mongoose.model('Cart').findOne().sort({ cartId: -1 });
    this.cartId = lastCart ? lastCart.cartId + 1 : 1;
  }
});

// Notification Model
export interface INotification extends Document {
  _id: string;
  notificationId: number;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  notificationId: { type: Number, unique: true },
  userId: { type: String, required: true, ref: 'User' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.pre('save', async function() {
  if (this.isNew && !this.notificationId) {
    const lastNotification = await mongoose.model('Notification').findOne().sort({ notificationId: -1 });
    this.notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;
  }
});

// Withdrawal Model
export interface IWithdrawal extends Document {
  _id: string;
  withdrawalId: number;
  vendorId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  processedDate?: Date;
  bankDetails: any;
  notes?: string;
}

const WithdrawalSchema = new Schema<IWithdrawal>({
  withdrawalId: { type: Number, unique: true },
  vendorId: { type: String, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestDate: { type: Date, default: Date.now },
  processedDate: Date,
  bankDetails: { type: Schema.Types.Mixed, required: true },
  notes: String
});

WithdrawalSchema.pre('save', async function() {
  if (this.isNew && !this.withdrawalId) {
    const lastWithdrawal = await mongoose.model('Withdrawal').findOne().sort({ withdrawalId: -1 });
    this.withdrawalId = lastWithdrawal ? lastWithdrawal.withdrawalId + 1 : 1;
  }
});

// Sponsorship Request Model
export interface ISponsorshipRequest extends Document {
  _id: string;
  requestId: number;
  type: 'vendor' | 'product';
  vendorId: string;
  productId?: number;
  tier: 'standard' | 'premium';
  monthlyFee: number;
  commission: number;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  requestDate: Date;
  processedDate?: Date;
  processedBy?: string;
  adminNotes?: string;
}

const SponsorshipRequestSchema = new Schema<ISponsorshipRequest>({
  requestId: { type: Number, unique: true },
  type: { type: String, enum: ['vendor', 'product'], required: true },
  vendorId: { type: String, required: true, ref: 'User' },
  productId: { type: Number, ref: 'Product' },
  tier: { type: String, enum: ['standard', 'premium'], required: true },
  monthlyFee: { type: Number, required: true },
  commission: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  message: String,
  requestDate: { type: Date, default: Date.now },
  processedDate: Date,
  processedBy: { type: String, ref: 'User' },
  adminNotes: String
});

SponsorshipRequestSchema.pre('save', async function() {
  if (this.isNew && !this.requestId) {
    const lastRequest = await mongoose.model('SponsorshipRequest').findOne().sort({ requestId: -1 });
    this.requestId = lastRequest ? lastRequest.requestId + 1 : 1;
  }
});

// Active Sponsor Model
export interface IActiveSponsor extends Document {
  _id: string;
  sponsorId: number;
  type: 'vendor' | 'product';
  vendorId: string;
  productId?: number;
  tier: 'standard' | 'premium';
  monthlyFee: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  requestId?: number;
}

const ActiveSponsorSchema = new Schema<IActiveSponsor>({
  sponsorId: { type: Number, unique: true },
  type: { type: String, enum: ['vendor', 'product'], required: true },
  vendorId: { type: String, required: true, ref: 'User' },
  productId: { type: Number, ref: 'Product' },
  tier: { type: String, enum: ['standard', 'premium'], required: true },
  monthlyFee: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  autoRenew: { type: Boolean, default: false },
  requestId: { type: Number, ref: 'SponsorshipRequest' }
});

ActiveSponsorSchema.pre('save', async function() {
  if (this.isNew && !this.sponsorId) {
    const lastSponsor = await mongoose.model('ActiveSponsor').findOne().sort({ sponsorId: -1 });
    this.sponsorId = lastSponsor ? lastSponsor.sponsorId + 1 : 1;
  }
});

// Platform Settings Model
export interface IPlatformSettings extends Document {
  _id: string;
  settingId: number;
  category: string;
  settings: any;
  updatedBy?: string;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>({
  settingId: { type: Number, unique: true },
  category: { type: String, required: true, unique: true },
  settings: { type: Schema.Types.Mixed, required: true },
  updatedBy: { type: String, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

PlatformSettingsSchema.pre('save', async function() {
  if (this.isNew && !this.settingId) {
    const lastSetting = await mongoose.model('PlatformSettings').findOne().sort({ settingId: -1 });
    this.settingId = lastSetting ? lastSetting.settingId + 1 : 1;
  }
});

// Contact Message Model
export interface IContactMessage extends Document {
  _id: string;
  messageId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  userId?: string;
  reply?: string;
  repliedAt?: Date;
  repliedBy?: string;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  messageId: { type: Number, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  userId: { type: String, ref: 'User' },
  reply: String,
  repliedAt: Date,
  repliedBy: { type: String, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

ContactMessageSchema.pre('save', async function() {
  if (this.isNew && !this.messageId) {
    const lastMessage = await mongoose.model('ContactMessage').findOne().sort({ messageId: -1 });
    this.messageId = lastMessage ? lastMessage.messageId + 1 : 1;
  }
});

// Export models
export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
export const Session = (mongoose.models.Session as Model<ISession>) || mongoose.model<ISession>('Session', SessionSchema);
export const Account = (mongoose.models.Account as Model<IAccount>) || mongoose.model<IAccount>('Account', AccountSchema);
export const Verification = (mongoose.models.Verification as Model<IVerification>) || mongoose.model<IVerification>('Verification', VerificationSchema);
export const Product = (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', ProductSchema);
export const Order = (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);
export const Review = (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>('Review', ReviewSchema);
export const Transaction = (mongoose.models.Transaction as Model<ITransaction>) || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const Cart = (mongoose.models.Cart as Model<ICart>) || mongoose.model<ICart>('Cart', CartSchema);
export const Notification = (mongoose.models.Notification as Model<INotification>) || mongoose.model<INotification>('Notification', NotificationSchema);
export const Withdrawal = (mongoose.models.Withdrawal as Model<IWithdrawal>) || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
export const SponsorshipRequest = (mongoose.models.SponsorshipRequest as Model<ISponsorshipRequest>) || mongoose.model<ISponsorshipRequest>('SponsorshipRequest', SponsorshipRequestSchema);
export const ActiveSponsor = (mongoose.models.ActiveSponsor as Model<IActiveSponsor>) || mongoose.model<IActiveSponsor>('ActiveSponsor', ActiveSponsorSchema);
export const PlatformSettings = (mongoose.models.PlatformSettings as Model<IPlatformSettings>) || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
export const ContactMessage = (mongoose.models.ContactMessage as Model<IContactMessage>) || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

// Platform Revenue Model
export interface IPlatformRevenue extends Document {
  _id: string;
  totalEarnings: number;
  totalCommission: number;
  totalSales: number;
  updatedAt: Date;
}

const PlatformRevenueSchema = new Schema<IPlatformRevenue>({
  totalEarnings: { type: Number, default: 0 },
  totalCommission: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

export const PlatformRevenue = (mongoose.models.PlatformRevenue as Model<IPlatformRevenue>) || mongoose.model<IPlatformRevenue>('PlatformRevenue', PlatformRevenueSchema);