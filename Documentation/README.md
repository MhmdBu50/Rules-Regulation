# Rules & Regulations System - Documentation

## 📋 Project Overview

The **Rules & Regulations System** is a comprehensive web application designed for Imam Abdulrahman Bin Faisal University to manage and distribute university rules, regulations, and administrative documents. The system provides multilingual support (English/Arabic) and serves both administrative staff and university members.

## 🏗️ Architecture Overview

- **Framework**: ASP.NET Core 9.0 MVC
- **Database**: Oracle Database
- **Frontend**: Razor Views with Bootstrap 5
- **Authentication**: Cookie-based Authentication
- **Localization**: English/Arabic Support
- **File Management**: PDF document handling and storage

## 📁 Documentation Structure

### 🎯 Controllers Documentation
- [AccountController](./Controllers/AccountController.md) - User authentication and authorization
- [AdminController](./Controllers/AdminController.md) - Administrative functions and management
- [HomeController](./Controllers/HomeController.md) - Main page and document display
- [ServiceController](./Controllers/ServiceController.md) - Document services and operations
- [ErrorController](./Controllers/ErrorController.md) - Error handling and logging
- [LanguageController](./Controllers/LanguageController.md) - Localization management
- [SavedController](./Controllers/SavedController.md) - User's saved documents
- [HistoryController](./Controllers/HistoryController.md) - User activity tracking
- [ActivityLog](./Controllers/ActivityLog.md) - Administrative change log & diff viewer
- [PDFController](./Controllers/PDFController.md) - PDF operations and management

### 🎨 Views Documentation
- [Layout System](./Views/Layout-System.md) - Master layouts and shared components
- [Admin Views](./Views/Admin-Views.md) - Administrative interface views
- [Home Views](./Views/Home-Views.md) - Public interface views
- [Account Views](./Views/Account-Views.md) - Authentication views
- [Shared Components](./Views/Shared-Components.md) - Reusable view components

### ⚡ JavaScript Documentation
- [Frontend Architecture](./JavaScript/Frontend-Architecture.md) - JavaScript structure overview
- [Admin Functions](./JavaScript/Admin-Functions.md) - Administrative JavaScript modules
- [User Interface](./JavaScript/User-Interface.md) - UI interaction scripts
- [Language Switching](./JavaScript/Language-Switching.md) - Localization JavaScript
- [Document Management](./JavaScript/Document-Management.md) - Document handling scripts

### 🔧 Services Documentation
- [Database Services](./Services/Database-Services.md) - Data access layer
- [Oracle Service](./Services/Oracle-Service.md) - Oracle database operations
- [File Services](./Services/File-Services.md) - File management services

### 📊 Models Documentation
- [Entity Models](./Models/Entity-Models.md) - Database entity definitions
- [View Models](./Models/View-Models.md) - Data transfer objects
- [Database Context](./Models/Database-Context.md) - Entity Framework context

### 🎨 CSS Documentation
- [Styling Architecture](./CSS/Styling-Architecture.md) - CSS organization and structure
- [Theme System](./CSS/Theme-System.md) - University branding and theming
- [Responsive Design](./CSS/Responsive-Design.md) - Mobile and tablet support

### 🏛️ Architecture Documentation
- [System Architecture](./Architecture/System-Architecture.md) - Overall system design
- [Security Framework](./Architecture/Security-Framework.md) - Security implementation
- [Database Schema](./Architecture/Database-Schema.md) - Database design
- [Deployment Guide](./Architecture/Deployment-Guide.md) - Production deployment

## 🚀 Quick Start Guide

### Prerequisites
- .NET 9.0 SDK
- Oracle Database
- Visual Studio 2022 or VS Code

### Installation
1. Clone the repository
2. Configure connection strings in `appsettings.json`
3. Run database migrations
4. Build and run the application

### Development Workflow
1. Follow the MVC pattern
2. Use Entity Framework for data access
3. Implement proper error handling
4. Write comprehensive tests
5. Document all changes

## 🔐 Security Considerations

- **Authentication**: Cookie-based authentication with secure settings
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted sensitive information
- **Input Validation**: Comprehensive validation on all inputs
- **CSRF Protection**: Anti-forgery tokens on forms

## 🌐 Internationalization

The system supports:
- **English (en-US)**: Default language
- **Arabic (ar-SA)**: Full RTL support
- **Dynamic Switching**: Real-time language switching
- **Resource Files**: Localized content management

## 📈 Performance Optimization

- **Caching**: Memory caching for frequently accessed data
- **Database**: Optimized queries and indexing
- **Frontend**: Minified CSS/JS and image optimization
- **Session Management**: Efficient session handling

## 🧪 Testing Strategy

- **Unit Tests**: Controller and service testing
- **Integration Tests**: End-to-end functionality
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability assessment

## 📞 Support & Maintenance

For technical support and maintenance:
- Review error logs in the application
- Check database connectivity
- Monitor performance metrics
- Update dependencies regularly

---

**Last Updated**: August 13, 2025  
**Version**: 1.1  
**Recent Changes**:
- Added Activity Log documentation (dual diff, Arabic localization)
- Removed deprecated `Sections` field references
- Updated timestamps to use local time instead of UTC in logging/bookmarks
- Added Arabic entity/field localization details
**Maintained by**: Bukhamsin Development Team
