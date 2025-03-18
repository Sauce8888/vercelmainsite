import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NewBooking } from '@/lib/types';

// Create a Supabase client for API routes
const createApiClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};

// GET /api/bookings?property=id - Get bookings for a specific property
export async function GET(request: NextRequest) {
  try {
    const supabase = createApiClient();
    const { searchParams } = new URL(request.url);
    
    const propertyId = searchParams.get('property');
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (propertyId) {
      // For a specific property, verify ownership
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
      
      // Get bookings for the specified property
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', propertyId)
        .order('check_in', { ascending: true });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ bookings: data });
    } else {
      // If no property ID specified, get all bookings for properties owned by the user
      
      // First, get all properties owned by the user
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', session.user.id);
      
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        return NextResponse.json(
          { error: propertiesError.message },
          { status: 500 }
        );
      }
      
      if (!properties || properties.length === 0) {
        return NextResponse.json({ bookings: [] });
      }
      
      // Then get all bookings for those properties
      const propertyIds = properties.map(p => p.id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .in('property_id', propertyIds)
        .order('check_in', { ascending: true });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ bookings: data });
    }
  } catch (error) {
    console.error('Error in GET /api/bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking (for guest-facing booking form)
export async function POST(request: NextRequest) {
  try {
    const supabase = createApiClient();
    
    // Get booking data from request body
    const bookingData: NewBooking = await request.json();
    
    // Validate required fields
    if (!bookingData.property_id || !bookingData.guest_name || 
        !bookingData.guest_email || !bookingData.check_in || 
        !bookingData.check_out || !bookingData.total_price) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }
    
    // Convert dates to Date objects for validation
    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);
    const today = new Date();
    
    // Basic date validation
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }
    
    if (checkIn < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }
    
    // Check if the property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', bookingData.property_id)
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
    
    // Check availability for the requested dates
    // Generate all dates between check-in and check-out (exclusive of check-out)
    const dates = [];
    let currentDate = new Date(checkIn);
    
    while (currentDate < checkOut) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Check if any of the dates are not available
    const { data: unavailableDates, error: availabilityError } = await supabase
      .from('calendar')
      .select('date, status')
      .eq('property_id', bookingData.property_id)
      .in('date', dates)
      .not('status', 'eq', 'available');
    
    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      return NextResponse.json(
        { error: availabilityError.message },
        { status: 500 }
      );
    }
    
    if (unavailableDates && unavailableDates.length > 0) {
      return NextResponse.json({
        error: 'Some dates are not available',
        unavailableDates: unavailableDates.map(d => d.date),
      }, { status: 409 });
    }
    
    // Create the booking with a pending status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        status: 'pending',
      })
      .select()
      .single();
    
    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: bookingError.message },
        { status: 500 }
      );
    }
    
    // The trigger will handle updating the calendar with the booking dates
    
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 