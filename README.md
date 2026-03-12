# 🌿 Personal Blog — My Digital Garden

A full-stack personal blog platform with stunning glassmorphism UI, rich animations, and a powerful admin dashboard.

## Tech Stack

| Layer    | Technologies                                                                 |
|----------|-----------------------------------------------------------------------------|
| Frontend | React 18, Vite, Mantine UI 7, Framer Motion, Less, Axios, Recharts        |
| Backend  | Python 3.10+, FastAPI, SQLAlchemy 2 (Async), JWT Auth                       |
| Database | MySQL 8.0+                                                                  |
| Icons    | Lucide React                                                                |

## Features

### Public
- ✨ Hero section with typing animation
- 🃏 Bento Grid layout for latest posts
- 📖 Blog list with category/tag filters & pagination
- 📝 Markdown blog detail with syntax highlighting & floating TOC
- 📚 Archives grouped by year/month
- 👤 About page with career timeline
- 🔍 Real-time debounced search
- 🌗 Dark/Light mode toggle with smooth animation
- 📡 RSS feed

### Admin Dashboard
- 📊 Analytics with line/bar/pie charts
- ✏️ Split-screen Markdown editor with live preview
- 🏷️ Category & tag management
- ⚙️ Site settings & profile editor
- 🗑️ Soft delete with restore
- 💾 JSON backup export
- 📋 Activity audit logs

## Quick Start

### 1. Database Setup

```bash
mysql -u root -p123456 < schema.sql
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

## Default Login

- **Username:** `admin`
- **Password:** `admin123`

## Project Structure

```
personal-blog/
├── schema.sql                    # MySQL database schema
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py               # FastAPI app entry
│       ├── config.py             # Settings (DB, JWT)
│       ├── database.py           # Async SQLAlchemy engine
│       ├── models.py             # ORM models
│       ├── schemas.py            # Pydantic schemas
│       ├── auth.py               # JWT auth utilities
│       └── routers/
│           ├── auth.py           # Login, /me
│           ├── posts.py          # CRUD + search + archives
│           ├── categories.py     # Categories & tags
│           └── analytics.py      # Visits, stats, settings, upload, RSS
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── postcss.config.cjs
│   └── src/
│       ├── main.jsx              # App entry with providers
│       ├── App.jsx               # Route definitions
│       ├── api.js                # Axios instance with interceptors
│       ├── theme.js              # Mantine theme config
│       ├── contexts/
│       │   └── AuthContext.jsx   # JWT auth context
│       ├── styles/
│       │   ├── variables.less    # Global design tokens
│       │   └── global.less       # Global styles, glass effects, markdown
│       ├── components/
│       │   ├── BlogCard.jsx      # Animated post card
│       │   ├── BlogCard.less
│       │   ├── Motion.jsx        # Framer Motion helpers
│       │   ├── ThemeToggle.jsx   # Dark/light mode toggle
│       │   └── SearchBar.jsx     # Real-time search dropdown
│       ├── layouts/
│       │   ├── PublicLayout.jsx  # Sticky header, footer, nav
│       │   ├── PublicLayout.less
│       │   ├── AdminLayout.jsx   # Sidebar nav, auth guard
│       │   └── AdminLayout.less
│       └── pages/
│           ├── Home.jsx          # Hero + bento grid + about
│           ├── Home.less
│           ├── BlogList.jsx      # Filtered post grid
│           ├── BlogList.less
│           ├── BlogDetail.jsx    # Markdown render + TOC
│           ├── BlogDetail.less
│           ├── About.jsx         # Profile + timeline
│           ├── Archives.jsx      # Year/month accordion
│           ├── Login.jsx         # Admin login
│           └── admin/
│               ├── Dashboard.jsx     # Charts & stats
│               ├── PostManager.jsx   # Post list with CRUD
│               ├── PostEditor.jsx    # Split-screen editor
│               ├── CategoryManager.jsx
│               ├── Settings.jsx      # Site & profile config
│               └── Logs.jsx          # Activity audit
```

## Design System

- **Visual**: Glassmorphism + Bento Grid layout
- **Palette**: Indigo/Violet gradients, soft backgrounds
- **Motion**: Framer Motion page transitions, staggered lists, card hover effects
- **Typography**: Inter font, optimized readability
- **Responsiveness**: Mobile-first with breakpoint grid adaptation
