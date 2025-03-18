import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CalendarUpdate } from '@/lib/types';

// Create a Supabase client for API routes
const createApiClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};

// POST /api/calendar/block
// Block or unblock dates on the calendar and optionally set custom pricing
export async function POST(request: NextRequest) {
  try {
    const supabase = createApiClient();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get calendar update data from request body
    const calendarData: CalendarUpdate = await request.json();
    
    // Validate required fields
    if (!calendarData.property_id || !calendarData.dates || !calendarData.status) {
      return NextResponse.json(
        { error: 'Missing required fields: property_id, dates, status' },
        { status: 400 }
      );
    }
    
    // Verify ownership of the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', calendarData.property_id)
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
    
    // Process each date to update or insert calendar entry
    const results = [];
    const errors = [];
    
    for (const dateStr of calendarData.dates) {
      // Check if there's already a booking for this date
      const { data: existing, error: existingError } = await supabase
        .from('calendar')
        .select('status, booking_id')
        .eq('property_id', calendarData.property_id)
        .eq('date', dateStr)
        .single();
      
      // If there's a booking, we cannot change the status
      if (existing && existing.status === 'booked' && existing.booking_id) {
        errors.push({
          date: dateStr,
          error: 'Cannot modify date with an active booking',
        });
        continue;
      }
      
      // Prepare calendar entry data
      const calendarEntry = {
        property_id: calendarData.property_id,
        date: dateStr,
        status: calendarData.status,
        price: calendarData.price,
        minimum_stay: calendarData.minimum_stay,
      };
      
      // Update or insert the calendar entry
      const { data, error } = await supabase
        .from('calendar')
        .upsert(calendarEntry)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating calendar for date ${dateStr}:`, error);
        errors.push({
          date: dateStr,
          error: error.message,
        });
      } else {
        results.push(data);
      }
    }
    
    return NextResponse.json({
      success: true,
      updated: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in POST /api/calendar/block:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 