// Property interfaces
export interface Property {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  location: string;
  amenities: string[];
  images: string[];
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface NewProperty {
  name: string;
  description: string;
  location: string;
  amenities: string[];
  images: string[];
  base_price: number;
}

// Calendar interfaces
export interface CalendarDay {
  id: string;
  property_id: string;
  date: string;
  status: 'available' | 'blocked' | 'booked';
  price?: number;
  minimum_stay?: number;
  booking_id?: string;
}

export interface CalendarUpdate {
  property_id: string;
  dates: string[];
  status: 'available' | 'blocked';
  price?: number;
  minimum_stay?: number;
}

// Booking interfaces
export interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NewBooking {
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_price: number;
} 