# TryCrib - Try Before You Buy Real Estate Platform

## 🏠 Overview

**TryCrib** is an innovative real estate platform that allows potential home buyers to **"try before they buy"** by booking short-term stays in properties they're interested in purchasing. This addresses the anxiety of home buying by enabling buyers to experience living in a property before making an offer.

### The Problem We Solve

Buying a home is the most expensive transaction most people undertake, yet unlike other major purchases (like cars), you don't get to test-drive your potential new home. TryCrib changes this by allowing buyers to:

- Experience the property firsthand
- Test the neighborhood and commute
- Make informed decisions with confidence
- Reduce purchase anxiety

### 🎯 Current Development Focus

We're currently building a **Property Data Management System** that will:
- Import property feeds from external data sources
- Enable sellers to claim ownership of properties
- Provide rich property data for better user experience
- Support bulk property management for admins

### ✅ Recently Completed

**Enhanced Role System** - A comprehensive admin management system:
- Superadmin role with elevated permissions
- User promotion/demotion functionality
- Role-based dashboard redirects
- Admin management interface with visual role indicators

**Property Data Management System** - Property feed import and claiming system (in testing):
- Property feed import system with JSON/CSV support
- Smart data mapping from external feeds to database schema
- Property claiming system for sellers to claim ownership
- Admin interface for managing imports and claims
- Enhanced property schema with rich data fields (JSONB)
- Import history tracking and error reporting
- Duplicate claim prevention and status tracking

## ✨ Key Features

### For Buyers
- 🔍 **Browse Properties**: Search and filter available properties on the market
- 🏡 **Book Stays**: Reserve short-term stays to experience properties
- 📅 **Manage Bookings**: View booking history and manage reservations
- ⭐ **Leave Reviews**: Provide feedback after stays
- 💳 **Secure Payments**: Integrated Stripe payment processing

### For Sellers
- 📝 **List Properties**: Create detailed property listings for try-before-buy stays
- 💰 **Set Pricing**: Configure per-night rates and manage availability
- 📊 **Track Bookings**: Monitor reservations and earnings
- 💬 **Communicate**: Message with potential buyers
- 📈 **Analytics**: View booking performance

### For Admins
- ✅ **Property Verification**: Review and approve property listings
- 👥 **User Management**: Manage user accounts and roles
- 📊 **Platform Analytics**: Monitor bookings and platform performance
- 🔧 **Content Moderation**: Oversee reviews and communications
- 📥 **Property Feed Import**: Upload and process JSON/CSV property feeds
- 🔄 **Bulk Operations**: Process large datasets efficiently
- 👑 **Superadmin Features**: Manage admin roles and permissions
- 📋 **Property Claims Management**: Review and approve property ownership claims
- 📈 **Import History**: Track all property feed imports and results

### For Superadmins
- 👑 **Admin Management**: Promote/demote admin users
- 🔧 **System Configuration**: Advanced platform settings
- 📈 **Global Analytics**: Platform-wide performance metrics
- 📊 **Role Change History**: Track all user role changes and audit trail

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk.dev with Google OAuth
- **Payments**: Stripe
- **Images**: Cloudinary (planned)
- **Deployment**: Vercel

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following key tables:

- **profiles**: User accounts with role-based access (buyer/seller/admin/superadmin)
- **properties**: Property listings with detailed information and rich data (JSONB)
- **bookings**: Short-term stay reservations
- **reviews**: Post-stay feedback system
- **messages**: Buyer-seller communication
- **property_availability**: Calendar system for blocked dates
- **role_changes**: User role change history and audit trail
- **property_imports**: Import history and tracking
- **property_claims**: Property ownership claims and verification

### Enhanced Property Schema

The properties table includes rich data fields:
- **Core fields**: address, price, bedrooms, bathrooms, square footage
- **Feed data**: MLS ID, listing date, days on market, property type
- **Rich data**: Property features, location details, building info (JSONB)
- **Images**: Cloudinary URLs with original feed references
- **Ownership**: Seller assignment and claiming system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Clerk.dev account
- Stripe account
- Cloudinary account (for image processing)

### Installation

1. **Clone the repository**

   `git clone <repository-url>`
   
   `cd trycrib`

3. **Install dependencies**
   
   pnpm install

    # or

   npm install
   
5. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and put these in it:

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Cloudinary (for image processing)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # App
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

6. **Set up the database**

   ONLY DO THIS IF STARTED WITH AN EMPLTY POSTRESQL DB

   Run the SQL scripts in the `scripts/` directory in order:
   
   # Execute these in your Supabase SQL editor
   scripts/001_create_tables.sql
   scripts/002_enable_rls.sql
   scripts/003_create_profile_trigger.sql
   scripts/add-stripe-session-column.sql

8. **Run the development server**
   
   `pnpm dev`

   # or

   `npm run dev`

10. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Build and Deployment

### Local Build

\`\`\`bash
# Build the application
pnpm build

# Start the production server
pnpm start
\`\`\`

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 📁 Project Structure

\`\`\`
trycrib/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── booking/           # Booking flow
│   ├── dashboard/         # User dashboards
│   └── properties/        # Property listings
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── buyer/            # Buyer-specific components
│   ├── seller/           # Seller-specific components
│   ├── landing/          # Landing page components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── stripe.ts         # Stripe configuration
│   └── types.ts          # TypeScript type definitions
├── scripts/              # Database migration scripts
└── public/               # Static assets
\`\`\`

## 🔧 Available Scripts

\`\`\`bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
# Run SQL scripts in Supabase dashboard
\`\`\`

## 🔐 Authentication & Authorization

The app uses Clerk.dev authentication with four user roles:

- **Buyer**: Can browse and book properties
- **Seller**: Can list and manage properties, claim ownership of properties
- **Admin**: Can verify properties, manage users, and import property data
- **Superadmin**: Can manage admin roles and system configuration

Users are automatically redirected to role-appropriate dashboards after authentication, with an onboarding flow for new users to select their role.

## 💳 Payment Integration

- **Stripe Checkout** for secure payment processing
- **Webhook handling** for payment confirmation
- **Fee structure**: Platform fees, agent commissions, and seller payouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Live Demo

**[TryCrib Live Demo](https://vercel.com/anilmurtys-projects/v0-try-crib-web-app)**

---

*Built with ❤️ using Next.js, Supabase, and Stripe*
