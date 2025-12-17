# Feature Enhancement List

> All features verified against [Mylar3 API Documentation](https://github.com/mylar3/mylar3/wiki/API-Documentation)

## High Priority

- [x] **Download History Page** - Add a History page showing recently downloaded comics
  - API: `getHistory` - Returns: Status, DateAdded, Title, URL, FolderName, AlbumID, Size
  - *Implemented: New History page with list/grid views, size formatting, and relative date display*
- [x] **Pull-to-Refresh** - Implement native pull-to-refresh gesture on mobile for all list views
  - Frontend-only (triggers existing refetch)
  - *Implemented: PullToRefresh component added to Layout, enabled on Home, Upcoming, Wanted, History pages*
- [x] **Sorting & Filtering on Home** - Add sort options (name, date added, status) and filters (Active, Paused, Ended)
  - API: `getIndex` returns Status, DateAdded - filter/sort client-side
  - *Implemented: Sort by name, date added, recently updated; Filter by Active/Paused/Ended status*
- [x] **Issue Cover Images** - Display individual issue cover art in IssueList
  - API: `getArt&id=$issueId` - works for both comic and issue IDs
  - *Implemented: Issue covers with fallback to comic cover, loading states, error handling*
- [x] **Offline Support** - Cache comic data with service worker for offline viewing
  - Frontend-only (PWA service worker caching)
  - *Implemented: Workbox caching strategies for covers, comic data, and lists; offline indicator component*

## Medium Priority

- [ ] **Story Arcs Support** - Add Story Arcs page to browse and manage reading order
  - API: `getStoryArc` (list all), `getStoryArc&id=$arcid` (get issues), `addStoryArc`
- [ ] **Read List Page** - Implement reading list view
  - API: `getReadList` - available per wiki
- [ ] **Batch Queue Operations** - Select multiple wanted issues and queue them all at once
  - API: Multiple `queueIssue&id=$issueid` calls (no batch endpoint)
- [ ] **Comic Statistics Dashboard** - Show collection stats (total issues, downloaded %, by publisher)
  - API: `getIndex` returns HaveTracks/TotalTracks per comic - aggregate client-side
- [ ] **Dark/Light Theme Toggle** - Add theme switcher in Settings
  - Frontend-only (CSS variables)
- [ ] **Search Filters** - Add publisher and year filters to search results
  - API: `findComic` returns publisher, comicyear - filter client-side
- [ ] **Infinite Scroll / Pagination** - Handle large comic libraries with lazy loading
  - Frontend-only (virtualization)

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
