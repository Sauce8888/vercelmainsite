import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NewProperty } from '@/lib/types';

// Create a Supabase client for API routes
const createApiClient = () => {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};

// GET /api/properties - Get all properties for the authenticated user
export async function GET(request: NextRequest) {
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
    
    // Get properties for the authenticated user
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', session.user.id);
    
    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ properties: data });
  } catch (error) {
    console.error('Error in GET /api/properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
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
    
    // Get property data from request body
    const propertyData: NewProperty = await request.json();
    
    // Insert property with the authenticated user as owner
    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...propertyData,
        owner_id: session.user.id,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating property:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ property: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 