# CLAUDE.md - MylarMobile

## Project Overview

MylarMobile is a Progressive Web App (PWA) mobile interface for Mylar3, the comic book management system. It provides a mobile-friendly way to browse comics, view upcoming releases, manage wanted issues, and search for new comics.

## Tech Stack

- **Frontend**: React 18 with Vite, React Router, TanStack Query, Tailwind CSS
- **Backend**: Express.js with better-sqlite3 for direct database access
- **Deployment**: Docker with nginx reverse proxy
- **PWA**: vite-plugin-pwa for offline capability

## Project Structure

```
├── src/
│   ├── api/mylar.js       # Mylar API client class
│   ├── components/
│   │   ├── comics/        # Comic display components (ComicCard, ComicList, IssueList)
│   │   ├── layout/        # Header, BottomNav, Layout
│   │   ├── common/        # Toast, Loading, ErrorMessage
│   │   └── search/        # SearchBar
│   ├── context/           # ConfigContext for API settings
│   ├── hooks/             # useMylar hook for API access
│   └── pages/             # Home, ComicDetail, Upcoming, Wanted, Search, Settings
├── server.js              # Express backend for direct DB queries
├── docker-compose.yml     # Container orchestration
├── nginx.conf.template    # Reverse proxy config
└── API_Reference          # Mylar3 API documentation
```

## Development Commands

```bash
npm run dev        # Start Vite dev server (frontend only)
npm run server     # Start Express backend server
npm run dev:all    # Run both frontend and backend concurrently
npm run build      # Build for production
npm run preview    # Preview production build
```

## Architecture

### API Communication
- Frontend uses relative URLs (`/api`, `/searchit`, `/backend`)
- nginx proxies `/api` and `/searchit` to the configured Mylar3 server
- nginx proxies `/backend` to the local Express server
- In dev mode, Vite handles the proxying (see vite.config.js)

### Backend Server (server.js)
The Express backend provides direct SQLite database access for:
- `/api/weekly` - Get weekly pull list from mylar.db
- `/api/weekly/weeks` - Get available weeks
- `/api/weekly/stats` - Get status statistics
- `/health` - Health check endpoint

### MylarAPI Client (src/api/mylar.js)
Wraps all Mylar3 API calls:
- `getIndex()`, `getComic(id)`, `getComicInfo(id)` - Comic data
- `addComic(id)`, `delComic(id)`, `pauseComic(id)`, `resumeComic(id)` - Comic management
- `getUpcoming()`, `getWanted()`, `getHistory()` - Lists
- `findComic(name)`, `searchComics(name)` - Search
- `queueIssue(id)`, `unqueueIssue(id)` - Issue management

## Docker Deployment

The app runs in a Docker container with:
- nginx serving the built frontend and handling reverse proxy
- Environment variables: `PORT`, `MYLAR_URL`
- Volume mount: Mylar's config directory at `/mylar:ro` for database access

## Key Files

- `src/context/ConfigContext.jsx` - Manages API URL and key storage
- `src/hooks/useMylar.js` - React Query hooks for API calls
- `nginx.conf.template` - Reverse proxy configuration with envsubst
- `entrypoint.sh` - Docker startup script

## Configuration

Users configure the app via Settings page:
- Mylar URL (proxied through nginx)
- API Key (stored in localStorage)
- Database path for weekly pull list feature

## Notes

- All API requests go through relative URLs to avoid CORS issues
- The backend server runs on port 3001 locally, proxied via `/backend`
- Comic cover images are fetched via `getArt` API command
- See [FEATURES.md](./FEATURES.md) for planned enhancements

## Deployment Instructions

After pushing changes to git, remind the user to rebuild and restart the Docker container on their Mac:

```bash
# On the Mac running Docker:
cd /Volumes/ryanhaines/docker/stacks/trialzone/MylarMobile
git pull origin main
docker-compose up -d --build
```

The `--build` flag is required to rebuild the image with new code changes (Docker caches images otherwise).
