# Authentication Context Documentation

## Overview

This directory contains React Context providers that manage global application state. The primary context here is the Authentication Context, which handles user authentication, session management, and route protection throughout the application.

## Files

### `auth-context.tsx`

The Authentication Context provides centralized authentication state management for the entire application using React's Context API.

## What It Does

### 1. **User Authentication State Management**

The context maintains the current user's authentication state, including:
- User ID, name, email
- User role (0 = Admin, 1 = Manager)
- Loading state during authentication checks

### 2. **Login Functionality**

Handles the complete login flow:
```typescript
login(email: string, password: string)
```

**Process:**
1. Calls the API client's `adminLogin` method
2. Receives JWT access token and user data
3. Stores user data in both:
   - Component state (for React reactivity)
   - localStorage (for persistence across page refreshes)
4. Logs authentication details to console for debugging
5. Handles and propagates errors if login fails

### 3. **Logout Functionality**

Handles the logout process:
```typescript
logout()
```

**Process:**
1. Clears user state
2. Removes user data from localStorage
3. Calls API client's logout method to clear tokens
4. Redirects user to login page

### 4. **Route Protection**

Automatically manages route access based on authentication state:

**Protected Routes:**
- All routes except `/login`, `/driver-login`, and `/driver-inspection` require authentication
- Unauthenticated users are automatically redirected to `/login`

**Public Routes:**
- `/login` - Admin/Manager login page
- `/driver-login` - Driver login page
- `/driver-inspection` - Driver inspection page (for field workers)

**Smart Redirects:**
- Authenticated users attempting to access `/login` are redirected to `/` (dashboard)
- This prevents logged-in users from seeing the login page again

### 5. **Session Persistence**

On application mount:
1. Checks localStorage for existing user data
2. Automatically restores user session if valid data exists
3. Maintains user login across page refreshes

## Why It's Built This Way

### **Centralized State Management**

**Why:**
- Single source of truth for authentication state
- Prevents prop drilling through multiple component levels
- Any component can access auth state using `useAuth()` hook

**Example:**
```typescript
function MyComponent() {
  const { user, logout } = useAuth();
  // Access user data and auth functions anywhere
}
```

### **Context API Instead of Props**

**Why:**
- Authentication state is needed throughout the app (navbar, sidebar, protected routes, etc.)
- Passing props through every component would be inefficient
- Context provides clean, direct access to auth state

### **localStorage for Persistence**

**Why:**
- Maintains user session across page refreshes
- Prevents requiring re-login on every page load
- JWT tokens are managed by API client, user data stored separately

**Security Note:**
- Only non-sensitive user data stored (name, email, role)
- Actual JWT tokens handled by API client with secure httpOnly cookies

### **Automatic Route Protection**

**Why:**
- Prevents manual protection in each page component
- Centralized security logic - easier to maintain
- Consistent behavior across all protected routes

**Without Context:**
```typescript
// Every page would need this
function MyPage() {
  const router = useRouter();
  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);
}
```

**With Context:**
- Protection happens automatically
- Pages only contain business logic

### **Multiple Public Routes**

The system supports three public routes for different user types:

1. **`/login`** - Admin and Manager users
   - Access to full system dashboard
   - User management, reporting, etc.

2. **`/driver-login`** - Driver authentication
   - Drivers use separate login flow
   - May have different auth requirements

3. **`/driver-inspection`** - Field inspection interface
   - Allows drivers to submit inspection data
   - May work with or without authentication (depends on implementation)

**Why separate routes:**
- Different user roles have different UX requirements
- Drivers need simplified, mobile-friendly interface
- Separation of concerns for security

### **Role-Based Access**

User roles are stored and can be used for authorization:

```typescript
interface User {
  role: 0 | 1; // 0 = Admin, 1 = Manager
}
```

**Why:**
- Different permission levels for system features
- Admins can manage users, Managers cannot
- Extensible for future role additions

## Usage

### Setup (App Level)

Wrap your application with the `AuthProvider`:

```typescript
// layout.tsx or _app.tsx
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### In Components

Use the `useAuth` hook to access authentication:

```typescript
import { useAuth } from '@/contexts/auth-context';

function Header() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Conditional Rendering by Role

```typescript
function AdminPanel() {
  const { user } = useAuth();

  if (user?.role !== 0) {
    return <p>Admin access only</p>;
  }

  return <div>Admin controls...</div>;
}
```

## Security Considerations

### What's Protected

✅ All routes automatically protected (except public routes)
✅ User data validated on login
✅ Session cleared on logout
✅ Tokens managed by API client

### What's NOT in Context

❌ JWT tokens (handled by API client with httpOnly cookies)
❌ Passwords (never stored client-side)
❌ Sensitive user data

### Best Practices

1. **Never store sensitive data** - Only store user identification info
2. **Token refresh** - API client handles token management
3. **Secure logout** - Always clear both state and localStorage
4. **Route protection** - Handled automatically by context

## Flow Diagrams

### Login Flow
```
User enters credentials
      ↓
AuthContext.login()
      ↓
API call to /auth/admin/login
      ↓
Receive token + user data
      ↓
Store in state + localStorage
      ↓
Redirect to dashboard
```

### App Initialization Flow
```
App loads
      ↓
Check localStorage for user
      ↓
Found? → Restore session → Allow access
      ↓
Not found? → Check current route
      ↓
Public route? → Allow access
Protected route? → Redirect to /login
```

### Logout Flow
```
User clicks logout
      ↓
Clear user state
      ↓
Clear localStorage
      ↓
API client clears tokens
      ↓
Redirect to /login
```

## Debugging

The login function includes console logging for development:

```typescript
console.group('🔐 Login Successful');
console.log('User Info:', userData);
console.log('Token:', response.access_token);
console.log('Token Expires At:', tokenExpiration);
console.groupEnd();
```

**What to check:**
- User data structure matches expected format
- Token expiration is reasonable (not already expired)
- Role value is correct (0 or 1)

## Future Enhancements

Potential improvements:

1. **Token Refresh Logic** - Automatic token renewal before expiration
2. **Permission System** - More granular than just roles
3. **Multi-factor Authentication** - Additional security layer
4. **Session Timeout** - Auto-logout after inactivity
5. **Remember Me** - Extended session option

## Related Files

- `/lib/api/client.ts` - API client handling actual HTTP requests and token storage
- `/app/login/page.tsx` - Login page UI
- `/app/driver-login/page.tsx` - Driver login page
- `/hooks/use-auth.ts` - (if exists) Additional auth utilities

## Common Issues

### Issue: User logged out on refresh
**Cause:** localStorage not being read properly
**Fix:** Check browser console for errors, verify localStorage permissions

### Issue: Redirect loop
**Cause:** Route protection logic conflicting
**Fix:** Verify public routes array includes all necessary paths

### Issue: Role not working
**Cause:** Role value not matching expected type
**Fix:** Ensure API returns role as number (0 or 1), not string

## Summary

The Authentication Context is the backbone of the application's security and user management. It provides:

- ✅ Centralized auth state
- ✅ Automatic route protection
- ✅ Session persistence
- ✅ Clean API for components
- ✅ Type-safe user data
- ✅ Role-based access control

By using React Context, the entire application has consistent, maintainable access to authentication state without prop drilling or redundant code.
