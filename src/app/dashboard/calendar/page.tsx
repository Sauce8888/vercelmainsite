'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths, 
  isSameDay 
} from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Property, CalendarDay, CalendarUpdate } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { DollarSign } from 'lucide-react';
import { Calendar, Home } from 'lucide-react';

// Create a Supabase client for client-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPropertyId = searchParams.get('property');
  
  const [propertyId, setPropertyId] = useState<string | null>(initialPropertyId);
  const [properties, setProperties] = useState<Property[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedAction, setSelectedAction] = useState<string>('block');
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch properties on component load
  useEffect(() => {
    async function fetchProperties() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/signin');
        return;
      }
      
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      
      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }
      
      setProperties(data || []);
    }
    
    fetchProperties();
  }, [router]);
  
  // Fetch calendar data when property is selected or month changes
  useEffect(() => {
    if (!propertyId) return;
    
    async function fetchCalendarData() {
      try {
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/signin');
          return;
        }
        
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        
        const response = await fetch(
          `/api/calendar?property=${propertyId}&start=${format(monthStart, 'yyyy-MM-dd')}&end=${format(monthEnd, 'yyyy-MM-dd')}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        const { data, error } = await response.json();
        
        if (error) {
          console.error('Error fetching calendar data:', error);
          setError('Failed to load calendar data. Please try again later.');
          return;
        }
        
        setCalendarData(data?.calendar || []);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        setError('Failed to load calendar data. Please try again later.');
      }
    }
    
    fetchCalendarData();
  }, [propertyId, currentMonth, router]);
  
  // Handle property selection
  const handlePropertyChange = (value: string) => {
    setPropertyId(value);
    setSelectedDates([]);
    router.push(`/dashboard/calendar?property=${value}`);
  };
  
  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };
  
  // Handle date selection
  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };
  
  // Handle calendar update submit
  const handleSubmit = async () => {
    if (!propertyId || selectedDates.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/signin');
        return;
      }
      
      const updateData: CalendarUpdate = {
        property_id: propertyId,
        dates: selectedDates,
        status: selectedAction === 'block' ? 'blocked' : 'available',
      };
      
      if (selectedAction === 'price' && price) {
        updateData.price = parseFloat(price);
      }
      
      const response = await fetch('/api/calendar/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `${response.status}: ${response.statusText}`);
      }
      
      // Refresh calendar data
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const calendarResponse = await fetch(
        `/api/calendar?property=${propertyId}&start=${format(monthStart, 'yyyy-MM-dd')}&end=${format(monthEnd, 'yyyy-MM-dd')}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      
      if (!calendarResponse.ok) {
        throw new Error(`Failed to refresh calendar: ${calendarResponse.status}`);
      }
      
      const { data } = await calendarResponse.json();
      
      setCalendarData(data?.calendar || []);
      setSelectedDates([]);
    } catch (error) {
      console.error('Error updating calendar:', error);
      setError('Failed to update calendar. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render calendar days
  const renderCalendarDays = () => {
    if (!currentMonth) return null;
    
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the day of the week of the first day (0 = Sunday, 6 = Saturday)
    const startDay = monthStart.getDay();
    
    // Create empty cells for the days before the start of the month
    const leadingDays = Array.from({ length: startDay }, (_, i) => (
      <div key={`empty-${i}`} className="h-28 bg-gray-50/50 border border-gray-100" />
    ));
    
    const dayElements = calendarDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const calendarEntry = calendarData.find(entry => entry.date === dateStr);
      const isSelected = selectedDates.includes(dateStr);
      const isToday = isSameDay(day, new Date());
      
      let statusColor = "";
      let statusText = "Available";
      
      if (isSelected) {
        statusColor = "bg-emerald-100 border-emerald-300 hover:bg-emerald-200";
        statusText = "Selected";
      } else if (calendarEntry) {
        switch(calendarEntry.status) {
          case 'blocked':
            statusColor = "bg-gray-100 border-gray-300 hover:bg-gray-200";
            statusText = "Blocked";
            break;
          case 'booked':
            statusColor = "bg-blue-100 border-blue-300 hover:bg-blue-200";
            statusText = "Booked";
            break;
          default:
            statusColor = "bg-white hover:bg-gray-50";
            statusText = "Available";
        }
      } else {
        statusColor = "bg-white hover:bg-gray-50";
      }
      
      const isSelectable = calendarEntry?.status !== 'booked';
      
      const handleClick = () => {
        // Don't allow selection of booked dates
        if (!isSelectable) return;
        toggleDateSelection(dateStr);
      };
      
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      };
      
      return (
        <div 
          key={dateStr} 
          className={`h-28 border border-gray-200 flex flex-col relative overflow-hidden transition-all duration-200
            ${statusColor} 
            ${isSelectable ? 'cursor-pointer hover:shadow-md hover:z-10' : 'cursor-not-allowed opacity-90'}`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label={`${format(day, 'MMMM d, yyyy')} - ${statusText}`}
        >
          <div className={`py-2 px-3 text-left flex justify-between items-center ${isToday ? 'bg-indigo-100' : ''}`}>
            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-center font-bold text-base
              ${isToday ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-800'}`}
            >
              {format(day, 'd')}
            </span>
            {isSelected && (
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse mr-1" />
            )}
          </div>
          <div className="flex-1 px-3 pb-2 text-sm flex flex-col justify-between">
            <div>
              {calendarEntry?.status && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium shadow-sm bg-opacity-90 mt-1">
                  {calendarEntry.status === 'blocked' && (
                    <span className="text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">Blocked</span>
                  )}
                  {calendarEntry.status === 'booked' && (
                    <span className="text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">Booked</span>
                  )}
                  {calendarEntry.status === 'available' && (
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Available</span>
                  )}
                </span>
              )}
            </div>
            {calendarEntry?.price && (
              <div className="font-medium mt-auto text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full inline-flex items-center shadow-sm text-sm">
                <DollarSign className="h-4 w-4 mr-1" /> {calendarEntry.price}
              </div>
            )}
          </div>
        </div>
      );
    });
    
    return [...leadingDays, ...dayElements];
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Calendar Management</h1>
        {properties.length > 0 && (
          <div className="sm:w-[280px]">
            <Select value={propertyId || ''} onValueChange={handlePropertyChange}>
              <SelectTrigger className="bg-white border-2 border-gray-200 shadow-md text-base h-12 px-4 rounded-xl">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id} className="text-base py-2">
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6 text-base border-2 border-red-200">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 mr-3 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <AlertTitle className="text-lg font-bold mb-1">Error</AlertTitle>
              <AlertDescription className="text-base">{error}</AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      {propertyId ? (
        <div className="space-y-6">
          {/* Month Navigation */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="pb-4 pt-5 px-6">
              <div className="relative flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigateMonth('prev')} 
                  className="absolute left-0 rounded-full w-10 h-10 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-2xl font-semibold text-indigo-700">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigateMonth('next')} 
                  className="absolute right-0 rounded-full w-10 h-10 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Calendar Grid */}
              <div className="overflow-hidden border-t">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-500 to-blue-600">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-3 text-center font-semibold text-white text-base">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar Cells */}
                <div className="grid grid-cols-7 bg-white">
                  {renderCalendarDays()}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Update Selected Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <p className="text-sm text-gray-600">
                    {selectedDates.length === 0 
                      ? 'Select dates on the calendar to update them.' 
                      : `Selected ${selectedDates.length} ${selectedDates.length === 1 ? 'date' : 'dates'}.`}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedDates.slice(0, 5).map(date => (
                      <span key={date} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                        {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    ))}
                    {selectedDates.length > 5 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                        +{selectedDates.length - 5} more
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Action</label>
                      <Select 
                        value={selectedAction} 
                        onValueChange={setSelectedAction}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="block">Block Dates</SelectItem>
                          <SelectItem value="unblock">Unblock Dates</SelectItem>
                          <SelectItem value="price">Set Price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedAction === 'price' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Price per night</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <input 
                            type="text" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price"
                            className="pl-8 w-full rounded-md border border-gray-300 py-2"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-end">
                      <Button 
                        onClick={handleSubmit}
                        disabled={loading || selectedDates.length === 0}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Updating...</span>
                          </div>
                        ) : (
                          <span>Apply Changes</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Legend Card */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Status Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-white border rounded-md mr-2 shadow-sm"></div>
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 border-gray-300 border rounded-md mr-2 shadow-sm"></div>
                    <span className="text-sm font-medium">Blocked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 border-blue-300 border rounded-md mr-2 shadow-sm"></div>
                    <span className="text-sm font-medium">Booked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-emerald-100 border-emerald-300 border rounded-md mr-2 shadow-sm"></div>
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            {properties.length > 0 ? (
              <div className="text-center space-y-4">
                <Calendar className="h-16 w-16 mx-auto text-indigo-400 mb-2" />
                <h3 className="text-lg font-medium mb-2">Select a Property</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">Please select a property from the dropdown above to manage its calendar</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Home className="h-16 w-16 mx-auto text-indigo-400 mb-2" />
                <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">Add your first property to start managing your calendar</p>
                <Button 
                  onClick={() => router.push('/dashboard/properties/new')} 
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  Add Your First Property
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}