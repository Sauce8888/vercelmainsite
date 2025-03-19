import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import PropertyForm from '@/components/PropertyForm';

export default async function NewPropertyPage() {
  const supabase = createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Add New Property</h1>
      <PropertyForm />
    </div>
  );
} 