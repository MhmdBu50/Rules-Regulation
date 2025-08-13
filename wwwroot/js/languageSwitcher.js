document.addEventListener("DOMContentLoaded", () => {
    const languageToggleButton = document.getElementById("language-toggle");
    const bodyElement = document.body;

    // Define translatable texts - matching IDs in your .cshtml files
    const translations = {
        "en": {
            "Language345": "العربية",
            "Logout345": "Logout",
            //login translations
            "login-title": "Sign in to Rules And Regulations System",
            "username-label": "Username",
            "password-label": "Password",
            "login-button": "Login",
            "login-help": "Need help logging in?",
            // General page elements
            "page-title": "Home Page",
            "welcome-message": "Welcome to our platform. Please navigate through the sections below.",
            "dashboard-heading": "Editor Dashboard",
            "user-list-label": "List of Users",
            
            // Home page elements
            "admin-view-button": "Editor view",
            "searchInput": "Search ...", // This is the placeholder for the search input

            // Filter Section
            "filter-sections-heading": "Sections",
            "filter-students": "Students",
            "filter-members": "Members",
            "filter-enrolled-programs": "Enrolled Programs",
            "filter-alphabetical-heading": "Alphabetical filter",
            "filter-az": "A-Z",
            "filter-za": "Z-A",
            "filter-issue-date-heading": "Issue Date",
            "filter-newest-oldest": "Newest-Oldest",
            "filter-oldest-newest": "Oldest-Newest",
            "filter-specify-range": "Specify Range:",
            "filter-from-label": "From:",
            "filter-to-label": "To:",
            "filter-type-heading": "Type",
            "filter-regulations": "Regulations",
            "filter-guidelines": "Guidelines",
            "filter-policies": "Policies",
            "filter-apply-btn": "Apply",

            // Navigation Bar
            "nav-home-label": "Home",
            "nav-student-guides-label": "Student guides & templates",
            "nav-student-rules-label": "Student rules & regulations",
            "nav-employee-rules-label": "Employees’ rules & regulations",
            "nav-academic-rules-label": "Academic rules & regulations",
            "nav-student-guides-label1": "Student guides & templates",
            "nav-student-rules-label1": "Student rules & regulations",
            "nav-employee-rules-label1": "Employees’ rules & regulations",
            "nav-academic-rules-label1": "Academic rules & regulations",
            "nav-saved-rules-label": "Saved rules & regulations",
            "nav-history-label": "History",

            // No Records Message
            "no-records-heading": "No records found",
            "no-records-message": "There are currently no rules and regulations available.",

            // Chatbot Section
            "chatbot-name": "Chat with Mr. Kabsa",
            "chatbot-initial-message": "Hi, how can I help you today?",
            "message-input": "Type your message...", // This is the placeholder

            // Modal elements
            "modal-title-regulation-details": "Regulation Details",
            "modal-loading-spinner-text": "Loading...",
            "modal-loading-message": "Loading record details...",
            "modal-error-heading": "Error Loading Details",
            "modal-error-message": "Sorry, we couldn't load the record details. Please try again later.",
            // Multi-select dropdown
            "departmentMultiSelectButton": "Select Departments",

            // Record Details Page - _RecordDetails.cshtml
            "record-details-comprehensive-info": "Comprehensive information about this regulation",
            "record-details-department-label": "Department",
            "record-details-document-type-label": "Document Type",
            "record-details-version-label": "Version Number",
            "record-details-version-date-label": "Version Date",
            "record-details-sections-label": "Sections",
            "record-details-approval-info-title": "Approval Information",
            "record-details-approving-entity-label": "Approving Entity",
            "record-details-approval-date-label": "Approval Date",
            "record-details-description-label": "Description",
            "record-details-no-description": "No description available",
            "record-details-contact-info-title": "Department Contacts",
            // START Admin Page Translations
        "admin-exit-view-button": "Exit Editor view",
        "back-button": "Back",
        "admin-chart-title-overview": "University Rules and Guidelines Overview",
        "admin-chart-legend-academic-rules": "Academic rules & regulations",
        "admin-chart-legend-employment-rules": "Employment rules & regulations",
        "admin-chart-legend-student-rules": "Student rules & regulations",
        "admin-chart-legend-student-guides": "Student guides & templates",
        "admin-chart-legend-academic-rules1": "Academic rules & regulations",
        "admin-chart-legend-employment-rules1": "Employment rules & regulations",
        "admin-chart-legend-student-rules1": "Student rules & regulations",
        "admin-chart-legend-student-guides1": "Student guides & templates", // Added based on typical content
         "admin-chart-legend-academic-rules2": "Academic rules & regulations",
        "admin-chart-legend-employment-rules2": "Employment rules & regulations",
        "admin-chart-legend-student-rules2": "Student rules & regulations",
        "admin-chart-legend-student-guides2": "Student guides & templates",
         "admin-chart-legend-academic-rules3": "Academic rules & regulations",
        "admin-chart-legend-employment-rules3": "Employment rules & regulations",
        "admin-chart-legend-student-rules3": "Student rules & regulations",
        "admin-chart-legend-student-guides3": "Student guides & templates",
        "admin-chart-title-visits": "Website visits over the past 6 months",
        "admin-stats-total-policies": "Total Policies",
        "admin-stats-most-viewed": "Most Viewed",
        "admin-stats-viewed-text": "Viewed",
        "admin-stats-times-text": "times",
        "admin-button-view-report": "View Report",
        "admin-button-add-new-record": "Add New Record",
        "admin-button-export-data": "Export Data",
        "admin-button-manage-contact-info": "Manage Contact Info",
        "contactSearchInput": "Search contacts by name, department, email...",
        "contact-filter-by-department": "Filter by Department:",
        "contact-all-departments": "All Departments",
        "contact-all-departments-option": "All Departments",
        "contact-departments-text": "Departments",
        "dept-reg-admission": "Reg and Admission",
        "dept-ccsit": "CCSIT",
        "dept-communication-tech": "Communication and tech",
        "dept-hospital": "Hospital",
        "dept-library": "Library",
        "dept-students-affairs": "Students Affairs",
        "dept-preparetory": "Preparetory",
        "dept-academic-affairs": "Academic Affairs",
        "visitToggler": "Monthly Visits",
        "desktopSearchInput": "Search by Name/ID...",
        "admin-clear-search-title": "Clear search",
        "admin-section-filter-all": "All Sections",
        "admin-section-filter-students": "Students",
        "admin-section-filter-members": "Members",
        "admin-section-filter-enrolled-programs": "Enrolled Programs",
        "admin-document-filter-all": "All Documents",
        "admin-document-filter-all1": "All Documents",
        "admin-document-filter-regulation": "Regulations",
        "admin-document-filter-guidelines": "Guidelines",
        "admin-document-filter-policy": "Policies",
        "admin-delete-button-alt": "Delete btn",
        "admin-table-header-id": "ID",
        "admin-table-header-regulation-name": "Regulation/ Manual name",
        "admin-table-header-documentType": "Document Type",
        "admin-table-header-version-number": "Version Number",
        "admin-table-header-approving-date": "Approving Date",
        "admin-table-header-responsible-entity": "Responsible Entity",
        "admin-table-form-regulation-name-label": "Regulation/ Manual name (English)",
        "admin-table-form-regulation-name-ar-label": "Regulation/ Manual name (Arabic)",
        "admin-table-form-brief-description-label": "Brief Description (English)",
        "admin-table-form-brief-description-ar-label": "Brief Description (Arabic)",
        "admin-table-form-approving-date-label": "Approving Date",
        "admin-table-form-version-date-label": "Version Date",
        "admin-table-form-version-number-label": "Version Number",
        "admin-table-form-approving-entity-label": "Approving Entity (English)",
        "admin-table-form-approving-entity-ar-label": "Approving Entity (Arabic)",
        "admin-table-form-responsible-department-label": "Responsible Department",
        "admin-table-form-note-label": "Note (English)",
        "admin-table-form-note-ar-label": "Note (Arabic)",
        "admin-table-form-document-type-label": "Document Type",
        "admin-table-form-section-label": "Section",
        "admin-table-form-attach-word-label": "Attach word file",
        "admin-table-form-attach-pdf-label": "Attach PDF file",
        "admin-table-form-page-number-label":"Thumbnail page number",
        "admin-table-form-upload-file-title": "Click Edit to enable file upload",
        "admin-table-form-responsible-contact-label": "Responsible Department contact information:",
        "admin-table-form-contact-name-label": "Name",
        "admin-table-form-contact-name-en-label": "Name (English)",
        "admin-table-form-contact-name-ar-label": "Name (Arabic)",
        "admin-table-form-contact-email-label": "E-mail",
        "admin-table-form-contact-telephone-label": "Telephone number",
        "admin-table-form-contact-mobile-label": "Mobile number",
        "admin-table-form-no-contact-info": "No contact information available for this department.",
        "admin-table-delete-button": "Delete",
        "admin-table-edit-button": "Edit",
        "admin-table-save-button": "Save",
        "admin-table-cancel-button": "Cancel",
        "admin-no-records-heading": "No records found",
        "admin-no-records-message": "There are currently no rules and regulations in the database.",
        "admin-add-new-record-button": "Add New Record",
        // add new record translations
        "add-record-page-title": "New Record",
        "label-regulationName": "Regulation/Manual Name (English)",
        "label-regulationNameAr": "Regulation/Manual Name (Arabic)",
        "label-relevantDepartment": "Relevant Department",
        "label-pageNumber": "Page Number",
        "placeholder-pageNumber": "Enter a page number for the thumbnail",
        "label-versionNumber": "Version Number",
        "label-versionDate": "Version Date",
        "label-approvingDate": "Approving Date",
        "label-approvingEntity": "Approving Entity (English)",
        "label-approvingEntityAr": "Approving Entity (Arabic)",
        "label-wordAttachment": "Word Attachment",
        "label-pdfAttachment": "PDF Attachment",
        "label-description": "Brief Description (English)",
        "label-descriptionAr": "Brief Description (Arabic)",
        "label-notes": "Notes (English)",
        "label-notesAr": "Notes (Arabic)",
        "label-documentType": "Document Type",
        "btn-save": "Save and upload",
        "btn-cancel": "Cancel",
        "btn-logout": "Logout",
        "btn-back": "Back",
    "label-relevantDepartment": "Relevant Department",
    "select-department1": "Select department",
    "option-dept-reg": "Reg and Admission",
    "option-dept-ccsit": "CCSIT",
    "option-dept-tech": "Communication and tech",
    "option-dept-hospital": "Hospital",
    "option-dept-library": "Library",
    "option-dept-students": "Students Affairs",
    "option-dept-prep": "Preparetory",
    "option-dept-academic": "Academic Affairs",
    "label-doc-type-section-7851": 'Document Type',
    "label-doc-student-guides-7851": 'Student guides & templates',
    "label-doc-student-rules-7851": 'Student rules & regulations',
    "label-doc-employee-rules-7851": 'Employees’ rules & regulations',
    "label-doc-academic-rules-7851": 'Academic rules & regulations',
    // contact info translations
    "title-90101": "Add New Contact Info",
    "topbar-back-90101": "Back",
    "topbar-logout-90101": "Logout",
    "main-header-90101": "Add Contact Information",
    "subtitle-90101": "Add new contact information for departments",
    "label-department-90101": "*Relevant Department",
    "option-select-dept-90101": "Select department",
    "option-reg-90101": "Reg and Admission",
    "option-ccsit-90101": "CCSIT",
    "option-commtech-90101": "Communication and tech",
    "option-hospital-90101": "Hospital",
    "option-library-90101": "Library",
    "option-affairs-90101": "Students Affairs",
    "option-prep-90101": "Preparetory",
    "option-academic-90101": "Academic Affairs",
    "label-name-en-90101": "*Name of Responsible Person (English)",
    "label-name-ar-90101": "*Name of Responsible Person (Arabic)",
    "label-email-90101": "*E-mail",
    "label-telephone-90101": "*Telephone number",
    "label-mobile-90101": "Mobile number",
    "btn-submit-90101": "Submit",
    "btn-cancel-90101": "Cancel",
    "manageContact-title33": "Manage Contact Information",
    "manageContact-subtitle33": "View and manage all contact information",
    "addContact-btn33": "Add New Contact",
    "back-btn33": "Back",
    "logout-btn33": "Logout",
    "table-header-contactType33": "Contact Type",
    "table-header-contactValue33": "Contact Value",
    "table-header-action33": "Action",
    "edit-btn33": "Edit",
    "delete-btn33": "Delete",
    "table-header-department33": "Department",
    "table-header-name33": "Name",
    "table-header-email33": "Email",
    "table-header-mobile33": "Mobile",
    "table-header-telephone33": "Telephone",
    "table-header-actions33": "Actions",
    "empty-state-title33": "No contact information found",
    "empty-state-desc33": "Click the button below to add new contact information.",
    "empty-state-button33": "Add New Contact Info",
    "modal-title-delete33": "Confirm Delete",
    "modal-body-confirmation33": "Are you sure you want to delete the contact information for:",
    "modal-warning33": "This action cannot be undone!",
    "modal-button-cancel33": "Cancel",
    "modal-button-delete33": "Delete Contact",
    // edit contact info translations
    "title-90201": "Edit Contact Info",
    "topbar-back-90201": "Back",
    "topbar-logout-90201": "Logout",
    "main-header-90201": "Edit Contact Information",
    "subtitle-90201": "Update contact information details",
    "label-department-90201": "Relevant Department",
    "option-select-dept-90201": "Select department",
    "option-reg-90201": "Reg and Admission",
    "option-ccsit-90201": "CCSIT",
    "option-commtech-90201": "Communication and tech",
    "option-hospital-90201": "Hospital",
    "option-library-90201": "Library",
    "option-affairs-90201": "Students Affairs",
    "option-prep-90201": "Preparetory",
    "option-academic-90201": "Academic Affairs",
    "label-name-en-90201": "Name of Responsible Person (English)",
    "label-name-ar-90201": "Name of Responsible Person (Arabic)",
    "label-email-90201": "E-mail",
    "label-telephone-90201": "Telephone number",
    "label-mobile-90201": "Mobile number",
    "btn-update-90201": "Update Contact Info",
    "btn-cancel-90201": "Cancel",
    
    //------------------------report page translations------------------------

    "btn-back-admin": "Back to Admin",
    "dashboard-title": "Analytics Dashboard",
    "dashboard-subtitle": "Comprehensive system statistics and insights",
    "btn-export-pdf": "Export PDF",

    "stat-total-documents": "Total Documents",
    "stat-total-users": "Registered Users",
    "stat-total-downloads": "Total Downloads",
    "stat-total-views": "Total Views",

    "chart-views-downloads": "Views & Downloads over Time",
    "chart-top-viewed": "Top 5 Most Viewed Records",
    "chart-top-downloaded": "Top 5 Most Downloaded Records",
    "chart-type-distribution": "Document Type Distribution",

    "list-top-downloaded": "Top Downloaded",
    "list-top-viewed": "Top Viewed",
    "list-most-details": "Most Details Shown",
    "msg-no-download-data": "No download data available",
    "msg-no-view-data": "No view data available",
    "msg-no-details-data": "No details data available",

    "table-title": "Document Statistics",
    "sort-total": "Sort by Total Interactions",
    "sort-downloads": "Sort by Downloads",
    "sort-views": "Sort by Views",
    "sort-details": "Sort by Details Shown",
    "sort-name": "Sort by Name",
    "sort-type": "Sort by Document Type",

    "filter-all-types": "All Document Types",

    "th-record-id": "Record ID",
    "th-doc-name": "Document Name",
    "th-type": "Type",
    "th-department": "Department",
    "th-downloads": "Downloads",
    "th-views": "Views",
    "th-details": "Details",
    "th-total": "Total",

    // ==================== HISTORY PAGE TRANSLATIONS (ENGLISH) ====================
    // These translation keys were added to support Arabic-English language switching
    // for the history page functionality. Each key corresponds to a specific UI element.
    
    // Main page header elements - displayed at the top of history page
    "history-activity-title": "Your Activity History", // Main title shown in page header
    "history-track-activity": "Track your recent views and downloads", // Subtitle description
    
    // View toggle buttons - allow users to switch between table and card layouts
    "history-table-btn": "Table", // Button text for table view mode
    "history-cards-btn": "Cards", // Button text for card view mode
    
    // Card view elements - used in card display mode
    "history-action-status": "Action Status", // Header for action status section in cards
    
    // Table column headers - displayed in table view mode
    "history-record-name": "RECORD NAME", // Column header for document names
    "history-all-actions": "ALL ACTIONS", // Column header showing all user actions
    "history-last-action": "LAST ACTION", // Column header for most recent action
    "history-timestamp": "TIMESTAMP", // Column header for action date/time
    
    // Action type labels - used in badges and status indicators
    "history-view": "View", // Label for document viewing action
    "history-download": "Download", // Label for document download action
    "history-show-details": "Show Details", // Label for viewing details action
    
    // Action status indicators - show completion status of actions
    "history-viewed": "Viewed", // Status indicating document was viewed
    "history-downloaded": "Downloaded", // Status indicating document was downloaded
    "history-not-performed": "Not performed", // Status for actions not yet taken
    "history-no-actions": "No actions yet", // Message when no actions exist
    
    // Empty state messages - displayed when user has no history
    "history-no-history": "No History Yet", // Main message for empty history
    "history-start-viewing": "Start viewing or downloading records to see your activity here!", // Instructional text
    
    // Category labels for action grouping - used in informational displays
    "history-view-actions": "View actions", // Label for view action category
    "history-download-actions": "Download actions", // Label for download action category
    "history-details-actions": "Show details actions", // Label for details action category
    
    // Status and loading indicators
    "history-action-status": "Action Status", // Header for action status section
    "history-loading": "Loading...", // Generic loading message
    "history-loading-text": "Loading your history...", // Specific loading message for history
    // assign new editor translations
    "assign-editor-page-title-452": "Assign New Editor",
    "assign-editor-page-subtitle-453": "Manage user roles and editor privileges",
    "loading-text-processing-454": "Processing...",
    "stats-label-admins-455": "Admins",
    "stats-label-editors-456": "Editors",
    "stats-label-regular-users-457": "Regular Users",
    "search-button-459": "Search",
    "role-badge-admin-460": "Admin",
    "role-badge-editor-461": "Editor",
    "role-badge-user-462": "User",
    "system-admin-463": "System Admin",
    "promote-modal-title-463": "Promote to Editor",
    "demote-modal-title-464": "Demote to User",
    "confirmation-modal-confirm-465": "Confirm",
    "alert-close-button-466": "Close",
    "alert-no-userfound-467": "No user found",
    "clear-search-button-468": "Clear Search",
    //export data translations
    "export-modal-title": "Select Tables to Export",
    "export-modal-description": "Choose which database tables to include in your Excel export:",
    "export-option-all-tables": "All Tables",
    "export-option-all-tables-desc": "Export all available database tables",
    "export-option-records": "Records",
    "export-option-records-desc": "All regulation and policy records",
    "export-option-users": "Users",
    "export-option-users-desc": "All registered users information",
    "export-option-contact": "Contact Information",
    "export-option-contact-desc": "Department contact details",
    "export-option-attachments": "Attachments",
    "export-option-attachments-desc": "File attachments and documents",
    "export-option-history": "User History",
    "export-option-history-desc": "User activity and action logs",
    "export-button-cancel": "Cancel",
    "export-button-confirm": "Export Selected Tables",

    "admin-button-assign-editor": "Activity Log",
    
    // AdminPortal translations
    "admin-portal-title": "Admin Portal",
    "admin-portal-subtitle": "Quick access to main administrative tools",
    "admin-portal-home-title": "Home Page",
    "admin-portal-home-desc": "Overview and quick links",
    "admin-portal-home-cta": "Open →",
    "admin-portal-editor-title": "Editor Page",
    "admin-portal-editor-desc": "Manage records and content",
    "admin-portal-editor-cta": "Open →",
    "admin-portal-activity-title": "Activity Log",
    "admin-portal-activity-desc": "Review all admin/editor changes",
    "admin-portal-activity-cta": "Open →",
    "admin-portal-assign-title": "Assign New Editor",
    "admin-portal-assign-desc": "Grant editor access",
    "admin-portal-assign-cta": "Open →",
    

    // Mobile Menu Translations
    "mobile-home": "Home",
    "mobile-admin-view": "view as Admin",
    "mobile-student-guides": "Student Guides & Templates",
    "mobile-student-rules": "Student Rules & Regulations",
    "mobile-employee-rules": "Employees’ rules & regulations",
    "mobile-academic-rules": "Academic Rules & Regulations",
    "mobile-saved-rules": "Saved Rules & Regulations",
    "mobile-history": "History",
    "mobile-language-text": "العربية",
    "mobile-logout": "logout",
    "mobile-exit-edit-text": "Exit edit mode",

    // log page translations
    "activityLog-page-title": "Activity Log",
    "activityLog-subtitle": "Monitor and track all privileged user actions and changes",
    "activityLog-total-actions": "Total Actions",
    "activityLog-admin-actions": "Admin Actions",
    "activityLog-editor-actions": "Editor Actions",
    "activityLog-record-changes": "Record Changes",
    "activityLog-contact-changes": "Contact Changes",
    "activityLog-action-type": "Action Type",
    "activityLog-all-actions": "All Actions",
    "activityLog-entity-type": "Entity Type",
    "activityLog-all-entities": "All Entities",
    "activityLog-user-role": "User Role",
    "activityLog-all-roles": "All Roles",
    "activityLog-start-date": "Start Date",
    "activityLog-end-date": "End Date",
    "activityLog-apply-filters": "Apply Filters",
    "activityLog-table-header-action": "Action",
    "activityLog-table-header-timestamp": "Timestamp",
    "activityLog-table-header-user": "User",
    "activityLog-table-header-entity": "Entity",
    "activityLog-table-header-details": "Details",
    "activityLog-view-details": "View Details",
    "activityLog-no-records-found": "No records found",
    "activityLog-no-records-message": "There are no activity records that match your search criteria.",
    "activityLog-previous": "Previous",
    "activityLog-next": "Next",
    "activityLog-details-modal-title": "Activity Details",
    "activityLog-record-id": "Record ID",
    "activityLog-previous-state": "Previous State",
    "activityLog-current-state": "Current State",
    "activityLog-close": "Close",
    "Logout345": "Logout",
    "btn-back": "Back",
    "Add": "Add",
    "Edit": "Edit",
    "Delete": "Delete",
    "Record": "Record",
    "Contact": "Contact",
    "Admin": "Admin",
    "Editor": "Editor",
    "apply": "APPLY",
    "Clear": "Clear",
    "modal-loading-spinner-text": "Loading...",
    "modal-loading-message": "Loading details...",
    "activityLog-table-header-log-id": "Log ID",
    "activityLog-table-header-user": "User",
    "activityLog-table-header-role": "Role",
    "activityLog-table-header-action": "Action",
    "activityLog-table-header-entity": "Entity",
    "activityLog-table-header-entity-details": "Entity Details",
    "activityLog-table-header-timestamp": "Timestamp",
    "activityLog-table-header-summary": "Summary",
    "activityLog-table-header-options": "Options",
    "activityLog-log-id-label": "LOG_ID",
    "activityLog-user-id-label": "ID:",
    "activityLog-user-id-label2": "ID:",
    "activityLog-role-admin": "ADMIN",
    "activityLog-role-editor": "EDITOR",
    "activityLog-action-add": "ADD",
    "activityLog-action-edit": "EDIT",
    "activityLog-action-delete": "DELETE",
    "activityLog-entity-record": "RECORD",
    "activityLog-entity-contact": "CONTACT",
    "activityLog-entity-name-unknown": "Unknown",
    "activityLog-entity-id-label": "ID:",
    "activityLog-summary-add": "New",
    "created": "created",
    "activityLog-summary-delete": "removed",
    "activityLog-summary-no-details": "No details available",
    "activityLog-options-view-details": "VIEW DETAILS",
    "Previous": "Previous",
    "no-activity-found": "No Activity Found",
    "try-adjusting-filters": "Try adjusting your filters or search terms.",
    "modal-loading-status": "Loading...",
    "Loading activity details...": "Loading activity details...",
    "close" : "Close",

        },
        "ar": {
            "Language345": "English",
            "Logout345": "تسجيل الخروج",
            //login translations
            "login-title": "تسجيل الدخول إلى نظام اللوائح والتنظيمات",
            "username-label": "اسم المستخدم",
            "password-label": "كلمة المرور",
            "login-button": "تسجيل الدخول",
            "login-help": "هل تحتاج مساعدة في تسجيل الدخول؟",
            // General page elements
            "page-title": "الرئيسية",
            "welcome-message": "مرحباً بك في منصتنا. يرجى التنقل عبر الأقسام أدناه.",
            "dashboard-heading": "لوحة تحكم المحرر",
            "user-list-label": "قائمة المستخدمين",

            // Home page elements
            "admin-view-button": "عرض المحرر",
            "searchInput": " ابحث...",

            // Filter Section
            "filter-sections-heading": "الأقسام",
            "filter-students": "الطلاب",
            "filter-members": "الأعضاء",
            "filter-enrolled-programs": "البرامج المسجلة",
            "filter-alphabetical-heading": "الترتيب الأبجدي",
            "filter-az": "أ-ي",
            "filter-za": "ي-أ",
            "filter-issue-date-heading": "تاريخ الإصدار",
            "filter-newest-oldest": "من الأحدث للأقدم",
            "filter-oldest-newest": "من الأقدم للأحدث",
            "filter-specify-range": "تحديد النطاق:",
            "filter-from-label": "من:",
            "filter-to-label": "إلى:",
            "filter-type-heading": "النوع",
            "filter-regulations": "لوائح",
            "filter-guidelines": "إرشادات",
            "filter-policies": "سياسات",
            "filter-apply-btn": "تطبيق",

            // Navigation Bar
            "nav-home-label": "الرئيسية",
            "nav-student-guides-label": "أدلة ونماذج الطلاب",
            "nav-student-rules-label": "قواعد وأنظمة الطلاب",
            "nav-employee-rules-label": "قواعد وأنظمة الموظفين",
            "nav-academic-rules-label": "القواعد واللوائح الأكاديمية",
            "nav-saved-rules-label": "القواعد واللوائح المحفوظة",
             "nav-student-guides-label1": "أدلة ونماذج الطلاب",
            "nav-student-rules-label1": "قواعد وأنظمة الطلاب",
            "nav-employee-rules-label1": "قواعد وأنظمة الموظفين",
            "nav-academic-rules-label1": "القواعد واللوائح الأكاديمية",
            "nav-saved-rules-label": "القواعد واللوائح المحفوظة",
            "nav-history-label": "السجل",

            // No Records Message
            "no-records-heading": "لا توجد سجلات",
            "no-records-message": "لا توجد قواعد وأنظمة متاحة حاليًا.",

            // Chatbot Section
            "chatbot-name": "الدردشة مع السيد كبسة",
            "chatbot-initial-message": "مرحباً، كيف يمكنني مساعدتك اليوم؟",
            "message-input": "... اكتب رسالتك",

            // Modal elements
            "modal-title-regulation-details": "تفاصيل اللائحة",
            "modal-loading-spinner-text": "جاري التحميل...",
            "modal-loading-message": "جاري تحميل تفاصيل السجل...",
            "modal-error-heading": "خطأ في تحميل التفاصيل",
            "modal-error-message": "عذراً، لم نتمكن من تحميل تفاصيل السجل. يرجى المحاولة مرة أخرى لاحقاً.",
            // Multi-select dropdown
            "departmentMultiSelectButton": "اختر الأقسام",

            // Record Details Page - _RecordDetails.cshtml
            "record-details-comprehensive-info": "معلومات شاملة حول هذه اللائحة",
            "record-details-department-label": "القسم",
            "record-details-document-type-label": "نوع المستند",
            "record-details-version-label": "رقم الإصدار",
            "record-details-version-date-label": "تاريخ الإصدار",
            "record-details-sections-label": "الأقسام",
            "record-details-approval-info-title": "معلومات الاعتماد",
            "record-details-approving-entity-label": "الجهة المعتمدة",
            "record-details-approval-date-label": "تاريخ الاعتماد",
            "record-details-description-label": "الوصف",
            "record-details-no-description": "لا يوجد وصف متاح",
            "record-details-contact-info-title": "جهات الاتصال بالقسم",
        "admin-exit-view-button": "الخروج من عرض المحرر",
        "back-button": "رجوع",
        "admin-chart-title-overview": "نظرة عامة على قواعد وإرشادات الجامعة",
        "admin-chart-legend-academic-rules": "القواعد واللوائح الأكاديمية",
        "admin-chart-legend-employment-rules": "قواعد وأنظمة الموظفين",
        "admin-chart-legend-student-rules": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides": "أدلة ونماذج الطلاب",
        "admin-chart-legend-academic-rules1": "القواعد واللوائح الأكاديمية",
        "admin-chart-legend-employment-rules1": "قواعد وأنظمة الموظفين",
        "admin-chart-legend-student-rules1": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides1": "أدلة ونماذج الطلاب",
        "admin-chart-legend-academic-rules2": "القواعد واللوائح الأكاديمية",
        "admin-chart-legend-employment-rules2": "قواعد وأنظمة الموظفين",
        "admin-chart-legend-student-rules2": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides2": "أدلة ونماذج الطلاب",
        "admin-chart-legend-academic-rules3": "القواعد واللوائح الأكاديمية",
        "admin-chart-legend-employment-rules3": "قواعد وأنظمة الموظفين",
        "admin-chart-legend-student-rules3": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides3": "أدلة ونماذج الطلاب",
        "admin-chart-title-visits": "زيارات الموقع خلال الستة أشهر الماضية",
        "admin-stats-total-policies": "إجمالي السياسات",
        "admin-stats-most-viewed": "الأكثر مشاهدة",
        "admin-stats-viewed-text": "مشاهدات",
        "admin-stats-times-text": "مرة",
        "label-pageNumber":"رقم الصفحة",
        "placeholder-pageNumber": "أدخل رقم الصفحة للصورة المصغرة",
        "admin-button-view-report": "عرض التقرير",
        "admin-button-add-new-record": "إضافة سجل جديد",
        "admin-button-export-data": "تصدير البيانات",
        "admin-button-manage-contact-info": "إدارة معلومات الاتصال",
        "contactSearchInput": "البحث في جهات الاتصال بالاسم أو القسم أو البريد الإلكتروني...",
        "contact-filter-by-department": "تصفية حسب القسم:",
        "contact-all-departments": "جميع الأقسام",
        "contact-all-departments-option": "جميع الأقسام",
        "contact-departments-text": "أقسام",
        "dept-reg-admission": "التسجيل والقبول",
        "dept-ccsit": "كلية علوم الحاسب وتقنية المعلومات",
        "dept-communication-tech": "الاتصالات والتقنية",
        "dept-hospital": "المستشفى",
        "dept-library": "المكتبة",
        "dept-students-affairs": "شؤون الطلاب",
        "dept-preparetory": "السنة التحضيرية",
        "dept-academic-affairs": "الشؤون الأكاديمية",
        "visitToggler": "الزيارات الشهرية",
        "desktopSearchInput": "البحث بالاسم/رقم السجل...",
        "mobileSearchInput": "البحث بالاسم/رقم السجل...",
        "admin-clear-search-title": "مسح البحث",
        "admin-section-filter-all": "جميع الأقسام",
        "admin-section-filter-students": "الطلاب",
        "admin-section-filter-members": "الأعضاء",
        "admin-section-filter-enrolled-programs": "البرامج المسجلة",
        "admin-document-filter-all": "جميع المستندات",
        "admin-document-filter-all1": "جميع المستندات",
        "admin-document-filter-regulation": "لوائح",
        "admin-document-filter-guidelines": "إرشادات",
        "admin-document-filter-policy": "سياسات",
        "admin-delete-button-alt": "زر الحذف",
        "admin-table-header-id": "رقم",
        "admin-table-header-regulation-name": "اسم اللائحة/الدليل",
        "admin-table-header-documentType": "نوع المستند",
        "admin-table-header-version-number": "رقم الإصدار",
        "admin-table-header-approving-date": "تاريخ الاعتماد",
        "admin-table-header-responsible-entity": "الجهة المسؤولة",
        "admin-table-form-regulation-name-label": "اسم اللائحة/الدليل (انجليزي)",
        "admin-table-form-regulation-name-ar-label": "اسم اللائحة/الدليل (عربي)",
        "admin-table-form-brief-description-label": "وصف موجز (انجليزي)",
        "admin-table-form-brief-description-ar-label": "وصف موجز (عربي)",
        "admin-table-form-approving-date-label": "تاريخ الاعتماد",
        "admin-table-form-version-date-label": "تاريخ الإصدار",
        "admin-table-form-version-number-label": "رقم الإصدار",
        "admin-table-form-approving-entity-label": "الجهة المعتمدة (انجليزي)",
        "admin-table-form-approving-entity-ar-label": "الجهة المعتمدة (عربي)",
        "admin-table-form-responsible-department-label": "القسم المسؤول",
        "admin-table-form-note-label": "ملاحظة (انجليزي)",
        "admin-table-form-note-ar-label": "ملاحظة (عربي)",
        "admin-table-form-document-type-label": "نوع المستند",
        "admin-table-form-section-label": "القسم",
        "admin-table-form-attach-word-label": "إرفاق ملف وورد",
        "admin-table-form-attach-pdf-label": "PDF إرفاق ملف",
        "admin-table-form-page-number-label":"رقم صورة العرض",
        "admin-table-form-upload-file-title": "انقر على تحرير لتمكين تحميل الملف",
        "admin-table-form-responsible-contact-label": ":معلومات الاتصال بالقسم المسؤول",
        "admin-table-form-contact-name-label": "الاسم",
        "admin-table-form-contact-name-en-label": "الاسم (انجليزي)",
        "admin-table-form-contact-name-ar-label": "الاسم (عربي)",
        "admin-table-form-contact-email-label": "البريد الإلكتروني",
        "admin-table-form-contact-telephone-label": "رقم الهاتف",
        "admin-table-form-contact-mobile-label": "رقم الجوال",
        "admin-table-form-no-contact-info": "لا توجد معلومات اتصال متاحة لهذا القسم.",
        "admin-table-delete-button": "حذف",
        "admin-table-edit-button": "تحرير",
        "admin-table-save-button": "حفظ",
        "admin-table-cancel-button": "إلغاء",
        "admin-no-records-heading": "لا توجد سجلات",
        "admin-no-records-message": ".لا توجد قواعد وأنظمة في قاعدة البيانات حاليًا",
        "admin-add-new-record-button": "إضافة سجل جديد",
        "admin-success-message-heading": "نجاح!",
        "admin-error-message-heading": "خطأ!",
        // add new record translations
        "add-record-page-title": "إضافة سجل جديد",
        "label-regulationName": "اسم النظام / الدليل (بالإنجليزية)",
        "label-regulationNameAr": "اسم النظام / الدليل (بالعربية)",
        "label-relevantDepartment": "القسم المعني",
        "label-versionNumber": "رقم الإصدار",
        "label-versionDate": "تاريخ الإصدار",
        "label-approvingDate": "تاريخ الاعتماد",
        "label-approvingEntity": "جهة الاعتماد (بالإنجليزية)",
        "label-approvingEntityAr": "جهة الاعتماد (بالعربية)",
        "label-wordAttachment": "ملف Word مرفق",
        "label-pdfAttachment": "ملف PDF مرفق",
        "label-description": "وصف مختصر (بالإنجليزية)",
        "label-descriptionAr": "وصف مختصر (بالعربية)",
        "label-notes": "ملاحظات (بالإنجليزية)",
        "label-notesAr": "ملاحظات (بالعربية)",
        "label-documentType": "نوع المستند",
        "btn-save": "حفظ ورفع الملف",
        "btn-cancel": "إلغاء",
        "btn-logout": "تسجيل الخروج",
        "btn-back": "رجوع",
    "label-relevantDepartment": "القسم المعني",
    "select-department1": "اختر القسم",
    "option-dept-reg": "التسجيل والقبول",
    "option-dept-ccsit": "كلية علوم الحاسب وتقنية المعلومات",
    "option-dept-tech": "الاتصالات والتقنية",
    "option-dept-hospital": "المستشفى",
    "option-dept-library": "المكتبة",
    "option-dept-students": "شؤون الطلاب",
    "option-dept-prep": "السنة التحضيرية",
    "option-dept-academic": "الشؤون الأكاديمية",
    "label-doc-type-section-7851": 'نوع المستند',
    "label-doc-student-guides-7851": 'أدلة ونماذج الطلاب',
    "label-doc-student-rules-7851": 'قواعد وأنظمة الطلاب',
    "label-doc-employee-rules-7851": 'قواعد وأنظمة الموظفين',
    "label-doc-academic-rules-7851": 'القواعد واللوائح الأكاديمية',
    // contact info translations
    "title-90101": "إضافة معلومات تواصل جديدة",
    "topbar-back-90101": "رجوع",
    "topbar-logout-90101": "تسجيل الخروج",
    "main-header-90101": "إضافة معلومات التواصل",
    "subtitle-90101": "قم بإضافة معلومات التواصل الخاصة بالأقسام",
    "label-department-90101": "*القسم المعني",
    "option-select-dept-90101": "اختر القسم",
    "option-reg-90101": "التسجيل والقبول",
    "option-ccsit-90101": "كلية علوم الحاسب وتقنية المعلومات",
    "option-commtech-90101": "الاتصالات والتقنية",
    "option-hospital-90101": "المستشفى",
    "option-library-90101": "المكتبة",
    "option-affairs-90101": "شؤون الطلاب",
    "option-prep-90101": "السنة التحضيرية",
    "option-academic-90101": "الشؤون الأكاديمية",
    "label-name-en-90101": "*اسم الشخص المسؤول (بالإنجليزية)",
    "label-name-ar-90101": "*اسم الشخص المسؤول (بالعربية)",
    "label-email-90101": "*البريد الإلكتروني",
    "label-telephone-90101": "*رقم الهاتف",
    "label-mobile-90101": "رقم الجوال",
    "btn-submit-90101": "إرسال",
    "btn-cancel-90101": "إلغاء",
    "manageContact-title33": "إدارة معلومات التواصل",
    "manageContact-subtitle33": "عرض وإدارة جميع معلومات التواصل",
    "addContact-btn33": "إضافة معلومات تواصل",
    "back-btn33": "رجوع",
    "logout-btn33": "تسجيل الخروج",
    "table-header-contactType33": "نوع التواصل",
    "table-header-contactValue33": "قيمة التواصل",
    "table-header-action33": "الإجراء",
    "edit-btn33": "تعديل",
    "delete-btn33": "حذف",
    "table-header-department33": "القسم",
    "table-header-name33": "الاسم",
    "table-header-email33": "البريد الإلكتروني",
    "table-header-mobile33": "الجوال",
    "table-header-telephone33": "الهاتف",
    "table-header-actions33": "الإجراءات",
    "empty-state-title33": "لا توجد معلومات تواصل",
    "empty-state-desc33": "انقر على الزر أدناه لإضافة معلومات تواصل جديدة",
    "empty-state-button33": "إضافة معلومات تواصل جديدة",
    "modal-title-delete33": "تأكيد الحذف",
    "modal-body-confirmation33": "هل أنت متأكد أنك تريد حذف معلومات التواصل الخاصة بـ:",
    "modal-warning33": "هذا الإجراء لا يمكن التراجع عنه!",
    "modal-button-cancel33": "إلغاء",
    "modal-button-delete33": "حذف جهة التواصل",
    // edit contact info translations
    "title-90201": "تعديل معلومات التواصل",
    "topbar-back-90201": "رجوع",
    "topbar-logout-90201": "تسجيل الخروج",
    "main-header-90201": "تعديل معلومات التواصل",
    "subtitle-90201": "تحديث تفاصيل معلومات التواصل",
    "label-department-90201": "القسم المعني",
    "option-select-dept-90201": "اختر القسم",
    "option-reg-90201": "التسجيل والقبول",
    "option-ccsit-90201": "كلية علوم الحاسب وتقنية المعلومات",
    "option-commtech-90201": "الاتصالات والتقنية",
    "option-hospital-90201": "المستشفى",
    "option-library-90201": "المكتبة",
    "option-affairs-90201": "شؤون الطلاب",
    "option-prep-90201": "السنة التحضيرية",
    "option-academic-90201": "الشؤون الأكاديمية",
    "label-name-en-90201": "اسم الشخص المسؤول (بالإنجليزية)",
    "label-name-ar-90201": "اسم الشخص المسؤول (بالعربية)",
    "label-email-90201": "البريد الإلكتروني",
    "label-telephone-90201": "رقم الهاتف",
    "label-mobile-90201": "رقم الجوال",
    "btn-update-90201": "تحديث المعلومات",
    "btn-cancel-90201": "إلغاء",
    
    //------------------------report page translations------------------------
   "btn-back-admin": "العودة إلى لوحة التحكم",
    "dashboard-title": "لوحة تحكم التحليلات",
    "dashboard-subtitle": "إحصائيات ورؤى شاملة للنظام",
    "btn-export-pdf": "  تصدير ملف PDF",

    "stat-total-documents": "إجمالي الوثائق",
    "stat-total-users": "المستخدمون المسجلون",
    "stat-total-downloads": "إجمالي التنزيلات",
    "stat-total-views": "إجمالي المشاهدات",

    "chart-views-downloads": "اجمالي المشاهدات والتنزيلات",
    "chart-top-viewed": "أكثر 5 وثائق مشاهدة",
    "chart-top-downloaded": "أكثر 5 وثائق تحميلًا",
    "chart-type-distribution": "توزيع أنواع الوثائق",

    "list-top-downloaded": "الأكثر تحميلًا",
    "list-top-viewed": "الأكثر مشاهدة",
    "list-most-details": "الأكثر عرضًا للتفاصيل",
    "msg-no-download-data": "لا توجد بيانات تحميل متاحة",
    "msg-no-view-data": "لا توجد بيانات مشاهدة متاحة",
    "msg-no-details-data": "لا توجد بيانات تفاصيل متاحة",

    "table-title": "إحصائيات الوثائق",
    "sort-total": "الترتيب حسب إجمالي التفاعلات",
    "sort-downloads": "الترتيب حسب التنزيلات",
    "sort-views": "الترتيب حسب المشاهدات",
    "sort-details": "الترتيب حسب عرض التفاصيل",
    "sort-name": "الترتيب حسب الاسم",
    "sort-type": "الترتيب حسب نوع الوثيقة",

    "filter-all-types": "كل أنواع الوثائق",

    "th-record-id": "معرف السجل",
    "th-doc-name": "اسم الوثيقة",
    "th-type": "النوع",
    "th-department": "القسم",
    "th-downloads": "التنزيلات",
    "th-views": "المشاهدات",
    "th-details": "التفاصيل",
    "th-total": "الإجمالي",

    // ==================== HISTORY PAGE TRANSLATIONS (ARABIC) ====================
    // Arabic translations for history page elements - mirror of English translations above
    // Each key provides the Arabic equivalent for seamless language switching
    
    // Main page header elements - العناصر الرئيسية لرأس الصفحة
    "history-activity-title": "سجل أنشطتك", // Main title - العنوان الرئيسي
    "history-track-activity": "تتبع مشاهداتك وتحميلاتك الأخيرة", // Subtitle - العنوان الفرعي
    
    // View toggle buttons - أزرار التبديل بين طرق العرض
    "history-table-btn": "جدول", // Table view button - زر عرض الجدول
    "history-cards-btn": "بطاقات", // Card view button - زر عرض البطاقات
    
    // Card view elements - عناصر عرض البطاقات
    "history-action-status": "آخر العمليات", // Action status header in cards - رأس حالة الإجراءات في البطاقات
    
    // Table column headers - رؤوس أعمدة الجدول
    "history-record-name": "اسم السجل", // Record name column - عمود اسم السجل
    "history-all-actions": "جميع الإجراءات", // All actions column - عمود جميع الإجراءات
    "history-last-action": "آخر إجراء", // Last action column - عمود آخر إجراء
    "history-timestamp": "الوقت والتاريخ", // Timestamp column - عمود الوقت والتاريخ
    
    // Action type labels - تسميات أنواع الإجراءات
    "history-view": "عرض", // View action - إجراء العرض
    "history-download": "تحميل", // Download action - إجراء التحميل
    "history-show-details": "إظهار التفاصيل", // Show details action - إجراء إظهار التفاصيل
    
    // Action status indicators - مؤشرات حالة الإجراءات
    "history-viewed": "تم العرض", // Viewed status - حالة تم العرض
    "history-downloaded": "تم التحميل", // Downloaded status - حالة تم التحميل
    "history-not-performed": "لم يتم التنفيذ", // Not performed status - حالة لم يتم التنفيذ
    "history-no-actions": "لا توجد إجراءات بعد", // No actions message - رسالة عدم وجود إجراءات
    
    // Empty state messages - رسائل الحالة الفارغة
    "history-no-history": "لا يوجد تاريخ بعد", // No history main message - الرسالة الرئيسية لعدم وجود تاريخ
    "history-start-viewing": "ابدأ بعرض أو تحميل السجلات لرؤية نشاطك هنا!", // Instructional text - النص التوجيهي
    
    // Category labels for action grouping - تسميات فئات تجميع الإجراءات
    "history-view-actions": "إجراءات العرض", // View actions category - فئة إجراءات العرض
    "history-download-actions": "إجراءات التحميل", // Download actions category - فئة إجراءات التحميل
    "history-details-actions": "إجراءات إظهار التفاصيل", // Details actions category - فئة إجراءات إظهار التفاصيل
    
    // Status and loading indicators - مؤشرات الحالة والتحميل
    "history-action-status": "حالة الإجراء", // Action status header - رأس حالة الإجراء
    "history-loading": "جارٍ التحميل...", // Generic loading message - رسالة التحميل العامة
    "history-loading-text": "جارٍ تحميل تاريخك...", // Specific loading message - رسالة التحميل المحددة
    // assign new editor translations 
    "assign-editor-page-title-452": "تعيين محرر جديد",
    "assign-editor-page-subtitle-453": "إدارة أدوار المستخدمين وامتيازات المحرر",
    "loading-text-processing-454": "جاري المعالجة...",
    "stats-label-admins-455": "المشرفون",
    "stats-label-editors-456": "المحررون",
    "stats-label-regular-users-457": "المستخدمون العاديون",
    "search-placeholder-name-email-458": "ابحث بالاسم أو البريد الإلكتروني...",
    "search-button-459": "بحث",
    "role-badge-admin-460": "مشرف",
    "role-badge-editor-461": "محرر",
    "role-badge-user-462": "مستخدم",
    "system-admin-463": "مشرف النظام",
    "promote-modal-title-463": "ترقية إلى محرر",
    "demote-modal-title-464": "خفض إلى مستخدم",
    "confirmation-modal-confirm-465": "تأكيد",
    "alert-close-button-466": "إغلاق",
    "alert-no-userfound-467": "لم يتم العثور على مستخدم",
    "clear-search-button-468": "مسح البحث",
    // Export data translations
    "export-modal-title": "حدد الجداول للتصدير",
    "export-modal-description": "اختر جداول قاعدة البيانات التي تريد تضمينها في ملف Excel الذي ستقوم بتصديره:",
    "export-option-all-tables": "جميع الجداول",
    "export-option-all-tables-desc": "تصدير جميع جداول قاعدة البيانات المتاحة",
    "export-option-records": "السجلات",
    "export-option-records-desc": "جميع سجلات اللوائح والسياسات",
    "export-option-users": "المستخدمون",
    "export-option-users-desc": "جميع معلومات المستخدمين المسجلين",
    "export-option-contact": "معلومات الاتصال",
    "export-option-contact-desc": "تفاصيل الاتصال بالقسم",
    "export-option-attachments": "المرفقات",
    "export-option-attachments-desc": "مرفقات الملفات والمستندات",
    "export-option-history": "سجل المستخدم",
    "export-option-history-desc": "سجلات أنشطة المستخدم وإجراءاته",
    "export-button-cancel": "إلغاء",
    "export-button-confirm": "تصدير الجداول المحددة",
    "admin-button-assign-editor": "إدارة المحررين",
    
    // AdminPortal Arabic translations
    "admin-portal-title": "بوابة الإدارة",
    "admin-portal-subtitle": "الوصول السريع للأدوات الإدارية الرئيسية",
    "admin-portal-home-title": "الصفحة الرئيسية",
    "admin-portal-home-desc": "نظرة عامة وروابط سريعة",
    "admin-portal-home-cta": "فتح ←",
    "admin-portal-editor-title": "صفحة المحرر",
    "admin-portal-editor-desc": "إدارة السجلات والمحتوى",
    "admin-portal-editor-cta": "فتح ←",
    "admin-portal-activity-title": "سجل الأنشطة",
    "admin-portal-activity-desc": "مراجعة جميع تغييرات الإدارة/المحرر",
    "admin-portal-activity-cta": "فتح ←",
    "admin-portal-assign-title": "تعيين محرر جديد",
    "admin-portal-assign-desc": "منح صلاحية المحرر",
    "admin-portal-assign-cta": "فتح ←",

    // Mobile Menu Translations
    "mobile-home": "الرئيسية",
    "mobile-admin-view": "عرض المحرر",
    "mobile-student-guides": "أدلة وقوالب الطلاب",
    "mobile-student-rules": "قواعد وأنظمة الطلاب",
    "mobile-employee-rules": "قواعد وأنظمة الموظفين",
    "mobile-academic-rules": "قواعد وأنظمة أكاديمية",
    "mobile-saved-rules": "القواعد واللوائح المحفوظة",
    "mobile-history": "السجل",
    "mobile-language-text": "English",
    "mobile-logout": "تسجيل الخروج",
    "mobile-exit-edit-text": "الخروج من وضع التحرير",
    // log page translations
    "activityLog-page-title": "سجل النشاطات",
    "activityLog-subtitle": "مراقبة وتتبع جميع إجراءات وتغييرات المستخدمين المتميزين",
    "activityLog-total-actions": "إجمالي الإجراءات",
    "activityLog-admin-actions": "إجراءات المسؤولين",
    "activityLog-editor-actions": "إجراءات المحررين",
    "activityLog-record-changes": "تغييرات السجلات",
    "activityLog-contact-changes": "تغييرات جهات الاتصال",
    "activityLog-action-type": "نوع الإجراء",
    "activityLog-all-actions": "جميع الإجراءات",
    "activityLog-entity-type": "نوع الكيان",
    "activityLog-all-entities": "جميع الكيانات",
    "activityLog-user-role": "دور المستخدم",
    "activityLog-all-roles": "جميع الأدوار",
    "activityLog-start-date": "تاريخ البدء",
    "activityLog-end-date": "تاريخ الانتهاء",
    "activityLog-apply-filters": "تطبيق المرشحات",
    "activityLog-table-header-action": "الإجراء",
    "activityLog-table-header-timestamp": "التاريخ والوقت",
    "activityLog-table-header-user": "المستخدم",
    "activityLog-table-header-entity": "الكيان",
    "activityLog-table-header-details": "التفاصيل",
    "activityLog-view-details": "عرض التفاصيل",
    "activityLog-no-records-found": "لم يتم العثور على سجلات",
    "activityLog-no-records-message": "لا توجد سجلات نشاط تطابق معايير البحث.",
    "activityLog-previous": "السابق",
    "activityLog-next": "التالي",
    "activityLog-details-modal-title": "تفاصيل النشاط",
    "activityLog-record-id": "معرف السجل",
    "activityLog-previous-state": "الحالة السابقة",
    "activityLog-current-state": "الحالة الحالية",
    "activityLog-close": "إغلاق",
    "Logout345": "تسجيل خروج",
    "btn-back": "رجوع",
    "Add": "إضافة",
    "Edit": "تعديل",
    "Delete": "حذف",
    "Record": "سجل",
    "Contact": "جهة اتصال",
    "Admin": "مسؤول",
    "Editor": "محرر",
    "apply": "تطبيق",
    "Clear": "مسح",
    "modal-loading-spinner-text": "جار التحميل...",
    "modal-loading-message": "جار تحميل التفاصيل...",
    "activityLog-table-header-log-id": "معرف السجل",
    "activityLog-table-header-user": "المستخدم",
    "activityLog-table-header-role": "الدور",
    "activityLog-table-header-action": "الإجراء",
    "activityLog-table-header-entity": "الكيان",
    "activityLog-table-header-entity-details": "تفاصيل الكيان",
    "activityLog-table-header-timestamp": "التاريخ والوقت",
    "activityLog-table-header-summary": "الملخص",
    "activityLog-table-header-options": "الخيارات",
    "activityLog-log-id-label": "معرف السجل",
    "activityLog-user-id-label": "المعرف:",
    "activityLog-user-id-label2": "المعرف:",
    "activityLog-role-admin": "مسؤول",
    "activityLog-role-editor": "محرر",
    "activityLog-action-add": "إضافة",
    "activityLog-action-edit": "تعديل",
    "activityLog-action-delete": "حذف",
    "activityLog-entity-record": "سجل",
    "activityLog-entity-contact": "جهة اتصال",
    "activityLog-entity-name-unknown": "غير معروف",
    "activityLog-entity-id-label": "المعرف:",
    "activityLog-summary-add": " جديد",
    "activityLog-summary-delete": "تم حذف",
    "activityLog-summary-no-details": "لا توجد تفاصيل متاحة",
    "activityLog-options-view-details": "عرض التفاصيل",
    "new" : "جديد",
    "created": "تم إنشاء",
    "Previous": "السابق",
    "no-activity-found": "لم يتم العثور على أي نشاط",
    "try-adjusting-filters": "حاول تعديل عوامل التصفية أو مصطلحات البحث.",
    "modal-loading-status": "جارٍ التحميل...",
    "modal-loading-details": "جارٍ تحميل تفاصيل النشاط...",
    "close": "إغلاق",
        }
    };

    // Make monthTranslations globally accessible
    window.monthTranslations = {
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "ar": ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    };

    function applyTranslations(lang) {
        // Apply translations to all elements with matching IDs
        for (const id in translations[lang]) {
            const element = document.getElementById(id);
            if (element) {
                // Handle input placeholders
                if (element.tagName === "INPUT" && element.type === "text") {
                    element.placeholder = translations[lang][id];
                } 
                // Handle regular elements
                else {
                    element.textContent = translations[lang][id];
                }
            }
        }

        // Handle translatable labels with data-translate-key attribute
        const translatableLabels = document.querySelectorAll('.translatable-label[data-translate-key]');
        translatableLabels.forEach(label => {
            const translateKey = label.getAttribute('data-translate-key');
            if (translations[lang] && translations[lang][translateKey]) {
                label.textContent = translations[lang][translateKey];
            }
        });

        // Handle department labels in multi-select dropdown
        const departmentLabels = document.querySelectorAll('.department-option');
        if (departmentLabels.length > 0) {
            const departmentTranslations = {
                "en": {
                    "": "All Departments",
                    "Reg and Admission": "Reg and Admission",
                    "CCSIT": "CCSIT",
                    "Communication and tech": "Communication and tech",
                    "Hospital": "Hospital",
                    "Library": "Library",
                    "Students Affairs": "Students Affairs",
                    "Preparetory": "Preparatory",
                    "Academic Affairs": "Academic Affairs"
                },
                "ar": {
                    "": "جميع الأقسام",
                    "Reg and Admission": "التسجيل والقبول",
                    "CCSIT": "كلية علوم الحاسب وتقنية المعلومات",
                    "Communication and tech": "الاتصالات والتقنية",
                    "Hospital": "المستشفى",
                    "Library": "المكتبة",
                    "Students Affairs": "شؤون الطلاب",
                    "Preparetory": "السنة التحضيرية",
                    "Academic Affairs": "الشؤون الأكاديمية"
                }
            };

            departmentLabels.forEach(checkbox => {
                const label = checkbox.parentNode;
                const value = checkbox.value;
                if (departmentTranslations[lang][value]) {
                    // Update the text content of the label, preserving the checkbox
                    const textNode = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textNode) {
                        textNode.textContent = ' ' + departmentTranslations[lang][value];
                    }
                }
            });
        }

        // Handle document type badges
        const badges = document.querySelectorAll('.badge');
        badges.forEach(badge => {
            const text = badge.textContent.toLowerCase().trim();
            if (lang === 'ar') {
                if (text === 'guidelines' || text === 'إرشادات') {
                    badge.textContent = 'إرشادات';
                } else if (text === 'policies' || text === 'سياسات') {
                    badge.textContent = 'سياسات';
                } else if (text === 'regulations' || text === 'لوائح') {
                    badge.textContent = 'لوائح';
                }
            } else {
                if (text === 'إرشادات' || text === 'guidelines') {
                    badge.textContent = 'Guidelines';
                } else if (text === 'سياسات' || text === 'policies') {
                    badge.textContent = 'Policies';
                } else if (text === 'لوائح' || text === 'regulations') {
                    badge.textContent = 'Regulations';
                }
            }
        });

        // Handle filter labels that don't have direct IDs
        const filterLabels = document.querySelectorAll('.filter-column h3');
        filterLabels.forEach(label => {
            if (label.textContent.trim() === 'Department' && lang === 'ar') {
                label.textContent = 'القسم';
            } else if (label.textContent.trim() === 'القسم' && lang === 'en') {
                label.textContent = 'Department';
            }
        });

        // Handle Clear button
        const clearButtons = document.querySelectorAll('.apply-btn');
        clearButtons.forEach(btn => {
            if (btn.textContent.trim() === 'Clear' && lang === 'ar') {
                btn.textContent = 'مسح';
            } else if (btn.textContent.trim() === 'مسح' && lang === 'en') {
                btn.textContent = 'Clear';
            }
        });

        // Update chart legends with translations if available
        if (typeof updateChartLegends === 'function') {
            updateChartLegends(lang);
        }
    }

    function setLanguage(lang) {
        if (lang === "ar") {
            bodyElement.classList.remove("ltr");
            bodyElement.classList.add("rtl");
            bodyElement.lang = "ar";
            bodyElement.dir = "rtl";
        } else {
            bodyElement.classList.remove("rtl");
            bodyElement.classList.add("ltr");
            bodyElement.lang = "en";
            bodyElement.dir = "ltr";
        }
        
        applyTranslations(lang);
        translateChartMonths(lang); // Translate chart months if applicable
        localStorage.setItem("websiteLanguage", lang);
        
        // Dispatch custom event for other scripts to listen to language changes
        const languageChangeEvent = new CustomEvent('languageChanged', {
            detail: { language: lang }
        });
        document.dispatchEvent(languageChangeEvent);
    }

    // Initialize language from server culture or localStorage fallback
    let savedLanguage = "en";
    
    // Check if we can get the culture from the server (via meta tag or body attribute)
    const bodyLang = document.body.getAttribute('lang');
    const bodyDir = document.body.getAttribute('dir');
    
    if (bodyLang === 'ar' || bodyDir === 'rtl') {
        savedLanguage = "ar";
    } else if (bodyLang === 'en' || bodyDir === 'ltr') {
        savedLanguage = "en";
    } else {
        // Fallback to localStorage
        savedLanguage = localStorage.getItem("websiteLanguage") || "en";
    }
    
    setLanguage(savedLanguage);

    // Add event listener to language toggle button
    if (languageToggleButton) {
        languageToggleButton.addEventListener("click", () => {
            const currentLang = bodyElement.classList.contains("rtl") ? "ar" : "en";
            const newLang = currentLang === "ar" ? "en" : "ar";
            const newCulture = newLang === "ar" ? "ar-SA" : "en-US";
            
            // Create a form to submit the language change to the server
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/Language/SetLanguage';
            
            // Add CSRF token
            const token = document.querySelector('input[name="__RequestVerificationToken"]');
            if (token) {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = '__RequestVerificationToken';
                tokenInput.value = token.value;
                form.appendChild(tokenInput);
            }
            
            // Add culture parameter
            const cultureInput = document.createElement('input');
            cultureInput.type = 'hidden';
            cultureInput.name = 'culture';
            cultureInput.value = newCulture;
            form.appendChild(cultureInput);
            
            // Add return URL parameter
            const returnUrlInput = document.createElement('input');
            returnUrlInput.type = 'hidden';
            returnUrlInput.name = 'returnUrl';
            returnUrlInput.value = window.location.pathname + window.location.search;
            form.appendChild(returnUrlInput);
            
            // Submit the form
            document.body.appendChild(form);
            form.submit();
        });
    }
    //this method is used to translate the months in the chart
    function translateChartMonths(lang) {
    const months = window.monthTranslations[lang];
    if (window.barChartInstance && window.barChartInstance.data) {
        const originalLabels = window.barChartInstance.data.labels;
        const translatedLabels = originalLabels.map(label => {
            // Check if label is already in Arabic, convert to English first
            const arabicIndex = window.monthTranslations["ar"].indexOf(label);
            const englishLabel = arabicIndex >= 0 ? window.monthTranslations["en"][arabicIndex] : label;
            
            // Now translate to target language
            const index = window.monthTranslations["en"].indexOf(englishLabel);
            return index >= 0 ? months[index] : label;
        });
        window.barChartInstance.data.labels = translatedLabels;
        
        // Update dataset label based on current state and language
        if (window.barChartInstance.data.datasets[0]) {
            const currentLabel = window.barChartInstance.data.datasets[0].label;
            const isUnique = currentLabel.includes('Unique') || currentLabel.includes('الفريدة');
            
            window.barChartInstance.data.datasets[0].label = isUnique
                ? (lang === 'ar' ? 'الزيارات الشهرية الفريدة' : 'Unique Monthly Visits')
                : (lang === 'ar' ? 'الزيارات الشهرية' : 'Monthly Visits');
            
            // Update the toggle button text as well
            const toggle = document.getElementById('visitToggler');
            if (toggle) {
                toggle.textContent = window.barChartInstance.data.datasets[0].label;
            }
        }
        
        window.barChartInstance.update();
    }
}

// Document type translations mapping
const documentTypeTranslations = {
    "Student rules & regulations": {
        en: "Student rules & regulations",
        ar: "قواعد وأنظمة الطلاب"
    },
    "Academic rules & regulations": {
        en: "Academic rules & regulations", 
        ar: "القواعد واللوائح الأكاديمية"
    },
    "Student guides & templates": {
        en: "Student guides & templates",
        ar: "أدلة ونماذج الطلاب"
    },
    "Employees’ rules & regulations": {
        en: "Employees’ rules & regulations",
        ar: "قواعد وأنظمة الموظفين"
    }
};

// Function to translate document type text
function translateDocumentType(text, targetLang) {
    // Find the translation entry for this text
    for (const [key, translations] of Object.entries(documentTypeTranslations)) {
        if (translations.en === text || translations.ar === text) {
            return translations[targetLang] || text;
        }
    }
    return text; // Return original if no translation found
}

// Function to update chart legends with translations
function updateChartLegends(targetLang) {
    // Update donut chart legends
    const legendItems = document.querySelectorAll('.legend-text, .legend-item span');
    legendItems.forEach(item => {
        if (item.textContent) {
            // Extract the label part (before percentage)
            const fullText = item.textContent;
            const match = fullText.match(/^(.+?)\s+\d+%/);
            if (match) {
                const labelText = match[1];
                const translatedLabel = translateDocumentType(labelText, targetLang);
                // Replace only the label part, keep percentage and count
                item.textContent = fullText.replace(labelText, translatedLabel);
            }
        }
    });
}

// Export functions for use in other scripts
window.translateDocumentType = translateDocumentType;
window.updateChartLegends = updateChartLegends;
window.translations = translations;

});