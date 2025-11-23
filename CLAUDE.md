# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DSP Schedule Management is a Next.js 14 web application for managing delivery service provider operations, including driver schedules, vehicle management, asset tracking, and SMS notifications. The frontend integrates with a FastAPI backend (not in this repo).

## Development Commands

### Core Commands
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server

### No Test/Lint Scripts
This project does not have test or lint scripts configured in package.json.

## Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks + Context API (AuthContext)
- **Data Fetching**: Axios with custom APIClient singleton
- **UI Components**: Radix UI primitives via shadcn/ui

### Project Structure
```
src/
├── app/                      # Next.js app router pages
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Home page (schedule management)
│   ├── drivers/             # Driver management pages
│   ├── vehicles/            # Vehicle management pages
│   ├── assets/              # Asset/inventory pages
│   ├── inspections/         # Vehicle inspection pages
│   ├── login/               # Admin login
│   └── driver-login/        # Driver-specific login
├── components/
│   ├── ui/                  # Reusable shadcn/ui components
│   ├── layout/              # Layout components (sidebar, user nav)
│   └── schedule/            # Schedule-specific components
├── contexts/
│   └── auth-context.tsx     # Authentication state management
├── hooks/                   # Custom React hooks for data fetching
├── lib/
│   ├── api/
│   │   ├── client.ts        # APIClient singleton + all type definitions
│   │   └── converters.ts    # API response to frontend type converters
│   ├── utils.ts             # Utility functions (cn, etc.)
│   └── mock-data.ts         # Mock data for development
└── types/
    └── schedule.ts          # Frontend-specific type definitions
```

### API Integration

The application communicates with a FastAPI backend. All API logic is centralized:

**APIClient (`src/lib/api/client.ts`)**:
- Singleton instance exported as `apiClient`
- Axios instance with base URL from `NEXT_PUBLIC_API_BASE_URL` env var (defaults to http://localhost:8000)
- Automatic Bearer token injection via request interceptor
- Automatic 401 handling with redirect to login
- All API types (Request/Response) defined in same file
- Token management via `TokenManager` class:
  - Admin tokens: localStorage (`admin_token`)
  - Driver tokens: sessionStorage (`driver_token`)

**Type Converters (`src/lib/api/converters.ts`)**:
- Convert snake_case API responses to camelCase frontend types
- Handle date string → Date object conversions
- Enrich data that requires cross-referencing (e.g., driver names)

**Custom Hooks (`src/hooks/`)**:
- Each resource has a hook (e.g., `use-drivers.ts`, `use-vehicles.ts`)
- Pattern: `const { data, isLoading, error, refetch } = useResource()`
- Hooks use `apiClient` directly and handle loading/error states

### Authentication Flow

**Two separate auth flows:**
1. **Admin Login** (`/login`)
   - Uses `apiClient.adminLogin(email, password)`
   - Token stored in localStorage
   - User data stored in `AuthContext`
   - Protected routes redirect to `/login` if unauthenticated

2. **Driver Login** (`/driver-login`)
   - Uses `apiClient.driverLogin(amazonId, password)`
   - Token stored in sessionStorage (single-session only)
   - Access to `/driver-inspection` page only

**Protected Routes**:
- `LayoutWrapper` component checks authentication
- Public pages: `/login`, `/driver-login`, `/driver-inspection`
- All other pages require admin authentication

### UI Component System

**Component Library**: shadcn/ui (Radix UI + Tailwind)
- All UI components in `src/components/ui/`
- Consistent styling via Tailwind utility classes
- Theme system using CSS variables (see `src/app/globals.css`)
- Sidebar component from shadcn/ui v2 (with context-based open/close state)

**Styling Conventions**:
- Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Color palette: Blue primary (#2563eb), gradient backgrounds
- Mobile-first responsive design with `sm:`, `md:`, `lg:` breakpoints

### Key Features & Pages

**Schedule Management** (`/` - `src/app/page.tsx`):
- Calendar view with react-big-calendar
- Deputy sync integration for importing shifts
- Vehicle assignment to schedules
- SMS notifications to drivers
- Status tracking: pending, confirmed, completed, cancelled

**Driver Management** (`/drivers`):
- CRUD operations for drivers
- Document tracking (license, visa, certifications) with expiry dates
- Amazon ID and Deputy ID linking

**Vehicle Management** (`/vehicles`):
- Vehicle details with photos
- Maintenance tracking and scheduling
- Inspection history
- Condition status: 0=green, 1=yellow, 2=red
- Availability status: 0=available, 1=in-use, 2=maintenance

**Asset/Inventory Management** (`/assets`):
- Track equipment and supplies
- Borrow records for drivers
- Low stock alerts

**Vehicle Inspections** (`/inspections` and `/driver-inspection`):
- Drivers perform pre-trip inspections
- Photo upload capability
- Admin review workflow

### Important Technical Details

**Path Aliases**:
- `@/` maps to `src/` (configured in tsconfig.json)
- Always use `@/` prefix for imports

**Environment Variables**:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
- Stored in `.env.local` (not committed to git)

**Date Handling**:
- API returns ISO 8601 strings, convert to Date objects in converters
- Schedule times: API uses separate `date` (YYYY-MM-DD) and `start_time`/`end_time` (HH:MM) fields

**File Uploads**:
- Use FormData for multipart/form-data requests
- Vehicle photos: `apiClient.uploadVehiclePhotos(vehicleId, files)`
- Driver documents: `apiClient.uploadDriverDocumentFile(driverId, documentId, file)`
- Inspection photos: `apiClient.uploadInspectionPhotos(inspectionId, files)`

**Naming Conventions**:
- API uses snake_case (driver_id, created_at)
- Frontend uses camelCase (driverId, createdAt)
- Always convert via converters.ts when integrating new endpoints

**Dynamic Imports**:
- react-big-calendar is dynamically imported with `{ ssr: false }` to avoid SSR issues
- Use this pattern for client-only libraries

## Common Development Patterns

### Adding a New API Endpoint

1. Add types to `src/lib/api/client.ts` (Request/Response interfaces)
2. Add method to `APIClient` class
3. If needed, add converter function to `src/lib/api/converters.ts`
4. Create or update hook in `src/hooks/` to consume the endpoint
5. Use the hook in your page/component

### Creating a New Page

1. Create file in `src/app/[route]/page.tsx`
2. Add route to sidebar in `src/components/layout/app-sidebar.tsx`
3. Page should be a client component (`'use client'`) if it uses hooks or interactivity
4. Protected pages automatically require authentication via `LayoutWrapper`

### Adding a New Form

1. Use shadcn/ui form components (input, label, button, etc.)
2. Use react-hook-form if complex validation needed (already installed)
3. Call `apiClient` methods directly or via custom hook
4. Use `useToast` hook for success/error notifications
5. Handle loading states with local state or hook's `isLoading`

### Working with the Backend

- Backend base URL: Check `.env.local` for `NEXT_PUBLIC_API_BASE_URL`
- All endpoints prefixed with `/api/v1/`
- Authentication: Bearer token automatically added by request interceptor
- Error handling: 401 errors auto-redirect to login, other errors should be caught in hooks/components
