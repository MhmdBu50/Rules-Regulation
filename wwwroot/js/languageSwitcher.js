document.addEventListener("DOMContentLoaded", () => {
    const languageToggleButton = document.getElementById("language-toggle");
    const bodyElement = document.body;

    // Define translatable texts - matching IDs in your .cshtml files
    const translations = {
        "en": {
            //login translations
            "login-title": "Sign in to Rules And Regulations System",
            "username-label": "Username",
            "password-label": "Password",
            "login-button": "Login",
            "login-help": "Need help logging in?",
            // General page elements
            "page-title": "Home Page",
            "welcome-message": "Welcome to our platform. Please navigate through the sections below.",
            "dashboard-heading": "Admin Dashboard",
            "user-list-label": "List of Users",
            
            // Home page elements
            "admin-view-button": "view as Admin",
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
            "nav-employee-rules-label": "Employees' rules & regulations",
            "nav-academic-rules-label": "Academic rules & regulations",
            "nav-student-guides-label1": "Student guides & templates",
            "nav-student-rules-label1": "Student rules & regulations",
            "nav-employee-rules-label1": "Employees' rules & regulations",
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
        "admin-exit-view-button": "Exit Admin view",
        "admin-chart-title-overview": "University Rules and Guidelines Overview",
        "admin-chart-legend-academic-rules": "Academic rules",
        "admin-chart-legend-employment-rules": "Employment rules & regulations",
        "admin-chart-legend-student-rules": "Student rules & regulations",
        "admin-chart-legend-student-guides": "Student guides & templates",
        "admin-chart-legend-academic-rules1": "Academic rules",
        "admin-chart-legend-employment-rules1": "Employment rules & regulations",
        "admin-chart-legend-student-rules1": "Student rules & regulations",
        "admin-chart-legend-student-guides1": "Student guides & templates", // Added based on typical content
         "admin-chart-legend-academic-rules2": "Academic rules",
        "admin-chart-legend-employment-rules2": "Employment rules & regulations",
        "admin-chart-legend-student-rules2": "Student rules & regulations",
        "admin-chart-legend-student-guides2": "Student guides & templates",
         "admin-chart-legend-academic-rules3": "Academic rules",
        "admin-chart-legend-employment-rules3": "Employment rules & regulations",
        "admin-chart-legend-student-rules3": "Student rules & regulations",
        "admin-chart-legend-student-guides3": "Student guides & templates",
        "admin-chart-title-visits": "Website visits over the past 6 months",
        "admin-stats-total-policies": "Total Policies", // Placeholder for dynamic number
        "admin-button-view-report": "View Report",
        "admin-button-add-new-record": "Add New Record",
        "admin-button-export-data": "Export Data",
        "admin-button-manage-contact-info": "Manage Contact Info",
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
        "admin-table-header-DocumentType": "Document Type",
        "admin-table-header-version-number": "Version Number",
        "admin-table-header-approving-date": "Approving Date",
        "admin-table-header-responsible-entity": "Responsible Entity",
        "admin-table-form-regulation-name-label": "Regulation/ Manual name",
        "admin-table-form-brief-description-label": "Brief Description",
        "admin-table-form-approving-date-label": "Approving Date",
        "admin-table-form-version-date-label": "Version Date",
        "admin-table-form-version-number-label": "Version Number",
        "admin-table-form-approving-entity-label": "Approving Entity",
        "admin-table-form-responsible-department-label": "Responsible Department",
        "admin-table-form-note-label": "Note",
        "admin-table-form-document-type-label": "Document Type",
        "admin-table-form-section-label": "Section",
        "admin-table-form-attach-word-label": "Attach word file",
        "admin-table-form-attach-pdf-label": "Attach PDF file",
        "admin-table-form-upload-file-title": "Click Edit to enable file upload",
        "admin-table-form-responsible-contact-label": "Responsible Department contact information:",
        "admin-table-form-contact-name-label": "Name",
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
    "label-department-90101": "Relevant Department",
    "option-select-dept-90101": "Select department",
    "option-reg-90101": "Reg and Admission",
    "option-ccsit-90101": "CCSIT",
    "option-commtech-90101": "Communication and tech",
    "option-hospital-90101": "Hospital",
    "option-library-90101": "Library",
    "option-affairs-90101": "Students Affairs",
    "option-prep-90101": "Preparetory",
    "option-academic-90101": "Academic Affairs",
    "label-name-en-90101": "Name of Responsible Person (English)",
    "label-name-ar-90101": "Name of Responsible Person (Arabic)",
    "label-email-90101": "E-mail",
    "label-telephone-90101": "Telephone number",
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

    // Mobile Menu Translations
    "mobile-home": "Home",
    "mobile-admin-view": "view as Admin",
    "mobile-student-guides": "Student Guides & Templates",
    "mobile-student-rules": "Student Rules & Regulations",
    "mobile-employee-rules": "Employees' Rules & Regulations",
    "mobile-academic-rules": "Academic Rules & Regulations",
    "mobile-saved-rules": "Saved Rules & Regulations",
    "mobile-history": "History",
    "mobile-language-text": "change language",
    "mobile-logout": "logout"

        },
        "ar": {
            //login translations
            "login-title": "تسجيل الدخول إلى نظام اللوائح والتنظيمات",
            "username-label": "اسم المستخدم",
            "password-label": "كلمة المرور",
            "login-button": "تسجيل الدخول",
            "login-help": "هل تحتاج مساعدة في تسجيل الدخول؟",
            // General page elements
            "page-title": "الرئيسية",
            "welcome-message": "مرحباً بك في منصتنا. يرجى التنقل عبر الأقسام أدناه.",
            "dashboard-heading": "لوحة تحكم المسؤول",
            "user-list-label": "قائمة المستخدمين",

            // Home page elements
            "admin-view-button": "عرض كمسؤول",
            "searchInput": "... ابحث",

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
            "nav-student-guides-label": "أدلة وقوالب الطلاب",
            "nav-student-rules-label": "قواعد وأنظمة الطلاب",
            "nav-employee-rules-label": "قواعد وأنظمة الموظفين",
            "nav-academic-rules-label": "قواعد وأنظمة أكاديمية",
            "nav-saved-rules-label": "القواعد واللوائح المحفوظة",
             "nav-student-guides-label1": "أدلة وقوالب الطلاب",
            "nav-student-rules-label1": "قواعد وأنظمة الطلاب",
            "nav-employee-rules-label1": "قواعد وأنظمة الموظفين",
            "nav-academic-rules-label1": "قواعد وأنظمة أكاديمية",
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
        "admin-exit-view-button": "الخروج من عرض المسؤول",
        "admin-chart-title-overview": "نظرة عامة على قواعد وإرشادات الجامعة",
        "admin-chart-legend-academic-rules": "قواعد أكاديمية",
        "admin-chart-legend-employment-rules": "قواعد وأنظمة التوظيف",
        "admin-chart-legend-student-rules": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides": "أدلة وقوالب الطلاب",
        "admin-chart-legend-academic-rules1": "قواعد أكاديمية",
        "admin-chart-legend-employment-rules1": "قواعد وأنظمة التوظيف",
        "admin-chart-legend-student-rules1": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides1": "أدلة وقوالب الطلاب",
        "admin-chart-legend-academic-rules2": "قواعد أكاديمية",
        "admin-chart-legend-employment-rules2": "قواعد وأنظمة التوظيف",
        "admin-chart-legend-student-rules2": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides2": "أدلة وقوالب الطلاب",
        "admin-chart-legend-academic-rules3": "قواعد أكاديمية",
        "admin-chart-legend-employment-rules3": "قواعد وأنظمة التوظيف",
        "admin-chart-legend-student-rules3": "قواعد وأنظمة الطلاب",
        "admin-chart-legend-student-guides3": "أدلة وقوالب الطلاب",
        "admin-chart-title-visits": "زيارات الموقع خلال الستة أشهر الماضية",
        "admin-stats-total-policies": "إجمالي السياسات",
        "admin-button-view-report": "عرض التقرير",
        "admin-button-add-new-record": "إضافة سجل جديد",
        "admin-button-export-data": "تصدير البيانات",
        "admin-button-manage-contact-info": "إدارة معلومات الاتصال",
        "visitToggler": "الزيارات الشهرية",
        "desktopSearchInput": "...البحث بالاسم/رقم السجل",
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
        "admin-table-form-regulation-name-label": "اسم اللائحة/الدليل",
        "admin-table-form-brief-description-label": "وصف موجز",
        "admin-table-form-approving-date-label": "تاريخ الاعتماد",
        "admin-table-form-version-date-label": "تاريخ الإصدار",
        "admin-table-form-version-number-label": "رقم الإصدار",
        "admin-table-form-approving-entity-label": "الجهة المعتمدة",
        "admin-table-form-responsible-department-label": "القسم المسؤول",
        "admin-table-form-note-label": "ملاحظة",
        "admin-table-form-document-type-label": "نوع المستند",
        "admin-table-form-section-label": "القسم",
        "admin-table-form-attach-word-label": "إرفاق ملف وورد",
        "admin-table-form-attach-pdf-label": "PDF إرفاق ملف",
        "admin-table-form-upload-file-title": "انقر على تحرير لتمكين تحميل الملف",
        "admin-table-form-responsible-contact-label": ":معلومات الاتصال بالقسم المسؤول",
        "admin-table-form-contact-name-label": "الاسم",
        "admin-table-form-contact-email-label": "البريد الإلكتروني",
        "admin-table-form-contact-telephone-label": "رقم الهاتف",
        "admin-table-form-contact-mobile-label": "رقم الجوال",
        "admin-table-form-no-contact-info": ".لا توجد معلومات اتصال متاحة لهذا القسم",
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
    "label-doc-student-guides-7851": 'أدلة الطلاب والقوالب',
    "label-doc-student-rules-7851": 'قواعد وأنظمة الطلاب',
    "label-doc-employee-rules-7851": 'قواعد وأنظمة الموظفين',
    "label-doc-academic-rules-7851": 'قواعد وأنظمة أكاديمية',
    // contact info translations
    "title-90101": "إضافة معلومات تواصل جديدة",
    "topbar-back-90101": "رجوع",
    "topbar-logout-90101": "تسجيل الخروج",
    "main-header-90101": "إضافة معلومات التواصل",
    "subtitle-90101": "قم بإضافة معلومات التواصل الخاصة بالأقسام",
    "label-department-90101": "القسم المعني",
    "option-select-dept-90101": "اختر القسم",
    "option-reg-90101": "التسجيل والقبول",
    "option-ccsit-90101": "كلية علوم الحاسب وتقنية المعلومات",
    "option-commtech-90101": "الاتصالات والتقنية",
    "option-hospital-90101": "المستشفى",
    "option-library-90101": "المكتبة",
    "option-affairs-90101": "شؤون الطلاب",
    "option-prep-90101": "السنة التحضيرية",
    "option-academic-90101": "الشؤون الأكاديمية",
    "label-name-en-90101": "اسم الشخص المسؤول (بالإنجليزية)",
    "label-name-ar-90101": "اسم الشخص المسؤول (بالعربية)",
    "label-email-90101": "البريد الإلكتروني",
    "label-telephone-90101": "رقم الهاتف",
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

    // Mobile Menu Translations
    "mobile-home": "الرئيسية",
    "mobile-admin-view": "عرض كمسؤول",
    "mobile-student-guides": "أدلة وقوالب الطلاب",
    "mobile-student-rules": "قواعد وأنظمة الطلاب",
    "mobile-employee-rules": "قواعد وأنظمة الموظفين",
    "mobile-academic-rules": "قواعد وأنظمة أكاديمية",
    "mobile-saved-rules": "القواعد واللوائح المحفوظة",
    "mobile-history": "السجل",
    "mobile-language-text": "تغيير اللغة",
    "mobile-logout": "تسجيل الخروج"
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
});