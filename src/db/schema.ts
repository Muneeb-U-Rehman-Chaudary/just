import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  // DigiVerse specific fields
  role: text("role", { enum: ["customer", "vendor", "admin"] })
    .$defaultFn(() => "customer")
    .notNull(),
  bio: text("bio"),
  // Vendor specific fields
  storeName: text("store_name"),
  storeDescription: text("store_description"),
  rating: real("rating").$defaultFn(() => 0),
  totalSales: integer("total_sales").$defaultFn(() => 0),
  totalEarnings: real("total_earnings").$defaultFn(() => 0),
  bankDetails: text("bank_details"), // JSON string
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Products table
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category", { 
    enum: ["wordpress-theme", "plugin", "template", "ui-kit", "design"] 
  }).notNull(),
  price: real("price").notNull(),
  images: text("images").notNull(), // JSON array
  downloadUrl: text("download_url").notNull(),
  fileSize: text("file_size"),
  version: text("version"),
  compatibility: text("compatibility"),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: real("rating").$defaultFn(() => 0),
  totalReviews: integer("total_reviews").$defaultFn(() => 0),
  totalSales: integer("total_sales").$defaultFn(() => 0),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .$defaultFn(() => "pending")
    .notNull(),
  tags: text("tags"), // JSON array
  featured: integer("featured", { mode: "boolean" }).$defaultFn(() => false),
  sponsored: integer("sponsored", { mode: "boolean" }).$defaultFn(() => false),
  demoUrl: text("demo_url"),
  changelog: text("changelog"),
  licenseType: text("license_type"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Orders table
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: text("customer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  items: text("items").notNull(), // JSON array [{productId, price, licenseKey}]
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method", { 
    enum: ["jazzcash", "easypaisa", "nayapay"] 
  }).notNull(),
  paymentStatus: text("payment_status", { 
    enum: ["pending", "completed", "failed", "refunded"] 
  }).$defaultFn(() => "pending").notNull(),
  transactionId: text("transaction_id"),
  orderDate: integer("order_date", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  downloadStatus: text("download_status", { 
    enum: ["available", "downloaded", "expired"] 
  }).$defaultFn(() => "available"),
});

// Reviews table
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  helpfulCount: integer("helpful_count").$defaultFn(() => 0),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .$defaultFn(() => "pending")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Transactions table
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["sale", "withdrawal"] }).notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] })
    .$defaultFn(() => "pending")
    .notNull(),
  paymentMethod: text("payment_method"),
  transactionDate: integer("transaction_date", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  withdrawalDetails: text("withdrawal_details"), // JSON string
});

// Cart table
export const cart = sqliteTable("cart", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  items: text("items").notNull(), // JSON array [{productId, addedAt}]
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).$defaultFn(() => false),
  link: text("link"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Withdrawals table
export const withdrawals = sqliteTable("withdrawals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .$defaultFn(() => "pending")
    .notNull(),
  requestDate: integer("request_date", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  processedDate: integer("processed_date", { mode: "timestamp" }),
  bankDetails: text("bank_details").notNull(), // JSON string
  notes: text("notes"),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
  transactions: many(transactions),
  notifications: many(notifications),
  withdrawals: many(withdrawals),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(user, {
    fields: [products.vendorId],
    references: [user.id],
  }),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(user, {
    fields: [orders.customerId],
    references: [user.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  customer: one(user, {
    fields: [reviews.customerId],
    references: [user.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  vendor: one(user, {
    fields: [transactions.vendorId],
    references: [user.id],
  }),
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
}));