document.addEventListener("DOMContentLoaded", () => {
    const languageToggleButton = document.getElementById("language-toggle");
    const bodyElement = document.body;

    // Define translatable texts - matching IDs in your .cshtml files
    const translations = {
        "en": {
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
        "admin-chart-title-visits": "Website visits over the past 6 months",
        "admin-stats-total-policies": "Total Policies", // Placeholder for dynamic number
        "admin-button-view-report": "View Report",
        "admin-button-add-new-record": "Add New Record",
        "admin-button-export-data": "Export Data",
        "admin-button-manage-contact-info": "Manage Contact Info",
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
        "admin-table-header-section": "Section",
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
        },
        "ar": {
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
            "nav-home-label": "الصفحة الرئيسية",
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
            "message-input": "اكتب رسالتك...",

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
        "admin-chart-title-visits": "زيارات الموقع خلال الستة أشهر الماضية",
        "admin-stats-total-policies": "إجمالي السياسات",
        "admin-button-view-report": "عرض التقرير",
        "admin-button-add-new-record": "إضافة سجل جديد",
        "admin-button-export-data": "تصدير البيانات",
        "admin-button-manage-contact-info": "إدارة معلومات الاتصال",
        "desktopSearchInput": "...البحث بالاسم/الرقم التعريفي",
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
        "admin-table-header-id": "الرقم التعريفي",
        "admin-table-header-regulation-name": "اسم اللائحة/الدليل",
        "admin-table-header-section": "القسم",
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
        }
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
        localStorage.setItem("websiteLanguage", lang);
    }

    // Initialize language from localStorage or default to English
    const savedLanguage = localStorage.getItem("websiteLanguage") || "en";
    setLanguage(savedLanguage);

    // Add event listener to language toggle button
    if (languageToggleButton) {
        languageToggleButton.addEventListener("click", () => {
            const currentLang = bodyElement.classList.contains("rtl") ? "ar" : "en";
            const newLang = currentLang === "ar" ? "en" : "ar";
            setLanguage(newLang);
        });
    }
});