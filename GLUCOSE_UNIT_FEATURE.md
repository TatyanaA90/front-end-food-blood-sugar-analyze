# Global Glucose Unit Selection Feature

## Overview
This feature implements a comprehensive global glucose unit selection system that allows users to choose between mg/dL and mmol/L units, with automatic conversion and consistent display across all components.

## Features

### Core Functionality
- **Global Unit Preference**: Users can select their preferred glucose unit (mg/dL or mmol/L)
- **Automatic Conversion**: All glucose values are automatically converted to the selected unit
- **Persistent Storage**: Unit preference is saved in localStorage and persists across sessions
- **Visual Indicators**: Converted values are marked with an asterisk (*) and show original values on hover
- **Consistent Display**: All pages and components display glucose values in the selected unit

### Navigation Improvements
- **Reusable Navigation Header**: New `NavigationHeader` component with Back and Dashboard buttons
- **Consistent Navigation**: All pages now have consistent navigation controls
- **Responsive Design**: Navigation adapts to different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### Enhanced Filtering
- **Backend Filtering**: Date, meal context, and unit filters now work properly
- **Search Functionality**: Real-time search across all glucose reading fields
- **Combined Filtering**: Frontend and backend filters work together seamlessly

## Technical Implementation

### File Structure
```
src/
├── contexts/
│   ├── GlucoseUnitContext.ts          # Type definitions
│   └── GlucoseUnitContext.tsx         # Context provider
├── hooks/
│   └── useGlucoseUnit.ts              # Extended utilities
├── utils/
│   └── glucoseUtils.ts                # Pure utility functions
├── components/
│   ├── layout/
│   │   ├── NavigationHeader.tsx       # Reusable navigation
│   │   └── NavigationHeader.css       # Navigation styles
│   └── profile/
│       ├── GlucoseUnitSection.tsx     # Unit preference UI
│       └── GlucoseUnitSection.css     # Unit preference styles
├── pages/
│   ├── Dashboard.tsx                  # Updated with navigation
│   ├── GlucoseReadings.tsx            # Updated with navigation & filtering
│   └── UserProfile.tsx                # Updated with navigation
└── services/
    └── glucoseService.ts              # Updated with field mapping
```

### Key Components

#### NavigationHeader Component
- **Location**: `src/components/layout/NavigationHeader.tsx`
- **Purpose**: Reusable navigation header with Back and Dashboard buttons
- **Features**:
  - Configurable Back and Dashboard button visibility
  - Custom back destination support
  - Responsive design
  - Consistent styling across pages

#### GlucoseUnitContext
- **Location**: `src/contexts/GlucoseUnitContext.tsx`
- **Purpose**: Global state management for glucose unit preference
- **Features**:
  - localStorage persistence
  - Unit conversion functions
  - Value formatting utilities
  - Status and range calculations

#### glucoseService Updates
- **Location**: `src/services/glucoseService.ts`
- **Purpose**: Handle field mapping between frontend and backend
- **Key Changes**:
  - Maps `reading` ↔ `value`
  - Maps `reading_time` ↔ `timestamp`
  - Maps `notes` ↔ `note`
  - Handles search filtering

### Backend Updates
- **Model**: Added `meal_context` field to `GlucoseReading`
- **Router**: Enhanced filtering support for date, meal context, unit, and search
- **Schema**: Updated to include meal context field
- **Migration**: Database migration for new field

## Usage Instructions

### Setting Unit Preference
1. Navigate to **Profile** page
2. Scroll to **Glucose Unit Settings** section
3. Select preferred unit (mg/dL or mmol/L)
4. Unit preference is automatically saved

### Navigation
- **Back Button**: Returns to previous page or specified destination
- **Dashboard Button**: Always returns to main dashboard
- **Consistent Placement**: Top-left corner on all pages

### Filtering Glucose Readings
1. Navigate to **Glucose Readings** page
2. Use date filters to select specific date ranges
3. Use meal context filter to filter by meal timing
4. Use unit filter to show specific units
5. Use search to find specific readings

## Unit Conversion Logic

### Conversion Formulas
- **mg/dL to mmol/L**: `value / 18` (rounded to 1 decimal)
- **mmol/L to mg/dL**: `value * 18` (rounded to whole number)

### Status Ranges
**mg/dL:**
- Low: < 70
- Normal: 70 - 180
- High: > 180

**mmol/L:**
- Low: < 3.9
- Normal: 3.9 - 10.0
- High: > 10.0

## User Experience Features

### Visual Indicators
- **Converted Values**: Marked with asterisk (*)
- **Hover Tooltips**: Show original values
- **Status Colors**: Green (normal), Yellow (high), Red (low)
- **Trend Icons**: Visual indicators for glucose trends

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets
- **Accessible**: Proper contrast and keyboard navigation

## Testing Checklist

### Unit Selection
- [ ] Unit preference saves correctly
- [ ] Preference persists across sessions
- [ ] All components display in selected unit
- [ ] Conversion indicators work properly

### Navigation
- [ ] Back button works on all pages
- [ ] Dashboard button works on all pages
- [ ] Navigation is responsive
- [ ] Keyboard navigation works

### Filtering
- [ ] Date filters work correctly
- [ ] Meal context filters work
- [ ] Unit filters work
- [ ] Search functionality works
- [ ] Combined filters work together

### Data Integrity
- [ ] New readings save correctly
- [ ] Existing readings display properly
- [ ] Field mapping works correctly
- [ ] No data loss during conversion

## Future Enhancements

### Potential Improvements
1. **Unit Conversion History**: Track when users change units
2. **Custom Ranges**: Allow users to set custom glucose ranges
3. **Export Options**: Export data in preferred unit
4. **Analytics**: Unit-specific analytics and insights
5. **Notifications**: Unit-aware glucose alerts

### Performance Optimizations
1. **Caching**: Cache converted values for better performance
2. **Lazy Loading**: Load conversion utilities on demand
3. **Batch Processing**: Convert multiple readings efficiently

## Troubleshooting

### Common Issues
1. **Unit Not Saving**: Check localStorage permissions
2. **Conversion Errors**: Verify unit values are numeric
3. **Filter Not Working**: Check backend API connectivity
4. **Navigation Issues**: Verify React Router setup

### Debug Information
- Unit preference stored in: `localStorage.glucose_preferred_unit`
- Conversion functions in: `src/utils/glucoseUtils.ts`
- Context provider in: `src/contexts/GlucoseUnitContext.tsx`

## Recent Updates (Current Session)

### Navigation System
- **New Component**: `NavigationHeader` for consistent navigation
- **Back Button**: Returns to previous page or specified route
- **Dashboard Button**: Always available for quick dashboard access
- **Responsive Design**: Adapts to mobile and desktop screens

### Filtering Improvements
- **Backend Support**: Added comprehensive filtering to glucose readings API
- **Field Mapping**: Fixed frontend-backend field name mismatches
- **Search Enhancement**: Combined frontend and backend search functionality
- **Database Migration**: Added meal_context field to glucose readings

### Bug Fixes
- **422 Validation Error**: Fixed by mapping frontend fields to backend expectations
- **Missing Readings**: Resolved by implementing proper backend filtering
- **Navigation Consistency**: Standardized navigation across all pages 

---

## Documentation Compliance Update (August 7, 2025)
- Verified documentation against `.cursor/rules/rules.mdc`
- Confirmed this feature doc reflects current implementation and UX
- No functional changes; documentation review only