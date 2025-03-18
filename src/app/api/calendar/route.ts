import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for API routes
const createApiClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};

// GET /api/calendar?property=id&start=YYYY-MM-DD&end=YYYY-MM-DD
// Get calendar entries for a specific property and date range
export async function GET(request: NextRequest) {
  try {
    const supabase = createApiClient();
    const { searchParams } = new URL(request.url);
    
    const propertyId = searchParams.get('property');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify ownership of the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();
    
    if (propertyError) {
      if (propertyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching property:', propertyError);
      return NextResponse.json(
        { error: propertyError.message },
        { status: 500 }
      );
    }
    
    if (property.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Build the query to fetch calendar entries
    let query = supabase
      .from('calendar')
      .select('*')
      .eq('property_id', propertyId);
    
    // Add date filters if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching calendar entries:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ calendar: data });
  } catch (error) {
    console.error('Error in GET /api/calendar:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 