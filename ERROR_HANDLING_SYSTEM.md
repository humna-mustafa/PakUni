# 🛡️ PakUni Error Handling & Reporting System

A beautiful, user-friendly error handling system that transforms errors from scary technical messages into friendly, actionable notifications.

## ✨ Features

### For Users
- **Beautiful Error Toasts**: Animated, color-coded notifications that don't scare users
- **Friendly Messages**: Technical errors translated into simple language
- **One-Tap Reporting**: Easy "Report Issue" button on every error
- **Retry Actions**: Quick retry button for recoverable errors
- **Offline Support**: Errors queued when offline, synced when back online

### For Admins
- **Error Dashboard**: View all reported errors in one place
- **Priority Filters**: Filter by severity (Critical, High, Medium, Low)
- **Status Tracking**: Track errors through New → Acknowledged → Investigating → Resolved
- **User Context**: See device info, app version, user details
- **Quick Actions**: Acknowledge, resolve, or dismiss errors with one tap

---

## 📦 Components Created

### 1. Error Reporting Service
**File**: `src/services/errorReporting.ts`

Central service for error handling and admin reporting.

```typescript
import { errorReportingService, ErrorCategory, ErrorSeverity } from '../services';

// Report an error with automatic categorization
await errorReportingService.reportError(error, {
  screen: 'HomeScreen',
  action: 'loadData',
  component: 'UniversityList'
});

// Get user-friendly message
const friendlyMessage = errorReportingService.formatUserFriendlyError(error);
// "Network connection problem" instead of "TypeError: Failed to fetch"

// Add user feedback to existing report
await errorReportingService.submitUserFeedback(reportId, {
  description: 'App crashed when I clicked the button',
  contactEmail: 'user@example.com'
});
```

**Error Categories:**
- `network` - Connection issues
- `authentication` - Login/session problems
- `server` - API/backend errors
- `validation` - Input validation failures
- `permission` - Access denied errors
- `unknown` - Uncategorized errors

**Severity Levels:**
- `critical` - App crashes, data loss
- `high` - Major feature broken
- `medium` - Feature partially working
- `low` - Minor UI issues

---

### 2. Enhanced Error Toast
**File**: `src/components/EnhancedErrorToast.tsx`

Beautiful toast notifications with report functionality.

```typescript
import { ErrorToastProvider, useErrorToast } from '../components';

// Wrap your app
<ErrorToastProvider>
  <App />
</ErrorToastProvider>

// In your component
const { showError, showNetworkError, showAuthError } = useErrorToast();

// Show error with automatic categorization
showError(error, {
  title: 'Oops!',
  allowReport: true,
  onRetry: () => refetchData()
});

// Specialized error toasts
showNetworkError('Please check your connection');
showAuthError('Please log in again');
```

**Toast Features:**
- 🎨 Color-coded by severity
- 📳 Haptic feedback
- 🔄 Retry button for recoverable errors
- 📝 "Report Issue" button
- ⏱️ Auto-dismiss with progress bar
- 🌊 Animated slide-in/out

---

### 3. Error Handler Hook
**File**: `src/hooks/useErrorHandler.ts`

Centralized hook for consistent error handling.

```typescript
import { ErrorHandlerProvider, useErrorHandler, useAsyncHandler } from '../hooks';

// Wrap your app (after ErrorToastProvider)
<ErrorHandlerProvider>
  <App />
</ErrorHandlerProvider>

// Basic usage
const { handleError, handleSilentError, withErrorHandling } = useErrorHandler();

try {
  await riskyOperation();
} catch (error) {
  handleError(error, {
    context: { screen: 'MyScreen' },
    showToast: true
  });
}

// Async handler with automatic error handling
const { execute, loading, error } = useAsyncHandler(async () => {
  return await api.fetchData();
}, {
  onSuccess: (data) => console.log('Got data:', data),
  showLoadingToast: true
});

// Wrap any async function
const safeFetch = withErrorHandling(fetchUserData, {
  context: { action: 'fetchUser' }
});
await safeFetch(userId);
```

---

### 4. Admin Error Reports Screen
**File**: `src/screens/admin/AdminErrorReportsScreen.tsx`

Full-featured admin dashboard for managing error reports.

**Features:**
- 📊 Error statistics overview
- 🔍 Filter by status and severity
- 📋 Detailed error view with stack trace
- ✅ Quick status actions
- 📱 Device & environment info
- 🗑️ Delete old reports
- 📋 Copy stack trace to clipboard

**Navigation:**
Access from Admin Dashboard → Error Reports

---

## 🗄️ Database Setup

### Migration File
**File**: `supabase/migrations/20260116150000_error_reports.sql`

Run this migration to create the `error_reports` table:

```sql
-- The migration creates:
-- - error_reports table with all necessary columns
-- - Indexes for common queries
-- - RLS policies for security
-- - Updated_at trigger
```

### Required Supabase Tables
- `error_reports` - Stores all reported errors
- `profiles` - Existing user profiles table (for RLS)

---

## 🎯 Usage Patterns

### Pattern 1: Component-Level Error Handling
```typescript
function MyComponent() {
  const { handleError } = useErrorHandler();
  
  const loadData = async () => {
    try {
      const data = await api.getData();
      setData(data);
    } catch (error) {
      handleError(error, {
        context: { screen: 'MyComponent', action: 'loadData' },
        onRetry: loadData
      });
    }
  };
}
```

### Pattern 2: API Call Wrapper
```typescript
const { execute, loading } = useAsyncHandler(
  () => api.submitForm(formData),
  {
    context: { action: 'submitForm' },
    onSuccess: () => navigation.goBack(),
    onError: (error) => setFormError(error.message)
  }
);
```

### Pattern 3: Silent Background Error Logging
```typescript
// For non-critical errors you want to track but not show to users
const { handleSilentError } = useErrorHandler();

try {
  await analytics.track('event');
} catch (error) {
  // Logs to admin but doesn't bother the user
  handleSilentError(error, { context: { action: 'analytics' } });
}
```

---

## 🔧 Configuration

### Error Messages Customization
Edit `ERROR_MESSAGES` in `src/services/errorReporting.ts`:

```typescript
const ERROR_MESSAGES = {
  network: {
    title: 'Connection Issue',
    message: 'Please check your internet connection.',
    icon: 'wifi-off',
  },
  // Add more...
};
```

### Toast Appearance
Customize colors in `src/components/EnhancedErrorToast.tsx`:

```typescript
const SEVERITY_COLORS = {
  critical: { bg: '#DC2626', icon: 'alert-circle' },
  high: { bg: '#F97316', icon: 'warning' },
  // ...
};
```

---

## 📱 Screenshots

### Error Toast (User View)
```
┌────────────────────────────────┐
│ ⚠️  Connection Problem         │
│                                │
│ Please check your internet     │
│ connection and try again.      │
│                                │
│ [🔄 Retry]  [📝 Report Issue] │
└────────────────────────────────┘
```

### Admin Error Reports
```
┌────────────────────────────────┐
│ 📊 Error Reports               │
│ ─────────────────────────────  │
│ Total: 47  New: 12  Critical: 3│
│                                │
│ [All] [New] [Critical] [High]  │
│                                │
│ ┌──────────────────────────┐   │
│ │🔴 NetworkError           │   │
│ │   Failed to fetch...     │   │
│ │   📱 iOS 17.0 • 2h ago   │   │
│ │   [Acknowledge] [Resolve]│   │
│ └──────────────────────────┘   │
└────────────────────────────────┘
```

---

## 🚀 Quick Start

1. **Apply Database Migration**
   ```bash
   supabase migration up
   ```

2. **Wrap App with Providers**
   ```typescript
   <ErrorToastProvider>
     <ErrorHandlerProvider>
       <App />
     </ErrorHandlerProvider>
   </ErrorToastProvider>
   ```

3. **Use in Components**
   ```typescript
   const { handleError } = useErrorHandler();
   // Now all errors are automatically handled beautifully!
   ```

---

## 📁 File Structure

```
src/
├── services/
│   └── errorReporting.ts      # Core error service
├── components/
│   └── EnhancedErrorToast.tsx # Beautiful toast component
├── hooks/
│   └── useErrorHandler.ts     # Centralized error hook
├── screens/admin/
│   └── AdminErrorReportsScreen.tsx  # Admin dashboard
│
supabase/migrations/
└── 20260116150000_error_reports.sql  # Database migration
```

---

## ✅ Checklist

- [x] Error Reporting Service with Supabase integration
- [x] Beautiful Enhanced Error Toast with animations
- [x] useErrorHandler hook for consistent handling
- [x] Admin Error Reports Screen with filters
- [x] Navigation integration
- [x] Database migration for error_reports table
- [x] Component exports
- [x] Documentation

---

**Made with ❤️ for PakUni**
