# API Integration Documentation

This document outlines the API integration work completed for the DSP Manager application.

## Overview

The application now integrates with a FastAPI backend using a comprehensive, type-safe API client library.

## Architecture

### API Client (`src/lib/api/client.ts`)

A singleton API client that provides:

- **Type-safe API methods** for all backend endpoints
- **Automatic JWT token management** (separate for admin and driver sessions)
- **Request/response interceptors** for authentication and error handling
- **Automatic token refresh** and redirect to login on 401 errors
- **TypeScript interfaces** matching the OpenAPI specification

### React Hooks (`src/hooks/`)

Custom hooks for data fetching with built-in loading/error states:

- `use-drivers.ts` - Driver management hooks
- `use-vehicles.ts` - Vehicle management hooks
- `use-schedules.ts` - Schedule management hooks
- `use-assets.ts` - Asset/inventory management hooks
- `use-settings.ts` - System settings hooks

Each hook provides:
- Automatic data fetching on mount
- Loading and error states
- `refetch()` function for manual refresh

### Type Converters (`src/lib/api/converters.ts`)

Utility functions to convert between:
- Backend API response types (snake_case, number IDs, ISO date strings)
- Frontend types (camelCase, string IDs, Date objects)

This maintains compatibility with existing frontend code while integrating with the backend.

## Authentication Flow

### Admin Authentication

1. User enters email/password on `/login` page
2. `apiClient.adminLogin()` called → `POST /api/v1/auth/login`
3. JWT token stored in `localStorage` with key `admin_token`
4. Token automatically added to all subsequent requests via interceptor
5. On 401 error, token cleared and user redirected to `/login`

### Driver Authentication

1. Driver enters Amazon ID/password on `/driver-login` page
2. `apiClient.driverLogin()` called → `POST /api/v1/auth/driver-login`
3. JWT token stored in `sessionStorage` with key `driver_token`
4. Token automatically added to all subsequent requests
5. On 401 error, token cleared and driver redirected to `/driver-login`

## API Endpoints Integrated

### Authentication
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/driver-login` - Driver login

### Users
- `GET /api/v1/users/` - List all users
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users/` - Create new user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Drivers
- `GET /api/v1/drivers/` - List all drivers
- `GET /api/v1/drivers/{id}` - Get driver by ID
- `POST /api/v1/drivers/` - Create new driver
- `PUT /api/v1/drivers/{id}` - Update driver
- `DELETE /api/v1/drivers/{id}` - Delete driver

### Driver Documents
- `GET /api/v1/drivers/{id}/documents` - Get driver documents
- `POST /api/v1/drivers/{id}/documents` - Create document record
- `POST /api/v1/drivers/{id}/documents/{doc_id}/upload` - Upload document file
- `DELETE /api/v1/drivers/{id}/documents/{doc_id}` - Delete document

### Vehicles
- `GET /api/v1/vehicles/` - List all vehicles
- `GET /api/v1/vehicles/{id}` - Get vehicle by ID
- `POST /api/v1/vehicles/` - Create new vehicle
- `PUT /api/v1/vehicles/{id}` - Update vehicle
- `DELETE /api/v1/vehicles/{id}` - Delete vehicle

### Vehicle Inspections
- `GET /api/v1/vehicles/{id}/inspections` - Get vehicle inspections
- `POST /api/v1/vehicles/inspections` - Create inspection
- `POST /api/v1/vehicles/inspections/{id}/photos` - Upload photos
- `POST /api/v1/vehicles/inspections/{id}/review` - Admin review

### Schedules
- `GET /api/v1/schedules/` - List schedules (with date filtering)
- `GET /api/v1/schedules/{id}` - Get schedule by ID
- `POST /api/v1/schedules/` - Create schedule
- `PUT /api/v1/schedules/{id}` - Update schedule
- `DELETE /api/v1/schedules/{id}` - Delete schedule
- `POST /api/v1/schedules/{id}/assign-vehicle` - Assign vehicle
- `POST /api/v1/schedules/{id}/send-sms` - Send SMS notification
- `POST /api/v1/schedules/sync-deputy` - Sync with Deputy

### Assets
- `GET /api/v1/assets/` - List all assets
- `GET /api/v1/assets/{id}` - Get asset by ID
- `POST /api/v1/assets/` - Create asset
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset

### Borrow Records
- `GET /api/v1/assets/borrow-records` - List borrow records
- `POST /api/v1/assets/borrow-records` - Create borrow record
- `POST /api/v1/assets/borrow-records/{id}/return` - Return items

### Settings
- `GET /api/v1/settings/` - Get system settings
- `PUT /api/v1/settings/` - Update system settings

### SMS History
- `GET /api/v1/sms/history` - Get SMS history (with filtering)

## Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For production, update this to your production API URL.

## Usage Examples

### Using Hooks in Components

```typescript
import { useDrivers } from '@/hooks/use-drivers';

function DriversPage() {
  const { drivers, isLoading, error, refetch } = useDrivers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {drivers.map(driver => (
        <div key={driver.id}>{driver.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Direct API Client Usage

```typescript
import { apiClient } from '@/lib/api/client';

async function createDriver() {
  try {
    const newDriver = await apiClient.createDriver({
      name: 'John Doe',
      amazon_id: 'AMZ-1234',
      phone: '+1234567890',
      email: 'john@example.com',
    });
    console.log('Created:', newDriver);
  } catch (error) {
    console.error('Failed to create driver:', error);
  }
}
```

### File Uploads

```typescript
import { apiClient } from '@/lib/api/client';

async function uploadDocument(driverId: number, documentId: number, file: File) {
  try {
    const result = await apiClient.uploadDriverDocumentFile(
      driverId,
      documentId,
      file
    );
    console.log('Uploaded:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

## Next Steps

The following pages need to be updated to use the API hooks instead of mock data:

1. ✅ `/login` - Admin login (COMPLETED)
2. ✅ `/driver-login` - Driver login (COMPLETED)
3. ⏳ `/drivers` - Driver management (IN PROGRESS)
4. ⏳ `/vehicles` - Vehicle management
5. ⏳ `/` - Schedule calendar
6. ⏳ `/assets` - Asset inventory
7. ⏳ `/settings` - System settings
8. ⏳ `/driver-inspection` - Driver vehicle inspection

## Testing

To test the integration:

1. Ensure the FastAPI backend is running on `http://localhost:8000`
2. Start the Next.js development server: `npm run dev`
3. Navigate to `http://localhost:3000/login`
4. Login with valid credentials from the backend
5. Navigate through the application

## Error Handling

The API client automatically handles:

- **401 Unauthorized**: Clears tokens and redirects to login
- **Network errors**: Propagated to hooks as error state
- **Validation errors**: Returned from backend as error responses

Components should handle error states appropriately:

```typescript
const { data, isLoading, error } = useDrivers();

if (error) {
  // Show error message to user
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive'
  });
}
```

## Token Management

Tokens are managed automatically by the `TokenManager` class:

- Admin tokens: `localStorage.getItem('admin_token')`
- Driver tokens: `sessionStorage.getItem('driver_token')`
- Tokens are automatically included in request headers
- Tokens are cleared on logout or 401 errors

## CORS Configuration

Ensure your FastAPI backend has CORS enabled for the Next.js development server:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
