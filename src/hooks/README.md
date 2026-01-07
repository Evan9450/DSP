# Custom React Hooks Documentation

## Overview

This directory contains custom React hooks that provide a clean, reusable interface for data fetching and state management throughout the application. These hooks abstract away the complexity of API calls, loading states, and error handling, making components cleaner and more maintainable.

## Architecture Pattern

All data-fetching hooks in this directory follow a consistent pattern:

```typescript
function useResource() {
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.getData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dependencies]);

  return { data, isLoading, error, refetch: fetchData };
}
```

## Why This Pattern?

### 1. **Consistent Developer Experience**
Every hook returns the same structure: `{ data, isLoading, error, refetch }`, making them predictable and easy to use.

### 2. **Separation of Concerns**
Components don't need to know about:
- API endpoints
- Error handling logic
- Loading state management
- Data transformation

### 3. **Reusability**
The same hook can be used in multiple components without duplicating logic.

### 4. **Type Safety**
All hooks use TypeScript generics to provide type-safe data access.

---

## Hooks Reference

### 1. `use-drivers.ts`

Manages driver-related data fetching.

#### `useDrivers()`

Fetches all drivers in the system.

```typescript
const { drivers, isLoading, error, refetch } = useDrivers();
```

**Returns:**
- `drivers: DriverResponse[]` - Array of all drivers
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error if fetch failed
- `refetch: () => Promise<void>` - Manually trigger refetch

**Use case:**
- Driver list page
- Driver selection dropdowns
- Dashboard driver statistics

#### `useDriver(driverId)`

Fetches a single driver's details.

```typescript
const { driver, isLoading, error, refetch } = useDriver(123);
```

**Parameters:**
- `driverId: number | null` - Driver ID to fetch (null skips fetch)

**Returns:**
- `driver: DriverResponse | null` - Driver details or null

**Why null check?**
- Allows conditional fetching
- Useful when driverId comes from route params that might not be ready
- Prevents unnecessary API calls

**Use case:**
- Driver detail page
- Driver profile display
- Editing driver information

#### `useDriverDocuments(driverId)`

Fetches documents associated with a driver (licenses, certifications, etc.).

```typescript
const { documents, isLoading, error, refetch } = useDriverDocuments(123);
```

**Parameters:**
- `driverId: number | null` - Driver ID

**Returns:**
- `documents: DriverDocumentResponse[]` - Array of driver documents

**Use case:**
- Driver document management
- Compliance checking
- Document expiration alerts

---

### 2. `use-schedules.ts`

Manages schedule data with flexible filtering options.

#### `useSchedules(params?)`

Fetches schedules, optionally filtered by date, driver, or status.

```typescript
// All schedules
const { schedules, isLoading, error, refetch } = useSchedules();

// Schedules for a specific date
const { schedules } = useSchedules({ schedule_date: '2024-01-01' });

// Schedules for a specific driver
const { schedules } = useSchedules({ deputy_id: '123' });

// With auto-sync enabled
const { schedules } = useSchedules({
  schedule_date: '2024-01-01',
  auto_sync: true
});
```

**Parameters:**
- `params?: object` - Optional filter parameters
  - `schedule_date?: string` - Date in YYYY-MM-DD format
  - `deputy_id?: string` - Filter by Deputy employee ID
  - `checkin_status?: string` - Filter by check-in status
  - `auto_sync?: boolean` - Auto-sync from Deputy if no data found

**Returns:**
- `schedules: ScheduleResponse[]` - Array of schedules

**Note:**
- New API only supports single date filter, not date ranges
- React automatically refetches when params change

**Use case:**
- Schedule calendar view (single date)
- Driver assignments for a specific date
- Daily schedule planning

#### `useSchedule(scheduleId)`

Fetches a single schedule's details.

```typescript
const { schedule, isLoading, error, refetch } = useSchedule(456);
```

**Parameters:**
- `scheduleId: number | null` - Schedule ID to fetch

**Returns:**
- `schedule: ScheduleResponse | null` - Schedule details

**Use case:**
- Schedule detail view
- Editing a specific schedule
- Viewing assignment details

---

### 3. `use-vehicles.ts`

Manages vehicle data and inspections.

#### `useVehicles()`

Fetches all vehicles with automatic sorting.

```typescript
const { vehicles, isLoading, error, refetch } = useVehicles();
```

**Returns:**
- `vehicles: VehicleResponse[]` - Array of vehicles sorted by ID

**Why sorting?**
- Ensures consistent display order
- Prevents UI jumping when data updates
- Makes vehicle selection predictable

**Special behavior:**
```typescript
// Sort by ID to maintain consistent order
const sortedData = [...data].sort((a, b) => a.id - b.id);
```

**Use case:**
- Vehicle list page
- Vehicle selection dropdowns
- Fleet overview dashboard

#### `useVehicle(vehicleId)`

Fetches a single vehicle's details.

```typescript
const { vehicle, isLoading, error, refetch } = useVehicle(789);
```

**Parameters:**
- `vehicleId: number | null` - Vehicle ID to fetch

**Returns:**
- `vehicle: VehicleResponse | null` - Vehicle details

**Use case:**
- Vehicle detail page
- Editing vehicle information
- Maintenance record display

#### `useVehicleInspections(vehicleId)`

Fetches all inspections for a specific vehicle.

```typescript
const { inspections, isLoading, error, refetch } = useVehicleInspections(789);
```

**Parameters:**
- `vehicleId: number | null` - Vehicle ID

**Returns:**
- `inspections: VehicleInspectionResponse[]` - Array of vehicle inspections

**Use case:**
- Vehicle inspection history
- Maintenance compliance tracking
- Inspection detail view

---

### 4. `use-inspections.ts`

Manages inspection queries with flexible filtering.

#### `useInspections(params?)`

Fetches inspections with multiple filter options.

```typescript
// All inspections
const { inspections } = useInspections();

// Inspections for a specific vehicle
const { inspections } = useInspections({ vehicleId: 123 });

// Inspections for a specific date
const { inspections } = useInspections({
  inspectionDate: '2024-01-15'
});

// Unreviewed inspections for a driver
const { inspections } = useInspections({
  driverId: 456,
  reviewed: false
});
```

**Parameters:**
- `params?: UseInspectionsParams`
  - `vehicleId?: number` - Filter by vehicle
  - `driverId?: number` - Filter by driver
  - `reviewed?: boolean` - Filter by review status
  - `inspectionDate?: string` - Filter by date (YYYY-MM-DD)

**Returns:**
- `inspections: VehicleInspectionResponse[]` - Filtered inspections

**Why flexible filtering?**
- Single hook serves multiple use cases
- Prevents creating multiple similar hooks
- Parameters are reactive - changing them triggers refetch

**Special behavior:**
```typescript
// Client-side filtering for inspection date
if (params?.inspectionDate) {
  filteredData = data.filter(
    (inspection) => inspection.inspection_date === params.inspectionDate
  );
}
```

**Use case:**
- Inspection dashboard
- Daily inspection reports
- Driver inspection history
- Pending review queue

---

### 5. `use-assets.ts`

Manages asset and borrow record data.

#### `useAssets()`

Fetches all company assets (tools, equipment, etc.).

```typescript
const { assets, isLoading, error, refetch } = useAssets();
```

**Returns:**
- `assets: AssetResponse[]` - Array of all assets

**Use case:**
- Asset inventory page
- Asset assignment interface
- Asset availability checking

#### `useAsset(assetId)`

Fetches a single asset's details.

```typescript
const { asset, isLoading, error, refetch } = useAsset(101);
```

**Parameters:**
- `assetId: number | null` - Asset ID to fetch

**Returns:**
- `asset: AssetResponse | null` - Asset details

**Use case:**
- Asset detail page
- Editing asset information
- Asset history view

#### `useBorrowRecords(assetId?, driverId?)`

Fetches borrow/return records for assets.

```typescript
// All borrow records
const { records } = useBorrowRecords();

// Records for a specific asset
const { records } = useBorrowRecords(101);

// Records for a specific driver
const { records } = useBorrowRecords(undefined, 456);

// Records for specific asset and driver
const { records } = useBorrowRecords(101, 456);
```

**Parameters:**
- `assetId?: number` - Filter by asset
- `driverId?: number` - Filter by driver

**Returns:**
- `records: BorrowRecordResponse[]` - Borrow/return records

**Use case:**
- Asset checkout history
- Driver's borrowed items list
- Overdue asset tracking

---

### 6. `use-dashboard.ts`

Provides dashboard-specific data aggregations.

#### `useDashboardStats()`

Fetches aggregated statistics for the dashboard.

```typescript
const { stats, isLoading, error, refetch } = useDashboardStats();
```

**Returns:**
- `stats: DashboardStatsResponse | null` - Dashboard statistics

**Typical stats include:**
- Total vehicles, drivers, active schedules
- Pending inspections count
- Asset utilization rates
- System-wide metrics

**Use case:**
- Main dashboard page
- Executive summary view
- Quick overview metrics

#### `useDashboardAlerts()`

Fetches system alerts and notifications.

```typescript
const { alerts, isLoading, error, refetch } = useDashboardAlerts();
```

**Returns:**
- `alerts: DashboardAlertsResponse | null` - System alerts

**Typical alerts include:**
- Expiring driver licenses
- Vehicles due for maintenance
- Overdue inspections
- Critical system notifications

**Use case:**
- Dashboard alert widget
- Notification center
- Action items list

---

### 7. `use-users.ts`

Manages admin/manager user accounts.

#### `useUsers()`

Fetches all system users (admins and managers).

```typescript
const { users, isLoading, error, refetch } = useUsers();
```

**Returns:**
- `users: UserResponse[]` - Array of system users

**Note:**
- Does NOT include drivers (different user type)
- Only admin/manager accounts
- Used for user management interface

**Use case:**
- User management page
- Admin user list
- User role assignment

---

### 8. `use-settings.ts`

Manages system settings and configuration.

#### `useSettings()`

Fetches system-wide settings.

```typescript
const { settings, isLoading, error, refetch } = useSettings();
```

**Returns:**
- `settings: SettingsResponse | null` - System settings

**Use case:**
- Settings page
- Configuration management
- System preferences

---

### 9. `use-toast.ts`

Toast notification system (re-exported from UI components).

```typescript
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const showSuccess = () => {
    toast({
      title: 'Success',
      description: 'Operation completed successfully',
    });
  };

  const showError = () => {
    toast({
      title: 'Error',
      description: 'Something went wrong',
      variant: 'destructive',
    });
  };
}
```

**Why re-export?**
- Centralizes imports
- Easier to swap toast implementation later
- Consistent import path across the app

**Use case:**
- Success/error notifications
- Form submission feedback
- Action confirmations

---

## Common Patterns

### Pattern 1: Conditional Fetching

When you need to fetch data only when a condition is met:

```typescript
function DriverDetail({ driverId }: { driverId: number | null }) {
  const { driver, isLoading } = useDriver(driverId);

  if (!driverId) return <p>No driver selected</p>;
  if (isLoading) return <p>Loading...</p>;

  return <div>{driver?.name}</div>;
}
```

### Pattern 2: Refetching After Mutations

```typescript
function DriverList() {
  const { drivers, refetch } = useDrivers();

  const handleDelete = async (id: number) => {
    await apiClient.deleteDriver(id);
    refetch(); // Refresh the list
  };

  return (
    // ... render drivers with delete buttons
  );
}
```

### Pattern 3: Loading States

```typescript
function VehicleList() {
  const { vehicles, isLoading, error } = useVehicles();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (vehicles.length === 0) return <EmptyState />;

  return <VehicleTable vehicles={vehicles} />;
}
```

### Pattern 4: Combining Multiple Hooks

```typescript
function ScheduleDetail({ scheduleId }: { scheduleId: number }) {
  const { schedule, isLoading: scheduleLoading } = useSchedule(scheduleId);
  const { driver, isLoading: driverLoading } = useDriver(schedule?.driver_id ?? null);
  const { vehicle, isLoading: vehicleLoading } = useVehicle(schedule?.vehicle_id ?? null);

  const isLoading = scheduleLoading || driverLoading || vehicleLoading;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Schedule Details</h1>
      <p>Driver: {driver?.name}</p>
      <p>Vehicle: {vehicle?.rego}</p>
    </div>
  );
}
```

### Pattern 5: Date Filtering

```typescript
function ScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState('2024-01-01');

  const { schedules, isLoading } = useSchedules({
    schedule_date: selectedDate,
    auto_sync: true
  });

  // Automatically refetches when selectedDate changes
  return (
    <div>
      <DatePicker value={selectedDate} onChange={setSelectedDate} />
      <ScheduleList schedules={schedules} />
    </div>
  );
}
```

---

## Error Handling

All hooks implement consistent error handling:

```typescript
try {
  setIsLoading(true);
  const data = await apiClient.getData();
  setData(data);
  setError(null); // Clear previous errors
} catch (err) {
  setError(err as Error);
  console.error('Failed to fetch:', err);
} finally {
  setIsLoading(false);
}
```

**Why this pattern?**

1. **Loading state wraps entire operation**
   - Ensures loading indicator appears/disappears correctly
   - `finally` block guarantees cleanup

2. **Clear previous errors on success**
   - Prevents stale error messages
   - Allows retry patterns to work correctly

3. **Console logging**
   - Helps with debugging in development
   - Can be extended with error tracking services

4. **Type-safe error handling**
   - `err as Error` provides consistent error interface
   - Works with TypeScript strict mode

---

## Automatic Refetching

Hooks automatically refetch when dependencies change:

```typescript
useEffect(() => {
  fetchSchedules();
}, [startDate, endDate]); // Refetch when dates change
```

**Example:**
```typescript
function InspectionReport() {
  const [selectedDate, setSelectedDate] = useState('2024-01-15');

  // Automatically refetches when selectedDate changes
  const { inspections } = useInspections({
    inspectionDate: selectedDate
  });

  return (
    <div>
      <DatePicker
        value={selectedDate}
        onChange={setSelectedDate}
      />
      <InspectionList inspections={inspections} />
    </div>
  );
}
```

---

## Manual Refetching

Use the `refetch` function for manual updates:

```typescript
function DriverManagement() {
  const { drivers, refetch } = useDrivers();

  const handleDriverAdded = async (newDriver) => {
    await apiClient.createDriver(newDriver);
    refetch(); // Reload the list
  };

  return (
    <div>
      <AddDriverForm onSuccess={handleDriverAdded} />
      <DriverList drivers={drivers} />
    </div>
  );
}
```

**When to use refetch:**
- After creating a new resource
- After updating a resource
- After deleting a resource
- When user clicks a "refresh" button
- When coming back to a tab/page after a while

---

## Performance Considerations

### 1. **Prevent Unnecessary Fetches**

```typescript
// ✅ Good - only fetches when ID is valid
const { driver } = useDriver(driverId || null);

// ❌ Bad - would fetch for ID 0, undefined, etc.
const { driver } = useDriver(driverId);
```

### 2. **Dependency Arrays**

```typescript
// ✅ Good - only refetches when these change
useEffect(() => {
  fetchInspections();
}, [params?.vehicleId, params?.driverId]);

// ❌ Bad - refetches on every render
useEffect(() => {
  fetchInspections();
});
```

### 3. **Memoization for Computed Values**

```typescript
function VehicleList() {
  const { vehicles } = useVehicles();

  // ✅ Good - memoize expensive computations
  const availableVehicles = useMemo(
    () => vehicles.filter(v => v.condition === 0),
    [vehicles]
  );

  return <div>{availableVehicles.length} available</div>;
}
```

---

## Testing Hooks

Example test pattern:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useDrivers } from './use-drivers';

jest.mock('@/lib/api/client');

test('useDrivers fetches and returns drivers', async () => {
  const mockDrivers = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];

  apiClient.getDrivers.mockResolvedValue(mockDrivers);

  const { result } = renderHook(() => useDrivers());

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.drivers).toEqual(mockDrivers);
  expect(result.current.error).toBeNull();
});
```

---

## Best Practices

### ✅ Do's

1. **Always handle loading states**
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   ```

2. **Always handle errors**
   ```typescript
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Use null checks for optional IDs**
   ```typescript
   const { driver } = useDriver(driverId ?? null);
   ```

4. **Refetch after mutations**
   ```typescript
   await createDriver(data);
   refetch();
   ```

5. **Use consistent naming**
   ```typescript
   const { drivers, isLoading, error, refetch } = useDrivers();
   ```

### ❌ Don'ts

1. **Don't call hooks conditionally**
   ```typescript
   // ❌ Bad
   if (shouldFetch) {
     const { data } = useDrivers();
   }

   // ✅ Good
   const { drivers } = useDrivers();
   if (!shouldFetch) return null;
   ```

2. **Don't ignore errors**
   ```typescript
   // ❌ Bad
   const { drivers } = useDrivers(); // What if it fails?

   // ✅ Good
   const { drivers, error } = useDrivers();
   if (error) return <ErrorDisplay />;
   ```

3. **Don't fetch unnecessarily**
   ```typescript
   // ❌ Bad - fetches even with invalid ID
   const { driver } = useDriver(undefined);

   // ✅ Good
   const { driver } = useDriver(driverId || null);
   ```

---

## Future Enhancements

Potential improvements to consider:

1. **Caching Layer**
   - Implement React Query or SWR for automatic caching
   - Reduce redundant API calls
   - Share data across components

2. **Optimistic Updates**
   - Update UI immediately before API confirmation
   - Roll back on error
   - Better UX for mutations

3. **Pagination Support**
   - Add page/limit parameters
   - Implement infinite scroll
   - Handle large datasets efficiently

4. **Real-time Updates**
   - WebSocket integration
   - Live data synchronization
   - Automatic refresh on server changes

5. **Request Cancellation**
   - Cancel in-flight requests on unmount
   - Prevent memory leaks
   - Handle race conditions

---

## Summary

The hooks in this directory provide a **clean, consistent, and type-safe** interface for data fetching throughout the application. By following established patterns and conventions, they make components simpler, more maintainable, and easier to test.

**Key benefits:**
- ✅ Consistent API across all data fetching
- ✅ Automatic loading and error state management
- ✅ Type-safe data access
- ✅ Reactive refetching on parameter changes
- ✅ Manual refetch capability
- ✅ Separation of concerns
- ✅ Reusable across components
- ✅ Easy to test and maintain

By using these hooks, components can focus on **presentation logic** while hooks handle **data management**.
