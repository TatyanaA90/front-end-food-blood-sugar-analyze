# Food & Blood Sugar Analyzer — Frontend

## Description
React + TypeScript single-page app for tracking glucose readings, meals, insulin doses, and activities, with analytics and dark/light theme. It talks to the backend over a configurable API base URL.


## Dependencies

Runtime:
- react 19.1.0, react-dom 19.1.0
- react-router-dom 7.7.1
- @tanstack/react-query 5.83.1
- react-hook-form 7.61.1
- axios 1.11.0
- recharts 3.1.0
- lucide-react 0.535.0
- vite 7.0.4, @vitejs/plugin-react 4.6.0
- postcss 8.5.6, autoprefixer 10.4.21

Dev:
- typescript ~5.8.3, typescript-eslint 8.35.1
- eslint 9.30.1, @eslint/js 9.30.1, eslint-plugin-react-hooks 5.2.0, eslint-plugin-react-refresh 0.4.20, globals 16.3.0
- vitest 3.2.4, jsdom 26.1.0, @testing-library/react 16.3.0, @testing-library/jest-dom 6.6.4, @testing-library/user-event 14.6.1
- @types/react 19.1.8, @types/react-dom 19.1.6, @types/node 20.x
- msw 2.10.4, serve 14.2.4

See exact versions in `package.json`.

## Setup

Prerequisites:
- Node.js 18+
- npm (bundled with Node)
- Running backend API (FastAPI) URL

1) Clone and install
```bash
git clone <your-repo-url>
cd front-end-food-blood-sugar-analyze
npm install
```

2) Configure environment
Create a `.env` file at the project root with at least:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Food & Blood Sugar Analyzer
VITE_APP_VERSION=1.0.0
VITE_JWT_STORAGE_KEY=blood_sugar_token
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
VITE_API_TIMEOUT=10000
```

3) Run
```bash
# Dev server
npm run dev

# Lint (fix issues reported in CI)
npm run lint

# Unit tests
npm test

# Production build (uses npx vite build under the hood)
npm run build

# Preview local production build
npm run preview
```

Notes:
- Theme switches via `data-theme` on `<html>`; user preference persists in `localStorage` under key `theme`.
- API base URL and flags are read from `import.meta.env` via `src/config/index.ts`.
