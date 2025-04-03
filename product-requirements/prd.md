I want to build a web application called “TryCrib” that is in some ways similar to the short term rental site airbnb.com but built for a different set of users and use cases.I’ve outlined the high level description for this application.
TryCrib - High Level Description

A website/ service called “TryCrib” that is “2-sided marketplace” for short term rental, similar to Airbnb but a simpler version and for a slightly different type of users.

The users of TryCrib are prospective home buyers on one side and home sellers on the other. TryCrib is a way for prospective buyers of homes to experience the home before they make an offer so that they can be absolutely sure that they like the home. The sellers of homes derive value by being able to earn money while their home sits on the market waiting for an offer. TryCrib allows seller is able to offset carrying costs and/ or staging fees for the home they list. The average price of a TryCrib listing will be 2-3x a comparable listing for a home on AirBnB.

Account creation should be either with an email and password or via google SSO

To Authenticate that the seller listing the home is indeed the owner, the seller would need to upload A screenshot of their view (after logging in) of https://www.zillow.com/myzillow/yourhome - one of the homes on that page should have an address that matches the listing they intend to create

Similarly to qualify potential buyers of the home, TryCrib would require the buyers to provide a pre-approval letter from a bank that shows what size of home (in dollars) the buyer is approved for a loan to purchase. The service should extract this information and store it in a DB and then an admin user would review and approve the users into the system

It is probably best to collect this information when the users sign up on the platform. We should make it optional ofcourse (let the user skip and do it later) but it absolutely has to be completed before sellers create a listing or buyers decide to rent a listing by initiating a deposit payment via the platform. The users just casually browsing should of course be able to just look at listed homes without needing to log in or create an account.

Design:

I’d like the design of the pages to be pretty light.

The main landing page should have 6 sections from top to bottom - I have attached images for all these sections

First is a floating header: should have the TryCrib logo on th left and hyperlinks for “Browse Properties”, “How it works” and “Login” on the right, along with a “Sign Up” button that’s a clear call to action for new users.
Second sections is the Hero: There should be two tabs, one “For Buyers” and one “For Sellers” that should be user selectable. For each tab there should be some form elements for either searching for a property or for listing one. And in each case there should be a carousel of 3 images in the background that cycle through automatically and repeat at an interval of 2 seconds between the images. I wil supply 6 images for these two carousels
Third is featured properties with the option to “view all”. I’ll supply the images for these 3 properties are you can come up with te title and description as shown
Below that should be s container that calls out the value of listing a home along with a placeholder image
The last section should call out the steps a buyer would go through when using TryCrib, followed by a footer

The Login and Sign up Screen can be one page with two tabs with focus going to one of them depending on what the user clicked. Ask me for a sample design image for this

Newly signed up users should be presented with an option to either be a seller or a buyer and then they should be taken through the appropriate verification steps. Verification will include uploading a single document and submitting it for verification. For buyers this will be a loan preapproval from their bank with their name, email address and phone number and for sellers it will be a property tax statement showing the same address as the home they want to list.

Needless to say there need to be 3 user roles
Buyer
Seller
Admin - this is the person that will review and approve buyers and sellers after reviewing their document submission.

Each type of user should have their own dashboard
The buyer should see their upcoming stays and any past ones and be able to book a new stay from there or make changes to upcoming ones
The seller dashboard should so them properties they have listed, they should be able to change pricing and they should see upcoming bookings and total earnings etc
The admin dashboard will show them a list of users waiting approval along with links to the documents uploaded. There will be no public hyperlinks to get to the admin dashboard anywhere in the app

Property Listing Creation:
Verified Sellers will have the option to “create a listing” from their dashboard when they log in. The listing form will collect the following information
Property Address
Photos
Number of beds and baths
Square footage
Link to sale listing
Price per night for the rental
Min number of nights to book
Availability (calendar view)

The buyers should be able to browse listed properties, select one and view its details, including availability without logging in. When they decide to “book” the property is when they should be prompted to log in.

Tech Stack:
For the tech stack I was thinking javascript, typescript and react. NextJS may make it easy to deploy to vercel but I’m open to suggestions. For database we can use supabase to keep things simple and use the postgres database to store user data and storage to store images and such. I’d like to build and test locally for quick iteration but also version code in github.

# TryCrib - Structued Product Requirements

## Overview

TryCrib is a two-sided marketplace for short-term home rentals, specifically designed for prospective home buyers to experience potential homes before making an offer. The platform connects home sellers with qualified buyers, allowing sellers to offset carrying costs while their property is on the market.

## Core Value Proposition

- For Buyers: "Try before you buy" experience of potential homes
- For Sellers: Earn 2-3x typical Airbnb rates while property is listed for sale
- For Both: Verified, qualified participants in the marketplace

## User Types

1. Buyers (Prospective Home Purchasers)
2. Sellers (Current Home Owners)
3. Administrators (Platform Managers)

## Authentication & Verification

### Account Creation

- Email/password registration
- Google SSO integration
- Progressive verification flow

### Seller Verification

- Required: Screenshot of Zillow owner dashboard
- Must show matching property address
- Admin review required before listing

### Buyer Verification

- Required: Bank pre-approval letter
- Must show approved loan amount
- OCR extraction of key details
- Admin verification required before booking

## Platform Features

### Landing Page Structure

1. Header

   - TryCrib logo
   - Navigation links (Browse, How it works, Login)
   - Sign Up CTA button

2. Hero Section

   - Buyer/Seller toggle tabs
   - Search/List property forms
   - Background image carousel (2s interval)

3. Featured Properties

   - 3 property showcase
   - "View All" option

4. Value Proposition

   - Seller benefits
   - Supporting imagery

5. Process Steps

   - User journey visualization
   - Clear CTAs

6. Footer
   - Site links
   - Legal information
   - Contact details

### User Dashboards

#### Buyer Dashboard

1. Upcoming Stays Section

   - Property details
   - Stay dates
   - Modification options
   - Host contact

2. Past Stays Section

   - Stay history
   - Reviews/Ratings
   - Rebooking options

3. Quick Actions
   - Property search
   - Saved properties
   - Preference settings
   - Messaging center

#### Seller Dashboard

1. Properties Overview

   - Listed properties grid
   - Property status indicators
   - Quick statistics
   - Management actions

2. Earnings Dashboard

   - Total earnings display
   - 30-day performance graph
   - Payout tracking
   - Financial metrics

3. Booking Management
   - Upcoming stays timeline
   - Guest information
   - Payment status
   - Required actions

#### Admin Dashboard

1. Verification Queue

   - Pending verifications
   - Document review interface
   - Approval/rejection workflow
   - Communication tools

2. User Management

   - User search/filter
   - Status management
   - Activity monitoring
   - Issue resolution

3. System Metrics
   - Platform statistics
   - Performance tracking
   - Verification analytics
   - Booking trends

### Property Management

#### Listing Creation

- Property details input
- Photo upload/management
- Pricing configuration
- Availability calendar
- House rules setting
- Listing preview

#### Property Search

- Location-based search
- Filter options
- Sort capabilities
- Map integration
- Saved searches

#### Booking System

- Availability checking
- Pricing calculation
- Deposit handling
- Payment processing
- Booking confirmation
- Modification/cancellation

## Technical Requirements

### Platform Architecture

- Next.js framework
- TypeScript implementation
- React components
- Shadcn for UI
- Supabase backend
- Vercel deployment

### Database Requirements

- PostgreSQL (via Supabase)
- Image storage solution
- Document storage
- Real-time capabilities

### Security Requirements

- HTTPS enforcement
- Data encryption
- Secure file storage
- Authentication security
- Rate limiting
- CSRF protection

### Integration Requirements

- Payment processing
- Email service
- Document processing
- Analytics tracking
- Map services