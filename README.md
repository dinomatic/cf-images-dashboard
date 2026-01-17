# CF Images Dashboard

A sci-fi themed media library dashboard for browsing and organizing Cloudflare Images.

## Features

- Browse images from Cloudflare Images in a directory tree
- Responsive grid view with folders and images (sorted A-Z)
- Full-size image modal with copy-to-clipboard URL
- Collapsible sidebar navigation
- Sci-fi neon cyan/lime/purple theme with scanline effects
- Mobile-responsive with hamburger menu
- API key authentication

## Architecture

**Frontend**: React + TypeScript + Tailwind CSS v4

- Directory tree sidebar (collapsible, sorted A-Z)
- Content grid showing folders and images
- Full-size image modal with metadata
- Breadcrumb navigation

**Backend**: Cloudflare Worker (separate repo)

- `/api/organize` - Get full directory tree with images
- `/api/organize?path={path}` - Get specific directory
- `/api/images` - List all images (optional prefix filter)
- Proxies to Cloudflare Images API

## Setup

### Prerequisites

- Cloudflare account with Images enabled
- Node.js 18+
- Backend Worker deployed (see backend repo)

### Environment Variables

Create a `.env` file (see `.env.example`):

```bash
# Backend API URL (used for both dev proxy and production)
VITE_API_BASE_URL=https://your-worker.workers.dev

# API key for backend authentication
VITE_DASHBOARD_API_KEY=your-api-key

# Cloudflare Images account hash
VITE_CF_ACCOUNT_HASH=your-account-hash

# App branding (optional)
VITE_APP_TITLE="My Media Archive"
VITE_APP_SUBTITLE="Image Browser"
```

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (proxies /api to backend)
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api/*` requests to `VITE_API_BASE_URL`.

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Deploy to Cloudflare Pages:**

1. Push to GitHub
2. Connect repo in Cloudflare Dashboard → Pages
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables in Pages settings

## Image URL Format

Images are served from Cloudflare's CDN:

```
https://imagedelivery.net/{account_hash}/{image_id}/{variant}
```

Variants configured:

- `thumbnail` - Grid preview (400x225)
- `public` - Full size original
- `default` - Standard size (1366x768)

## Image Organization

Images are stored with path-based IDs:

```
posts/spinoko-theme.png
themes/akurai/logo.webp
docs/guide/screenshot.jpg
```

The backend parses these paths to build a directory tree automatically.

## API Authentication

All API endpoints require `X-API-Key` header:

```bash
curl https://your-backend.workers.dev/api/organize \
  -H "X-API-Key: your-api-key"
```

## Tech Stack

- React 19
- TypeScript 5.9
- Tailwind CSS 4
- Vite 7
