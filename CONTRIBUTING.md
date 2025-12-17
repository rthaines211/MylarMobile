# Contributing to MylarMobile

Thank you for your interest in contributing to MylarMobile! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to make a great app for the comic book community!

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/MylarMobile.git
   cd MylarMobile
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/rthaines211/MylarMobile.git
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js 20+
- npm
- Access to a Mylar3 server for testing

### Installation

```bash
# Install dependencies
npm install

# Configure Vite proxy (edit vite.config.js)
# Change the target URL to your Mylar server

# Start development servers
npm run dev:all
```

### Project Structure

```
src/
├── api/
│   └── mylar.js          # API client - add new endpoints here
├── components/
│   ├── comics/           # Comic-related components
│   ├── common/           # Shared components (Toast, Loading, etc.)
│   ├── layout/           # Layout components (Header, Nav)
│   └── search/           # Search components
├── context/
│   └── ConfigContext.jsx # App configuration/settings
├── hooks/
│   └── useMylar.js       # React Query hooks - add queries here
└── pages/                # Page components (routes)
```

## Making Changes

### Adding a New API Endpoint

1. Add the method to `src/api/mylar.js`:
   ```javascript
   getNewEndpoint(id) {
     return this.request('newEndpoint', { id });
   }
   ```

2. Add a React Query hook in `src/hooks/useMylar.js`:
   ```javascript
   export function useNewEndpoint(id) {
     const { api, isConfigured } = useConfig();
     return useQuery({
       queryKey: ['newEndpoint', id],
       queryFn: () => api.getNewEndpoint(id),
       enabled: isConfigured && !!id,
     });
   }
   ```

### Adding a New Page

1. Create the page component in `src/pages/NewPage.jsx`
2. Add the route in `src/App.jsx`
3. Add navigation link in `src/components/layout/BottomNav.jsx` (if needed)

### Styling

- Use **Tailwind CSS** classes for all styling
- Follow the existing color scheme (defined in `tailwind.config.js`):
  - `bg-primary`, `bg-secondary`, `bg-tertiary` for backgrounds
  - `text-primary`, `text-secondary`, `text-muted` for text
  - `accent-primary`, `accent-success`, `accent-warning`, `accent-danger` for colors
- Test on mobile viewport sizes (375px width minimum)

## Pull Request Process

1. **Update your branch** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes** thoroughly:
   - Test on mobile viewport sizes
   - Test with actual Mylar data
   - Check for console errors

3. **Commit with clear messages**:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List any testing you've done

6. **Respond to feedback** - maintainers may request changes

## Coding Standards

### JavaScript/React

- Use **functional components** with hooks
- Use **destructuring** for props and state
- Keep components focused and small
- Use meaningful variable and function names

```javascript
// Good
function ComicCard({ comic, onClick }) {
  const { name, year, coverUrl } = comic;
  return (/* ... */);
}

// Avoid
function CC({ c, fn }) {
  return (/* ... */);
}
```

### File Organization

- One component per file
- Name files with PascalCase for components (`ComicCard.jsx`)
- Name files with camelCase for utilities (`mylar.js`)
- Keep related files together in directories

### Comments

- Add comments for complex logic
- Use JSDoc for function documentation when helpful
- Don't comment obvious code

## Testing

Currently, testing is manual. When testing your changes:

1. **Mobile Testing**
   - Use browser DevTools responsive mode
   - Test touch interactions
   - Verify pull-to-refresh works

2. **API Testing**
   - Test with real Mylar data
   - Test error states (invalid API key, network errors)
   - Test loading states

3. **Cross-Browser**
   - Test in Chrome and Safari (primary mobile browsers)

## Feature Requests

Check [FEATURES.md](./FEATURES.md) for planned features. If you have a new idea:

1. **Check existing issues** to avoid duplicates
2. **Open a new issue** with:
   - Clear description of the feature
   - Use case / why it's useful
   - Any relevant Mylar API endpoints needed

## Bug Reports

When reporting bugs, please include:

1. **Steps to reproduce** the issue
2. **Expected behavior** vs actual behavior
3. **Screenshots** if applicable
4. **Browser and device** information
5. **Console errors** if any
6. **Mylar version** if relevant

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

Thank you for contributing!
