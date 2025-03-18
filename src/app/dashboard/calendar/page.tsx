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
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const { data, error } = await fetch(
        `/api/calendar?property=${propertyId}&start=${format(monthStart, 'yyyy-MM-dd')}&end=${format(monthEnd, 'yyyy-MM-dd')}`
      ).then(res => res.json());
      
      if (error) {
        console.error('Error fetching calendar data:', error);
        return;
      }
      
      setCalendarData(data?.calendar || []);
    }
    
    fetchCalendarData();
  }, [propertyId, currentMonth]);
  
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
    
    try {
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
        },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update calendar');
      }
      
      // Refresh calendar data
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const { data } = await fetch(
        `/api/calendar?property=${propertyId}&start=${format(monthStart, 'yyyy-MM-dd')}&end=${format(monthEnd, 'yyyy-MM-dd')}`
      ).then(res => res.json());
      
      setCalendarData(data?.calendar || []);
      setSelectedDates([]);
    } catch (error) {
      console.error('Error updating calendar:', error);
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
      <div key={`empty-${i}`} className="h-14 p-1" />
    ));
    
    const dayElements = calendarDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const calendarEntry = calendarData.find(entry => entry.date === dateStr);
      const isSelected = selectedDates.includes(dateStr);
      
      let cellClass = "h-14 p-1 border rounded flex flex-col items-center justify-center cursor-pointer transition-colors";
      
      if (isSelected) {
        cellClass += " bg-green-200";
      } else if (calendarEntry) {
        switch(calendarEntry.status) {
          case 'blocked':
            cellClass += " bg-gray-300";
            break;
          case 'booked':
            cellClass += " bg-blue-200";
            break;
          default:
            cellClass += " bg-white";
        }
      } else {
        cellClass += " bg-white";
      }
      
      const handleClick = () => {
        // Don't allow selection of booked dates
        if (calendarEntry?.status === 'booked') return;
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
          className={cellClass}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label={`${format(day, 'MMMM d, yyyy')} - ${calendarEntry?.status || 'available'}`}
        >
          <span className="text-sm">{format(day, 'd')}</span>
          {calendarEntry?.price && (
            <span className="text-xs mt-1">${calendarEntry.price}</span>
          )}
        </div>
      );
    });
    
    return [...leadingDays, ...dayElements];
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar Management</h1>
      
      <Card>
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
                  <Button onClick={() => router.push('/dashboard/properties/new')}>
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