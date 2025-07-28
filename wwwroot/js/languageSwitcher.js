document.addEventListener('DOMContentLoaded', () => {
    const languageToggleButton = document.getElementById('language-toggle');
    const bodyElement = document.body;


    const translations = {
        en: 
        {
            "page-title": "Rules & Regulations",
            "welcome-message": "Welcome to our platform. Please navigate through the sections below.",
            "dashboard-heading": "Admin Dashboard",
            "user-list-label": "List of Users"
        },

        ar: 
        {
            "'page-title": "القواعد واللوائح",
            "welcome-message": "مرحباً بك في منصتنا. يرجى التنقل عبر الأقسام أدناه.",
            "dashboard-heading": "لوحة تحكم المسؤول",
            "user-list-label": "قائمة المستخدمين"
        }
    };

    function applyTranslations(lang) {
        for (const id in translations[lang]) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = translations[lang][id];
            }
        }
    }

    function setLanguage(lang) {
        if (lang === 'ar') {
            bodyElement.classList.remove('ltr');
            bodyElement.classList.add('rtl');
            bodyElement.lang = 'ar';
            applyTranslations('ar');
        } else { // lang === 'en'
            bodyElement.classList.remove('rtl');
            bodyElement.classList.add('ltr');
            bodyElement.lang = 'en';
            applyTranslations('en');
        }
        localStorage.setItem('websiteLanguage', lang);
    }

    const savedLanguage = localStorage.getItem('websiteLanguage');
    if (savedLanguage) {
        setLanguage(savedLanguage);
    } else {
        setLanguage('en');
    }

    if (languageToggleButton) {
        languageToggleButton.addEventListener('click', () => {
            if (bodyElement.classList.contains('rtl')) {
                setLanguage('en');
            } else {
                setLanguage('ar');
            }
        });
    }
});