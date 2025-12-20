# PWA Update Strategy

This document explains how automatic updates work in Mylar Mobile.

## How It Works

### 1. Version Management
- **Package Version**: `package.json` → `"version": "1.1.0"`
- **Manifest Version**: `vite.config.js` → `manifest.version: "1.1.0"`
- Both should be updated together when releasing new versions

### 2. Update Detection
The PWA automatically checks for updates in these scenarios:
- **On App Launch**: When the user opens the app
- **Every Hour**: Background check while app is running
- **On Navigation**: When service worker detects new content

### 3. Update Notification
When an update is detected:
1. A blue notification banner appears at the bottom of the screen
2. User can choose:
   - **"Reload Now"**: Immediately updates to new version
   - **"Later"**: Dismisses notification, update will apply on next launch
   - **"X"**: Dismiss notification

### 4. Update Process
```
1. User visits app
2. Service Worker checks for new version
3. If new version found:
   - Download new assets in background
   - Show update prompt
   - Wait for user action
4. On "Reload Now":
   - Activate new service worker
   - Refresh page
   - User sees new version
```

## For iPhone Users

### Clearing Cache (Manual Method)
If the auto-update doesn't work, users can manually update:

**Method 1: Delete and Re-add PWA**
1. Long-press the MylarMobile app icon
2. Tap "Remove App" → "Delete App"
3. Open Safari and navigate to your Mylar server
4. Tap Share button → "Add to Home Screen"

**Method 2: Clear Safari Data**
1. Settings → Safari → Advanced → Website Data
2. Find your Mylar server domain
3. Swipe left → Delete
4. Re-open the PWA

## Release Checklist

When releasing a new version:

1. **Update Version Numbers**
   ```bash
   # Update package.json version
   npm version patch  # or minor/major
   ```

2. **Update Manifest Version**
   - Edit `vite.config.js`
   - Update `manifest.version` to match package.json

3. **Build and Deploy**
   ```bash
   npm run build
   # Deploy dist/ folder to server
   ```

4. **Verify Update Mechanism**
   - Open app in browser
   - Open DevTools → Application → Service Workers
   - Click "Update" to test update flow

## Technical Details

### Service Worker Configuration
```javascript
VitePWA({
  registerType: 'prompt',        // Show update prompt to user
  injectRegister: 'auto',        // Auto-register service worker
  manifest: {
    version: '1.1.0',            // Version in manifest
  },
})
```

### Update Component
- **File**: `src/components/common/PWAUpdatePrompt.jsx`
- **Hook**: `useRegisterSW` from `virtual:pwa-register/react`
- **Auto-check**: Every 60 minutes
- **UI**: Material-style notification with action buttons

### Cache Strategy
- **App Shell**: Pre-cached on install
- **Comic Covers**: Cache-first (30 days)
- **Comic Data**: Stale-while-revalidate (1 day)
- **Lists**: Network-first with fallback (1 hour)

## Troubleshooting

### Update Not Showing
1. Hard refresh in browser (Cmd+Shift+R / Ctrl+Shift+F5)
2. Check service worker in DevTools
3. Unregister old service worker manually
4. Verify version numbers match in code

### Update Loop
1. Check for console errors
2. Verify service worker is registered
3. Check network tab for failed requests
4. Clear all caches and re-install

### Version Mismatch
If users report seeing old version:
1. Increment version number
2. Clear browser cache
3. Verify build includes new assets
4. Check server cache headers
