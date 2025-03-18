// app/dashboard/calendar/page.tsx (continued)
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Calendar Management</span>
            {properties.length > 0 && (
              <Select value={propertyId || ''} onValueChange={handlePropertyChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {propertyId ? (
            <div className="space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-medium">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="outline" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center font-medium">
                    {day}
                  </div>
                ))}
                {renderCalendarDays()}
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block Dates</SelectItem>
                    <SelectItem value="unblock">Unblock Dates</SelectItem>
                    <SelectItem value="price">Set Price</SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedAction === 'price' && (
                  <div className="flex-1">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price per night"
                      className="w-full p-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || selectedDates.length === 0}
                  className="sm:flex-shrink-0"
                >
                  {loading ? 'Updating...' : 'Apply Changes'}
                </Button>
              </div>
              
              {/* Legend */}
              <div className="flex gap-4 pt-4 border-t">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border rounded mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 border rounded mr-2"></div>
                  <span>Blocked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-200 border rounded mr-2"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-200 border rounded mr-2"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              {properties.length > 0 ? (
                <p>Please select a property to manage its calendar</p>
              ) : (
                <div className="space-y-4">
                  <p>You don't have any properties yet.</p>
                  <Button onClick={() => window.location.href = '/dashboard/properties/new'}>
                    Add Your First Property
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Simplified property dashboard page for navigation context
// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Settings, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
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
function DashboardCard({ title, value, icon, link, linkText }) {
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
