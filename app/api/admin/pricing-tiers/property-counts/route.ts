import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get property counts by pricing tier
    const { data: properties, error } = await supabase
      .from('properties')
      .select('pricing_tier')
      .not('pricing_tier', 'is', null);

    if (error) {
      console.error('Error fetching property counts:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch property counts' }, { status: 500 });
    }

    // Count properties by tier
    const counts: Record<string, number> = {};
    properties?.forEach(property => {
      if (property.pricing_tier) {
        counts[property.pricing_tier] = (counts[property.pricing_tier] || 0) + 1;
      }
    });

    return NextResponse.json({ success: true, data: counts });
  } catch (error) {
    console.error('Error in property counts API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
