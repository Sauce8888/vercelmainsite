import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for API routes
const createApiClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};

// Check if the user is authorized for this booking
async function isAuthorizedForBooking(supabase: ReturnType<typeof createApiClient>, bookingId: string, userId: string) {
  // Get the booking and check if the associated property is owned by this user
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('property_id')
    .eq('id', bookingId)
    .single();
  
  if (bookingError) {
    return { authorized: false, error: bookingError, notFound: bookingError.code === 'PGRST116' };
  }
  
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', booking.property_id)
    .single();
  
  if (propertyError) {
    return { authorized: false, error: propertyError };
  }
  
  return { 
    authorized: property.owner_id === userId, 
    error: null,
    booking,
    property
  };
}

// GET /api/bookings/[id] - Get a specific booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createApiClient();
    const { id } = params;
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user is authorized to access this booking
    const authCheck = await isAuthorizedForBooking(supabase, id, session.user.id);
    
    if (!authCheck.authorized) {
      if (authCheck.notFound) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Get the full booking details
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching booking:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error('Error in GET /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update a booking's status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createApiClient();
    const { id } = params;
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user is authorized to update this booking
    const authCheck = await isAuthorizedForBooking(supabase, id, session.user.id);
    
    if (!authCheck.authorized) {
      if (authCheck.notFound) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Get update data from request body
    const updates = await request.json();
    
    // Only allow updating certain fields
    if (!updates.status || !['confirmed', 'canceled', 'completed'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: confirmed, canceled, completed' },
        { status: 400 }
      );
    }
    
    // Update the booking
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // If booking is canceled, we should update the calendar to mark those dates as available again
    if (updates.status === 'canceled') {
      // Get the date range
      const checkIn = new Date(data.check_in);
      const checkOut = new Date(data.check_out);
      
      // Generate all dates between check-in and check-out (exclusive of check-out)
      const dates = [];
      let currentDate = new Date(checkIn);
      
      while (currentDate < checkOut) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Update calendar entries to be available
      for (const dateStr of dates) {
        await supabase
          .from('calendar')
          .upsert({
            property_id: data.property_id,
            date: dateStr,
            status: 'available',
            booking_id: null,
          });
      }
    }
    
    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error('Error in PUT /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 