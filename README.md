# MylarMobile

A Progressive Web App (PWA) mobile interface for [Mylar3](https://github.com/mylar3/mylar3), the automated comic book downloader.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## Features

- **Mobile-First Design** - Optimized touch interface for phones and tablets
- **Comics Library** - Browse your comic collection with grid/list views
- **Issue Management** - View issues, queue downloads, track status
- **Search** - Find and add new comics from ComicVine
- **Upcoming Releases** - See what's coming out soon
- **Wanted List** - Track issues you're looking for
- **Download History** - View recently downloaded comics
- **Weekly Pull List** - See your weekly releases (requires database access)
- **Pull-to-Refresh** - Native mobile refresh gesture
- **Offline Support** - PWA caching for offline viewing
- **Installable** - Add to home screen on iOS/Android

## Screenshots

*Coming soon*

## Quick Start

### Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/rthaines211/MylarMobile.git
cd MylarMobile
```

2. Configure `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mylarmobile:
    build: .
    container_name: mylarmobile
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - MYLAR_URL=http://your-mylar-server:8090
    volumes:
      # Mount Mylar's config directory for weekly pull list feature
      - /path/to/mylar/config:/mylar:ro
    restart: unless-stopped
```

3. Start the container:
```bash
docker-compose up -d --build
```

4. Open `http://your-server:8080` and configure your API key in Settings

### Running with Mylar in Same Docker Compose

If you run Mylar in Docker, you can add MylarMobile to the same compose file:

```yaml
version: '3.8'

services:
  mylar:
    image: lscr.io/linuxserver/mylar3:latest
    container_name: mylar
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
    volumes:
      - /path/to/mylar/config:/config
      - /path/to/comics:/comics
    ports:
      - "8090:8090"
    restart: unless-stopped

  mylarmobile:
    build: .
    container_name: mylarmobile
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - MYLAR_URL=http://mylar:8090  # Use container name
    volumes:
      - /path/to/mylar/config:/mylar:ro
    depends_on:
      - mylar
    restart: unless-stopped
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `80` | Port the app listens on inside the container |
| `MYLAR_URL` | `http://localhost:8090` | URL of your Mylar3 server |

### App Settings

After launching, go to **Settings** in the app and configure:

1. **API Key** - Your Mylar3 API key (found in Mylar Settings > Web Interface > API Key)
2. **Database Path** (optional) - Path to `mylar.db` for weekly pull list feature (default: `/mylar/mylar.db`)

## Development

### Prerequisites

- Node.js 20+
- npm

### Local Development

1. Clone and install:
```bash
git clone https://github.com/rthaines211/MylarMobile.git
cd MylarMobile
npm install
```

2. Configure the Vite proxy in `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://your-mylar-server:8090',
      changeOrigin: true,
    },
    '/searchit': {
      target: 'http://your-mylar-server:8090',
      changeOrigin: true,
    },
    '/backend': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/backend/, '/api'),
    }
  }
}
```

3. Start development servers:
```bash
npm run dev:all  # Starts both frontend (Vite) and backend (Express)
```

Or run separately:
```bash
npm run dev      # Frontend only (port 5173)
npm run server   # Backend only (port 3001)
```

4. Open `http://localhost:5173`

### Project Structure

```
├── src/
│   ├── api/mylar.js         # Mylar API client
│   ├── components/
│   │   ├── comics/          # ComicCard, ComicList, IssueList
│   │   ├── layout/          # Header, BottomNav, Layout
│   │   ├── common/          # Toast, Loading, ErrorMessage
│   │   └── search/          # SearchBar
│   ├── context/             # ConfigContext for settings
│   ├── hooks/               # useMylar React Query hooks
│   └── pages/               # Home, ComicDetail, Search, etc.
├── server.js                # Express backend for DB queries
├── docker-compose.yml       # Docker orchestration
├── nginx.conf.template      # Reverse proxy config
├── Dockerfile               # Multi-stage Docker build
└── FEATURES.md              # Feature roadmap
```

### Build Commands

```bash
npm run dev        # Start Vite dev server
npm run server     # Start Express backend
npm run dev:all    # Run both concurrently
npm run build      # Production build
npm run preview    # Preview production build
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / PWA                         │
├─────────────────────────────────────────────────────────────┤
│                      React Frontend                          │
│              (Vite + React Query + Tailwind)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐     ┌───────────────────┐
│   nginx (Docker)  │     │  Vite Dev Server  │
│   /api → Mylar    │     │    (dev mode)     │
│   /backend → Node │     │                   │
└─────────┬─────────┘     └───────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌────────────┐
│ Mylar3 │  │ Express.js │
│  API   │  │ (SQLite)   │
└────────┘  └────────────┘
```

- **Frontend**: React SPA with React Query for data fetching
- **Nginx**: Reverse proxy for API requests (production)
- **Vite**: Development proxy and build tool
- **Express Backend**: Direct SQLite access for weekly pull list
- **Mylar3 API**: All comic data, search, and management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the app locally to test
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow existing code style (React functional components, hooks)
- Use Tailwind CSS for styling
- Add API calls to `src/api/mylar.js`
- Add React Query hooks to `src/hooks/useMylar.js`
- Test on mobile viewport sizes
- Update FEATURES.md if implementing a listed feature

### Feature Ideas

Check [FEATURES.md](./FEATURES.md) for the feature roadmap and ideas. High priority items are great first contributions!

## API Reference

MylarMobile uses the [Mylar3 API](https://github.com/mylar3/mylar3/wiki/API-Documentation). Key endpoints:

| Endpoint | Description |
|----------|-------------|
| `getIndex` | List all comics in library |
| `getComic` | Get comic details and issues |
| `findComic` | Search for comics |
| `queueIssue` | Queue issue for download |
| `getUpcoming` | Get upcoming releases |
| `getWanted` | Get wanted issues |
| `getHistory` | Get download history |
| `getArt` | Get cover image |

## Troubleshooting

### "API not configured" error
- Go to Settings and enter your Mylar API key
- The API key is in Mylar Settings > Web Interface > API Key

### Comics not loading
- Verify your Mylar URL is correct in `docker-compose.yml`
- Check that Mylar is accessible from the container
- If using Docker networking, use the container name (e.g., `http://mylar:8090`)

### Weekly pull list not working
- Ensure the Mylar config directory is mounted to `/mylar`
- The database file should be at `/mylar/mylar.db`
- Check container logs: `docker logs mylarmobile`

### PWA not installing
- Ensure you're accessing via HTTPS (or localhost)
- Check browser console for PWA errors
- Try clearing browser cache and service workers

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Mylar3](https://github.com/mylar3/mylar3) - The amazing comic book manager this app interfaces with
- [ComicVine](https://comicvine.gamespot.com/) - Comic database used by Mylar
- [Lucide Icons](https://lucide.dev/) - Beautiful icons used in the UI
