import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckSquare, Clock, X, Home } from 'lucide-react';
import { Booking, Property } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default async function BookingsPage() {
  const supabase = createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Fetch bookings and properties in parallel
  const [bookingsResponse, propertiesResponse] = await Promise.all([
    supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('properties')
      .select('id, name')
  ]);
  
  const { data: bookings, error: bookingsError } = bookingsResponse as { 
    data: Booking[] | null, 
    error: any 
  };
  
  const { data: properties, error: propertiesError } = propertiesResponse as {
    data: Pick<Property, 'id' | 'name'>[] | null, 
    error: any
  };
  
  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
  }
  
  if (propertiesError) {
    console.error('Error fetching properties:', propertiesError);
  }
  
  // Create a map of property IDs to names for quick lookup
  const propertyMap = properties?.reduce((map, property) => {
    map[property.id] = property.name;
    return map;
  }, {} as Record<string, string>) || {};
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Bookings</h1>
        
        <div className="flex gap-2">
          <Button variant="outline">
            Export
          </Button>
          <Button variant="outline">
            Filter
          </Button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Bookings" 
          value={bookings?.length || 0} 
          icon={<Users className="h-5 w-5 text-blue-500" />} 
        />
        <StatsCard 
          title="Confirmed" 
          value={bookings?.filter(b => b.status === 'confirmed').length || 0} 
          icon={<CheckSquare className="h-5 w-5 text-green-500" />} 
        />
        <StatsCard 
          title="Pending" 
          value={bookings?.filter(b => b.status === 'pending').length || 0} 
          icon={<Clock className="h-5 w-5 text-yellow-500" />} 
        />
        <StatsCard 
          title="Canceled" 
          value={bookings?.filter(b => b.status === 'canceled').length || 0} 
          icon={<X className="h-5 w-5 text-red-500" />} 
        />
      </div>
      
      {bookings && bookings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>Manage your property bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2 text-left font-medium">Guest</th>
                    <th className="py-3 px-2 text-left font-medium">Property</th>
                    <th className="py-3 px-2 text-left font-medium">Dates</th>
                    <th className="py-3 px-2 text-left font-medium">Total</th>
                    <th className="py-3 px-2 text-left font-medium">Status</th>
                    <th className="py-3 px-2 text-left font-medium">Booked</th>
                    <th className="py-3 px-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{booking.guest_name}</p>
                          <p className="text-sm text-gray-500">{booking.guest_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {propertyMap[booking.property_id] || 'Unknown Property'}
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-sm">Check-in: {new Date(booking.check_in).toLocaleDateString()}</p>
                          <p className="text-sm">Check-out: {new Date(booking.check_out).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        ${booking.total_price}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(booking.created_at))} ago
                      </td>
                      <td className="py-3 px-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/bookings/${booking.id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              You haven't received any bookings yet. Make sure your properties are visible to guests.
            </p>
            <Button asChild>
              <Link href="/dashboard/properties">
                Manage Properties
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Stats card component
function StatsCard({
  title,
  value,
  icon
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
} 