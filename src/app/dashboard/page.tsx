import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Settings, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Fetch properties to show stats
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, name, base_price');
    
  if (error) {
    console.error('Error fetching properties:', error);
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Properties"
          value={properties?.length || 0}
          link="/dashboard/properties"
          linkText="Manage Properties"
        />
        <DashboardCard
          title="Calendar"
          icon={<Calendar className="h-8 w-8 text-blue-500" />}
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
      
      {properties && properties.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle>{property.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex items-center text-lg font-medium">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {property.base_price} / night
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/properties/${property.id}`}>
                        Manage
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/calendar?property=${property.id}`}>
                        Calendar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Started</h2>
          <p className="mb-6">Add your first property to start accepting direct bookings.</p>
          <Button asChild>
            <Link href="/dashboard/properties/new">Add Property</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper component for the dashboard cards
function DashboardCard({ 
  title, 
  value, 
  icon, 
  link, 
  linkText 
}: { 
  title: string; 
  value?: number; 
  icon?: React.ReactNode; 
  link: string; 
  linkText: string; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {value !== undefined ? (
          <p className="text-3xl font-bold">{value}</p>
        ) : (
          icon
        )}
        <Button variant="outline" asChild className="w-full">
          <Link href={link}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
} 