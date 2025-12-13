# Claude Code Prompt: Mylar3 Mobile UI

## Project Overview

Build a mobile-friendly Progressive Web App (PWA) for Mylar3, an automated comic book downloader. The existing Mylar3 web UI is not mobile-optimized, so we need a clean, touch-friendly interface that connects to Mylar3's REST API.

## Tech Stack

- **Framework:** React with Vite
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query) for API caching
- **PWA:** Vite PWA plugin for installability
- **Icons:** Lucide React

## Mylar3 API Reference

Base URL format: `http://{MYLAR_HOST}:{PORT}/api?cmd={endpoint}&apikey={API_KEY}`

**Target Instance:** `http://100.81.70.9:8090/`

Use this as the default/pre-filled value in the settings page. All responses return JSON with `success: true/false` and `data` or `error` fields.

### Core Endpoints

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `getIndex` | List all comics in watchlist | none |
| `getComic` | Get comic details + issues | `id` (ComicVine ID) |
| `getComicInfo` | Get comic metadata | `id` |
| `getIssueInfo` | Get single issue details | `id` (issue ID) |
| `getUpcoming` | Get upcoming releases | none |
| `getWanted` | Get wanted/missing issues | none |
| `getHistory` | Get download history | none |
| `getReadList` | Get reading list | none |
| `getStoryArc` | Get story arc details | `id` |
| `findComic` | Search for comics | `name`, `volume` (optional) |
| `addComic` | Add comic to watchlist | `id` (ComicVine ID) |
| `delComic` | Remove from watchlist | `id` |
| `pauseComic` | Pause monitoring | `id` |
| `resumeComic` | Resume monitoring | `id` |
| `refreshComic` | Refresh comic data | `id` |
| `queueIssue` | Queue issue for download | `id` (issue ID) |
| `unqueueIssue` | Remove from queue | `id` |
| `forceSearch` | Force search for issues | none |
| `getArt` | Get cover art | `id` |
| `getVersion` | Get Mylar version info | none |
| `getLogs` | Get application logs | none |

### Example API Calls

```javascript
// Get all comics
fetch(`${baseUrl}/api?cmd=getIndex&apikey=${apiKey}`)

// Get specific comic with issues
fetch(`${baseUrl}/api?cmd=getComic&id=12345&apikey=${apiKey}`)

// Search for a comic
fetch(`${baseUrl}/api?cmd=findComic&name=Batman&apikey=${apiKey}`)

// Queue an issue for download
fetch(`${baseUrl}/api?cmd=queueIssue&id=67890&apikey=${apiKey}`)
```

## Project Structure

```
mylar-mobile/
├── src/
│   ├── api/
│   │   └── mylar.js              # API client with all endpoints
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── Layout.jsx
│   │   ├── comics/
│   │   │   ├── ComicCard.jsx
│   │   │   ├── ComicList.jsx
│   │   │   ├── ComicDetail.jsx
│   │   │   └── IssueList.jsx
│   │   ├── search/
│   │   │   └── SearchBar.jsx
│   │   └── common/
│   │       ├── Loading.jsx
│   │       └── ErrorMessage.jsx
│   ├── pages/
│   │   ├── Home.jsx              # Comic watchlist
│   │   ├── Upcoming.jsx          # Upcoming releases
│   │   ├── Wanted.jsx            # Missing issues
│   │   ├── Search.jsx            # Add new comics
│   │   ├── ComicDetail.jsx       # Single comic view
│   │   └── Settings.jsx          # Server config
│   ├── hooks/
│   │   └── useMylar.js           # React Query hooks
│   ├── context/
│   │   └── ConfigContext.jsx     # Server URL/API key storage
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── manifest.json
│   └── icons/                    # PWA icons
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Core Features to Implement

### 1. Settings/Configuration (implement first)
- Form to enter Mylar server URL and API key
- Pre-fill URL with `http://100.81.70.9:8090/`
- Store in localStorage
- Test connection button that calls `getVersion`
- Must complete setup before accessing other features

### 2. Home / Watchlist
- Grid of comic covers from `getIndex`
- Pull-to-refresh functionality
- Tap to view comic details
- Visual indicators for status (continuing, paused, ended)

### 3. Comic Detail View
- Cover image, title, year, publisher, status
- List of issues with status (downloaded, wanted, skipped)
- Swipe actions or buttons: queue issue, mark as wanted/skipped
- Refresh button to call `refreshComic`

### 4. Upcoming Page
- List view of upcoming issues from `getUpcoming`
- Grouped by release date
- Quick action to queue for download

### 5. Wanted Page  
- List of missing/wanted issues from `getWanted`
- Queue all or individual issues
- Pull-to-refresh

### 6. Search / Add Comics
- Search input that calls `findComic`
- Results displayed as cards
- Tap to add to watchlist via `addComic`
- Confirmation feedback

### 7. Bottom Navigation
- 4 tabs: Home, Upcoming, Wanted, Search
- Settings accessible via header icon

## UI/UX Requirements

- **Mobile-first:** Design for 375px width minimum
- **Touch targets:** Minimum 44x44px tap areas
- **Dark mode:** Default dark theme (comic readers prefer it)
- **Offline indicator:** Show when server unreachable
- **Loading states:** Skeleton loaders for lists
- **Pull to refresh:** On all list views
- **Swipe gestures:** Optional swipe actions on list items
- **Cover images:** Lazy load with placeholder

## Design System

### Colors (Dark Theme)
```javascript
const colors = {
  bg: {
    primary: '#0f0f0f',
    secondary: '#1a1a1a', 
    tertiary: '#262626'
  },
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    muted: '#666666'
  },
  accent: {
    primary: '#3b82f6',    // Blue
    success: '#22c55e',    // Green  
    warning: '#f59e0b',    // Amber
    danger: '#ef4444'      // Red
  }
}
```

### Status Colors
- **Downloaded:** Green
- **Wanted:** Blue
- **Snatched:** Amber
- **Skipped:** Gray

## API Client Template

```javascript
// src/api/mylar.js
class MylarAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async request(cmd, params = {}) {
    const url = new URL(`${this.baseUrl}/api`);
    url.searchParams.set('cmd', cmd);
    url.searchParams.set('apikey', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data.data;
  }

  // Comics
  getIndex() { return this.request('getIndex'); }
  getComic(id) { return this.request('getComic', { id }); }
  getComicInfo(id) { return this.request('getComicInfo', { id }); }
  addComic(id) { return this.request('addComic', { id }); }
  delComic(id) { return this.request('delComic', { id }); }
  pauseComic(id) { return this.request('pauseComic', { id }); }
  resumeComic(id) { return this.request('resumeComic', { id }); }
  refreshComic(id) { return this.request('refreshComic', { id }); }
  
  // Issues
  getIssueInfo(id) { return this.request('getIssueInfo', { id }); }
  queueIssue(id) { return this.request('queueIssue', { id }); }
  unqueueIssue(id) { return this.request('unqueueIssue', { id }); }
  
  // Lists
  getUpcoming() { return this.request('getUpcoming'); }
  getWanted() { return this.request('getWanted'); }
  getHistory() { return this.request('getHistory'); }
  
  // Search
  findComic(name, volume) { return this.request('findComic', { name, volume }); }
  
  // System
  getVersion() { return this.request('getVersion'); }
  forceSearch() { return this.request('forceSearch'); }
  
  // Cover art URL helper
  getArtUrl(id) {
    return `${this.baseUrl}/api?cmd=getArt&id=${id}&apikey=${this.apiKey}`;
  }
}

export default MylarAPI;
```

## Implementation Order

1. **Project setup:** Vite + React + Tailwind + React Query + React Router
2. **Config context:** localStorage persistence for server settings
3. **Settings page:** Server URL/API key input with connection test
4. **API client:** Complete MylarAPI class
5. **React Query hooks:** useComics, useComic, useUpcoming, useWanted, etc.
6. **Layout components:** Header, BottomNav, Layout wrapper
7. **Home page:** Comic grid with covers
8. **Comic detail page:** Issues list with actions
9. **Upcoming page:** Grouped by date
10. **Wanted page:** Missing issues list
11. **Search page:** Find and add comics
12. **PWA setup:** manifest.json, service worker, icons
13. **Polish:** Loading states, error handling, pull-to-refresh

## Additional Notes

- The target Mylar instance is at `http://100.81.70.9:8090/` (Tailscale IP - private network)

- The Mylar API doesn't support CORS by default, so you may need to either:
  - Run the PWA on the same origin as Mylar
  - Use a reverse proxy (nginx/Caddy) to add CORS headers
  - Configure Mylar behind a proxy that handles CORS
  - For development, use Vite's proxy config to forward `/api` requests to the Mylar server

### Vite Proxy Config (for development)

Add this to `vite.config.js` to proxy API requests during development:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://100.81.70.9:8090',
        changeOrigin: true,
      }
    }
  }
})
```

Then in development, the API client can use relative URLs (`/api?cmd=...`) instead of the full URL.
  
- Cover images come from `getArt` endpoint - use the URL helper method

- Test with your actual Mylar instance to verify response structures

- Consider adding a "force search" button on the Wanted page

## Commands

After scaffolding, these should work:
```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```