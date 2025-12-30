# DigiVerse - Premium Digital Marketplace

DigiVerse is a cutting-edge digital marketplace designed for creators to buy and sell premium digital assets like WordPress themes, plugins, templates, and UI kits.

## 🚀 Features

- **Product Marketplace**: Browse and search through thousands of premium digital products.
- **Vendor System**: Specialized dashboard for vendors to manage products, track sales, and handle withdrawals.
- **Order Management**: Users can track their purchases, download digital assets, and manage license keys.
- **Secure Payments**: Integrated with Stripe and other secure payment gateways.
- **Admin Panel**: Comprehensive administration tools for managing users, products, vendors, and platform settings.
- **Real-time Notifications**: Stay updated with order status, sales alerts, and system notifications.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) (or Drizzle ORM where applicable)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: Custom JWT-based authentication with session management
- **Styling**: Modern, responsive design with glassmorphism and premium aesthetics

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun or npm/yarn/pnpm
- MongoDB connection string

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_key
   ```
4. Run the development server:
   ```bash
   bun dev
   # or
   npm run dev
   ```

## 📄 Recent Updates

- **Orders Page**: Implemented a comprehensive orders page for users to view and manage their digital purchases.
- **Footer Enhancements**: Added quick links to essential pages like Shopping Cart, Checkout, and Vendor Analytics.
- **Bug Fixes**: Resolved UI issues and missing icon imports in the checkout process.
- **UI Improvements**: Enhanced shadow effects and layout responsiveness across the platform.

---

Built with ❤️ by Orchids AI
