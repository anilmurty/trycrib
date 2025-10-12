# TryCrib: Consolidated Business Plan

**Last Updated:** October 11, 2025

## 1. The Vision

**Company:** TryCrib  
**Slogan:** test drive home

**The Vision:** TryCrib is a first-of-its-kind marketplace that allows serious homebuyers to book short, overnight stays in homes they are interested in purchasing. We transform the uncertainty of a 3-minute showing into the confidence of an overnight experience. For sellers, we provide a unique marketing tool to attract the most committed buyers, generating stronger offers and leading to a faster, more certain close. For buyers, we empower them to make the biggest financial decision of their life with unparalleled insight and assurance.

## 2. User Personas

Our platform is a marketplace that connects three core groups, built on the existing structure of a real estate transaction.

- **The Home Buyer (The "Guest"):** An individual or family actively searching for a home to purchase.
- **The Home Seller (The "Host"):** The owner of the property who partners with their agent to activate it on TryCrib.
- **Real Estate Agents (The "Professionals"):**
  - **The Seller's Agent (Host Partner):** Our primary customer, responsible for managing the listing, price, and booking approvals.
  - **The Buyer's Agent (Facilitator):** A crucial facilitator, responsible for managing property access and guiding their client.
- **Admin User:** This is the trycrib manager (founder initially, employees over time) who will need have access to some superuser functions to manage the product experience users in the system, properties as well as import listing feeds

## 3. Value Proposition

| User | Core Value Proposition |
|------|----------------------|
| **The Home Buyer** | Unprecedented Confidence: Eliminate the biggest financial risk of your life by experiencing a home's true character before you make an offer. |
| **The Home Seller** | Attract Committed Buyers & Earn Income: Showcase your home to the most serious buyers and earn income during the listing period to offset carrying costs, all while working seamlessly with your trusted agent. |
| **The Seller's Agent** | A Unique Marketing Edge: Offer a powerful, innovative tool to make your listings stand out, attract the most serious and committed buyers, and create a compelling reason for them to choose your property. |
| **The Buyer's Agent** | A Deal-Closing Tool: Convert a hesitant buyer into a confident one. Shorten the sales cycle by providing your client with the ultimate assurance, leading to faster, stronger offers. |

## 4. Moat

Our defensibility is built in layers over time, transforming our process into a competitive advantage.

1. **The "Hassle Shield":** We absorb the immense logistical complexity (legal, insurance, payments, scheduling) of a "test drive," making a difficult process a "one-click" experience.
2. **The "Liability Shield":** We provide the critical trust and safety infrastructure that de-risks the entire transaction for all parties in a way they cannot do on their own.
3. **The Demand Funnel:** Over time, we become the primary source for high-intent buyers looking for this specific experience.
4. **The Network Effect:** As the marketplace grows, more unique listings attract more serious buyers, creating a self-reinforcing loop that solidifies our market position.

## 5. User Experience

The platform has two states for a property: "Seeded" (public data, inquiry only) and "Activated" (onboarded by the agent, bookable).

- **The "Seeded" Experience:** Users can browse all available market listings. The call-to-action is "Request a Test Drive," which sends an inquiry to the agent, or "Activate this home," which begins the onboarding process for sellers/agents.
- **The "Activated" Experience:** Once a Seller's Agent has set a price and availability, a buyer can request a booking. The request is approved by the Seller's Agent, and access is coordinated between the agents using the existing lockbox system.

## 6. Collaborative Workflows

### A) Seller & Seller's Agent Collaboration

This is the core management workflow, built on an "Agent Proposes, Seller Approves" model.

**Workflow:** The agent initiates proposals for all key decisions (Availability Calendar, Nightly Price & Fees, House Rules, Stay Requirements). The seller receives a simple notification to "Approve" or "Decline" each proposal from their dashboard.

### B) Buyer & Buyer's Agent Collaboration

The platform acts as a shared "source of truth" and a notification engine to enhance their existing relationship.

**Workflow:**
1. **Sharing:** A buyer uses a "Share with Agent" button on a listing to prompt a strategic discussion.
2. **Notification:** When a buyer requests a stay, their agent is instantly notified, keeping them fully informed.
3. **Strategy (Post-MVP):** A buyer can choose to share their "Private Journal" of post-stay notes with their agent to collaborate on an offer strategy.

### C) Buyer & Seller's Agent Collaboration

This interaction is formal and structured to maintain professional boundaries.

**Workflow:**
1. **Initial Contact:** The buyer's "Request a Test Drive" is their first and only direct contact.
2. **Structured Booking:** All subsequent interaction (approval, decline) is handled through platform-driven status updates, not open chat.
3. **Limited Messaging:** A simple, audited messaging portal is available after a booking is confirmed, but only for essential logistical questions (e.g., "Where is the wifi password located?"). The platform encourages buyers to direct most questions to their own agent.

### D) Seller's Agent & Buyer's Agent Collaboration

This is the professional-to-professional workflow for executing the stay.

**Workflow:**
1. **Formal Introduction:** Once a stay is confirmed, the platform formally connects the two agents, sharing verified contact information within their respective dashboards.
2. **Coordination Prompt:** The platform sends a notification to both agents: "The stay for [Buyer Name] is confirmed. Please coordinate access for the check-in on [Date]."
3. **Execution (Off-Platform):** The agents use their preferred professional channels (phone, text) to arrange the specific details of the lockbox access, confident that the legal and financial aspects are already handled by TryCrib.

## 7. High-Level Product Requirements

- **Public Pages:** This is what any users landing on the website will be able to see unauthenticated.
- **Listings Management:** Display "seeded" and "activated" listings with different states and calls-to-action.
- **Booking & Scheduling System:** Calendar-based requests with a multi-step approval workflow.
- **Multi-User Account System:** Profiles and dashboards tailored to all four user types.
- **Payments & Payouts:** Secure payment collection (Stripe) and automated payouts.
- **Trust & Safety Infrastructure:** Digital agreements, integrated per-stay insurance, and phased identity verification.
- **Automated Communications:** System-triggered notifications for all key stages of the process.

**IMPORTANT:** The buyers email SHOULD NEVER be shared with the sellers agent and seller's email SHOULD NEVER be shared with the buyers agent

## 8. Detailed Page & Feature Requirements

### Public Pages
- Main Landing Page that communicates tagline, value props to buyers and sellers, short version of workflow for buyers, a few featured listings
- Links to separate pages for How It Works, Browse Listings, Listing Detail, FAQs, ToS, Privacy Policy.

### Onboarding & Verification Flows

The onboarding process is designed around the principle of progressive disclosure, collecting only the minimum information necessary at each stage to reduce friction and guide the user to their next valuable action.

#### Common First Steps (For All Users):

**Step 1: Create Account**
- **Goal:** Get the user into the system with maximum speed.
- **Fields:** Full Name, Email, Password.
- **Action:** System creates a basic user account and sends a verification email. The user is now logged in.

**Step 2: Role Selection**
- **Goal:** Direct the user to the correct, tailored onboarding path.
- **UI:** A single, clear question: "How will you be using TryCrib?" with four distinct, clickable options:
  - "I'm looking to buy a home." → (Buyer Path)
  - "I'm a homeowner." → (Seller Path)
  - "I'm an agent representing a seller." → (Seller's Agent Path)
  - "I'm an agent representing a buyer." → (Buyer's Agent Path)

#### Path 1: The Buyer Onboarding Flow

**Philosophy:** Frictionless. The goal is to get the user browsing and saving homes immediately.

**Step 3 (Post-Role Selection): Welcome & Immediate Value**
- The user is taken directly to their new, empty dashboard to start exploring properties. A welcome modal or a "Getting Started" checklist appears to guide them.

**Step 4 (Prompted, Not Forced): Connect with Your Agent**
- **Trigger:** The user can initiate this at any time from their dashboard. It becomes a mandatory step only when they make their first booking request.
- **Fields:** Agent's Name, Agent's Email.
- **Logic:** The system searches for the agent. If found, the accounts are linked. If not, an invitation is sent to the agent.

**Step 5 (Contextual): Add Payment Method**
- **Trigger:** This step is intentionally delayed until the user attempts their first booking request.
- **UI:** A standard, secure Stripe form.
- **Rationale:** Asking for a credit card at signup is a major cause of user drop-off. By waiting until the moment of high intent, we maximize initial signups.

#### Path 2: The Seller's Agent Onboarding Flow

**Philosophy:** Establish professional credibility and guide them to activate their first listing.

**Step 3 (Post-Role Selection): Complete Professional Profile**
- **Goal:** Collect necessary information to build trust on the platform.
- **Fields:** Profile Photo, Phone Number, Brokerage Name, Real Estate License Number.
- **Value Statement:** "Your professional profile will be visible to other agents to facilitate smooth and trusted transactions."

**Step 4: Welcome to Dashboard**
- The user lands on their dashboard, where the primary call-to-action is a prominent button to "Activate Your First Listing."

#### Path 3: The Seller Onboarding Flow

**Philosophy:** Guide the user to connect with their agent, turning their organic interest into a warm lead for our primary customer (the agent).

**Step 3 (Post-Role Selection): Find & Claim Your Home**
- **Goal:** Link the user's account to a specific property in our "seeded" database.
- **UI:** A search bar prompts them to enter their property address. They select their home from the results and click "Yes, this is my property."

**Step 4: Invite Your Agent (The Key Handoff)**
- **Goal:** Facilitate the connection to the professional manager of the listing.
- **UI:** A form to enter their agent's name and email, with a clear explanation of why this step is necessary for security and professional management.

**Step 5: "Pending Agent" Dashboard**
- The seller lands on their dashboard, which shows their claimed property with a clear status of "Awaiting agent activation," so they know exactly what needs to happen next.

#### Path 4: The Buyer's Agent Onboarding Flow

**Philosophy:** Quickly establish their professional identity and prepare them to receive client requests.

**Step 3 (Post-Role Selection): Complete Professional Profile**
- **Goal:** Same as the Seller's Agent; establish credibility.
- **Fields:** Profile Photo, Phone Number, Brokerage Name, Real Estate License Number.

**Step 4: Welcome to Dashboard**
- **UI:** A welcome message briefly explains their role on the platform. The main view shows a "New Client Requests" section (likely empty), so they are immediately familiar with their primary action item.

## 9. Dashboard Requirements by User Type

### The Buyer Dashboard

**Guiding Philosophy:** To be the buyer's trusted command center for the most important purchase of their life. It is designed to move them from uncertainty to confidence.

**Key Components & Features:**
- **My Stays (Primary View):** A central queue of all booking activities, organized by status (Pending Approval, Confirmed/Upcoming, Past Stays, Declined/Cancelled).
- **"My Private Journal":** A feature within "Past Stays" that allows the buyer to log private notes, pros, and cons about a property after their "test drive" to aid in their decision-making.
- **My Saved Homes:** A gallery of favorited listings for comparison.
- **My Agent:** A section to add, view, or change their connected Buyer's Agent.
- **Profile & Settings:** Manage personal information, notification preferences, and payment methods (which are only added at the time of the first booking request).

### The Seller's Agent Dashboard

**Guiding Philosophy:** To be a powerful professional tool for marketing listings, managing logistics seamlessly, and providing top-tier service to their seller clients.

**Key Components & Features:**
- **Main Overview:** Key metric widgets ("New Booking Requests," "Active Listings," "Monthly Earnings") and a feed of recent activity.
- **My Listings (Primary View):** A comprehensive tool for managing properties.
  - **Collaborative Proposals:** Initiate and track proposals sent to the seller for Price, Availability, House Rules, and Stay Requirements.
  - **Direct Management:** Edit marketing copy, photos, and the designated cleaning service.
- **Booking Requests:** A queue to manage all incoming buyer requests with one-click "Approve" or "Decline" actions.
- **Confirmed Stays:** A calendar or list view of all upcoming and past stays.
- **Payouts:** A financial ledger to track earnings and view a history of payouts.

### The Seller Dashboard

**Guiding Philosophy:** To provide a sense of control and transparency, allowing the seller to approve key decisions while collaborating easily with their agent.

**Key Components & Features:**
- **Pending Actions (Primary View):** The most critical feature. A simple queue of proposals sent by their agent (e.g., "Approve availability for Nov 7-9?"), each with clear "Approve" and "Decline" buttons.
- **My Property:** An at-a-glance view of their active listing, including the approved calendar, live pricing, and confirmed house rules.
- **Activity & Earnings:** A simple feed of activity (e.g., "New Booking Request Received") and a summary of total income earned.
- **My Agent:** A quick link to their agent's contact info with a simple in-app messaging feature.

### The Buyer's Agent Dashboard

**Guiding Philosophy:** To be a radically simple, action-oriented utility that saves the agent time, keeps them informed, and helps them close deals.

**Key Components & Features:**
- **Upcoming Tasks (Primary View):** An action-oriented checklist of their required tasks (e.g., "Friday, 5 PM: Facilitate Check-in for The Smith Family at 123 Main St.").
- **My Clients' Activity:** A single, clean feed of all their connected clients' stays on the platform.
- **New Client Requests:** A queue where they can see and approve connection requests from new buyers.
- **Resource Hub:** A section with quick links to FAQs, insurance details, and rental agreement templates.

### The Admin Dashboard

**Guiding Philosophy:** To be the central nervous system of TryCrib, providing the tools to ensure trust and safety, manage platform operations, offer customer support, and monitor the health of the business.

**Key Components & Features:**
- **Main Overview:** High-level metric widgets (Total Users, Properties, Bookings, Revenue) and an activity feed.
- **User Management:** Search, view, and manage all users (change roles, suspend accounts, etc.).
- **Property & Content Management:**
  - **Feed Import:** Tools to manually upload and monitor the property data feed.
  - **Property Claims Queue:** A queue to review and approve claims from sellers/agents.
- **Booking Management:** A master list of all bookings with the ability to manually cancel a booking and issue refunds.
- **Platform Operations & Configuration:**
  - **Pricing Management:** Configure the default pricing tiers and individual price overrides.
  - **Site Content Management:** Tools to edit static pages.
  - **Fee Management:** A global setting to control the platform's "take rate."
- **Business Intelligence & Reporting:** Reports on financials, user growth, and marketplace health.

## 10. Go-To-Market (GTM) Strategy

### Phase 1: Demand Generation & Pilot Program (First 3-6 Months)
- **1A: Build the Buyer Waitlist:** The initial focus. Goal is to acquire a list of 100-200 local, interested buyers in SW Washington using a landing page and low-cost, geo-targeted ads.
- **1B: Activate the First Listings:** Use the buyer waitlist as direct leverage to pitch the first seller's agents with a concrete, data-driven opportunity. Goal is to activate the first 10-20 homes.

### Phase 2: Geographic Expansion & Monetization
Once the model is proven with success stories, expand to the larger Portland metro area and turn on the initial revenue stream.

### Phase 3: Long-Term Growth
As the network effect begins, shift to a more balanced marketing spend and introduce the "Success Fee" monetization layer.

## 11. The Business Model (Monetization Roadmap)

- **Stage 1: The Pilot Phase (First 3-6 Months) → FREE:** Charge zero platform fees to eliminate friction and generate the first success stories.
- **Stage 2: Initial Monetization (Post-Pilot) → The Platform Fee:** Introduce a 15-25% platform fee ("take rate") on the nightly booking cost, paid by the buyer.
- **Stage 3: Mature Monetization (Post-Traction) → The Success Fee:** Introduce a 0.5% "Success Fee" charged to the seller's side, only when a home is sold to a buyer who completed a "test drive."

## 12. Cost & Resource Analysis

- **Estimated Monthly Operating Costs (Pre-Revenue):** ~$775 per month, excluding founder's salary. This covers hosting, database, listings data refresh, a starter marketing budget, and business software.
- **Key One-Time Costs:**
  - **Listings Data Seeding (5,000 listings):** ~$400.
  - **Legal Document Review (ToS, Rental Agreement):** $1,000 - $2,500.

## 13. Other Critical Considerations

- **The "Concierge MVP" Approach:** For the first several bookings, the founder must act as a high-touch concierge, manually ensuring a perfect experience to manufacture the first crucial success stories.
- **Legal & Insurance Framework:** This is the highest priority before the first booking. A legally-reviewed rental agreement and a partnership with a specialized insurance provider are non-negotiable.
- **The Operational Playbook:** A detailed, step-by-step checklist for every booking is required, covering cleaning, key exchange via lockboxes, and seller preparation.

---

## 14. Strategic Decisions & Abandoned Paths

This section documents alternative business models and strategies that were considered during the planning process and the key reasons they were ultimately rejected in favor of the current plan.

### A) Business Model: Transactional Platform vs. Lead Generation

**Considered Path:** We explored a full pivot to a "Lead Generation" model. In this scenario, TryCrib would not facilitate actual stays. Instead, a buyer's "request to test drive" would be captured as a high-intent lead and sold to a pool of subscribing buyer's agents.

**Reason for Abandonment:**
- **Sacrifices the Core Differentiator:** This model abandons the single most unique and defensible part of the idea—the actual "test drive." It would have created a "bait-and-switch" experience for buyers.
- **Enters a Hyper-Competitive Market:** It would have positioned TryCrib as a direct competitor to multi-billion dollar incumbents like Zillow Premier Agent and Realtor.com, a "red ocean" market where a startup has little leverage.
- **Weaker Acquisition Target:** The original transactional model represents a "unique capability" that is more attractive for a strategic acquisition than a small-scale version of a lead-gen service the acquirer already has.

### B) Go-To-Market: Pure Supply-First vs. Demand-First Sequential Strategy

**Considered Path:** The initial GTM plan was to focus exclusively on acquiring supply (seller's agents) first, based on the principle that supply is the unique attraction in this marketplace.

**Reason for Refinement (in favor of the current sequential model):**
- **Lack of Leverage:** Approaching an agent with only a novel idea is a difficult pitch. They are being asked to take a risk on an unproven platform with no tangible evidence of buyer interest.
- **A More Powerful Pitch:** By first running a low-cost ad campaign to build a Buyer Waitlist (Phase 1A), the GTM strategy becomes far more powerful. The pitch to the first agents (Phase 1B) is no longer a hypothetical; it's a concrete, data-driven opportunity: "We have 150 local buyers on our waitlist who want to 'test drive' a home like yours." This de-risks the decision for the agent and significantly increases the odds of converting the first critical listings.

### C) Pricing Model: Percentage of Sale Price vs. Premium Vacation Rental Rate

**Considered Path:** We considered setting the nightly "test drive" price as a small percentage of the home's listing price.

**Reason for Abandonment:**
- **Creates Illogical Pricing:** This model leads to unjustifiable price disparities. A $2M home does not necessarily provide 4x the overnight value of a $500k home, but the price would reflect that.
- **Uncoupled from Tangible Value:** The price would be divorced from the actual value of the stay (amenities, size, neighborhood).
- **A Better Alternative:** The "Premium Vacation Rental" model was adopted as it's more logical and defensible. It benchmarks the price against a known value (a comparable high-end Airbnb), then applies a justifiable premium (e.g., 1.5x-2.5x) for the unique "try before you buy" value proposition.

### D) Operational Model: Founder-Led Operations vs. Agent-Leveraged Model

**Considered Path:** An early consideration was a more hands-on, founder-led operational model, where the founder might be more involved in coordinating cleaning, key exchanges, and other logistics.

**Reason for Abandonment:**
- **Completely Unscalable:** This model would be an operational bottleneck, preventing the business from growing beyond a handful of properties.
- **Increases Friction:** It would require agents to learn a new process instead of using the tools and workflows they already know and trust (like their preferred cleaners and electronic lockboxes).
- **The Strategic Choice:** The decision was made to lean heavily on the existing professional infrastructure of the real estate industry. By integrating with agent lockboxes, leveraging their trusted vendors, and making the buyer's agent a key facilitator, the platform becomes far more scalable, secure, and appealing to its core professional users.
