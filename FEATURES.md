# Feature Enhancement List

> All features verified against [Mylar3 API Documentation](https://github.com/mylar3/mylar3/wiki/API-Documentation)

## High Priority

- [x] **Download History Page** - Add a History page showing recently downloaded comics
  - API: `getHistory` - Returns: Status, DateAdded, Title, URL, FolderName, AlbumID, Size
  - *Implemented: New History page with list/grid views, size formatting, and relative date display*
- [x] **Pull-to-Refresh** - Implement native pull-to-refresh gesture on mobile for all list views
  - Frontend-only (triggers existing refetch)
  - *Implemented: PullToRefresh component added to Layout, enabled on Home, Upcoming, Wanted, History pages*
- [x] **Sorting on Home** - Add sort options (name, date added, recently updated)
  - API: `getIndex` returns Status, DateAdded, LastUpdated - sort client-side
  - *Implemented: Sort by name (A-Z/Z-A), date added (recent/oldest), recently updated*
- [x] **Offline Support** - Cache comic data with service worker for offline viewing
  - Frontend-only (PWA service worker caching)
  - *Implemented: Workbox caching strategies for covers, comic data, and lists; offline indicator component*

## Medium Priority

- [x] **Story Arcs Support** - Add Story Arcs page to browse and manage reading order
  - API: `getStoryArc` (list all), `getStoryArc&id=$arcid` (get issues), `addStoryArc`
  - *Implemented: Story Arcs page with arc list and detail view showing issues in reading order*
- [x] **Read List Page** - Implement reading list view
  - API: `getReadList` - available per wiki
  - *Implemented: Read List page showing user's reading list with issue covers and status*
- [x] **Batch Queue Operations** - Select multiple wanted issues and queue them all at once
  - API: Multiple `queueIssue&id=$issueid` calls (no batch endpoint)
  - *Implemented: useBatchQueueIssues hook using Promise.allSettled for parallel queuing*
- [x] **Comic Statistics Dashboard** - Show collection stats (total issues, downloaded %, by publisher)
  - API: `getIndex` returns HaveTracks/TotalTracks per comic - aggregate client-side
  - *Implemented: Statistics page with collection metrics, progress bars, and publisher chart*
- [x] **Dark/Light Theme Toggle** - Add theme switcher in Settings
  - Frontend-only (CSS variables)
  - *Implemented: Theme toggle in Settings with CSS variables for seamless switching*
- [x] **Search Filters** - Add publisher and year filters to search results
  - API: `findComic` returns publisher, comicyear - filter client-side
  - *Implemented: Filter panel with publisher and year dropdowns on Search page*
- [x] **Infinite Scroll / Pagination** - Handle large comic libraries with lazy loading
  - Frontend-only (virtualization)
  - *Implemented: useInfiniteScroll hook with Intersection Observer for progressive loading*

## Low Priority / Nice-to-Have

- [ ] **Issue Download to Device** - Download comic file (CBR/CBZ) to user's phone/tablet for offline reading
  - API: `downloadIssue&id=$issueid` - streams the file from Mylar server to browser
- [ ] **Comic Description/Synopsis** - Display comic description from ComicVine metadata
  - API: `getComicInfo&id=$comicid` - returns extended metadata
- [ ] **Quick Actions** - Long-press on comic card for context menu (pause, refresh, delete)
  - API: `pauseComic`, `resumeComic`, `refreshComic`, `delComic` - all available
- [ ] **Swipe Gestures** - Swipe left/right on issues to queue/skip
  - API: `queueIssue`, `unqueueIssue` - both available
- [ ] **Calendar View** - Monthly calendar view of upcoming releases
  - API: `getUpcoming` returns IssueDate - render in calendar UI
- [ ] **Publisher Grouping** - Group comics by publisher on Home page
  - API: `getIndex` - publisher data available, group client-side
- [ ] **Change Issue Status** - Manually mark issues as Downloaded/Wanted/Skipped
  - API: `changeStatus` - available per wiki
- [ ] **Recheck Files** - Trigger file recheck for a comic
  - API: `recheckFiles` - available per wiki
- [ ] **Server Management** - Restart/shutdown Mylar from app
  - API: `restart`, `shutdown`, `update` - available (use with caution)
- [ ] **Import/Export Settings** - Backup and restore app configuration
  - Frontend-only (localStorage export)
- [ ] **Multiple Server Profiles** - Support connecting to multiple Mylar instances
  - Frontend-only (config management)

## Branding & PWA

### Navigation Redesign (Option 2: Hybrid Bottom Nav + Hamburger)

- [ ] **Bottom Navigation Bar (Primary)** - Keep bottom nav for 4 most-used pages
  - Home (library)
  - Upcoming (releases)
  - Wanted (missing issues)
  - Search (find new comics)
  - Remove History from bottom nav (move to hamburger)

- [ ] **Hamburger Menu (Secondary Pages)** - Slide-out drawer from left side
  - Triggered by hamburger icon (☰) in header
  - Contains secondary/less-frequent pages:
    - **Activity**: History
    - **Collections**: Story Arcs, Read List
    - **Insights**: Statistics
    - **Settings**: Settings (also keep gear icon in header for quick access)
  - Drawer styling:
    - App logo/branding at top
    - Grouped menu items with section headers
    - Version number at bottom
    - Dark overlay when open
    - Slide animation (left to right)

- [ ] **Header Redesign**
  - Left: Hamburger menu icon (☰)
  - Center: Page title or app logo on home
  - Right: Connection status indicator + Settings gear
  - Remove the current "More" dropdown menu (replaced by hamburger)

### App Icons & Branding

- [ ] **App Icon - Mylar Style** - Create custom app icon matching Mylar3 branding
  - iOS: 180x180 touch icon, 152x152 iPad, 120x120 iPhone retina
  - Android: 192x192 and 512x512 for PWA manifest
  - Favicon: 32x32, 16x16
  - Design: Match Mylar3 logo style (comic book aesthetic, yellow/black colors)
- [ ] **Splash Screens** - Add PWA splash screens for iOS and Android
  - iOS requires multiple sizes for different devices
  - Use apple-touch-startup-image meta tags
- [ ] **Apple Touch Icon** - Proper iOS home screen icon
  - Add apple-touch-icon link in index.html
  - Ensure icon displays correctly when added to home screen
- [ ] **Maskable Icon** - Android adaptive icon support
  - Create icon with safe zone for different Android launchers
  - Add to manifest with purpose: "maskable"

## Technical Improvements

- [ ] **Error Boundary Components** - Add React error boundaries for graceful failure handling
- [ ] **Optimistic Updates** - Immediate UI feedback for mutations before server confirms
- [ ] **Image Lazy Loading** - Implement intersection observer for cover images
- [ ] **Skeleton Loading States** - Improve loading UX with content-aware skeletons
- [ ] **API Response Caching** - Configure stale-while-revalidate caching strategies
- [ ] **TypeScript Migration** - Convert codebase to TypeScript for better type safety
- [ ] **Unit Tests** - Add Jest/Vitest tests for components and hooks
- [ ] **E2E Tests** - Add Playwright tests for critical user flows

## Backend Enhancements

- [ ] **Search in Weekly Pull** - Add text search/filter to weekly pull list endpoint
- [ ] **Statistics Endpoint** - Aggregate stats from mylar.db (total comics, issues by status)
- [ ] **Database Connection Pooling** - Reuse SQLite connections for better performance
- [ ] **Logs Viewer** - Display Mylar logs in app
  - API: `getLogs`, `clearLogs` - available per wiki

## Not Feasible with Current API

- ~~Push Notifications~~ - No webhook/push support in Mylar API
- ~~Issue Download Progress~~ - No progress tracking endpoint
- ~~Reading Progress Tracker~~ - No read status in Mylar API
- ~~WebSocket Updates~~ - Mylar doesn't support WebSockets
