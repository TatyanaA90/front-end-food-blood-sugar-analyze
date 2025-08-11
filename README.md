# Food & Blood Sugar Analyzer - Frontend

A comprehensive web application for tracking and analyzing food intake, blood sugar levels, and their correlations. Built with React 19, TypeScript, and modern web technologies.

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd front-end-food-blood-sugar-analyzer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

## 🛠️ **First Setup & Migration (Fresh Install)**

Follow these steps when setting up the project for the first time.

### **1. Prerequisites**
Before starting, make sure you have installed:

- Python 3.10+
- PostgreSQL 14+
- Node.js 18+ & npm
- Git
- Alembic (installed with backend dependencies)

### **2. Clone the Repository**
```bash
git clone https://github.com/yourusername/capstone_food_blood_sugar_analyzer_final.git
cd capstone_food_blood_sugar_analyzer_final
```

### **3. Start PostgreSQL**
Make sure your PostgreSQL service is running.

### **4. Create & Configure .env Files**

**Backend .env (example):**
```ini
DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/your_db_name
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend .env (example):**
```ini
VITE_API_URL=http://localhost:8000
```

### **5. Create the Database**
In PostgreSQL, recreate the database (if starting fresh):

```sql
DROP DATABASE IF EXISTS your_db_name;
CREATE DATABASE your_db_name;
```

### **6. Backend Setup**
```bash
cd back-end-food-blood-sugar-analyzer
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip3 install -r requirements.txt
```

### **7. Apply Database Migrations**
```bash
alembic upgrade head
```

### **8. Start the Backend**
```bash
uvicorn app.main:app --reload
```

The backend will be available at: http://localhost:8000

### **9. Frontend Setup**
```bash
cd ../front-end-food-blood-sugar-analyze
npm install
npm run dev
```

The frontend will be available at: http://localhost:5173 (or as shown in your terminal).

### **10. Verify the Setup**
1. Open the frontend in your browser
2. Register a new user or log in
3. Test API connections and basic functionality

**Note**: These steps ensure a complete fresh setup for any developer cloning the project for the first time.

## 🎯 **Features**

### **✅ Core Features**
- **User Authentication**: Secure login/register with JWT
- **Glucose Readings Management**: Complete CRUD operations with filtering
- **Admin Dashboard**: User management and system administration
- **Profile Management**: User information and password management
- **Meals Management**: Food tracking with predefined meal templates and custom meals
- **Predefined Meal System**: Template-based meal creation with quantity and weight adjustments
- **Responsive Design**: Mobile-first approach with modern UI

### **🔄 In Development**
- **Activities Tracking**: Exercise and physical activity logging
- **Insulin Doses**: Medication tracking and management

### **⏳ Planned Features**
- **Advanced Analytics**: Machine learning insights
- **Data Export**: CSV/PDF export functionality
- **Notifications**: Reminder system for readings

## 🏗️ **Architecture**

### **Tech Stack**
- **React 19** + TypeScript - Modern web framework
- **Vite** - Fast development and build tool
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client with interceptors
- **Lucide React** - Icon library
- **Pure CSS** - Modern styling without frameworks

### **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── glucose/        # Glucose reading components
│   ├── layout/         # Layout components
│   └── profile/        # Profile components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── services/           # API communication
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## 📊 **Glucose Readings Feature**

### **Key Capabilities**
- **Add Readings**: Quick form with validation
- **Edit Readings**: In-place editing with confirmation
- **Delete Readings**: Safe deletion with confirmation
- **Filter & Search**: Advanced filtering by date, meal context, units
- **Unit Conversion**: Automatic mg/dL ↔ mmol/L conversion
- **Status Indicators**: Visual glucose level categorization
- **Meal Context**: Track readings relative to meals
- **Notes**: Optional notes for each reading

### **Usage**
1. Navigate to "Readings" in the main navigation
2. Click "Add Reading" to create a new glucose reading
3. Fill in the reading value, unit, time, and meal context
4. Use filters to find specific readings
5. Edit or delete readings using the action buttons

## 🍽️ **Predefined Meal System**

### **Key Features**
- **Template Selection**: Browse predefined meal templates by category
- **Quantity Scaling**: Select 1-10 portions with automatic ingredient scaling
- **Weight Adjustments**: Customize individual ingredient weights
- **Live Nutrition Calculation**: Real-time nutrition updates as you adjust
- **Search & Filter**: Find meals by name, description, or category
- **Modal Interface**: Clean, focused template selection experience

### **Usage**
1. Navigate to "Meals" in the main navigation
2. Click "Add Meal" to open the meal form
3. Click "Choose from Templates" to browse predefined meals
4. Select a meal template and customize quantity/weights
5. Review calculated nutrition and confirm to create the meal
6. Or create a custom meal from scratch using the form

### **Template Categories**
- **Breakfast**: Oatmeal, eggs, yogurt, etc.
- **Lunch**: Salads, sandwiches, pasta, etc.
- **Dinner**: Main dishes, sides, etc.
- **Snack**: Light snacks and treats
- **Dessert**: Sweet treats and desserts
- **Beverage**: Drinks and smoothies

## 🔐 **Authentication**

### **User Types**
- **Regular Users**: Can manage their own data
- **Admin Users**: Can manage all users and system data

### **Security Features**
- JWT-based authentication
- Automatic token refresh
- Protected routes
- Role-based access control
- Secure password handling

## 🎨 **Design System**

### **Visual Design**
- Clean, modern interface
- Consistent color scheme
- Responsive grid layouts
- Smooth animations and transitions
- Accessibility-first approach

### **Components**
- **Cards**: Information display with hover effects
- **Forms**: Validated inputs with error states
- **Modals**: Overlay dialogs for actions
- **Buttons**: Consistent styling with states
- **Status Badges**: Visual indicators for data states

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Features**
- Mobile-first approach
- Touch-friendly interactions
- Optimized layouts for all screen sizes
- Flexible grid systems

## 🧪 **Testing**

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Test Structure**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and user flow testing
- **E2E Tests**: Complete user journey testing

## 🚀 **Deployment**

### **Build Process**
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### **Deployment Platforms**
- **Render**: Primary deployment platform
- **Vercel**: Alternative deployment option
- **Netlify**: Backup deployment platform

### **Environment Configuration**
- Production API endpoints
- Environment-specific settings
- SSL certificate configuration
- Domain and routing setup

## 🔧 **Development**

### **Code Quality**
- **ESLint**: Code linting and formatting
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation

### **Development Workflow**
1. Create feature branch
2. Implement feature with tests
3. Run linting and type checking
4. Submit pull request
5. Code review and merge

### **Best Practices**
- **Component Composition**: Reusable component patterns
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Handling**: Graceful error boundaries
- **Performance**: Optimized rendering and caching
- **Accessibility**: WCAG compliance

## 📚 **API Integration**

### **Backend Communication**
- **Base URL**: Configurable via environment variables
- **Authentication**: JWT token management
- **Error Handling**: Comprehensive error management
- **Caching**: React Query for data caching
- **Optimistic Updates**: Immediate UI feedback

### **Endpoints**
- **Authentication**: `/login`, `/register`, `/users`
- **Glucose Readings**: `/glucose-readings`
- **User Management**: `/profile`, `/admin/users`
- **Analytics**: `/analytics`, `/stats`

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**
```bash
# Check type definitions
npm run type-check

# Fix import issues
# Ensure type-only imports for types
import type { MyType } from './types';
```

#### **Routing Issues**
- Check `_redirects` file for SPA routing
- Verify deployment platform configuration
- Ensure all routes are properly configured

### **Development Tips**
- Use React DevTools for debugging
- Check browser console for errors
- Verify API endpoints are accessible
- Test on multiple devices and browsers

## 📄 **Documentation**

### **Additional Resources**
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Project roadmap and status

### **API Documentation**
- Backend API documentation available at `/docs` endpoint
- Interactive Swagger UI for API testing
- Postman collection for API testing

## 🤝 **Contributing**

### **Guidelines**
- Follow established coding conventions
- Write comprehensive tests
- Update documentation
- Ensure accessibility compliance
- Test on multiple devices

### **Code Style**
- Use TypeScript for all new code
- Follow React best practices
- Maintain consistent formatting
- Write clear commit messages

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Getting Help**
- Check the troubleshooting section
- Review existing documentation
- Search for similar issues
- Create a detailed bug report

### **Bug Reports**
- Include browser and OS information
- Provide steps to reproduce
- Include error messages and console logs
- Describe expected vs actual behavior

---

**Version**: 1.1.0  
**Last Updated**: August 2025  
**Status**: Production Ready with Glucose Readings, Meals Management, Admin Dashboard, and Global Unit Selection  
**Next Release**: Activities and Insulin Doses pages
