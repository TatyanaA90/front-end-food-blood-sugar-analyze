# Food & Blood Sugar Analyzer — Frontend

## Description
React + TypeScript single-page app for tracking glucose readings, meals, insulin doses, and activities, with analytics and dark/light theme. It talks to the backend over a configurable API base URL.

## Project Overview
A comprehensive diabetes management application that helps users track and analyze their blood sugar levels, meals, activities, and insulin doses. The frontend provides an intuitive interface for data entry, visualization, and insights to support better diabetes management.

## Key Features
- **User Management**: Registration, authentication, profile management with weight tracking
- **Data Tracking**: Glucose readings, meals with ingredients, activities, insulin doses, condition logs
- **Predefined Meal System**: Template-based meal creation with quantity and weight adjustments
- **Advanced Analytics**: 10 comprehensive analytics endpoints with interactive charts
- **Admin System**: Complete user and system management for healthcare providers
- **Data Import**: CGM CSV upload functionality
- **Visualization**: Dashboard and chart data endpoints with Recharts
- **Security**: Role-based access control and comprehensive validation
- **Responsive Design**: Mobile-first approach with modern UI (gradients, glass-morphism effects)

## Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Pure CSS with modern styling approach
- **Routing**: React Router for navigation
- **Data Management**: TanStack Query (React Query) for data fetching and caching
- **Forms**: React Hook Form for form handling
- **HTTP Client**: Axios for API communication
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for icons
- **Testing**: Vitest + Testing Library + MSW
- **Linting**: ESLint + typescript-eslint

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
- eslint 9.30.1, @eslintjs/js 9.30.1, eslint-plugin-react-hooks 5.2.0, eslint-plugin-react-refresh 0.4.20, globals 16.3.0
- vitest 3.2.4, jsdom 26.1.0, @testing-library/react 16.3.0, @testing-library/jest-dom 6.6.4, @testing-library/user-event 14.6.1
- @types/react 19.1.8, @types/react-dom 19.1.6, @types/node 20.x
- msw 2.10.4, serve 14.2.4

See exact versions in `package.json`.

## Current Status
- **Overall Progress**: 85% Complete
- **Production Deployment**: ✅ Live at [https://food-blood-sugar-analyzer-frontend.onrender.com](https://food-blood-sugar-analyzer-frontend.onrender.com)
- **Backend Integration**: ✅ Connected to live API
- **Core Features**: ✅ Authentication, glucose readings, meals management, admin system
- **In Progress**: Analytics dashboard, activity tracking, insulin dose management

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

## API Integration
The frontend integrates with a comprehensive FastAPI backend providing:
- **Authentication**: JWT-based user management
- **Core Data**: CRUD operations for all health data types
- **Analytics**: 10 comprehensive analytics endpoints
- **Visualization**: Chart data and dashboard endpoints
- **Admin**: User management and system administration

## Development Workflow
1. **Clone**: `git clone https://github.com/TatyanaA90/front-end-food-blood-sugar-analyzer.git`
2. **Install**: `npm install`
3. **Start Dev**: `npm run dev`
4. **Build**: `npm run build`
5. **Lint**: `npm run lint`

## Notes
- Theme switches via `data-theme` on `<html>`; user preference persists in `localStorage` under key `theme`.
- API base URL and flags are read from `import.meta.env` via `src/config/index.ts`.

## Documentation
- **Detailed Project Plan**: See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for comprehensive development roadmap, progress tracking, and technical details
- **Backend API**: [https://back-end-food-blood-sugar-analyzer.onrender.com/docs](https://back-end-food-blood-sugar-analyzer.onrender.com/docs)
- **Live Demo**: [https://food-blood-sugar-analyzer-frontend.onrender.com](https://food-blood-sugar-analyzer-frontend.onrender.com)

## Contributing
This project follows specific development rules and guidelines. Please refer to the project plan for detailed information about the codebase structure, development practices, and contribution guidelines.
