# Food & Blood Sugar Analyzer - Frontend

A modern React application for diabetes management and blood sugar tracking, built with TypeScript and featuring a beautiful, accessible UI.

## 🏥 About

The Food & Blood Sugar Analyzer helps users track and manage their diabetes by logging glucose readings, meals, activities, and insulin doses. The application provides detailed analytics and visualizations to help users understand patterns and make informed health decisions.

## 🚀 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Pure CSS with modern design approach (gradient backgrounds, glass-morphism effects)
- **Routing**: React Router with protected routes
- **Forms**: React Hook Form with validation
- **Data Management**: React Query for server state management
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Render (Static Site)
- **Testing**: Vitest + React Testing Library + MSW

## ✨ Features

### Authentication
- 🔐 Secure JWT-based authentication
- 🎨 Modern UI with gradient backgrounds and glass-morphism effects
- 📱 Responsive design (mobile-first approach)
- ♿ Accessibility features (ARIA labels, keyboard navigation, screen reader support)
- ✨ Smooth animations and micro-interactions
- 🔍 Real-time form validation with animated error states
- 📊 Admin features (user stats, management)

### Core Features (Coming Soon)
- 🩸 Glucose readings tracking with unit conversion (mg/dL ↔ mmol/L)
- 🍽️ Meal logging with nutrition calculations
- 🏃 Activity tracking with calorie calculations
- 💉 Insulin dose management
- 📊 Dashboard with charts and key metrics
- 📈 Analytics and trend visualization
- 📋 Condition logs and health tracking

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TatyanaA90/front-end-food-blood-sugar-analyzer.git

# Navigate to project directory
cd front-end-food-blood-sugar-analyzer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run tests
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Open test UI
npm run test:ui
```

## 🧪 Testing

The project includes a comprehensive testing infrastructure:

### Testing Stack
- **Framework**: Vitest (Vite-native, fast testing)
- **Testing Library**: React Testing Library for component testing
- **User Events**: @testing-library/user-event for interaction testing  
- **API Mocking**: MSW (Mock Service Worker) for API testing
- **Environment**: jsdom for DOM simulation

### Test Coverage
- ✅ **Authentication Flow**: Login, registration, logout, and token management
- ✅ **Form Validation**: Real-time validation and error handling
- ✅ **User Interactions**: Form submission, password toggle, navigation
- ✅ **API Integration**: Mocked backend responses for reliable testing
- ✅ **Accessibility**: Form labels, keyboard navigation, screen readers

### Running Tests
```bash
# Watch mode (recommended for development)
npm run test

# Single run (CI/CD)
npm run test:run

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

## 🌐 Production Deployment

- **Frontend URL**: https://food-blood-sugar-analyzer-frontend.onrender.com
- **Backend API**: https://back-end-food-blood-sugar-analyzer.onrender.com
- **Status**: Live and operational

## 🎯 Project Status

### ✅ Completed
- **Phase 1**: Project foundation and setup
- **Phase 2**: Authentication and user management
  - Modern authentication UI with JWT
  - Complete user profile with weight management
  - Admin features and role support
  - Real-time form validation
- **Framework Migration**: Successfully removed Tailwind CSS, migrated to pure CSS
- **Performance**: Reduced bundle size by 25 packages, zero build warnings
- **UI/UX**: Beautiful gradient backgrounds, glass-morphism effects, smooth animations
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### 🚧 Current Focus
- **Phase 3**: Core data management (glucose readings, meals, activities, insulin doses)
- **Next Priority**: Building CRUD operations for health data with beautiful UI

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components with routing
│   ├── Login.tsx       # Login page with modern UI
│   ├── Login.css       # Login styles (pure CSS)
│   ├── Register.tsx    # Registration page
│   ├── Register.css    # Registration styles
│   └── Dashboard.tsx   # Main dashboard
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Design System

- **Colors**: Custom gradient backgrounds with soft transitions
- **Effects**: Glass-morphism with backdrop blur
- **Animation**: Smooth micro-interactions and form transitions
- **Typography**: System fonts with proper hierarchy
- **Responsive**: Mobile-first design with breakpoints at 640px, 768px, 1024px

## 🔧 Technical Achievements

- **Zero Build Warnings**: Clean compilation process
- **Pure CSS Architecture**: No framework dependencies, better performance
- **Modern Design**: Gradient backgrounds, glass-morphism, smooth animations
- **Accessibility**: Full ARIA support, keyboard navigation
- **Performance**: Optimized bundle size and faster builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Documentation

- **PROJECT_PLAN.md**: Comprehensive development plan with 12 phases
- **CONVERSATION_SUMMARY.md**: Progress tracking and architectural decisions

## 🔗 Related Repositories

- **Backend API**: [Food & Blood Sugar Analyzer Backend](https://github.com/backend-repo-link)

---

*Built with ❤️ for better diabetes management*