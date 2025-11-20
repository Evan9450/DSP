# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DSP (Delivery Service Partner) Manager is a Next.js application for managing Amazon DSP operations, including driver schedules, vehicle assignments, and SMS notifications. The app features Deputy integration for schedule synchronization.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Calendar**: react-big-calendar with date-fns
- **State Management**: React useState (client-side only, no global state)

## Architecture

### App Structure

The application uses Next.js App Router with the following page structure:

- `/` - Schedule Management (main page with calendar view)
- `/drivers` - Driver Management
- `/vehicles` - Vehicle Fleet Management
- `/messages` - SMS/Communication History
- `/reports` - Analytics and Reports
- `/settings` - System Configuration

### Layout System

Global layout (`src/app/layout.tsx`) implements:
- Fixed sidebar navigation (`src/components/layout/sidebar.tsx`)
- Main content area with flex layout
- Global toast notifications via `<Toaster />`

### Component Organization

**UI Components** (`src/components/ui/`)
- Radix UI-based primitives (buttons, dialogs, cards, etc.)
- Reusable across the application
- Styled with Tailwind using class-variance-authority

**Feature Components** (`src/components/schedule/`)
- `schedule-calendar.tsx` - Calendar view with react-big-calendar
- `deputy-sync-panel.tsx` - Deputy integration UI
- `schedule-details-dialog.tsx` - Schedule information modal
- `vehicle-assignment-dialog.tsx` - Vehicle assignment interface
- `sms-dialog.tsx` - SMS notification interface

### Type System

Core types defined in `src/types/schedule.ts`:

- `Schedule` - Driver shift with vehicle assignment and status
- `Driver` - Driver information with Amazon ID
- `Vehicle` - Fleet vehicle with availability status
- `SMSHistory` - Communication tracking
- `ScheduleStatus` - 'pending' | 'confirmed' | 'completed'

### Data Flow

Currently uses mock data (`src/lib/mock-data.ts`) for all entities:
- `mockSchedules` - Sample driver schedules
- `mockVehicles` - Fleet vehicle inventory
- `mockDrivers` - Driver roster
- `mockSMSHistory` - SMS message log

**Note**: No backend integration yet. All state management is local component state.

### Path Aliases

TypeScript configured with `@/*` mapping to `./src/*` for clean imports:
```typescript
import { Schedule } from '@/types/schedule';
import { Button } from '@/components/ui/button';
```

### Calendar Implementation

The schedule calendar uses:
- **Library**: react-big-calendar with date-fns localizer
- **Dynamic Loading**: Calendar is loaded with `next/dynamic` and `ssr: false` to avoid SSR issues
- **Views**: Month, week, and day views supported
- **Event Styling**: Color-coded by status (gray=pending, blue=confirmed, green=completed)
- **Visual Indicators**: Orange border indicates new/modified schedules from Deputy sync

### Deputy Integration

Mock Deputy sync (`src/app/page.tsx`):
- Simulates 2-second API call
- Creates new schedule with `isNew` flag
- Updates `lastSyncTime` state
- Shows toast notification

**Note**: Actual Deputy API integration not implemented.

## Key Features to Understand

1. **Client-Side Only**: All pages use `'use client'` directive. No server components or server actions.

2. **Dialog Management**: Schedule operations use a dialog flow:
   - Click schedule → Opens details dialog
   - From details → Can open vehicle assignment or SMS dialogs
   - Dialogs close previous dialog when opening next

3. **Status Management**: Schedules have three states with visual indicators in calendar and throughout UI.

4. **Vehicle Assignment**: Vehicles can be assigned to schedules. Available vehicles exclude those with 'maintenance' status.

## Styling Conventions

- **Color Scheme**: Blue and orange primary colors with gray accents
- **Gradients**: Pages use `from-blue-50 via-white to-orange-50` background gradient
- **Status Colors**:
  - Pending: Gray (`#6b7280`)
  - Confirmed: Blue (`#2563eb`)
  - Completed: Green (`#16a34a`)
  - New/Modified: Orange border (`#f97316`)
- **Utility**: Uses `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge)

## Important Notes

- All dates in mock data use `new Date(2024, 0, ...)` format (January 2024)
- Phone numbers in mock data are placeholders (`+123456789X`)
- No authentication or authorization implemented
- No database or API layer exists yet
- Toast notifications use shadcn/ui toast system
