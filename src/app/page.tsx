"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Calendar, BookOpen, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for client-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is logged in, redirect to dashboard
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    let isActive = true;
    if (isActive) {
      checkSession();
    }
    
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="max-w-5xl w-full space-y-12 py-12">
        {/* Hero section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Host Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The central dashboard for property hosts to manage their direct booking websites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Features section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Home className="h-8 w-8 text-blue-500" />}
              title="Property Management"
              description="Easily add and manage your rental properties in one central dashboard."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-green-500" />}
              title="Calendar Management"
              description="Block dates, set custom pricing, and view bookings on a visual calendar."
            />
            <FeatureCard 
              icon={<BookOpen className="h-8 w-8 text-purple-500" />}
              title="Booking Management"
              description="View and manage all your bookings in one place with easy status updates."
            />
            <FeatureCard 
              icon={<DollarSign className="h-8 w-8 text-amber-500" />}
              title="Dynamic Pricing"
              description="Set custom pricing for different seasons and special dates."
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 border-t">
          <p className="text-sm text-muted-foreground pt-4">
            © 2024 Host Dashboard. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex justify-center">{icon}</div>
        <CardTitle className="text-xl text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
