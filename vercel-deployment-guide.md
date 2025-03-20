# Vercel Deployment Guide

This guide will help you set up and deploy both the Host Site and Main Dashboard Site on Vercel.

## Prerequisites

1. A Vercel account
2. A GitHub account (for storing your repositories)
3. A Supabase account (with your database set up)
4. A Stripe account (for payments)

## Step 1: Set Up Your Repositories

Create two separate GitHub repositories for your projects:
- `vercelhostsite` - For the individual property booking sites
- `vercelmainsite` - For the main dashboard site

Clone these repositories to your local machine:

```bash
git clone https://github.com/yourusername/airbnb-host-site.git
git clone https://github.com/yourusername/airbnb-host-dashboard.git
```

## Step 2: Initialize Your Next.js Projects

For each project, initialize a fresh Next.js application:

```bash
# For the Host Site
cd airbnb-host-site
npx create-next-app@latest . --typescript --eslint --tailwind --app

# For the Dashboard Site 
cd ../airbnb-host-dashboard
npx create-next-app@latest . --typescript --eslint --tailwind --app
```

## Step 3: Install Required Dependencies

For both projects, install the necessary dependencies:

```bash
# Install the common dependencies
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js stripe date-fns sonner
npm install lucide-react

# Install shadcn/ui and its dependencies
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card select input label toast calendar popover dialog
```

## Step 4: Add the Configuration Files

Add the `vercel.json` and `next.config.js` files to both projects as specified in the documentation.

## Step 5: Set Up Environment Variables

Create a `.env.local` file in each project with the necessary environment variables:

### Host Site (.env.local)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Your sites
NEXT_PUBLIC_HOST_URL=https://your-host-site-url.vercel.app
NEXT_PUBLIC_DASHBOARD_URL=https://your-dashboard-site-url.vercel.app

# Property configuration (specific to each host site)
NEXT_PUBLIC_PROPERTY_ID=your_property_id
```

### Dashboard Site (.env.local)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Your sites
NEXT_PUBLIC_HOST_URL_PREFIX=https://your-host-site-url.vercel.app
```

## Step 6: Set Up Database in Supabase

Execute the SQL statements provided in the database schema to set up your Supabase database tables, policies, and triggers.

## Step 7: Deploy to Vercel

For each project:

1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Initial setup"
   git push
   ```

2. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Add all environment variables from your .env.local file
6. Click "Deploy"

## Step 8: Set Up Stripe Webhook

After deploying your Host Site:

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Create a new webhook endpoint with the URL: `https://your-host-site-url.vercel.app/api/webhook/stripe`
3. Add the event `checkout.session.completed`
4. Copy the signing secret and add it to your Host Site environment variables in the Vercel dashboard as `STRIPE_WEBHOOK_SECRET`

## Step 9: Test Your Deployment

1. Visit your Dashboard Site and create an account
2. Add a property
3. Configure calendar and pricing
4. Visit the Host Site for that property and test the booking flow

## Troubleshooting Common Vercel Issues

1. **Environment Variables**: If your site works locally but fails on Vercel, check that all environment variables are correctly set in the Vercel dashboard.

2. **API Routes**: If API routes return 500 errors, check the function logs in the Vercel dashboard for specific error messages.

3. **Build Failures**: If the build fails, check the build logs for specific errors. Common issues include:
   - Missing dependencies
   - TypeScript errors
   - Import errors

4. **Serverless Function Size**: Vercel has a limit of 50MB per serverless function. If you exceed this, you may need to optimize your imports.

5. **Database Connection**: If you can't connect to Supabase, check:
   - Your Supabase URL and keys are correct
   - Your Supabase database is publicly accessible or has the correct network policies

6. **CORS Issues**: If you experience CORS errors between your sites, add appropriate CORS headers in your API routes.
