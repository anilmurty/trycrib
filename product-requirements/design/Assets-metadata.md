# TryCrib Design Assets Metadata

## Landing Page Components

- `trycrib-home-page-top-half-buyertab.png`
  - Hero section with the "For Buyers" tab active
  - Primary call-to-action for property search
  - Dimensions: 1440x800px
  - Key Components:
    - Search form with location, dates, and price range
    - Background image carousel (3 images, 2s interval)
    - Responsive breakpoints: 1440px, 1024px, 768px, 375px
- `trycrib-home-page-top-half-sellertab.png`
  - Hero section with the "For Sellers" tab active
  - Primary call-to-action for property listing
  - Dimensions: 1440x800px
  - Key Components:
    - Quick listing form
    - Value proposition text
    - Background image carousel (3 images, 2s interval)
    - Responsive breakpoints: 1440px, 1024px, 768px, 375px
- `trycrib-home-page-bottom-half.png`
  - Lower sections of the landing page
  - Dimensions: 1440x1200px
  - Key Components:
    - Featured properties grid (3 cards)
    - Value proposition section
    - How it works steps
    - Footer
    - Responsive breakpoints: 1440px, 1024px, 768px, 375px

## Navigation/Main Pages

- `browse-properties.png`
  - The properties listing page
  - Dimensions: 1440x1024px
  - Key Components:
    - Search filters sidebar (collapsible on mobile)
    - Property grid (3x3 on desktop, 2x2 on tablet, 1x on mobile)
    - Map view toggle
    - Sort and filter options
    - Pagination/infinite scroll
    - Responsive breakpoints: 1440px, 1024px, 768px, 375px
- `how-it-works.png`
  - The explanation/information page
  - Dimensions: 1440x900px
  - Key Components:
    - Step-by-step guide with icons
    - Separate buyer and seller flows
    - FAQ accordion
    - CTA buttons
    - Responsive breakpoints: 1440px, 1024px, 768px, 375px

## Authentication Pages

- `sign-in.png`
  - Login page
  - Dimensions: 1440x800px
  - Key Components:
    - Email/password form
    - Google SSO button
    - Form validation
    - Error states
    - "Forgot password" link
    - Switch to signup tab
    - Responsive breakpoints: 1440px, 1024px, 768px, 375px
- `sign-up.png`
  - Registration page
  - Dimensions: 1440x800px
  - Key Components:
    - Multi-step form:
      1. Basic info (email, password)
      2. Role selection (buyer/seller)
      3. Document upload
    - Google SSO option
    - Form validation
    - Progress indicator
    - Responsive breakpoints: 1440px, 1024px, 768px, 375px

## Technical Implementation Notes

### Image Optimization

- All images to be served in WebP format with PNG fallback
- Implement lazy loading for images below the fold
- Use next/image for automatic optimization
- Implement responsive images using srcset
- Target image sizes:
  - Desktop: Original dimensions
  - Tablet: 75% of original
  - Mobile: 50% of original

### Component Library Requirements

- Reusable components needed:
  - PropertyCard
  - SearchForm
  - ImageCarousel
  - FilterSidebar
  - AuthForms
  - UploadComponent
  - StepProgress
  - Modal

### Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: 375px
  - Tablet: 768px
  - Desktop: 1024px
  - Large Desktop: 1440px
- Key considerations:
  - Collapsible navigation on mobile
  - Stack grid items vertically on mobile
  - Touch-friendly inputs
  - Adequate tap targets (min 44px)

### Performance Targets

- Core Web Vitals:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1
- Image loading:
  - Above fold: Immediate
  - Below fold: Lazy loaded
  - Carousel: Preload next image

### Accessibility Requirements

- WCAG 2.1 AA compliance
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management for modals
- Color contrast ratio: 4.5:1 minimum

### State Management

- Form states:
  - Validation
  - Error handling
  - Loading states
  - Success feedback
- User authentication state
- Search/filter state
- Upload progress state

### API Integration Points

- Authentication endpoints
- Property search and filters
- Document upload
- User profile management
- Property management
- Booking system

### Security Considerations

- Input sanitization
- File upload restrictions
- CSRF protection
- Rate limiting
- Secure authentication flow

# TryCrib Dashboard Mockup Specifications

## Buyer Dashboard (1440x900px)

### Header Section (1440x80px)

- TryCrib logo (left)
- User profile dropdown (right)
- Navigation menu:
  - Browse Properties
  - My Stays
  - Settings

### Main Content Area (1440x820px)

#### Upcoming Stays Section (1440x300px)

- Section title with count
- Card grid (2x2):
  - Property image (250x150px)
  - Stay dates
  - Property details
  - Quick actions:
    - Modify booking
    - Contact host
    - Cancel booking
- Status indicators:
  - Confirmed
  - Pending
  - Cancelled

#### Past Stays Section (1440x300px)

- Section title with count
- Card grid (2x2)
- Rating/Review option
- Booking again option

#### Quick Actions Panel (1440x100px)

- Browse new properties
- View saved properties
- Update preferences
- View messages

### Responsive Breakpoints

- Desktop: 1440px (full layout)
- Tablet: 768px (stacked cards)
- Mobile: 375px (single column)

## Seller Dashboard (1440x900px)

### Header Section (1440x80px)

- TryCrib logo (left)
- User profile dropdown (right)
- Navigation menu:
  - My Properties
  - Bookings
  - Earnings
  - Settings

### Main Content Area (1440x820px)

#### Properties Overview (1440x400px)

- Section title with total count
- Add new property button
- Property grid (3x2):
  - Property image
  - Status indicator
  - Quick stats:
    - Upcoming bookings
    - Total earnings
    - Average rating
  - Quick actions:
    - Edit listing
    - Manage availability
    - View bookings

#### Earnings Dashboard (1440x200px)

- Total earnings (large number)
- Earnings graph (30-day view)
- Quick stats:
  - This month's earnings
  - Pending payments
  - Next payout date

#### Upcoming Bookings (1440x220px)

- Timeline view of next 7 days
- Booking cards with:
  - Guest details
  - Stay duration
  - Payment status
  - Action required indicators

### Responsive Breakpoints

- Desktop: 1440px (full layout)
- Tablet: 768px (stacked sections)
- Mobile: 375px (single column)

## Admin Dashboard (1440x900px)

### Header Section (1440x80px)

- TryCrib logo (left)
- Admin controls dropdown (right)
- Navigation menu:
  - Verification Queue
  - User Management
  - System Metrics
  - Settings

### Main Content Area (1440x820px)

#### Verification Queue (1440x400px)

- Queue statistics:
  - Total pending
  - Average wait time
  - Today's completions
- Verification table:
  - User details
  - Document type
  - Submission date
  - Status
  - Actions:
    - View documents
    - Approve/Reject
    - Request more info

#### User Management (1440x200px)

- Quick stats:
  - Total users
  - Active sellers
  - Active buyers
- User search
- Filter options:
  - Role
  - Status
  - Verification status

#### System Metrics (1440x220px)

- Key metrics:
  - Active listings
  - Total bookings
  - Verification success rate
  - Average verification time
- Graphs:
  - User growth
  - Booking trends
  - Verification metrics

### Responsive Breakpoints

- Desktop: 1440px (full layout)
- Tablet: 768px (stacked sections)
- Mobile: 375px (scrollable interface)

## Common Elements

### Color Scheme

- Primary: #4A90E2
- Secondary: #50E3C2
- Success: #5CB85C
- Warning: #F0AD4E
- Danger: #D9534F
- Text: #333333
- Background: #F5F5F5

### Typography

- Headings: Inter
- Body: SF Pro Text
- Monospace: SF Mono (for data/numbers)

### Components

- Cards:
  - Shadow: 0 2px 4px rgba(0,0,0,0.1)
  - Border radius: 8px
  - Padding: 16px
- Buttons:
  - Height: 40px
  - Border radius: 4px
  - Padding: 8px 16px
- Tables:
  - Row height: 48px
  - Header background: #F8F9FA
  - Border: 1px solid #DEE2E6

### Interactive Elements

- Hover states
- Loading states
- Error states
- Success confirmations
- Toast notifications

### Accessibility

- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast compliance

# TryCrib Dashboard Design Specifications

## Buyer Dashboard (Desktop: 1440px)

### Core Components and Layout

#### Header Section
- **Component:** `shadcn/ui` Navbar with responsive behavior
- **Height:** 80px (fixed)
- **Elements:**
  - Left: TryCrib logo (using same styling as landing page)
  - Center: Navigation tabs using `shadcn/ui` Tabs component
    - "Upcoming Stays" (default active)
    - "Past Stays"
    - "Saved Properties"
    - "My Profile"
  - Right: User dropdown menu using `shadcn/ui` DropdownMenu
    - Profile link
    - Settings
    - Help
    - Logout

#### Main Content Area
- **Padding:** 32px 64px (desktop), 24px (tablet), 16px (mobile)
- **Background:** Subtle off-white (#f9fafb)

#### Upcoming Stays Section
- **Header:** 
  - Section title using `shadcn/ui` Typography (h2) with "Upcoming Stays" text
  - Filter dropdown using `shadcn/ui` Select (Sort by: Date, Price)
  - "View All" link/button if more than 4 stays
  
- **Stays Card Grid:**
  - Layout: 2x2 grid on desktop (gap: 24px), 2x1 on tablet, 1x on mobile
  - Card Component: `shadcn/ui` Card with custom content
    - Image container (16:9 ratio)
    - Padding: 24px
    - Property name in Card title (`shadcn/ui` Typography h3)
    - Check-in/out dates using `shadcn/ui` Typography and Calendar icons
    - Address with Map pin icon
    - Divider (`shadcn/ui` Separator)
    - Status badge (`shadcn/ui` Badge) - color-coded:
      - Confirmed: Green
      - Pending: Amber
      - Cancelled: Red
    - Action buttons:
      - Primary: "View Details" (`shadcn/ui` Button primary variant)
      - Secondary: "Modify" (`shadcn/ui` Button outline variant)
      - Tertiary: "Cancel" (`shadcn/ui` Button ghost variant with red text)

- **Empty State:**
  - Illustrated graphic (house icon)
  - "No upcoming stays" text
  - "Browse properties" CTA button

#### Past Stays Section
- Similar layout to Upcoming Stays with these differences:
  - Status replaced with completed dates
  - "Leave Review" button (if no review) using `shadcn/ui` Button secondary variant
  - Rating display using `shadcn/ui` custom component with star icons (if reviewed)

#### Quick Actions Panel
- **Component:** `shadcn/ui` Card with horizontal layout
- **Height:** 100px
- **Layout:** Evenly spaced action buttons
- **Actions:** (each using `shadcn/ui` Button with appropriate icon)
  - "Browse Properties"
  - "Saved Properties"
  - "Update Profile"
  - "Contact Support"

### Mobile Considerations
- Stack all cards vertically
- Collapsible sections using `shadcn/ui` Accordion
- Bottom navigation bar using `shadcn/ui` custom component
- Responsive image sizing and text wrapping

## Seller Dashboard (Desktop: 1440px)

### Core Components and Layout

#### Header Section
- **Component:** `shadcn/ui` Navbar with responsive behavior
- **Height:** 80px (fixed)
- **Elements:**
  - Left: TryCrib logo (using same styling as landing page)
  - Center: Navigation tabs using `shadcn/ui` Tabs component
    - "My Properties" (default active)
    - "Bookings"
    - "Earnings"
    - "Profile"
  - Right: User dropdown menu (same as Buyer Dashboard)

#### Properties Overview Section
- **Header:**
  - Section title with property count
  - "Add New Property" button (`shadcn/ui` Button primary variant with plus icon)
  - View options toggle (`shadcn/ui` ToggleGroup for Grid/List view)
  
- **Properties Grid:**
  - Layout: 3x2 grid on desktop (gap: 24px), 2x on tablet, 1x on mobile
  - Card Component: `shadcn/ui` Card with custom content
    - Image container (16:9 ratio)
    - Property name and status badge inline
    - Address with map pin icon
    - Quick stats using `shadcn/ui` Card with subtle background:
      - Booking count with calendar icon
      - Total earnings with dollar icon
      - Average rating with star icon
    - Action buttons in footer:
      - "Edit Listing" (`shadcn/ui` Button outline variant)
      - "Manage Availability" (`shadcn/ui` Button outline variant)
      - "View Bookings" (`shadcn/ui` Button outline variant)
    - Hover state: Subtle shadow increase and background color shift

- **Empty State:**
  - Illustrated graphic (house + plus icon)
  - "No properties listed" text
  - "Add Your First Property" CTA button

#### Earnings Dashboard
- **Component:** `shadcn/ui` Card with padding: 24px
- **Layout:** Split into two sections
  - Left: Summary metrics
    - Total earnings (large typography)
    - This month's earnings
    - Upcoming payouts
    - All using `shadcn/ui` Typography with appropriate hierarchy
  - Right: Simplified chart using `shadcn/ui` custom component
    - Last 6 months earnings
    - Bar chart implementation

#### Bookings Section
- **Header:**
  - Section title with booking count
  - Filter/sort options using `shadcn/ui` Select
  
- **Content:**
  - `shadcn/ui` Tabs for "Upcoming" (default), "Past", "Cancelled"
  - Table layout using `shadcn/ui` Table component
    - Columns: Guest, Property, Dates, Amount, Status, Actions
    - Pagination using `shadcn/ui` Pagination
    - Mobile: Collapses to cards using `shadcn/ui` Card

### Mobile Considerations
- Stack all cards vertically
- Collapsible sections
- Summary metrics in horizontally scrollable container
- Bottom navigation bar

## Responsive Design System

### Breakpoints (consistent across all pages)
- Mobile: 375px
- Tablet: 768px  
- Desktop: 1024px
- Large Desktop: 1440px

### Spacing System
- Based on 4px increments
- Content padding:
  - Desktop: 64px horizontal, 48px vertical
  - Tablet: 32px horizontal, 32px vertical
  - Mobile: 16px horizontal, 24px vertical
- Component spacing:
  - Cards: 24px gap (desktop), 16px (mobile)
  - Section spacing: 64px (desktop), 48px (tablet), 32px (mobile)

### Typography Scale (using Shadcn/ui Typography)
- h1: 36px/44px (desktop), 28px/36px (mobile)
- h2: 28px/36px (desktop), 24px/32px (mobile)
- h3: 20px/28px (desktop), 18px/26px (mobile)
- Base text: 16px/24px
- Small text: 14px/20px

### Color System
- Primary: #0f766e (teal-600) - for primary buttons, active states
- Secondary: #f0fdfa (teal-50) - for backgrounds, hover states
- Accent: #fbbf24 (amber-400) - for highlights, important elements
- Background: #ffffff (white) - main background
- Card background: #ffffff (white)
- Off-background: #f9fafb (gray-50)
- Text: #1f2937 (gray-800) - primary text
- Text muted: #6b7280 (gray-500) - secondary text
- Border: #e5e7eb (gray-200)
- Success: #10b981 (emerald-500)
- Warning: #f59e0b (amber-500)
- Error: #ef4444 (red-500)

### Shadow System
- sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
- md: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
- lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
