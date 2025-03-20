import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';

type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const supabase = createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Fetch property data
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single() as { data: Property | null, error: any };
  
  if (error || !property) {
    console.error('Error fetching property:', error);
    notFound();
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Property</h1>
      </div>
      
      <PropertyForm initialData={property} />
    </div>
  );
} 