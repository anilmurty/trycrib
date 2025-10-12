-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_clients ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Buyer profiles policies
CREATE POLICY "Users can view all buyer profiles"
  ON public.buyer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Buyers can update own buyer profile"
  ON public.buyer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Buyers can insert own buyer profile"
  ON public.buyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Seller profiles policies
CREATE POLICY "Users can view all seller profiles"
  ON public.seller_profiles FOR SELECT
  USING (true);

CREATE POLICY "Sellers can update own seller profile"
  ON public.seller_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Sellers can insert own seller profile"
  ON public.seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view active approved properties"
  ON public.properties FOR SELECT
  USING (is_active = true AND verification_status = 'approved');

CREATE POLICY "Sellers can view own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sellers can insert own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = seller_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = buyer_id OR
    auth.uid() IN (SELECT seller_id FROM public.properties WHERE id = property_id)
  );

CREATE POLICY "Buyers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Property availability policies
CREATE POLICY "Anyone can view property availability"
  ON public.property_availability FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage own property availability"
  ON public.property_availability FOR ALL
  USING (
    auth.uid() IN (SELECT seller_id FROM public.properties WHERE id = property_id)
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND (buyer_id = auth.uid() OR property_id IN (
        SELECT id FROM public.properties WHERE seller_id = auth.uid()
      ))
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Seller agent profiles policies
CREATE POLICY "Users can view their own seller agent profile"
  ON public.seller_agent_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own seller agent profile"
  ON public.seller_agent_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own seller agent profile"
  ON public.seller_agent_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Buyer agent profiles policies
CREATE POLICY "Users can view their own buyer agent profile"
  ON public.buyer_agent_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own buyer agent profile"
  ON public.buyer_agent_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own buyer agent profile"
  ON public.buyer_agent_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Agent properties policies
CREATE POLICY "Agents can view their own property assignments"
  ON public.agent_properties FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own property assignments"
  ON public.agent_properties FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own property assignments"
  ON public.agent_properties FOR UPDATE
  USING (auth.uid() = agent_id);

-- Agent clients policies
CREATE POLICY "Agents can view their own client relationships"
  ON public.agent_clients FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Clients can view their agent relationships"
  ON public.agent_clients FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Agents can insert their own client relationships"
  ON public.agent_clients FOR INSERT
  WITH CHECK (auth.uid() = agent_id);
