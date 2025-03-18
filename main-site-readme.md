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

## API Routes

- `GET /api/properties`: List host properties
- `GET /api/properties/[id]`: Get specific property details
- `PUT /api/properties/[id]`: Update property details
- `GET /api/bookings`: List bookings for a property
- `PUT /api/calendar/block`: Block calendar dates
- `PUT /api/pricing/update`: Update property pricing

## Database Schema

### Properties Table
- `id`: UUID (Primary Key)
- `owner_id`: UUID (Foreign Key to users)
- `name`: String
- `description`: Text
- `location`: String
- `amenities`: Array
- `images`: Array of URLs
- `base_price`: Decimal
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Calendar Table
- `id`: UUID (Primary Key)
- `property_id`: UUID (Foreign Key to properties)
- `date`: Date
- `status`: String (available, blocked, booked)
- `price`: Decimal (optional, for custom pricing)
- `minimum_stay`: Integer (optional)
- `booking_id`: UUID (Foreign Key to bookings, if booked)

### Bookings Table
- `id`: UUID (Primary Key)
- `property_id`: UUID (Foreign Key to properties)
- `guest_name`: String
- `guest_email`: String
- `check_in`: Date
- `check_out`: Date
- `adults`: Integer
- `children`: Integer
- `total_price`: Decimal
- `status`: String (confirmed, canceled, etc.)
- `created_at`: Timestamp

## Deployment on Vercel

1. Push code to a GitHub repository
2. Connect to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

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
