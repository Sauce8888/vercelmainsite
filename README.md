# Host Dashboard (Main Site)

This Next.js project serves as the central dashboard for property hosts to manage their direct booking websites.

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **UI Components**:
  - shadcn/ui for consistent design
  - Lucide React for icons
  - Sonner for toast notifications

## Project Structure

```
├── app/
│   ├── api/             # API routes for property management
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Host dashboard pages
│   │   ├── calendar/    # Calendar management
│   │   ├── pricing/     # Pricing management
│   │   ├── bookings/    # Booking management
│   │   └── settings/    # Property settings
│   └── page.tsx         # Landing page
├── components/          # Reusable UI components
├── lib/                 # Utility functions and API clients
├── public/              # Static assets
└── styles/              # Global styles
```

## Key Features

### Authentication
- Sign in with email/password
- Password reset functionality
- Session management

### Dashboard Overview
- Property performance metrics
- Recent bookings
- Calendar overview
- Quick actions

### Calendar Management
- Block/unblock dates
- View existing bookings
- Set custom availability rules

### Pricing Management
- Set base pricing
- Configure seasonal pricing
- Special date pricing
- Minimum stay requirements

### Booking Management
- View and manage incoming bookings
- Booking calendar
- Guest communication
- Booking status updates

### Property Settings
- Update property details
- Manage property images
- Update amenities list
- Location information

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For production notifications
EMAIL_SERVER=your_email_server
EMAIL_FROM=your_from_email
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
