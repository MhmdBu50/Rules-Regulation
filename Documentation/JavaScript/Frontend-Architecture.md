# Frontend JavaScript Architecture

## 📝 Overview

The Rules & Regulations System employs a modular JavaScript architecture that handles user interactions, language switching, document management, and administrative functions across the application.

## 🏗️ Architecture Pattern

### Modular Design
- **Separation of Concerns**: Each script handles specific functionality
- **Event-Driven**: DOM event handling and user interactions
- **API Integration**: RESTful API communication
- **Progressive Enhancement**: Graceful degradation support

### File Organization
```
wwwroot/js/
├── adminScripts/          # Administrative functions
├── userScripts/           # User interface scripts
├── shared/                # Shared utilities
└── localization/          # Language management
```

## 📁 Core JavaScript Modules

### Language Management

#### `languageSwitcher.js`
**Purpose**: Global language switching functionality  
**Features**:
- Real-time language toggle
- URL parameter management
- RTL/LTR text direction switching
- Cultural formatting

**Key Functions**:
```javascript
function switchLanguage(targetLang)
function updateUIDirection(language)
function persistLanguageChoice(language)
```

#### `loginLanguageToggle.js`
**Purpose**: Login page specific language switching  
**Features**:
- Login form language toggle
- Authentication page localization
- Visual feedback for language changes

### Administrative Scripts

#### `AdminTable.js`
**Purpose**: Administrative table management and interactions  
**Features**:
- Data table operations
- Sorting and filtering
- Bulk actions
- Export functionality

**Key Functions**:
```javascript
function initializeDataTable()
function handleBulkActions()
function exportTableData()
function refreshTableData()
```

#### `StatisticsInAdmin.js`
**Purpose**: Dashboard charts and statistics  
**Features**:
- Chart.js integration
- Real-time data updates
- Interactive visualizations
- Export capabilities

**Chart Types**:
- Donut charts for document distribution
- Bar charts for departmental statistics
- Line charts for trend analysis
- Pie charts for user activity

### Document Management

#### `recordDetailsModal.js`
**Purpose**: Document detail modal management  
**Features**:
- Modal window handling
- Document preview
- Download functionality
- Share options

#### `ShowDetailsTracking.js`
**Purpose**: User activity tracking for document views  
**Features**:
- View event logging
- Analytics data collection
- User behavior tracking

### User Interface Scripts

#### `homePage.js`
**Purpose**: Homepage interactions and functionality  
**Features**:
- Document search and filtering
- Category navigation
- Featured content display
- Responsive behavior

#### `savedFunctions.js`
**Purpose**: User's saved documents management  
**Features**:
- Save/unsave documents
- Saved items display
- Local storage integration
- Synchronization with server

## 🌐 Localization Integration

### Language Detection
```javascript
function getCurrentLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const culture = urlParams.get('culture');
    return culture || 'en-US';
}
```

### RTL Support
```javascript
function applyRTLStyles(isRTL) {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    document.body.className = isRTL ? 'rtl' : 'ltr';
}
```

### Content Updates
```javascript
function updateLocalizedContent(language) {
    document.querySelectorAll('[data-localize]').forEach(element => {
        const key = element.dataset.localize;
        element.textContent = getLocalizedText(key, language);
    });
}
```

## 📊 API Communication

### RESTful API Calls
```javascript
async function fetchDashboardStats() {
    try {
        const response = await fetch('/Admin/GetDashboardStats');
        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
    }
}
```

### Error Handling
```javascript
function handleAPIError(error, context) {
    console.error(`API Error in ${context}:`, error);
    showUserFriendlyMessage('Operation failed. Please try again.');
}
```

## 🎨 UI/UX Enhancement

### Interactive Elements
- **Smooth Animations**: CSS transitions and transforms
- **Loading States**: Progress indicators and spinners
- **Feedback Messages**: Success/error notifications
- **Responsive Design**: Mobile-first approach

### Accessibility Features
- **Keyboard Navigation**: Tab order and shortcuts
- **Screen Reader Support**: ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant color schemes

## 📱 Responsive Behavior

### Breakpoint Management
```javascript
const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
};

function handleResponsiveLayout() {
    const width = window.innerWidth;
    if (width < breakpoints.mobile) {
        enableMobileLayout();
    } else if (width < breakpoints.tablet) {
        enableTabletLayout();
    } else {
        enableDesktopLayout();
    }
}
```

### Touch Gestures
- **Swipe Navigation**: Mobile document browsing
- **Pinch Zoom**: Document preview zooming
- **Touch Feedback**: Visual response to touch events

## 🔒 Security Considerations

### XSS Prevention
```javascript
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
```

### CSRF Protection
```javascript
function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]').value;
}
```

### Content Security Policy
- Inline script prevention
- External resource validation
- Nonce-based execution

## 📈 Performance Optimization

### Code Splitting
- **Lazy Loading**: Load scripts only when needed
- **Module Bundling**: Combine related functionality
- **Minification**: Compressed production files

### Caching Strategy
```javascript
const cache = new Map();

function getCachedData(key) {
    return cache.get(key);
}

function setCachedData(key, data, ttl = 300000) { // 5 minutes
    cache.set(key, { data, expires: Date.now() + ttl });
}
```

### Event Optimization
```javascript
// Debounced search function
const debouncedSearch = debounce(function(query) {
    performSearch(query);
}, 300);
```

## 🧪 Testing Strategy

### Unit Testing
- Individual function testing
- Mock API responses
- Edge case handling

### Integration Testing
- Component interaction testing
- API integration validation
- User workflow testing

### Browser Testing
- Cross-browser compatibility
- Mobile device testing
- Performance benchmarking

## 🔧 Development Guidelines

### Code Standards
- **ES6+ Features**: Modern JavaScript syntax
- **Consistent Naming**: camelCase for functions and variables
- **Documentation**: JSDoc comments for functions
- **Error Handling**: Try-catch blocks for async operations

### Best Practices
```javascript
// Good: Async/await pattern
async function loadData() {
    try {
        const data = await fetch('/api/data');
        return await data.json();
    } catch (error) {
        handleError(error);
    }
}

// Good: Event delegation
document.addEventListener('click', function(event) {
    if (event.target.matches('.btn-action')) {
        handleAction(event.target);
    }
});
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```javascript
function trackPerformance(operation, startTime) {
    const duration = Date.now() - startTime;
    console.log(`${operation} completed in ${duration}ms`);
}
```

### User Analytics
- Page view tracking
- Feature usage statistics
- Error frequency monitoring
- User interaction patterns

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Browser Support**: Modern browsers (ES6+)  
**Testing Coverage**: 85%+
