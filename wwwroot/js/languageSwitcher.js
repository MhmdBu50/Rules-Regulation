// (The JavaScript code provided in the previous response remains unchanged)
document.addEventListener("DOMContentLoaded", () => {
    const languageToggleButton = document.getElementById("language-toggle");
    const bodyElement = document.body;

    // --- IMPORTANT: Define your translatable texts here ---
    // Make sure these IDs/classes match elements in your .cshtml files
    const translations = {
        "en": {
            "page-title": "Home Page", // From ViewData, can be used for <title> tag
            "welcome-message": "Welcome to our platform. Please navigate through the sections below.",
            "dashboard-heading": "Admin Dashboard",
            "user-list-label": "List of Users",
            
            // --- New IDs from homePage.cshtml ---
            "admin-view-button": "View as Admin", //
            "search-input": "Search ...", // Placeholder text for search input

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
            "filter-responsible-entity-heading": "Responsible Entity",
            "filter-univ-councils": "University Councils",
            "filter-univ-vps": "University Vice Presidents",
            "filter-deanships": "Deanships",
            "filter-other-entity": "Other Responsible Entity",
            "filter-type-heading": "Type",
            "filter-regulations": "Regulations",
            "filter-guidelines": "Guidelines",
            "filter-policies": "Policies",
            "filter-apply-btn": "Apply",

            // Navigation Bar Labels
            "nav-home-label": "Home",
            "nav-student-guides-label": "Student guides & templates",
            "nav-student-rules-label": "Student rules & regulations",
            "nav-employee-rules-label": "Employees’ rules & regulations",
            "nav-academic-rules-label": "Academic rules & regulations",
            "nav-saved-rules-label": "Saved rules & regulations",
            "nav-history-label": "History",

            // No Records Message
            "no-records-heading": "No records found",
            "no-records-message": "There are currently no rules and regulations available.",

            // Chatbot Section
            "chatbot-name": "Chat with Mr. Kabsa",
            "chatbot-initial-message": "Hi, how can I help you today?",
            "message-input-placeholder": "Type your message...", // For placeholder

            // Record Details Modal
            "modal-title-regulation-details": "Regulation Details",
            "modal-loading-spinner-text": "Loading...",
            "modal-loading-message": "Loading record details...",
            "modal-error-heading": "Error Loading Details",
            "modal-error-message": "Sorry, we couldn't load the record details. Please try again later.",
            "download-button": "Download",
        },
        "ar": {
            "page-title": "الصفحة الرئيسية", // From ViewData, can be used for <title> tag
            "welcome-message": "مرحباً بك في منصتنا. يرجى التنقل عبر الأقسام أدناه.",
            "dashboard-heading": "لوحة تحكم المسؤول",
            "user-list-label": "قائمة المستخدمين",

            // --- New IDs from homePage.cshtml ---
            "admin-view-button": "عرض كمسؤول", //
            "search-input": "ابحث ...", // Placeholder text for search input

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
            "filter-responsible-entity-heading": "الجهة المسؤولة",
            "filter-univ-councils": "مجالس الجامعة",
            "filter-univ-vps": "نواب رئيس الجامعة",
            "filter-deanships": "العمادات",
            "filter-other-entity": "جهات أخرى مسؤولة",
            "filter-type-heading": "النوع",
            "filter-regulations": "لوائح",
            "filter-guidelines": "إرشادات",
            "filter-policies": "سياسات",
            "filter-apply-btn": "تطبيق",

            // Navigation Bar Labels
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
            "message-input-placeholder": "اكتب رسالتك...",

            // Record Details Modal
            "modal-title-regulation-details": "تفاصيل اللائحة",
            "modal-loading-spinner-text": "جاري التحميل...",
            "modal-loading-message": "جاري تحميل تفاصيل السجل...",
            "modal-error-heading": "خطأ في تحميل التفاصيل",
            "modal-error-message": "عذراً، لم نتمكن من تحميل تفاصيل السجل. يرجى المحاولة مرة أخرى لاحقاً.",
            "download-button": "تحميل",

            
        }
    };
    

    function applyTranslations(lang) {
        for (const id in translations[lang]) {
            const element = document.getElementById(id);
            if (element) {
                // Special handling for placeholder attribute
                if (id.endsWith("-placeholder") && element.tagName === "INPUT") {
    element.placeholder = translations[lang][id];
} else {
    element.innerHTML = translations[lang][id];
}
            }
        }
    }

    function setLanguage(lang) {
        if (lang === "ar") {
            bodyElement.classList.remove("ltr");
            bodyElement.classList.add("rtl");
            bodyElement.lang = "ar";
            applyTranslations("ar");
        } else { // lang === "en"
            bodyElement.classList.remove("rtl");
            bodyElement.classList.add("ltr");
            bodyElement.lang = "en";
            applyTranslations("en");
        }
        localStorage.setItem("websiteLanguage", lang);
    }

    const savedLanguage = localStorage.getItem("websiteLanguage");
    if (savedLanguage) {
        setLanguage(savedLanguage);
    } else {
        setLanguage("en");
    }

    if (languageToggleButton) {
        languageToggleButton.addEventListener("click", () => {
            if (bodyElement.classList.contains("rtl")) {
                setLanguage("en");
            } else {
                setLanguage("ar");
            }
        });
    }
});