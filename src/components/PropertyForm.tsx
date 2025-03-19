'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { NewProperty } from '@/lib/types';
import type { Database } from '@/lib/database.types';

const propertyFormSchema = z.object({
  name: z.string().min(2, {
    message: "Property name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(5, {
    message: "Location must be at least 5 characters.",
  }),
  base_price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  bedrooms: z.coerce.number().int().positive({
    message: "Bedrooms must be a positive number.",
  }),
  bathrooms: z.coerce.number().positive({
    message: "Bathrooms must be a positive number.",
  }),
  max_guests: z.coerce.number().int().positive({
    message: "Max guests must be a positive number.",
  }),
  amenities: z.array(z.string()).default([]).or(
    z.string().transform((value: string) => 
      value ? value.split(',').map((item: string) => item.trim()).filter(Boolean) : []
    )
  ),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const PropertyForm = () => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      base_price: 0,
      bedrooms: 1,
      bathrooms: 1,
      max_guests: 1,
      amenities: [],
    },
  });

  const handleSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      const newProperty = {
        owner_id: userData.user.id,
        name: data.name,
        description: data.description,
        location: data.location,
        base_price: data.base_price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        max_guests: data.max_guests,
        amenities: data.amenities,
        images: [] as string[],
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('properties')
        .insert(newProperty);

      if (error) throw error;
      
      toast.success('Property added successfully!');
      router.push('/dashboard/properties');
      router.refresh();
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.currentTarget === e.target) {
      e.preventDefault();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" onKeyDown={handleKeyDown}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Beach House" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your property..." 
                      {...field} 
                      className="min-h-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Miami, Florida" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Price per Night ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_guests"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Wifi, Pool, Hot Tub (comma-separated)" 
                      value={field.value instanceof Array ? field.value.join(', ') : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (typeof value === 'string') {
                          const amenities = value ? value.split(',').map(item => item.trim()).filter(Boolean) : [];
                          field.onChange(amenities);
                        } else {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Property...' : 'Add Property'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm; 