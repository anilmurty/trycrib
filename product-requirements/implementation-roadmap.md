# TryCrib Implementation Roadmap

This document outlines a phased approach to building the TryCrib application.

## Phase 1: Project Setup & Landing Page

*   **Goal:** Establish the project foundation and build the public-facing landing page.
*   **Tasks:**
    - [x] Initialize Next.js project with TypeScript.
    - [x] Set up Tailwind CSS and Shadcn/ui.
    - [x] Set up Git repository on GitHub.
    - [x] Implement Header component (Logo, Nav links, Login/Sign Up buttons).
    - [x] Implement Hero section (Buyer/Seller tabs, static forms, image carousel using provided assets).
    - [x] Implement Featured Properties section (static display using provided assets).
    - [x] Implement Value proposition sections.
    - [x] Implement How It Works section.
    - [x] Implement Footer component.
    - [x] Ensure responsiveness across different screen sizes.
    - [x] Set up image optimization with next/image.
    - [x] Implement lazy loading for below-fold images.

## Phase 2: Core Authentication

*   **Goal:** Implement basic authentication mechanism and user roles.
*   **Tasks:**
    - [ ] Configure Supabase project (DB, Auth, Storage).
    - [x] Implement basic email/password and Google SSO authentication *logic* using Supabase Auth.
    - [x] Build basic Login / Sign Up page *structure/layout*.
    - [ ] Set up basic user roles (Buyer, Seller, Admin) in the database upon signup.
    - [ ] Create basic protected routes and placeholder dashboard pages for each role.
    - [x] Implement form validation and error handling.

## Phase 3: Seller Workflow - Verification & Listing

*   **Goal:** Enable sellers to get verified and list their properties.
*   **Tasks:**
    - [ ] Implement Seller role selection/update after signup.
    - [ ] Build the Seller verification flow UI (form to upload Zillow screenshot).
    - [ ] Implement backend logic for Seller verification (upload file to Supabase Storage, store reference, set status to pending).
    - [ ] Build the "Create Listing" form UI for verified Sellers.
    - [ ] Implement backend logic for listing creation (details, photo uploads, basic availability, save to DB).
    - [ ] Update Seller Dashboard UI (show listings, link to create form, show verification status).

## Phase 4: Buyer Workflow - Verification, Browsing & Booking Core

*   **Goal:** Enable buyers to get verified, browse listings, and initiate bookings.
*   **Tasks:**
    - [ ] Implement Buyer role selection/update after signup.
    - [ ] Build the Buyer verification flow UI (form to upload pre-approval letter).
    - [ ] Implement backend logic for Buyer verification (upload file, store reference, set status to pending).
    - [ ] Implement public property browsing UI (all listings page, property detail page).
    - [ ] Connect browsing UI to fetch and display listing data from DB.
    - [ ] Implement basic booking request UI for verified buyers (select dates).
    - [ ] Implement backend logic for booking request (save request to DB).
    - [ ] Update Buyer Dashboard UI (show verification status, show booking requests).

## Phase 5: Admin Workflow - Verification Management

*   **Goal:** Enable Admins to manage user verification requests.
*   **Tasks:**
    - [ ] Create the Admin Dashboard UI (protect access).
    - [ ] Implement logic to display lists of Buyers and Sellers pending verification.
    - [ ] Implement UI for Admins to view uploaded verification documents.
    - [ ] Implement "Approve" / "Reject" functionality for user verification (update user status in DB).

## Phase 6: Refinement, Testing & Deployment

*   **Goal:** Polish features, add remaining functionality, test thoroughly, and deploy.
*   **Tasks:**
    - [ ] Implement property search/filtering logic and connect to Hero search form and browsing page.
    - [ ] Refine booking system (e.g., date validation against availability, notifications).
    - [ ] Implement payment integration (if applicable, e.g., Stripe for deposits).
    - [ ] Add remaining dashboard features (e.g., simplified earnings, past stays).
    - [ ] Comprehensive end-to-end testing.
    - [ ] Configure Vercel deployment (environment variables, custom domain).
    - [ ] Deploy to production.
    - [ ] Final code cleanup and documentation review. 