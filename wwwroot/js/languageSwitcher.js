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
            "download-button": "Download",
            "info-button": "Information",
            "read-button": "Read",
            "chat-button": "Chat",
            "modal-close-button": "Close",

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
            "record-details-contact-info-title": "Department Contacts"
        },
        "ar": {
            // General page elements
            "page-title": "الصفحة الرئيسية",
            "welcome-message": "مرحباً بك في منصتنا. يرجى التنقل عبر الأقسام أدناه.",
            "dashboard-heading": "لوحة تحكم المسؤول",
            "user-list-label": "قائمة المستخدمين",

            // Home page elements
            "admin-view-button": "عرض كمسؤول",
            "searchInput": "ابحث ...",

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
            "download-button": "تحميل",
            "info-button": "معلومات",
            "read-button": "قراءة",
            "chat-button": "دردشة",
            "modal-close-button": "إغلاق",

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
            "record-details-contact-info-title": "جهات الاتصال بالقسم"
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