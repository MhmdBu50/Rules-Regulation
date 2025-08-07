# CSS & Styling Architecture

## 📝 Overview

The Rules & Regulations System employs a comprehensive CSS architecture that supports multilingual interfaces, responsive design, university branding, and accessibility standards. The styling system is organized modularly for maintainability and scalability.

## 🎨 Design System

### University Branding
- **Primary Colors**: Blue gradient schemes (#1a237e, #2b334f, #0f1734)
- **Secondary Colors**: Complementary university colors
- **Typography**: Professional font stacks with Arabic support
- **Logo Integration**: Consistent IAU branding throughout

### Visual Hierarchy
- **Header System**: H1-H6 with consistent spacing
- **Color Coding**: Semantic color usage for status and actions
- **Spacing System**: Consistent margin and padding scale
- **Border Radius**: Unified corner rounding for modern look

## 🏗️ CSS Architecture

### File Organization
```
wwwroot/css/
├── shared/
│   ├── _Layout.css         # Global layout styles
│   ├── footer.css          # Footer component styles
│   └── variables.css       # CSS custom properties
├── pages/
│   ├── LoginPage.css       # Authentication pages
│   ├── homePage.css        # Homepage specific styles
│   └── adminPage.css       # Administrative interfaces
├── components/
│   ├── buttons.css         # Button variants
│   ├── forms.css           # Form elements
│   └── modals.css          # Modal dialogs
└── utilities/
    ├── spacing.css         # Margin/padding utilities
    ├── typography.css      # Text utilities
    └── responsive.css      # Responsive utilities
```

### Methodology
- **BEM Naming**: Block-Element-Modifier for consistency
- **Component-Based**: Modular and reusable styles
- **Utility Classes**: Helper classes for common patterns
- **CSS Custom Properties**: Dynamic theming support

## 🌐 Multilingual Support (RTL/LTR)

### RTL Implementation
```css
/* RTL Direction Support */
body.rtl {
    direction: rtl;
    text-align: right;
}

body.rtl .container {
    padding-left: 15px;
    padding-right: 15px;
}

/* Logical properties for better RTL support */
.element {
    margin-inline-start: 1rem;
    margin-inline-end: 0.5rem;
    border-inline-start: 1px solid #ccc;
}
```

### Language-Specific Styling
```css
/* Arabic text styling */
html[lang="ar"] .text-content {
    font-family: 'Arial', 'Tahoma', sans-serif;
    line-height: 1.8;
    letter-spacing: 0;
}

/* English text styling */
html[lang="en"] .text-content {
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    letter-spacing: 0.5px;
}
```

### Navigation Adjustments
```css
/* Navigation for RTL */
body.rtl .navbar-nav {
    flex-direction: row-reverse;
}

body.rtl .dropdown-menu {
    right: 0;
    left: auto;
}
```

## 📱 Responsive Design System

### Breakpoint Strategy
```css
/* Mobile-first approach */
:root {
    --breakpoint-xs: 0;
    --breakpoint-sm: 576px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 992px;
    --breakpoint-xl: 1200px;
    --breakpoint-xxl: 1400px;
}

/* Media query mixins */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
    }
}

@media (min-width: 992px) {
    .container {
        max-width: 970px;
    }
}
```

### Responsive Components
```css
/* Responsive grid system */
.grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
}

@media (min-width: 768px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

## 🎯 Component Styling

### Button System
```css
/* Base button styles */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
}

/* Button variants */
.btn-primary {
    background: linear-gradient(135deg, #2E4B8B, #1a2b52);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #1a2b52, #2E4B8B);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(46, 75, 139, 0.4);
}

.btn-outline {
    background: transparent;
    border: 2px solid currentColor;
    color: #2E4B8B;
}
```

### Form Styling
```css
/* Form elements */
.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #2E4B8B;
}

.form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #2E4B8B;
    box-shadow: 0 0 0 3px rgba(46, 75, 139, 0.1);
}

/* RTL form adjustments */
body.rtl .form-control {
    text-align: right;
}
```

### Card Components
```css
.card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-bottom: 1px solid #dee2e6;
}

.card-body {
    padding: 1.5rem;
}
```

## 🦶 Footer System

### Sticky Footer Implementation
```css
/* Flexbox sticky footer */
.page-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* Footer styling */
.site-footer {
    background: linear-gradient(135deg, #1a237e 0%, #2b334f 50%, #0f1734 100%);
    color: white;
    margin-top: auto;
    padding: 1.5rem 0;
}

.footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1.5rem;
    padding: 0 2rem 1rem;
}

/* RTL footer adjustments */
body.rtl .footer-content {
    grid-template-columns: 1fr 1fr 1fr 2fr;
}
```

### Footer Spacing System
```css
/* Utility classes for footer spacing */
.mb-footer-space {
    margin-bottom: 2rem !important;
}

.mb-footer-space .card,
.mb-footer-space .table-container {
    margin-bottom: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}
```

## 🔧 Utility Classes

### Spacing System
```css
/* Margin utilities */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 1rem; }
.m-4 { margin: 1.5rem; }
.m-5 { margin: 3rem; }

/* Padding utilities */
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 1rem; }
.p-4 { padding: 1.5rem; }
.p-5 { padding: 3rem; }

/* Directional spacing */
.mt-auto { margin-top: auto; }
.mb-auto { margin-bottom: auto; }
.ms-auto { margin-inline-start: auto; }
.me-auto { margin-inline-end: auto; }
```

### Typography Utilities
```css
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* RTL text alignment */
body.rtl .text-start { text-align: right; }
body.rtl .text-end { text-align: left; }

/* Font weights */
.fw-light { font-weight: 300; }
.fw-normal { font-weight: 400; }
.fw-medium { font-weight: 500; }
.fw-semibold { font-weight: 600; }
.fw-bold { font-weight: 700; }
```

### Display Utilities
```css
.d-none { display: none; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-flex { display: flex; }
.d-grid { display: grid; }

/* Responsive display */
@media (max-width: 767px) {
    .d-md-none { display: none; }
    .d-md-block { display: block; }
}
```

## ♿ Accessibility Features

### Focus Management
```css
/* Focus indicators */
.btn:focus,
.form-control:focus,
.form-select:focus {
    outline: 2px solid #2E4B8B;
    outline-offset: 2px;
}

/* Skip links */
.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #2E4B8B;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 0 0 4px 4px;
}

.skip-link:focus {
    top: 0;
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
    .btn {
        border: 2px solid currentColor;
    }
    
    .card {
        border: 1px solid #000;
    }
}
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 🎨 Theme System

### CSS Custom Properties
```css
:root {
    /* Colors */
    --primary-color: #2E4B8B;
    --secondary-color: #1a2b52;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    --info-color: #17a2b8;
    
    /* Typography */
    --font-family-base: 'Segoe UI', 'Roboto', sans-serif;
    --font-family-arabic: 'Arial', 'Tahoma', sans-serif;
    --font-size-base: 1rem;
    --line-height-base: 1.6;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 3rem;
    
    /* Borders */
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 1rem;
    
    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
}
```

### Dark Mode Support (Future Enhancement)
```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg-color: #1a1a1a;
        --text-color: #ffffff;
        --card-bg: #2d2d2d;
    }
}
```

## 📊 Performance Optimization

### CSS Optimization
- **Critical CSS**: Inline above-the-fold styles
- **Minification**: Compressed CSS files for production
- **Tree Shaking**: Remove unused styles
- **Cache Busting**: Version-based cache invalidation

### Loading Strategy
```html
<!-- Critical CSS inline -->
<style>
    /* Critical above-the-fold styles */
</style>

<!-- Non-critical CSS lazy loaded -->
<link rel="preload" href="/css/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

## 🧪 Testing & Quality Assurance

### CSS Validation
- W3C CSS Validator compliance
- Cross-browser compatibility testing
- Responsive design validation
- Accessibility audit tools

### Performance Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

---

**Last Updated**: August 7, 2025  
**Version**: 1.0  
**Browser Support**: Modern browsers (CSS Grid, Flexbox)  
**Accessibility**: WCAG 2.1 AA compliant
