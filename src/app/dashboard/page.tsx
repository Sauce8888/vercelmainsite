"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Settings, DollarSign, Home, Users, CheckSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/providers/auth-provider';

// Create a Supabase client for client-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const { session } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      
      try {
        setIsLoading(true);
        
        // Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, name, base_price, images');
          
        if (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
        } else {
          setProperties(propertiesData || []);
        }

        // Fetch recent bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, property_id, guest_name, check_in, check_out, total_price, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else {
          setRecentBookings(bookingsData || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Calculate some metrics
  const totalProperties = properties?.length || 0;
  const activeBookings = recentBookings?.filter(b => b.status === 'confirmed').length || 0;
  const pendingBookings = recentBookings?.filter(b => b.status === 'pending').length || 0;
  
  // Calculate total revenue (simplified)
  const totalRevenue = recentBookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/properties/new">Add New Property</Link>
        </Button>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Properties" 
          value={totalProperties} 
          icon={<Home className="h-6 w-6 text-blue-500" />} 
          description="Total properties listed"
        />
        <MetricCard 
          title="Active Bookings" 
          value={activeBookings}
          icon={<CheckSquare className="h-6 w-6 text-green-500" />}
          description="Confirmed reservations"
        />
        <MetricCard 
          title="Pending Bookings" 
          value={pendingBookings}
          icon={<Clock className="h-6 w-6 text-yellow-500" />}
          description="Awaiting confirmation"
        />
        <MetricCard 
          title="Revenue" 
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
          description="Total earnings"
          isMonetary
        />
      </div>
      
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Properties"
          icon={<Home className="h-8 w-8 text-blue-500" />}
          link="/dashboard/properties"
          linkText="Manage Properties"
        />
        <DashboardCard
          title="Calendar"
          icon={<Calendar className="h-8 w-8 text-purple-500" />}
          link="/dashboard/calendar"
          linkText="Manage Calendar"
        />
        <DashboardCard
          title="Bookings"
          icon={<BookOpen className="h-8 w-8 text-green-500" />}
          link="/dashboard/bookings"
          linkText="View Bookings"
        />
        <DashboardCard
          title="Settings"
          icon={<Settings className="h-8 w-8 text-gray-500" />}
          link="/dashboard/settings"
          linkText="Account Settings"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  const propertyName = properties?.find(p => p.id === booking.property_id)?.name || 'Unknown Property';
                  
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800">
                      <div>
                        <p className="font-medium">{booking.guest_name}</p>
                        <p className="text-sm text-gray-500">{propertyName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status}
                        </div>
                        <p className="font-medium">${booking.total_price}</p>
                        <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(booking.created_at))} ago</p>
                      </div>
                    </div>
                  );
                })}
                <div className="text-center pt-2">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/bookings">View All Bookings</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-4">Once you receive bookings, they will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Your Properties</CardTitle>
            <CardDescription>Manage your listings</CardDescription>
          </CardHeader>
          <CardContent>
            {properties && properties.length > 0 ? (
              <div className="space-y-4">
                {properties.slice(0, 3).map((property) => (
                  <div key={property.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="w-12 h-12 rounded-md bg-gray-200 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Home className="w-6 h-6 m-3 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{property.name}</p>
                      <p className="text-xs text-gray-500">${property.base_price}/night</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/properties/${property.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </div>
                ))}
                
                {properties.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/properties">View All Properties</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No properties yet</h3>
                <p className="text-gray-500 mb-4">Add your first property to get started</p>
                <Button asChild>
                  <Link href="/dashboard/properties/new">Add Property</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper components
function MetricCard({ 
  title, 
  value, 
  icon, 
  description,
  isMonetary = false
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  description: string;
  isMonetary?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function DashboardCard({ 
  title, 
  icon, 
  link, 
  linkText 
}: { 
  title: string; 
  icon: React.ReactNode; 
  link: string; 
  linkText: string; 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {icon}
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href={link} className="flex items-center justify-center space-x-2">
            <span>{linkText}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
} 